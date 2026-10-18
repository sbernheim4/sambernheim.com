import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { CommandExternalLink } from "./CommandExternalLink";
import { CommandLink } from "./CommandLink";
import resumeUrl from "../../Sam Bernheim Resume.pdf";
import "./styles/navbar.css";

export const SiteNavbar = () => {
  const { pathname } = useLocation();
  const isArticle = pathname.startsWith("/blog/");
  const [progress, setProgress] = useState(0);

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
    </nav>
  );
};
