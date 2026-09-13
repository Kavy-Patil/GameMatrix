-- GameVault Database Performance Indexes

-- Games table indexes
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_title ON public.games(title);
CREATE INDEX IF NOT EXISTS idx_games_platforms ON public.games USING GIN (platforms);
CREATE INDEX IF NOT EXISTS idx_games_genres ON public.games USING GIN (genres);
CREATE INDEX IF NOT EXISTS idx_games_featured ON public.games(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_games_popular ON public.games(popular) WHERE popular = true;

-- Enquiries table indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_ref ON public.enquiries(reference_code);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_game_id ON public.enquiries(game_id);

-- Audit logs index
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.admin_audit_logs(entity_type, entity_id);
