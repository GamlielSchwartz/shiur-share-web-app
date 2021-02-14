import React from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';
require('hebcal');

const RAMA_DAYS_TILL_END_KL = 14.765297068; //half of 29 days 12 hours and 793 chalakim

export default class KiddushLevanaCalendar extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			eventsThisYear: [],
			moladosThisYear: [],
		}
		this.changeOpinion = this.changeOpinion.bind(this);
	}

	componentDidMount(){
		if(this.props.moladosThisYear){
			this.setCalendarEvents();
		}
	}
	
	setCalendarEvents(){
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
		// var [start1, end1] = this.getStartAndEnd(1, molad, RAMA_DAYS_TILL_END_KL); 
		var [start3, end3] = this.getStartAndEnd(3, molad, RAMA_DAYS_TILL_END_KL);
		var [start7, end7] = this.getStartAndEnd(7, molad, 15);
		return [
			{
				molad: molad,
				title: "Majority",
				start: start3,
				end: end3,
				color: 'black',
				bgColor: '#55D6BE',
			},
			{
				molad: molad,
				title: "Shulchan Aruch",
				start: start7,
				end: end7,
				bgColor: "#152A80",
				color: 'white',
			},
			// {
			// 	molad: molad,
			// 	title: "Mekilim",
			// 	start: start1,
			// 	end: end1,
			// 	bgColor: "#152A80",
			// 	color: 'white',
			// }
		]
	}

	componentDidUpdate(){
		if (this.props.moladosThisYear && this.props.moladosThisYear !== this.state.moladosThisYear){
			this.setCalendarEvents();
		}
	}


	getStartAndEnd(numDaysFromMolad, molad, daysFromMoladToSofKiddushLevana) {
		var start = new Date(molad.getTime() + (numDaysFromMolad * 24 * 60 * 60 * 1000));
		var end = new Date(molad.getTime() + (daysFromMoladToSofKiddushLevana * 24 * 60 * 60 * 1000));
		return [start, end];
	}

	eventStyleGetter(event) {
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
		this.props.setNewDate(dateOnCalendar);
	}

	changeOpinion(opinion){
		this.props.setSidebarData(opinion);
	}

	render() {
		const localizer = momentLocalizer(moment)
		return (
			<div>
				<br />
				<Calendar style={{ height: "600px" }}//needs to have some height or not visible
					defaultDate={this.props.defDate}
					onNavigate={this.setNewHebrewYear.bind(this)}
					localizer={localizer}
					events={this.state.eventsThisYear}
					views={['month']}
					startAccessor="start"
					endAccessor="end"
					eventPropGetter={this.eventStyleGetter}
					onSelectEvent={this.changeOpinion}
				/>
			</div>
		);
	}
}
