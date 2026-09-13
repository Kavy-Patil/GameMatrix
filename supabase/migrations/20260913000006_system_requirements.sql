-- Migration 6: PC System Requirements schema extension
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS system_requirements JSONB DEFAULT NULL;

COMMENT ON COLUMN public.games.system_requirements IS 'Structured PC system requirements containing minimum and recommended specifications (OS, CPU, RAM, GPU, DirectX, Storage, Notes).';
