DROP POLICY IF EXISTS "Anon can upload grant documents" ON storage.objects;

CREATE POLICY "Public can upload grant documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'grant-documents'
  AND (storage.foldername(name))[1] = 'applications'
);

CREATE POLICY "Public can upsert grant documents"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'grant-documents'
  AND (storage.foldername(name))[1] = 'applications'
)
WITH CHECK (
  bucket_id = 'grant-documents'
  AND (storage.foldername(name))[1] = 'applications'
);

CREATE POLICY "Public can read grant documents metadata"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'grant-documents'
  AND (storage.foldername(name))[1] = 'applications'
);