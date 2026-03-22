-- Create private bucket for grant application documents
insert into storage.buckets (id, name, public)
values ('grant-documents', 'grant-documents', false)
on conflict (id) do update set public = excluded.public;

-- Allow anonymous users to upload into applications/ prefix only
create policy "Anon can upload grant documents"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'grant-documents'
  and name like 'applications/%'
);

-- (No public read policy on purpose: documents stay private)
