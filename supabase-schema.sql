-- Anonasong Database Schema
-- PostgreSQL schema for anonymous music confessional
-- Based on design document constraints

-- Create tables
-- Gardens table
CREATE TABLE IF NOT EXISTS gardens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(15) NOT NULL,
  display_name VARCHAR(15) NOT NULL, -- Preserves original casing
  garden_index INTEGER NOT NULL DEFAULT 0, -- For multiple gardens per name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  flower_count INTEGER DEFAULT 0, -- Denormalized for performance
  CONSTRAINT unique_garden_name_index UNIQUE(name, garden_index)
);

-- Flowers table
CREATE TABLE IF NOT EXISTS flowers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  song_input TEXT NOT NULL, -- Can be title/artist or embed code
  song_type VARCHAR(20) DEFAULT 'text', -- 'text', 'spotify', 'youtube', 'embed'
  flower_type VARCHAR(10) NOT NULL, -- Emoji representation
  note TEXT, -- Optional note (validated to 20 words max in app)
  planted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin/Moderation table
CREATE TABLE IF NOT EXISTS moderation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flower_id UUID REFERENCES flowers(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'deleted', 'flagged', etc.
  reason TEXT,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spam filter settings
CREATE TABLE IF NOT EXISTS spam_settings (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Single row table
  enabled BOOLEAN DEFAULT true,
  banned_words TEXT[] DEFAULT ARRAY['spam', 'viagra', 'casino', 'xxx'],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Indexes for performance
CREATE INDEX idx_flowers_garden_id ON flowers(garden_id);
CREATE INDEX idx_flowers_planted_at ON flowers(planted_at);
CREATE INDEX idx_gardens_name_lower ON gardens(LOWER(name));
CREATE INDEX idx_gardens_updated_at ON gardens(updated_at);

-- Function to check flower count constraint (24 max per garden)
CREATE OR REPLACE FUNCTION check_flower_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT flower_count FROM gardens WHERE id = NEW.garden_id) >= 24 THEN
    RAISE EXCEPTION 'Garden cannot have more than 24 flowers';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce 24 flower limit
CREATE TRIGGER enforce_flower_limit
  BEFORE INSERT ON flowers
  FOR EACH ROW
  EXECUTE FUNCTION check_flower_limit();

-- Function to update garden stats and create new garden if needed
CREATE OR REPLACE FUNCTION update_garden_on_flower_insert()
RETURNS TRIGGER AS $$
DECLARE
  current_garden gardens%ROWTYPE;
BEGIN
  -- Get current garden
  SELECT * INTO current_garden FROM gardens WHERE id = NEW.garden_id;
  
  -- Update flower count and timestamp
  UPDATE gardens 
  SET 
    flower_count = flower_count + 1,
    updated_at = NOW() 
  WHERE id = NEW.garden_id;
  
  -- If garden is now full (24 flowers), prepare for next garden
  IF current_garden.flower_count + 1 >= 24 THEN
    -- Check if next garden already exists
    IF NOT EXISTS (
      SELECT 1 FROM gardens 
      WHERE name = current_garden.name 
      AND garden_index = current_garden.garden_index + 1
    ) THEN
      -- Create new garden for this name
      INSERT INTO gardens (name, display_name, garden_index)
      VALUES (current_garden.name, current_garden.display_name, current_garden.garden_index + 1);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update garden on flower insert
CREATE TRIGGER update_garden_on_flower_insert
  AFTER INSERT ON flowers
  FOR EACH ROW
  EXECUTE FUNCTION update_garden_on_flower_insert();

-- Function to decrease flower count on deletion
CREATE OR REPLACE FUNCTION update_garden_on_flower_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gardens 
  SET flower_count = flower_count - 1
  WHERE id = OLD.garden_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update garden on flower delete
CREATE TRIGGER update_garden_on_flower_delete
  AFTER DELETE ON flowers
  FOR EACH ROW
  EXECUTE FUNCTION update_garden_on_flower_delete();

-- Function to check spam
CREATE OR REPLACE FUNCTION check_spam(content TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  settings spam_settings%ROWTYPE;
  word TEXT;
BEGIN
  SELECT * INTO settings FROM spam_settings WHERE id = 1;
  
  IF NOT settings.enabled THEN
    RETURN FALSE;
  END IF;
  
  FOREACH word IN ARRAY settings.banned_words
  LOOP
    IF LOWER(content) LIKE '%' || LOWER(word) || '%' THEN
      RETURN TRUE;
    END IF;
  END LOOP;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to capitalize first letter of each word
CREATE OR REPLACE FUNCTION capitalize_name(p_name VARCHAR(15))
RETURNS VARCHAR(15) AS $$
BEGIN
  RETURN INITCAP(TRIM(p_name));
END;
$$ LANGUAGE plpgsql;

-- Function to get or create garden
CREATE OR REPLACE FUNCTION get_or_create_garden(
  p_name VARCHAR(15),
  p_display_name VARCHAR(15) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_garden_id UUID;
  v_normalized_name VARCHAR(15);
  v_display VARCHAR(15);
BEGIN
  v_normalized_name := LOWER(TRIM(p_name));
  v_display := COALESCE(p_display_name, capitalize_name(p_name));
  
  -- Try to get existing garden with space
  SELECT id INTO v_garden_id
  FROM gardens
  WHERE name = v_normalized_name
  AND flower_count < 24
  ORDER BY garden_index
  LIMIT 1;
  
  -- If no garden with space, create new one
  IF v_garden_id IS NULL THEN
    INSERT INTO gardens (name, display_name, garden_index)
    VALUES (
      v_normalized_name, 
      v_display,
      COALESCE((SELECT MAX(garden_index) + 1 FROM gardens WHERE name = v_normalized_name), 0)
    )
    RETURNING id INTO v_garden_id;
  END IF;
  
  RETURN v_garden_id;
END;
$$ LANGUAGE plpgsql;

-- Initialize spam settings
INSERT INTO spam_settings (id, enabled, banned_words) 
VALUES (1, true, ARRAY['spam', 'viagra', 'casino', 'xxx'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security) for anonymous access
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to gardens
CREATE POLICY "Allow public read access to gardens" ON gardens
  FOR SELECT USING (true);

-- Allow public read access to flowers
CREATE POLICY "Allow public read access to flowers" ON flowers
  FOR SELECT USING (true);

-- Allow public insert access to gardens
CREATE POLICY "Allow public insert access to gardens" ON gardens
  FOR INSERT WITH CHECK (true);

-- Allow public insert access to flowers (with spam check)
CREATE POLICY "Allow public insert access to flowers" ON flowers
  FOR INSERT WITH CHECK (
    NOT check_spam(song_input) AND 
    (note IS NULL OR NOT check_spam(note))
  );

-- Read-only access to spam settings for public
CREATE POLICY "Allow public read access to spam settings" ON spam_settings
  FOR SELECT USING (true);

-- Sample data for testing
DO $$
DECLARE
  alex_garden_id UUID;
  sam_garden_id UUID;
  river_garden_id UUID;
  moon_garden_id UUID;
BEGIN
  -- Create gardens
  alex_garden_id := get_or_create_garden('alex', 'Alex');
  sam_garden_id := get_or_create_garden('sam', 'Sam');
  river_garden_id := get_or_create_garden('river', 'River');
  moon_garden_id := get_or_create_garden('moon', 'Moon');
  
  -- Insert sample flowers
  INSERT INTO flowers (garden_id, song_input, song_type, flower_type, note) VALUES 
    (alex_garden_id, 'Bohemian Rhapsody - Queen', 'text', '🌸', 'This song always makes me think of you dancing'),
    (alex_garden_id, 'Imagine - John Lennon', 'text', '🌺', 'For your dreams'),
    (sam_garden_id, 'Here Comes the Sun - The Beatles', 'text', '🌻', 'Hope this brightens your day'),
    (river_garden_id, 'River - Joni Mitchell', 'text', '🌊', 'Like your name, flowing and beautiful'),
    (moon_garden_id, 'Moon River - Henry Mancini', 'text', '🌙', 'Perfect for a moon garden');
END $$;

-- Helper views for easier querying
CREATE OR REPLACE VIEW garden_overview AS
SELECT 
  g.id,
  g.name,
  g.display_name,
  g.garden_index,
  g.flower_count,
  g.created_at,
  g.updated_at,
  COUNT(f.id) as actual_flower_count
FROM gardens g
LEFT JOIN flowers f ON g.id = f.garden_id
GROUP BY g.id, g.name, g.display_name, g.garden_index, g.flower_count, g.created_at, g.updated_at
ORDER BY g.name, g.garden_index;

-- Recent activity view
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
  f.id as flower_id,
  g.display_name as garden_name,
  f.song_input,
  f.note,
  f.flower_type,
  f.planted_at
FROM flowers f
JOIN gardens g ON f.garden_id = g.id
ORDER BY f.planted_at DESC
LIMIT 50;