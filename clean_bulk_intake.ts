
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function clean() {
  // Broad cleanup based on name pattern or explicit slugs
  const testSlugs = [
    "scale-test-1", "scale-test-2", "scale-test-3", "scale-test-4", "scale-test-5",
    "scale-test-6", "scale-test-7", "scale-test-8", "scale-test-9", "scale-test-10",
    "duplicate-slug-test", "rera-dup-test", "incomplete-scale-test", "no-rera-scale-test",
    "repeated-builder-1", "repeated-builder-2", "repeated-place-1", "repeated-place-2"
  ];

  const { data: projs, error: pErr } = await supabaseAdmin.from("projects").select("id").in("slug", testSlugs);
  
  if (pErr) {
    console.error("Fetch error:", pErr);
    return;
  }

  if (projs && projs.length > 0) {
    const ids = projs.map(p => p.id);
    await supabaseAdmin.from("decision_entities").delete().eq("entity_type", "project").in("entity_id", ids);
    await supabaseAdmin.from("project_governance").delete().in("project_id", ids);
    await supabaseAdmin.from("projects").delete().in("id", ids);
    console.log("CLEANED BULK TEST:", ids.length, "projects");
  } else {
    console.log("Nothing to clean in bulk test.");
  }
}

clean().catch(e => {
    console.error(e);
    process.exit(1);
});
