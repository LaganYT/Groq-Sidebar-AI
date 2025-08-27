// Sidebar Panel JavaScript
class AISidebarAssistant {
    constructor() {
        this.chatMessages = [];
        this.isLoading = false;
        this.originalSettings = {}; // Store original settings for comparison
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateCharCount();
    }

    bindEvents() {
        // Input handling
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearBtn = document.getElementById('clearBtn');

        messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.updateSendButton();
        });

        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());
        clearBtn.addEventListener('click', () => this.clearChat());

        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const saveSettings = document.getElementById('saveSettings');

        settingsBtn.addEventListener('click', () => this.openSettings());
        closeSettings.addEventListener('click', () => this.closeSettings());
        saveSettings.addEventListener('click', () => this.saveSettings());

        // Close modal when clicking outside
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                this.closeSettings();
            }
        });

        // Quick prompts
        document.querySelectorAll('.quick-prompt').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                messageInput.value = prompt;
                this.updateCharCount();
                this.updateSendButton();
                messageInput.focus();
            });
        });

        // Settings form controls
        const maxTokensSlider = document.getElementById('maxTokens');
        const maxTokensValue = document.getElementById('maxTokensValue');
        const apiKeyInput = document.getElementById('apiKey');
        const apiKeyStatus = document.getElementById('apiKeyStatus');
        const saveBtn = document.getElementById('saveSettings');

        maxTokensSlider.addEventListener('input', () => {
            maxTokensValue.textContent = maxTokensSlider.value;
        });

        // API key validation
        apiKeyInput.addEventListener('input', () => {
            this.validateApiKey();
        });

        // Update save button state based on changes
        const updateSaveButtonState = () => {
            const hasApiKey = apiKeyInput.value.trim().length > 0;
            const hasChanges = this.hasSettingsChanged();
            const shouldEnable = hasApiKey && hasChanges;
            
            saveBtn.disabled = !shouldEnable;
            saveBtn.style.opacity = shouldEnable ? '1' : '0.6';
            
            // Reset button appearance when it becomes enabled again
            if (shouldEnable) {
                saveBtn.textContent = 'Save Settings';
                saveBtn.style.background = '';
                saveBtn.classList.remove('saving');
            }
        };

        // Add change listeners for all settings
        apiKeyInput.addEventListener('input', updateSaveButtonState);
        maxTokensSlider.addEventListener('input', updateSaveButtonState);
        document.getElementById('model').addEventListener('change', updateSaveButtonState);
        document.getElementById('useExtensionIcon').addEventListener('change', updateSaveButtonState);
        
        updateSaveButtonState(); // Initial state
    }

    updateCharCount() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        const count = messageInput.value.length;
        charCount.textContent = `${count}/2000`;
        
        if (count > 1800) {
            charCount.style.color = '#dc3545';
        } else if (count > 1500) {
            charCount.style.color = '#ffc107';
        } else {
            charCount.style.color = '#6c757d';
        }
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const hasText = messageInput.value.trim().length > 0;
        
        sendBtn.disabled = !hasText || this.isLoading;
    }

    validateApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const apiKeyStatus = document.getElementById('apiKeyStatus');
        const apiKey = apiKeyInput.value.trim();
        
        if (apiKey.length === 0) {
            apiKeyStatus.textContent = '';
            apiKeyStatus.className = 'api-key-status';
        } else if (apiKey.length < 10) {
            apiKeyStatus.textContent = 'API key seems too short';
            apiKeyStatus.className = 'api-key-status invalid';
        } else if (apiKey.startsWith('gsk_')) {
            apiKeyStatus.textContent = 'Valid Groq API key format';
            apiKeyStatus.className = 'api-key-status valid';
        } else {
            apiKeyStatus.textContent = 'Please enter a valid Groq API key';
            apiKeyStatus.className = 'api-key-status invalid';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || this.isLoading) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        messageInput.value = '';
        this.updateCharCount();
        this.updateSendButton();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get chat history for context
            const messages = this.chatMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Send to background script
            const response = await chrome.runtime.sendMessage({
                type: 'GROQ_API_REQUEST',
                data: { messages }
            });

            this.hideTypingIndicator();

            if (response.success) {
                this.addMessage(response.data, 'assistant');
            } else {
                this.addMessage(`Error: ${response.error}`, 'assistant');
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage(`Error: ${error.message}`, 'assistant');
        }
    }

    addMessage(content, role) {
        const chatMessages = document.getElementById('chatMessages');
        
        // Remove welcome message if it exists
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '👤' : '🤖';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store message
        this.chatMessages.push({ role, content });
    }

    showTypingIndicator() {
        this.isLoading = true;
        this.updateSendButton();
        
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';

        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        typingContent.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingContent);
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        this.isLoading = false;
        this.updateSendButton();
        
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.chatMessages = [];
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <h3>Welcome to AI Sidebar Assistant!</h3>
                    <p>I'm powered by Groq's fast AI models. Ask me anything!</p>
                    <div class="quick-prompts">
                        <button class="quick-prompt" data-prompt="Help me write a professional email">📧 Write Email</button>
                        <button class="quick-prompt" data-prompt="Explain this concept in simple terms">📚 Explain</button>
                        <button class="quick-prompt" data-prompt="Generate ideas for">💡 Brainstorm</button>
                        <button class="quick-prompt" data-prompt="Summarize the key points">📝 Summarize</button>
                    </div>
                </div>
            `;
            
            // Rebind quick prompt events
            document.querySelectorAll('.quick-prompt').forEach(btn => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    const messageInput = document.getElementById('messageInput');
                    messageInput.value = prompt;
                    this.updateCharCount();
                    this.updateSendButton();
                    messageInput.focus();
                });
            });
        }
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.local.get(['apiKey', 'model', 'maxTokens', 'useExtensionIcon']);
            
            // Store original settings for comparison
            this.originalSettings = {
                apiKey: settings.apiKey || '',
                model: settings.model || 'llama3-8b-8192',
                maxTokens: settings.maxTokens || 1000,
                useExtensionIcon: settings.useExtensionIcon || false
            };
            
            document.getElementById('apiKey').value = this.originalSettings.apiKey;
            document.getElementById('model').value = this.originalSettings.model;
            document.getElementById('maxTokens').value = this.originalSettings.maxTokens;
            document.getElementById('useExtensionIcon').checked = this.originalSettings.useExtensionIcon;
            
            document.getElementById('maxTokensValue').textContent = this.originalSettings.maxTokens;
            
            // Validate API key after loading
            this.validateApiKey();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('show');
        
        // Reload settings to get current values and update button state
        this.loadSettings().then(() => {
            // Update save button state after loading
            const saveBtn = document.getElementById('saveSettings');
            const apiKeyInput = document.getElementById('apiKey');
            const hasApiKey = apiKeyInput.value.trim().length > 0;
            const hasChanges = this.hasSettingsChanged();
            saveBtn.disabled = !hasApiKey || !hasChanges;
            saveBtn.style.opacity = (hasApiKey && hasChanges) ? '1' : '0.6';
        });
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
    }

    hasSettingsChanged() {
        const currentApiKey = document.getElementById('apiKey').value;
        const currentModel = document.getElementById('model').value;
        const currentMaxTokens = parseInt(document.getElementById('maxTokens').value);
        const currentUseExtensionIcon = document.getElementById('useExtensionIcon').checked;
        
        return currentApiKey !== this.originalSettings.apiKey ||
               currentModel !== this.originalSettings.model ||
               currentMaxTokens !== this.originalSettings.maxTokens ||
               currentUseExtensionIcon !== this.originalSettings.useExtensionIcon;
    }

    async saveSettings() {
        const saveBtn = document.getElementById('saveSettings');
        const originalText = saveBtn.textContent;
        
        try {
            // Show saving state
            saveBtn.disabled = true;
            saveBtn.classList.add('saving');
            saveBtn.textContent = 'Saving...';
            
            const apiKey = document.getElementById('apiKey').value;
            const model = document.getElementById('model').value;
            const maxTokens = parseInt(document.getElementById('maxTokens').value);
            const useExtensionIcon = document.getElementById('useExtensionIcon').checked;

            // Validate API key
            if (!apiKey.trim()) {
                throw new Error('API key is required');
            }

            await chrome.storage.local.set({
                apiKey,
                model,
                maxTokens,
                useExtensionIcon
            });

            // Update original settings after successful save
            this.originalSettings = { apiKey, model, maxTokens, useExtensionIcon };

            // Notify content scripts about the new setting
            try {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tabs[0]) {
                    await chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'UPDATE_EXTENSION_ICON_SETTING',
                        useExtensionIcon
                    });
                }
            } catch (e) {
                // Content script might not be available, ignore
            }

            // Show success state briefly before closing
            saveBtn.textContent = 'Saved!';
            saveBtn.style.background = '#28a745';
            
            setTimeout(() => {
                this.closeSettings();
                // Show success message
                this.showNotification('Settings saved successfully!', 'success');
            }, 500);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification(`Error saving settings: ${error.message}`, 'error');
            
            // Reset button state
            saveBtn.disabled = false;
            saveBtn.classList.remove('saving');
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AISidebarAssistant();
});
