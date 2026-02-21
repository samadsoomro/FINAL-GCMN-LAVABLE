-- History CMS Tables

-- 1. Page Header Configuration
CREATE TABLE IF NOT EXISTS public.college_history_page (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'History of College',
    subtitle TEXT NOT NULL DEFAULT 'A legacy of academic excellence spanning over seven decades.',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial data
INSERT INTO public.college_history_page (id, title, subtitle)
VALUES (1, 'History of College', 'A legacy of academic excellence spanning over seven decades.')
ON CONFLICT (id) DO NOTHING;

-- 2. Content Sections
CREATE TABLE IF NOT EXISTS public.college_history_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT DEFAULT 'BookOpen',
    image_url TEXT,
    layout_type TEXT DEFAULT 'grid' CHECK (layout_type IN ('grid', 'full')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial content (Establishment)
INSERT INTO public.college_history_sections (title, description, icon_name, layout_type, display_order)
VALUES (
    'Establishment',
    'The institution was established in 1953. It has the distinction of being one of the oldest and most prestigious educational institutions in Karachi, playing a pivotal role in shaping the academic landscape of the city.',
    'Calendar',
    'grid',
    1
);

-- Seed initial content (Academic Excellence)
INSERT INTO public.college_history_sections (title, description, icon_name, layout_type, display_order)
VALUES (
    'Academic Excellence',
    'Over the years, the institution has produced countless leaders, scholars, and professionals who have made significant contributions to Pakistan and the world. The college is renowned for its strong emphasis on both academic rigor and character building.',
    'Award',
    'grid',
    2
);

-- Seed initial content (Library)
INSERT INTO public.college_history_sections (title, description, icon_name, layout_type, display_order)
VALUES (
    'Our Library',
    'The college library has been a cornerstone of knowledge since the beginning. It houses a vast collection of books, including rare manuscripts and academic resources, serving generations of students in their pursuit of learning.',
    'BookOpen',
    'full',
    3
);

-- 3. Image Gallery
CREATE TABLE IF NOT EXISTS public.college_history_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.college_history_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_history_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_history_gallery ENABLE ROW LEVEL SECURITY;

-- Public Select Policies
DO $$ BEGIN
    CREATE POLICY "Public Read History Page" ON public.college_history_page FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read History Sections" ON public.college_history_sections FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read History Gallery" ON public.college_history_gallery FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin All Policies
DO $$ BEGIN
    CREATE POLICY "Admin CRUD History Page" ON public.college_history_page FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin CRUD History Sections" ON public.college_history_sections FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin CRUD History Gallery" ON public.college_history_gallery FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
