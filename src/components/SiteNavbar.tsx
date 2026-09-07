import { Link } from "@tanstack/react-router";
import "../../styles/site.css";

export const SiteNavbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" id="main">
        Home
      </Link>
      <div className="navbar__line-container">
        <hr />
      </div>
      <Link to="/blog">Blog</Link>
    </nav>
  );
};
