# InspectSafe 🔒

A JavaScript library that protects your website from inspection and debugging by detecting DevTools/inspect element attempts and automatically responding with an error and page refresh.

## Features

- **DevTools Detection**: Uses timing attacks to detect when DevTools is open
- **Window Resize Monitoring**: Detects when DevTools is opened via window dimension changes
- **Console Detection**: Monitors console behavior to detect console opening
- **Element Inspection**: Detects when elements are being inspected
- **Keyboard Shortcut Blocking**: Blocks F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
- **Right-Click Blocking**: Prevents context menu access
- **Code Storage**: Stores the original page HTML code
- **Auto-Refresh**: Automatically refreshes the page when detection is triggered

## Installation

Simply include the `inspectsafe.js` file in your HTML:

```html
<script src="inspectsafe.js"></script>
```

The library will automatically initialize when the page loads.

## Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Protected Page</title>
</head>
<body>
    <h1>Protected Content</h1>
    
    <script src="inspectsafe.js"></script>
</body>
</html>
```

### Manual Control

The library exposes a global `InspectSafe` object for manual control:

```javascript
// Disable protection (for testing)
InspectSafe.disable();

// Re-enable protection
InspectSafe.enabled = true;
InspectSafe.init();
```

### Configuration

You can modify the detection thresholds by editing the library:

```javascript
const InspectSafe = {
    threshold: 100,        // Time threshold for debugger detection (ms)
    checkInterval: 1000,   // Check interval in ms
    // ...
};
```

## How It Works

### Detection Methods

1. **Timing Attack**: Uses `debugger` statement to measure execution time
2. **Window Resize**: Monitors outer vs inner window dimensions
3. **Console Monitoring**: Checks console function execution time
4. **Element Inspection**: Monitors element hover and outline changes
5. **Keyboard Shortcuts**: Blocks common DevTools shortcuts
6. **Context Menu**: Prevents right-click inspection

### Response

When DevTools is detected:
1. Throws a custom `InspectSafeError`
2. Automatically refreshes the page after 100ms

## Demo

Open `demo.html` in your browser to see the library in action. Try to:
- Press F12
- Right-click on the page
- Press Ctrl+Shift+I
- Open DevTools through browser menu

The page will throw an error and refresh automatically.

## Limitations

- This is a client-side protection and can be bypassed by knowledgeable users
- May interfere with legitimate debugging during development
- Some detection methods may have false positives
- Not a replacement for proper server-side security

## Best Practices

- Use this as an additional layer of protection, not the only one
- Disable during development (use `InspectSafe.disable()`)
- Combine with other security measures like obfuscation
- Test thoroughly before deploying to production

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ Partial support (some detection methods may not work)
- Mobile browsers: ⚠️ Limited support

## License

MIT License - Feel free to use and modify as needed.

## Disclaimer

This library is intended for educational purposes and as a basic deterrent. It does not provide complete protection against determined attackers. Always implement proper security measures on the server side.

## Version

1.0.0
