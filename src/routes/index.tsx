import { createFileRoute } from "@tanstack/react-router";
import { About } from "../site/components/About";
import { LandingPage } from "../site/components/LandingPage";
import { SiteNavbar } from "../site/components/SiteNavbar";

const Home = () => {
  return (
    <>
      <SiteNavbar />
      <main>
        <LandingPage />
        <About />
      </main>
    </>
  );
};

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});
