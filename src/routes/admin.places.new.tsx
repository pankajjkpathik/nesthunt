import { createFileRoute } from "@tanstack/react-router";
import { PlaceEditor } from "@/components/admin/PlaceEditor";

export const Route = createFileRoute("/admin/places/new")({
  component: () => <PlaceEditor />,
});
