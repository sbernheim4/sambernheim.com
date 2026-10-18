import { CommandLink } from "./CommandLink";
import "./styles/navbar.css";

export const SiteNavbar = () => {
  return (
    <nav className="navbar">
      <CommandLink to="/" id="main">
        Home
      </CommandLink>
      <div className="navbar__line-container">
        <hr />
      </div>
      <CommandLink to="/blog">Blog</CommandLink>
    </nav>
  );
};
