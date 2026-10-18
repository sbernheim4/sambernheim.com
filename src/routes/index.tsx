import "./index/styles/route.css";
import { createFileRoute } from "@tanstack/react-router";
import { About } from "./../pages/home/About";
import { LandingPage } from "./../pages/home/LandingPage";
import { SiteNavbar } from "../shared/components/SiteNavbar";

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
  head: () => {
    return {
      meta: [{ title: "Samuel Bernheim" }],
    };
  },
  component: Home,
});
