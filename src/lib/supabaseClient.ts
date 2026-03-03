
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sliqijfwkikkjqaepxuz.supabase.co';
const supabaseAnonKey = 'sb_publishable_RU5MN4csKxyhNj3JAG5r4A_HA8_H1dt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
