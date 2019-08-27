import React from 'react';
import calcMolad from './calcMolad.js';
import KiddushLevanaCalendar from './KiddushLevanaCalendar';
import LinearProgress from '@material-ui/core/LinearProgress';
import { HDate } from 'hebcal';
import Alert from './Alert.js';
var zipcodes = require('zipcodes');
var tzlookup = require("tz-lookup");
var tz = require('timezone/loaded');
var us = tz(require("timezone/America"));
var asia = tz(require("timezone/Asia"));

require('hebcal');
// var geoTz = require('geo-tz')

var API_KEY = "ZOB2F8MCNS32";
// var GET_TZ_API = `http://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=position`;
//TODO: this can use hebcal library in stead of api call greg.js and hdate.js
// var DATE_CONV_API = "https://www.hebcal.com/converter/?cfg=json";
var TZ_CONV_API = `http://api.timezonedb.com/v2.1/convert-time-zone?key=${API_KEY}&format=json`;
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
			newDate: null,
		}
		this.getMoladByUserWithGeolocation = this.getMoladByUserWithGeolocation.bind(this)
		this.getMoladByUserWithZipCode = this.getMoladByUserWithZipCode.bind(this);
		this.setNewLocation = this.setNewLocation.bind(this);
	}

	//TODO: double check algorithm
	isLeapYear(yearAsNumber) {
		switch (yearAsNumber % 19) {
			case 0: case 3: case 6: case 8:
			case 11: case 14: case 17: return 1;
			default: return 0
		}
	}

	getHmAsNumber(monthAsString, isLeapYear) {
		// var HebrewMonthTextArr = ["Tishrei", "Cheshvan", "Kislev", "Teves", "Sh'vat", "Adar", "Adar I", "Adar II", "Nisan", "Iyyar", "Sivan", "Tamuz", "Av", "Elul"]
		switch (monthAsString) {
			case "Tishrei":
				return 1;
			case "Cheshvan":
				return 2;
			case "Kislev":
				return 3;
			case "Teves":
				return 4;
			case "Sh'vat":
				return 5;
			case "Adar":
			case "Adar I":
				return 6;
			case "Adar II":
				return 7;
			case "Nisan":
				return 7 + (isLeapYear ? 1 : 0);
			case "Iyyar":
				return 8 + (isLeapYear ? 1 : 0);
			case "Sivan":
				return 9 + (isLeapYear ? 1 : 0);
			case "Tamuz":
				return 10 + (isLeapYear ? 1 : 0);
			case "Av":
				return 11 + (isLeapYear ? 1 : 0);
			case "Elul":
				return 12 + (isLeapYear ? 1 : 0);
			default: return -1;
		}
	}

	numMonthsThisYear(year) {
		if (this.isLeapYear(year)) return 13;
		return 12;
	}

	formatRFC(date) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		if (month <= 9) {
			month = "0" + month;
		}
		var day = date.getDate();
		if (day <= 9) {
			day = "0" + day;
		}
		var hours = date.getHours();
		if (hours <= 9) {
			hours = "0" + hours;
		}
		var minutes = date.getMinutes();
		if (minutes <= 9) {
			minutes = "0" + minutes;
		}
		var seconds = date.getSeconds();
		if (seconds <= 9) {
			seconds = "0" + seconds;
		}
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	getMoladJlem(desiredDate) {
		var d;
		if (desiredDate !== null) {
			console.log(desiredDate)
			d = new HDate(desiredDate);
			console.log(d);
		} else {
			console.log("des date null")
			d = new HDate();
		}
		//Hdate numbers start with adar as 0, calcmolad numbers tishrei as 0
		var transformedForCalc = d.month + 7;
		var transformedYear = d.year;
		if (transformedForCalc > this.numMonthsThisYear(d.year)) {
			transformedForCalc -= this.numMonthsThisYear(d.year);
			transformedYear += 1;
		}

		var molad = calcMolad(transformedYear, transformedForCalc);
		console.log(molad);
		var moladAsRFCString = this.formatRFC(molad);
		this.setState({
			moladAsRFCString: moladAsRFCString,
			moladJlem: molad,
			moladByYou: molad, //start off displaying Jerusalem, then go to other location
			timeStampJlem: molad.getTime(),
		})
		this.props.setMoladInSidebar({ molad: molad, location: this.state.displayedCity });
		console.log();
	}

	componentDidMount() {
		this.getMoladJlem(new Date());
		//if user presses button to use curr location:
		// this.getMoladByUserWithGeolocation();
		console.log("mount")

	}

	setMoladByYouAsDateObj(moladInLocalTime) {
		var [date, time] = moladInLocalTime.split(" ");
		var [year, month, day] = date.split("-");
		var [hours, minutes, seconds] = time.split(":");
		return new Date(year, month - 1, day, hours, minutes, seconds);
	}

	setNewLocation(lat, long, city) {
		var timeZone = tzlookup(lat, long);
		this.setState({
			timeZone: timeZone,
			displayedCity: city
		})
		var moladInLocalTime = us(asia(this.state.moladAsRFCString, JLEM_TZ), timeZone, "%F %T");
		var moladByYou = this.setMoladByYouAsDateObj(moladInLocalTime);
		this.setState({ moladByYou: moladByYou });
		this.props.setMoladInSidebar({ molad: moladByYou, location: city });

		// //convert times from one zone to another:
		// var apiCall = `${TZ_CONV_API}&from=${JLEM_TZ}&to=${timeZone}&time=${this.state.timeStampJlem/1000}`;
		// fetch(apiCall)
		// .then(response => response.json())
		// .then(data => {
		// 	this.setState({
		// 		moladByYou: new Date(data.toTimestamp * 1000),
		// 	})
		// 	this.props.setMoladInSidebar({molad : new Date(data.toTimestamp * 1000), location: this.state.displayedCity});
		// })
	}

	getMoladByUserWithGeolocation() {
		const location = window.navigator && window.navigator.geolocation
		if (location) {
			location.getCurrentPosition((position) => {
				console.log(position);
				this.setNewLocation(position.coords.latitude, position.coords.longitude, "your location");
			}, (error) => {
				this.setState({ latitude: 'err-latitude', longitude: 'err-longitude' })
			})
		}

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
			console.log("NEW DATE")
			console.log(this.props.newDate);
			this.getMoladJlem(this.props.newDate);
		}
	}

	render() {
		return (
			<div>
				{this.state.showAlert
					? <Alert resetAlert={this.resetAlert.bind(this)} header="Zipcode Error" message="Could not find that Zip Code in the database" />
					: null}
				<h2>Currently displaying times for {this.state.displayedCity}</h2>
				<div>

				</div>
				{this.state.moladByYou
					? <KiddushLevanaCalendar molad={this.state.moladByYou} />
					: <LinearProgress color="secondary" />}
			</div>
		);
	}
}