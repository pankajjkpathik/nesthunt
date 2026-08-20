
import { ProjectIntakeFactory, IntakeRecord } from "./src/lib/project-intake-factory";
import { supabase } from "./src/integrations/supabase/client";

const BATCH: IntakeRecord[] = [
  // A. Valid projects
  {
    name: "Valid Project Alpha",
    slug: "valid-project-alpha",
    builder_slug: "omaxe", // Assuming 'omaxe' exists
    place_slug: "new-chandigarh",
    rera_number: "PBRERA-VAL-001",
    property_type: "Apartment"
  },
  {
    name: "Valid Project Beta",
    slug: "valid-project-beta",
    builder_slug: "omaxe",
    place_slug: "new-chandigarh",
    rera_number: "PBRERA-VAL-002"
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
    name: "Sparse Project",
    slug: "sparse-project",
    builder_slug: "omaxe",
    place_slug: "new-chandigarh"
    // No RERA, no property_type, no summary
  },
  // D. RERA test
  {
    name: "RERA Test Project",
    slug: "rera-test-project",
    builder_slug: "omaxe",
    place_slug: "new-chandigarh",
    rera_number: "PBRERA-SAS80-PR9999"
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

  // Cleanup newly created projects to keep DB clean for future runs if needed, 
  // but for the audit we should probably leave them or just check counts.
  // Actually, for the report we need the counts.
}

run().catch(console.error);
