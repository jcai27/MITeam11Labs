/*
  # Virtual Courtroom Simulation Database Schema

  ## Overview
  Creates tables to store courtroom scenarios, scripted dialogues, and participant configurations
  for the virtual courtroom Zoom simulation with ElevenLabs voice integration.

  ## New Tables
  
  ### `scenarios`
  Stores different courtroom scenarios (e.g., Opening Statements, Objection, Verdict)
  - `id` (uuid, primary key) - Unique identifier for the scenario
  - `name` (text) - Scenario name (e.g., "Opening Statements")
  - `description` (text) - Description of what happens in this scenario
  - `created_at` (timestamptz) - When the scenario was created

  ### `participants`
  Stores participant configurations (Judge, Defense Attorney, Jury)
  - `id` (uuid, primary key) - Unique identifier
  - `role` (text) - Role name (judge, defense, jury)
  - `display_name` (text) - Display name for the UI
  - `voice_id` (text) - ElevenLabs voice ID
  - `persona` (text) - Persona description for AI mode
  - `avatar_url` (text, optional) - URL to avatar image
  - `created_at` (timestamptz) - When created

  ### `dialogue_lines`
  Stores scripted dialogue lines for scenarios
  - `id` (uuid, primary key) - Unique identifier
  - `scenario_id` (uuid, foreign key) - References scenarios table
  - `participant_role` (text) - Role of the speaker (judge, defense, jury)
  - `text` (text) - The dialogue text to be spoken
  - `order_index` (integer) - Order of this line in the scenario
  - `created_at` (timestamptz) - When created

  ## Security
  - Enable RLS on all tables
  - Allow public read access for scenarios and participants (demo app)
  - Allow authenticated users to create/manage their own scenarios
*/

-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL UNIQUE,
  display_name text NOT NULL,
  voice_id text NOT NULL,
  persona text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create dialogue_lines table
CREATE TABLE IF NOT EXISTS dialogue_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  participant_role text NOT NULL,
  text text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dialogue_lines_scenario_id ON dialogue_lines(scenario_id);
CREATE INDEX IF NOT EXISTS idx_dialogue_lines_order ON dialogue_lines(scenario_id, order_index);

-- Enable Row Level Security
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access for demo purposes
CREATE POLICY "Public can view scenarios"
  ON scenarios FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view participants"
  ON participants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view dialogue lines"
  ON dialogue_lines FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to insert scenarios (for future functionality)
CREATE POLICY "Authenticated users can create scenarios"
  ON scenarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can create dialogue lines"
  ON dialogue_lines FOR INSERT
  TO authenticated
  WITH CHECK (true);
