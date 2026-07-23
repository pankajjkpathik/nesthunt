import { createFileRoute } from "@tanstack/react-router";
import { BuilderEditor } from "@/components/admin/BuilderEditor";

export const Route = createFileRoute("/admin/builders/new")({
  component: () => <BuilderEditor />,
});
