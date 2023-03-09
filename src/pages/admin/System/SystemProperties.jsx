import 
    React,
    { 
        useState, 
        useEffect,
        useContext
    }                     from "react";

import { 
        useTranslation 
    }                     from "react-i18next";

import { 
    Link 
    }                     from 'react-router-dom'

import { 
    FontAwesomeIcon 
    }                     from '@fortawesome/react-fontawesome'

import { 
    faHome,
    faTimes,
    faTrash,
    faCircleInfo,
    faSquare0,
    faSquare1
}                         from '@fortawesome/pro-regular-svg-icons'

import {
    faDoorOpen,
    faDoorClosed
}                           from '@fortawesome/pro-duotone-svg-icons'

import Alert                from 'react-bootstrap/Alert';
import Button               from 'react-bootstrap/Button';
import Form                 from 'react-bootstrap/Form';
import Table                from 'react-bootstrap/Table';

import DefaultLayout        from "../../../layouts/DefaultLayout"
import Row                  from '../../../helpers/Row';
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';
import AppContext           from '../../../context/AppContext';
import SystemPropertyModel  from '../../../models/SystemPropertyModel';
import ToggleButton         from '../../../helpers/Input/ToggleButton';

const SystemProperty = (props) => {
    const {t} = useTranslation();
    const context = useContext(AppContext);

    const [isNew,     setIsNew]    = useState(true);
    const [isEditing, setEditing]  = useState(false);
    const [isDirty,   setDirty]    = useState(false);
    const [property,  setProperty] = useState(props.record);

    const editRowHandler = (event) => {
        setEditing(!isEditing);
    }

    const deletePropertyHandler = () => {
        if( props.onDelete ) {
            props.onDelete(property);
        }
        else {
            context.warn("SystemProperty", "Missing property 'onDelete'");
        }        
    }

    const setError = (message) => {
        if( props.onError ) {
            props.onError(message);
        }
        else {
            context.warn("SystemProperty", "Missing property 'onError'");
        }
    }

    const cancelEdit = () => {
        setEditing(false);
    }

    const selectAll = (event) => {
        event.target.select();
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
                setIsNew(false);
            }
        }
    }

    const updateProperty = async () => {
        const header   = {
            ...context.defaultHeaders,
            method: "PATCH",
            body: JSON.stringify( { property: property })
        }

        //console.info("Request", header);

        const response = await fetch(`/api/v1/property/${property.id}`, header);
        
        if(response.ok) {
            const json = await response.json();
            
            if( json.status == "error" ) {
                setError(json.message);
            }
            else {
                setProperty(json.record);
                cancelEdit();
            }

          // console.info("Response", json);
        }
    }

    const updatePropertyAttribute = (event) => {
        setProperty(
            {
                ...property,
                [event.target.id]: event.target.value
            }
        );
    }
    
    const updateToggleAttribute = (event) => {

        setProperty(
            {
                ...property,
                "value": setToggleValue(event.target.value, property.field_type)
            }
        );

        setDirty(true);
    }

    useEffect(
        () => {
            const timeout = setTimeout(
                () => {
                    if(isDirty) {
                        updateProperty();
                        setDirty(false);
                    }                    
                }, 
                2000
            );
        
            return () => clearTimeout(timeout);
        }, 
        [isDirty]
    );    
    
    const saveOnEnter = (event) => {
        if(event.nativeEvent.key == "Enter") {
            saveProperty();
        }
    }

    const setToggleValue = (value, fieldType) => {
        if(value != true && value.toString() != "true" && value.toString() != "open") {
            if(fieldType == "open_closed") return "closed";
            return "false";
        }
        else {
            if(fieldType == "open_closed") return "open";
            return "true";
        } 
    }

    const getToggleValue = (value) => {
        if(value != true && value.toString() != "true" && value.toString() != "open") {
            return false;
        }
        
        return true;
    }

    const UnChecked   = () => <><FontAwesomeIcon icon={faDoorClosed} /></>;
    const Checked     = () => <><FontAwesomeIcon icon={faDoorOpen} /></>;   
    
    const False       = () => <><FontAwesomeIcon icon={faSquare1} /></>
    const True        = () => <><FontAwesomeIcon icon={faSquare0} /></>

    useEffect(
        () => {
            if( property.id == "-1" ) {
                setEditing(true);
            }
            else {
                setIsNew(false);
            }
        },
        [property]
    )

    return (
            <tr key={props.record.id} onDoubleClick={editRowHandler}>
                {
                    <>
                        <td>
                            {
                                !isEditing &&
                                <span style={{ paddingTop: "5px", paddingLeft: "5px" }}>
                                    <Link to={`/admin/system/property?id=${property.id}`}><FontAwesomeIcon icon={faCircleInfo} size="2x" /></Link>
                                </span>
                            }
                            {
                                isEditing &&
                                <>
                                    <Button style={{ marginRight: "10px" }} variant="outline-danger"    onClick={deletePropertyHandler}><FontAwesomeIcon icon={faTrash} /></Button>
                                    <Button style={{ marginRight: "10px" }} variant="outline-secondary" onClick={cancelEdit}><FontAwesomeIcon icon={faTimes} /></Button>
                                </>
                            }
                        </td>
                        <td>
                            <Form.Control id="name"  disabled={!isEditing} value={property.name}  onChange={updatePropertyAttribute} onKeyUp={saveOnEnter} onFocus={selectAll} />
                        </td>
                        <td>
                        {
                            property.field_type == "open_close" &&
                            <ToggleButton name={property.name} defaultValue={getToggleValue(property.value)} id="value" value={property.value} icons={{checked: <Checked />, unchecked: <UnChecked />}} onChange={updateToggleAttribute} />
                        }
                        {
                            property.field_type == "true_false" &&
                            <ToggleButton name={property.name} defaultValue={getToggleValue(props.record.value)} id="value" icons={{checked: <False />, unchecked: <True />}} onChange={updateToggleAttribute} />
                        }                        
                        {
                            (!property.field_type || property.field_type == "" || property.field_type == "string") &&
                            <Form.Control id="value" disabled={!isEditing} value={property.value} onChange={updatePropertyAttribute} onKeyUp={saveOnEnter} onFocus={selectAll} />
                        }
                        </td>
                    </>
                }

                <td>
                    {
                        new Intl.DateTimeFormat("ISO", 
                            {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
                            }
                        ).format(new Date(property.updated_at))
                    }
                </td>
                <td>{ props.record.value.substring(0, 10) }</td>
            </tr>
    )
}

const SystemProperties = () => {
    const {t} = useTranslation();

    const context = useContext(AppContext);

    const [isLoading,  setIsLoading  ] = useState(false);
    const [error,      setError      ] = useState(null);
    const [properties, setProperties ] = useState([]);
    const [property,   setProperty   ] = useState();
        
    const getListPropertiesHandler = async () => {
        setIsLoading(true);
        setError(null);

        const response  = await fetch("/api/v1/system/properties", context.defaultHeaders);

        if( response.ok ) {
            const json = await response.json();

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setProperties(json.records);
              // console.info("Response", json);
            }    
        }
        else {
            setError(response.statusText);
        }

        setIsLoading(false);
    }

    const newProperty = () => {
        setProperties(
            [
                ...properties,
                new SystemPropertyModel({ id: "-1" })
            ]
        )   
    }
    
    const onDeleteRecordHandler = async () => {
        const header   = {
            ...context.defaultHeaders,
            method: "DELETE"
        }

        const response = await fetch(`/api/v1/property/${property.id}`, header);

        if(response.ok) {
            const json = await response.json();

            if( json.status == "error" ) {
                setError(json.message);
            }
            else {
                setProperty(null);
                getListPropertiesHandler();
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const showDeleteModal = () => {
        return property != null;
    }

    const onOpenDeleteModalHandler = (property) => {
        setProperty(property);
    }

    const onCloseDeleteModalHandler = () => {
        setProperty(null);
    }

    useEffect( 
        () => {
            getListPropertiesHandler();
        }, 
        []
    );    

    return (
        <DefaultLayout>
            { property && <ConfirmModal message={t("confirm_delete")} header={`${t("delete")} '${property.name || ""}'`} onContinue={onDeleteRecordHandler} isVisible={showDeleteModal} onClose={onCloseDeleteModalHandler} /> }

            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-10">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item">{t("system")}</li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/system/properties">{t('properties')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-2 text-end">
                        <Button variant="outline-primary" onClick={newProperty}>{t('new')}</Button>
                    </div>
                </div>

                <Row />
                                        
                { isLoading && <Alert variant="warning">Loading...</Alert> }
                { error     && <Alert variant="error">{error}</Alert>      }

                <Table bordered striped responsive >
                    <thead>
                        <tr>
                            <th></th>
                            <th>{t("name")}</th>
                            <th>{t("value")}</th>
                            <th>{t("updated_at")}</th>
                            <th>Value</th>
                        </tr>
                    </thead>

                    <tbody>
                    { 
                        !isLoading && !error && Array.isArray(properties) && 
                        properties
                            .sort(
                                (a, b) => {
                                    var nameA = (a.name || "").toUpperCase(), // ignore upper and lowercase
                                        nameB = (b.name || "").toUpperCase(); // ignore upper and lowercase
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .map(
                                (job) => {
                                    return (
                                        <SystemProperty key={job.id} record={job} onDelete={onOpenDeleteModalHandler} onError={setError} />
                                    )
                                }
                            )
                    }
                    </tbody>
                </Table>

                <Row />
            </div>
        </DefaultLayout>
    )
}

export default SystemProperties;