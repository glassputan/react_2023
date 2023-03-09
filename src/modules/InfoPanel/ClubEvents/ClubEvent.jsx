import React                from 'react';

const ClubEvent = (props) => {
    const formatTime = (event_time) => {
        try {

            const options = { hour: '2-digit', minute: '2-digit' };
            const date = new Date(props.event.event_date);

            const time_rx = /\d\d\d\d-\d\d-\d\dT(\d\d):(\d\d):(\d\d).000-05:00/;
            const time_array = [...event_time.match(time_rx)];
            
            date.setHours(  time_array[1]);
            date.setMinutes(time_array[2]);

            return date.toLocaleTimeString("en-US", options);
        }
        catch(xx) {
            return xx.message + "\n" + JSON.stringify(props.event);
        }
    }

    /**
     * 
     * @param {JSONObject} event 
     * @returns 
     */
    const getFormattedTime = (event) => {
        // { getFormattedTime(props.event.event_start) } to { getFormattedTime(props.event.event_end) }

        if( event.all_day ) return "";

        if( event.event_end ) {
            if(event.event_start) {
                return "From " + formatTime(event.event_start) + " to " + formatTime(event.event_end) 
            }
            else {
                return "Ending at " + formatTime(event.event_end)
            }

        }
        else {
            if( event.event_start ) {
                return "Starting at " + formatTime(event.event_start)
            }
        }
        
    }
    
    const getFormattedDate = () => {
        try {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            const date = new Date(props.event.event_date);

            const date_rx = /(\d\d\d\d)-(\d\d)-(\d\d)/;
            const date_array = [...props.event.event_date.match(date_rx)];
            
            date.setMonth( parseInt(date_array[2]) - 1 );
            date.setDate( parseInt(date_array[3]) );
            date.setYear( parseInt(date_array[1]) );

            return date.toLocaleDateString("en-US", options);
        }
        catch(xx) {
            return xx.message + "\n" + JSON.stringify(props.event);
        }
        
        
    }
    
    const showClubEvent = () => {

    }

    return (
        <div className="alert alert-info event-alert" onClick={showClubEvent}>
            <div className="row">
                <div className="col-12 text-right">
                    { getFormattedDate() }<br/>{ getFormattedTime(props.event) }
                </div>
            </div>
            <div className="row">
                <div className='col-12'>
                    { props.event.title }
                </div>
            </div>
        </div>
    )
}

export default ClubEvent;