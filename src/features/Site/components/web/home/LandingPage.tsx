import { CycleableDate } from "@/features";
import { ArrowDown, ArrowUp, ArrowUpRight } from "lucide-react";

export const LandingPage = () => {
  return (
    <section className="landing">
      <div className="landing__content">
        <div className="landing__copy">
          <p className="landing__eyebrow">Software engineer · New York</p>
          <h1>Engineering thoughtful software systems.</h1>
          <p className="landing__intro">
            I work on products, tools, and ideas to make complex systems feel simpler.
          </p>
          <div className="landing__links">
            <a href="/blog">
              Read my blog <ArrowUp aria-hidden="true" size={17} />
            </a>
            <a href="#about">
              About me <ArrowDown aria-hidden="true" size={17} />
            </a>
            <a href="/experiments">
              Explore experiments <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          </div>
        </div>
        <div className="landing__mark">
          <span>
            Samuel
            <br />
            Bernheim
          </span>
          <span className="landing__established">
            Working since{" "}
            <CycleableDate className="landing__established-date" value="2018-06-04T00:00:00.000Z" />
          </span>
          <span className="landing__mark-line" />
        </div>
      </div>
    </section>
  );
};
