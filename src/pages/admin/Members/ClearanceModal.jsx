import React        from 'react';

import { 
    faCalendarAlt, 
    faSave, 
    faTrash
}                   from '@fortawesome/pro-regular-svg-icons';

import { 
    FontAwesomeIcon 
}                   from '@fortawesome/react-fontawesome';


import {
    useState,
    useCallback,
    useEffect,
    useContext
}                   from 'react';

import { 
    Modal,
    Alert,
    Button
}                   from 'react-bootstrap';

import Row          from '../../../helpers/Row';

import { 
    useTranslation 
}                   from 'react-i18next';

import Clearance    from '../../../models/Clearance';

import AppContext   from '../../../context/AppContext';

const ClearanceModal = (props) => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [ error,          setError]           = useState();
    const [ isNew,          setNew]             = useState(true);
    const [ clearance,      setClearance]       = useState(new Clearance())
    const [ clearanceTypes, setClearanceTypes]  = useState([]);
        
    useEffect(
        () => {
            context.debug("ClearanceModal", "useEffect(props)", props);

            if( props.member ) {
                context.debug("ClearanceModal", "useEffect(props): member detected", props.member);

                setClearance(
                    {
                        ...clearance,
                        member_id: props.member.id
                    }
                )
            }

            if( props.clearance ) {
                context.debug("ClearanceModal", "useEffect(props): clearance detected", props.clearance);

                const c = {
                    ...props.clearance
                };

                Object.keys(props.clearance).map(
                    (key) => {
                        c[key] = props.clearance[key] ? props.clearance[key] : "";
                    }
                )
                
                setNew( props.clearance.id ? false : true );
                setClearance(c);
            }
        },
        [props]
    )

    const getListClearanceTypes = useCallback(
        async () => {
            try {
                const record = {
                    headers: {
                        'Content-Type': 'application/json',
                        "Accept":       "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                };

                const request  = await fetch("/api/v1/clearance_types", context.defaultHeaders);
                const response = await request.json();

                context.debug("ClearanceModal", "getListClearanceTypes() Response", response);

                if( response.status && response.status === "error") {
                    throw new Error(response.message);
                }
                else {
                    setClearanceTypes(response);

                    context.debug("ClearanceModal", "getListClearanceTypes()", response);
                }
            }
            catch(xx) {
                console.warn("getListClearanceTypes()", xx.message);                
            }
        },
        []       
    )

    useEffect(
        () => {
            getListClearanceTypes();
        },
        []
    )

    const fieldChangeHandler = (event) => {
        setClearance(
            {
                ...clearance,
                [event.target.id]: event.target.value
            }
        );
    }

    const handleClose = (event) => {
        props.onCloseModal();
    }

    const setMessageHandler = (event, message) => {

        if( event === "ERROR" )
            setError(message);

        if( props.onSetState )
            props.onSetState( { event: event, message: message });
    }

    const saveClearance = (event) => {
        event.preventDefault();

        context.debug("ClearanceModal", "saveClearance()");

        let actionURL = "/api/v1/clearance";

        let record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ clearance: { ...clearance }}),
            method:  "POST"
        };

        if( clearance.id && clearance.id != -1 ) {
            
            actionURL = `${actionURL}/${clearance.id}`;

            record = {
                ...record,
                method: "PATCH"
            };
        }

        context.debug("ClearanceModal", "saveClearance(): Sending...", record);

        fetch(actionURL, record)
            .then(
                (response) => { 

                    context.debug("ClearanceModal", "saveClearance(1): Received...", response);

                    if( response.ok ) {
                        response.json().then(
                            (json) => { 
                                context.debug("ClearanceModal", "saveClearance(2): Received...", json);
        
                                if(json) {
                                    if( json.status === "error") {
                                        setMessageHandler("ERROR", json.message);
                                        throw new Error(json.message);
                                    }
                                    else {
                                        setMessageHandler("UPDATED", t("record_updated"));
                                    }
                                }
                                else {
                                    throw new Error("No response");
                                }
                            }        
                        )
                    }
                    else {
                        throw new Error(response.statusText);
                    }
                }
            ).catch( 
                (xx) => {
                    setMessageHandler("ERROR", xx.message);
                }
            );
    }

    const getClearanceType = (id) => {
        let clearance_type = { renewal_period_days: 30 };

        clearanceTypes.forEach(
            (c) => {
                if( c.id == id ) {
                    clearance_type = c;
                }
            }
        )

        return clearance_type;
    }

    const issuedDateHandler = (event) => {
        try {
            const issued       = new Date(event.target.value);
            const expires      = new Date(event.target.value);
            const expirePeriod = getClearanceType(clearance.clearance_type_id).renewal_period_days / 12;

            context.debug("ClearanceModal", "issuedDateHandler()", { clearance_id: clearance.clearance_type_id, issued: issued.toISOString().substring(0,10), expires: expires.toISOString().substring(0,10), period: expirePeriod } )
            
            expires.setFullYear( issued.getFullYear() + expirePeriod );

            setClearance(
                {
                    ...clearance,
                    issued_on:  issued.toISOString().substring(0,10),
                    expires_on: expires.toISOString().substring(0,10)
                }
            )
        }
        catch(xx) {
            console.warn("selectClearnce()", xx.message);
        }
    }

    const issuedClearanceHandler = (event) => {
        try {
            const issued       = new Date(clearance.issued_on);
            const expires      = new Date(clearance.issued_on);
            const expirePeriod = getClearanceType(event.target.value).renewal_period_days / 12;
            
            context.debug("ClearanceModal", "issuedClearanceHandler()", { clearance_id: event.target.value, issued: issued.toISOString().substring(0,10), expires: expires.toISOString().substring(0,10), period: expirePeriod } )

            expires.setFullYear( issued.getFullYear() + expirePeriod );

            setClearance(
                {
                    ...clearance,
                    clearance_type_id:  event.target.value,
                    issued:             issued.toISOString().substring(0,10),
                    expires_on:         expires.toISOString().substring(0,10)
                }
            )
        }
        catch(xx) {
            console.warn("selectClearnce()", xx.message);
        }
    }    

    const attachClearance = (event) => {

    }

    const viewClearance = (event) => {

    }

    const deleteClearance = (event) => {
        event.preventDefault();

        context.debug("ClearanceModal", "deleteClearance()");

        const actionURL = `/api/v1/clearance/${clearance.id}`;

        const record = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };

        context.debug("ClearanceModal", "deleteClearance(): Sending...", record);

        fetch(actionURL, record)
            .then(
                (response) => { 
                    context.debug("ClearanceModal", "deleteClearance()", response);
                    
                    setMessageHandler("UPDATED", t("record_destroyed"));
                }
            )
    }

    return (
        <Modal show={props.isVisible} onHide={handleClose}>
            <Modal.Header closeButton>
            <Row><h4 className="modal-title">{ isNew ? "New" : "Edit" } Clearance</h4></Row>                
            </Modal.Header>
            <Modal.Body>
                { error && <Row><Alert variant="danger">{error}</Alert></Row> }
                <div className="row">
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="type_id">Type</label>
                            <select className="form-control" required id="clearance_type_id" onChange={issuedClearanceHandler} value={clearance.clearance_type_id}>
                            <option key="0" value=""></option>
                                {
                                    clearanceTypes.map(
                                        (type) => {
                                            return <option key={type.id} value={type.id}>{type.name}</option>;
                                        }
                                    )
                                }
                            </select>                                
                        </div>
                    </div>  
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="control_number">Control number</label>
                            <input type="text" className="form-control" required id="control_number" onChange={fieldChangeHandler}  value={clearance.control_number}/>
                        </div>
                    </div>  
                </div>
                <div className="row">
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="issued_on">Issued</label>
                            <div className="input-group mb-3">
                                <input type="date" required id="issued_on" className="form-control" placeholder="Issued" onChange={issuedDateHandler} value={clearance.issued_on}/>
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2"><FontAwesomeIcon icon={faCalendarAlt} size="2x" /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="expires_on">Expires</label>
                            <div className="input-group mb-3">
                                <input type="date" id="expires_on" className="form-control" aria-describedby="expires_on" onChange={fieldChangeHandler} value={clearance.expires_on} />
                                <div className="input-group-append">
                                    <span className="input-group-text" id="expires_on"><FontAwesomeIcon icon={faCalendarAlt} size="2x"/></span>
                                </div>
                            </div>                            
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-7">
                            <label className="control-label" htmlFor="document">Document</label><br/>
                            <input type="file" id="document" onChange={fieldChangeHandler} value={clearance.document} />
                    </div>
                    <div className="col-5">
                        <div className="text-end">
                            <label>&nbsp;</label><br/>
                            <Button size="sm" style={{ marginRight: "10px" }} onClick={attachClearance}>Attach</Button>
                            <Button size="sm" onClick={viewClearance}>View</Button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="status">Status</label>
                            <select className="form-control" id="status" onChange={fieldChangeHandler} value={clearance.status}>
                                <option value="verified">Verified</option>
                                <option value="declined">Declined</option>
                            </select>
                        </div>
                    </div>
                    <div className="col col-md-6">
                        &nbsp;
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer style={{ display: "inline" }}>
                <div className="row">
                    <div className="col-6">
                        <Button variant="danger"  onClick={deleteClearance}><FontAwesomeIcon icon={faTrash} /></Button>
                    </div>
                    <div className="col-6 text-end">
                        <Button className="text-start" style={{ marginRight: "10px"}} variant="secondary" onClick={handleClose}>Close</Button>
                        <Button variant="primary" onClick={saveClearance}>{ t("save") }</Button>
                        
                    </div> 
                </div>   
            </Modal.Footer>
        </Modal>
    )
}

export default ClearanceModal;