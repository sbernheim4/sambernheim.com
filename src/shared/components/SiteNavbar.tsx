import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Moon, Search, Sun } from "lucide-react";
import { useCommandPalette } from "../commands/commands";
import { useTheme } from "../theme/ThemeProvider";
import { CommandExternalLink } from "./CommandExternalLink";
import { CommandLink } from "./CommandLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import resumeUrl from "../../Sam Bernheim Resume.pdf";
import "./styles/navbar.css";

export const SiteNavbar = () => {
  const { pathname } = useLocation();
  const { toggle } = useCommandPalette();
  const { theme, toggleTheme } = useTheme();
  const isApplePlatform =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const commandShortcut = isApplePlatform ? "⌘ K" : "Ctrl K";
  const isArticle = pathname.startsWith("/blog/");
  const [progress, setProgress] = useState(0);
  const nextTheme = theme === "light" ? "dark" : "light";

  useEffect(() => {
    if (!isArticle) {
      return;
    }

    const updateProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [isArticle]);

  return (
    <nav
      className={`navbar${isArticle ? " navbar--article" : ""}${pathname === "/" ? " navbar--home" : ""}`}
    >
      <CommandLink to="/" id="main">
        Home
      </CommandLink>
      <div className="navbar__line-container">
        {isArticle ? (
          <div className="navbar__progress-track" aria-label="Article reading progress">
            <span className="navbar__progress" style={{ transform: `scaleX(${progress})` }} />
          </div>
        ) : (
          <hr />
        )}
      </div>
      <div className="navbar__actions">
        <CommandLink to="/blog">Blog</CommandLink>
        <CommandExternalLink
          href={resumeUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Resume"
          command={{ group: "Navigation" }}
        >
          Resume
        </CommandExternalLink>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="navbar__command-button"
              type="button"
              aria-label="Open command palette"
              onClick={toggle}
            >
              <Search size={17} strokeWidth={2} aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Open command palette ({commandShortcut})</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="navbar__theme-button"
              type="button"
              aria-label={`Switch to ${nextTheme} mode`}
              aria-pressed={theme === "dark"}
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon size={17} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Sun size={17} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>Switch to {nextTheme} mode</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
};
