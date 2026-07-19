import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { newChandigarh } from "@/mocks";

const places = { [newChandigarh.slug]: newChandigarh };

export default defineTool({
  name: "get_place",
  title: "Get place intelligence report",
  description:
    "Fetch the full NestHunt Place Intelligence report for a location: executive summary, decision score, category ratings, opportunities, risks, and verdict.",
  inputSchema: {
    slug: z.string().describe("The place slug, e.g. 'new-chandigarh'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const place = places[slug];
    if (!place) {
      return {
        content: [{ type: "text", text: `No place found for slug '${slug}'.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(place, null, 2) }],
      structuredContent: { place },
    };
  },
});
