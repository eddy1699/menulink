'use client'

interface LanguageSelectorProps {
  availableLanguages: string[]
  currentLang: string
  onChange: (lang: string) => void
}

const langLabels: Record<string, string> = {
  es: '🇪🇸 ES',
  en: '🇬🇧 EN',
  pt: '🇧🇷 PT',
}

export function LanguageSelector({
  availableLanguages,
  currentLang,
  onChange,
}: LanguageSelectorProps) {
  if (availableLanguages.length <= 1) return null

  return (
    <div className="flex gap-1 bg-white/20 rounded-full p-1">
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className="px-3 py-1 rounded-full text-xs font-medium transition-all"
          style={
            currentLang === lang
              ? { backgroundColor: 'white', color: '#333' }
              : { color: 'rgba(255,255,255,0.8)' }
          }
        >
          {langLabels[lang] || lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
