import React                from 'react';

import {
    useState,
    useEffect,
    useCallback,
    useReducer,
    useContext
}                           from 'react';

import { 
    useTranslation 
}                           from 'react-i18next';

import Card                 from 'react-bootstrap/Card';
import Table                from 'react-bootstrap/Table';

import CertificationModal   from './CertificationModal';
import AppContext           from '../../../context/AppContext';

const Certifications = (props) => {
    const [certifications, setCertifications] = useState([]);
    const [error,          setError]          = useState();

    const {t} = useTranslation();

    const context = useContext(AppContext)

    const getListCertificationsHandler = useCallback(
        async () => {
            setError(null);

            if(props.member.id) {
                try {
                    const request  = await fetch(`/api/v1/certifications/${props.member.id}`, context.defaultHeaders);

                    context.debug("Certifications", "getListCertificationsHandler(REQ)", request.status);

                    const response = await request.json();

                    context.debug("Certifications", "getListCertificationsHandler(RSP)", response);

                    if( response.status && response.status === "error") {
                        throw new Error(response.message);
                    }
                    else {
                        context.debug("Certifications", "getListCertificationsHandler(): Certifications", response.records);

                        setCertifications(response.records);

                    }
                }
                catch(xx) {
                    setError(xx.message);

                    console.error("getListCertificationsHandler()", xx.message);
                }
            }
        },
        [props.member.id]
    );

    const [modalData,     setModalData]         = useReducer(
        (state, action) => {
            switch(action.event) {
                case "HIDE_MODAL": 
                    return {
                        ...state, 
                        visible: false, 
                        certification: {
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
                    }                
                case "SHOW_MODAL": 
                    return { ...state, visible: true, certification: action.data, id: null }
                case "NEW":
                    return { 
                        ...state, 
                        visible: true, 
                        id: -1, 
                        certification: {
                            member_id:             props.member.id,
                            control_number:        "",
                            name:                  "",
                            certification_type:    "",
                            certification_level:   "",
                            received_on:           new Date().toISOString().substring(0, 10),
                            expires_on:            "",
                            created_at:            new Date().toISOString().substring(0, 10),
                            updated_at:            new Date().toISOString().substring(0, 10)
                        }
                    }
                case "SET_MEMBER":
                    return { ...state, member: action.data }
                case "UPDATED":
                    getListCertificationsHandler();
                    return { 
                        ...state, 
                        visible: false, 
                        certification: {
                            member_id:             0,
                            control_number:        "",
                            certification_type:    "",
                            received_on:           new Date().toISOString().substring(0, 10),
                            expires_on:            "",
                            created_at:            new Date().toISOString().substring(0, 10),
                            updated_at:            new Date().toISOString().substring(0, 10)
                        } 
                    }
                default:
                    if( props.onSetState ) props.onSetState(action);
                    break;
            }

            return { ...state };
        }, 
        { visible: false, member: null, certification: null }
    )

    const addCertification = (event) => {
        setModalData( { event: "NEW" } );
    }

    const getCertification = (certification_id) => {
        let record = null;

        certifications.forEach(
            (r) => {
                if( r.id.toString() == certification_id.toString() ) {
                    context.debug("Certifications", "getCertification(): Found it!", r);
                    record = r;
                }
            }
        )

        return record;
    }

    const editCertification = (event) => {
        context.debug("Certifications", "editCertification()", event);

        setModalData( { event: "SHOW_MODAL", data: getCertification(event.target.parentNode.id) });
    }    

    const hasExpired = (date) => {
        return false;
    }

    const closeModalHandler = (event) => {
        setModalData( { event: "HIDE_MODAL" });
    }

    useEffect(
        () => {
            setModalData( { event: "SET_MEMBER", data: props.member });
            getListCertificationsHandler();
        },
        [props.member.id]
    )    

    return (
        <div className="row">
            <div className="col-12">
                { 
                    modalData.certification && 
                    <CertificationModal onSetState={setModalData} certification={modalData.certification} member={modalData.member} isVisible={modalData.visible} onCloseModal={closeModalHandler} />
                }

                <Card>
                    <Card.Header className="text-end">
                        <div className="btn btn-primary btn-sm" onClick={addCertification}>{t("new")}</div>
                    </Card.Header>
                    <Card.Body>
                        {
                            !error &&                             
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Cert</th>
                                            <th>Type</th>
                                            <th>Level</th>
                                            <th>Received on</th>
                                            <th>Expires on</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            certifications.map(
                                                (xert) => {
                                                    return <tr key={xert.id} onDoubleClick={editCertification} id={xert.id} style={{ cursor: "pointer" }} className={`${hasExpired(xert.expires_on) ? 'danger': ""}`} >
                                                        <td>{ xert.name }</td>
                                                        <td>{ xert.certification_type }</td>
                                                        <td>{ xert.certification_level }</td>
                                                        <td>{ xert.received_on }</td>
                                                        <td>{ xert.expires_on  }</td>
                                                    </tr> 
                                                }
                                            )
                                        }
                                    </tbody>
                                </Table>
                        }

                        { error && <div className="text-danger">{error}</div> }
                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}

export default Certifications;