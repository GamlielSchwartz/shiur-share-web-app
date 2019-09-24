import React from 'react';
import './App.css';
import KiddushLevana from './components/kiddushlevana';
import SideNav from './components/SideNav';

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currZipcode: '',
			newDate: null,
			sidebarData: null,
		}
		this.setZipcode = this.setZipcode.bind(this);
		this.setNewDate = this.setNewDate.bind(this);
		this.setSidebarData = this.setSidebarData.bind(this);
	}

	setZipcode(zipcode) {
		this.setState({ 
			currZipcode: zipcode,
			sidebarData: null,
			//reset sidebar on change, easiest thing to do, would be better to change sidebar data
		});
	}

	setNewDate(date) {
		this.setState({ newDate: date });
	}

	setSidebarData(data){
		this.setState({sidebarData: data});
	}

	render() {
		return (
			<div>
				<SideNav
					setZipcode={this.setZipcode}
					sidebarData={this.state.sidebarData}
					innerComponent=
						{<KiddushLevana
							zipcode={this.state.currZipcode}
							setNewDate={this.setNewDate}
							newDate={this.state.newDate}
							setSidebarData={this.setSidebarData}
						/>}
				/>
			</div>
		);
	}
}