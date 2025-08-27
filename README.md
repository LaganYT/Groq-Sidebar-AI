# AI Sidebar Assistant - Chrome Extension

A Manifest V3 compatible Chrome extension that provides an AI-powered sidebar assistant using the Groq API. This extension offers a modern, responsive chat interface that can help with various tasks like writing emails, explaining concepts, brainstorming ideas, and more.

## Features

- 🤖 **AI-Powered Chat**: Powered by Groq's fast AI models (Llama 3.1, Mixtral, Gemma2)
- 📱 **Modern UI**: Clean, responsive design with smooth animations
- 🎯 **Bottom-Right Trigger**: Hidden by default, appears on hover in the bottom-right corner
- ⚙️ **Customizable Settings**: Configure API key, model selection, and parameters
- 💬 **Quick Prompts**: Pre-built prompts for common tasks
- 🔄 **Chat History**: Maintains conversation context
- 🎨 **Beautiful Design**: Gradient backgrounds and modern styling
- 📝 **Character Counter**: Real-time input validation
- 🔔 **Notifications**: Success/error feedback
- ⌨️ **Keyboard Shortcut**: Ctrl/Cmd + Shift + A to open sidebar

## Supported Models

- **Llama 3.1 8B** (Fast) - `llama3-8b-8192`
- **Llama 3.1 70B** (Powerful) - `llama3-70b-8192`
- **Mixtral 8x7B** (Balanced) - `mixtral-8x7b-32768`
- **Gemma2 9B** (Efficient) - `gemma2-9b-it`

## Installation

### Prerequisites

1. **Groq API Key**: Get your free API key from [Groq Console](https://console.groq.com/)
2. **Chrome Browser**: Version 114 or later (for Manifest V3 support)

### Steps

1. **Download/Clone** this repository to your local machine

2. **Create Icons**: Replace the placeholder files in the `icons/` folder with actual PNG icons:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

3. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the folder containing this extension

4. **Configure API Key**:
   - Click the extension icon in your toolbar
   - Click the settings gear (⚙️) in the sidebar
   - Enter your Groq API key
   - Choose your preferred model and settings
   - Click "Save Settings"

## Usage

### Opening the Sidebar

- **Bottom-Right Button**: Hover over the bottom-right corner of any webpage to reveal the AI button (🤖), then click it
- **Extension Icon**: Click the extension icon in your Chrome toolbar
- **Keyboard Shortcut**: Press `Ctrl/Cmd + Shift + A` on any webpage
- The AI sidebar will open on the right side of your browser

### Using the Chat

1. **Type your message** in the input field at the bottom
2. **Press Enter** or click the send button (➤)
3. **Wait for the AI response** (you'll see a typing indicator)
4. **Continue the conversation** - the AI remembers context

### Quick Prompts

Use the pre-built quick prompts for common tasks:
- 📧 **Write Email**: Help with professional email composition
- 📚 **Explain**: Get simple explanations of complex concepts
- 💡 **Brainstorm**: Generate creative ideas
- 📝 **Summarize**: Create concise summaries

### Settings

Access settings by clicking the gear icon (⚙️) in the sidebar header:

- **API Key**: Your Groq API key (required)
- **Model**: Choose from available Groq models
- **Max Tokens**: Control response length (100-4000)
- **Open from Extension Icon**: Toggle between extension icon and bottom-right button

## File Structure

```
Sidebar-AI/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API handling
├── sidepanel.html         # Main sidebar interface
├── sidepanel.js           # Sidebar functionality
├── styles.css             # Styling and animations
├── content.js             # Content script for trigger button
├── content.css            # Trigger button styling
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## Technical Details

### Manifest V3 Features

- **Service Worker**: Handles API requests in the background
- **Side Panel API**: Modern sidebar implementation
- **Storage API**: Saves user settings locally
- **Content Security Policy**: Secure execution environment

### API Integration

- **Groq API**: Fast inference with multiple model options
- **Error Handling**: Graceful error messages and retry logic
- **Rate Limiting**: Built-in request management
- **Context Preservation**: Maintains conversation history

### Security

- **API Key Storage**: Securely stored in Chrome's local storage
- **CSP Compliance**: Strict content security policy
- **No Data Collection**: All data stays local to your browser

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Go to settings and enter your Groq API key
   - Make sure the key is valid and has sufficient credits

2. **"API Error" messages**
   - Check your internet connection
   - Verify your API key is correct
   - Ensure you have sufficient Groq credits

3. **Sidebar not opening**
   - Make sure the extension is enabled in `chrome://extensions/`
   - Try refreshing the page
   - Check if Chrome is updated to version 114+

4. **Icons not showing**
   - Replace placeholder icon files with actual PNG images
   - Ensure icon files are in the correct sizes

### Getting Help

- Check the [Groq API Documentation](https://console.groq.com/docs)
- Review Chrome's [Extension Development Guide](https://developer.chrome.com/docs/extensions/)
- Ensure you're using a supported Chrome version

## Development

### Local Development

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test your changes

### Building for Production

1. Create proper icon files
2. Test thoroughly
3. Consider code minification for production
4. Package for Chrome Web Store (optional)

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this extension.

---

**Note**: This extension requires a Groq API key to function. Groq offers free credits for new users, but usage beyond the free tier will incur charges.
