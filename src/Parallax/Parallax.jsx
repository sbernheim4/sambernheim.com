import React, { Component } from "react";
import './parallax.scss';

class Parallax extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const backgroundImageUrl = this.props.url;
        console.log(backgroundImageUrl)

        const style = {
            //background: `linear-gradient(rgba(0, 0, 0, .65), rgba(0, 0, 0, 1)), url(${backgroundImageUrl})`,
            background: `url(${backgroundImageUrl}`,
        }

        return (
            <section style={style} className='parallax'>
            </section>

        );
    }
}

export default Parallax;
