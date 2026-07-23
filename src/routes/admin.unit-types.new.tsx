import { createFileRoute } from "@tanstack/react-router";
import { UnitTypeEditor } from "./admin.unit-types.$id";

export const Route = createFileRoute("/admin/unit-types/new")({
  component: () => <UnitTypeEditor />,
});
