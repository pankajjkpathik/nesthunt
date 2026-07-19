import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { omaxe } from "@/mocks";

const builders = { [omaxe.slug]: omaxe };

export default defineTool({
  name: "get_builder",
  title: "Get builder intelligence report",
  description:
    "Fetch the full NestHunt Builder Intelligence report for a builder: trust score, delivery history, strengths, watch-outs, and NestHunt assessment.",
  inputSchema: {
    slug: z.string().describe("The builder slug, e.g. 'omaxe'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const builder = builders[slug];
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
