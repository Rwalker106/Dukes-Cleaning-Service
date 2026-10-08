const CONSENT_KEY = "dukes-analytics-consent";
const GA_MEASUREMENT_ID = "G-G3CMT911NC";

function loadGoogleAnalytics() {
  if (window.__dukesGaLoaded) return;
  window.__dukesGaLoaded = true;

  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gaScript.onload = () => {   
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  };
}

function saveConsent(value) {
  localStorage.setItem(CONSENT_KEY, value);
}

function applyConsent(value) {
  if (value === "granted") {
    loadGoogleAnalytics();
  }
}

function initConsentBanner() {
  const banner = document.getElementById("cookie-banner");
  const accept = document.getElementById("cookie-accept");
  const decline = document.getElementById("cookie-decline");
  if (!banner || !accept || !decline) return;

  const existingConsent = localStorage.getItem(CONSENT_KEY);
  if (existingConsent === "granted" || existingConsent === "denied") {
    applyConsent(existingConsent);
    return;
  }

  banner.hidden = false;

  accept.addEventListener("click", () => {
    saveConsent("granted");
    applyConsent("granted");
    banner.hidden = true;
  });

  decline.addEventListener("click", () => {
    saveConsent("denied");
    banner.hidden = true;
  });
}

initConsentBanner();
