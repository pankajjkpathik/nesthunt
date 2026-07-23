import { createFileRoute } from "@tanstack/react-router";
import { CategoryEditor } from "./admin.categories.$id";

export const Route = createFileRoute("/admin/categories/new")({
  component: () => <CategoryEditor />,
});
