'use client'

/**
 * פאנל שיתוף ניתוח — יצירת קישור שיתוף + כפתורי רשתות חברתיות
 */
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  WhatsappShareButton,
  TelegramShareButton,
  FacebookShareButton,
  WhatsappIcon,
  TelegramIcon,
  FacebookIcon,
} from 'react-share'
import { Button } from '@/components/ui/button'

interface SharePanelProps {
  analysisId: string
  title: string
}

interface ShareResponse {
  share_url: string
  share_token: string
}

/** פאנל שיתוף — יצירת קישור + שיתוף לוואטסאפ, טלגרם, פייסבוק */
export function SharePanel({ analysisId, title }: SharePanelProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { mutate: generateShare, isPending, isError } = useMutation<ShareResponse>({
    mutationFn: async () => {
      const res = await fetch('/api/analysis/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: analysisId }),
      })
      if (!res.ok) throw new Error('שגיאה ביצירת קישור שיתוף')
      return res.json() as Promise<ShareResponse>
    },
    onSuccess: (data) => {
      setShareUrl(data.share_url)
    },
  })

  /** העתקת קישור ללוח */
  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /** שיתוף נייטיב דרך Web Share API */
  async function handleNativeShare() {
    if (!shareUrl || !navigator.share) return
    await navigator.share({ title, url: shareUrl })
  }

  if (!shareUrl) {
    return (
      <div className="flex flex-col items-start gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateShare()}
          disabled={isPending}
        >
          {isPending ? 'יוצר קישור...' : 'שתף ניתוח'}
        </Button>
        {isError && (
          <p className="text-destructive text-xs">שגיאה ביצירת קישור, נסה שוב</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* קישור + כפתור העתקה */}
      <div className="flex gap-2 items-center">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 text-sm border rounded px-2 py-1 bg-muted text-muted-foreground"
          aria-label="קישור שיתוף"
        />
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? 'הועתק!' : 'העתק'}
        </Button>
      </div>

      {/* שיתוף נייטיב — זמין רק בדפדפנים שתומכים ב-Web Share API */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button variant="outline" size="sm" onClick={handleNativeShare}>
          שתף
        </Button>
      )}

      {/* כפתורי רשתות חברתיות */}
      <div className="flex gap-2">
        <WhatsappShareButton url={shareUrl} title={title}>
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
        <TelegramShareButton url={shareUrl} title={title}>
          <TelegramIcon size={32} round />
        </TelegramShareButton>
        <FacebookShareButton url={shareUrl}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
    </div>
  )
}
