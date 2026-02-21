-- Migration: Admin Branding Controls & Dynamic Field Builder
-- Description: Adds configuration for Library Card and Rare Book layouts, and sets up the Dynamic Field Builder system.

-- 1. Expand site_settings table with document configuration
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS card_header_text text DEFAULT 'GOVT COLLEGE FOR MEN NAZIMABAD',
ADD COLUMN IF NOT EXISTS card_subheader_text text DEFAULT 'LIBRARY CARD',
ADD COLUMN IF NOT EXISTS card_logo_url text,
ADD COLUMN IF NOT EXISTS card_qr_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS card_qr_url text DEFAULT 'https://gcfm.edu.pk/verify',
ADD COLUMN IF NOT EXISTS card_terms_text text DEFAULT '• Login using your Library Card ID\n• Use the password created at the time of application.\n• Your library card will work only after approval by the library administration.\n• If you forget your password:\n  - Contact the library\n  - Your existing card will be deleted\n  - You must apply again for a new library card\n• This card is NOT TRANSFERABLE.\n• If lost, stolen, or damaged, report immediately to the library.\n• The college is not responsible for misuse.\n• If found, please return to the college.',
ADD COLUMN IF NOT EXISTS card_contact_address text DEFAULT 'Nazimabad, Karachi, Pakistan',
ADD COLUMN IF NOT EXISTS card_contact_email text DEFAULT 'library@gcfm.edu.pk',
ADD COLUMN IF NOT EXISTS card_contact_phone text DEFAULT '+92 21 XXXX XXXX',
ADD COLUMN IF NOT EXISTS rb_watermark_text text DEFAULT 'GCFM Library Archive',
ADD COLUMN IF NOT EXISTS rb_watermark_opacity float DEFAULT 0.1,
ADD COLUMN IF NOT EXISTS rb_disclaimer_text text DEFAULT 'Confidential • Do Not Distribute • GCFM Library Archive',
ADD COLUMN IF NOT EXISTS rb_watermark_enabled boolean DEFAULT true;

-- 2. Create library_card_fields table for the Dynamic Field Builder
CREATE TABLE IF NOT EXISTS public.library_card_fields (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    field_label text NOT NULL,
    field_key text NOT NULL UNIQUE,
    field_type text NOT NULL DEFAULT 'text',
    is_required boolean DEFAULT false,
    show_on_form boolean DEFAULT true,
    show_on_card boolean DEFAULT true,
    show_in_admin boolean DEFAULT true,
    display_order integer DEFAULT 0,
    options jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for library_card_fields
ALTER TABLE public.library_card_fields ENABLE ROW LEVEL SECURITY;

-- Policies for library_card_fields
CREATE POLICY "Anyone can view library card fields" ON public.library_card_fields
FOR SELECT USING (true);

CREATE POLICY "Admins can manage library card fields" ON public.library_card_fields
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Add dynamic_fields storage to applications
ALTER TABLE public.library_card_applications
ADD COLUMN IF NOT EXISTS dynamic_fields jsonb DEFAULT '{}'::jsonb;

-- Trigger for updating updated_at on library_card_fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_library_card_fields_updated_at') THEN
        CREATE TRIGGER update_library_card_fields_updated_at
        BEFORE UPDATE ON public.library_card_fields
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
