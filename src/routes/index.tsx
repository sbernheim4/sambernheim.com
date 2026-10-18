import "./index/styles/route.css";
import { createFileRoute } from "@tanstack/react-router";
import { About } from "./../pages/home/About";
import { LandingPage } from "./../pages/home/LandingPage";
import { useTheme } from "../shared/theme/ThemeProvider";

const Home = () => {
  const { theme } = useTheme();

  return (
    <>
      <main data-theme={theme}>
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
