/**
 * בדיקות לשלב Barnum Ethics באשף ההכנסה
 * ONBR-01: שני ה-checkboxes חייבים להיות מסומנים כדי להמשיך
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BarnumEthicsStep } from '@/components/features/onboarding/OnboardingWizard';

/** Mock של useOnboardingStore — אינו נדרש ב-BarnumEthicsStep */
vi.mock('@/stores/onboarding', () => ({
  useOnboardingStore: vi.fn(() => ({
    step: 3,
    data: {
      fullName: '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      latitude: null,
      longitude: null,
      gender: 'prefer_not_to_say',
      disciplines: [],
      focusAreas: [],
      aiSuggestionsEnabled: true,
      acceptedBarnum: false,
      acceptedTerms: false,
    },
    setStep: vi.fn(),
    updateData: vi.fn(),
    reset: vi.fn(),
  })),
}));

describe('BarnumEthicsStep', () => {
  const mockOnNext = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnNext.mockClear();
    mockOnUpdate.mockClear();
  });

  /**
   * בדיקה 1: רינדור ראשוני — שני checkboxes לא מסומנים, כפתור המשך מושבת
   */
  it('renders with both checkboxes unchecked and button disabled', () => {
    render(<BarnumEthicsStep onNext={mockOnNext} onUpdate={mockOnUpdate} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });

    const nextButton = screen.getByRole('button', { name: /המשך/i });
    expect(nextButton).toBeDisabled();
  });

  /**
   * בדיקה 2: אחרי סימון שני checkboxes, כפתור ההמשך פעיל
   */
  it('enables the next button after both checkboxes are checked', () => {
    render(<BarnumEthicsStep onNext={mockOnNext} onUpdate={mockOnUpdate} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const nextButton = screen.getByRole('button', { name: /המשך/i });
    expect(nextButton).not.toBeDisabled();
  });

  /**
   * בדיקה 3: סימון checkbox אחד בלבד — הכפתור נשאר מושבת
   */
  it('keeps button disabled when only one checkbox is checked', () => {
    render(<BarnumEthicsStep onNext={mockOnNext} onUpdate={mockOnUpdate} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const nextButton = screen.getByRole('button', { name: /המשך/i });
    expect(nextButton).toBeDisabled();
  });

  /**
   * בדיקה 4: onUpdate נקרא עם הנתונים הנכונים בשינוי checkbox
   */
  it('calls onUpdate with correct data when a checkbox changes', () => {
    render(<BarnumEthicsStep onNext={mockOnNext} onUpdate={mockOnUpdate} />);

    const checkboxes = screen.getAllByRole('checkbox');

    // לחיצה על ה-checkbox הראשון (acceptedBarnum)
    fireEvent.click(checkboxes[0]);
    expect(mockOnUpdate).toHaveBeenCalledWith({
      acceptedBarnum: true,
      acceptedTerms: false,
    });

    // לחיצה על ה-checkbox השני (acceptedTerms)
    fireEvent.click(checkboxes[1]);
    expect(mockOnUpdate).toHaveBeenCalledWith({
      acceptedBarnum: true,
      acceptedTerms: true,
    });
  });
});
