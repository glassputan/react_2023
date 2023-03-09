import React              from 'react'

import { 
    useState, 
    useEffect,
    useContext
}                         from "react";

import { useTranslation } from "react-i18next";

import Alert              from 'react-bootstrap/Alert';
import Card               from 'react-bootstrap/Card';

import AppContext         from '../../../context/AppContext';

const LogEvent = (props) => {
    const module = props.data;
    const context = useContext(AppContext);

    return (
        <div className={`row ${module.level == 'error' ? "text-danger" : ""} `}>
            <div className="col-2">
                { context.getFormattedDateTime(module.created_at) }
            </div>
            <div className="col-1">
                { module.level }
            </div>
            <div className="col-1">
                { module.source }
            </div>
            <div className="col-2">
                { module.message }
            </div>
            <div className="col-6">
                <pre>{ JSON.stringify( JSON.parse(module.json), null, 5) }</pre>
            </div>
        </div>
    )
}

const Logs = (props) => {
    const {t} = useTranslation();

    const context = useContext(AppContext);

    const [error,  setError]  = useState();
    const [logs,   setLogs]   = useState([]);

    const getListLogHandler = async () => {
        
        const request = await fetch("/api/v1/logs", context.defaultHeaders);

        //console.info("getListLogHandler(REQ)", request);

        if( request.ok ) {
            const response = await request.json();

            //console.info("getListLogHandler(RSVP)", response);

            setLogs(response.records);
        }
        else {
            setError(request.statusText);
        }
    }
    
    useEffect(
        () => {
            getListLogHandler();
        },
        [props.chain]
    )

    return (
        <Card>
            <Card.Body>
                <div className="row header">
                    <div className="col-2">
                        Created
                    </div>
                    <div className="col-1">
                        Level
                    </div>                    
                    <div className="col-1">
                        Module
                    </div>
                    <div className="col-2">
                        Message
                    </div>
                    <div className="col-6">
                        Object
                    </div>
                </div>  

                { Array.isArray(logs) && logs.length == 0 && <div className="row"><div className="col text-center">{t("no_data")}</div></div> }

                { 
                    !error && Array.isArray(logs) &&
                    logs
                        .map(
                            (module) => {
                                return <LogEvent key={module.id} data={module} />
                            }
                        )
                }

                { 
                    error && <Alert variant="danger">{error}</Alert>
                }
            </Card.Body>
        </Card>
    )
}

export default Logs;