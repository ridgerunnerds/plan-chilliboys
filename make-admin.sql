-- Promote tester@chilliboys.mx to admin so you can access the Admin Dashboard
-- and create the admin@chilliboys.mx account from the UI.

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tester@chilliboys.mx';
