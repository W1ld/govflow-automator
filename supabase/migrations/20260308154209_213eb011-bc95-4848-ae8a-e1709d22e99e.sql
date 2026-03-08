
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- KOP Templates (letterhead templates)
CREATE TABLE public.kop_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_instansi TEXT NOT NULL,
  nama_unit_kerja TEXT,
  alamat TEXT,
  kota TEXT,
  provinsi TEXT,
  kode_pos TEXT,
  telepon TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kop_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read kop_templates" ON public.kop_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert kop_templates" ON public.kop_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update kop_templates" ON public.kop_templates FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete kop_templates" ON public.kop_templates FOR DELETE USING (true);

CREATE TRIGGER update_kop_templates_updated_at
  BEFORE UPDATE ON public.kop_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Kegiatan (activities / SPJ entries)
CREATE TABLE public.kegiatan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor_spj TEXT NOT NULL,
  nama_kegiatan TEXT NOT NULL,
  kode_mak TEXT,
  tanggal_kegiatan DATE NOT NULL,
  lokasi TEXT,
  uraian TEXT,
  jenis_belanja TEXT NOT NULL,
  nilai_bruto NUMERIC NOT NULL DEFAULT 0,
  pph_jenis TEXT,
  pph_rate NUMERIC NOT NULL DEFAULT 0,
  pph_nominal NUMERIC NOT NULL DEFAULT 0,
  ppn_rate NUMERIC NOT NULL DEFAULT 0,
  ppn_nominal NUMERIC NOT NULL DEFAULT 0,
  nilai_netto NUMERIC NOT NULL DEFAULT 0,
  ppk_nama TEXT,
  ppk_nip TEXT,
  bendahara_nama TEXT,
  bendahara_nip TEXT,
  pptk_nama TEXT,
  pptk_nip TEXT,
  kop_template_id UUID REFERENCES public.kop_templates(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'revisi', 'verified', 'arsip')),
  catatan_revisi TEXT,
  tahun_anggaran INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read kegiatan" ON public.kegiatan FOR SELECT USING (true);
CREATE POLICY "Anyone can insert kegiatan" ON public.kegiatan FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update kegiatan" ON public.kegiatan FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete kegiatan" ON public.kegiatan FOR DELETE USING (true);

CREATE TRIGGER update_kegiatan_updated_at
  BEFORE UPDATE ON public.kegiatan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sequence for SPJ numbering
CREATE SEQUENCE public.spj_number_seq START 1;

-- Function to generate SPJ number
CREATE OR REPLACE FUNCTION public.generate_spj_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nomor_spj IS NULL OR NEW.nomor_spj = '' THEN
    NEW.nomor_spj := 'SPJ-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('public.spj_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_kegiatan_spj_number
  BEFORE INSERT ON public.kegiatan
  FOR EACH ROW EXECUTE FUNCTION public.generate_spj_number();

-- Pejabat templates (reusable signatories)
CREATE TABLE public.pejabat_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jabatan TEXT NOT NULL,
  nama TEXT NOT NULL,
  nip TEXT,
  pangkat_golongan TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pejabat_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pejabat_templates" ON public.pejabat_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pejabat_templates" ON public.pejabat_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pejabat_templates" ON public.pejabat_templates FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pejabat_templates" ON public.pejabat_templates FOR DELETE USING (true);

CREATE TRIGGER update_pejabat_templates_updated_at
  BEFORE UPDATE ON public.pejabat_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_kegiatan_status ON public.kegiatan(status);
CREATE INDEX idx_kegiatan_tahun ON public.kegiatan(tahun_anggaran);
CREATE INDEX idx_kegiatan_tanggal ON public.kegiatan(tanggal_kegiatan);
CREATE INDEX idx_kegiatan_kop ON public.kegiatan(kop_template_id);
