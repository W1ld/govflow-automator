
-- Drop all permissive policies and replace with authenticated-only policies

-- kegiatan
DROP POLICY IF EXISTS "Anyone can read kegiatan" ON public.kegiatan;
DROP POLICY IF EXISTS "Anyone can insert kegiatan" ON public.kegiatan;
DROP POLICY IF EXISTS "Anyone can update kegiatan" ON public.kegiatan;
DROP POLICY IF EXISTS "Anyone can delete kegiatan" ON public.kegiatan;

CREATE POLICY "Authenticated users can read kegiatan" ON public.kegiatan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert kegiatan" ON public.kegiatan FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update kegiatan" ON public.kegiatan FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete kegiatan" ON public.kegiatan FOR DELETE TO authenticated USING (true);

-- kop_templates
DROP POLICY IF EXISTS "Anyone can read kop_templates" ON public.kop_templates;
DROP POLICY IF EXISTS "Anyone can insert kop_templates" ON public.kop_templates;
DROP POLICY IF EXISTS "Anyone can update kop_templates" ON public.kop_templates;
DROP POLICY IF EXISTS "Anyone can delete kop_templates" ON public.kop_templates;

CREATE POLICY "Authenticated users can read kop_templates" ON public.kop_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert kop_templates" ON public.kop_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update kop_templates" ON public.kop_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete kop_templates" ON public.kop_templates FOR DELETE TO authenticated USING (true);

-- pejabat_templates
DROP POLICY IF EXISTS "Anyone can read pejabat_templates" ON public.pejabat_templates;
DROP POLICY IF EXISTS "Anyone can insert pejabat_templates" ON public.pejabat_templates;
DROP POLICY IF EXISTS "Anyone can update pejabat_templates" ON public.pejabat_templates;
DROP POLICY IF EXISTS "Anyone can delete pejabat_templates" ON public.pejabat_templates;

CREATE POLICY "Authenticated users can read pejabat_templates" ON public.pejabat_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert pejabat_templates" ON public.pejabat_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update pejabat_templates" ON public.pejabat_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete pejabat_templates" ON public.pejabat_templates FOR DELETE TO authenticated USING (true);
