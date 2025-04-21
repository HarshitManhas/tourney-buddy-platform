-- Create a function to set up storage policies
create or replace function create_storage_policy(bucket_name text)
returns void
language plpgsql
security definer
as $$
begin
  -- Drop existing policies if they exist
  drop policy if exists "Public read access" on storage.objects;
  drop policy if exists "Authenticated users can upload" on storage.objects;
  drop policy if exists "Users can update their own files" on storage.objects;
  drop policy if exists "Users can delete their own files" on storage.objects;

  -- Allow public read access
  create policy "Public read access"
  on storage.objects for select
  using ( 
    bucket_id = 'qr-codes' 
    or bucket_id = 'tournament-banners' 
    or bucket_id = 'tournament-logos' 
    or bucket_id = 'payment-screenshots' 
  );

  -- Allow authenticated users to upload files
  create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated'
    and (
      bucket_id = 'qr-codes' 
      or bucket_id = 'tournament-banners' 
      or bucket_id = 'tournament-logos' 
      or bucket_id = 'payment-screenshots'
    )
  );

  -- Allow users to update their own files
  create policy "Users can update their own files"
  on storage.objects for update
  using (
    auth.role() = 'authenticated'
    and (
      bucket_id = 'qr-codes' 
      or bucket_id = 'tournament-banners' 
      or bucket_id = 'tournament-logos' 
      or bucket_id = 'payment-screenshots'
    )
  );

  -- Allow users to delete their own files
  create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    auth.role() = 'authenticated'
    and (
      bucket_id = 'qr-codes' 
      or bucket_id = 'tournament-banners' 
      or bucket_id = 'tournament-logos' 
      or bucket_id = 'payment-screenshots'
    )
  );

  -- Grant necessary permissions to authenticated users
  grant usage on schema storage to authenticated;
  grant select on storage.objects to authenticated;
  grant insert on storage.objects to authenticated;
  grant update on storage.objects to authenticated;
  grant delete on storage.objects to authenticated;
end;
$$; 