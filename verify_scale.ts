
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function verify() {
  const testSlugs = [
    "scale-test-1", "scale-test-2", "scale-test-3", "scale-test-4", "scale-test-5",
    "scale-test-6", "scale-test-7", "scale-test-8", "scale-test-9", "scale-test-10",
    "repeated-builder-1", "repeated-builder-2", "repeated-place-1", "repeated-place-2"
  ];

  const { data: projects } = await supabaseAdmin.from("projects").select("id, slug, publish_status").in("slug", testSlugs);
  console.log("TOTAL PROJECTS CREATED:", projects?.length || 0);

  if (projects) {
    const ids = projects.map(p => p.id);
    
    // Verify Decision Entities
    const { data: entities } = await supabaseAdmin.from("decision_entities").select("id").in("entity_id", ids);
    console.log("DECISION ENTITIES REGISTERED:", entities?.length || 0);
    
    // Verify Governance
    const { data: gov } = await supabaseAdmin.from("project_governance").select("id").in("project_id", ids);
    console.log("GOVERNANCE RECORDS REGISTERED:", gov?.length || 0);

    // Verify Publication Status
    const nonDraft = projects.filter(p => p.publish_status !== 'draft');
    console.log("NON-DRAFT PROJECTS (Should be 0):", nonDraft.length);

    if (projects.length !== entities?.length || projects.length !== gov?.length) {
      console.error("INTEGRITY FAILURE: Count mismatch between projects, entities, and governance.");
      process.exit(1);
    }
  }

  // Verify Gardenia remains unchanged (should have been skipped as duplicate)
  const { data: gardenia } = await supabaseAdmin.from("projects").select("publish_status").eq("slug", "gardenia-floors").single();
  console.log("GARDENIA STATUS (Should be published):", gardenia?.publish_status);
  
  if (gardenia?.publish_status !== 'published') {
    console.error("REGRESSION: Gardenia Floors publication status was modified!");
    process.exit(1);
  }
}

verify().catch(e => {
  console.error("Verification Failed:", e);
  process.exit(1);
});
