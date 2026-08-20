
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function verifyTableExists() {
  try {
    const res = await supabaseAdmin.rpc("get_table_info", { t_name: "project_governance" });
    console.log("RPC check result:", res);
  } catch (e) {
    console.log("RPC check failed:", e);
  }

  try {
    const res = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "project_governance");
    
    console.log("Information Schema check result:", res);
  } catch (e) {
    console.log("Information Schema check failed:", e);
  }
}
verifyTableExists().catch(console.error);
