-- Make kop-logos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'kop-logos';

-- Drop existing storage policies and recreate with proper path scoping
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner update" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own logos" ON storage.objects;

-- Read: only own folder
CREATE POLICY "Users can read own logos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'kop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Insert: only own folder
CREATE POLICY "Users can upload own logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Update: only own folder
CREATE POLICY "Users can update own logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'kop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Delete: only own folder
CREATE POLICY "Users can delete own logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'kop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);