document.addEventListener("DOMContentLoaded", function () {
  const scanButton = document.querySelector("#scanButton");
  const rescanButton = document.querySelector("#rescanButton");
  const urlInput = document.querySelector("#urlInput");
  const resultDiv = document.querySelector("#emptyState");
  const loadingSpinner = document.querySelector("#loadingSpinner");
  const registrationForm = document.querySelector("#registrationForm");
  const registerForm = document.querySelector("#registerForm");
  const riskScoreDiv = document.querySelector("#riskScore");
  const tipsLink = document.querySelector("#tipsLink");
  const historyList = document.querySelector("#historyList");
  const scannedUrlSection = document.querySelector("#scannedUrlSection");
  const scannedUrlText = document.querySelector("#scannedUrlText");
  const consentCheckbox = document.querySelector("#consentCheckbox");
  const seasonInput = document.querySelector("#seasonInput");
  const analyticsList = document.querySelector("#analyticsList");
  const feedbackSection = document.querySelector("#feedbackSection");
  const feedbackForm = document.querySelector("#feedbackForm");
  const feedbackThanks = document.querySelector("#feedbackThanks");

  //endpoint address of my backend API, also connected with my ml.net model
  //frontend will send a POST request to analyze a URL and receive a fraud risk score.
  const API_URL = "https://localhost:7093/api/fraud/predict";

  //whitelisted safe domains off of well known retail websites that are trusted, so when a user scans a url if it matches,
  //a domain in this list even if it is over 0.5 it is presumed to be non malicious. This helps reduce false positives

  const safeDomains = ["argos.co.uk", "amazon.co.uk", "amazon.com", "tesco.com", "boots.com", "currys.co.uk"];
//Extracts the clean domain name from a full URL so it can be compared against the safeDomains list.
  function extractDomain(url) {
      try {
        //Parses the input URL and extracts just the domain (hostname).
          const hostname = new URL(url).hostname;

          //Removes the www. prefix from the hostname if present, giving you "amazon.co.uk" 
          // This makes sure the domain format matches what’s listed in the safeDomains array.
          return hostname.replace(/^www\./, "");
          //If the input url is invalid or malformed, the function safely returns an empty string instead of crashing.
      } catch {
          return "";
      }
  }

  scanButton.addEventListener("click", async function () {
      const userUrl = urlInput.value.trim();
      const selectedSeason = seasonInput.value.trim() || "Unspecified";

      if (!userUrl) {
          alert("Please enter a valid URL.");
          return;
      }

      loadingSpinner.style.display = "block";
      resultDiv.innerHTML = "";
      riskScoreDiv.innerHTML = "";
      rescanButton.style.display = "none";
      scannedUrlSection.style.display = "none";

      try {
          const response = await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: userUrl, season: selectedSeason })
          });

          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

          const data = await response.json();
          const riskScore = data.riskScore;

          riskScoreDiv.innerHTML = `Risk Score: <strong>${riskScore.toFixed(2)}</strong>`;
          scannedUrlText.textContent = userUrl;
          scannedUrlSection.style.display = "block";
          feedbackSection.style.display = "block"; // ✅ Show feedback section

          const listItem = document.createElement("li");
          listItem.innerHTML = `<strong>${userUrl}</strong> - Risk Score: ${riskScore.toFixed(2)} - Season: ${selectedSeason}`;
          historyList.appendChild(listItem);

          const domain = extractDomain(userUrl);
          const isWhitelisted = safeDomains.includes(domain);

          if (riskScore > 0.5 && !isWhitelisted) {
              resultDiv.innerHTML = "<p class='alert'>🚨 Fraudulent link detected! Please register.</p>";
              registrationForm.style.display = "block";
              tipsLink.style.display = "block";
              scanButton.style.display = "none";
              urlInput.style.display = "none";
              seasonInput.style.display = "none";
          } else {
              resultDiv.innerHTML = isWhitelisted
                  ? "<p class='safe'>✅ Whitelisted domain. Safe to proceed.</p>"
                  : "<p class='safe'>✅ No threats found.</p>";
              registrationForm.style.display = "none";
              tipsLink.style.display = "none";
          }

          const analyticsData = {
              url: userUrl,
              riskScore: riskScore,
              season: selectedSeason,
              timestamp: new Date().toISOString(),
              deviceType: navigator.userAgent
          };

          const existingAnalytics = JSON.parse(localStorage.getItem("analyticsData")) || [];
          existingAnalytics.push(analyticsData);
          localStorage.setItem("analyticsData", JSON.stringify(existingAnalytics));

          analyticsList.innerHTML = "";
          existingAnalytics.slice(-5).forEach(item => {
              const li = document.createElement("li");
              const score = typeof item.riskScore === "number" ? item.riskScore.toFixed(2) : String(item.riskScore);
              li.innerText = `${item.season} | Score: ${score} | ${new Date(item.timestamp).toLocaleString()}`;
              analyticsList.appendChild(li);
          });

          updateSeasonSummary(existingAnalytics);

      } catch (error) {
          console.error("Scan error:", error);
          resultDiv.innerHTML = "<p class='error'>⚠️ Unable to scan the URL. Please try again later.</p>";
      } finally {
          loadingSpinner.style.display = "none";
          rescanButton.style.display = "block";
      }
  });

  rescanButton.addEventListener("click", () => {
      urlInput.value = "";
      resultDiv.innerHTML = "Ready to scan.";
      riskScoreDiv.innerHTML = "";
      registrationForm.style.display = "none";
      tipsLink.style.display = "none";
      scannedUrlSection.style.display = "none";
      feedbackSection.style.display = "none";
      scanButton.style.display = "inline-block";
      urlInput.style.display = "inline-block";
      seasonInput.style.display = "inline-block";
      rescanButton.style.display = "none";
      feedbackThanks.style.display = "none";
      feedbackForm.reset();
  });

  registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const fullName = document.querySelector("#fullName").value.trim();
      const email = document.querySelector("#email").value.trim();
      const deviceType = document.querySelector("#deviceType").value;

      if (!fullName || !email || !deviceType) {
          alert("Please fill out all required fields.");
          return;
      }

      if (!consentCheckbox.checked) {
          alert("Please agree to the terms before registering.");
          return;
      }

      alert(`Registered:\nName: ${fullName}\nEmail: ${email}\nDevice: ${deviceType}`);
      localStorage.setItem("userData", JSON.stringify({ fullName, email, deviceType }));
      registrationForm.style.display = "none";
  });

  feedbackForm.addEventListener("submit", function (e) {
      e.preventDefault();
      feedbackThanks.style.display = "block";
      feedbackForm.reset();
  });

  function updateSeasonSummary(data) {
      const counts = {};
      data.forEach(item => {
          const season = item.season || "Unspecified";
          counts[season] = (counts[season] || 0) + 1;
      });

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const seasonStatsList = document.getElementById("seasonStatsList");
      if (seasonStatsList) {
          seasonStatsList.innerHTML = "";
          sorted.forEach(([season, count]) => {
              const li = document.createElement("li");
              li.textContent = `${season} (${count} scan${count > 1 ? "s" : ""})`;
              seasonStatsList.appendChild(li);
          });
      }
  }
});
