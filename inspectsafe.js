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

            this.detectDevToolsOpen();
            console.log('InspectSafe: DevTools open detection started');

            this.detectDOMChanges();
            console.log('InspectSafe: DOM change detection started');

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

                // If outer dimensions change but inner don't, likely DevTools (reduced thresholds for faster detection)
                if ((widthDiff > 50 || heightDiff > 50) && 
                    (innerWidthDiff < 20 && innerHeightDiff < 20)) {
                    console.log('InspectSafe: Window size change detected');
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
                    console.log('InspectSafe: DevTools dimensions detected');
                    self.triggerResponse();
                }
            };

            // Check frequently (every 100ms for faster detection)
            setInterval(checkDevTools, 100);
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
                        console.log('InspectSafe: DOM style change detected');
                        self.triggerResponse();
                    }
                });
            });

            // Observe the entire document
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['style'],
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
                    console.log('InspectSafe: DevTools shortcut detected: ' + e.key);
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
                        console.log('InspectSafe: Element inspection detected');
                        this.triggerResponse();
                    }
                }
            });
        },

        /**
         * Trigger the response: revert to original code
         */
        triggerResponse: function() {
            console.log('InspectSafe: TRIGGERING RESPONSE - Reverting to original code');
            // Restore original HTML instead of refreshing
            if (this.originalCode) {
                document.open();
                document.write(this.originalCode);
                document.close();
            }
            
            // Throw error
            const error = new Error('InspectSafe: DevTools detected! Code reverted.');
            error.name = 'InspectSafeError';
            throw error;
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
