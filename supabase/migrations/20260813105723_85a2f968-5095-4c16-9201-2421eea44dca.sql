-- Insert a test builder to verify the intelligence platform
INSERT INTO public.builders (
    name, 
    slug, 
    status, 
    featured, 
    verified, 
    headquarters, 
    operating_years_manual, 
    summary,
    legal_name,
    mission,
    vision,
    metrics
) VALUES (
    'Omaxe', 
    'omaxe', 
    'published', 
    true, 
    true, 
    'New Delhi, India', 
    36, 
    'Omaxe is one of India''s leading real estate development companies, with a strong presence in Northern India.',
    'Omaxe Limited',
    'To provide premium housing and commercial spaces.',
    'To be the most trusted developer.',
    '{"completedProjects": 120, "ongoingProjects": 15, "onTimeDeliveryRate": "92%", "reraRegistered": true}'
) ON CONFLICT (slug) DO UPDATE SET 
    status = 'published', 
    featured = true,
    verified = true,
    metrics = EXCLUDED.metrics;

-- Add some projects for this builder using valid status 'planning'
INSERT INTO public.projects (
    name,
    slug,
    builder_id,
    publish_status,
    status,
    summary,
    metrics
) 
SELECT 
    'Omaxe The Lake',
    'omaxe-the-lake',
    id,
    'published',
    'planning',
    'A premium residential project in New Chandigarh.',
    '{"unitTypes": "2, 3, 4 BHK", "priceRange": "₹1.2 Cr - ₹3.5 Cr", "possessionYear": 2026, "totalUnits": 450}'
FROM public.builders WHERE slug = 'omaxe'
ON CONFLICT (slug) DO NOTHING;
