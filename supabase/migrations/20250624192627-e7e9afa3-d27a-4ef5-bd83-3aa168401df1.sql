
-- First, let's add the missing columns and types that don't exist yet

-- Create debt_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE debt_type AS ENUM (
        'credit_card',
        'student_loan', 
        'mortgage',
        'personal_loan',
        'auto_loan',
        'family_loan',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment_frequency enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE payment_frequency AS ENUM (
        'weekly',
        'biweekly', 
        'monthly',
        'quarterly'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    email text,
    full_name text,
    monthly_income decimal(12,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Update existing debts table with new columns
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS debt_type debt_type,
ADD COLUMN IF NOT EXISTS principal_amount decimal(12,2),
ADD COLUMN IF NOT EXISTS current_balance decimal(12,2),
ADD COLUMN IF NOT EXISTS is_variable_rate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lender text,
ADD COLUMN IF NOT EXISTS remaining_term_months integer,
ADD COLUMN IF NOT EXISTS is_tax_deductible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_frequency payment_frequency DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS is_high_priority boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS days_past_due integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes text;

-- Update existing payments table with new columns
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS payment_date date,
ADD COLUMN IF NOT EXISTS principal_portion decimal(10,2),
ADD COLUMN IF NOT EXISTS interest_portion decimal(10,2),
ADD COLUMN IF NOT EXISTS notes text;

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    allocated_amount decimal(10,2) NOT NULL,
    spent_amount decimal(10,2) DEFAULT 0,
    category_type text NOT NULL, -- 'needs', 'wants', 'savings'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_check_in date,
    total_payments_logged integer DEFAULT 0,
    milestones_achieved text[], -- Array of milestone names
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create ai_recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type text NOT NULL, -- 'snowball', 'avalanche', 'refinance'
    title text NOT NULL,
    description text NOT NULL,
    potential_savings decimal(10,2),
    priority_score integer DEFAULT 0,
    is_dismissed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create bank_connections table
CREATE TABLE IF NOT EXISTS public.bank_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_name text NOT NULL,
    access_token_encrypted text, -- Encrypted Plaid access token
    is_active boolean DEFAULT true,
    last_sync timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON public.profiles
        FOR ALL USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own budget" ON public.budget_categories
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own streaks" ON public.user_streaks
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own recommendations" ON public.ai_recommendations
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own bank connections" ON public.bank_connections
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'full_name'
    );
    
    -- Initialize user streak record
    INSERT INTO public.user_streaks (user_id)
    VALUES (new.id);
    
    RETURN new;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to calculate debt metrics
CREATE OR REPLACE FUNCTION public.calculate_debt_metrics(user_uuid uuid)
RETURNS TABLE (
    total_debt decimal,
    total_minimum_payments decimal,
    debt_count integer,
    high_priority_count integer,
    average_interest_rate decimal
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(current_balance), 0) as total_debt,
        COALESCE(SUM(minimum_payment), 0) as total_minimum_payments,
        COUNT(*)::integer as debt_count,
        COUNT(*) FILTER (WHERE is_high_priority = true)::integer as high_priority_count,
        COALESCE(AVG(interest_rate), 0) as average_interest_rate
    FROM public.debts
    WHERE user_id = user_uuid;
END;
$$;
