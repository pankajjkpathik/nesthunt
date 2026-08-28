import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/api/public/sitemap")({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = "https://www.nesthunt.in";
        
        // Fetch published builders
        const { data: builders } = await supabase
          .from("builders")
          .select("slug, updated_at")
          .eq("status", "published");

        // Fetch published projects
        const { data: projects } = await supabase
          .from("projects")
          .select("slug, updated_at, governance:project_governance!inner(record_classification)")
          .eq("publish_status", "published")
          // LAUNCH-002S: only PRODUCTION-classified projects are indexable
          .eq("project_governance.record_classification", "PRODUCTION");

        const staticPages = [
          "/",
          
        ];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Add static pages
        for (const page of staticPages) {
          xml += '<url>';
          xml += `<loc>${baseUrl}${page}</loc>`;
          xml += '<changefreq>weekly</changefreq>';
          xml += '<priority>0.8</priority>';
          xml += '</url>';
        }

        // Add builders
        if (builders) {
          for (const builder of builders) {
            xml += '<url>';
            xml += `<loc>${baseUrl}/builders/${builder.slug}</loc>`;
            xml += `<lastmod>${new Date(builder.updated_at).toISOString().split('T')[0]}</lastmod>`;
            xml += '<changefreq>weekly</changefreq>';
            xml += '<priority>0.7</priority>';
            xml += '</url>';
          }
        }

        // Add projects
        if (projects) {
          for (const project of projects) {
            xml += '<url>';
            xml += `<loc>${baseUrl}/projects/${project.slug}</loc>`;
            xml += `<lastmod>${new Date(project.updated_at).toISOString().split('T')[0]}</lastmod>`;
            xml += '<changefreq>weekly</changefreq>';
            xml += '<priority>0.7</priority>';
            xml += '</url>';
          }
        }

        xml += '</urlset>';

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
