import React                from 'react';

import {
    useCallback,
    useState,
    useEffect,
    useReducer
}                           from 'react';

import Button               from 'react-bootstrap/Button';
import Card                 from 'react-bootstrap/Card';
import Table                from 'react-bootstrap/Table';

import { 
    useTranslation 
}                           from 'react-i18next';

import ClearanceModal       from './ClearanceModal';

const Clearances = (props) => {
    const debug = (message, extra) => {
        return;
        
        if( extra ) {
          // console.info(message, extra);
        }
        else {
          // console.info(message);
        }
    }; 

    const {t} = useTranslation();

    const [clearances, setClearances] = useState([]);
    const [error,      setError     ] = useState();

    const getListClearanceHandler = useCallback(
        async () => {

            setError(null);

            if( props.member.id ) {
                try {
                    const record = {
                        headers: {
                            'Content-Type': 'application/json',
                            "Accept":       "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    };

                    const targetUrl = `/api/v1/clearances/${props.member.id}`;

                    debug("getListClearanceHandler()", targetUrl);

                    const request  = await fetch(targetUrl, record);
                    const response = await request.json();

                    debug("getListClearanceHandler() Response", response);

                    if( response.status && response.status === "error") {
                        throw new Error(response.message);
                    }
                    else {
                        setClearances(response);
                    }
                }
                catch(xx) {
                    console.error("Clearances::getListClearanceHandler()", xx.message);
                    setError(xx.message);
                }
            }
            else {
                debug("Clearances()", props);
            }
        },
        [props.member.id],
    )

    useEffect(
        () => {
            getListClearanceHandler();
        },
        [props.member.id]
    )

    const newClearance = () => {
        return {
            member_id:          props.member.id,
            clearance_type_id:  "",
            issued_on:          new Date().toISOString().substring(0, 10),
            expires_on:         "",
            expired:            "",
            control_number:     "",
            status:             "",
            created_at:         "",
            updated_at:         ""
        }
    }

    const [modalData,     setModalData]         = useReducer(
        (state, action) => {
            switch(action.event) {
                case "HIDE_MODAL": 
                    return { ...state, visible: false, clearance: null }                
                case "SHOW_MODAL": 
                    return { ...state, visible: true, clearance: action.data }
                case "NEW":
                    return { ...state, visible: true, clearance: newClearance() }
                case "SET_MEMBER":
                    return { ...state, member: action.data }
                case "UPDATED":
                    getListClearanceHandler();
                    return { ...state, visible: false, clearance: null }
                default:
                    if( props.onSetState ) props.onSetState(action);
                    break;
            }

            return { ...state };
        }, 
        { visible: false, member: null, clearance: null }
    )

    useEffect(
        () => {
            setModalData( { event: "SET_MEMBER", data: props.member });
            getListClearanceHandler();
        },
        [props.member.id]
    )

    const addClearance = (event) => {
        setModalData( { event: "NEW" } );
    }

    const getClearance = (clearance_id) => {
        let record = null;

        clearances.forEach(
            (r) => {
                if( r.id.toString() == clearance_id.toString() ) {
                    debug("getClearance(): Found it!", r);
                    record = r;
                }
            }
        )

        return record;
    }

    const editClearance = (event) => {
        debug("editRegistration()", event);
        setModalData( { event: "SHOW_MODAL", data: getClearance(event.target.parentNode.id) });
    }

    const formatDate = (date) => {
        return new Date(date).toISOString().substring(0, 10)
    }

    const closeModalHandler = (event) => {
        setModalData( { event: "HIDE_MODAL" });
    }

    return (
        <div className="row">
            <div className="col-12">
                <Card>
                    <Card.Header className="text-end">
                        <Button size="sm" onClick={addClearance}>{t("new")}</Button>
                    </Card.Header>
                    <Card.Body>
                        {
                            modalData.clearance && 
                            <ClearanceModal 
                                onSetState={setModalData} 
                                clearance={modalData.clearance} 
                                member={modalData.member} 
                                isVisible={modalData.visible} 
                                onCloseModal={closeModalHandler} 
                            />
                        }

                        { error && <div className="text-danger">{error}</div> }
                        { !error && props.member &&
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Received on</th>
                                        <th>Expires on</th>
                                        <th>Document ID</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        clearances.map(
                                            (c) => {
                                                return (
                                                    <tr key={c.id} onDoubleClick={editClearance} id={c.id} style={{ cursor: "pointer"}} className={` hasExpired(c.expires_on) ? 'danger' : "" `} >
                                                        <td>{ c.clearance_type.name }</td>
                                                        <td>{ formatDate(c.issued_on) }</td>
                                                        <td>{ formatDate(c.expires_on)  }</td>
                                                        <td>{ c.control_number }</td>
                                                    </tr>         
                                                )
                                            }
                                        )
                                    }
                                </tbody>
                            </Table>
                        }
                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}

export default Clearances;