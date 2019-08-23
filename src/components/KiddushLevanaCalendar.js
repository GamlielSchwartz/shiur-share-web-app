import React from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';


export default class KiddushLevanaCalendar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
      }



	getStartAndEnd(numDaysFromMolad){
		var molad = this.props.molad;
		//TODO: have to figure out how to do partial days, this is me'eis l'eis...
		var daysFromMoladToSofKiddushLevana = 15; //SH'Aruch
		var start = new Date(molad.getTime() + (numDaysFromMolad*24*60*60*1000));
		var end = new Date(molad.getTime() + (daysFromMoladToSofKiddushLevana*24*60*60*1000));
		return [start, end];
	}

	eventStyleGetter(event){
		console.log(event);
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
		var [start3, end3] = this.getStartAndEnd(3);
		var [start7, end7] = this.getStartAndEnd(7);
		var [start1, end1] = this.getStartAndEnd(1);

		const localizer = momentLocalizer(moment)
      	return (
          	<div>
				  <br/>
				  <br/>
				<Calendar style={{height: "500px"}}
					localizer={localizer}
					events={[{
						title: "From 3 Days",
						start: start3,
						end: end3,
						bgColor: 'red'
					  },
					  {
						title: "From 7 Days",
						start: start7,
						end: end7,
						bgColor: "blue",
					  },
					  {
						title: "From 1 Day",
						start: start1,
						end: end1,
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
