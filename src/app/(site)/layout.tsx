import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getServices, getSite } from "@/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, services] = await Promise.all([getSite(), getServices()]);

  return (
    <div className="bg-ground flex min-h-screen flex-col">
      <Header navItems={site.nav} ctaLabel={site.ctaLabels.header} />
      <main id="main-content" tabIndex={-1} className="figure-counter-scope flex-1 outline-none">
        {children}
      </main>
      <Footer
        site={site}
        services={services.map(({ slug, shortTitle }) => ({ slug, shortTitle }))}
      />
    </div>
  );
}
