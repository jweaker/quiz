import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface EditorHeaderProps {
  title: string
  onTitleChange: (title: string) => void
  onNew: (type: 'blank' | 'template' | 'clone') => void
  onImport: (file: File) => void
  onExport: () => void
}

export default function EditorHeader({
  title,
  onTitleChange,
  onNew,
  onImport,
  onExport,
}: EditorHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
      // Reset so the same file can be re-imported
      e.target.value = ''
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Back link + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            to="/operator"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            ← العودة للتحكم
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="حلقة جديدة"
            className="bg-transparent text-lg font-semibold outline-none border-b border-transparent focus:border-primary/40 transition-colors flex-1 min-w-0"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* New episode buttons */}
          <Button variant="outline" size="sm" onClick={() => onNew('blank')}>
            جديد
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNew('template')}>
            قالب
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNew('clone')}>
            استنساخ
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Import / Export */}
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            استيراد
          </Button>
          <Button variant="default" size="sm" onClick={onExport}>
            تصدير
          </Button>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
