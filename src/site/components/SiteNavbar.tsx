import { Link } from "@tanstack/react-router";

export const SiteNavbar = () => {
  return (
    <nav className="site-navbar">
      <Link to="/" className="site-navbar-main">
        Home
      </Link>
      <span className="site-navbar-line" />
      <Link to="/blog">Blog</Link>
    </nav>
  );
};
