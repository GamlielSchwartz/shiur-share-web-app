import React from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';
import { HDate } from 'hebcal';
require('hebcal');


export default class KiddushLevanaCalendar extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			eventsThisYear: [],
			moladosThisYear: []
		}
	}

	componentDidMount(){
		if(this.props.moladosThisYear){
			this.setCalendar();
		}
	}
	
	setCalendar(){
		var newEvents = [];
		for (var i = 0; i < this.props.moladosThisYear.length; i++){
			var oneMonthEvents = this.createEventsForOneHebrewMonth(this.props.moladosThisYear[i]);
			for (var j = 0; j < oneMonthEvents.length; j++){
				newEvents.push(oneMonthEvents[j]);
			}
		}
		this.setState({
			eventsThisYear: newEvents,
			moladosThisYear: this.props.moladosThisYear
		})
	}

	createEventsForOneHebrewMonth(molad){
		var [start1, end1] = this.getStartAndEnd(1, molad);
		var [start3, end3] = this.getStartAndEnd(3, molad);
		var [start7, end7] = this.getStartAndEnd(7, molad);
		return [
			{
				title: "Rama",
				start: start3,
				end: end3,
				color: 'black',
				bgColor: '#55D6BE',
			},
			{
				title: "Shulchan Aruch",
				start: start7,
				end: end7,
				bgColor: "#2E5EAA",
				color: 'white',
			},
			{
				title: "leniant opinion",
				start: start1,
				end: end1,
				bgColor: "#152A80",
				color: 'white',
			}
		]
	}

	componentDidUpdate(){
		if (this.props.moladosThisYear && this.props.moladosThisYear !== this.state.moladosThisYear){
			this.setCalendar();
		}
	}


	getStartAndEnd(numDaysFromMolad, molad) {
		var daysFromMoladToSofKiddushLevana = 15; //SH'Aruch
		var start = new Date(molad.getTime() + (numDaysFromMolad * 24 * 60 * 60 * 1000));
		var end = new Date(molad.getTime() + (daysFromMoladToSofKiddushLevana * 24 * 60 * 60 * 1000));
		return [start, end];
	}

	eventStyleGetter(event) {
		// console.log(event);
		var style = {
			backgroundColor: event.bgColor,
			opacity: 0.8,
			color: event.color,
			border: '0px',
			display: 'block'
		};
		return {
			style: style
		};
	}

	setNewHebrewYear(dateOnCalendar){
		var hebrewYear = new HDate(dateOnCalendar);
		this.props.setNewDate(dateOnCalendar);
	}

	render() {
		const localizer = momentLocalizer(moment)
		return (
			<div>
				<br />
				<br />
				{/* how do you select particular events? */}
				<Calendar style={{ height: "600px" }}
					// toolbar={null}
					defaultDate={this.props.defDate}
					onNavigate={this.setNewHebrewYear.bind(this)}
					localizer={localizer}
					events={this.state.eventsThisYear}
					views={['month']}
					startAccessor="start"
					endAccessor="end"
					eventPropGetter={this.eventStyleGetter}
				/>
			</div>
		);
	}
}
