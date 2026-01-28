-- =========================================================
-- 댓글 작성자 이름 표시 수정
-- =========================================================
-- 기존: display_name이 NULL이면 전부 '탈퇴한 사용자'로 표시됨
-- 수정: profiles는 있으나 display_name이 없으면 '회원', 
--       profiles가 없을 때만(실제 탈퇴) '탈퇴한 사용자'
--
-- 실행: Supabase Dashboard > SQL Editor에서 실행
-- =========================================================

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
