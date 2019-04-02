import React, { Component } from "react";
import './projects.scss';


class Projects extends Component {
	constructor(props) {
		super(props);

		this.state = {

		};
	}

	render() {
		return (
			<section className="projects">
				<h1>Projects</h1>
				<p>I've worked on some pretty fun side projects, each helping me explore a new framework, technology, or platform.</p>

				<div className="projects__container">

					<div className='projects__container__project one'>
						<div className='budgeteer'>
							<h2>Budgeteer</h2>
						</div>
					</div>

					<div className='projects__container__project two'>
						<div className='weatherterm'>
							<h2>Weatherterm</h2>
						</div>
					</div>

					<div className='projects__container__project three'>
						<div className='m5systems'>
							<h2>M5Systems</h2>
						</div>
					</div>

					<div className='projects__container__project four'>
						<div className='kinetic'>
							<h2>Kinetic Global</h2>
						</div>
					</div>
				</div>
			</section>
		);
	}
}

export default Projects;
