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
            if (!this.enabled) return;

            // Store the original page code
            this.storeOriginalCode();

            // Start all detection methods
            this.detectWindowSize();
            this.detectDebugger();
            this.detectConsole();
            this.detectElementInspection();
            this.startPeriodicCheck();

            console.log('%cInspectSafe Active', 'color: #ff0000; font-size: 20px; font-weight: bold;');
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

                // If outer dimensions change but inner don't, likely DevTools
                if ((widthDiff > 160 || heightDiff > 160) && 
                    (innerWidthDiff < 10 && innerHeightDiff < 10)) {
                    this.triggerResponse();
                }
            });
        },

        /**
         * Detect debugger using timing attack
         */
        detectDebugger: function() {
            const self = this;
            const detect = () => {
                const start = performance.now();
                // Use a function that will be slow if DevTools is open
                const devtools = new Function('debugger');
                try {
                    devtools();
                } catch(e) {}
                const end = performance.now();

                if (end - start > this.threshold) {
                    self.triggerResponse();
                }
            };

            // Run detection periodically
            setInterval(detect, this.checkInterval);
        },

        /**
         * Detect console opening by monitoring console behavior
         */
        detectConsole: function() {
            const self = this;
            const originalConsole = Object.assign({}, console);
            let consoleOpen = false;

            // Detect console by checking if it's being used
            Object.defineProperty(console, 'clear', {
                get: () => {
                    consoleOpen = true;
                    return originalConsole.clear;
                }
            });

            // Check if DevTools is open by measuring function execution time
            const checkConsole = () => {
                const start = performance.now();
                console.log('%c', 'color: transparent;');
                const end = performance.now();

                if (end - start > this.threshold) {
                    self.triggerResponse();
                }
            };

            setInterval(checkConsole, this.checkInterval);
        },

        /**
         * Detect element inspection using various methods
         */
        detectElementInspection: function() {
            // Detect right-click context menu
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.triggerResponse();
            });

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

            // Detect element inspection using elementFromPoint
            let lastElement = null;
            document.addEventListener('mousemove', (e) => {
                const element = document.elementFromPoint(e.clientX, e.clientY);
                if (element && element !== lastElement) {
                    lastElement = element;
                    
                    // Check if element is being inspected
                    const computedStyle = window.getComputedStyle(element);
                    if (computedStyle.getPropertyValue('outline') !== 'none' && 
                        computedStyle.getPropertyValue('outline-width') !== '0px') {
                        this.triggerResponse();
                    }
                }
            });
        },

        /**
         * Periodic check for various DevTools indicators
         */
        startPeriodicCheck: function() {
            const self = this;
            const check = () => {
                // Check if firebug is enabled
                if (window.firebug || window.console.firebug) {
                    self.triggerResponse();
                }

                // Check for DevTools by evaluating function
                const devtools = /./;
                devtools.toString = function() {
                    self.triggerResponse();
                };

                console.log('%c', devtools);
            };

            setInterval(check, this.checkInterval);
        },

        /**
         * Trigger the response: throw error and refresh page
         */
        triggerResponse: function() {
            // Refresh page immediately
            window.location.reload(true);
            
            // Throw error (this may not execute due to refresh)
            const error = new Error('InspectSafe: DevTools detected! Page will refresh.');
            error.name = 'InspectSafeError';
            setTimeout(() => {
                throw error;
            }, 50);
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
        document.addEventListener('DOMContentLoaded', () => InspectSafe.init());
    } else {
        InspectSafe.init();
    }

})(window);
