// Content script for AI Sidebar Trigger
class AISidebarTrigger {
    constructor() {
        this.trigger = null;
        this.isVisible = true;
        this.init();
    }

    async init() {
        this.createTrigger();
        this.bindEvents();
        await this.checkVisibility();
        
        // Re-check visibility when page content changes
        this.observePageChanges();
    }

    createTrigger() {
        // Create hover area
        this.hoverArea = document.createElement('div');
        this.hoverArea.className = 'ai-sidebar-hover-area';
        
        // Create the trigger element
        this.trigger = document.createElement('div');
        this.trigger.className = 'ai-sidebar-trigger';
        this.trigger.innerHTML = '🤖';
        this.trigger.title = 'AI Sidebar Assistant';
        
        // Add to page
        document.body.appendChild(this.hoverArea);
        document.body.appendChild(this.trigger);
        
        // Add entrance animation
        this.trigger.style.opacity = '0';
        this.trigger.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            this.trigger.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 100);
    }

    bindEvents() {
        // Click event to open sidebar
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSidebar();
        });

        // Keyboard shortcut (Ctrl/Cmd + Shift + A)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.openSidebar();
            }
        });

        // Handle hover states
        this.trigger.addEventListener('mouseenter', () => {
            this.trigger.style.opacity = '1';
        });

        this.trigger.addEventListener('mouseleave', () => {
            if (this.isVisible) {
                this.trigger.style.opacity = '0';
                this.trigger.style.transform = 'scale(0.8)';
            }
        });

        // Prevent conflicts with page elements
        this.trigger.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        this.trigger.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });
    }

    openSidebar() {
        // Send message to background script to open sidebar
        chrome.runtime.sendMessage({
            type: 'OPEN_SIDEBAR'
        }).catch(() => {
            // Fallback: try to open via action click
            chrome.runtime.sendMessage({
                type: 'TRIGGER_ACTION_CLICK'
            });
        });

        // Add click feedback
        this.trigger.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.trigger.style.transform = 'scale(1)';
        }, 150);
    }

    async checkVisibility() {
        // Check if extension icon mode is enabled
        try {
            const settings = await chrome.storage.local.get(['useExtensionIcon']);
            if (settings.useExtensionIcon) {
                this.hide(); // Hide trigger when extension icon mode is enabled
                return;
            }
        } catch (e) {
            // If we can't access storage, continue with default behavior
        }

        // Hide on certain pages if needed
        const url = window.location.href;
        const hideOnPages = [
            'chrome://',
            'chrome-extension://',
            'moz-extension://',
            'edge://',
            'about:',
            'view-source:'
        ];

        const shouldHide = hideOnPages.some(prefix => url.startsWith(prefix));
        
        if (shouldHide) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        if (this.trigger && !this.isVisible) {
            this.trigger.classList.remove('hidden');
            this.hoverArea.classList.remove('hidden');
            this.isVisible = true;
        }
    }

    hide() {
        if (this.trigger && this.isVisible) {
            this.trigger.classList.add('hidden');
            this.hoverArea.classList.add('hidden');
            this.trigger.style.opacity = '0';
            this.trigger.style.transform = 'scale(0.8)';
            this.isVisible = false;
        }
    }

    observePageChanges() {
        // Watch for dynamic content changes
        const observer = new MutationObserver(() => {
            // Re-check if trigger still exists
            if (!document.body.contains(this.trigger) || !document.body.contains(this.hoverArea)) {
                this.createTrigger();
                this.bindEvents();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Public method to toggle visibility
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// Initialize the trigger when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        new AISidebarTrigger();
    });
} else {
    new AISidebarTrigger();
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'TOGGLE_TRIGGER') {
        if (window.aiSidebarTrigger) {
            window.aiSidebarTrigger.toggle();
        }
        sendResponse({ success: true });
    } else if (request.type === 'UPDATE_EXTENSION_ICON_SETTING') {
        if (window.aiSidebarTrigger) {
            if (request.useExtensionIcon) {
                window.aiSidebarTrigger.hide();
            } else {
                window.aiSidebarTrigger.checkVisibility();
            }
        }
        sendResponse({ success: true });
    }
});

// Store reference globally for external access
window.aiSidebarTrigger = null;

// Initialize after a short delay to ensure proper loading
setTimeout(async () => {
    if (!window.aiSidebarTrigger) {
        window.aiSidebarTrigger = new AISidebarTrigger();
    }
}, 500);
