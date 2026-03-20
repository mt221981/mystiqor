/**
 * טיפוסי בסיס הנתונים של Supabase
 * מייצג את כל 20 הטבלאות במערכת - placeholder עד שנייצר אוטומטית מ-Supabase CLI
 */

/** סוגי כלי ניתוח */
type ToolType =
  | 'numerology'
  | 'astrology'
  | 'palmistry'
  | 'graphology'
  | 'tarot'
  | 'drawing'
  | 'dream'
  | 'career'
  | 'compatibility'
  | 'synastry'
  | 'solar_return'
  | 'transits'
  | 'human_design'
  | 'personality'
  | 'document'
  | 'question'
  | 'relationship'
  | 'synthesis';

/** סוגי תוכנית מנוי */
type PlanType = 'free' | 'basic' | 'premium' | 'enterprise';

/** סטטוס מנוי */
type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due';

/** סוג מגדר */
type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

/** קטגוריית מטרה */
type GoalCategory =
  | 'career'
  | 'relationships'
  | 'personal_growth'
  | 'health'
  | 'spirituality'
  | 'creativity'
  | 'finance'
  | 'other';

/** סטטוס מטרה */
type GoalStatus = 'active' | 'in_progress' | 'completed';

/** סוג מצב רוח לתובנה */
type InsightMoodType = 'inspiring' | 'reflective' | 'empowering' | 'cautionary' | 'celebratory';

/** סוג מסע אימון */
type JourneyType = 'daily' | 'weekly' | 'custom';

/** סטטוס מסע */
type JourneyStatus = 'active' | 'completed' | 'paused';

/** תפקיד בשיחה */
type MessageRole = 'user' | 'assistant';

/** סטטוס תזכורת */
type ReminderStatus = 'pending' | 'sent' | 'dismissed';

/** סטטוס תשלום */
type PaymentStatus = 'succeeded' | 'failed' | 'refunded';

/** רמת לימוד */
type LearningLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** סטטוס הפניה */
type ReferralStatus = 'pending' | 'completed' | 'rewarded';

/** סוג ארקנה (טארוט) */
type Arcana = 'major' | 'minor';

/** סוג חפיסה (טארוט) */
type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';

/** מבנה JSON */
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    /** גרסת PostgREST — נדרש ע"י @supabase/supabase-js v2.99+ לפתרון overloads */
    PostgrestVersion: '12';
    Tables: {
      /** פרופילי משתמשים - מידע אישי ותצורה */
      profiles: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string;
          birth_time: string | null;
          birth_place: string | null;
          latitude: number | null;
          longitude: number | null;
          timezone_offset: number;
          gender: Gender | null;
          disciplines: string[];
          focus_areas: string[];
          personal_goals: string[];
          ai_suggestions_enabled: boolean;
          onboarding_completed: boolean;
          profile_completion_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          birth_date: string;
          birth_time?: string | null;
          birth_place?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          timezone_offset?: number;
          gender?: Gender | null;
          disciplines?: string[];
          focus_areas?: string[];
          personal_goals?: string[];
          ai_suggestions_enabled?: boolean;
          onboarding_completed?: boolean;
          profile_completion_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string;
          birth_time?: string | null;
          birth_place?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          timezone_offset?: number;
          gender?: Gender | null;
          disciplines?: string[];
          focus_areas?: string[];
          personal_goals?: string[];
          ai_suggestions_enabled?: boolean;
          onboarding_completed?: boolean;
          profile_completion_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: never[];
      };

      /** מנויים - תוכנית, מגבלות שימוש, וחיבור ל-Stripe */
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: PlanType;
          status: SubscriptionStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          analyses_limit: number;
          analyses_used: number;
          guest_profiles_limit: number;
          guest_profiles_used: number;
          trial_end_date: string | null;
          start_date: string;
          end_date: string | null;
          cancel_at_period_end: boolean;
          auto_renew: boolean;
          last_reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: PlanType;
          status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          analyses_limit?: number;
          analyses_used?: number;
          guest_profiles_limit?: number;
          guest_profiles_used?: number;
          trial_end_date?: string | null;
          start_date?: string;
          end_date?: string | null;
          cancel_at_period_end?: boolean;
          auto_renew?: boolean;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: PlanType;
          status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          analyses_limit?: number;
          analyses_used?: number;
          guest_profiles_limit?: number;
          guest_profiles_used?: number;
          trial_end_date?: string | null;
          start_date?: string;
          end_date?: string | null;
          cancel_at_period_end?: boolean;
          auto_renew?: boolean;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: never[];
      };

      /** ניתוחים - תוצאות כלי הניתוח השונים */
      analyses: {
        Row: {
          id: string;
          user_id: string;
          tool_type: ToolType;
          input_data: Json;
          results: Json;
          summary: string | null;
          confidence_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_type: ToolType;
          input_data?: Json;
          results?: Json;
          summary?: string | null;
          confidence_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_type?: ToolType;
          input_data?: Json;
          results?: Json;
          summary?: string | null;
          confidence_score?: number | null;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** תכונות ניתוח - מאפיינים שחולצו מניתוח */
      analysis_features: {
        Row: {
          id: string;
          analysis_id: string;
          tool_type: string;
          feature_key: string;
          feature_value: string | null;
          confidence: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          tool_type: string;
          feature_key: string;
          feature_value?: string | null;
          confidence?: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          tool_type?: string;
          feature_key?: string;
          feature_value?: string | null;
          confidence?: number;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** מטרות - יעדים אישיים של המשתמש */
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: GoalCategory;
          status: GoalStatus;
          progress: number;
          target_date: string | null;
          preferred_tools: string[];
          action_plan: Json;
          ai_summary: string | null;
          recommendations: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: GoalCategory;
          status?: GoalStatus;
          progress?: number;
          target_date?: string | null;
          preferred_tools?: string[];
          action_plan?: Json;
          ai_summary?: string | null;
          recommendations?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: GoalCategory;
          status?: GoalStatus;
          progress?: number;
          target_date?: string | null;
          preferred_tools?: string[];
          action_plan?: Json;
          ai_summary?: string | null;
          recommendations?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: never[];
      };

      /** רשומות מצב רוח - מעקב יומי אחר מצב נפשי */
      mood_entries: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          mood_score: number;
          energy_level: number | null;
          stress_level: number | null;
          sleep_quality: number | null;
          notes: string | null;
          activities: string[];
          gratitude: string[];
          ai_analysis: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          mood_score: number;
          energy_level?: number | null;
          stress_level?: number | null;
          sleep_quality?: number | null;
          notes?: string | null;
          activities?: string[];
          gratitude?: string[];
          ai_analysis?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: string;
          mood_score?: number;
          energy_level?: number | null;
          stress_level?: number | null;
          sleep_quality?: number | null;
          notes?: string | null;
          activities?: string[];
          gratitude?: string[];
          ai_analysis?: Json | null;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** רשומות יומן - כתיבה אישית רפלקטיבית */
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          mood: string | null;
          mood_score: number | null;
          energy_level: number | null;
          gratitude: string[];
          goals: string[];
          ai_insights: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content: string;
          mood?: string | null;
          mood_score?: number | null;
          energy_level?: number | null;
          gratitude?: string[];
          goals?: string[];
          ai_insights?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          content?: string;
          mood?: string | null;
          mood_score?: number | null;
          energy_level?: number | null;
          gratitude?: string[];
          goals?: string[];
          ai_insights?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: never[];
      };

      /** תובנות יומיות - תובנות מותאמות אישית שנוצרות מדי יום */
      daily_insights: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          actionable_tip: string | null;
          mood_type: InsightMoodType | null;
          focus_area: string | null;
          confidence: number | null;
          tarot: Json | null;
          data_sources: Json | null;
          recurring_themes: Json;
          user_feedback: Json | null;
          insight_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          actionable_tip?: string | null;
          mood_type?: InsightMoodType | null;
          focus_area?: string | null;
          confidence?: number | null;
          tarot?: Json | null;
          data_sources?: Json | null;
          recurring_themes?: Json;
          user_feedback?: Json | null;
          insight_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          actionable_tip?: string | null;
          mood_type?: InsightMoodType | null;
          focus_area?: string | null;
          confidence?: number | null;
          tarot?: Json | null;
          data_sources?: Json | null;
          recurring_themes?: Json;
          user_feedback?: Json | null;
          insight_date?: string;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** חלומות - מעקב וניתוח חלומות */
      dreams: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          dream_date: string;
          emotions: string[];
          symbols: string[];
          people: string[];
          location: string | null;
          mood_after: string | null;
          is_recurring: boolean;
          is_lucid: boolean;
          dreamscape_url: string | null;
          ai_interpretation: string | null;
          psychological_themes: string[];
          symbol_meanings: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          dream_date?: string;
          emotions?: string[];
          symbols?: string[];
          people?: string[];
          location?: string | null;
          mood_after?: string | null;
          is_recurring?: boolean;
          is_lucid?: boolean;
          dreamscape_url?: string | null;
          ai_interpretation?: string | null;
          psychological_themes?: string[];
          symbol_meanings?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          dream_date?: string;
          emotions?: string[];
          symbols?: string[];
          people?: string[];
          location?: string | null;
          mood_after?: string | null;
          is_recurring?: boolean;
          is_lucid?: boolean;
          dreamscape_url?: string | null;
          ai_interpretation?: string | null;
          psychological_themes?: string[];
          symbol_meanings?: Json;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** מסעות אימון - תהליכי ליווי אישי מובנים */
      coaching_journeys: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          focus_area: string | null;
          journey_type: JourneyType;
          steps: Json;
          tags: string[];
          ai_insights: string | null;
          linked_goal_id: string | null;
          status: JourneyStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          focus_area?: string | null;
          journey_type?: JourneyType;
          steps?: Json;
          tags?: string[];
          ai_insights?: string | null;
          linked_goal_id?: string | null;
          status?: JourneyStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          focus_area?: string | null;
          journey_type?: JourneyType;
          steps?: Json;
          tags?: string[];
          ai_insights?: string | null;
          linked_goal_id?: string | null;
          status?: JourneyStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: never[];
      };

      /** הודעות אימון - שיחות עם המאמן האישי */
      coaching_messages: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string;
          role?: MessageRole;
          content?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** תזכורות - התראות מתוזמנות למשתמש */
      reminders: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          message: string;
          scheduled_date: string;
          status: ReminderStatus;
          is_recurring: boolean;
          recurrence_rule: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          message: string;
          scheduled_date: string;
          status?: ReminderStatus;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          message?: string;
          scheduled_date?: string;
          status?: ReminderStatus;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** היסטוריית תשלומים - רשומות תשלום מ-Stripe */
      payment_history: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string | null;
          amount: number;
          currency: string;
          status: PaymentStatus;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_id?: string | null;
          amount: number;
          currency?: string;
          status: PaymentStatus;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_id?: string | null;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** פרופילי אורחים - אנשים קשורים לניתוח */
      guest_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          birth_date: string;
          birth_time: string | null;
          birth_place: string | null;
          relationship: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          birth_date: string;
          birth_time?: string | null;
          birth_place?: string | null;
          relationship?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          birth_date?: string;
          birth_time?: string | null;
          birth_place?: string | null;
          relationship?: string | null;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** התקדמות למידה - מעקב אחר לימוד תחומים */
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          discipline: string;
          level: LearningLevel;
          topic: string;
          completed: boolean;
          quiz_score: number | null;
          study_time_minutes: number;
          last_studied: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          discipline: string;
          level?: LearningLevel;
          topic: string;
          completed?: boolean;
          quiz_score?: number | null;
          study_time_minutes?: number;
          last_studied?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          discipline?: string;
          level?: LearningLevel;
          topic?: string;
          completed?: boolean;
          quiz_score?: number | null;
          study_time_minutes?: number;
          last_studied?: string | null;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** הפניות - תוכנית הפניית חברים */
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_email: string;
          referral_code: string;
          status: ReferralStatus;
          reward_analyses: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_email: string;
          referral_code: string;
          status?: ReferralStatus;
          reward_analyses?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_email?: string;
          referral_code?: string;
          status?: ReferralStatus;
          reward_analyses?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: never[];
      };

      /** ספר כללים - כללים להפקת תובנות אוטומטיות */
      rulebook: {
        Row: {
          id: string;
          tool_type: string;
          rule_id: string;
          condition: Json;
          insight_template: Json;
          weight: number;
          base_confidence: number;
          sources: string[];
          tags: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_type: string;
          rule_id: string;
          condition: Json;
          insight_template: Json;
          weight?: number;
          base_confidence?: number;
          sources?: string[];
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tool_type?: string;
          rule_id?: string;
          condition?: Json;
          insight_template?: Json;
          weight?: number;
          base_confidence?: number;
          sources?: string[];
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: never[];
      };

      /** קלפי טארוט - מידע סטטי על קלפים */
      tarot_cards: {
        Row: {
          id: number;
          name_en: string;
          name_he: string;
          arcana: Arcana;
          suit: TarotSuit | null;
          number: number | null;
          meaning_upright: string;
          meaning_reversed: string;
          keywords: string[];
          image_url: string | null;
        };
        Insert: {
          id?: number;
          name_en: string;
          name_he: string;
          arcana: Arcana;
          suit?: TarotSuit | null;
          number?: number | null;
          meaning_upright: string;
          meaning_reversed: string;
          keywords?: string[];
          image_url?: string | null;
        };
        Update: {
          id?: number;
          name_en?: string;
          name_he?: string;
          arcana?: Arcana;
          suit?: TarotSuit | null;
          number?: number | null;
          meaning_upright?: string;
          meaning_reversed?: string;
          keywords?: string[];
          image_url?: string | null;
        };
        Relationships: never[];
      };

      /** פוסטים בבלוג - תוכן שיווקי ולימודי */
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          author: string;
          category: string;
          tags: string[];
          read_time_minutes: number;
          is_published: boolean;
          published_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          author: string;
          category: string;
          tags?: string[];
          read_time_minutes?: number;
          is_published?: boolean;
          published_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          author?: string;
          category?: string;
          tags?: string[];
          read_time_minutes?: number;
          is_published?: boolean;
          published_at?: string;
        };
        Relationships: never[];
      };

      /** אירועי אנליטיקס - מעקב שימוש ואירועים במערכת */
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          event_data: Json;
          page_url: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          event_data?: Json;
          page_url?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          event_data?: Json;
          page_url?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Relationships: never[];
      };
    };

    Views: Record<string, never>;

    Functions: {
      /** איפוס שימוש חודשי */
      reset_monthly_usage: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      /** הגדלת מונה שימוש עם בדיקת מגבלה */
      increment_usage: {
        Args: { p_user_id: string };
        Returns: Json;
      };
      /** חישוב ציון השלמת פרופיל */
      calculate_profile_completion: {
        Args: { p_user_id: string };
        Returns: number;
      };
    };

    Enums: Record<string, never>;

    CompositeTypes: Record<string, never>;
  };
}

/** טיפוס עזר - שורת טבלה לפי שם */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** טיפוס עזר - הוספה לטבלה לפי שם */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** טיפוס עזר - עדכון טבלה לפי שם */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
