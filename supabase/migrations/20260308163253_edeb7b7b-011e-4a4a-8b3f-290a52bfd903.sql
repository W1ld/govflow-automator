-- Create storage bucket for KOP logos
INSERT INTO storage.buckets (id, name, public) VALUES ('kop-logos', 'kop-logos', true);

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kop-logos');

-- Allow public read access
CREATE POLICY "Public read access for logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'kop-logos');

-- Allow authenticated users to update their logos
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'kop-logos');

-- Allow authenticated users to delete logos
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kop-logos');
