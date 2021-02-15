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

	componentDidMount() {
        const installGoogleAds = () => {
          const elem = document.createElement("script");
          elem.setAttribute("data-ad-client", "ca-pub-9227562150155157");
          elem.setAttribute("async", true);
          elem.src =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
          document.head.appendChild(elem);
        };
        installGoogleAds();
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