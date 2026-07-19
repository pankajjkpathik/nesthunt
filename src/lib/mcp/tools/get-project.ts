import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getProjectBySlug } from "@/lib/services/projects";

export default defineTool({
  name: "get_project",
  title: "Get project intelligence report",
  description:
    "Fetch the full NestHunt Project Intelligence report: metrics, suitability, strengths, risks, legal snapshot, and construction progress.",
  inputSchema: {
    slug: z.string().describe("The project slug, e.g. 'hero-homes'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const project = await getProjectBySlug(slug);
    if (!project) {
      return {
        content: [{ type: "text", text: `No project found for slug '${slug}'.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
      structuredContent: { project },
    };
  },
});
