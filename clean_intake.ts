
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function clean() {
  const slugs = ["intake-test-alpha", "intake-test-beta", "sparse-intake-project", "rera-intake-project"];
  const { data: projs, error: pErr } = await supabaseAdmin.from("projects").select("id").in("slug", slugs);
  
  if (pErr) {
      console.error("Fetch error:", pErr);
      return;
  }

  if (projs && projs.length > 0) {
    const ids = projs.map(p => p.id);
    await supabaseAdmin.from("decision_entities").delete().eq("entity_type", "project").in("entity_id", ids);
    await supabaseAdmin.from("project_governance").delete().in("project_id", ids);
    await supabaseAdmin.from("projects").delete().in("id", ids);
    console.log("CLEANED:", ids.length, "projects");
  } else {
    console.log("Nothing to clean.");
  }
}

clean().catch(e => {
    console.error(e);
    process.exit(1);
});
