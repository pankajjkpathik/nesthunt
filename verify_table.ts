
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function verifyTableExists() {
  console.log("Checking for table project_governance...");
  const { data, error } = await supabaseAdmin.from("project_governance").select("id").limit(1);
  if (error) {
    console.log("Error selecting from project_governance:", error.message, error.code);
  } else {
    console.log("Successfully selected from project_governance. Data:", data);
  }
}
verifyTableExists().catch(console.error);
