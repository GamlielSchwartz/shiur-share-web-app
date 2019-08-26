import React from 'react';
import calcMolad from './calcMolad.js';
import KiddushLevanaCalendar from './KiddushLevanaCalendar';
import LinearProgress from '@material-ui/core/LinearProgress';
import { HDate } from 'hebcal';
 
require('hebcal');
var geoTz = require('geo-tz')

var API_KEY = "ZOB2F8MCNS32";
var GET_TZ_API = `http://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=position`;
//TODO: this can use hebcal library in stead of api call greg.js and hdate.js
var DATE_CONV_API = "https://www.hebcal.com/converter/?cfg=json";
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
		  timeStampJlem: -1, //ts of molad in jlem this month
		  moladByYou: null,
        }
        this.getMoladByUserWithGeolocation = this.getMoladByUserWithGeolocation.bind(this)
      }

	  //TODO: double check algorithm
	  isLeapYear(yearAsNumber){
		switch (yearAsNumber % 19) {
			case 0: case 3: case 6: case 8:
			case 11: case 14: case 17: return 1;
			default: return 0
		}
	  }

	  getHmAsNumber(monthAsString, isLeapYear){
		// var HebrewMonthTextArr = ["Tishrei", "Cheshvan", "Kislev", "Teves", "Sh'vat", "Adar", "Adar I", "Adar II", "Nisan", "Iyyar", "Sivan", "Tamuz", "Av", "Elul"]
		switch(monthAsString){
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
			default : return -1;
		}
	  }

	//   getMoladJlem(){
	// 	var gregorianDate = new Date();
	// 	var gMonth = gregorianDate.getMonth() + 1;
	// 	var gYear = gregorianDate.getFullYear();
	// 	var gDay = gregorianDate.getDate();
	// 	//convert gregorian day to hebrew day:
	// 	var apiCall = `${DATE_CONV_API}&gy=${gYear}&gm=${gMonth}&gd=${gDay}&g2h=1`
	// 	fetch(apiCall)
	// 	.then(response => response.json())
	// 	.then(data => {
	// 		var hebrewYear = data.hy;
	// 		var hebrewMonth = data.hm;
	// 		var isLeapYear = this.isLeapYear(hebrewYear);
	// 		var hmAsNumber = this.getHmAsNumber(hebrewMonth, isLeapYear);
	// 		//molad in JLEM, need api call to convert to local
	// 		var molad = calcMolad(hebrewYear, hmAsNumber);


	// 		console.log(molad);
	// 		this.setState({
	// 			hebrewMonth: hebrewMonth.toString(),
	// 			hebrewYear: hebrewYear.toString(),
	// 			moladJlem: molad,
	// 			timeStampJlem: molad.getTime(),
	// 		})
	// 	});
	//   }

	  getMoladJlem(){
		this.withoutAPI();
	  }

	numMonthsThisYear(year){
		if (this.isLeapYear(year)) return 13;
		return 12;
	  }

	  withoutAPI(){
		const d = new HDate();
		//Hdate numbers start with adar as 0, calcmolad numbers tishrei as 0
		var transformedForCalc = d.month + 7;
		var transformedYear = d.year;
		if (transformedForCalc > this.numMonthsThisYear(d.year)){
		  transformedForCalc -= this.numMonthsThisYear(d.year);
		  transformedYear += 1;
		}
		
		var molad = calcMolad(transformedYear, transformedForCalc);
		this.setState({
			moladJlem: molad,
			moladByYou: molad, //start off displaying Jerusalem, then go to other location
			timeStampJlem: molad.getTime(),
		})
		console.log(molad);
	  }

      componentDidMount() {		
		this.getMoladJlem();
		//if user presses button to use curr location:
        this.getMoladByUserWithGeolocation();
      }
    
      getMoladByUserWithGeolocation() {
        const location = window.navigator && window.navigator.geolocation
        
        if (location) {
          location.getCurrentPosition((position) => {
			  console.log("got here")
			  console.log(position);
				console.log(geoTz(position.coords.latitude, position.coords.longitude));
				var zoneName = geoTz(position.coords.latitude, position.coords.longitude);
				this.setState({timeZone: zoneName})
				//convert times from one zone to another:
				var apiCall = `${TZ_CONV_API}&from=${JLEM_TZ}&to=${zoneName}&time=${this.state.timeStampJlem/1000}`;
				fetch(apiCall)
				.then(response => response.json())
				.then(data => {
					console.log(new Date(data.toTimestamp * 1000));
					this.setState({
						moladByYou: new Date(data.toTimestamp * 1000),
					})
				})
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
			})


          }, (error) => {
            this.setState({ latitude: 'err-latitude', longitude: 'err-longitude' })
          })
        }
    
      }

    render() {

      return (
          <div>
					{this.state.moladByYou 
						? <KiddushLevanaCalendar molad={this.state.moladByYou}/> 
						: <LinearProgress color="secondary" />}
          </div>
      );
    }
  }