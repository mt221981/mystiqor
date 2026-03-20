# 02b_GEMS.md — יהלומים לשימור

> קוד מצוין שחייב לשרוד את המיגרציה. כל GEM מתועד עם הקוד המקורי, הסבר, ומיקום יעד.

---

## GEM 1: Solar Return — VSOP87 Binary Search
**מקור:** `base44/functions/calculateSolarReturn/entry.ts`
**ציון:** 41/50 🟢 KEEP
**יעד:** `src/services/astrology/solar-return.ts`

### מה עושה
חיפוש בינארי (100 iterations) למציאת הרגע המדויק שבו השמש חוזרת למיקום הלידה שלה (Solar Return). דיוק של ±0.01°.

### הקוד
```typescript
// Binary search to find exact solar return moment
let searchDate = new Date(yearToCalculate, birthMonth - 1, birthDay, 12, 0, 0);
let minDate = new Date(searchDate.getTime() - 2 * 24 * 60 * 60 * 1000);
let maxDate = new Date(searchDate.getTime() + 2 * 24 * 60 * 60 * 1000);

let bestDate = searchDate;
let bestDiff = 999;

for (let i = 0; i < 100; i++) {
    const testDate = new Date((minDate.getTime() + maxDate.getTime()) / 2);
    const sunLon = calculateSunPosition(testDate);

    let diff = Math.abs(normalize(sunLon - natal_sun_longitude));
    if (diff > 180) diff = 360 - diff;

    if (diff < bestDiff) {
        bestDiff = diff;
        bestDate = testDate;
    }

    if (diff < 0.01) break; // Accurate enough

    if (normalize(sunLon) < normalize(natal_sun_longitude)) {
        minDate = testDate;
    } else {
        maxDate = testDate;
    }
}
```

### Sun Position (VSOP87 simplified)
```typescript
function calculateSunPosition(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();

    let Y = year, M = month;
    if (M <= 2) { Y = Y - 1; M = M + 12; }

    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD0 = Math.floor(365.25 * (Y + 4716)) +
                Math.floor(30.6001 * (M + 1)) +
                day + B - 1524.5;

    const dayFraction = (hour + minute / 60) / 24;
    const jd = JD0 + dayFraction;
    const T = (jd - 2451545.0) / 36525;

    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mrad = M_sun * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
              0.000289 * Math.sin(3 * Mrad);

    let sunLon = L0 + C;
    sunLon = sunLon % 360;
    if (sunLon < 0) sunLon += 360;
    return sunLon;
}
```

### Placidus Houses
```typescript
function calculateHouses(date, lat, lon) {
    // Julian Date calculation...
    const T = (JD - 2451545.0) / 36525;

    // Sidereal Time
    const GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) +
                 0.000387933 * T * T - T * T * T / 38710000;
    const LST = (GMST + lon) % 360;

    // Ascendant
    const latRad = lat * Math.PI / 180;
    const lstRad = LST * Math.PI / 180;
    const ascRad = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.sin(latRad));
    let asc = (ascRad * 180 / Math.PI) % 360;
    if (asc < 0) asc += 360;

    const mc = (LST + 90) % 360;

    const houses = [];
    for (let i = 0; i < 12; i++) {
        const cusp = (asc + i * 30) % 360;
        houses.push({ house_number: i + 1, cusp_longitude: Math.round(cusp * 100) / 100, sign: getSign(cusp) });
    }
    return { ascendant: Math.round(asc * 100) / 100, midheaven: Math.round(mc * 100) / 100, houses };
}
```

### שיפורים נדרשים ל-TS
- Add strict types for all parameters and return values
- Extract JD calculation to shared utility (duplicated 3x)
- Add proper timezone handling (not just UTC)
- Consider Swiss Ephemeris for higher accuracy

---

## GEM 2: Hebrew Gematria + Numerology
**מקור:** `base44/functions/calculateNumerologyCompatibility/entry.ts`
**ציון:** 39/50
**יעד:** `src/services/numerology/gematria.ts` + `src/services/numerology/calculations.ts`

### מה עושה
חישוב גימטריה עברית מלא — כולל תמיכה בסופיות, ניקוד, master numbers, ומטריצת תאימות.

### הקוד
```typescript
const GEMATRIA = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200,
  'ש': 300, 'ת': 400
};

const HEBREW_VOWELS = ['א', 'ה', 'ו', 'י', 'ע'];

function cleanHebrewText(text) {
  if (!text) return '';
  return text.replace(/[\u0591-\u05C7]/g, '')  // Remove niqqud
             .replace(/[״׳־]/g, '')             // Remove punctuation
             .replace(/\s+/g, '')               // Remove spaces
             .trim();
}

function calculateGematria(text) {
  let sum = 0;
  for (const char of text) {
    sum += GEMATRIA[char] || 0;
  }
  return sum;
}

function reduceToSingleDigit(num) {
  if (num === 11 || num === 22 || num === 33) return num; // Master numbers
  while (num > 9) {
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
}

function calculateLifePath(birthDate) {
  const [year, month, day] = birthDate.split('-').map(Number);
  return reduceToSingleDigit(
    reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year)
  );
}

function calculateNumerologyNumbers(person) {
  const lifePathNumber = calculateLifePath(person.birthDate);
  const cleanName = cleanHebrewText(person.fullName);
  const destinyNumber = reduceToSingleDigit(calculateGematria(cleanName));
  const vowels = cleanName.split('').filter(c => HEBREW_VOWELS.includes(c)).join('');
  const soulNumber = reduceToSingleDigit(calculateGematria(vowels));

  return { name: person.fullName, life_path: lifePathNumber, destiny: destinyNumber, soul: soulNumber };
}
```

### Compatibility Matrix (12x12)
```typescript
const COMPATIBILITY_MATRIX = {
  1: { 1: 70, 2: 85, 3: 90, 4: 60, 5: 95, 6: 75, 7: 55, 8: 80, 9: 65, 11: 80, 22: 70, 33: 75 },
  2: { 1: 85, 2: 80, 3: 70, 4: 90, 5: 60, 6: 95, 7: 75, 8: 85, 9: 80, 11: 90, 22: 85, 33: 95 },
  // ... (full matrix in source)
};

// Weighted scoring: Life Path 40% + Destiny 30% + Soul 30%
const overallScore = Math.round(lifePathScore * 0.4 + destinyScore * 0.3 + soulScore * 0.3);
```

### שיפורים נדרשים
- Add TypeScript interfaces for Person, NumerologyNumbers, CompatibilityResult
- Move COMPATIBILITY_MATRIX to config file
- Add Personal Year/Month/Day calculations (exist in generateDailyInsight)
- Validate Hebrew input (reject non-Hebrew characters)

---

## GEM 3: Rule Engine — Condition Evaluation
**מקור:** `base44/functions/ruleEngine/entry.ts`
**ציון:** 38/50
**יעד:** `src/services/analysis/rule-engine.ts`

### מה עושה
מנוע חוקים שמחיל כללים מ-DB על features שהתגלו, מחשב confidence, ומייצר תובנות עם provenance.

### הקוד
```typescript
function evaluateCondition(featureValue, operator, conditionValue) {
    const numericFeature = parseFloat(featureValue);
    const numericCondition = parseFloat(conditionValue);

    switch (operator) {
        case 'equals':
            return featureValue == conditionValue || numericFeature === numericCondition;
        case 'not_equals':
            return featureValue != conditionValue;
        case 'greater_than':
            return numericFeature > numericCondition;
        case 'less_than':
            return numericFeature < numericCondition;
        case 'greater_or_equal':
            return numericFeature >= numericCondition;
        case 'less_or_equal':
            return numericFeature <= numericCondition;
        case 'contains':
            return String(featureValue).includes(String(conditionValue));
        case 'in':
            return Array.isArray(conditionValue) && conditionValue.includes(featureValue);
        default:
            return false;
    }
}

// Confidence weighting:
const rawConfidence = q_input * base_confidence * featureConfidence;
const finalConfidence = Math.max(0.85, Math.min(1.0, rawConfidence));

// Synthesis — top 3 by weight*confidence:
const topInsights = insights
    .sort((a, b) => (b.weight * b.confidence) - (a.weight * a.confidence))
    .slice(0, 3);
```

### שיפורים נדרשים
- Strict TypeScript with discriminated union for operators
- Add `between`, `regex`, `starts_with`, `ends_with` operators
- Remove == (loose equality), use === with type coercion utility
- Add Zod validation for rule conditions

---

## GEM 4: Stripe Webhook Handler
**מקור:** `base44/functions/stripeWebhook/entry.ts`
**ציון:** 38/50
**יעד:** `src/app/api/webhooks/stripe/route.ts`

### מה עושה
מטפל ב-4 event types מ-Stripe עם signature verification. מעדכן Subscription + PaymentHistory.

### הקוד
```typescript
// Verify webhook signature
const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

switch (event.type) {
  case 'checkout.session.completed': {
    const session = event.data.object;
    const userId = session.metadata.user_id;
    const planId = session.metadata.plan_id;

    const subData = {
      plan_type: planId,
      status: 'trial',
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      analyses_limit: planId === 'basic' ? 20 : -1,
      analyses_used: 0,
    };
    // Create or update subscription...
    // Record payment history...
    break;
  }
  case 'customer.subscription.updated': { /* update status */ }
  case 'customer.subscription.deleted': { /* mark cancelled */ }
  case 'invoice.payment_failed': { /* record failed payment */ }
}
```

### שיפורים נדרשים
- Move to Next.js API route with proper body parsing
- Add Supabase server client for DB operations
- Add idempotency check (prevent duplicate processing)
- Add logging instead of console.error
- Handle `customer.subscription.trial_will_end` event

---

## GEM 5: forceToString — Robust LLM Response Cleaning
**מקור:** `src/pages/AskQuestion.jsx`
**ציון:** 32/50 (page), but this utility = 🟢
**יעד:** `src/lib/utils/llm-response.ts`

### מה עושה
מטפל בכל מבנה אפשרי שחוזר מ-LLM — string, number, boolean, array, nested object — ומחלץ טקסט שמיש.

### הקוד
```typescript
const forceToString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'כן' : 'לא';

  if (Array.isArray(value)) {
    for (const item of value) {
      const str = forceToString(item, '');
      if (str) return str;
    }
    return fallback;
  }

  if (typeof value === 'object') {
    // Try common field names first
    const keys = ['text', 'value', 'content', 'message', 'data', 'description', 'answer'];
    for (const key of keys) {
      if (value[key] !== undefined) {
        const str = forceToString(value[key], '');
        if (str) return str;
      }
    }
    // Fallback to first key
    const objKeys = Object.keys(value);
    if (objKeys.length > 0) {
      return forceToString(value[objKeys[0]], fallback);
    }
  }

  return fallback;
};

const cleanArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => forceToString(item, '')).filter(Boolean);
};
```

### שיפורים נדרשים
- Add TypeScript overloads with generic return types
- Add `forceToArray`, `forceToNumber` variants
- Unit tests (critical for LLM response handling)

---

## GEM 6: BirthChart — Zodiac Constants + SVG Positioning
**מקור:** `src/components/BirthChart.jsx`
**ציון:** 35/50
**יעד:** `src/lib/constants/astrology.ts` + `src/components/features/astrology/BirthChart/`

### הקוד — Constants (Hebrew zodiac/planets/aspects/houses)
```typescript
const ZODIAC_SIGNS = {
  'Aries': { emoji: '♈', color: '#FF4444', name: 'טלה', element: 'אש' },
  'Taurus': { emoji: '♉', color: '#44FF44', name: 'שור', element: 'אדמה' },
  'Gemini': { emoji: '♊', color: '#FFFF44', name: 'תאומים', element: 'אוויר' },
  'Cancer': { emoji: '♋', color: '#4444FF', name: 'סרטן', element: 'מים' },
  'Leo': { emoji: '♌', color: '#FF8800', name: 'אריה', element: 'אש' },
  'Virgo': { emoji: '♍', color: '#88FF88', name: 'בתולה', element: 'אדמה' },
  'Libra': { emoji: '♎', color: '#FF44FF', name: 'מאזניים', element: 'אוויר' },
  'Scorpio': { emoji: '♏', color: '#880088', name: 'עקרב', element: 'מים' },
  'Sagittarius': { emoji: '♐', color: '#8844FF', name: 'קשת', element: 'אש' },
  'Capricorn': { emoji: '♑', color: '#448888', name: 'גדי', element: 'אדמה' },
  'Aquarius': { emoji: '♒', color: '#44FFFF', name: 'דלי', element: 'אוויר' },
  'Pisces': { emoji: '♓', color: '#4488FF', name: 'דגים', element: 'מים' }
};

const PLANET_SYMBOLS = {
  sun: { symbol: '☉', name: 'שמש', color: '#FFD700', meaning: 'זהות הליבה והיצירתיות' },
  moon: { symbol: '☽', name: 'ירח', color: '#C0C0C0', meaning: 'רגשות ואינטואיציה' },
  // ... all 10 planets with Hebrew names + meanings
};

const HOUSE_MEANINGS = {
  1: 'האני, המסכה החיצונית',
  2: 'כסף, ערכים, רכוש',
  // ... all 12 houses
};
```

### SVG Planet Positioning
```typescript
const getPlanetPosition = (longitude, radius) => {
    const angle = (longitude - 90) * (Math.PI / 180);
    return {
      x: 250 + radius * Math.cos(angle),
      y: 250 + radius * Math.sin(angle)
    };
};
```

---

## GEM 7: useSubscription Hook
**מקור:** `src/components/useSubscription.jsx`
**ציון:** 38/50
**יעד:** `src/hooks/useSubscription.ts`

### מה עושה
Hook אחיד לכל ניהול המנוי: plan info, usage tracking, feature gating, optimistic updates.

### Pattern עיקרי
```typescript
const PLAN_INFO = {
  free: { name: "חינם", analyses: 3, guestProfiles: 1 },
  basic: { name: "בסיסי", analyses: 20, guestProfiles: 3 },
  premium: { name: "פרימיום", analyses: -1, guestProfiles: 10 },  // -1 = unlimited
  enterprise: { name: "ארגוני", analyses: -1, guestProfiles: -1 }
};

// Feature gating
const canUseFeature = (featureName) => {
  const isPremium = ['premium', 'enterprise'].includes(safeSubscription.plan_type);
  if (featureName === 'unlimited_analyses') return isPremium;
  if (featureName === 'provenance') return isPremium;
  if (featureName === 'advanced_insights') return isPremium;
  return hasUsageLeft;
};

// Optimistic update on usage increment
onSuccess: (data) => {
  queryClient.setQueryData(['subscription'], (old) => ({
    ...old,
    analyses_used: data.new_count
  }));
}
```

---

## GEM 8: CachedQuery — Caching Strategy
**מקור:** `src/components/CachedQuery.jsx`
**ציון:** 38/50
**יעד:** `src/lib/query/cached-query.ts`

### הקוד
```typescript
export const CACHE_TIMES = {
  SHORT: 2 * 60 * 1000,      // 2 דקות — נתונים דינמיים
  MEDIUM: 5 * 60 * 1000,     // 5 דקות — נתונים סטנדרטיים
  LONG: 15 * 60 * 1000,      // 15 דקות — נתונים יציבים
  VERY_LONG: 60 * 60 * 1000  // שעה — נתונים כמעט סטטיים
};

// Smart retry — don't retry auth errors
retry: (failureCount, error) => {
  if (error?.message?.includes('Unauthorized') || error?.message?.includes('401')) {
    return false;
  }
  return failureCount < 2;
},
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

// Static data — cache forever
export function useStaticDataQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey, queryFn,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3, retryDelay: 1000,
    ...options
  });
}

// Prefetch with Promise.allSettled (one failure doesn't block others)
const results = await Promise.allSettled(
  criticalQueries.map(query => queryClient.prefetchQuery(query).catch(() => null))
);
```

---

## GEM 9: ExplainableInsight — Provenance Display
**מקור:** `src/components/ExplainableInsight.jsx`
**ציון:** 36/50
**יעד:** `src/components/features/shared/ExplainableInsight/`

### Pattern עיקרי
```typescript
// תובנה עם provenance, confidence, tags, psychological depth
const {
  title, content, insight_type, confidence, weight,
  provenance,          // { source_features, rule_id, sources[] }
  tags,                // personality, career, relationships, etc.
  strengths, challenges, actionable_advice,
  psychological_connection, ancient_wisdom,
  archetype, jungian_profile, career_paths, life_purpose
} = insight;

// Confidence badge
{confidence !== undefined && (
  <Badge>דיוק: {Math.round(confidence * 100)}%</Badge>
)}

// High weight indicator
{weight > 0.85 && (
  <Badge>חשוב מאוד</Badge>
)}
```

### Hebrew Tag Translations
```typescript
const TAG_TRANSLATIONS = {
  personality: "אישיות", career: "קריירה", relationships: "יחסים",
  health: "בריאות", timing: "תזמון", challenge: "אתגר",
  strength: "חוזק", recommendation: "המלצה", spiritual: "רוחניות", creative: "יצירתיות"
};
```

---

## GEM 10: AdvancedErrorBoundary — Auto Recovery
**מקור:** `src/components/AdvancedErrorBoundary.jsx`
**ציון:** 37/50
**יעד:** `src/components/errors/ErrorBoundary.tsx`

### Pattern עיקרי
```typescript
// Track repeated errors within 5-second window
componentDidCatch(error, errorInfo) {
    const now = Date.now();
    const isRepeated = lastError && (now - lastError) < 5000;
    const newCount = isRepeated ? errorCount + 1 : 1;

    // Auto-recover after 3 repeated errors (infinite loop protection)
    if (newCount >= 3) {
        setTimeout(() => {
            this.setState({ hasError: false, error: null, errorCount: 0 });
        }, 1000);
    }
}
```

---

## GEM 11: Animation Presets
**מקור:** `src/components/AdvancedAnimations.jsx`
**ציון:** 37/50
**יעד:** `src/lib/animations/presets.ts`

### הקוד
```typescript
export const animations = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  fadeInUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } },
  slideInRight: { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 100, opacity: 0 } },
  scaleIn: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 } },
  scaleInBounce: { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 15 } },
  staggerContainer: { animate: { transition: { staggerChildren: 0.1 } } },
  staggerItem: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
};

export const transitions = {
  smooth: { duration: 0.3, ease: "easeInOut" },
  spring: { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  slow: { duration: 0.6, ease: "easeInOut" },
  fast: { duration: 0.15, ease: "easeOut" }
};

export const hoverEffects = {
  lift: { whileHover: { y: -4, transition: { duration: 0.2 } } },
  scale: { whileHover: { scale: 1.05, transition: { duration: 0.2 } } },
  glow: { whileHover: { boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)", transition: { duration: 0.3 } } },
};
```

---

## GEM 12: Astrology Interpretation Prompt (v6.0)
**מקור:** `base44/functions/interpretAstrology/entry.ts`
**ציון:** 38/50
**יעד:** `src/services/astrology/prompts/interpretation.ts`

### מה עושה
Prompt engineering מתקדם שמייצר 40-45 תובנות אסטרולוגיות מעמיקות. כולל הפניות לטקסטים קלאסיים (Mary Fortier Shea, Volguine, Hand).

### Structure (key template fragment)
```
# אתה אסטרולוג פסיכולוגי אבולוציוני ברמה עולמית
## נתוני מפת הלידה:
- ☀️ שמש: {sign} בבית {house} ({degree}°)
- 🌙 ירח: {sign} בבית {house}
- ⬆️ אסצנדנט: {rising_sign}
- [all 10 planets with retrograde status]
- [special points: North Node, South Node, Chiron]
- [top 15 aspects sorted by strength]
- [element distribution: Fire/Earth/Air/Water]

## צור 40-45 תובנות:
קבוצת א' — כוכבים אישיים (12 תובנות)
קבוצת ב' — כוכבים חברתיים (8 תובנות)
קבוצת ג' — כוכבים טרנסצנדנטליים (6 תובנות)
קבוצת ד' — אספקטים (10+ תובנות)
קבוצת ה' — יסודות ודפוסים (4+ תובנות)
```

### שיפורים נדרשים
- Extract to template file with variable interpolation
- Add response validation with Zod
- Split into focused prompts (reduce hallucination risk)
- Add rate limiting per user

---

## GEM 13: Onboarding — Barnum Effect Education
**מקור:** `src/pages/Onboarding.jsx` + `src/components/OnboardingFlow.jsx`
**יעד:** `src/components/features/onboarding/`

### Concept (not code — business logic gem)
Step 3 of onboarding teaches users about the Barnum Effect:
- "ניתוחים מבוססים על 2-3+ נקודות מידע ספציפיות שלך"
- "מקורות לטענות, סתירות מזוהות, גיבוי מדעי"
- "פוטנציאלים — לא גורל. רצון חופשי וסביבה משחקים תפקיד מרכזי"

Two mandatory checkboxes before proceeding:
1. User understands potentials ≠ destiny
2. User consents to terms

**Why this is a GEM:** This is ethical AI design. Most mystical apps don't educate users about cognitive biases. This builds trust and sets proper expectations.

---

## GEM 14: Aspect Calculation + Chart Assembly
**מקור:** `base44/functions/calculateSolarReturn/entry.ts` (lines 232-284)
**יעד:** `src/services/astrology/aspects.ts`

### הקוד
```typescript
const aspectDefs = [
    { name: "Conjunction", angle: 0, orb: 8 },
    { name: "Opposition", angle: 180, orb: 8 },
    { name: "Trine", angle: 120, orb: 8 },
    { name: "Square", angle: 90, orb: 7 },
    { name: "Sextile", angle: 60, orb: 6 }
];

// Calculate all planet-to-planet aspects
for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
        let angle = Math.abs(planets[p1].longitude - planets[p2].longitude);
        if (angle > 180) angle = 360 - angle;

        for (const def of aspectDefs) {
            const orb = Math.abs(angle - def.angle);
            if (orb <= def.orb) {
                aspects.push({
                    planet1: p1, planet2: p2, type: def.name,
                    orb: round(orb, 2),
                    strength: round(1 - orb / def.orb, 3)  // Strength = inverse of orb ratio
                });
                break;
            }
        }
    }
}

// Element & Modality distribution
const elements = ['fire', 'earth', 'air', 'water'];
const modalities = ['cardinal', 'fixed', 'mutable'];
for (const planet of Object.values(planets)) {
    const signIndex = Math.floor(planet.longitude / 30);
    elementDist[elements[signIndex % 4]]++;
    modalityDist[modalities[signIndex % 3]]++;
}
```

---

## סיכום GEMs

| # | GEM | Source | Target | Priority |
|---|-----|--------|--------|----------|
| 1 | Solar Return VSOP87 + Binary Search | calculateSolarReturn | services/astrology/solar-return.ts | 🔴 Critical |
| 2 | Hebrew Gematria + Numerology | calculateNumerologyCompatibility | services/numerology/ | 🔴 Critical |
| 3 | Rule Engine | ruleEngine | services/analysis/rule-engine.ts | 🟡 High |
| 4 | Stripe Webhook | stripeWebhook | app/api/webhooks/stripe/route.ts | 🔴 Critical |
| 5 | forceToString (LLM response) | AskQuestion.jsx | lib/utils/llm-response.ts | 🟡 High |
| 6 | Zodiac Constants + SVG Positioning | BirthChart.jsx | lib/constants/astrology.ts | 🟡 High |
| 7 | useSubscription Hook | useSubscription.jsx | hooks/useSubscription.ts | 🔴 Critical |
| 8 | CachedQuery Strategy | CachedQuery.jsx | lib/query/cached-query.ts | 🟡 High |
| 9 | ExplainableInsight Pattern | ExplainableInsight.jsx | components/features/shared/ | 🟡 High |
| 10 | Error Boundary Auto-Recovery | AdvancedErrorBoundary.jsx | components/errors/ | 🟢 Medium |
| 11 | Animation Presets | AdvancedAnimations.jsx | lib/animations/presets.ts | 🟢 Medium |
| 12 | Astrology Prompt v6.0 | interpretAstrology | services/astrology/prompts/ | 🔴 Critical |
| 13 | Barnum Effect Education | Onboarding | components/features/onboarding/ | 🟡 High |
| 14 | Aspect Calculation | calculateSolarReturn | services/astrology/aspects.ts | 🟡 High |

---

> **שלב 2 הושלם.** מחכה לאישורך לפני שממשיך לשלב 3: Architecture.
