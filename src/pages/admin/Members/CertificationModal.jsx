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

import AppContext   from '../../../context/AppContext';

const CertificationModal = (props) => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [ error,          setError]           = useState();
    const [ isNew,          setNew]             = useState(true);
    const [ certification,  setCertification]   = useState(
        {
            member_id:             0,
            control_number:        "",
            name:                  "",
            certification_type:    "",
            certification_level:   "",
            received_on:           new Date().toISOString().substring(0, 10),
            expires_on:            "",
            created_at:            new Date().toISOString().substring(0, 10),
            updated_at:            new Date().toISOString().substring(0, 10)
        }
    );

    const [ certificationTypes, setCertificationTypes]  = useState([]);
        
    useEffect(
        () => {
            context.debug("CertificationModal", "useEffect(props)", props);

            if( props.member ) {
                context.debug("CertificationModal", "useEffect(props): member detected", props.member);

                setCertification(
                    {
                        ...certification,
                        member_id: props.member.id
                    }
                )
            }

            if( props.certification ) {
                context.debug("CertificationModal", "useEffect(props): certification detected", props.certification);

                const c = {
                    ...props.certification
                };

                Object.keys(props.certification).map(
                    (key) => {
                        c[key] = props.certification[key] ? props.certification[key] : "";
                    }
                )
                
                setNew( props.certification.id ? false : true );
                setCertification(c);
            }
        },
        [props]
    )

    const getListCertificationTypes = useCallback(
        async () => {
            try {
                const request  = await fetch("/api/v1/certification_types", context.defaultHeaders);
                const response = await request.json();

                context.debug("CertificationModal", "getListCertificationTypes() Response", response);

                if( response.status && response.status === "error") {
                    throw new Error(response.message);
                }
                else {
                    setCertificationTypes(response);

                    context.debug("CertificationModal", "getListCertificationTypes()", response);
                }
            }
            catch(xx) {
                console.warn("getListCertificationTypes()", xx.message);                
            }
        },
        []       
    )

    useEffect(
        () => {
            getListCertificationTypes();
        },
        []
    )

    const fieldChangeHandler = (event) => {
        setCertification(
            {
                ...certification,
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

    const saveCertification = (event) => {
        event.preventDefault();

        context.debug("CertificationModal", "saveCertification()", certification);

        let actionURL = "/api/v1/certification";

        let record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ certification: { ...certification }}),
            method:  "POST"
        };

        if( certification.id && certification.id != -1 ) {
            
            actionURL = `${actionURL}/${certification.id}`;

            record = {
                ...record,
                method: "PATCH"
            };
        }

        context.debug("CertificationModal", "saveCertification(): Sending...", record);

        fetch(actionURL, record)
            .then(
                (response) => { 

                    context.debug("CertificationModal", "saveCertification(1): Received...", response);

                    if( response.ok ) {
                        response.json().then(
                            (json) => { 
                                context.debug("CertificationModal", "saveCertification(2): Received...", json);
        
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

    const getCertificationType = (id) => {
        let certification_type = { renewal_period_months: 60 };

        certificationTypes.forEach(
            (c) => {
                if( c.id == id ) {
                    certification_type = c;
                }
            }
        )

        return certification_type;
    }

    const issuedDateHandler = (event) => {
        try {
            const issued       = new Date(event.target.value);
            const expires      = new Date(event.target.value);
            const expirePeriod = getCertificationType(certification.certification_type_id).renewal_period_months / 12;

            context.debug("CertificationModal", "issuedDateHandler()", { certification_id: certification.certification_type_id, issued: issued.toISOString().substring(0,10), expires: expires.toISOString().substring(0,10), period: expirePeriod } )
            
            expires.setFullYear( issued.getFullYear() + expirePeriod );

            setCertification(
                {
                    ...certification,
                    received_on:  issued.toISOString().substring(0,10),
                    expires_on: expires.toISOString().substring(0,10)
                }
            )
        }
        catch(xx) {
            console.warn("selectClearnce()", xx.message);
        }
    }  

    const deleteCertification = (event) => {
        event.preventDefault();

        context.debug("CertificationModal", "deleteCertification()");

        const actionURL = `/api/v1/certification/${certification.id}`;

        const record = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };

        context.debug("CertificationModal", "deleteCertification(): Sending...", record);

        fetch(actionURL, record)
            .then(
                (response) => { 
                    context.debug("CertificationModal", "deleteCertification()", response);
                    
                    setMessageHandler("UPDATED", t("record_destroyed"));
                }
            )
    }

    return (
        <Modal show={props.isVisible} onHide={handleClose}>
            <Modal.Header closeButton>
            <Row><h4 className="modal-title">{ isNew ? "New" : "Edit" } Certification</h4></Row>                
            </Modal.Header>
            <Modal.Body>
                { error && <Row><Alert variant="danger">{error}</Alert></Row> }
                <div className="row">
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="certification">{t("name")}</label>
                            <input type="text" className="form-control" required id="name" onChange={fieldChangeHandler} value={certification.name} />
                        </div>
                    </div>  
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="certification_level">{t("certification_level")}</label>
                            <input type="text" className="form-control" required id="certification_level" onChange={fieldChangeHandler}  value={certification.certification_level}/>
                        </div>
                    </div>  
                </div>
                <div className="row">
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="certification_type">{t("type")}</label>
                            <input type="text" className="form-control" required id="certification_type" onChange={fieldChangeHandler} value={certification.certification_type} />
                        </div>
                    </div>  
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="control_number">{t("control_number")}</label>
                            <input type="text" className="form-control" required id="control_number" onChange={fieldChangeHandler}  value={certification.control_number}/>
                        </div>
                    </div>  
                </div>
                <div className="row">
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="received_on">{t("issued_on")}</label>
                            <div className="input-group mb-3">
                                <input type="date" required id="received_on" className="form-control" placeholder="Issued" onChange={issuedDateHandler} value={certification.received_on}/>
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2"><FontAwesomeIcon icon={faCalendarAlt} size="2x" /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="expires_on">{t("expires_on")}</label>
                            <div className="input-group mb-3">
                                <input type="date" id="expires_on" className="form-control" aria-describedby="expires_on" onChange={fieldChangeHandler} value={certification.expires_on} />
                                <div className="input-group-append">
                                    <span className="input-group-text" id="expires_on"><FontAwesomeIcon icon={faCalendarAlt} size="2x"/></span>
                                </div>
                            </div>                            
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer style={{ display: "inline" }}>
                <div className="row">
                    <div className="col-6">
                        <Button variant="danger"  onClick={deleteCertification}><FontAwesomeIcon icon={faTrash} /></Button>
                    </div>
                    <div className="col-6 text-end">
                        <Button className="text-start" style={{ marginRight: "10px"}} variant="secondary" onClick={handleClose}>{t("close")}</Button>
                        <Button variant="primary" onClick={saveCertification}>{ t("save") }</Button>
                    </div> 
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default CertificationModal;