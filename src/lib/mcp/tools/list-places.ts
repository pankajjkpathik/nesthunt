import { defineTool } from "@lovable.dev/mcp-js";
import { listPlaces } from "@/lib/services/places";

export default defineTool({
  name: "list_places",
  title: "List all places",
  description:
    "List every NestHunt Place with its slug, name, region, and short summary. Use `get_place` to fetch the full intelligence report.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const rows = await listPlaces();
    const places = rows.map((p) => ({
      slug: p.slug,
      name: p.name,
      region: p.region,
      summary: p.summary,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(places, null, 2) }],
      structuredContent: { places },
    };
  },
});
