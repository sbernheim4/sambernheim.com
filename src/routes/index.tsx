import { createFileRoute } from "@tanstack/react-router";
import { About } from "../components/site/About";
import { LandingPage } from "../components/site/LandingPage";
import { SiteNavbar } from "../components/site/SiteNavbar";

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
