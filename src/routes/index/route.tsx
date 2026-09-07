import { createFileRoute } from "@tanstack/react-router";
import { About } from "./components/-About";
import { LandingPage } from "./components/-LandingPage";
import { SiteNavbar } from "../../components/SiteNavbar";

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
