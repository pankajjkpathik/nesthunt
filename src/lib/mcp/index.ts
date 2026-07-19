import { defineMcp } from "@lovable.dev/mcp-js";
import listPlaces from "./tools/list-places";
import getPlace from "./tools/get-place";
import listBuilders from "./tools/list-builders";
import getBuilder from "./tools/get-builder";
import listProjects from "./tools/list-projects";
import getProject from "./tools/get-project";

export default defineMcp({
  name: "nesthunt-mcp",
  title: "NestHunt Property Decision Intelligence",
  version: "0.1.0",
  instructions:
    "Read-only access to NestHunt's Property Decision Intelligence reports. Use list_places / list_builders / list_projects to discover slugs, then get_place / get_builder / get_project for the full report (decision score, strengths, risks, verdict).",
  tools: [listPlaces, getPlace, listBuilders, getBuilder, listProjects, getProject],
});
