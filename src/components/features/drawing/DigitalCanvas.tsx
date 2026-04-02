'use client'

/**
 * DigitalCanvas — קנבס ציור דיגיטלי בדפדפן
 * DRAW-02: ציור ישיר בדפדפן ללא העלאת קובץ
 * תומך בעכבר וטאץ', עט/מחק/undo/clear, ייצוא JPEG 85%
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil, Eraser, RotateCcw, Trash2, Check, X } from 'lucide-react'

// ===== טיפוסים =====

/** מטא-דאטה של הציור שנשלחת לאנליזה */
export interface DrawingMetadata {
  total_strokes: number
  total_drawing_time: number
  average_speed: number
  average_pressure: number
  erasures: number
  canvas_dimensions: { width: number; height: number }
  drawing_date: string
}

interface CanvasProps {
  onSave: (file: File, metadata: DrawingMetadata) => void
  onCancel: () => void
}

interface StrokePoint { x: number; y: number; pressure: number; timestamp: number }
interface Stroke { tool: 'pen' | 'eraser'; points: StrokePoint[]; startTime: number; endTime?: number }

// ===== קבועים =====
const W = 800, H = 600, PEN_W = 3, ERASE_W = 20

// ===== פונקציות עזר =====

/** קואורדינטות קנבס מנורמליזות לפי scale הדפדפן */
function coords(cx: number, cy: number, pressure: number, canvas: HTMLCanvasElement): StrokePoint {
  const r = canvas.getBoundingClientRect()
  return { x: (cx - r.left) * (canvas.width / r.width), y: (cy - r.top) * (canvas.height / r.height), pressure: pressure || 0.5, timestamp: Date.now() }
}

/** מהירות ממוצעת בין נקודות שבץ */
function avgSpeed(points: StrokePoint[]): number {
  if (points.length < 2) return 0
  let dist = 0, time = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]
    if (!a || !b) continue
    dist += Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
    time += b.timestamp - a.timestamp
  }
  return time > 0 ? dist / time : 0
}

// ===== קומפוננטה ראשית =====

// ===== ממשק חדש למטרת תאימות עם plan 02-03 =====

/**
 * Props לממשק DigitalCanvas המפושט (plan 02-03)
 * onDataUrl מופעל עם dataURL כאשר המשתמש מסיים לצייר
 */
export interface DigitalCanvasProps {
  readonly onDataUrl: (dataUrl: string) => void
  readonly drawingType: 'person' | 'tree' | 'house' | 'family' | 'free'
  readonly width?: number
  readonly height?: number
}

/**
 * הוראות ציור לפי סוג
 */
const DRAWING_INSTRUCTIONS: Record<DigitalCanvasProps['drawingType'], string> = {
  house: 'צייר בית עם גג, קירות, דלת וחלון',
  tree: 'צייר עץ עם גזע, ענפים ועלים',
  person: 'צייר דמות אדם שלמה',
  family: 'צייר את כל בני המשפחה שלך',
  free: 'ציור חופשי — צייר מה שרוצה',
}

/**
 * DigitalCanvas (named export) — מרכיב ציור דיגיטלי מפושט
 * עוטף את DigitalCanvasInternal עם ממשק onDataUrl
 */
export function DigitalCanvas({ onDataUrl, drawingType, width: _width = 600, height: _height = 400 }: DigitalCanvasProps) {
  const instruction = DRAWING_INSTRUCTIONS[drawingType]

  const handleSaveInternal = (file: File, _metadata: DrawingMetadata) => {
    const reader = new FileReader()
    reader.onload = () => {
      onDataUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2" dir="rtl">
      <p className="text-sm text-on-surface-variant font-body">{instruction}</p>
      <DigitalCanvasInternal onSave={handleSaveInternal} onCancel={() => onDataUrl('')} />
    </div>
  )
}

/** קנבס ציור דיגיטלי עם עט, מחק, undo, clear וייצוא JPEG — internal implementation */
function DigitalCanvasInternal({ onSave, onCancel }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef<Stroke | null>(null)
  const historyRef = useRef<ImageData[]>([])

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [strokeCount, setStrokeCount] = useState(0)
  const [erasureCount, setErasureCount] = useState(0)
  const [canUndo, setCanUndo] = useState(false)
  const [startEpoch] = useState(Date.now())
  const [allStrokes, setAllStrokes] = useState<Stroke[]>([])

  // אתחול קנבס עם רקע לבן
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (ctx) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H) }
  }, [])

  /** מתחיל שבץ — שומר snapshot ל-undo */
  const startDrawing = useCallback((pt: StrokePoint) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    if (!canvas || !ctx) return
    historyRef.current.push(ctx.getImageData(0, 0, W, H))
    setCanUndo(true)
    isDrawingRef.current = true
    currentStrokeRef.current = { tool, points: [pt], startTime: Date.now() }
    ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.strokeStyle = tool === 'pen' ? '#000000' : '#FFFFFF'
    ctx.lineWidth = tool === 'pen' ? PEN_W : ERASE_W
  }, [tool])

  /** ממשיך ציור */
  const continueDrawing = useCallback((pt: StrokePoint) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    currentStrokeRef.current.points.push(pt)
    ctx.lineTo(pt.x, pt.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(pt.x, pt.y)
  }, [])

  /** מסיים שבץ */
  const finishDrawing = useCallback(() => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return
    isDrawingRef.current = false
    const stroke: Stroke = { ...currentStrokeRef.current, endTime: Date.now() }
    setAllStrokes(prev => [...prev, stroke])
    setStrokeCount(prev => prev + 1)
    if (tool === 'eraser') setErasureCount(prev => prev + 1)
    currentStrokeRef.current = null
  }, [tool])

  // handlers עכבר
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = (e.nativeEvent as PointerEvent).pressure ?? 0.5
    startDrawing(coords(e.clientX, e.clientY, p, canvasRef.current!))
  }
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const p = (e.nativeEvent as PointerEvent).pressure ?? 0.5
    continueDrawing(coords(e.clientX, e.clientY, p, canvasRef.current!))
  }
  const onMouseUp = () => finishDrawing()
  const onMouseLeave = () => { if (isDrawingRef.current) finishDrawing() }

  // handlers טאץ' — e.preventDefault() מונע גלילה בעת ציור
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const t = e.touches[0]
    if (!t) return
    const force = (t as Touch & { force?: number }).force ?? 0.5
    startDrawing(coords(t.clientX, t.clientY, force, canvasRef.current!))
  }
  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawingRef.current) return
    const t = e.touches[0]
    if (!t) return
    const force = (t as Touch & { force?: number }).force ?? 0.5
    continueDrawing(coords(t.clientX, t.clientY, force, canvasRef.current!))
  }
  const onTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => { e.preventDefault(); finishDrawing() }

  // ===== פעולות כלים =====

  /** ביטול שבץ אחרון */
  const handleUndo = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    if (!canvas || !ctx || historyRef.current.length === 0) return
    ctx.putImageData(historyRef.current.pop()!, 0, 0)
    setStrokeCount(prev => Math.max(0, prev - 1))
    setAllStrokes(prev => prev.slice(0, -1))
    setCanUndo(historyRef.current.length > 0)
  }

  /** ניקוי קנבס מלא */
  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    if (!canvas || !ctx) return
    historyRef.current = []
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H)
    setStrokeCount(0); setErasureCount(0); setAllStrokes([]); setCanUndo(false)
  }

  /** שמירה — ייצוא JPEG 85% למניעת חריגת Vercel 4.5MB body limit */
  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `drawing_${Date.now()}.jpg`, { type: 'image/jpeg' })
      const speeds = allStrokes.map(s => avgSpeed(s.points))
      const pressures = allStrokes.flatMap(s => s.points.map(p => p.pressure))
      const metadata: DrawingMetadata = {
        total_strokes: strokeCount,
        total_drawing_time: Date.now() - startEpoch,
        average_speed: speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0,
        average_pressure: pressures.length ? pressures.reduce((a, b) => a + b, 0) / pressures.length : 0.5,
        erasures: erasureCount,
        canvas_dimensions: { width: W, height: H },
        drawing_date: new Date().toISOString(),
      }
      onSave(file, metadata)
    }, 'image/jpeg', 0.85)
  }

  // ===== רינדור =====

  return (
    <div className="space-y-4" dir="rtl">
      {/* סרגל כלים */}
      <Card className="border-outline-variant/10 bg-surface-container">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            {(['pen', 'eraser'] as const).map(t => (
              <Button key={t} type="button" size="sm"
                variant={tool === t ? 'default' : 'outline'}
                onClick={() => setTool(t)}
                className={tool === t
                  ? 'bg-primary-container/20 text-primary font-label'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label'
                }
                aria-pressed={tool === t}
              >
                {t === 'pen' ? <Pencil className="h-4 w-4 ms-1" /> : <Eraser className="h-4 w-4 ms-1" />}
                {t === 'pen' ? 'עט' : 'מחק'}
              </Button>
            ))}
            <div className="h-6 w-px bg-outline-variant/30" />
            <Button type="button" variant="outline" size="sm" onClick={handleUndo} disabled={!canUndo}
              className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label" aria-label="בטל">
              <RotateCcw className="h-4 w-4 ms-1" />בטל
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleClear}
              className="text-error hover:bg-error/10 font-label" aria-label="נקה">
              <Trash2 className="h-4 w-4 ms-1" />נקה
            </Button>
            {strokeCount > 0 && <span className="text-xs text-on-surface-variant font-label me-auto">{strokeCount} קווים</span>}
          </div>
        </CardContent>
      </Card>

      {/* הקנבס */}
      <Card className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <CardContent className="p-0">
          <canvas ref={canvasRef}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove}
            onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            className="w-full h-auto cursor-crosshair block touch-none max-h-[65vh]"
            aria-label="קנבס ציור"
          />
        </CardContent>
      </Card>

      {/* כפתורי שמירה/ביטול */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}
          className="flex-1 border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high font-label">
          <X className="h-4 w-4 ms-1" />ביטול
        </Button>
        <Button type="button" onClick={handleSave} disabled={strokeCount === 0}
          className="flex-1 bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold rounded-xl active:scale-95" aria-label="שמור ונתח">
          <Check className="h-4 w-4 ms-1" />שמור ונתח
        </Button>
      </div>
    </div>
  )
}

// ייצוא ברירת מחדל לשימוש קיים (DrawingAnalysisForm)
export default DigitalCanvasInternal
