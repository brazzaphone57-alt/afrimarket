// ============================================================
// CLIENT SUPABASE PARTAGE - AFRIMARKET
// A inclure APRES le script CDN Supabase, sur toutes les pages
// qui ont besoin de la base de donnees (login, index, vendeur, panier...)
// ============================================================

const SUPABASE_URL = "https://iqdrwtppjgkiwhfhcwrl.supabase.co";
const SUPABASE_KEY = "sb_publishable_a2h686i4poNy-CJQL_1H8g_udp6caAn";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);