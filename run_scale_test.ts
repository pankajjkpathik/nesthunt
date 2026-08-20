
import { ProjectIntakeFactory, IntakeRecord } from "./src/lib/project-intake-factory";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

const scaleBatch: IntakeRecord[] = [
  { name: "Scale Test Project 1", slug: "scale-test-1", builder_slug: "omaxe", place_slug: "new-chandigarh", rera_number: "RERA-SCALE-001" },
  { name: "Scale Test Project 2", slug: "scale-test-2", builder_slug: "omaxe", place_slug: "new-chandigarh", rera_number: "RERA-SCALE-002" },
  { name: "Scale Test Project 3", slug: "scale-test-3", builder_slug: "omaxe", place_slug: "new-chandigarh", property_type: "Apartment" },
  { name: "Scale Test Project 4", slug: "scale-test-4", builder_slug: "hero-realty", place_slug: "new-chandigarh" },
  { name: "Scale Test Project 5", slug: "scale-test-5", builder_slug: "hero-realty", place_slug: "new-chandigarh", summary: "Scale test summary" },
  { name: "Scale Test Project 6", slug: "scale-test-6", builder_slug: "omaxe", place_slug: "new-chandigarh" },
  { name: "Scale Test Project 7", slug: "scale-test-7", builder_slug: "omaxe", place_slug: "new-chandigarh" },
  { name: "Scale Test Project 8", slug: "scale-test-8", builder_slug: "omaxe", place_slug: "new-chandigarh" },
  { name: "Scale Test Project 9", slug: "scale-test-9", builder_slug: "omaxe", place_slug: "new-chandigarh" },
  { name: "Scale Test Project 10", slug: "scale-test-10", builder_slug: "omaxe", place_slug: "new-chandigarh" },
  // Duplicate tests
  { name: "Duplicate Slug Test", slug: "gardenia-floors", builder_slug: "omaxe", place_slug: "new-chandigarh" },
  { name: "RERA Duplicate Test", slug: "rera-dup-test", builder_slug: "omaxe", place_slug: "new-chandigarh", rera_number: "PBRERA-SAS80-PR0884" },
  // Relationship failure tests
  { name: "Missing Builder Scale Test", slug: "incomplete-scale-test", place_slug: "new-chandigarh" },
  { name: "Invalid Place Scale Test", slug: "invalid-place-scale-test", builder_slug: "omaxe", place_slug: "non-existent-place" },
  // Repeated mappings tests
  { name: "Repeated Builder 1", slug: "repeated-builder-1", builder_slug: "omaxe", place_slug: "new-chandigarh" },
  { name: "Repeated Builder 2", slug: "repeated-builder-2", builder_slug: "omaxe", place_slug: "new-chandigarh" },
  { name: "Repeated Place 1", slug: "repeated-place-1", builder_slug: "hero-realty", place_slug: "new-chandigarh" },
  { name: "Repeated Place 2", slug: "repeated-place-2", builder_slug: "hero-realty", place_slug: "new-chandigarh" }
];

async function runTest() {
  console.log(`Starting Scale Batch Run 1 (Size: ${scaleBatch.length})...`);
  const results1 = await ProjectIntakeFactory.processBatch(scaleBatch);
  console.log("Run 1 Results Summary:", JSON.stringify(results1.reduce((acc: any, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {}), null, 2));

  console.log("\nStarting Scale Batch Run 2 (Idempotency)...");
  const results2 = await ProjectIntakeFactory.processBatch(scaleBatch);
  console.log("Run 2 Results Summary:", JSON.stringify(results2.reduce((acc: any, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {}), null, 2));

  // Detailed validation of a few specific cases
  const r2Created = results2.filter(r => r.status === 'CREATED');
  if (r2Created.length > 0) {
    console.error("FAILURE: Run 2 created new projects!");
    process.exit(1);
  } else {
    console.log("PASS: Idempotency maintained.");
  }
}

runTest().catch(e => {
  console.error("Scale Test Failed:", e);
  process.exit(1);
});
