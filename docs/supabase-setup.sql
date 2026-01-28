-- Create vocabularies table
CREATE TABLE IF NOT EXISTS public.vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  ipa TEXT,
  definition TEXT,
  example TEXT,
  category TEXT DEFAULT 'General',
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vocabularies_user_id ON public.vocabularies(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabularies_created_at ON public.vocabularies(created_at);
CREATE INDEX IF NOT EXISTS idx_vocabularies_category ON public.vocabularies(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.vocabularies ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own vocabularies
CREATE POLICY "Users can view own vocabularies"
  ON public.vocabularies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own vocabularies
CREATE POLICY "Users can insert own vocabularies"
  ON public.vocabularies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own vocabularies
CREATE POLICY "Users can update own vocabularies"
  ON public.vocabularies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own vocabularies
CREATE POLICY "Users can delete own vocabularies"
  ON public.vocabularies
  FOR DELETE
  USING (auth.uid() = user_id);

