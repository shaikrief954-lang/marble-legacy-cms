CREATE POLICY "editors read media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media' AND public.can_edit(auth.uid()));
CREATE POLICY "editors upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.can_edit(auth.uid()));
CREATE POLICY "editors update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.can_edit(auth.uid()));
CREATE POLICY "editors delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.can_edit(auth.uid()));