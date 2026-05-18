import { Bot, FileJson, FileSpreadsheet, ImageUp, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type ImportKind = 'json' | 'xlsx' | 'image'

type InventoryImportProps = {
  message?: string | null
  isProcessing?: boolean
  onFileImport: (file: File, kind: ImportKind) => void
  onAiDescribe: (file: File) => void
}

export function InventoryImport({ message, isProcessing = false, onFileImport, onAiDescribe }: InventoryImportProps) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-5 p-5 lg:grid-cols-3">
      <label className="flex min-h-36 cursor-pointer flex-col items-start justify-between rounded-md border border-dashed border-ink/20 p-4 text-left transition hover:border-market hover:text-market">
        <FileJson size={24} aria-hidden="true" />
        <span className="text-sm font-semibold">{t('merchant.imports.json')}</span>
        <input
          className="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) onFileImport(file, 'json')
            event.target.value = ''
          }}
        />
      </label>
      <label className="flex min-h-36 cursor-pointer flex-col items-start justify-between rounded-md border border-dashed border-ink/20 p-4 text-left transition hover:border-market hover:text-market">
        <FileSpreadsheet size={24} aria-hidden="true" />
        <span className="text-sm font-semibold">{t('merchant.imports.xlsx')}</span>
        <input
          className="sr-only"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) onFileImport(file, 'xlsx')
            event.target.value = ''
          }}
        />
      </label>
      <label className="flex min-h-36 cursor-pointer flex-col items-start justify-between rounded-md border border-dashed border-ink/20 p-4 text-left transition hover:border-market hover:text-market">
        <ImageUp size={24} aria-hidden="true" />
        <span className="text-sm font-semibold">{t('merchant.imports.image')}</span>
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) onFileImport(file, 'image')
            event.target.value = ''
          }}
        />
      </label>
      <div className="rounded-md bg-paper p-4 lg:col-span-3">
        <p className="mb-4 text-sm text-ink/65">{message ?? t('merchant.imports.hint')}</p>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90">
            <Upload size={16} aria-hidden="true" />
            {t('merchant.imports.upload')}
            <input
              className="sr-only"
              type="file"
              accept=".json,.xlsx,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={event => {
                const file = event.target.files?.[0]
                if (file) onFileImport(file, file.name.endsWith('.xlsx') ? 'xlsx' : 'json')
                event.target.value = ''
              }}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-market hover:text-market">
            <Bot size={16} aria-hidden="true" />
            {isProcessing ? t('common.loading') : t('merchant.imports.ai')}
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isProcessing}
              onChange={event => {
                const file = event.target.files?.[0]
                if (file) onAiDescribe(file)
                event.target.value = ''
              }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
