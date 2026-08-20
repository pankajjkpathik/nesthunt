
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function verifyTableExists() {
  const { data, error } = await supabaseAdmin.rpc("get_table_info", { t_name: "project_governance" }).catch(e => ({ error: e }));
  console.log("RPC check:", { data, error });

  // Direct SQL via REST if possible? No, but let's try a query on information_schema
  const { data: info, error: iErr } = await supabaseAdmin
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")
    .eq("table_name", "project_governance")
    .maybeSingle();
  
  console.log("Information Schema check:", { info, iErr });
}
verifyTableExists().catch(console.error);
