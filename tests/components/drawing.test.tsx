/**
 * בדיקות קומפוננטת DigitalCanvas — קנבס ציור דיגיטלי
 * TOOL-08: DigitalCanvas מורכב ומרנדר אלמנט canvas
 */
import { render, screen } from '@testing-library/react'
import { DigitalCanvas } from '@/components/features/drawing/DigitalCanvas'

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

const mockOnDataUrl = vi.fn()

describe('DigitalCanvas', () => {
  it('מרנדר אלמנט canvas ללא קריסה', () => {
    render(
      <DigitalCanvas
        onDataUrl={mockOnDataUrl}
        drawingType="house"
      />
    )
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('מקבל prop onDataUrl ומרנדר ללא שגיאה', () => {
    const onDataUrl = vi.fn()
    render(
      <DigitalCanvas
        onDataUrl={onDataUrl}
        drawingType="free"
        width={400}
        height={300}
      />
    )
    expect(document.querySelector('canvas')).toBeTruthy()
  })
})
