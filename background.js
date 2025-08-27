// Background service worker for AI Sidebar Assistant
chrome.runtime.onInstalled.addListener(() => {
  // Set up the side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  
              // Initialize default settings
            chrome.storage.local.set({
                apiKey: '',
                model: 'llama3-8b-8192',
                maxTokens: 1000,
                useExtensionIcon: false
            });
});

// Handle messages from the side panel and content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GROQ_API_REQUEST') {
    handleGroqApiRequest(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  } else if (request.type === 'OPEN_SIDEBAR') {
    // Open sidebar for the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ windowId: tabs[0].windowId });
      }
    });
    sendResponse({ success: true });
  } else if (request.type === 'TRIGGER_ACTION_CLICK') {
    // Simulate action button click
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ windowId: tabs[0].windowId });
      }
    });
    sendResponse({ success: true });
  }
});

// Handle Groq API requests
async function handleGroqApiRequest(data) {
  const settings = await chrome.storage.local.get(['apiKey', 'model', 'maxTokens']);
  
  if (!settings.apiKey) {
    throw new Error('API key not configured. Please set your Groq API key in the extension settings.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.model,
      messages: data.messages,
      max_tokens: settings.maxTokens,
      temperature: 0.7, // Fixed temperature value
      stream: false
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  const settings = await chrome.storage.local.get(['useExtensionIcon']);
  
  // Only open sidebar if the setting is enabled
  if (settings.useExtensionIcon) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
