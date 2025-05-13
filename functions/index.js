/**
 * Secure Cloud Functions for SpiralWorks Website
 *
 * This file contains server-side endpoints for handling waitlist operations
 * with enhanced security, logging, and validation.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const cryptoJS = require("crypto-js");
const joi = require("joi");
const {RateLimiterMemory} = require("rate-limiter-flexible");
const fetch = require("node-fetch");

// Initialize Firebase
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

// Configure collections
const COLLECTIONS = {
  WAITLIST: "waitlist",
  RATE_LIMITS: "rateLimits",
  AUDIT_LOGS: "adminAuditLogs",
};

// Configure rate limiter (5 requests per IP per hour)
const rateLimiter = new RateLimiterMemory({
  points: 5, // Number of points
  duration: 60 * 60, // Per hour
});

// Initialize Express
const app = express();

// CORS configuration - restrict to your domain in production
const corsOptions = {
  origin: ["https://spiralworks.ai", "https://www.spiralworks.ai"],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
};

// Use CORS middleware in development mode
if (process.env.NODE_ENV === "development") {
  app.use(cors({origin: true}));
} else {
  app.use(cors(corsOptions));
}

// Middleware to parse request body as JSON
app.use(express.json());

// Middleware to log all API requests
app.use((req, res, next) => {
  functions.logger.info(`API Request: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    referer: req.get("Referer"),
    origin: req.get("Origin"),
  });
  next();
});

// Middleware for request validation
const validateRequest = (schema) => {
  return (req, res, next) => {
    const {error} = schema.validate(req.body);
    if (error) {
      functions.logger.warn("Validation error:", error.details);
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: error.details[0].message,
      });
    }
    next();
  };
};

// Middleware for rate limiting
const applyRateLimit = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.headers["x-forwarded-for"] || "unknown";
    await rateLimiter.consume(clientIP);
    next();
  } catch (error) {
    functions.logger.warn("Rate limit exceeded:", {ip: req.ip});
    return res.status(429).json({
      success: false,
      error: "Too many requests, please try again later",
    });
  }
};

// Middleware to verify admin authentication
const verifyAdmin = async (req, res, next) => {
  try {
    // Get ID token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if user has an admin email
    const emailEndsWithDomain = decodedToken.email &&
      decodedToken.email.endsWith("@spiralworks.ai");

    if (!emailEndsWithDomain) {
      await logAdminAction(decodedToken.uid, "unauthorized_access_attempt", {
        email: decodedToken.email,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: "Forbidden",
      });
    }

    // Add user to request for later use
    req.user = decodedToken;
    next();
  } catch (error) {
    functions.logger.error("Error verifying admin:", error);
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
};

// Helper function to log admin actions
const logAdminAction = async (userId, action, details = {}) => {
  try {
    await db.collection(COLLECTIONS.AUDIT_LOGS).add({
      userId,
      action,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    functions.logger.error("Error logging admin action:", error);
  }
};

// =========================================================
// Validation Schemas
// =========================================================

// Schema for waitlist signup
const waitlistSignupSchema = joi.object({
  name: joi.string().required().trim().min(2).max(100),
  email: joi.string().required().email().trim().lowercase().max(100),
  organization: joi.string().allow("").trim().max(100),
  csrfToken: joi.string().required(),
});


// Schema for clear all operations
const adminClearAllSchema = joi.object({
  confirmationCode: joi.string().required().length(8),
});

// =========================================================
// Public API Endpoints
// =========================================================

/**
 * POST /api/waitlist/signup
 * Public endpoint for submitting waitlist signups
 */
app.post("/waitlist/signup",
    applyRateLimit,
    validateRequest(waitlistSignupSchema),
    async (req, res) => {
      try {
        const {name, email, organization} = req.body;

        // Check if email already exists
        const emailQuery = await db.collection(COLLECTIONS.WAITLIST)
            .where("email", "==", email.toLowerCase())
            .get();

        if (!emailQuery.empty) {
        // Don't reveal that email exists, just return success
          return res.status(200).json({
            success: true,
            duplicate: true,
          });
        }

        // Create new waitlist entry
        const entryData = {
          name,
          email: email.toLowerCase(),
          organization: organization || "Not provided",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
          source: "website-waitlist",
        };

        // Add to waitlist collection
        const docRef = await db.collection(COLLECTIONS.WAITLIST).add(entryData);

        // Add rate limit entry
        await db.collection(COLLECTIONS.RATE_LIMITS).add({
          ip: entryData.ipAddress,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          action: "waitlist_signup",
        });

        // Send Discord notification
        try {
          const DISCORD_WEBHOOK_URL = functions.config().discord?.webhook_url;
          if (DISCORD_WEBHOOK_URL) {
            const payload = {
              username: "Spiral Works Waitlist Bot",
              avatar_url: "https://spiralworks.ai/favicon.ico",
              embeds: [{
                title: "New Public Beta Signup!",
                color: 0x8622c9,
                fields: [
                  {name: "Name", value: name, inline: true},
                  {name: "Email", value: email.toLowerCase(), inline: true},
                  {
                    name: "Organization",
                    value: organization || "Not provided",
                    inline: true,
                  },
                ],
                timestamp: new Date().toISOString(),
              }],
            };

            await fetch(DISCORD_WEBHOOK_URL, {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify(payload),
            });
          }
        } catch (webhookError) {
          functions.logger.error("Discord webhook error:", webhookError);
          // Don't fail the main operation if webhook fails
        }

        // Log successful signup
        functions.logger.info("New waitlist signup:", {
          id: docRef.id,
          email: email.toLowerCase(),
        });

        return res.status(200).json({
          success: true,
        });
      } catch (error) {
        functions.logger.error("Error in waitlist signup:", error);
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    },
);

// =========================================================
// Admin API Endpoints
// =========================================================

/**
 * GET /api/admin/waitlist
 * Admin endpoint to get waitlist entries
 */
app.get("/admin/waitlist",
    verifyAdmin,
    async (req, res) => {
      try {
        const maxResults = parseInt(req.query.maxResults) || 100;

        // Log admin request
        await logAdminAction(req.user.uid, "admin_get_waitlist", {
          maxResults,
          email: req.user.email,
        });

        // Get waitlist entries
        const waitlistQuery = await db.collection(COLLECTIONS.WAITLIST)
            .orderBy("createdAt", "desc")
            .limit(maxResults)
            .get();

        // Format response
        const entries = [];
        waitlistQuery.forEach((doc) => {
          const data = doc.data();
          // Format the createdAt timestamp
          const createdAt = data.createdAt ?
            data.createdAt.toDate().toISOString() :
            null;

          // Add to entries array
          entries.push({
            id: doc.id,
            ...data,
            createdAt,
          });
        });

        return res.status(200).json({
          success: true,
          data: entries,
        });
      } catch (error) {
        functions.logger.error("Error getting waitlist entries:", error);
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    },
);

/**
 * DELETE /api/admin/waitlist/:entryId
 * Admin endpoint to delete a waitlist entry
 */
app.delete("/admin/waitlist/:entryId",
    verifyAdmin,
    async (req, res) => {
      try {
        const {entryId} = req.params;

        // Check if entry exists
        const entryRef = db.collection(COLLECTIONS.WAITLIST).doc(entryId);
        const entrySnap = await entryRef.get();

        if (!entrySnap.exists) {
          return res.status(404).json({
            success: false,
            error: "Entry not found",
          });
        }

        // Log admin action with details
        const entryData = entrySnap.data();
        await logAdminAction(req.user.uid, "admin_delete_entry", {
          entryId,
          entryEmail: entryData.email,
          adminEmail: req.user.email,
        });

        // Delete the entry
        await entryRef.delete();

        return res.status(200).json({
          success: true,
        });
      } catch (error) {
        functions.logger.error("Error deleting waitlist entry:", error);
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    },
);

/**
 * POST /api/admin/waitlist/clear-all
 * Admin endpoint to clear all waitlist entries (extremely dangerous)
 */
app.post("/admin/waitlist/clear-all",
    verifyAdmin,
    validateRequest(adminClearAllSchema),
    async (req, res) => {
      try {
        const {confirmationCode} = req.body;

        // Generate expected confirmation code
        const dateString = new Date().toISOString().split("T")[0];
        const clearCodeInput = `${dateString}-${req.user.email}-clearwaitlist`;
        const hash = cryptoJS.sha256(clearCodeInput);
        const expectedCode = hash.toString().substring(0, 8);

        // Verify confirmation code
        if (confirmationCode !== expectedCode) {
        // Log invalid attempt
          await logAdminAction(req.user.uid, "invalid_confirmation_code", {
            providedCode: confirmationCode,
            expectedCode,
            adminEmail: req.user.email,
          });

          return res.status(400).json({
            success: false,
            error: "Invalid confirmation code",
          });
        }

        // Log this highly destructive action with all details
        await logAdminAction(req.user.uid, "admin_clear_all_waitlist", {
          confirmationProvided: true,
          adminEmail: req.user.email,
          timestamp: new Date().toISOString(),
        });

        // Get all waitlist entries
        const waitlistQuery = await db.collection(COLLECTIONS.WAITLIST).get();

        // Delete in batches to avoid memory issues
        const batchSize = 500;
        const batches = [];
        let batch = db.batch();
        let operationCount = 0;

        waitlistQuery.forEach((doc) => {
          batch.delete(doc.ref);
          operationCount++;

          if (operationCount === batchSize) {
            batches.push(batch.commit());
            batch = db.batch();
            operationCount = 0;
          }
        });

        // Commit any remaining operations
        if (operationCount > 0) {
          batches.push(batch.commit());
        }

        // Wait for all batches to complete
        await Promise.all(batches);

        return res.status(200).json({
          success: true,
          message: `Successfully deleted ${waitlistQuery.size} entries`,
        });
      } catch (error) {
        functions.logger.error("Error clearing waitlist:", error);
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    },
);

// =========================================================
// Export the Express API as a Firebase Function
// =========================================================

// Export API as a Firebase Function
exports.api = functions.https.onRequest(app);

// Export public HTTP functions
exports.submitWaitlistEntry = functions.https.onCall(async (data, context) => {
  try {
    // Validate input
    const {error} = waitlistSignupSchema.validate(data);
    if (error) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid request data",
          error.details[0].message,
      );
    }

    const {name, email, organization} = data;

    // Apply rate limiting
    const clientIP = context.rawRequest.ip || "unknown";
    try {
      await rateLimiter.consume(clientIP);
    } catch (err) {
      throw new functions.https.HttpsError(
          "resource-exhausted",
          "Too many requests, please try again later",
      );
    }

    // Check if email already exists
    const emailQuery = await db.collection(COLLECTIONS.WAITLIST)
        .where("email", "==", email.toLowerCase())
        .get();

    if (!emailQuery.empty) {
      // Don't reveal that email exists, just return success
      return {success: true};
    }

    // Create new waitlist entry
    const entryData = {
      name,
      email: email.toLowerCase(),
      organization: organization || "Not provided",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: clientIP,
      userAgent: context.rawRequest.headers["user-agent"] || "unknown",
      source: "website-waitlist",
    };

    // Add to waitlist collection
    const docRef = await db.collection(COLLECTIONS.WAITLIST).add(entryData);

    // Add rate limit entry
    await db.collection(COLLECTIONS.RATE_LIMITS).add({
      ip: entryData.ipAddress,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "waitlist_signup",
    });

    // Send Discord notification
    try {
      const DISCORD_WEBHOOK_URL = functions.config().discord?.webhook_url;
      if (DISCORD_WEBHOOK_URL) {
        const payload = {
          username: "Spiral Works Waitlist Bot",
          avatar_url: "https://spiralworks.ai/favicon.ico",
          embeds: [{
            title: "New Public Beta Signup!",
            color: 0x8622c9,
            fields: [
              {name: "Name", value: name, inline: true},
              {name: "Email", value: email.toLowerCase(), inline: true},
              {
                name: "Organization",
                value: organization || "Not provided",
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          }],
        };

        await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        });
      }
    } catch (webhookError) {
      functions.logger.error("Discord webhook error:", webhookError);
      // Don't fail the main operation if webhook fails
    }

    // Log successful signup
    functions.logger.info("New waitlist signup (callable):", {
      id: docRef.id,
      email: email.toLowerCase(),
    });

    return {success: true};
  } catch (error) {
    functions.logger.error("Error in callable waitlist signup:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Internal server error",
    );
  }
});
