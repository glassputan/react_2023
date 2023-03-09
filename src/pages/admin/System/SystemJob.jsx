import 
    React,
    { 
        useContext,
        useState,
        useEffect,
        useReducer,
        useRef
    }                       from "react";

import { useTranslation }   from "react-i18next";
import {
    Link, 
    useSearchParams
}                           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import Button               from 'react-bootstrap/Button';
import Form                 from 'react-bootstrap/Form';

import { 
    faCopy,
    faHome,
    faSave,
    faTrash
}                           from '@fortawesome/pro-regular-svg-icons'

import {
    Editor 
}                           from '@tinymce/tinymce-react';

import AppContext           from '../../../context/AppContext';
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';
import Row                  from '../../../helpers/Row';
import Message              from '../../../helpers/Message';
import DefaultLayout        from '../../../layouts/DefaultLayout';
import SystemJobModel       from '../../../models/SystemJobModel';

const SystemJob = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const {t}        = useTranslation();
    const context    = useContext(AppContext);
    const jobRef     = useRef();

    const [ jobId,       setSystemJobID ] = useState();
    const [ isNew,       setIsNew       ] = useState(true);
    const [ job,         setSystemJob   ] = useState(new SystemJobModel());
    const [ showModal,   setShowModal   ] = useState(false);

    const [ formState,   dispFormState  ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "ERROR":
                    return { variant: "danger",  message: action.message }
                case "SUCCESS":
                    return { variant: "success", message: action.message }
                case "WARNING":
                    return { variant: "warning", message: action.message }
                default:
                    return {};
            }
        }, 
        {}
    );
    
    const setError = (message) => {
        if( message ) {
            dispFormState({ event: "ERROR",     message: message });
        }
        else {
            dispFormState({ event: "CLEAR" });
        }
    }

    const setMessage = (message) => {
        dispFormState({ event: "SUCCESS",   message: message });
    }
    
    const submitHandler = async (event) => {
        if(event) event.preventDefault();

        context.debug("SystemJob", "submitHandler()", jobRef.current.getContent());

        let record = { ...job, description: jobRef.current.getContent() };

        let action = "/api/v1/system/job";
        let header = {
            ...context.defaultHeaders,
            body: JSON.stringify({ job: { ...record }})
        };

        if( isNew ) {
            header = {
                ...header,
                method: "POST"
            };
        }
        else {
            action = `${action}/${job.id}`;
            header = {
                ...header,
                method: "PATCH"
            };
        }
    
        context.debug("SystemJob", "submitHandler(): Sending...", action, header);

        const response = await fetch(action, header);

        context.debug("SystemJob", "submitHandler(2): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("SystemJob", "submitHandler(3): JSON...", json);

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setMessage(t("record_saved"));
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const getSystemJobHandler = async () => {
        setError(null);

        if(jobId) {
            setIsNew(false);

            const response  = await fetch(`/api/v1/system/job/${jobId}`, context.defaultHeaders);

            context.debug("SystemJob", "getSystemJobHandler(2): Received...", response);

            if( response.ok ) {
                const json = await response.json();

                context.debug("SystemJob", "getSystemJobHandler(3): JSON...", json);

                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    setIsNew(false);

                    const record = context.deNullObject(json.record);

                    setSystemJob(record);

                    setMessage(t("record_loaded"));
                }
            }
            else {
                setError(response.statusText);
            }
        }
    }

    const onDeleteRecordHandler = async () => {
        context.debug("SystemJob", "onDeleteRecordHandler()");

        const action = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };

        const response = await fetch(`/api/v1/system/job/${job.id}`, action);
        
        context.debug("SystemJob", "onDeleteRecordHandler()", response);

        if( response.ok ) {
            const json = await response.json();

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setShowModal(false);
            }
        }
        else {
            setError(response.statusText);
        }
    }
    
    const onDeleteRecord = () => {
        setShowModal(true);
    }

    const deleteModalCloseHandler = () => {
        setShowModal(false);
    }

    const jobChangeHandler = (event) => {
        context.debug("SystemJob", "jobChangeHandler()", event);

        setSystemJob(
            {
                ...job,
                [event.target.id]: event.target.value
            }
        );
    }

    const copyHandler = () => {

    }

    useEffect(
        () => {
            getSystemJobHandler();
        },
        [jobId]
    )

    useEffect( 
        () => {
            const id = searchParams.get("id");

            if( id ) {
                setSystemJobID(id); 
            }
        }, 
        []
    ); 
       
    return (
        <DefaultLayout>
            <Row />

            <ConfirmModal message={t("confirm_delete")} header={`${t("delete")} '${job.title}'`} onContinue={onDeleteRecordHandler} isVisible={showModal} onClose={deleteModalCloseHandler} />

            <div className="news">  
                <div className="row">
                    <div className="col-8">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/system/jobs">{t('jobs')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/system/jobrunner">{t('job_runner')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-4 text-end px-2">
                        <Button onClick={submitHandler}   variant="outline-primary"   style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></Button>
                        <Button onClick={copyHandler}     variant="outline-secondary" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></Button>
                        <Button onClick={onDeleteRecord}  variant="outline-danger"    style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" /></Button>
                    </div>
                </div>

                <Row />

                <Message formState={formState} />

                <div className="row">
                    <div className="col">
                        <label>{t("name")}</label>
                        <Form.Control type="text" onChange={jobChangeHandler} id="name" value={job.name} />
                    </div>
                    <div className="col">
                        <label>{t("action_type")}</label>
                        <Form.Select onChange={jobChangeHandler} id="action_type" value={job.action_type}>
                            <option value=""></option>
                            <option value="execute">Execute a Script</option>
                            <option value="open">Open a page</option>
                        </Form.Select>
                    </div>                    
                </div>

                <Row />

                <div className="row">
                    <div className="col">
                        <label>{t("target_url")}</label>
                        <Form.Control type="text" onChange={jobChangeHandler} id="target_url" value={job.target_url} />
                    </div>                  
                </div>

                <Row />

                <div className="row">
                    <div className="col-12">
                        <label htmlFor="text">{t("description")}</label>
                        <Editor
                            onInit={
                                (evt, editor) => jobRef.current = editor
                            }

                            initialValue={job.description || ""}
                            
                            init={
                                {
                                    height: 500,
                                    menubar: false,
                                    plugins: ['code wordcount link table print'],
                                    toolbar: 'undo redo | formatForm.Select | ' +
                                    'bold italic backcolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | code | help',
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                }
                            }
                        />
                    </div>
                </div>

                <Row />

                <div className="row">
                    <div className="col text-end">
                        <Button onClick={submitHandler} variant="outline-primary"  style={{ marginLeft: "10px"}}>{t("save")}</Button>
                    </div>
                </div> 
            </div>                      
        </DefaultLayout>
    );
}

export default SystemJob;