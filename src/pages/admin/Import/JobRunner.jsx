
import React            from 'react';

import {
    useContext,
    useState,
    useEffect,
    useReducer
}                       from 'react';

import {
    Link,
    useNavigate
}                       from 'react-router-dom';

import AppContext       from '../../context/AppContext';

import { 
    faHome,
    faRunning
}                       from '@fortawesome/pro-regular-svg-icons';

import { 
    FontAwesomeIcon 
}                       from '@fortawesome/react-fontawesome';

import Article          from '../../Article';

import Button           from 'react-bootstrap/Button';
import Form             from 'react-bootstrap/Form';
import ProgressBar      from 'react-bootstrap/ProgressBar';
import Table            from 'react-bootstrap/Table';

import Row           from '../../helpers/Row';
import DefaultLayout    from '../../layouts/DefaultLayout';
import Message          from '../../helpers/Message';

import { 
    useTranslation 
}                       from 'react-i18next';

import MessagesChannel  from  "../../../channels/messages_channel"

import SystemJobReportModel  from '../../models/SystemJobReportModel';

const Job = (props) => {
    const job      = props.job;
    const report   = props.report;
    const messages = props.messages;
    
    const context  = useContext(AppContext);
    const {t}      = useTranslation();

    useEffect(
        () => {
            if( report.job_status == "completed" ) { addMessage(t("update_complete")) }
        },
        [report.status]
    )    

    const getScoreImportGameProgress = () => {
        if( report.games_total > 0 ) {
            return Math.round((((report.games / report.games_total) * 100) + Number.EPSILON) * 100) / 100;
        }
        else {
            return 0;
        }
    }

    const getScoreImportDivisionProgress = () => {
        if( report.divisions_total > 0 ) {
            return Math.round((((report.divisions / report.divisions_total) * 100) + Number.EPSILON) * 100) / 100;
        }
        else {
            return 0;
        }
    }  

    const executeJob = () => {
        if( props.onExecute ) {
            props.onExecute(job);
        }
        else {
            context.warn("Job", "executeJob()", "Missing property 'onExecute'");
        }
    }

    return (
        <>
            <tr>
                <td>
                    <div style={{ marginTop: "5px" }}>{t(job.name)}</div>
                </td>
                <td>
                    <div dangerouslySetInnerHTML={{ __html: job.description}}></div>
                </td>
                <td>
                    <Button onClick={executeJob} disabled={report.job_status=="running"}><FontAwesomeIcon icon={faRunning} /></Button>                    
                </td>
                <td>
                    {
                        job.name != "get_division_scores" &&
                        <div style={{ marginTop: "5px" }}>
                            {t("ready")}
                        </div>
                    }
                    {
                        job.name == "get_division_scores" &&
                        <div style={{ marginTop: "5px" }}>
                            { context.getCamelCase(report.job_status) }
                        </div>
                    }
                </td>
            </tr>
            {
                job.name == "get_division_scores" && report.job_status != "ready" &&
                <tr>
                    <td colSpan="4">
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>{t("divisions")}</th>
                                    <th>{t("games")}</th>
                                    <th>{t("issues")}</th>
                                    <th>{t("results")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>{ report.divisions_total }</td>
                                    <td>{ report.games_total }</td>
                                    <td>{ report.game_issues }</td>
                                    <td>{ report.job }</td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <ProgressBar now={getScoreImportGameProgress()} />
                                        <ProgressBar variant="success" now={getScoreImportDivisionProgress()} label={report.division} />
                                    </td>
                                    <td>
                                        <Table striped>
                                            <tbody>
                                                {
                                                    messages.map(
                                                        (message) => {
                                                            return <tr><td>{message}</td></tr>
                                                        }
                                                    )
                                                }
                                            </tbody>
                                        </Table>
                                    </td>
                                    <td>
                                        {
                                            report.job == "get_division_scores" && report.job_status == "finished" &&
                                            <Link to="/standings" target="_blank">{t("recreational_team_standings")}</Link>
                                        }
                                    </td>                                                        
                                </tr>
                            </tbody>
                        </Table>
                    </td>
                </tr>
            }
        </>
    );
}

const JobRunner = (props) => {
    const context  = useContext(AppContext);
    const {t}      = useTranslation();
    const navigate = useNavigate();

    const [report,    setReport ]  = useState( new SystemJobReportModel() );    
    const [jobs,      setJobs   ] = useState([]);
    
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

    const [messages,  setMessages  ] = useState([]);

    const addMessage = (message) => {
        setMessages( [ ...messages, message])
    }    
    
    const setError = (message) => {
        dispFormState({ event: "ERROR", message: message });
    } 

    const setMessage = (message) => {
        dispFormState({ event: "UPDATE", message: message });
    }

    const executeJob = async (job) => {

        if( job.action_type == "open" ) {
            navigate(job.target_url);
        }
        else {
            const response = await fetch(`${job.target_url}?id=${report.id}`, context.defaultHeaders);

            context.debug("JobRunner", "executeJob()", response);

            if( response.ok ) {
                const json = await response.json();

                context.debug("JobRunner", "executeJob()", json);

                if(json.status === "error") {
                    setError(json.message);
                }
                else {
                    setReport(
                        {
                            ...report,
                            job_name: job.name,
                            job_status: "running"
                        }
                    )
                }
            }
            else {
                setError(response.statusText);
            }
        }
    }      

    const getListSystemJobs = async () => {
        const response = await fetch("/api/v1/system/jobs", context.defaultHeaders);

        context.debug("JobRunner", "getListSystemJobs()", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("JobRunner", "getListSystemJobs()", json);

            if(json.status === "error") {
                setError(json.message);
            }
            else {
                setJobs(json.records);
            }
        }
        else {
            setError(response.statusText);
        }  
    }

    useEffect(
        () => {
            if( report.job_status == "error" ) {
                setError(report.msg);
            }
        },
        [report.job_status]
    )   
    
    useEffect(
        () => {
            getListSystemJobs();

            // Overwrite the Received method in MessagesChannel
            MessagesChannel.received = (json) => {
                if( json.id == report.id ) {
                    context.debug("JobRunner", `getReport('${json.job_name}')`, json);
        
                    setReport(json);
        
                    if( json.message && json.message.length > 0 ) {
                        addMessage(json.message);
                    }
        
                    if( json.job_status == "finished" ) {
                        setMessage(t("job_completed"));
                    }
                }
                else {
                    context.debug("JobRunner", `getReport('${json.job_name}', '${report.id}'): ${json.id}`);
                }
            }            
        },
        []
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
                                <li className="breadcrumb-item">{t('system')}</li>
                                <li className="breadcrumb-item"><Link to="/admin/system/jobs">{t('jobs')}</Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/system/jobs">{t('job_runner')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>  

                <Row />

                <Message formState={formState} />

                <Row />

                <Article title="System Jobs" />

                <Table striped bordered>
                    <thead>
                        <tr>
                            <th>{t("job")}</th>
                            <th>{t("description")}</th>
                            <th>{t("actions")}</th>
                            <th>{t("status")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            jobs.map(
                                (job) => {
                                    return <Job key={job.id} job={job} report={report} messages={messages} onError={setError} onRedirect={navigate} onExecute={executeJob} />
                                }
                            )
                        }
                    </tbody>
                </Table>
            </div>
        </DefaultLayout>
    )
}

export default JobRunner;