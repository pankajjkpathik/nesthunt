import { createFileRoute } from "@tanstack/react-router";
import { PlaceEditor } from "@/components/admin/PlaceEditor";

export const Route = createFileRoute("/admin/places/$id")({
  component: EditPlace,
});

function EditPlace() {
  const { id } = Route.useParams();
  return <PlaceEditor id={id} />;
}
