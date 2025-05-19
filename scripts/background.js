// Listen for messages from the popup or other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scan') {
      // Relay the message to the active tab's content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'scan' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error communicating with content script:', chrome.runtime.lastError.message);
              sendResponse({ error: 'Failed to communicate with content script' });
            } else {
              sendResponse(response);
            }
          });
        } else {
          sendResponse({ error: 'No active tab found' });
        }
      });
      // Return true to indicate an asynchronous response
      return true;
    }
  });
  
  //Handle extension installation events
  chrome.runtime.onInstalled.addListener(() => {
    console.log('Cyber Protection extension installed!');
  });
  
  // Add listener for action button clicks (e.g., to open popup)
  chrome.action.onClicked.addListener((tab) => {
    console.log('Action button clicked on tab:', tab);
  });
  