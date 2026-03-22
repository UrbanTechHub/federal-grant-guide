-- Create grant_applications table to store all submissions
CREATE TABLE public.grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth TEXT,
  ssn_last_four TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  employment_status TEXT,
  employer_name TEXT,
  job_title TEXT,
  annual_income TEXT,
  grant_type TEXT NOT NULL,
  requested_amount TEXT NOT NULL,
  purpose_of_grant TEXT,
  organization_name TEXT,
  organization_type TEXT,
  uploaded_files JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'under_review',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (public submission form)
CREATE POLICY "Anyone can submit applications"
ON public.grant_applications
FOR INSERT
WITH CHECK (true);

-- Policy: Allow anyone to search by application number (for tracking)
CREATE POLICY "Anyone can view their application by number"
ON public.grant_applications
FOR SELECT
USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_grant_applications_updated_at
BEFORE UPDATE ON public.grant_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();