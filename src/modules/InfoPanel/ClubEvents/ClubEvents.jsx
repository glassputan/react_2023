import React                from 'react';

import ClubEvent            from './ClubEvent'
import ClubEventModal       from './ClubEventModal'

import { 
    useState,
    useCallback,
    useContext,
    useEffect 
}                           from "react";

import { 
    useTranslation 
}                           from "react-i18next";

import AppContext           from '../../../context/AppContext';

const ClubEvents = () => {
    const context = useContext(AppContext);
        
    const {t} = useTranslation();

    const [clubEvents, setEvents] = useState([]);
    const [error,      setError]  = useState(null);

    const getListClubEventsHandler = useCallback(
        async () => {
            setError();

            const response = await fetch("/api/v1/events/feed");

            if( response.ok ) {
                const data     = await response.json();

                context.debug("ClubEvents", "getListClubEventsHandler()", data);

                if( data.status && data.status === "error") {
                    throw new Error(data.message);
                }
                else {
                    setEvents(data);
                }
            }
            else {
                setError(response.statusText);
            }
        },
        [],
    );

    useEffect( 
        () => {
            getListClubEventsHandler();
        }, 
        []
    );     

    return (
        <>
            <div className="row">
                <div className="col quicklink">
                    <ul>{ t('upcoming_events') }</ul>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    {
                        error && <div className="text-danger">{error}</div>
                    }

                    {
                        clubEvents.length == 0 && <div className="alert alert-info">{ t('no_upcoming_events_message') }</div>
                    }

                    {
                        clubEvents && clubEvents.length > 0 &&
                        clubEvents.map(
                            (e) => {
                                return <ClubEvent key={e.id} event={e} />
                            }
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default ClubEvents;