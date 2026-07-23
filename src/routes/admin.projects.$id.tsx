import { createFileRoute, useParams } from "@tanstack/react-router";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const Route = createFileRoute("/admin/projects/$id")({
  component: EditProjectPage,
});

function EditProjectPage() {
  const { id } = useParams({ from: "/admin/projects/$id" });
  return <ProjectEditor id={id} />;
}
