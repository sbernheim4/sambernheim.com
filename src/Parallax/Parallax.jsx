import React, { Component } from "react";
import './parallax.scss';

class Parallax extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const backgroundImageUrl = this.props.url;

        const style = {
            background: `url(${backgroundImageUrl}`,
        }

        return (
            <section style={style} className='parallax'>
            </section>

        );
    }
}

export default Parallax;
