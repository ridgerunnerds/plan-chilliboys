-- Check all profiles to see what's in the table
SELECT id, email, name, role, created_at FROM public.profiles;

-- Promote tester to admin (run this if tester is still client)
UPDATE public.profiles SET role = 'admin' WHERE email = 'tester@chilliboys.mx';

-- Verify the update worked
SELECT id, email, name, role FROM public.profiles WHERE email = 'tester@chilliboys.mx';
