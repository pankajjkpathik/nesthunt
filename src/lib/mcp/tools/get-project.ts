import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { heroHomes } from "@/mocks";

const projects = { [heroHomes.slug]: heroHomes };

export default defineTool({
  name: "get_project",
  title: "Get project intelligence report",
  description:
    "Fetch the full NestHunt Project Intelligence report for a project: suitability, strengths, risks, legal snapshot, and construction progress.",
  inputSchema: {
    slug: z.string().describe("The project slug, e.g. 'hero-homes'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const project = projects[slug];
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
