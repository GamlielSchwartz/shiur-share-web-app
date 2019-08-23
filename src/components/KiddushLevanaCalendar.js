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


    render() {
		const localizer = momentLocalizer(moment)
		var today = new Date();
		var later = new Date();
		later.setDate(today.getDate() + 5)
      	return (
          	<div>
				  <br/>
				  <br/>
				<Calendar style={{height: "500px"}}
					localizer={localizer}
					events={[{
						title: "string",
						start: today,
						end: later,
					  }]}
					startAccessor="start"
					endAccessor="end"
					/>
          	</div>
      );
    }
  }
