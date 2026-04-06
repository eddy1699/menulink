'use client'

interface Category {
  id: string
  name: string
  nameEn?: string | null
  namePt?: string | null
}

interface CategoryNavProps {
  categories: Category[]
  activeId: string | null
  onSelect: (id: string | null) => void
  primaryColor: string
  lang: string
  fontFamily?: string
}

export function CategoryNav({
  categories,
  activeId,
  onSelect,
  primaryColor,
  lang,
  fontFamily,
}: CategoryNavProps) {
  const getCategoryName = (cat: Category) => {
    if (lang === 'en' && cat.nameEn) return cat.nameEn
    if (lang === 'pt' && cat.namePt) return cat.namePt
    return cat.name
  }

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm" style={{ fontFamily }}>
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          style={
            activeId === null
              ? { backgroundColor: primaryColor, color: 'white' }
              : { backgroundColor: '#f5f5f5', color: '#555' }
          }
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={
              activeId === cat.id
                ? { backgroundColor: primaryColor, color: 'white' }
                : { backgroundColor: '#f5f5f5', color: '#555' }
            }
          >
            {getCategoryName(cat)}
          </button>
        ))}
      </div>
    </nav>
  )
}
