import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://ofkanlgwobyjxsfmkybw.supabase.co";
const SUPABASE_KEY = "sb_publishable_w_fZxT9uWxO0rYvQMEHbkA_Hw_mUkFC"; // Public Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
