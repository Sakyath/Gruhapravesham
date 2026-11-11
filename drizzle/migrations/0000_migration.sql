CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

CREATE TABLE public.guest_blessings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  message text NOT NULL,
  relationship text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.guest_blessings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_blessings TO authenticated;
GRANT ALL ON public.guest_blessings TO service_role;
ALTER TABLE public.guest_blessings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads approved blessings" ON public.guest_blessings FOR SELECT TO anon, authenticated USING (approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone submits pending blessing" ON public.guest_blessings FOR INSERT TO anon, authenticated WITH CHECK (approved = false);
CREATE POLICY "Admins update blessings" ON public.guest_blessings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete blessings" ON public.guest_blessings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.validate_blessing()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.guest_name := btrim(regexp_replace(NEW.guest_name, '<[^>]*>', '', 'g'));
  NEW.message := btrim(regexp_replace(NEW.message, '<[^>]*>', '', 'g'));
  NEW.relationship := nullif(btrim(regexp_replace(coalesce(NEW.relationship,''), '<[^>]*>', '', 'g')), '');
  IF length(NEW.guest_name) < 2 OR length(NEW.guest_name) > 80 THEN RAISE EXCEPTION 'Name must be 2-80 characters'; END IF;
  IF length(NEW.message) < 3 OR length(NEW.message) > 500 THEN RAISE EXCEPTION 'Message must be 3-500 characters'; END IF;
  IF NEW.relationship IS NOT NULL AND length(NEW.relationship) > 60 THEN RAISE EXCEPTION 'Relationship too long'; END IF;
  IF TG_OP = 'INSERT' THEN
    IF (SELECT count(*) FROM public.guest_blessings WHERE created_at > now() - interval '1 minute') >= 20 THEN
      RAISE EXCEPTION 'Too many blessings right now, please try again in a minute';
    END IF;
    IF EXISTS (SELECT 1 FROM public.guest_blessings WHERE lower(guest_name) = lower(NEW.guest_name) AND created_at > now() - interval '2 minutes') THEN
      RAISE EXCEPTION 'You just sent a blessing. Please wait a moment before sending another';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_blessing_trg BEFORE INSERT OR UPDATE ON public.guest_blessings
FOR EACH ROW EXECUTE FUNCTION public.validate_blessing();

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  caption text,
  category text NOT NULL DEFAULT 'Our New Home',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads gallery" ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert gallery" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update gallery" ON public.gallery_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete gallery" ON public.gallery_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  host_names text NOT NULL DEFAULT '',
  ceremony_time text NOT NULL DEFAULT '',
  lunch_time text NOT NULL DEFAULT '',
  show_apartment boolean NOT NULL DEFAULT true,
  invitation_message text NOT NULL DEFAULT 'With immense happiness, we invite you and your family to join us as we celebrate the auspicious occasion of our new home. Your presence and blessings will make this occasion even more special.',
  display_message text NOT NULL DEFAULT 'Welcome to our new home. Thank you for blessing us with your presence.',
  music_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.site_settings (id) VALUES (1);

CREATE POLICY "Anyone reads gallery files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');
CREATE POLICY "Admins upload gallery files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update gallery files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete gallery files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));