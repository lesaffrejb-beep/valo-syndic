import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase environment variables are missing. Please check your .env.local file.'
    );
}

// Typage minimal (any) comme demandé pour l'instant
// Fallback sur des valeurs bidons pour éviter le crash du build si les variables manquent
// (ex: environnement CI/CD sans secrets, ou build local strict)
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);
