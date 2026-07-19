import { defineTool } from "@lovable.dev/mcp-js";
import { omaxe } from "@/mocks";

export default defineTool({
  name: "list_builders",
  title: "List builders",
  description: "List all builders covered by NestHunt Builder Trust reports.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const builders = [omaxe].map((b) => ({
      slug: b.slug,
      name: b.name,
      headquarters: b.headquarters,
      trustScore: b.decision.score,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(builders, null, 2) }],
      structuredContent: { builders },
    };
  },
});
