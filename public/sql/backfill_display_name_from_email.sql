-- =========================================================
-- 기존 유저/관리자 display_name 이메일 기반 자동 채우기
-- =========================================================
-- profiles에 display_name이 없거나 비어 있는 경우,
-- auth.users의 이메일 @ 앞부분으로 한 번만 채웁니다.
--
-- 실행: Supabase Dashboard > SQL Editor에서 실행
-- =========================================================

UPDATE public.profiles p
SET
  display_name = v.name,
  updated_at = NOW()
FROM (
  SELECT
    pr.id,
    CASE
      WHEN TRIM(SPLIT_PART(COALESCE(u.email, ''), '@', 1)) = '' THEN '회원'
      ELSE TRIM(SPLIT_PART(u.email, '@', 1))
    END AS name
  FROM auth.users u
  INNER JOIN public.profiles pr ON pr.id = u.id
  WHERE pr.display_name IS NULL OR TRIM(COALESCE(pr.display_name, '')) = ''
) v
WHERE p.id = v.id;
