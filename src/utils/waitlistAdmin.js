/**
 * Waitlist Admin utilities
 *
 * These functions provide admin capabilities for managing the waitlist.
 * Secured by Firebase Authentication and role-based access control.
 */
import { getAuthState } from './authService';
import CryptoJS from 'crypto-js';
import { getWaitlistEntries, deleteWaitlistEntry, clearAllWaitlistEntries } from './api';

/**
 * Verifies if the current user has admin access
 * @returns {boolean} Whether user has admin access
 */
const verifyAdminAccess = () => {
  const { isAdmin } = getAuthState();
  
  if (!isAdmin) {
    console.error('Unauthorized access attempt to admin functions');
    // In a production system, log to server when possible
  }
  
  return isAdmin;
};

/**
 * Get all waitlist signups from the server
 * @param {number} maxResults - Maximum number of results to return (optional)
 * @returns {Promise<Array>} Promise resolving to array of signup objects or empty array if unauthorized
 */
export const getWaitlistSignups = async (maxResults = 1000) => {
  // Verify admin access
  if (!verifyAdminAccess()) {
    return [];
  }
  
  try {
    // Use the API client to get waitlist entries
    const response = await getWaitlistEntries(maxResults);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    return [];
  }
};

/**
 * Export waitlist signups to CSV
 * @returns {Promise<string>} Promise resolving to CSV string of all signups or error message if unauthorized
 */
export const exportWaitlistToCSV = async () => {
  // Verify admin access
  if (!verifyAdminAccess()) {
    return 'Access denied: Not authorized to export data';
  }
  
  const signups = await getWaitlistSignups();
  
  if (signups.length === 0) {
    return 'No signups found';
  }
  
  // Create CSV headers
  const headers = ['ID', 'Name', 'Email', 'Organization', 'Timestamp', 'IP Address', 'Source', 'User Agent'];
  
  // Convert signups to CSV rows
  const csvRows = signups.map(signup => {
    return [
      signup.id || '',
      signup.name || '',
      signup.email || '',
      signup.organization || '',
      signup.createdAt || '',
      signup.ipAddress || '',
      signup.source || '',
      signup.userAgent || ''
    ].map(field => {
      // Escape quotes in fields and wrap in quotes
      const escaped = `${field}`.replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });
  
  // Combine headers and rows
  return [headers.join(','), ...csvRows].join('\n');
};

/**
 * Download waitlist data as a CSV file
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export const downloadWaitlistCSV = async () => {
  try {
    const csv = await exportWaitlistToCSV();
    
    // Check if it's an error message
    if (csv.startsWith('Access denied') || csv === 'No signups found') {
      console.error(csv);
      return false;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spiralworks-waitlist-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};

/**
 * Delete a specific waitlist entry by ID
 * @param {string} id - Document ID to delete
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export const removeWaitlistEntry = async (id) => {
  // Verify admin access
  if (!verifyAdminAccess()) {
    console.error('Unauthorized attempt to delete waitlist entry');
    return false;
  }
  
  try {
    // Use API to delete entry
    const result = await deleteWaitlistEntry(id);
    return result.success || false;
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return false;
  }
};

/**
 * Clear all waitlist data (DANGER: destructive operation)
 * Protected by admin authentication and requires additional confirmation
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export const clearWaitlistData = async () => {
  // Verify admin access
  if (!verifyAdminAccess()) {
    console.error('Unauthorized attempt to clear all waitlist data');
    return false;
  }
  
  try {
    // Generate confirmation code based on date and admin email
    const { user } = getAuthState();
    const confirmationCode = CryptoJS.SHA256(
      `${new Date().toISOString().split('T')[0]}-${user?.email || ''}-clearwaitlist`
    ).toString().substring(0, 8);
    
    // Prompt user to confirm with the code
    const userConfirmation = window.prompt(
      `⚠️ DANGER! You are about to delete ALL waitlist data. This action cannot be undone.\n\n` +
      `To confirm, please enter this code: ${confirmationCode}`
    );
    
    if (!userConfirmation || userConfirmation !== confirmationCode) {
      console.warn('Waitlist clear operation canceled or invalid confirmation code');
      return false;
    }
    
    // User provided correct confirmation - proceed with deletion
    const result = await clearAllWaitlistEntries(confirmationCode);
    return result.success || false;
  } catch (error) {
    console.error('Error clearing waitlist data:', error);
    return false;
  }
};