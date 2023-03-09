import 
    React,
    {
        useContext,
        useState,
        useEffect,
        useReducer
    }                   from 'react';

import {
        Link,
        useNavigate
    }                   from 'react-router-dom';

import { 
    faFileImport,
    faHome
}                       from '@fortawesome/pro-regular-svg-icons';

import { 
    FontAwesomeIcon 
}                       from '@fortawesome/react-fontawesome';

import Button           from 'react-bootstrap/Button';
import Form             from 'react-bootstrap/Form';
import ProgressBar      from 'react-bootstrap/ProgressBar';
import Table            from 'react-bootstrap/Table';

import { 
    useTranslation 
}                       from 'react-i18next';

import AppContext       from '../../../context/AppContext';
import Article          from '../../../pages/public/Article';
import Row              from '../../../helpers/Row';
import DefaultLayout    from '../../../layouts/DefaultLayout';
import Message          from '../../../helpers/Message';
import TeamImportModel  from '../../../models/TeamImportModel';
import MessagesChannel  from '../../../channels/messages_channel';

const ImportTeams = (props) => {
    const context  = useContext(AppContext);
    const {t}      = useTranslation();
    const navigate = useNavigate();

    const [jobStatus, setJobStatus  ] = useState("Waiting");
    const [report,    setReport     ] = useState( new TeamImportModel() );
    const [completed, setCompleted  ] = useState(true);
    
    const [formState, dispFormState ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "NEW":
                    return { variant: "success",  message: "New Team"     }
                case "UPDATE":
                    return { variant: "success",  message: action.message }
                case "ERROR":
                    return { variant: "danger",   message: action.message }
                case "SAVED":
                    return { variant: "success",  message: action.message }
                case "LOADED":
                    return { variant: "success",  message: action.message }
                case "WARNING":
                    return { variant: "warning",  message: action.message }
                default:
                    return {};
            }
        }, 
        {}
    )

    //const cable   = actioncable.createConsumer("ws://127.0.0.1:6379/cable");

    const setError = (message) => {
        dispFormState({ event: "ERROR", message: message });
    } 
    
    const setMessage = (message) => {
        dispFormState({ event: "UPDATE", message: message });
    } 

    const navigateToTeams = () => {
        navigate("/admin/teams");
    }

    const getTeamSnapTeams = async (event) => {
        setCompleted(false);
        setReport(new TeamImportModel());

        const response = await fetch("/api/v1/division/refresh", context.defaultHeaders);

        context.debug("ImportTeams", "getTeamSnapTeams()", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("ImportTeams", "getTeamSnapTeams()", json);

            if(json.status === "error") {
                setError(json.message);
            }
            else {
                setJobStatus("Initializing");
            }
        }
        else {
            setError(response.statusText);
        }
    }

    useEffect(
        () => { 
            // Overwrite the Received method in MessagesChannel
            MessagesChannel.received = (json) => {
                context.debug("ImportTeams", "getReport()", json);

                if( json.job_status) {
                    setJobStatus( json.job_status );
                }

                setReport(json);
            }
        }, 
        []
    )

    const getGroupProgress = () => {
        if( report.groups_total > 0 ) {
            return Math.round((((report.groups_completed / report.groups_total) * 100) + Number.EPSILON) * 100) / 100;
        }
        else {
            return 0;
        }
    }

    const getTeamProgress = () => {
        if( report.teams_total > 0 ) {
            return Math.round((((report.teams_completed / report.teams_total) * 100) + Number.EPSILON) * 100) / 100;
        }
        else {
            return 0;
        }
    }

    const getDivisionProgress = () => {
        if( report.divisions_total > 0 ) {
            return Math.round((((report.divisions_completed / report.divisions_total) * 100) + Number.EPSILON) * 100) / 100;
        }
        else {
            return 0;
        }
    }  

    useEffect(
        () => {
            setCompleted(jobStatus == "Finished");
        },
        [jobStatus]
    )

    return (
            <DefaultLayout>
            <Row />

            <div className="news">
                <div className="row">
                    <div className="col-8">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item">{t('import')}</li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/import/teams">{t('teams')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-4 text-end px-2">
                        
                    </div>
                </div>  

                <Row />

                <Message formState={formState} />

                <Row />

                <div className="row">
                    <div className="col-3">&nbsp;</div>
                    <div className="col-6">
                        <div className="row">
                            <div className="col">
                                <Article title="Import Teams" />
                            </div>
                        </div>
                        <Row />
                        <Row />
                        <Row />
                        <div className="row">
                            <div className="col-8">
                                <Form.Label>{t("team")}</Form.Label>
                                <ProgressBar animated now={getTeamProgress()} label={`${getTeamProgress()}%`} />
                            </div>
                        </div>
                        <Row />
                        <div className="row">
                            <div className="col-8">
                                <Form.Label>{t("division")}</Form.Label>
                                <ProgressBar animated now={getDivisionProgress()} label={`${getDivisionProgress()}%`} />
                            </div>
                            <div className="col-4">
                                <Form.Control value={report.division} disabled={true} />
                            </div>

                        </div>
                        <Row />
                        <div className="row">
                            <div className="col-8">
                                <Form.Label>{t("groups")}</Form.Label>
                                <ProgressBar animated now={getGroupProgress()} label={`${getGroupProgress()}%`} />
                            </div>
                            <div className="col-4">
                                <Form.Control value={report.group} disabled={true} />
                            </div>
                        </div>
                    </div>
                    <div className="col-3">&nbsp;</div>
                </div>
            </div>
            <div className="row">
                <div className="col-9 text-end">
                    { completed && <Button onClick={navigateToTeams}>{t("view_teams")}</Button> }
                    { !completed && <Button onClick={getTeamSnapTeams} disabled={ jobStatus == "Executing" }><FontAwesomeIcon icon={faFileImport} />&nbsp;{t("import_teams")}</Button> }
                </div>
            </div>
        </DefaultLayout>
    )
}

export default ImportTeams;