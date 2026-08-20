
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function check() {
  const { data: projects, error: pErr } = await supabaseAdmin
    .from("projects")
    .select("id, slug, name, rera_number, property_type, summary, builder_id, place_id, publish_status")
    .in("slug", ["intake-test-alpha", "intake-test-beta", "sparse-intake-project", "rera-intake-project"]);
  
  if (pErr) throw pErr;
  console.log("PROJECTS:", JSON.stringify(projects, null, 2));
  
  if (projects && projects.length > 0) {
    const ids = projects.map(p => p.id);
    const { data: gov, error: gErr } = await supabaseAdmin
      .from("project_governance")
      .select("*")
      .in("project_id", ids);
    
    if (gErr) throw gErr;
    console.log("GOVERNANCE:", JSON.stringify(gov, null, 2));
    
    const { data: entities, error: eErr } = await supabaseAdmin
      .from("decision_entities")
      .select("*")
      .eq("entity_type", "project")
      .in("entity_id", ids);
    
    if (eErr) throw eErr;
    console.log("DECISION_ENTITIES:", JSON.stringify(entities, null, 2));
    
    const entityIds = entities?.map(e => e.id) || [];
    if (entityIds.length > 0) {
      const { data: scores, error: sErr } = await supabaseAdmin
        .from("decision_scores")
        .select("*")
        .in("decision_entity_id", entityIds);
      
      if (sErr) throw sErr;
      console.log("SCORES_COUNT:", scores?.length || 0);
    } else {
      console.log("SCORES_COUNT: 0 (No entities)");
    }
  }
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
