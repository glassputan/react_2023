import React from 'react';

import {
    useContext,
    useEffect,
    useReducer,
    useState
}                   from 'react';

import { 
    useTranslation 
}                   from 'react-i18next';

import FormControl  from 'react-bootstrap/FormControl';
import Modal        from 'react-bootstrap/Modal';
import Table        from 'react-bootstrap/Table';

import AppContext   from '../../../context/AppContext';

import MemberQueryResultRow from './MemberQueryResultRow';

const MemberModal = (props) => {
    const {t}       = useTranslation();
    const context   = useContext(AppContext);

    const [ query,     setQuery ]      = useState({
        field:     "last_name",
        operation: "sw",
        value:     ""
    });

    const [ isLoading,  setLoading   ] = useState(false);
    const [ members,   setMembers    ] = useState([]);
    const [ formState, dispFormState ] = useReducer(
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
        {}
    )
    
    const setError = (message) => {
        dispFormState({ event: "ERROR", message: message });
    }

    const setMessage = (message) => {
        dispFormState({ event: "SUCCESS", message: message });
    } 

    const executeSearchHandler = async (event) => {
        setLoading(true);
        setError(null);

        context.debug("MemberModal", "executeSearchHandler()", query);

        const record = {
            ...context.defaultHeaders,
            body:    JSON.stringify({ query: query }),
            method:  "POST"
        };

        const response  = await fetch("/api/v1/search/members", record);

        if( response.ok ) {
            const json = await response.json();

            context.debug("MemberModal", "executeSearchHandler() Response", json);

            if( json.status && (json.status === "error" || json.status === "not_authorized")) {
                setError(json.message);
            }
            else {
                setMembers(json.records);
            }
        }
        else {
            setError(response.statusText);
        }

        setLoading(false);
    }
    
    const onEnterHandler = (event) => {
        if(event.nativeEvent.key == "Enter") {
            executeSearchHandler();
        }
    }

    const queryChangeHandler = (event) => {
        setQuery(
            {
                ...query,
                [event.target.id]: event.target.value
            }
        );
    }

    const handleClose = (event) => {
        if( props.onClose ) {
            props.onClose();
        }
        else {
            console.warn("Missing prop 'onClose'");
        }
    }

    return (
        <Modal show={props.visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <label>{t("last_name")}</label>
                <FormControl type="text" id="value" onKeyUp={onEnterHandler} onChange={queryChangeHandler} value={query.value} />
            </Modal.Header>
                
            <Modal.Body>
            <Table striped hover>
                        <thead>
                            <tr>
                                <th>Last Name</th>
                                <th>First Name</th>
                                <th>Type</th>
                                <th>Updated at</th>
                            </tr>
                        </thead>

                        <tbody>
                            { 
                                !isLoading && Array.isArray(members) && 
                                members.sort(
                                    (a, b) => {
                                        var nameA = (a.last_name || "").toUpperCase(), // ignore upper and lowercase
                                            nameB = (b.last_name || "").toUpperCase(); // ignore upper and lowercase
                                    
                                        if (nameA < nameB) { return -1; }
                                        if (nameA > nameB) { return  1; }
                                        return 0;
                                    }
                                )
                                .sort(
                                    (a, b) => {
                                        var nameA = (a.first_name || "").toUpperCase(), // ignore upper and lowercase
                                            nameB = (b.first_name || "").toUpperCase(); // ignore upper and lowercase
                                    
                                        if (nameA < nameB) { return -1; }
                                        if (nameA > nameB) { return  1; }
                                        return 0;
                                    }
                                )
                                .map(
                                    (member) => {
                                        return (
                                            <MemberQueryResultRow key={member.id} member={member} />
                                        )
                                    }
                                )
                            }
                        </tbody>    
                    </Table>
            </Modal.Body>

            <Modal.Footer>

            </Modal.Footer>

        </Modal>

    )
}

export default MemberModal;