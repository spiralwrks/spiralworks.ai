import { initializeGalaxy } from './spiral.js';

class Router {
    constructor() {
        this.routes = {
            '/': '/index-content.html',
            '/reading-group': '/reading-group.html',
        };
        this.initialize();
    }

    async initialize() {
        // Initialize routing
        this.initializeRouter();
        
        // Load the current route content
        await this.loadRouteContent(window.location.pathname);
    }

    initializeRouter() {
        // Handle click navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                const url = e.target.getAttribute('href');
                this.navigateTo(url);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.loadRouteContent(window.location.pathname);
        });
    }

    async loadRouteContent(url) {
        const normalizedUrl = url === '' ? '/' : url;
        const path = this.routes[normalizedUrl] || this.routes['/'];

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to fetch content for ${url}`);
            }
            
            const html = await response.text();
            const contentElement = document.querySelector('.content');
            if (contentElement) {
                contentElement.innerHTML = html;
                
                // Initialize galaxy only on home page
                if (normalizedUrl === '/' || normalizedUrl === '') {
                    initializeGalaxy();
                }
                
                this.updateActiveLink(normalizedUrl);
            }
        } catch (error) {
            console.error('Error loading route content:', error);
            const contentElement = document.querySelector('.content');
            if (contentElement) {
                contentElement.innerHTML = '<p>Content could not be loaded.</p>';
            }
        }
    }

    updateActiveLink(url) {
        const navLinks = document.querySelectorAll('.nav-bar a[data-link]');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === url) {
                link.classList.add('active');
            }
        });
    }

    async navigateTo(url) {
        await this.loadRouteContent(url);
        history.pushState({}, '', url);
    }
}

// Initialize the router
new Router();
