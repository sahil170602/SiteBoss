import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khuhmpnzecoudjsiiskd.supabase.co'
const supabaseKey = 'sb_publishable_YM_eSNleizLnlIlYUJ8wNg_XCKAIso5'

export const supabase = createClient(supabaseUrl, supabaseKey)