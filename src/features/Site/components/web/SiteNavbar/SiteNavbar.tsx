import { useLocation } from "@tanstack/react-router";
import { useIsFetching } from "@tanstack/react-query";
import { LoaderCircle, Moon, Search, Sun } from "lucide-react";
import { useCommandPalette } from "../../../../CommandPalette/model";
import { CommandExternalLink } from "../../../../CommandPalette/components/web/CommandExternalLink";
import { CommandLink } from "../../../../CommandPalette/components/web/CommandLink";
import { SiteNavigationActions } from "../SiteNavigationActions";
import { useTheme } from "../../../../Theme/ThemeProvider";
import { useArticleReadingProgress } from "../../../hooks/useArticleReadingProgress";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../UI/components/ui/tooltip";
import resumeUrl from "../../../../../Sam Bernheim Resume.pdf";
import "./SiteNavbar.css";

export const SiteNavbar = () => {
  const { pathname } = useLocation();
  const { toggle } = useCommandPalette();
  const { theme, toggleTheme } = useTheme();
  const isFetching = useIsFetching() > 0;
  const isApplePlatform =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const commandShortcut = isApplePlatform ? "⌘ K" : "Ctrl K";
  const isArticle = pathname.startsWith("/blog/");
  const progress = useArticleReadingProgress(isArticle);
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <>
      <nav
        className={`navbar${isArticle ? " navbar--article" : ""}${pathname === "/" ? " navbar--home" : ""}`}
      >
        <CommandLink to="/" id="main" command={false}>
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
          <CommandLink to="/blog" command={false}>
            Blog
          </CommandLink>
          <CommandLink to="/experiments" command={false}>
            Experiments
          </CommandLink>
          <CommandExternalLink
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Resume"
            command={false}
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
                {isFetching ? (
                  <LoaderCircle
                    className="navbar__loading-icon"
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                ) : theme === "light" ? (
                  <Moon size={17} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Sun size={17} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {isFetching
                ? `Loading data · switch to ${nextTheme} mode`
                : `Switch to ${nextTheme} mode`}
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
      <SiteNavigationActions />
    </>
  );
};
