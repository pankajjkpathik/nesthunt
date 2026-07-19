import { defineTool } from "@lovable.dev/mcp-js";
import { listBuilders } from "@/lib/services/builders";

export default defineTool({
  name: "list_builders",
  title: "List all builders",
  description:
    "List every NestHunt Builder with its slug, name, headquarters, and short summary. Use `get_builder` to fetch the full trust report.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const rows = await listBuilders();
    const builders = rows.map((b) => ({
      slug: b.slug,
      name: b.name,
      headquarters: b.headquarters,
      summary: b.summary,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(builders, null, 2) }],
      structuredContent: { builders },
    };
  },
});
