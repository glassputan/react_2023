import 
    React, 
    {
        useState,
        useCallback,
        useEffect,
        useReducer,
        useContext
    }                       from 'react';

import Button               from 'react-bootstrap/Button';
import Card                 from 'react-bootstrap/Card';
import Form                 from 'react-bootstrap/Form';
import FormControl          from 'react-bootstrap/FormControl';
import Table                from 'react-bootstrap/Table';

import { useTranslation }   from 'react-i18next';

import AppContext           from '../../../context/AppContext';

import Row                  from '../../../helpers/Row';
import Message              from '../../../helpers/Message';

import RegistrationModel    from '../../../models/Registration';

import ClubSelect           from '../../public/ClubSelect';

import RegistrationModal    from './RegistrationModal';

const Registrations = (props) => {

    const context = useContext(AppContext);
    const [registrations, setRegistrations]     = useState([]);
    const [ formState,      dispFormState  ]    = useReducer(
        (current, action) => {
            switch(action.event) {
                case "MESSAGE":
                    return { variant: "",        message: action.message  }
                case "SUCCESS":
                    return { variant: "success", message: action.message  }
                case "WARNING":
                    return { variant: "warning", message: action.message  }
                case "ERROR":
                    return { variant: "danger",   message: action.message }
                default:
                    return {};
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

    const {t} = useTranslation();

    const member   = props.member;

    const getListRegistrations = useCallback(
        async () => {

            setError(null);

            if( member.id ) {
                const targetUrl = `/api/v1/registrations/${member.id}`;

                context.debug("Registrations", "getListRegistrations()", targetUrl);

                const response  = await fetch(targetUrl, context.defaultHeaders);

                if( response.ok ) {
                    const json = await response.json();

                    context.debug("Registrations", "getListRegistrations() Response", json);

                    if( json.status === "error") {
                        setError(json.message);
                    }
                    else {
                        const records = JSON.parse(json.records);

                        setRegistrations(
                            records.sort(
                                (a, b) => {
                                    return new Date(a.registration_date).getTime() - new Date(b.registration_date).getTime();
                                }
                            )
                        );
                    }
                }
                else {
                    setError(response.statusText);
                }
            }
            else {
                context.debug("Registrations", "getListRegistrations()", props);
            }
        },
        [props.member.id]
    );

    const saveRegistration = async (registration) => {

        let targetURL = "/api/v1/registration",
            record    = {};

        if( !registration.id ) {
            record = {
                ...context.defaultHeaders,
                body: JSON.stringify({ registration: registration }),
                method:  "POST"
            }
        }    
        else {
            targetURL = `/api/v1/registration/${registration.id}`;
            record = {
                ...context.defaultHeaders,
                body: JSON.stringify({ registration: registration }),
                method:  "PATCH"
            }
        }        

        const response = await fetch(targetURL, record);

        if(response.ok) {
            const json = await response.json();

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                getListRegistrations();
                setMessage(t("record_updated"));
                setModalData({ event: "HIDE_MODAL" })
            }
        }
    }    

    const [modalData,     setModalData]         = useReducer(
        (state, action) => {
            switch(action.event) {
                case "HIDE_MODAL": 
                    return { ...state, visible: false, registration: null }                
                case "SHOW_MODAL": 
                    return { 
                        ...state, 
                        visible: true, 
                        registration: action.data, 
                        id: null 
                    }
                case "NEW_REGISTRATION":
                    return { 
                        ...state,
                        visible: true, 
                        id: "", 
                        registration: new RegistrationModel({ season_id: context.properties.season_id }, member)
                    }
                case "SET_MEMBER":
                    return { ...state, member: action.data }
                case "REGISTRATION_UPDATED":
                    getListRegistrations();
                    return { ...state, visible: false, registration: new RegistrationModel() }
                default:
                    if( props.onSetState ) props.onSetState(action);
                    break;
            }

            return { ...state };
        }, 
        { visible: false, member: null, registration: new RegistrationModel() }
    )

    useEffect(
        () => {
            setModalData( { event: "SET_MEMBER", data: props.member });
            getListRegistrations();
        },
        [props.member.id]
    )

    const getListYears = () => {
        const years = [];

        for( let year = new Date().getFullYear(); year >= 1983; year--) {
            years.push(year);
        }

        return years;
    }

    const addRegistration  = (event) => {
        setModalData( { event: "NEW_REGISTRATION" } );
    }

    const getRegistration = (registration_id) => {
        let record = null;

        registrations.forEach(
            (r) => {
                if( r.id.toString() == registration_id.toString() ) {
                    context.debug("Registrations", "getRegistration(): Found it!", r);
                    record = r;
                }
            }
        )

        return record;
    }

    const editRegistration = (event) => {
        context.debug("Registrations", "editRegistration()", event);

        setModalData( { event: "SHOW_MODAL", data: getRegistration(event.target.parentNode.id) });
    }

    const closeModalHandler = (event) => {
        setModalData( { event: "HIDE_MODAL" });
    }

    const fieldChangedHandler = (event) => {
        props.onChangeValue(event);
    }

    const toCamelCase = (value) => {
        return value ? value[0].toUpperCase() + value.substring(1).toLowerCase() : "";
    }

    return (
        <>
            <RegistrationModal 
                onSetState={setModalData} 
                id={modalData.id} 
                registration={modalData.registration} 
                member={modalData.member} 
                isVisible={modalData.visible} 
                onCloseModal={closeModalHandler} 
                onSave={saveRegistration}
                onError={setError}
            />

            <Message formState={formState} />

            <div className="row">
                <div className="col-3">
                    <Row />
                    <div className="row">
                        <div className="col">
                            <ClubSelect onChange={fieldChangedHandler} value={member.club_id} />
                        </div>
                    </div>
                    <Row />
                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label className="control-label" htmlFor="first_registered">First Registered</label>
                                <div className="rails-bootstrap-forms-date-select">
                                    <FormControl type="date" id="first_registered" value={member.first_registered} onChange={fieldChangedHandler} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Row />
                    <div className="row">
                        <div className="col">
                            <label className="control-label" htmlFor="member_jacket_received_in">5-yr Jacket Received In</label>
                            <div className="rails-bootstrap-forms-date-select">
                                <Form.Select id="jacket_received_in" step="1" value={member.jacket_received_in} onChange={fieldChangedHandler}>
                                    <option value=""></option>
                                    {
                                       getListYears().map(
                                           (year) => {
                                               return <option key={year} value={year}>{year}</option>
                                           }
                                       )
                                    }
                                </Form.Select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-9">
                    <Card>
                        <Card.Header className="text-end">
                            <Button size="sm" onClick={addRegistration}>{t("new")}</Button>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                <div className="col">
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Division</th>
                                                <th>Team</th>
                                                <th>Season</th>
                                            </tr>
                                        </thead> 

                                        <tbody>
                                            {
                                                registrations && registrations.map(
                                                    (r) => {
                                                        return (
                                                            <tr key={r.id} onDoubleClick={editRegistration} id={r.id} style={{ cursor: "pointer" }} >
                                                                <td>{ r.id }</td>
                                                                <td>{ r.registration_date }</td>
                                                                <td>{ toCamelCase(r.status) }</td>                                                    
                                                                <td>{ r.division }</td>
                                                                <td>{ (r.team && r.team.hasOwnProperty("name")) ? r.team.name : r.team_id }</td>
                                                                <td>{ (r.season && r.season.hasOwnProperty("name")) ? r.season.name : r.season_id }</td>
                                                            </tr>
                                                        )                                                                            
                                                    }
                                                )
                                            }
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default Registrations;