chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scan') {
      // Scan the page for links
      let phishingLinks = [];
      const links = document.querySelectorAll('a');

            
      
      links.forEach(link => {
        // This implements phishing detection logic here
        // calls the backend API to analyze the link
        if (isPhishing(link.href)) {
          phishingLinks.push(link.href);
        }
      });
  
      // Send the list of phishing links back to the popup
      sendResponse({ phishingLinks });
    }
  });
  
  function isPhishing(url) {
    // Basic phishing check (you can expand this to include more sophisticated checks)
    const phishingIndicators = ['login', 'secure', 'bank', 'verify', 'update'];
    
    // Check if URL contains common phishing keywords (this can be replaced with a machine learning API)
    return phishingIndicators.some(keyword => url.toLowerCase().includes(keyword));
  }

 
 
  

  function isPhishing(url) {
    // Calls the backend API to check if the URL is phishing
    return fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    .then(response => response.json())
    .then(data => data.prediction === 1)  // Assuming '1' indicates phishing
    .catch(() => false);  // Return false in case of error
  }

 
  
  