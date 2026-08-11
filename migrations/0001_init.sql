-- D1 Migration 0001: Initial schema for Gaansuni music catalog

CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT 1,
  monthly_listeners INTEGER DEFAULT 500000,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  artist_id TEXT NOT NULL,
  cover_art_url TEXT NOT NULL,
  total_tracks INTEGER DEFAULT 1,
  duration_ms INTEGER DEFAULT 240000,
  album_type TEXT DEFAULT 'SINGLE',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  artist_id TEXT NOT NULL,
  album_id TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  youtube_id TEXT,
  duration_ms INTEGER NOT NULL,
  track_number INTEGER DEFAULT 1,
  disc_number INTEGER DEFAULT 1,
  explicit BOOLEAN DEFAULT 0,
  play_count INTEGER DEFAULT 150000,
  is_premium BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Seed Starter Catalog
INSERT OR IGNORE INTO artists (id, name, slug, bio, avatar_url, verified, monthly_listeners) VALUES
('artist_1', 'Rezwana Choudhury Bannya', 'rezwana-choudhury-bannya', 'Renowned exponent of Rabindra Sangeet', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 1, 850000),
('artist_2', 'Farida Parveen', 'farida-parveen', 'Legendary Lalon Sangeet vocalist of Bangladesh', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', 1, 620000),
('artist_3', 'Coke Studio Bangla', 'coke-studio-bangla', 'Contemporary Bengali music fusion platform', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 1, 2400000),
('artist_4', 'Arnob', 'shayan-chowdhury-arnob', 'Bengali musician, singer and composer', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', 1, 1100000),
('artist_5', 'Firoza Begum', 'firoza-begum', 'Iconic Nazrul Geeti singer of the Indian subcontinent', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80', 1, 730000);

INSERT OR IGNORE INTO albums (id, title, slug, artist_id, cover_art_url, total_tracks, duration_ms, album_type) VALUES
('album_1', 'Aguner Poroshmoni', 'aguner-poroshmoni', 'artist_1', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 1, 245000, 'SINGLE'),
('album_2', 'Shob Loke Koy Lalon', 'shob-loke-koy-lalon', 'artist_2', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', 1, 310000, 'SINGLE'),
('album_3', 'Nasek Nasek', 'nasek-nasek', 'artist_3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 1, 280000, 'SINGLE'),
('album_4', 'Hok Kolorob', 'hok-kolorob', 'artist_4', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', 1, 225000, 'ALBUM'),
('album_5', 'Karar Oi Louho Kapat', 'karar-oi-louho-kapat', 'artist_5', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80', 1, 215000, 'SINGLE');

INSERT OR IGNORE INTO tracks (id, title, slug, artist_id, album_id, audio_url, youtube_id, duration_ms, play_count) VALUES
('track_1', 'Aguner Poroshmoni', 'aguner-poroshmoni', 'artist_1', 'album_1', '/api/stream?videoId=6w97fN5c44E&redirect=1', '6w97fN5c44E', 245000, 420000),
('track_2', 'Shob Loke Koy Lalon Ki Jat', 'shob-loke-koy-lalon-ki-jat', 'artist_2', 'album_2', '/api/stream?videoId=l1m4E-s1t8Y&redirect=1', 'l1m4E-s1t8Y', 310000, 380000),
('track_3', 'Nasek Nasek', 'nasek-nasek', 'artist_3', 'album_3', '/api/stream?videoId=QG802l6XUCA&redirect=1', 'QG802l6XUCA', 280000, 1850000),
('track_4', 'Hok Kolorob', 'hok-kolorob', 'artist_4', 'album_4', '/api/stream?videoId=aJ-LgJc5v_s&redirect=1', 'aJ-LgJc5v_s', 225000, 950000),
('track_5', 'Karar Oi Louho Kapat', 'karar-oi-louho-kapat', 'artist_5', 'album_5', '/api/stream?videoId=jR_5908N3kE&redirect=1', 'jR_5908N3kE', 215000, 610000);
