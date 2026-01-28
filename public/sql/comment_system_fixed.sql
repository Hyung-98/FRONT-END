-- =========================================================
-- Supabase Comment System - Production Ready (Fixed)
-- =========================================================
-- Version: 1.0.1
-- Description: 댓글, 대댓글, 반응, 신고, Rate Limiting 시스템
-- Requirements: PostgreSQL 14+, Supabase, pg_cron extension
-- =========================================================

-- =========================================================
-- 0) Extensions
-- =========================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =========================================================
-- 1) ENUM Types (안전 생성)
-- =========================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_status') THEN
    CREATE TYPE public.comment_status AS ENUM ('published','pending','hidden','blocked');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason') THEN
    CREATE TYPE public.report_reason AS ENUM (
      'spam','offensive','harassment','misinformation','violence','hate_speech','other'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
    CREATE TYPE public.report_status AS ENUM ('pending','reviewing','resolved','dismissed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reaction_type') THEN
    CREATE TYPE public.reaction_type AS ENUM ('like','dislike');
  END IF;
END $$;

-- =========================================================
-- 2) Profiles 테이블 (role 컬럼 안전 추가)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- role 컬럼 및 제약조건 안전 추가
DO $$ 
BEGIN
  -- role 컬럼 존재 확인 및 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
  END IF;
  
  -- 제약조건 추가 (이미 있으면 무시)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user','moderator','admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =========================================================
-- 3) Core Tables
-- =========================================================

-- 3-1) Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  status public.comment_status NOT NULL DEFAULT 'published',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_reason TEXT,
  author_ip INET,
  user_agent TEXT,
  spam_score NUMERIC(3,2) DEFAULT 0 CHECK (spam_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_reply CHECK (id IS DISTINCT FROM parent_id)
);

CREATE INDEX IF NOT EXISTS idx_comments_post_created_pub
  ON public.comments (post_id, created_at DESC)
  WHERE is_deleted = FALSE AND status = 'published';

CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON public.comments (parent_id)
  WHERE parent_id IS NOT NULL AND is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_comments_author
  ON public.comments (author_id)
  WHERE author_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comments_status_nonpub
  ON public.comments (status)
  WHERE status != 'published';

CREATE INDEX IF NOT EXISTS idx_comments_spam
  ON public.comments (spam_score)
  WHERE spam_score > 0.5;

-- updated_at 트리거
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_comments_updated_at ON public.comments;
CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3-2) Reactions
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type public.reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.comment_reactions(user_id);

-- 3-3) Reports
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason public.report_reason NOT NULL,
  description TEXT,
  status public.report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_pending
  ON public.comment_reports(status, created_at DESC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_reports_comment
  ON public.comment_reports(comment_id);

-- 3-4) Rate Limit Events
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id BIGSERIAL PRIMARY KEY,
  event_key TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_ip INET,
  fingerprint TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key_time
  ON public.rate_limit_events(event_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_actor
  ON public.rate_limit_events(actor_id, event_key, created_at DESC)
  WHERE actor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rate_limit_expires
  ON public.rate_limit_events(expires_at);

-- 3-5) Edit History
CREATE TABLE IF NOT EXISTS public.comment_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edit_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edit_history_comment_time
  ON public.comment_edit_history(comment_id, created_at DESC);

-- 3-6) Spam Patterns
CREATE TABLE IF NOT EXISTS public.spam_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('keyword','regex','url')),
  pattern_value TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pattern_type, pattern_value)
);

CREATE INDEX IF NOT EXISTS idx_spam_patterns_active
  ON public.spam_patterns(is_active);

-- =========================================================
-- 4) Aggregation Views (정합성 보장)
-- =========================================================

CREATE OR REPLACE VIEW public.comment_reaction_counts AS
SELECT
  comment_id,
  COUNT(*) FILTER (WHERE reaction_type = 'like') AS like_count,
  COUNT(*) FILTER (WHERE reaction_type = 'dislike') AS dislike_count,
  COUNT(*) AS total_reactions
FROM public.comment_reactions
GROUP BY comment_id;

CREATE OR REPLACE VIEW public.comment_reply_counts AS
SELECT
  parent_id,
  COUNT(*) AS reply_count
FROM public.comments
WHERE parent_id IS NOT NULL
  AND is_deleted = FALSE
  AND status = 'published'
GROUP BY parent_id;

CREATE OR REPLACE VIEW public.comments_with_stats AS
SELECT
  c.*,
  COALESCE(rc.like_count, 0) AS like_count,
  COALESCE(rc.dislike_count, 0) AS dislike_count,
  COALESCE(rpc.reply_count, 0) AS reply_count,
  CASE
    WHEN p.id IS NULL THEN '탈퇴한 사용자'
    ELSE COALESCE(NULLIF(TRIM(p.display_name), ''), '회원')
  END AS author_name,
  p.avatar_url AS author_avatar_url
FROM public.comments c
LEFT JOIN public.comment_reaction_counts rc ON c.id = rc.comment_id
LEFT JOIN public.comment_reply_counts rpc ON c.id = rpc.parent_id
LEFT JOIN public.profiles p ON c.author_id = p.id;

-- =========================================================
-- 5) Authorization Helper Functions
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin','moderator')
  );
$$;

-- =========================================================
-- 6) Rate Limit Function
-- =========================================================

CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit(
  p_event_key TEXT,
  p_window_seconds INTEGER,
  p_max_attempts INTEGER,
  p_actor_id UUID DEFAULT NULL,
  p_actor_ip INET DEFAULT NULL,
  p_fingerprint TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_actor_id UUID := COALESCE(p_actor_id, auth.uid());
  v_window_start TIMESTAMPTZ := NOW() - (p_window_seconds || ' seconds')::INTERVAL;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.rate_limit_events
  WHERE event_key = p_event_key
    AND created_at > v_window_start
    AND (
      (v_actor_id IS NOT NULL AND actor_id = v_actor_id)
      OR (p_actor_ip IS NOT NULL AND actor_ip = p_actor_ip)
      OR (p_fingerprint IS NOT NULL AND fingerprint = p_fingerprint)
    );

  IF v_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.rate_limit_events(event_key, actor_id, actor_ip, fingerprint)
  VALUES (p_event_key, v_actor_id, p_actor_ip, p_fingerprint);

  RETURN TRUE;
END $$;

-- =========================================================
-- 7) Spam Score Calculation
-- =========================================================

CREATE OR REPLACE FUNCTION public.calculate_spam_score(
  p_content TEXT,
  p_author_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score NUMERIC := 0;
  v_pattern RECORD;
  v_recent_count INTEGER;
BEGIN
  FOR v_pattern IN
    SELECT pattern_value, severity
    FROM public.spam_patterns
    WHERE is_active = TRUE
  LOOP
    IF p_content ~* v_pattern.pattern_value THEN
      v_score := v_score + (v_pattern.severity * 0.1);
    END IF;
  END LOOP;

  SELECT COUNT(*) INTO v_recent_count
  FROM public.comments
  WHERE author_id = p_author_id
    AND content = p_content
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_count > 2 THEN
    v_score := v_score + 0.4;
  END IF;

  RETURN LEAST(v_score, 1.0);
END $$;

-- =========================================================
-- 8) RPC: Create Comment
-- =========================================================

CREATE OR REPLACE FUNCTION public.create_comment(
  p_post_id UUID,
  p_parent_id UUID DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_actor_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_fingerprint TEXT DEFAULT NULL
) RETURNS public.comments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_spam_score NUMERIC;
  v_initial_status public.comment_status;
  v_result public.comments;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT public.check_and_record_rate_limit('comment:create', 60, 5, v_user_id, p_actor_ip, p_fingerprint) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  IF p_content IS NULL OR char_length(trim(p_content)) < 1 THEN
    RAISE EXCEPTION 'Comment content is required';
  END IF;

  IF char_length(p_content) > 2000 THEN
    RAISE EXCEPTION 'Comment content too long (max 2000 characters)';
  END IF;

  IF p_parent_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.comments
      WHERE id = p_parent_id
        AND post_id = p_post_id
        AND is_deleted = FALSE
        AND status NOT IN ('blocked')
    ) THEN
      RAISE EXCEPTION 'Parent comment not found, deleted, or blocked';
    END IF;
  END IF;

  v_spam_score := public.calculate_spam_score(trim(p_content), v_user_id);

  IF v_spam_score > 0.7 THEN
    v_initial_status := 'pending';
  ELSE
    v_initial_status := 'published';
  END IF;

  INSERT INTO public.comments(
    post_id, parent_id, author_id, content, status, spam_score, author_ip, user_agent
  )
  VALUES (
    p_post_id, p_parent_id, v_user_id, trim(p_content), v_initial_status, v_spam_score, p_actor_ip, p_user_agent
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END $$;

-- =========================================================
-- 9) RPC: Update Comment
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_comment(
  p_comment_id UUID,
  p_content TEXT,
  p_edit_reason TEXT DEFAULT NULL
) RETURNS public.comments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_old_content TEXT;
  v_result public.comments;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT content INTO v_old_content
  FROM public.comments
  WHERE id = p_comment_id
    AND is_deleted = FALSE
    AND (author_id = v_user_id OR public.is_admin());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comment not found or no permission';
  END IF;

  IF NOT public.check_and_record_rate_limit('comment:update', 60, 10, v_user_id, NULL, NULL) THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  IF p_content IS NULL OR char_length(trim(p_content)) < 1 THEN
    RAISE EXCEPTION 'Comment content is required';
  END IF;

  IF v_old_content IS DISTINCT FROM p_content THEN
    INSERT INTO public.comment_edit_history(comment_id, previous_content, edited_by, edit_reason)
    VALUES (p_comment_id, v_old_content, v_user_id, p_edit_reason);
  END IF;

  UPDATE public.comments
  SET content = trim(p_content),
      is_edited = TRUE,
      edited_at = NOW()
  WHERE id = p_comment_id
  RETURNING * INTO v_result;

  RETURN v_result;
END $$;

-- =========================================================
-- 10) RPC: Delete Comment
-- =========================================================

CREATE OR REPLACE FUNCTION public.delete_comment(
  p_comment_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_has_replies BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.comments
    WHERE id = p_comment_id
      AND is_deleted = FALSE
      AND (author_id = v_user_id OR public.is_admin())
  ) THEN
    RAISE EXCEPTION 'Comment not found or no permission';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.comments
    WHERE parent_id = p_comment_id AND is_deleted = FALSE
  ) INTO v_has_replies;

  UPDATE public.comments
  SET is_deleted = TRUE,
      deleted_at = NOW(),
      deleted_by = v_user_id,
      content = CASE WHEN v_has_replies THEN '[삭제된 댓글입니다]' ELSE content END
  WHERE id = p_comment_id;

  RETURN TRUE;
END $$;

-- =========================================================
-- 11) RPC: Toggle Reaction
-- =========================================================

CREATE OR REPLACE FUNCTION public.toggle_reaction(
  p_comment_id UUID,
  p_reaction_type public.reaction_type
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing public.reaction_type;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT public.check_and_record_rate_limit('reaction:toggle', 10, 30, v_user_id, NULL, NULL) THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_comment_id::text || ':' || v_user_id::text));

  SELECT reaction_type INTO v_existing
  FROM public.comment_reactions
  WHERE comment_id = p_comment_id AND user_id = v_user_id;

  IF v_existing IS NULL THEN
    INSERT INTO public.comment_reactions(comment_id, user_id, reaction_type)
    VALUES (p_comment_id, v_user_id, p_reaction_type);
    RETURN jsonb_build_object('action','added','reaction',p_reaction_type);
  ELSIF v_existing = p_reaction_type THEN
    DELETE FROM public.comment_reactions
    WHERE comment_id = p_comment_id AND user_id = v_user_id;
    RETURN jsonb_build_object('action','removed','reaction',p_reaction_type);
  ELSE
    UPDATE public.comment_reactions
    SET reaction_type = p_reaction_type
    WHERE comment_id = p_comment_id AND user_id = v_user_id;
    RETURN jsonb_build_object('action','changed','from',v_existing,'to',p_reaction_type);
  END IF;
END $$;

-- =========================================================
-- 12) RPC: Report Comment
-- =========================================================

CREATE OR REPLACE FUNCTION public.report_comment(
  p_comment_id UUID,
  p_reason public.report_reason,
  p_description TEXT DEFAULT NULL
) RETURNS public.comment_reports
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result public.comment_reports;
  v_report_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT public.check_and_record_rate_limit('report:create', 60, 3, v_user_id, NULL, NULL) THEN
    RAISE EXCEPTION 'Too many reports';
  END IF;

  INSERT INTO public.comment_reports(comment_id, reporter_id, reason, description)
  VALUES (p_comment_id, v_user_id, p_reason, p_description)
  ON CONFLICT (comment_id, reporter_id) DO UPDATE
    SET reason = EXCLUDED.reason,
        description = EXCLUDED.description
  RETURNING * INTO v_result;

  SELECT COUNT(*) INTO v_report_count
  FROM public.comment_reports
  WHERE comment_id = p_comment_id AND status = 'pending';

  IF v_report_count >= 5 THEN
    UPDATE public.comments
    SET status = 'hidden',
        moderated_at = NOW(),
        moderation_reason = '다수 신고로 인한 자동 숨김'
    WHERE id = p_comment_id;

    UPDATE public.comment_reports
    SET status = 'resolved',
        resolution_note = '자동 처리됨',
        reviewed_at = NOW()
    WHERE comment_id = p_comment_id AND status = 'pending';
  END IF;

  RETURN v_result;
END $$;

-- =========================================================
-- 13) RPC: Get Comment Tree (수정됨)
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_comment_tree(
  p_post_id UUID,
  p_max_depth INTEGER DEFAULT 5,
  p_limit INTEGER DEFAULT 100
) 
RETURNS TABLE (
  id UUID,
  post_id UUID,
  parent_id UUID,
  author_id UUID,
  author_name TEXT,
  author_avatar_url TEXT,
  content TEXT,
  status public.comment_status,
  is_deleted BOOLEAN,
  is_edited BOOLEAN,
  like_count BIGINT,
  dislike_count BIGINT,
  reply_count BIGINT,
  created_at TIMESTAMPTZ,
  depth INTEGER,
  path TEXT
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- 최상위 댓글
    (
      SELECT
        c.id, 
        c.post_id, 
        c.parent_id, 
        c.author_id,
        c.author_name, 
        c.author_avatar_url,
        c.content, 
        c.status, 
        c.is_deleted, 
        c.is_edited,
        c.like_count, 
        c.dislike_count, 
        c.reply_count,
        c.created_at,
        0 AS depth,
        c.created_at::TEXT || '/' || c.id::TEXT AS path
      FROM public.comments_with_stats c
      WHERE c.post_id = p_post_id
        AND c.parent_id IS NULL
        AND c.is_deleted = FALSE
        AND c.status = 'published'
      ORDER BY c.created_at DESC
      LIMIT p_limit
    )
    
    UNION ALL
    
    -- 대댓글
    SELECT
      c.id, 
      c.post_id, 
      c.parent_id, 
      c.author_id,
      c.author_name, 
      c.author_avatar_url,
      c.content, 
      c.status, 
      c.is_deleted, 
      c.is_edited,
      c.like_count, 
      c.dislike_count, 
      c.reply_count,
      c.created_at,
      ct.depth + 1,
      ct.path || '/' || c.created_at::TEXT || '/' || c.id::TEXT
    FROM public.comments_with_stats c
    INNER JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE c.is_deleted = FALSE
      AND c.status = 'published'
      AND ct.depth < p_max_depth
  )
  SELECT 
    ct.id,
    ct.post_id,
    ct.parent_id,
    ct.author_id,
    ct.author_name,
    ct.author_avatar_url,
    ct.content,
    ct.status,
    ct.is_deleted,
    ct.is_edited,
    ct.like_count,
    ct.dislike_count,
    ct.reply_count,
    ct.created_at,
    ct.depth,
    ct.path
  FROM comment_tree ct
  ORDER BY ct.path;
END $$;

-- =========================================================
-- 14) RLS Policies
-- =========================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spam_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_published_comments ON public.comments;
CREATE POLICY select_published_comments
ON public.comments FOR SELECT
USING (
  (is_deleted = FALSE AND status = 'published')
  OR author_id = auth.uid()
  OR public.is_moderator()
);

DROP POLICY IF EXISTS no_direct_insert_comments ON public.comments;
CREATE POLICY no_direct_insert_comments ON public.comments FOR INSERT WITH CHECK (FALSE);

DROP POLICY IF EXISTS no_direct_update_comments ON public.comments;
CREATE POLICY no_direct_update_comments ON public.comments FOR UPDATE USING (FALSE);

DROP POLICY IF EXISTS no_direct_delete_comments ON public.comments;
CREATE POLICY no_direct_delete_comments ON public.comments FOR DELETE USING (FALSE);

DROP POLICY IF EXISTS select_reactions ON public.comment_reactions;
CREATE POLICY select_reactions ON public.comment_reactions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS no_direct_reaction_changes ON public.comment_reactions;
CREATE POLICY no_direct_reaction_changes ON public.comment_reactions FOR ALL USING (FALSE);

DROP POLICY IF EXISTS select_own_reports ON public.comment_reports;
CREATE POLICY select_own_reports ON public.comment_reports FOR SELECT
USING (reporter_id = auth.uid() OR public.is_moderator());

DROP POLICY IF EXISTS no_direct_report_changes ON public.comment_reports;
CREATE POLICY no_direct_report_changes ON public.comment_reports FOR ALL USING (FALSE);

DROP POLICY IF EXISTS select_own_edit_history ON public.comment_edit_history;
CREATE POLICY select_own_edit_history ON public.comment_edit_history FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.comments c WHERE c.id = comment_id AND c.author_id = auth.uid())
  OR public.is_moderator()
);

DROP POLICY IF EXISTS deny_select_rate_limit ON public.rate_limit_events;
CREATE POLICY deny_select_rate_limit ON public.rate_limit_events FOR SELECT USING (FALSE);

DROP POLICY IF EXISTS deny_write_rate_limit ON public.rate_limit_events;
CREATE POLICY deny_write_rate_limit ON public.rate_limit_events FOR ALL USING (FALSE);

DROP POLICY IF EXISTS spam_patterns_admin_only ON public.spam_patterns;
CREATE POLICY spam_patterns_admin_only ON public.spam_patterns FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_all ON public.profiles FOR SELECT USING (TRUE);

-- =========================================================
-- 15) Function Grants
-- =========================================================

GRANT EXECUTE ON FUNCTION public.create_comment(UUID, UUID, TEXT, INET, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_comment(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_comment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_reaction(UUID, public.reaction_type) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_comment(UUID, public.report_reason, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_comment_tree(UUID, INTEGER, INTEGER) TO authenticated;

-- =========================================================
-- 16) Cron Jobs
-- =========================================================

DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-rate-limit-events');
  PERFORM cron.unschedule('cleanup-old-edit-history');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'cleanup-rate-limit-events',
  '0 * * * *',
  $$DELETE FROM public.rate_limit_events WHERE expires_at < NOW()$$
);

SELECT cron.schedule(
  'cleanup-old-edit-history',
  '0 0 * * *',
  $$DELETE FROM public.comment_edit_history WHERE created_at < NOW() - INTERVAL '6 months'$$
);

-- =========================================================
-- 17) 초기 데이터
-- =========================================================

INSERT INTO public.spam_patterns (pattern_type, pattern_value, severity)
VALUES 
  ('keyword', '광고|홍보|클릭|방문|가입', 6),
  ('keyword', '비아그라|도박|카지노', 9),
  ('url', 'bit\.ly|goo\.gl|tinyurl', 7)
ON CONFLICT (pattern_type, pattern_value) DO NOTHING;

-- =========================================================
-- 완료
-- =========================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Comment System Installation Complete!';
  RAISE NOTICE '========================================';
END $$;
