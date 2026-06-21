/**
 * InspectSafe - Anti-Debugging Library
 * Detects DevTools/inspect element and responds by throwing an error and refreshing the page
 */

(function(window) {
    'use strict';


    const InspectSafe = {
        enabled: true,
        threshold: 100, // Time threshold for debugger detection (ms)
        checkInterval: 1000, // Check interval in ms
        originalCode: null,
        timer: null,

        /**
         * Initialize the library
         */
        init: function() {
            if (!this.enabled) {
                return;
            }

            // Store the original page code
            this.storeOriginalCode();

            // Start DOM change detection only
            this.detectDOMChanges();
        },

        /**
         * Store the original page HTML code
         */
        storeOriginalCode: function() {
            this.originalCode = document.documentElement.outerHTML;
        },

        /**
         * Detect DOM changes that might indicate inspection
         */
        detectDOMChanges: function() {
            const self = this;
            
            // Use MutationObserver to detect DOM changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        self.triggerResponse();
                    }
                    if (mutation.type === 'childList') {
                        self.triggerResponse();
                    }
                    if (mutation.type === 'characterData') {
                        self.triggerResponse();
                    }
                });
            });

            // Observe the entire document
            observer.observe(document.documentElement, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        },

        /**
         * Trigger the response: reload page
         */
        triggerResponse: function() {
            // Reload page immediately
            window.location.reload(true);
        },

        /**
         * Disable the library (for testing purposes)
         */
        disable: function() {
            this.enabled = false;
            if (this.timer) {
                clearInterval(this.timer);
            }
        }
    };

    // Expose to global scope
    window.InspectSafe = InspectSafe;


    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            InspectSafe.init();
        });
    } else {
        InspectSafe.init();
    }

})(window);
