import { createFileRoute } from "@tanstack/react-router";
import { InfrastructureEditor } from "./admin.infrastructure.$id";

export const Route = createFileRoute("/admin/infrastructure/new")({
  component: () => <InfrastructureEditor />,
});
