import { defineTool } from "@lovable.dev/mcp-js";
import { listProjects } from "@/lib/services/projects";

export default defineTool({
  name: "list_projects",
  title: "List all projects",
  description:
    "List every NestHunt Project with its slug, name, status, and short summary. Use `get_project` to fetch the full report.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const rows = await listProjects();
    const projects = rows.map((p) => ({
      slug: p.slug,
      name: p.name,
      status: p.status,
      summary: p.summary,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
      structuredContent: { projects },
    };
  },
});
