import "./index/styles/route.css";
import { createFileRoute } from "@tanstack/react-router";
import { About } from "./../pages/home/About";
import { LandingPage } from "./../pages/home/LandingPage";

const Home = () => {
  return (
    <>
      <main>
        <LandingPage />
        <About />
      </main>
    </>
  );
};

export const Route = createFileRoute("/")({
  head: () => {
    return {
      meta: [{ title: "Samuel Bernheim" }],
    };
  },
  component: Home,
});
