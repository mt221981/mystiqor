/**
 * בדיקות קומפוננטת Comparison — תרשים רדאר גרפולוגי
 * TOOL-07: RadarChart מרנדר עם נתוני השוואה
 */
import { render, screen } from '@testing-library/react'
import { Comparison } from '@/components/features/graphology/Comparison'

// Mock recharts — SSR-incompatible
vi.mock('recharts', () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Legend: () => <div />,
  Tooltip: () => <div />,
}))

const SAMPLE_DATA = [
  { metric: 'לחץ עט', current: 75, average: 60 },
  { metric: 'גודל', current: 80, average: 70 },
  { metric: 'נטייה', current: 45, average: 50 },
  { metric: 'ריווח', current: 65, average: 65 },
  { metric: 'קצב', current: 70, average: 68 },
]

describe('Comparison', () => {
  it('מרנדר RadarChart עם 5 נקודות נתונים ללא קריסה', () => {
    render(<Comparison data={SAMPLE_DATA} />)
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument()
  })

  it('מרנדר ללא קריסה כאשר נתונים ריקים', () => {
    render(<Comparison data={[]} />)
    // לא אמור לקרוס — רק לרנדר
    expect(document.body).toBeTruthy()
  })
})
