import React              from 'react'

import { 
    useState, 
    useEffect,
    useContext
}                         from "react";

import { 
    useTranslation 
}                         from "react-i18next";

import { 
    Link 
}                         from 'react-router-dom'

import Alert              from 'react-bootstrap/Alert';
import Table              from 'react-bootstrap/Table';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                         from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout      from "../../../layouts/DefaultLayout"
import Row                from '../../../helpers/Row';

import AppContext         from '../../../context/AppContext';

import Event              from './Event';


const Events = () => {
    const {t} = useTranslation();

    const context = useContext(AppContext);

    const [error,    setError]   = useState();
    const [events,   setEvents]  = useState([]);

    /**
     * 
     * @param {JSONObject} clubEvent 
     * @param {boolean} isNew 
     */
    const saveEventHandler = async (clubEvent, isNew) => {
        context.debug("Events", "saveEventHandler()", clubEvent);

        let target = "/api/v1/event";
        let record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ "event": clubEvent })
        };

        if( isNew ) {
            record = {
                ...record,
                method:  "POST"
            }
        }
        else {
            record = {
                ...record,
                method:  "PATCH"
            }

            target = `${target}/${clubEvent.id}`;
        }
    
        const response = await fetch(target, record);

        if( response.ok ) {
            const json = await response.json();
            
            context.debug("Events", "saveEventHandler: Received...", json);

            if( json.status === "error") { 
                setError(json.message); 
            }
            else { 
                //console.info("New Event List", json.records);
                setEvents(json.records);
            }
        }
        else {
            console.error("Events::saveEventHandler()", response.statusText);
            setError(json.statusText);
        }
    }

    const deleteEventHandler = async (clubEvent) => {
        context.debug("Events", "deleteEventHandler()", clubEvent);

        const target = `/api/v1/event/${clubEvent.id}`;
        const record = {
            ...context.defaultHeaders,
            method:  "DELETE"
        }
    
        const response = await fetch(target, record);

        if( response.ok ) {
            const json = await response.json();
            
            context.debug("Events", "deleteEventHandler: Received...", json);

            if( json.status === "error") { setError(json.message); }
            else { setEvents(json.records); }
        }
        else {
            console.error("Events::deleteEventHandler()", response.statusText);
            setError(json.statusText);
        }
    }

    const getListEventsHandler = async (event) => {
        context.debug("Event", "getListEventsHandler()", event);

        const response = await fetch("/api/v1/events", context.defaultHeaders);

        if( response.ok ) {
            const json = await response.json();
            
            context.debug("Event", "getListEventsHandler: Received...", json);

            if( json.status === "error") { setError(json.message); }
            else { 
                //console.info("Initial Event List", json.records);
                setEvents(json.records); 
            }
        }
        else {
            console.error("Events::updateEventHandler()", response.statusText);
            setError(response.statusText);
        }
    }

    useEffect(
        () => {
            getListEventsHandler();
        },
        []
    )

    useEffect(
        () => {
            context.debug("Events", "useEffect()", events);
        },
        [events]
    )

    return (
        <DefaultLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/events">{t('events')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Table striped hover>
                    <thead>
                        <tr>
                            <th style={{ width: "225px" }}>Title</th>
                            <th style={{ width: "125px" }}className="text-center" >Event Date</th>
                            <th style={{ width: "150px" }}className="text-center" >{t("all_day")}</th>
                            <th style={{ width: "150px" }}className="text-center" >{t("auto_close")}</th>
                            <th style={{ width: "150px" }}className="text-center" colSpan="2">Time</th>
                            <th style={{ width: "100px" }}className="text-center">Event Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            !error && <Event key="-1" onSave={saveEventHandler} />
                        }

                        { 
                            !error && Array.isArray(events) &&
                            events
                                .map(
                                    (module) => {
                                        return <Event key={module.id} data={module} onSave={saveEventHandler} onDelete={deleteEventHandler} />
                                    }
                                )
                        }


                        { 
                            error && 
                            <tr><td colSpan="2"><Alert variant="danger">{error}</Alert></td></tr>
                        }
                    </tbody>
                </Table>

                <Row />
            </div>
        </DefaultLayout>
    )
}

export default Events;
