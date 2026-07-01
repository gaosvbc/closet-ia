-- =============================================================================
-- Storage bucket: clothing-photos — privacy and access control
-- Migration: 007_storage_rls.sql
--
-- Creates the `clothing-photos` bucket as PRIVATE (not public) and adds
-- Storage RLS policies that restrict each user to reading and writing only
-- their own folder (stored as `{user_id}/{filename}`).
--
-- Why private? clothing_items.image_url stores photos of wardrobes that may
-- contain personal context beyond the garment itself (home interiors,
-- reflections, other people). A public bucket would expose every photo to
-- anyone who knows or can enumerate the URL — equivalent to no access control.
--
-- Signed URLs: all reads must go through supabase.storage.from('clothing-photos')
-- .createSignedUrl(path, expiresIn) on the server, never from a stored
-- permanent public URL. See SUPABASE_SETUP.md § 5c for the integration pattern.
--
-- File naming convention enforced by RLS:
--   {auth.uid()}/{uuid}.jpg   (or .png)
-- =============================================================================

-- Create the bucket (private by default — public = false).
-- Safe to run multiple times; the DO block skips if the bucket already exists.
do $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'clothing-photos',
    'clothing-photos',
    false,                          -- PRIVATE: URLs are never publicly accessible
    5242880,                        -- 5 MB per file
    array['image/jpeg', 'image/png', 'image/webp']
  )
  on conflict (id) do update
    set public             = false,
        file_size_limit    = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage RLS policies on storage.objects
-- The folder prefix (storage.foldername(name))[1] is the first path segment,
-- which must equal the requesting user's UID. This prevents user A from
-- reading, writing, updating, or deleting any object in user B's folder.
-- ---------------------------------------------------------------------------

-- Upload: authenticated users can only create objects in their own folder.
create policy "users_upload_own_photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'clothing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: authenticated users can only read objects in their own folder.
-- The server must always use createSignedUrl() — this policy is a backstop,
-- not a substitute for generating time-limited signed URLs.
create policy "users_read_own_photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'clothing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update (replace): same folder restriction.
create policy "users_update_own_photos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'clothing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: users can delete only their own objects.
create policy "users_delete_own_photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'clothing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
