import { createFileRoute, Link } from "@tanstack/react-router";
import { About } from "../site/components/About";
import { LandingPage } from "../site/components/LandingPage";
import { SiteNavbar } from "../site/components/SiteNavbar";

const Home = () => {
  return (
    <>
      <SiteNavbar />
      <main className="site-home">
        <LandingPage />
        <About />
        <section className="home-routes" aria-label="Examples">
          <Link to="/editor" className="route-card">
            Code Editor
          </Link>
          <Link to="/forms" className="route-card">
            Form Examples
          </Link>
        </section>
      </main>
    </>
  );
};

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});
