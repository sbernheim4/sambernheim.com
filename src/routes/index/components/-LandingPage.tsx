export const LandingPage = () => {
  return (
    <section className="landing">
      <div className="landing__content">
        <div className="landing__copy">
          <p className="landing__eyebrow">Software engineer · New York</p>
          <h1>Engineering thoughtful software systems.</h1>
          <p className="landing__intro">
            I work on products, tools, and ideas to make complex things feel a little simpler.
          </p>
          <div className="landing__links">
            <a href="/blog">
              Read my blog <span>↗</span>
            </a>
            <a href="#about">
              About me <span>↓</span>
            </a>
          </div>
        </div>
        <div className="landing__mark" aria-hidden="true">
          <span>
            Samuel
            <br />
            Bernheim
          </span>
          <span className="landing__mark-line" />
        </div>
      </div>
    </section>
  );
};
