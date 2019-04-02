import React, { Component } from "react";
import './about.scss';

class About extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    render() {
        return (
            <section className='about'>
                <svg viewBox="0 0 500 80">
                    <polygon points="40,80 500,80  500,0" />
                    <text x="380" y="60" font-size="24px" fill="black">About Me</text>
                </svg>

                <div>
                    <h1>About Me</h1>
                    <br/>
                    <p>In addition to my work as a software engineer I have many other interests. I love to play soccer, ultimate frisbee, and tennis, as well as ski and kyak.</p>
                    <p>I love reading historical fiction and fantasy novels, and am an avid fan of science fiction and politcal TV shows</p>
                    <p>I also greatly enjoy following political and economic events, cooking, baking, and of course eating.</p>
                </div>
            </section>

        );
    }
}

export default About;
