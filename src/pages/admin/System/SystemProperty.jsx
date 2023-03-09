import 
    React,
    { 
        useState, 
        useEffect,
        useContext,
        useCallback,
        useReducer
    }                       from "react";

import { 
    useTranslation 
    }                       from "react-i18next";

import { 
    Link,
    useSearchParams
}                           from 'react-router-dom';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome';

import { 
    faCopy,
    faHome,
    faSave,
    faTrash,
    faCircleInfo
}                           from '@fortawesome/pro-regular-svg-icons';

import FormControl          from 'react-bootstrap/FormControl';
import Form                 from 'react-bootstrap/Form';

import Message              from '../../../helpers/Message';
import DefaultLayout        from "../../../layouts/DefaultLayout";
import Row                  from '../../../helpers/Row';
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';
import AppContext           from '../../../context/AppContext';
import SystemPropertyModel  from '../../../models/SystemPropertyModel';

const SystemProperty = (props) => {
    const {t} = useTranslation();
    const context = useContext(AppContext);
    const [searchParams, setSearchParams]        = useSearchParams();

    const [isNew,           setNew]              = useState(true);
    const [property,        setProperty]         = useState(new SystemPropertyModel());
    const [propertyId,      setPropertyId]       = useState();
    const [showDeleteModal, setShowDeleteModal ] = useState(false);

    const [formState,       dispFormState      ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "MESSAGE":
                    return { variant: "",         message: action.message  }
                case "ERROR":
                    return { variant: "danger",   message: action.message }
                case "SUCCESS":                    
                    return { variant: "success",  message: action.message  }
                case "WARNING":
                    return { variant: "warning",  message: action.message  }
                default:
                    return {};
            }
        }, 
        {}
    )    

    const onDeleteRecordHandler = () => {
    }

    const hideDeleteModalHandler = (event) => {
        setShowDeleteModal(false);
    }  
    
    const showDeleteModalHandler = () => {
        setShowDeleteModal(true);
    }    

    const setError = (message) => {
        if( props.onError ) {
            props.onError(message);
        }
        else {
            dispFormState({ "message": message, "event": "ERROR"});
        }
    }

    const setMessage = (message) => {
        if( props.onMessage ) {
            props.onMessage(message);
        }
        else {
            dispFormState({ "message": message, "event": "SUCCESS"});
        }        
    }

    const saveProperty = async () => {
        if(isNew) {
            createProperty();
        }
        else {
            updateProperty();
        }
    }

    const createProperty = async () => {
        const header   = {
            ...context.defaultHeaders,
            method: "POST",
            body: JSON.stringify( { property: property })
        }
        
        const response = await fetch("/api/v1/property", header);
        
        if(response.ok) {
            const json = await response.json();
            
            if( json.status == "error" ) {
                setError(json.message);
            }
            else {
                setProperty(json.record);
                cancelEdit();
                setNew(false);
            }
        }
    }

    const updateProperty = async () => {
        const header   = {
            ...context.defaultHeaders,
            method: "PATCH",
            body: JSON.stringify( { property: property })
        }

      // console.info("Request", header);

        const response = await fetch(`/api/v1/property/${property.id}`, header);
        
        if(response.ok) {
            const json = await response.json();
            
            if( json.status == "error" ) {
                setError(json.message);
            }
            else {
                setProperty(json.record);
                setMessage("Record saved.");
            }

         // console.info("Response", json);
        }
    }

    const setValueHandler = (event) => {
        setProperty(
            {
                ...property,
                [event.target.id]: event.target.value
            }
        );
    }

    const getPropertyHandler = useCallback(
        async () => {
            dispFormState( { event: "LOADING" });

            if(propertyId && propertyId != "-1" && propertyId != "" ) {
                const target = `/api/v1/property/${propertyId}`;

                context.debug("property", "getPropertyHandler(): Calling ", target);

                const request  = await fetch(target, context.defaultHeaders);

                if( request.ok ) {
                    const response = await request.json();
    
                    context.debug("property", "getPropertyHandler()", response);
                    
                    if( response.status === "error") {
                        setError(response.message);
                    }
                    else {
                        const record = context.deNullObject(response.record);

                        setNew(false);

                        setProperty(
                            {
                                ...property,
                                ...record
                            }
                        );
                    }
                }
                else {
                    setError(request.statusText);
                }
            }
        },
        [propertyId],
    );  
    
    const updateRecordHandler = async (event) => {
        if(event) event.preventDefault();

        context.debug("Property", "updateRecordHandler()");

        let target = "", record={};
        
        if(isNew) {
            target = "/api/v1/property";
            record = {
                ...context.defaultHeaders,
                body: JSON.stringify({ property: { ...property }}),
                method:  "POST"
            }; 
        }
        else {
            target = `/api/v1/property/${property.id}`;
            record = {
                ...context.defaultHeaders,
                body: JSON.stringify({ property: { ...property }}),
                method:  "PATCH"
            }; 
        }

        context.debug("Property", "updateRecordHandler(): Sending...", record);

        const response = await fetch(target, record);

        context.debug("Property", "updateRecordHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Property", "updateRecordHandler(2): Received...", json);
        
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setProperty(context.deNullObject(json.record));
                dispFormState( { event: "UPDATED" });

                setMessage(t("record_updated"));
            }
        }
        else {
            setError(response.statusText);
        }
    }    

    useEffect(
        () => {
            getPropertyHandler();
        },
        [propertyId]
    )   

    useEffect(
        () => {
            if( !context.isAuthenticated() ) {
                navigate("/");
            }
    
            if( searchParams.get("id") ) {
                context.debug("SystemProperty", "useEffect(): Initializing By ID", searchParams.get("id"));
                
                setPropertyId(searchParams.get("id"));
            }        
        },
        []
    ) 
        
    return (
        <DefaultLayout>
            <Row />

            { property && <ConfirmModal message={t("confirm_delete")} header={`${t("delete")} '${property.full_name}'`} onContinue={onDeleteRecordHandler} isVisible={showDeleteModal} onClose={hideDeleteModalHandler} /> }

            <div className="news"> 
                <form onSubmit={updateRecordHandler}>
                    <div className="row">
                        <div className="col" style={{ paddingLeft: "0px" }}>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                    <li className="breadcrumb-item"><Link to="/admin/system/properties">{t('properties')}</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">{` ${isNew ? t("new") : t("edit")} ${t("property")} `}</li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col text-end px-2">
                            <button onClick={updateRecordHandler} className="btn btn-default" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></button>
                            <div    className="btn btn-default"         style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></div>
                            <div    className="btn btn-outline-danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" onClick={showDeleteModalHandler} /></div>
                        </div>            
                    </div>
    
                    <Message formState={formState} />

                    <Row />

                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label>{t('name')}</label>
                                <FormControl type="text" onChange={setValueHandler} id="name" className="form-control required" value={property.name} />
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <label>{t('field_type')}</label>
                            <Form.Select id="field_type" onChange={setValueHandler} value={property.field_type}>
                                <option value=""></option>
                                <option value="string">String</option>
                                <option value="date">Date</option>
                                <option value="date_time">Date and Time</option>
                                <option value="time">Time</option>
                                <option value="number">Number</option>
                                <option value="open_close">Open|Closed</option>
                                <option value="true_false">True|False</option>
                            </Form.Select>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label>{t('member')}</label>
                                <FormControl type="text" onChange={setValueHandler} id="user_id" className="form-control" value={property.user_id} />
                            </div>
                        </div>
                    </div>
                    <Row />
                    <div className="row">
                        <div className="col-12">
                            <div className="form-group">
                                <label>{t('value')}</label>
                                <FormControl type="text" onChange={setValueHandler} id="value" className="form-control required" value={property.value} />
                            </div>
                        </div>                        
                    </div> 
                </form>
            </div>
        </DefaultLayout>
    )
}

export default SystemProperty;