import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { pt } from './locales/pt'

const LANGUAGE_KEY = 'cebola.language'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: localStorage.getItem(LANGUAGE_KEY) ?? 'pt',
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', language => {
  localStorage.setItem(LANGUAGE_KEY, language)
})

export { LANGUAGE_KEY }
export default i18n
