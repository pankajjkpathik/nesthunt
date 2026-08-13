import { supabase } from "./src/integrations/supabase/client";

async function check() {
  const { data, error } = await supabase.rpc('get_table_info', { t_name: 'projects' });
  // If no RPC, we try to just fetch one and see what's in there
  const { data: one, error: err } = await supabase.from('projects').select('*').limit(1);
  console.log("Existing project sample:", JSON.stringify(one, null, 2));
}
check();
