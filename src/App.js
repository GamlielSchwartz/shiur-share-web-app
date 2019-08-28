import React from 'react';
import './App.css';
import KiddushLevana from './components/kiddushlevana';
import SideNav from './components/SideNav';

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			moladInfo: {
				molad: null,
				location: 'Jerusalem',
			},
			currZipcode: '',
			newDate: null,
		}
		this.setMolad = this.setMolad.bind(this);
		this.setZipcode = this.setZipcode.bind(this);
		this.setNewDate = this.setNewDate.bind(this);
	}

	setMolad(moladInfo) {
		this.setState({ moladInfo: moladInfo });
	}

	setZipcode(zipcode) {
		this.setState({ currZipcode: zipcode });
	}

	setNewDate(date) {
		this.setState({ newDate: date });
	}

	render() {
		return (
			<div>
				<SideNav
					moladInfo={this.state.moladInfo}
					setZipcode={this.setZipcode}
					setNewDate={this.setNewDate}
					innerComponent=
					{<KiddushLevana
						setMoladInSidebar={this.setMolad}
						zipcode={this.state.currZipcode}
						setNewDate={this.setNewDate}
						newDate={this.state.newDate}
					/>}
				/>
			</div>
		);
	}
}