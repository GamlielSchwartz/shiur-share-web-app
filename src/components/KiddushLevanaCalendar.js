import React from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';


export default class KiddushLevanaCalendar extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			molad: this.props.molad,
			start1: null,
			start3: null,
			start7: null,
			end1: null,
			end3: null,
			end7: null
		}
	}

	componentDidMount(){
		if (this.props.molad){
			this.updateCalendar();
		}
	}

	updateCalendar(){
		var [start3, end3] = this.getStartAndEnd(3, this.props.molad);
		var [start7, end7] = this.getStartAndEnd(7, this.props.molad);
		var [start1, end1] = this.getStartAndEnd(1, this.props.molad);
		this.setState(
			{
				molad: this.props.molad,
				start1: start1,
				start3: start3,
				start7: start7,
				end1: end1,
				end3: end3,
				end7: end7
			}
			);
	}

	componentDidUpdate(){
		console.log("update")
		if (this.props.molad && this.props.molad !== this.state.molad){
			this.updateCalendar();
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
			color: 'black',
			border: '0px',
			display: 'block'
		};
		return {
			style: style
		};
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
					date={this.state.molad}
					localizer={localizer}
					events={[{
						title: "From 3 Days",
						start: this.state.start3,
						end: this.state.end3,
						bgColor: 'red',
					},
					{
						title: "From 7 Days",
						start: this.state.start7,
						end: this.state.end7,
						bgColor: "blue",
					},
					{
						title: "From 1 Day",
						start: this.state.start1,
						end: this.state.end1,
						bgColor: "green",
					}]}
					startAccessor="start"
					endAccessor="end"
					eventPropGetter={this.eventStyleGetter}
				/>
			</div>
		);
	}
}
