import { defineTool } from "@lovable.dev/mcp-js";
import { newChandigarh } from "@/mocks";

export default defineTool({
  name: "list_places",
  title: "List places",
  description: "List all locations covered by NestHunt Place Intelligence reports.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const places = [newChandigarh].map((p) => ({
      slug: p.slug,
      name: p.name,
      region: p.region,
      decisionScore: p.decision.score,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(places, null, 2) }],
      structuredContent: { places },
    };
  },
});
