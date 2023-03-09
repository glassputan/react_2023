import React                from 'react'

import { 
    useContext,
    useEffect,
    useReducer,
    useState
}                           from "react";


import { useTranslation }   from "react-i18next";

import { 
    Link, 
    useSearchParams
}                           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import { 
    faCopy,
    faHome,
    faSave,
    faTrash
}                           from '@fortawesome/pro-regular-svg-icons'

import Alert                from 'react-bootstrap/Alert';
import Form                 from 'react-bootstrap/Form';
import InputGroup           from 'react-bootstrap/InputGroup';
import Table                from 'react-bootstrap/Table';

import AppContext           from '../../../context/AppContext';
import DefaultLayout        from "../../../layouts/DefaultLayout";
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';
import Row                  from '../../../helpers/Row';

import DivisionModel        from '../../../models/DivisionModel';

const Division = (props) => {
    const context    = useContext(AppContext);

    const {t}        = useTranslation();

    const [isNew,           setIsNew]               = useState(true);
    const [division,        setDivision ]           = useState(new DivisionModel());
    const [showDeleteModal, setShowDeleteModal]     = useState(false);
    const [parents,         setParents]             = useState([]);
    const [teams,           setTeams]               = useState([]);
    

    const [formState,       dispFormState     ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "ERROR":
                    return { state: "danger",  message: action.message }
                case "SUCCESS":
                    return { state: "success", message: action.message }
                case "WARNING":
                    return { state: "warning", message: action.message }
                default:
                    return {}
            }
        }, 
        { state: "success", message: t("new_division") }
    )
    
    const setError = (message) => {
        dispFormState({ event: "ERROR", message: message });
    }

    const setWarning = (message) => {
        dispFormState({ event: "WARNING", message: message });
    }     

    const setMessage = (message) => {
        dispFormState({ event: "SUCCESS", message: message });
    }     
   
    const submitHandler = async (event) => {
        event.preventDefault();

        let actionURL = "/api/v1/division";

        let record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ division: division })
        }

        if( isNew ) {
            record = {
                ...record,
                method:  "POST"
            }
        }
        else {    
            actionURL = `${actionURL}/${division.id}`;

            record = {
                ...record,
                method: "PATCH"
            };
        }

        context.debug("Division", "submitHandler(1): Sending...", record);

        const response = await fetch(actionURL, record);

        if( response.ok ) {
            context.debug("Division", "submitHandler(2): Received...", response);

            const json = await response.json();

            context.debug("Division", "submitHandler(3): JSON...", json);

            if( json.status && json.status === "error") {
                setError(json.message);
            }
            else {
                setDivision( context.deNullObject(json.record) );
                setMessage(t("record_saved"));
            }
        }
        else {
            setError(response.statusText);
        }
    }
    
    const [params, setSearchParams] = useSearchParams();

    const getDivisionHandler = async () => {
        setError(null);

        setWarning(t("loading"));

        const divisionId = params.get("id");

        if(divisionId) {
            setIsNew(false);

            const response  = await fetch(`/api/v1/division/${divisionId}`, context.defaultHeaders);

            if( response.ok ) {
                const json = await response.json();

                context.debug("Division", "getDivisionHandler()", json);

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    const record = context.deNullObject(json.record);    

                    setDivision(record);
                    setTeams( JSON.parse(json.teams) );

                    setMessage(t("record_loaded"));
                }
            }
            else {
                setError(response.statusText);
            }
        }
    };  
    
    const onDeleteDivision = async (division_id) => {
        context.debug("onDeleteDivision()", division_id);

        const response  = await fetch(
            `/api/v1/division/${division_id}`, 
            {
                ...context.defaultHeaders,
                method: "DELETE"
            }
        );

        if( response.ok ) {
            navigate("/admin/divisions");
        }
        else {
            setError(response.statusText);
            return;
        }
    }

    const getListDivisionsHandler = async () => {
        const response = await fetch("/api/v1/divisions", context.defaultHeaders);

        if(response.ok) {
            const json = await response.json();

            context.debug("Division", "getListDivisionsHandler()", json);

            setParents(json);
        }
        else {
            setError(response.statusText);
        }
    }
            
    const deleteRecordHandler = () => {
        setShowDeleteModal(true);
    }
                        
    const onCloseDeleteModal = () => {
        setShowDeleteModal(false);
    }

    const onCloseMessageModal = () => {
        setError(null);
    }

    const onContinueMessageHandler = () => {
        setError(null);
    }

    const fieldChangeHandler = (event) => {
        context.debug("Division", "fieldChangeHandler()", event);

        setDivision(
            {
                ...division,
                [event.target.id]: event.target.value
            }
        );
    }
     
    useEffect( 
        () => {
            getDivisionHandler();
            getListDivisionsHandler();
        }, 
        []
    );  
    
    useEffect(
        () => {
            context.debug("Division", "useEffect()", division);
        },
        [division]
    )

    useEffect(
        () => {
            context.debug("Division", "useEffect()", teams);
        },
        [teams]
    )    
    
    return (
        <DefaultLayout>
            <Row />
            <ConfirmModal isVisible={showDeleteModal} message={`Delete ${division.name}`} onClose={onCloseDeleteModal} onContinue={onDeleteDivision} id={division.id} />

            <form onSubmit={submitHandler}>
                <div className="news">  
                    <div className="row">
                        <div className="col-8">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                    <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/divisions">{t('divisions')}</Link></li>
                                    <li className="breadcrumb-item"><Link to="/admin/division">{t('new')}</Link></li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col-4 text-end px-2">
                            <button onClick={submitHandler} className="btn btn-default" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></button>
                            <div    className="btn btn-default"         style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></div>
                            <div    className="btn btn-outline-danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" onClick={deleteRecordHandler} /></div>
                        </div>
                    </div>

                    { formState && <Alert style={{ marginTop: "20px" }} variant={formState.state}>{formState.message}</Alert> }

                    <Row />

                    <div className="row">
                        <div className="col-4">
                            <label>{t("name")}</label>
                            <input type="text" id="name" className="form-control" onChange={fieldChangeHandler} value={division.name} />
                        </div>
                        <div className="col-4">
                            <label>{t("travel")}</label>
                            <select id="is_travel" className="form-control" onChange={fieldChangeHandler} value={division.is_travel}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-4">
                            <label>{t("parent")}</label>
                            <select id="parent_id" onChange={fieldChangeHandler} className="form-control" value={division.parent_id}>
                                <option value=""></option>
                                {
                                    Array.isArray(parents) && parents.map(
                                        (parent) => {
                                            return <option key={parent.id} value={parent.id}>{parent.name}</option>
                                        }
                                    )
                                }
                            </select>
                        </div>
                        <div className="col-4">
                            <label>{t("game_duration")}</label>
                            
                            <InputGroup className="mb-3">
                                <Form.Control type="number" onChange={fieldChangeHandler} id="game_duration" value={division.game_duration} />
                                <InputGroup.Text id="basic-addon2">minutes</InputGroup.Text>
                            </InputGroup>                            
                            
                        </div>        
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-4">
                            <label>{t("teamsnap_id")}</label>
                            <Form.Control type="number" id="tsid" onChange={fieldChangeHandler} className="form-control" value={division.tsid} />
                        </div>
                        <div className="col-4">
                            &nbsp;
                        </div>    
                    </div>
                </div>
            </form>

            <Table striped>
                <thead>
                    <tr>
                        <td>{t("name")}</td>
                        <td>{t("head_coach")}</td>
                        <td>{t("email")}</td>
                    </tr>
                </thead>

                <tbody>
                    {
                        Array.isArray(teams) && 
                        teams.map(
                            (team) => {
                                return (
                                    <tr key={team.id}>
                                        <td>{team.name}</td>
                                        <td>{ team.head_coach ? `${team.head_coach.first_name} ${team.head_coach.last_name}` : "" }</td>
                                        <td>{ team.head_coach ? <a href={`mailto:${team.head_coach.email}`}>{team.head_coach.email}</a> : "" }</td>
                                    </tr>
                                )
                            }
                        )
                    }
                </tbody>
            </Table>
        </DefaultLayout>
    )
}

export default Division;
