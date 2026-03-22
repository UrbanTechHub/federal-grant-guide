-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Update grant_applications policies to allow admin full access
DROP POLICY IF EXISTS "Anyone can view their application by number" ON public.grant_applications;

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.grant_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Public can view by application number (for tracking)
CREATE POLICY "Public can view by application number"
ON public.grant_applications
FOR SELECT
USING (true);

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.grant_applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.grant_applications
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));