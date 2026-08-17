import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/project/hero-homes")({
  beforeLoad: () => {
    throw redirect({
      to: "/projects/$slug",
      params: { slug: "hero-homes" },
      replace: true,
    });
  },
  loader: () => {
    throw redirect({
      to: "/projects/$slug",
      params: { slug: "hero-homes" },
      replace: true,
    });
  },
});

