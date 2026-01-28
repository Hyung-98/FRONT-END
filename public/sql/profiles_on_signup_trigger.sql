-- =========================================================
-- 회원가입 시 profiles 테이블 자동 생성 트리거
-- =========================================================
-- Supabase auth.users에 새 사용자가 INSERT될 때
-- public.profiles에 자동으로 행을 추가합니다.
-- 
-- 실행 방법: Supabase Dashboard > SQL Editor에서 이 스크립트 실행
-- =========================================================

-- 기존 트리거/함수 정리 (재실행 시)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 함수: auth.users INSERT 시 profiles 행 생성 (display_name = 이메일 @ 앞부분)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  -- 이메일 @ 앞부분을 display_name으로 사용. 없거나 비면 '회원'
  v_display_name := TRIM(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1));
  IF v_display_name = '' THEN
    v_display_name := '회원';
  END IF;

  INSERT INTO public.profiles (id, role, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    'user',
    v_display_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 트리거: auth.users INSERT 후 실행
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE 'profiles_on_signup_trigger: 트리거가 생성되었습니다.';
  RAISE NOTICE '회원가입 시 profiles에 role=''user'', display_name=이메일@앞부분 으로 자동 설정됩니다.';
END $$;
