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

            // Start all detection methods
            this.detectElementInspection();

            this.detectWindowSize();

            this.detectDevToolsOpen();

            this.detectDOMChanges();

        },

        /**
         * Store the original page HTML code
         */
        storeOriginalCode: function() {
            this.originalCode = document.documentElement.outerHTML;
        },

        /**
         * Detect window size changes (DevTools opening changes window dimensions)
         */
        detectWindowSize: function() {
            const originalWidth = window.outerWidth;
            const originalHeight = window.outerHeight;
            const originalInnerWidth = window.innerWidth;
            const originalInnerHeight = window.innerHeight;

            window.addEventListener('resize', () => {
                const widthDiff = Math.abs(window.outerWidth - originalWidth);
                const heightDiff = Math.abs(window.outerHeight - originalHeight);
                const innerWidthDiff = Math.abs(window.innerWidth - originalInnerWidth);
                const innerHeightDiff = Math.abs(window.innerHeight - originalInnerHeight);

                // If outer dimensions change but inner don't, likely DevTools (reduced thresholds for faster detection)
                if ((widthDiff > 50 || heightDiff > 50) && 
                    (innerWidthDiff < 20 && innerHeightDiff < 20)) {
                    this.triggerResponse();
                }
            });
        },

        /**
         * Detect if DevTools is open using various methods
         */
        detectDevToolsOpen: function() {
            const self = this;
            
            // Check if DevTools is open by detecting screen dimension changes
            const checkDevTools = () => {
                const widthThreshold = window.outerWidth - window.innerWidth > 160;
                const heightThreshold = window.outerHeight - window.innerHeight > 160;
                
                if (widthThreshold || heightThreshold) {
                    self.triggerResponse();
                }
            };

            // Check frequently (every 100ms for faster detection)
            setInterval(checkDevTools, 100);

            // Also check on focus events
            window.addEventListener('focus', () => {
                setTimeout(checkDevTools, 100);
            });
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
         * Detect element inspection using various methods
         */
        detectElementInspection: function() {
            // Detect F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            document.addEventListener('keydown', (e) => {
                if (
                    e.key === 'F12' ||
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                    (e.ctrlKey && e.key === 'U')
                ) {
                    e.preventDefault();
                    this.triggerResponse();
                }
            });

            // Detect element inspection using elementFromPoint (check every mousemove)
            document.addEventListener('mousemove', (e) => {
                const element = document.elementFromPoint(e.clientX, e.clientY);
                if (element) {
                    // Check if element is being inspected
                    const computedStyle = window.getComputedStyle(element);
                    if (computedStyle.getPropertyValue('outline') !== 'none' && 
                        computedStyle.getPropertyValue('outline-width') !== '0px') {
                        this.triggerResponse();
                    }
                }
            });

            // Detect when user tries to inspect via browser menu
            document.addEventListener('click', (e) => {
                // Check if the click might be from inspect element
                if (e.shiftKey || e.altKey || e.metaKey) {
                    this.triggerResponse();
                }
            });
        },

        /**
         * Trigger the response: revert to original code
         */
        triggerResponse: function() {
            // Restore original HTML instead of refreshing
            if (this.originalCode) {
                document.open();
                document.write(this.originalCode);
                document.close();
            }
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
