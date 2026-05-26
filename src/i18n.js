import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import ar from "./locales/ar/translation.json";

const STORAGE_KEY = "language";
const supportedLanguages = ["en", "ar"];
const savedLang =
  typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
const defaultLanguage =
  savedLang && supportedLanguages.includes(savedLang) ? savedLang : "en";

const setDocumentDirection = (language) => {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", language === "ar");
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: defaultLanguage,
  fallbackLng: "en",
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

setDocumentDirection(defaultLanguage);
i18n.on("languageChanged", (lang) => {
  if (!supportedLanguages.includes(lang)) return;
  localStorage.setItem(STORAGE_KEY, lang);
  setDocumentDirection(lang);
});

export default i18n;
