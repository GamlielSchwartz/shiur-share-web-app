import React from 'react';
import calcMolad from './calcMolad.js';
import KiddushLevanaCalendar from './KiddushLevanaCalendar';
import LinearProgress from '@material-ui/core/LinearProgress';
import { HDate } from 'hebcal';
import Alert from './Alert.js';
import { formatRFC, getTransformedMonth, RFCToDateObj, numMonthsInYear } from '../utils/tools.js';
var zipcodes = require('zipcodes');
var tzlookup = require("tz-lookup");
var tz = require('timezone/loaded');
var us = tz(require("timezone/America"));
var asia = tz(require("timezone/Asia"));
require('hebcal');
var JLEM_TZ = "Asia/Jerusalem";



export default class KiddushLevana extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			latitude: '',
			longitude: '',
			timeZone: '',
			jlemMoladToHereTime: '',
			hebrewMonth: '',
			hebrewYear: '',
			moladJlem: null,
			moladAsRFCString: '',
			timeStampJlem: -1, //ts of molad in jlem this month
			moladByYou: null,
			displayedCity: "Jerusalem",
			showAlert: false,
			displayedZip: '',
			newDate: new Date(),
			moladosThisYear: [],
		}
		this.getMoladByUserWithZipCode = this.getMoladByUserWithZipCode.bind(this);
		this.setNewLocation = this.setNewLocation.bind(this);
	}

	getMoladJlem(desiredDate) {
		var hebrewYear;
		if (desiredDate) {
			hebrewYear = new HDate(desiredDate);
		} else {
			hebrewYear = new HDate();
		}

		var moladosThisYear = [];
		for (var i = 1; i <= numMonthsInYear(hebrewYear.year); i++){
			//console.log(calcMolad(hebrewYear.year, i));
			moladosThisYear.push(calcMolad(hebrewYear.year, i));
		}
		// console.log(moladosThisYear);
		var hebrewMonth = getTransformedMonth(hebrewYear);
		var molad = calcMolad(hebrewYear.year, hebrewMonth + 1);
		var moladAsRFCString = formatRFC(molad);
		this.setState({
			moladAsRFCString: moladAsRFCString,
			moladJlem: molad,
			moladByYou: molad, //start off displaying Jerusalem, then go to other location
			timeStampJlem: molad.getTime(),
			moladosThisYear: moladosThisYear,
		})
		this.props.setMoladInSidebar({ molad: molad, location: this.state.displayedCity });
	}

	componentDidMount() {
		this.getMoladJlem(new Date());
	}

	setNewLocation(lat, long, city) {
		var timeZone = tzlookup(lat, long);
		this.setState({
			timeZone: timeZone,
			displayedCity: city
		})
		var moladInLocalTime = us(asia(this.state.moladAsRFCString, JLEM_TZ), timeZone, "%F %T");
		var moladByYou = RFCToDateObj(moladInLocalTime);
		this.setState({ moladByYou: moladByYou });
		this.props.setMoladInSidebar({ molad: moladByYou, location: city });
	}

	getMoladByUserWithZipCode() {
		var data = zipcodes.lookup(this.props.zipcode);
		if (!data) {
			this.setState({ showAlert: true })
			return;
		}
		var lat = data.latitude;
		var long = data.longitude;
		var city = data.city;
		this.setNewLocation(lat, long, city);
	}

	resetAlert() {
		this.setState({
			showAlert: false,
		})
	}

	componentDidUpdate() {
		if (this.props.zipcode && this.props.zipcode !== this.state.displayedZip) {
			this.setState({ displayedZip: this.props.zipcode });
			this.getMoladByUserWithZipCode();
		}

		if (this.props.newDate && this.props.newDate !== this.state.newDate) {
			this.setState({ newDate: this.props.newDate });
			this.getMoladJlem(this.props.newDate);
		}
	}

	render() {
		return (
			<div>
				{this.state.showAlert
					? <Alert resetAlert={this.resetAlert.bind(this)} 
						header="Zipcode Error" 
						message="Could not find that Zip Code in the database" 
					/> : null}
				<h2>Displaying times for {this.state.displayedCity}</h2>
				{this.state.moladByYou
					? <KiddushLevanaCalendar 
						moladosThisYear={this.state.moladosThisYear} 
						defDate={this.state.newDate}
						setNewDate={this.props.setNewDate}
						/>
					: <LinearProgress color="secondary" />}
			</div>
		);
	}
}