import { createFileRoute } from "@tanstack/react-router";
import { BuilderEditor } from "@/components/admin/BuilderEditor";

export const Route = createFileRoute("/admin/builders/$id")({
  component: EditBuilder,
});

function EditBuilder() {
  const { id } = Route.useParams();
  return <BuilderEditor id={id} />;
}
