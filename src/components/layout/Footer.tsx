import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Places", to: "/places/new-chandigarh" as const },
      { label: "Builders", to: "/builders" as const },
      { label: "Projects", to: "/project/hero-homes" as const },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/" as const },
      { label: "Contact", to: "/" as const },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Privacy", to: "/" as const },
      { label: "Terms", to: "/" as const },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="max-w-sm">
            <span className="font-display text-base font-bold tracking-tight text-foreground">
              NestHunt
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              NestHunt is building India's trusted Property Decision Intelligence
              Platform.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border py-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Make your next property decision with confidence.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NestHunt. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
