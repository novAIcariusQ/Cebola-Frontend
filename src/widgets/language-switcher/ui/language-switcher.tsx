import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink shadow-sm">
      <Languages size={16} aria-hidden="true" />
      <span className="sr-only">{t('common.language')}</span>
      <select
        className="bg-transparent outline-none"
        value={i18n.language}
        aria-label={t('common.language')}
        onChange={event => void i18n.changeLanguage(event.target.value)}
      >
        <option value="pt">{t('common.portuguese')}</option>
        <option value="en">{t('common.english')}</option>
      </select>
    </label>
  )
}
