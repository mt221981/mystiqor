export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          input_data: Json
          results: Json
          summary: string | null
          tool_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          input_data?: Json
          results?: Json
          summary?: string | null
          tool_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          input_data?: Json
          results?: Json
          summary?: string | null
          tool_type?: string
          user_id?: string
        }
        Relationships: []
      }
      analysis_features: {
        Row: {
          analysis_id: string
          confidence: number | null
          created_at: string | null
          feature_key: string
          feature_value: string | null
          id: string
          metadata: Json | null
          tool_type: string
        }
        Insert: {
          analysis_id: string
          confidence?: number | null
          created_at?: string | null
          feature_key: string
          feature_value?: string | null
          id?: string
          metadata?: Json | null
          tool_type: string
        }
        Update: {
          analysis_id?: string
          confidence?: number | null
          created_at?: string | null
          feature_key?: string
          feature_value?: string | null
          id?: string
          metadata?: Json | null
          tool_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_features_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          page_url: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          excerpt: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
        }
        Insert: {
          author: string
          category: string
          content: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      coaching_journeys: {
        Row: {
          ai_insights: string | null
          created_at: string | null
          description: string | null
          focus_area: string | null
          id: string
          journey_type: string | null
          linked_goal_id: string | null
          status: string | null
          steps: Json
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          created_at?: string | null
          description?: string | null
          focus_area?: string | null
          id?: string
          journey_type?: string | null
          linked_goal_id?: string | null
          status?: string | null
          steps?: Json
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          created_at?: string | null
          description?: string | null
          focus_area?: string | null
          id?: string
          journey_type?: string | null
          linked_goal_id?: string | null
          status?: string | null
          steps?: Json
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_journeys_linked_goal_id_fkey"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          title: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          title?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_insights: {
        Row: {
          actionable_tip: string | null
          confidence: number | null
          content: string
          created_at: string | null
          data_sources: Json | null
          focus_area: string | null
          id: string
          insight_date: string | null
          mood_type: string | null
          recurring_themes: Json | null
          tarot: Json | null
          title: string
          user_feedback: Json | null
          user_id: string
        }
        Insert: {
          actionable_tip?: string | null
          confidence?: number | null
          content: string
          created_at?: string | null
          data_sources?: Json | null
          focus_area?: string | null
          id?: string
          insight_date?: string | null
          mood_type?: string | null
          recurring_themes?: Json | null
          tarot?: Json | null
          title: string
          user_feedback?: Json | null
          user_id: string
        }
        Update: {
          actionable_tip?: string | null
          confidence?: number | null
          content?: string
          created_at?: string | null
          data_sources?: Json | null
          focus_area?: string | null
          id?: string
          insight_date?: string | null
          mood_type?: string | null
          recurring_themes?: Json | null
          tarot?: Json | null
          title?: string
          user_feedback?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      dreams: {
        Row: {
          ai_interpretation: string | null
          created_at: string | null
          description: string
          dream_date: string | null
          dreamscape_url: string | null
          emotions: string[] | null
          id: string
          is_lucid: boolean | null
          is_recurring: boolean | null
          location: string | null
          mood_after: string | null
          people: string[] | null
          psychological_themes: string[] | null
          symbol_meanings: Json | null
          symbols: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          ai_interpretation?: string | null
          created_at?: string | null
          description: string
          dream_date?: string | null
          dreamscape_url?: string | null
          emotions?: string[] | null
          id?: string
          is_lucid?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          mood_after?: string | null
          people?: string[] | null
          psychological_themes?: string[] | null
          symbol_meanings?: Json | null
          symbols?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          ai_interpretation?: string | null
          created_at?: string | null
          description?: string
          dream_date?: string | null
          dreamscape_url?: string | null
          emotions?: string[] | null
          id?: string
          is_lucid?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          mood_after?: string | null
          people?: string[] | null
          psychological_themes?: string[] | null
          symbol_meanings?: Json | null
          symbols?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          action_plan: Json | null
          ai_summary: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          preferred_tools: string[] | null
          progress: number | null
          recommendations: Json | null
          status: string
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_plan?: Json | null
          ai_summary?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          preferred_tools?: string[] | null
          progress?: number | null
          recommendations?: Json | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_plan?: Json | null
          ai_summary?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          preferred_tools?: string[] | null
          progress?: number | null
          recommendations?: Json | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      guest_profiles: {
        Row: {
          birth_date: string
          birth_place: string | null
          birth_time: string | null
          created_at: string | null
          full_name: string
          id: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          birth_date: string
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai_insights: string | null
          content: string
          created_at: string | null
          energy_level: number | null
          goals: string[] | null
          gratitude: string[] | null
          id: string
          mood: string | null
          mood_score: number | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          content: string
          created_at?: string | null
          energy_level?: number | null
          goals?: string[] | null
          gratitude?: string[] | null
          id?: string
          mood?: string | null
          mood_score?: number | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          content?: string
          created_at?: string | null
          energy_level?: number | null
          goals?: string[] | null
          gratitude?: string[] | null
          id?: string
          mood?: string | null
          mood_score?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          discipline: string
          id: string
          last_studied: string | null
          level: string | null
          quiz_score: number | null
          study_time_minutes: number | null
          topic: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          discipline: string
          id?: string
          last_studied?: string | null
          level?: string | null
          quiz_score?: number | null
          study_time_minutes?: number | null
          topic: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          discipline?: string
          id?: string
          last_studied?: string | null
          level?: string | null
          quiz_score?: number | null
          study_time_minutes?: number | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          activities: string[] | null
          ai_analysis: Json | null
          created_at: string | null
          energy_level: number | null
          gratitude: string[] | null
          id: string
          mood: string
          mood_score: number
          notes: string | null
          sleep_quality: number | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          activities?: string[] | null
          ai_analysis?: Json | null
          created_at?: string | null
          energy_level?: number | null
          gratitude?: string[] | null
          id?: string
          mood: string
          mood_score: number
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          activities?: string[] | null
          ai_analysis?: Json | null
          created_at?: string | null
          energy_level?: number | null
          gratitude?: string[] | null
          id?: string
          mood?: string
          mood_score?: number
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_message: string | null
          id: string
          status: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          status: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          status?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      processed_webhook_events: {
        Row: {
          event_type: string
          id: string
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_suggestions_enabled: boolean | null
          birth_date: string
          birth_place: string | null
          birth_time: string | null
          created_at: string | null
          disciplines: string[] | null
          focus_areas: string[] | null
          full_name: string
          gender: string | null
          id: string
          latitude: number | null
          longitude: number | null
          onboarding_completed: boolean | null
          personal_goals: string[] | null
          profile_completion_score: number | null
          timezone_name: string | null
          updated_at: string | null
        }
        Insert: {
          ai_suggestions_enabled?: boolean | null
          birth_date: string
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string | null
          disciplines?: string[] | null
          focus_areas?: string[] | null
          full_name: string
          gender?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          onboarding_completed?: boolean | null
          personal_goals?: string[] | null
          profile_completion_score?: number | null
          timezone_name?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_suggestions_enabled?: boolean | null
          birth_date?: string
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string | null
          disciplines?: string[] | null
          focus_areas?: string[] | null
          full_name?: string
          gender?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          onboarding_completed?: boolean | null
          personal_goals?: string[] | null
          profile_completion_score?: number | null
          timezone_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_email: string
          referrer_id: string
          reward_analyses: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_email: string
          referrer_id: string
          reward_analyses?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_email?: string
          referrer_id?: string
          reward_analyses?: number | null
          status?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          id: string
          is_recurring: boolean | null
          message: string
          recurrence_rule: string | null
          scheduled_date: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_recurring?: boolean | null
          message: string
          recurrence_rule?: string | null
          scheduled_date: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_recurring?: boolean | null
          message?: string
          recurrence_rule?: string | null
          scheduled_date?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      rulebook: {
        Row: {
          base_confidence: number | null
          condition: Json
          created_at: string | null
          id: string
          insight_template: Json
          is_active: boolean | null
          rule_id: string
          sources: string[] | null
          tags: string[] | null
          tool_type: string
          weight: number | null
        }
        Insert: {
          base_confidence?: number | null
          condition: Json
          created_at?: string | null
          id?: string
          insight_template: Json
          is_active?: boolean | null
          rule_id: string
          sources?: string[] | null
          tags?: string[] | null
          tool_type: string
          weight?: number | null
        }
        Update: {
          base_confidence?: number | null
          condition?: Json
          created_at?: string | null
          id?: string
          insight_template?: Json
          is_active?: boolean | null
          rule_id?: string
          sources?: string[] | null
          tags?: string[] | null
          tool_type?: string
          weight?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          analyses_limit: number
          analyses_used: number
          auto_renew: boolean | null
          cancel_at_period_end: boolean | null
          created_at: string | null
          end_date: string | null
          guest_profiles_limit: number
          guest_profiles_used: number
          id: string
          last_reset_date: string | null
          plan_type: string
          start_date: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analyses_limit?: number
          analyses_used?: number
          auto_renew?: boolean | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          end_date?: string | null
          guest_profiles_limit?: number
          guest_profiles_used?: number
          id?: string
          last_reset_date?: string | null
          plan_type?: string
          start_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analyses_limit?: number
          analyses_used?: number
          auto_renew?: boolean | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          end_date?: string | null
          guest_profiles_limit?: number
          guest_profiles_used?: number
          id?: string
          last_reset_date?: string | null
          plan_type?: string
          start_date?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tarot_cards: {
        Row: {
          arcana: string
          id: number
          image_url: string | null
          keywords: string[] | null
          meaning_reversed: string
          meaning_upright: string
          name_en: string
          name_he: string
          number: number | null
          suit: string | null
        }
        Insert: {
          arcana: string
          id?: number
          image_url?: string | null
          keywords?: string[] | null
          meaning_reversed: string
          meaning_upright: string
          name_en: string
          name_he: string
          number?: number | null
          suit?: string | null
        }
        Update: {
          arcana?: string
          id?: number
          image_url?: string | null
          keywords?: string[] | null
          meaning_reversed?: string
          meaning_upright?: string
          name_en?: string
          name_he?: string
          number?: number | null
          suit?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completion: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_usage: { Args: { p_user_id: string }; Returns: Json }
      reset_monthly_usage: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
