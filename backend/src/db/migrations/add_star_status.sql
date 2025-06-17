-- Add star_status column to flashcards table
ALTER TABLE flashcards ADD COLUMN star_status BOOLEAN DEFAULT FALSE; 