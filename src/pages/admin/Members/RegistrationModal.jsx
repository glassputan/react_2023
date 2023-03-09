import React        from 'react';

import { 
    faCalendarAlt, 
    faSave 
}                   from '@fortawesome/pro-regular-svg-icons';

import { 
    FontAwesomeIcon 
}                   from '@fortawesome/react-fontawesome';

import { useTranslation } from 'react-i18next';

import {
    useState,
    useCallback,
    useEffect,
    useContext
}                   from 'react';

import Modal        from 'react-bootstrap/Modal';

import Row          from '../../../helpers/Row';

import AppContext         from '../../../context/AppContext';
import RegistrationModel  from '../../../models/Registration';

const RegistrationModal = (props) => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [ isNew,          setNew]             = useState(true);
    const [ teams,          setTeams]           = useState([]);
    const [ seasons,        setSeasons]         = useState([]);
    const [ currentSeason,  setCurrentSeason]   = useState(-1);
    const [ registration,   setRegistration]    = useState(new RegistrationModel());
    const [ member,         setMember]          = useState({});

    const setError = (message) => {
        if(props.onError) {
            props.onError(message);
        }
        else {
            console.warn("RegistrationModal::setError(): Missing Property 'onError'");
        }
    }
    
    const getListTeams = useCallback(
        async () => {
            const target   = `/api/v1/teams?${ member.gender ? "gender=" + member.gender : "" }&travel=${ registration.team_type == "travel" ? true : false}`;
            
            const response  = await fetch(target, context.defaultHeaders);
            
            if( response.ok ) {
                const json = await response.json();

                //context.debug("RegistrationModal", "getListTeams()", json);

                if( json.status === "error") {
                    throw new Error(json.message);
                }
                else {
                    const teams = json.records.rec.concat( json.records.rec.travel )

                    setTeams(
                        teams.sort(
                            (a, b) => {
                                return b.year - a.year;
                            }
                        )
                    );
                }
            }
            else {
                setError(response.statusText);
            }
        },
        [member.gender, registration.team_type]
    )

    const getListSeasons = useCallback(
        async () => {
            const response  = await fetch("/api/v1/seasons", context.defaultHeaders);

            if( response.ok ) {
                const json = await response.json();

                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    setSeasons(
                        json.records
                            .sort(
                                (a, b) => {
                                    if(a.name.toLowerCase().indexOf("s")) return -1;
                                    return 0;
                                }
                            )                        
                            .sort(
                                (a, b) => {
                                    return b.year - a.year;
                                }
                            )
                            
                    );

                    setCurrentSeason(json.current);
                }
            }
            else {
                setError(response.statusText);
            }
        },
        []
    )
    
    const fieldChangeHandler = (event) => {
        setRegistration(
            {
                ...registration,
                [event.target.id]: event.target.value
            }
        );
    }

    const setToday = () => {
        setRegistration(
            { 
                ...registration,
                registration_date: new Date().toISOString().substring(0, 10)
            }
        )
    }

    const saveRegistration = () => {
        if(props.onSave) {
            props.onSave(registration);
        }
        else {
            console.warn("RegistrationModal::saveRegistration(): Missing Property 'onSave'");
        }
    }

    const closeModal = () => {
        if(props.onCloseModal) {
            props.onCloseModal();
        }
        else {
            console.warn("RegistrationModal::onCloseModal(): Missing Property 'onCloseModal'");
        }
    }

    const setCurrentSeasonHandler = () => {
        setRegistration( 
            { 
                ...registration, 
                season_id: currentSeason 
            } 
            );
    }

    useEffect(
        () => {
            setRegistration( 
                { 
                    ...registration, 
                    season_id: currentSeason 
                } 
            );
        },
        [currentSeason]
    )

    useEffect(
        () => {
            getListSeasons();
        },
        []
    )

    useEffect(
        () => {
            getListTeams();
        },
        [member, registration.team_type]
    )    

    useEffect(
        () => {
            if( props.registration ) {
                const reg = { ...props.registration, id: "" };

                Object.keys(props.registration).map(
                    (key) => {
                        reg[key] = props.registration[key] == null ? "" : props.registration[key];
                    }
                )

                setNew(false);
                setRegistration(reg);
            }

            if( props.member ) {
                setMember(props.member);
            }
            else {
                setError("Missing property 'member'");
            }
        },
        [props]
    )    

    return (
        <Modal show={props.isVisible} onHide={closeModal}>
            <Modal.Header closeButton>
                <Row><h4 className="modal-title">{ isNew ? t("new") : t("edit") } {t("registration")}</h4></Row>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="type">{t("season")}</label>
                            <select className="form-control" id="season_id" onChange={fieldChangeHandler} value={registration.season_id}>
                                {
                                    seasons.map(
                                        (season) => {
                                            return <option key={season.id} value={season.id}>{ season.name }</option>;
                                        }
                                    )
                                }
                            </select>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <div className="col-form-label">&nbsp;</div>                        
                            <button className='btn btn-primary' onClick={setCurrentSeasonHandler}>{t("current")}</button>
                        </div>
                    </div>
                </div>                
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="type">{t("type")}</label>
                            <select className="form-control" id="team_type" onChange={fieldChangeHandler} value={registration.team_type}>
                                <option value="">Select...</option>
                                <option value="recreational">{t("recreational")}</option>
                                <option value="travel">{t("travel")}</option>
                            </select>                                
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="source">{t("source")}</label>
                            <select className="form-control" id="source" onChange={fieldChangeHandler} value={registration.source}>
                                <option value="">Select...</option>
                                <option value="form">{t("paper_form")}</option>
                                <option value="online">{t("online_form")}</option>
                                <option value="import">{t("imported")}</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="amount_owed">{t("fee_owed")}</label>
                            <input className="form-control" type="number" step="1" id="amount_owed" onChange={fieldChangeHandler} value={registration.amount_owed} />
                        </div>                        
                    </div> 
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="amount_paid">{t("fee_paid")}</label>
                            <input className="form-control" type="number" step="1" id="amount_paid" onChange={fieldChangeHandler} value={registration.amount_paid}/>
                        </div>    
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <label className="col-form-label" htmlFor="amount_paid">{t("registration_date")}</label><br/>
                        <div className="input-group">
                            <input type="date"  id="registration_date" className="form-control" placeholder="Received"  onChange={fieldChangeHandler} value={registration.registration_date}/>
                            <div className="input-group-append">
                                <span className="input-group-text" id="basic-addon2">
                                    <div className="btn btn-sm" onClick={setToday}>
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                    </div>
                                </span>
                            </div>
                        </div>  
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="txid">{t("transaction_id")}</label>
                            <input className="form-control" type="text" id="transaction_id" onChange={fieldChangeHandler} value={registration.transaction_id} />
                        </div>    
                    </div>
                </div>

                <div className="row">
                    <div className="col-6">
                        <div className="form-group">
                            <label className="col-form-label" htmlFor="status">{t("status")}</label>
                            <select className="form-control" id="status" onChange={fieldChangeHandler} value={registration.status}>
                                <option value="pending">{t("pending")}</option>
                                <option value="accepted">{t("accepted")}</option>
                                <option value="declined">{t("declined")}</option>
                                <option value="cancelled">{t("cancelled")}</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        { 
                            registration.division && 
                            <div className="row">
                                <div className="col">
                                    <div className="form-group">
                                        <label className="col-form-label" htmlFor="team_id">{ registration.team_type == "travel" ? t("travel") : t("recreational") } {t("team")}</label>
                                        <select className="form-control" id="team_id" onChange={fieldChangeHandler} value={registration.team_id}>
                                            <option value="">Select...</option>
                                            { 
                                                teams && teams.map(
                                                    (team) => {
                                                        return <option key={team.id} value={team.id}>{team.year} {team.name}</option>;
                                                    }
                                                )
                                            }                                            
                                        </select>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="row">
                    <div className="col text-end">
                        <button style={{ marginRight: "10px" }} type="button" className="btn btn-secondary" onClick={closeModal}>{t("close")}</button>
                        <button type="button" className="btn btn-primary"   onClick={saveRegistration}><FontAwesomeIcon icon={faSave} /></button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <pre>{ JSON.stringify(registration, null, 5)}</pre>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default RegistrationModal;