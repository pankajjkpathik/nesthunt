
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function checkTable() {
  const { data, error } = await supabaseAdmin.from("project_governance").select("*").limit(5);
  console.log("Governance data check:", { data, error });
  
  if (error && error.code === 'PGRST204') {
    console.log("Table project_governance not found in schema cache.");
  }
}
checkTable().catch(console.error);
