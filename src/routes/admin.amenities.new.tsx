import { createFileRoute } from "@tanstack/react-router";
import { AmenityEditor } from "./admin.amenities.$id";

export const Route = createFileRoute("/admin/amenities/new")({
  component: () => <AmenityEditor />,
});
