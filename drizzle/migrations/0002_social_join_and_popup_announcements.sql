CREATE TABLE public.social_platforms (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), platform_name text NOT NULL, platform_icon text, title text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '', button_text text NOT NULL DEFAULT 'Join', destination_url text NOT NULL CHECK (destination_url ~ '^https://[^[:space:]]+$'), brand_color text CHECK (brand_color IS NULL OR brand_color ~ '^#[0-9A-Fa-f]{6}$'), enabled boolean NOT NULL DEFAULT true, display_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_platforms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_platforms TO authenticated;
GRANT ALL ON public.social_platforms TO service_role;
ALTER TABLE public.social_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public enabled social platforms" ON public.social_platforms FOR SELECT TO anon, authenticated USING (enabled OR public.is_admin());
CREATE POLICY "Admins manage social platforms" ON public.social_platforms FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER social_platforms_updated BEFORE UPDATE ON public.social_platforms FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TABLE public.join_gate_settings (
 id text PRIMARY KEY DEFAULT 'global' CHECK (id = 'global'), enabled boolean NOT NULL DEFAULT false, join_mode text NOT NULL DEFAULT 'any' CHECK (join_mode IN ('any','all')), heading text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '', continue_button_text text NOT NULL DEFAULT 'Continue', updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.join_gate_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.join_gate_settings TO authenticated;
GRANT ALL ON public.join_gate_settings TO service_role;
ALTER TABLE public.join_gate_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public join gate settings" ON public.join_gate_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage join gate settings" ON public.join_gate_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER join_gate_settings_updated BEFORE UPDATE ON public.join_gate_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.social_platforms (platform_name, platform_icon, title, description, button_text, destination_url, enabled, display_order)
 SELECT telegram_label, telegram_icon, telegram_label, telegram_message, telegram_join_text, telegram_url, telegram_enabled, 1 FROM public.app_config WHERE id='global' AND telegram_url ~ '^https://[^[:space:]]+$';
INSERT INTO public.join_gate_settings (id, enabled) SELECT 'global', telegram_enabled FROM public.app_config WHERE id='global';
ALTER TABLE public.announcements ADD COLUMN enabled boolean NOT NULL DEFAULT true, ADD COLUMN popup_enabled boolean NOT NULL DEFAULT false, ADD COLUMN badge_text text NOT NULL DEFAULT '', ADD COLUMN show_close_button boolean NOT NULL DEFAULT true, ADD COLUMN border_color text CHECK (border_color IS NULL OR border_color ~ '^#[0-9A-Fa-f]{6}$'), ADD COLUMN badge_color text CHECK (badge_color IS NULL OR badge_color ~ '^#[0-9A-Fa-f]{6}$'), ADD COLUMN buttons_configuration jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE OR REPLACE FUNCTION public.validate_popup_buttons() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE b jsonb;
BEGIN
 IF jsonb_typeof(NEW.buttons_configuration) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Buttons must be an array'; END IF;
 IF jsonb_array_length(NEW.buttons_configuration)>2 THEN RAISE EXCEPTION 'At most two buttons are allowed'; END IF;
 FOR b IN SELECT value FROM jsonb_array_elements(NEW.buttons_configuration) LOOP
  IF jsonb_typeof(b) IS DISTINCT FROM 'object' OR jsonb_typeof(b->'enabled') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Invalid button'; END IF;
  IF COALESCE((b->>'enabled')::boolean,false) AND (COALESCE(b->>'text','')='' OR COALESCE(b->>'url','') !~ '^https://[^[:space:]]+$') THEN RAISE EXCEPTION 'Enabled buttons need text and an HTTPS URL'; END IF;
  IF b->>'background_color' IS NOT NULL AND b->>'background_color' !~ '^#[0-9A-Fa-f]{6}$' THEN RAISE EXCEPTION 'Invalid button background color'; END IF;
  IF b->>'text_color' IS NOT NULL AND b->>'text_color' !~ '^#[0-9A-Fa-f]{6}$' THEN RAISE EXCEPTION 'Invalid button text color'; END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_announcement_buttons BEFORE INSERT OR UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.validate_popup_buttons();
ALTER POLICY "Public reads published announcements" ON public.announcements USING ((is_published AND enabled) OR public.is_admin());