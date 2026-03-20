-- MystiQor — DB Helper Functions
-- increment_usage: atomic usage counter with limit enforcement
-- reset_monthly_usage: cron-triggered monthly reset
-- calculate_profile_completion: score calculator (0-100)

-- ============================================================
-- reset_monthly_usage — איפוס שימוש חודשי (triggered by cron)
-- ============================================================
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET analyses_used = 0,
      guest_profiles_used = 0,
      last_reset_date = now(),
      updated_at = now()
  WHERE last_reset_date < date_trunc('month', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- increment_usage — הגדלת מונה שימוש עם בדיקת מגבלה
-- ============================================================
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_sub subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM subscriptions WHERE user_id = p_user_id;

  IF v_sub IS NULL THEN
    RAISE EXCEPTION 'No subscription found';
  END IF;

  IF v_sub.analyses_limit != -1 AND v_sub.analyses_used >= v_sub.analyses_limit THEN
    RAISE EXCEPTION 'Usage limit reached';
  END IF;

  UPDATE subscriptions
  SET analyses_used = analyses_used + 1, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_count', v_sub.analyses_used + 1, 'limit', v_sub.analyses_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- calculate_profile_completion — חישוב ציון השלמת פרופיל (0-100)
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_score INTEGER := 0;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  IF v_profile IS NULL THEN RETURN 0; END IF;

  IF v_profile.full_name IS NOT NULL THEN v_score := v_score + 15; END IF;
  IF v_profile.birth_date IS NOT NULL THEN v_score := v_score + 15; END IF;
  IF v_profile.birth_time IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_profile.birth_place IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_profile.gender IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF array_length(v_profile.disciplines, 1) > 0 THEN v_score := v_score + 15; END IF;
  IF array_length(v_profile.focus_areas, 1) > 0 THEN v_score := v_score + 15; END IF;
  IF array_length(v_profile.personal_goals, 1) > 0 THEN v_score := v_score + 15; END IF;

  UPDATE profiles SET profile_completion_score = v_score, updated_at = now() WHERE id = p_user_id;
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
