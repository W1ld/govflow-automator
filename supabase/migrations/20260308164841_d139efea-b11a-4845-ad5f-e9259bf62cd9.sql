-- 1. Add created_by as nullable first
ALTER TABLE public.kegiatan ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.kop_templates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.pejabat_templates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Backfill existing rows with first user
UPDATE public.kegiatan SET created_by = 'c2369b2e-8ac0-4d1b-bee5-d964db802492' WHERE created_by IS NULL;
UPDATE public.kop_templates SET created_by = 'c2369b2e-8ac0-4d1b-bee5-d964db802492' WHERE created_by IS NULL;
UPDATE public.pejabat_templates SET created_by = 'c2369b2e-8ac0-4d1b-bee5-d964db802492' WHERE created_by IS NULL;

-- 3. Now make NOT NULL with default
ALTER TABLE public.kegiatan ALTER COLUMN created_by SET NOT NULL, ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.kop_templates ALTER COLUMN created_by SET NOT NULL, ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.pejabat_templates ALTER COLUMN created_by SET NOT NULL, ALTER COLUMN created_by SET DEFAULT auth.uid();

-- 4. Drop old RLS policies for kegiatan
DROP POLICY IF EXISTS "Authenticated users can delete kegiatan" ON public.kegiatan;
DROP POLICY IF EXISTS "Authenticated users can insert kegiatan" ON public.kegiatan;
DROP POLICY IF EXISTS "Authenticated users can read kegiatan" ON public.kegiatan;
DROP POLICY IF EXISTS "Authenticated users can update kegiatan" ON public.kegiatan;

-- 5. Owner-scoped RLS for kegiatan
CREATE POLICY "Users can read own kegiatan" ON public.kegiatan
  FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own kegiatan" ON public.kegiatan
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own kegiatan" ON public.kegiatan
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own kegiatan" ON public.kegiatan
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 6. Drop old RLS policies for kop_templates
DROP POLICY IF EXISTS "Authenticated users can delete kop_templates" ON public.kop_templates;
DROP POLICY IF EXISTS "Authenticated users can insert kop_templates" ON public.kop_templates;
DROP POLICY IF EXISTS "Authenticated users can read kop_templates" ON public.kop_templates;
DROP POLICY IF EXISTS "Authenticated users can update kop_templates" ON public.kop_templates;

-- 7. Owner-scoped RLS for kop_templates
CREATE POLICY "Users can read own kop_templates" ON public.kop_templates
  FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own kop_templates" ON public.kop_templates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own kop_templates" ON public.kop_templates
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own kop_templates" ON public.kop_templates
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 8. Drop old RLS policies for pejabat_templates
DROP POLICY IF EXISTS "Authenticated users can delete pejabat_templates" ON public.pejabat_templates;
DROP POLICY IF EXISTS "Authenticated users can insert pejabat_templates" ON public.pejabat_templates;
DROP POLICY IF EXISTS "Authenticated users can read pejabat_templates" ON public.pejabat_templates;
DROP POLICY IF EXISTS "Authenticated users can update pejabat_templates" ON public.pejabat_templates;

-- 9. Owner-scoped RLS for pejabat_templates
CREATE POLICY "Users can read own pejabat_templates" ON public.pejabat_templates
  FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own pejabat_templates" ON public.pejabat_templates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own pejabat_templates" ON public.pejabat_templates
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own pejabat_templates" ON public.pejabat_templates
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 10. Fix storage policies
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;

CREATE POLICY "Users can upload own logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'kop-logos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users can update own logos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'kop-logos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users can delete own logos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'kop-logos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Public can view logos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'kop-logos');