/**
 * InspectSafe - Anti-Debugging Library
 * Detects DevTools/inspect element and responds by throwing an error and refreshing the page
 */

(function(window) {
    'use strict';

    console.log('InspectSafe: Loading...');

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
            console.log('InspectSafe: Initializing...');
            if (!this.enabled) {
                console.log('InspectSafe: Disabled, skipping initialization');
                return;
            }

            // Store the original page code
            this.storeOriginalCode();
            console.log('InspectSafe: Original code stored');

            // Start all detection methods
            this.detectElementInspection();
            console.log('InspectSafe: Element inspection detection started');

            this.detectWindowSize();
            console.log('InspectSafe: Window size detection started');

            this.detectDebugger();
            console.log('InspectSafe: Debugger detection started');

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
                    console.log('InspectSafe: Window size change detected');
                    this.triggerResponse();
                }
            });
        },

        /**
         * Detect debugger using timing attack (without debugger statement)
         */
        detectDebugger: function() {
            const self = this;
            const detect = () => {
                const start = performance.now();
                // Check if DevTools is open by measuring function execution
                // This will be slower if DevTools is open
                const test = () => {
                    return 1 + 1;
                };
                for(let i = 0; i < 1000; i++) {
                    test();
                }
                const end = performance.now();

                if (end - start > this.threshold) {
                    console.log('InspectSafe: DevTools timing detected');
                    self.triggerResponse();
                }
            };

            // Run detection periodically
            setInterval(detect, this.checkInterval);
        },

        /**
         * Detect element inspection using various methods
         */
        detectElementInspection: function() {
            // Detect right-click context menu
            document.addEventListener('contextmenu', (e) => {
                console.log('InspectSafe: Right-click detected');
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
                    console.log('InspectSafe: DevTools shortcut detected: ' + e.key);
                    e.preventDefault();
                    this.triggerResponse();
                }
            });
        },

        /**
         * Trigger the response: throw error and refresh page
         */
        triggerResponse: function() {
            console.log('InspectSafe: TRIGGERING RESPONSE - Refreshing page');
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
            console.log('InspectSafe: Disabling...');
            this.enabled = false;
            if (this.timer) {
                clearInterval(this.timer);
            }
        }
    };

    // Expose to global scope
    window.InspectSafe = InspectSafe;

    console.log('InspectSafe: Library loaded, waiting for DOM...');

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('InspectSafe: DOM loaded, initializing...');
            InspectSafe.init();
        });
    } else {
        console.log('InspectSafe: DOM already loaded, initializing...');
        InspectSafe.init();
    }

})(window);
