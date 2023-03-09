import 
    React,
    {
        useContext,
        useState,
        useEffect,
        useReducer
    }                   from 'react';

import moment           from 'moment';

import {
    Link
}                       from 'react-router-dom';

import { 
    faHome,
    faCalendarPlus, 
    faClock, 
    faSave 
}                       from '@fortawesome/pro-regular-svg-icons';

import { 
    FontAwesomeIcon 
}                       from '@fortawesome/react-fontawesome';

import Button           from 'react-bootstrap/Button';
import Form             from 'react-bootstrap/Form';
import Table            from 'react-bootstrap/Table';

import Row              from '../../../helpers/Row';
import NoPanelLayout    from '../../../layouts/NoPanelLayout';
import Message          from '../../../helpers/Message';
import AppContext       from '../../../context/AppContext';

import { 
    useTranslation 
}                       from 'react-i18next';

const Registrations = (props) => {
    const context = useContext(AppContext);
    const {t}     = useTranslation();

    const [registration,  setRegistration  ] = useState();
    const [registrations, setRegistrations ] = useState([]);
    const [registrants,   setRegistrants   ] = useState([]);
    const [formState,     dispFormState    ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "NEW":
                    return { variant: "success",  message: "New Team"     }
                case "ERROR":
                    return { variant: "danger",   message: action.message }
                case "SAVED":
                    return { variant: "success", message: action.message  }
                case "LOADED":
                    return { variant: "success", message: action.message  }
                case "WARNING":
                    return { variant: "warning", message: action.message  }
                default:
                    return {};
            }
        }, 
        {}
    )

    const setError = (message) => {
        dispFormState( { event: "ERROR", message: message });
    }      

    const getListRegistrationForms = async (event) => {
        const response = await fetch("/api/v1/registration/forms", context.defaultHeaders);

        context.debug("Registrations", "getListRegistrationForms()", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Registrations", "getListRegistrationForms()", json);

            if(json.status === "error") {
                setError(json.message);
            }
            else {
                setRegistrations( json.records );
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const getListRegistrants = async (event) => {
        const response = await fetch(`/api/v1/registration/${registration}/users`, context.defaultHeaders);

        context.debug("Registrations", "getListRegistrants()", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Registrations", "getListRegistrants()", json);

            if(json.status === "error") {
                setError(json.message);
            }
            else {
                setRegistrants(
                    json.records.map(
                        (r) => {
                            return {
                                ...r,
                                selected: false
                            }
                        }
                    )
                );
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const onRegistrantChecked = (event) => {

    }

    const onSelectRegistration = (event) => {
      // console.info("onSelectRegistration()", event);

        setRegistrants([]);
        setRegistration(event.target.value);
    }

    const selectAllNone = (event) => {
      // console.info("selectAllNone()", event);

        setRegistrants(
            registrants.map(
                (r) => {
                    return { ...r, selected: event.target.checked }
                }
            )
        );
    }

    useEffect(
        () => {
            getListRegistrationForms();
        },
        []
    )

    const importRegistrations = (event) => {
        getListRegistrants();
    }

    return (
        <NoPanelLayout>
            <Row />

            <div className="news">
                <div className="row">
                    <div className="col-8">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item">{t('import')}</li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/import/registrations">{t('registrations')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>  

                <Row />

                <Message state={formState} />

                <div className="row">
                    <div className="col-10">
                        <Form.Select id="registration" onChange={onSelectRegistration}>
                            <option key="" value=""></option>
                            {                            
                                registrations.map(
                                    (r, i) => {
                                        return <option key={i} value={r.id}>{r.name}</option>
                                    }
                                )
                            }
                        </Form.Select>
                    </div>
                    <div className="col-2 text-end">
                        <Button onClick={getListRegistrants}>{t("get_registrants")}</Button>
                    </div>
                </div>

                <Row />

                <div className="row">
                    <div className="col">
                        <Table bordered striped hover>
                            <thead>
                                <tr>
                                    <th style={{ width: "25px" }}><Form.Check type="checkbox" onChange={selectAllNone} /></th>
                                    <th>{t("last_name")}</th>
                                    <th>{t("first_name")}</th>
                                    <th>{t("address")}</th>
                                    <th>{t("city")}</th>
                                    <th>{t("state")}</th>
                                    <th>{t("zip_code")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    registrants.map(
                                        (registrant) => {
                                            return (
                                                <tr key={registrant.id}>
                                                    <td><Form.Check type="checkbox" id={registrant.id} checked={registrant.selected} onChange={onRegistrantChecked} /></td>
                                                    <td>{registrant.last_name}</td>
                                                    <td>{registrant.first_name}</td>
                                                    <td>{registrant.address}</td>
                                                    <td>{registrant.city}</td>
                                                    <td>{registrant.state}</td>
                                                    <td>{registrant.zip_code}</td>
                                                </tr>
                                            )
                                        }
                                    )
                                }
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

        </NoPanelLayout>

    )
}

export default Registrations;