
import { ProjectIntakeFactory, IntakeRecord } from "./src/lib/project-intake-factory";
import { supabase } from "./src/integrations/supabase/client";

const BATCH: IntakeRecord[] = [
  // A. Valid projects
  {
    name: "Intake Test Alpha",
    slug: "intake-test-alpha",
    builder_slug: "omaxe",
    place_slug: "new-chandigarh",
    rera_number: "PBRERA-INT-001",
    property_type: "Apartment"
  },
  {
    name: "Intake Test Beta",
    slug: "intake-test-beta",
    builder_slug: "omaxe",
    place_slug: "new-chandigarh",
    rera_number: "PBRERA-INT-002"
  },
  // B. Duplicate test (Gardenia Floors exists)
  {
    name: "Gardenia Floors Duplicate",
    slug: "gardenia-floors",
    builder_slug: "omaxe",
    place_slug: "new-chandigarh"
  },
  // C. Missing optional data test
  {
    name: "Sparse Intake Project",
    slug: "sparse-intake-project",
    builder_slug: "omaxe",
    place_slug: "new-chandigarh"
  },
  // D. RERA test
  {
    name: "RERA Intake Project",
    slug: "rera-intake-project",
    builder_slug: "omaxe",
    place_slug: "new-chandigarh",
    rera_number: "PBRERA-SAS80-PR8888"
  },
  // E. Relationship failure test (Missing builder)
  {
    name: "Missing Builder Project",
    slug: "missing-builder-project",
    place_slug: "new-chandigarh"
  },
  // E. Relationship failure test (Invalid place)
  {
    name: "Invalid Place Project",
    slug: "invalid-place-project",
    builder_slug: "omaxe",
    place_slug: "non-existent-place"
  }
];

async function run() {
  console.log("Starting Batch Run 1...");
  const results1 = await ProjectIntakeFactory.processBatch(BATCH);
  console.log("Run 1 Results:", JSON.stringify(results1, null, 2));

  console.log("\nStarting Batch Run 2 (Idempotency)...");
  const results2 = await ProjectIntakeFactory.processBatch(BATCH);
  console.log("Run 2 Results:", JSON.stringify(results2, null, 2));
}

run().catch(console.error);
