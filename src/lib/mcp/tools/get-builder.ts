import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getBuilderBySlug } from "@/lib/services/builders";

export default defineTool({
  name: "get_builder",
  title: "Get builder intelligence report",
  description:
    "Fetch the full NestHunt Builder Intelligence report: trust score, strengths, watch-outs, delivery timeline and verdict.",
  inputSchema: {
    slug: z.string().describe("The builder slug, e.g. 'omaxe'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const builder = await getBuilderBySlug(slug);
    if (!builder) {
      return {
        content: [{ type: "text", text: `No builder found for slug '${slug}'.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(builder, null, 2) }],
      structuredContent: { builder },
    };
  },
});
