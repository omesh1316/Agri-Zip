import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// import { useTranslation } from "react-i18next";
// import { useState } from "react";

const resources = {
  en: {
    translation: {
      "Soil Type": "Soil Type",
      "Season": "Season",
      "City": "City",
      "Temperature": "Temperature",
      "Humidity": "Humidity",
      "Email (for notifications)": "Email (for notifications)",
      "Get Suggestion": "Get Suggestion",
      "Auto-Fill Weather": "Auto-Fill Weather",
      // ...add more as needed
    }
  },
  hi: {
    translation: {
      "Soil Type": "मिट्टी का प्रकार",
      "Season": "मौसम",
      "City": "शहर",
      "Temperature": "तापमान",
      "Humidity": "नमी",
      "Email (for notifications)": "ईमेल (सूचनाओं के लिए)",
      "Get Suggestion": "सलाह प्राप्त करें",
      "Auto-Fill Weather": "मौसम भरें",
      // ...add more as needed
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  interpolation: {
    escapeValue: false
  }
});

export default i18n;