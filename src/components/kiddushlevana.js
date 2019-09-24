import React from 'react';
import calcMolad from './calcMolad.js';
import KiddushLevanaCalendar from './KiddushLevanaCalendar';
import { HDate } from 'hebcal';
import { formatRFC, RFCToDateObj, numMonthsInYear } from '../utils/tools.js';
import ChangeZipSnack from './ChangeZipSnack.js';

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
			timeZone: '',
			displayedCity: "Jerusalem",
			displayedZip: '',
			newDate: new Date(),
			moladosThisYear: [],
			currYear: new HDate().year,
			snackData: {
				message: '',
				variant: 'info',
			},
			showSnack: false,
			jlemMoladosThisYear: [],
		}
		this.baseState = this.state;
		this.getMoladByUserWithZipCode = this.getMoladByUserWithZipCode.bind(this);
		this.setNewLocation = this.setNewLocation.bind(this);
		this.setSidebarData = this.setSidebarData.bind(this);
	}

	setMolados(desiredDate) {
		var hebrewYear;
		if (desiredDate) {
			hebrewYear = new HDate(desiredDate);
		} else {
			hebrewYear = new HDate();
		}
		var moladosThisYear = [];
		//add last month of prev year to cover change-overs:
		moladosThisYear.push(calcMolad(hebrewYear.year - 1, numMonthsInYear(hebrewYear.year - 1)));
		//calcMolad indexes months from 1
		//go through each month and get molad, convert from jlem time if have zipcode entered
		for (var i = 1; i <= numMonthsInYear(hebrewYear.year); i++){
			if (this.state.displayedZip === ''){
				moladosThisYear.push(calcMolad(hebrewYear.year, i));
			} else {//Do conversions based on zipcode if displayed zip not '', zip may have been set earlier
				var jlemMolad = calcMolad(hebrewYear.year, i);
				var localMoladAsDate = this.getLocalMoladAsDate(jlemMolad, this.state.timeZone);
				moladosThisYear.push(localMoladAsDate);
			}
		}
		/**
		 * This is to make sure that in when the molados are first calculated, an array of
		 * molados in JLem are maintained regardless of molados being calculated for other
		 * places. This is so setNewLocation has a baseline off of which to translate times
		 * even if user has entered multiple locations. We don't want the baseline to be
		 * the molados at whatever location was entered before but rather Jlem. 
		 */
		if (this.state.displayedZip === ''){
			this.setState({jlemMoladosThisYear: moladosThisYear});
		}
		//add first month of next year to cover change-overs:
		moladosThisYear.push(calcMolad(hebrewYear.year + 1, 1));

		this.setState({
			currYear: hebrewYear.year,
			moladosThisYear: moladosThisYear,
		})
	}

	//TODO: some issue here, not converting correctly between time zones anymore
	getLocalMoladAsDate(jlemMolad, timeZone){
		var jlemMoladAsRFC = formatRFC(jlemMolad);
		var moladInLocalTime = us(asia(jlemMoladAsRFC, JLEM_TZ), timeZone, "%F %T");
		var moladAsDateObj = RFCToDateObj(moladInLocalTime);
		return moladAsDateObj;
	}

	componentDidMount() {
		this.setMolados(new Date());
	}

	setNewLocation(lat, long, city) {
		var timeZone = tzlookup(lat, long);
		this.setState({
			timeZone: timeZone,
			displayedCity: city
		});
		var newMoladosThisYear = []; //for new lat/long
		var jlemMoladosThisYear = this.state.jlemMoladosThisYear;//for jlem
		for (var i = 0; i < jlemMoladosThisYear.length; i++){
			var jlemMolad = jlemMoladosThisYear[i];
			var localMoladAsDate = this.getLocalMoladAsDate(jlemMolad, timeZone);
			newMoladosThisYear.push(localMoladAsDate);
		}
		this.setState({moladosThisYear: newMoladosThisYear})
	}

	changeSnack(message, variant){
		this.setState({ 
			showSnack: true,
			snackData: {
				variant: variant,
				message: message
			}
		});
	}

	getMoladByUserWithZipCode() {
		var data = zipcodes.lookup(this.props.zipcode);
		if (!data) {
			this.changeSnack(`Unable to locate zipcode: ${this.props.zipcode}`, 'error');
			return;
		}
		var lat = data.latitude;
		var long = data.longitude;
		var city = data.city;

		this.changeSnack(`Displaying times for ${city}`, 'success');
		this.setNewLocation(lat, long, city);
	}

	componentDidUpdate() {

		if (this.props.zipcode && this.props.zipcode !== this.state.displayedZip) {
			this.setState({ displayedZip: this.props.zipcode });
			this.getMoladByUserWithZipCode();
		}

		if (this.props.newDate && this.props.newDate !== this.state.newDate) {
			this.setState({ newDate: this.props.newDate });
			this.setMolados(this.props.newDate);
		}
	}

	setSidebarData(opinion){
		var data = {
			opinion: opinion,
			location: this.state.displayedCity
		}
		this.props.setSidebarData(data)
	}

	closeSnack(){
		this.setState({
			showSnack: false,
		});
	}

	render() {
		return (
			<div>
				{this.state.showSnack 
				? 
				<ChangeZipSnack 
					closeSnack={this.closeSnack.bind(this)}
					data={this.state.snackData}
				/>
				:
				null}

				<h2>Displaying times for {<i> {this.state.displayedCity} </i>}</h2>
					<KiddushLevanaCalendar 
						moladosThisYear={this.state.moladosThisYear} 
						defDate={this.state.newDate}
						setNewDate={this.props.setNewDate}
						setSidebarData={this.setSidebarData}
					/>
			</div>
		);
	}
}