import { defineTool } from "@lovable.dev/mcp-js";
import { heroHomes } from "@/mocks";

export default defineTool({
  name: "list_projects",
  title: "List projects",
  description: "List all residential projects covered by NestHunt Project Intelligence reports.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const projects = [heroHomes].map((p) => ({
      slug: p.slug,
      name: p.name,
      status: p.status,
      priceRange: p.metrics.priceRange,
      possessionYear: p.metrics.possessionYear,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
      structuredContent: { projects },
    };
  },
});
