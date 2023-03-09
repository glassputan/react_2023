import React, {
    useContext,
    useEffect,
    useState,
    useReducer
    
}                       from 'react';

import { 
    Link,
    useNavigate,
    useSearchParams
}                       from 'react-router-dom';

import DefaultLayout    from '../../../layouts/DefaultLayout';

import Button           from 'react-bootstrap/Button';
import Form             from 'react-bootstrap/Form';

import { 
    FontAwesomeIcon 
}           from '@fortawesome/react-fontawesome';

import { 
    faHome,
    faSave,
    faTrash
}                           from '@fortawesome/pro-regular-svg-icons'

import Row               from '../../../helpers/Row';

import { 
    useTranslation 
}                           from 'react-i18next';

import SeasonModel            from '../../../models/SeasonModel';
import AppContext           from '../../../context/AppContext';

import Message              from '../../../helpers/Message';
import ConfirmModal from '../../../helpers/Modals/ConfirmModal';

const Season = (props) => {
    const context  = useContext(AppContext);
    const {t}      = useTranslation();
    const navigate = useNavigate();

    const [searchParams, setSearchParams]        = useSearchParams();
    const [ showDeleteModal, setShowDeleteModal] = useState(false);
    const [ season,    setSeason      ]          = useState( new SeasonModel() );
    const [ isNew,     setNew         ]          = useState(true);
    const [ seasonId,  setSeasonId    ]          = useState();
    const [ formState, dispFormState  ]          = useReducer(
        (current, action) => {
            switch(action.event) {
                case "NEW":
                    return { variant: "success",  message: "New Season"     }
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

    const setCurrentSeason = async () => {

        const response  = await fetch(`/api/v1/season/${season.id}/current`, context.defaultHeaders);

        context.debug("Seasons", "getListSeasons() Response", response);

        if( response.ok ) {                    
            const json = await response.json();

            context.debug("Seasons", "getListSeasons() JSON", json);

            if( json.status === "error" || json.status === "not_authorized") {
                setError(json.message);
            }
            else {
                dispFormState( { event: "SAVED", message: t("season_marked_current") });
            }
        }
        else {
            setError(response.statusText);
        }
    }    

    const submitHandler = async (event) => {
        event.preventDefault();

        let actionURL = "/api/v1/season";
        let record    = {
            ...context.defaultHeaders,
            body: JSON.stringify({ season: season }),
            method:  "POST"
        };

        if( !isNew ) {   
            actionURL = `${actionURL}/${season.id}`;

            record = {
                ...record,
                method: "PATCH"
            };
        }

        context.debug("Season", "submitHandler(): Sending...", record);

        const response = await fetch(actionURL, record);

        context.debug("Season", "submitHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Season", "submitHandler(2): Received...", json);

            setNew(false);

            if( json.status && json.status === "error") {
                setError(json.message);
            }
            else {
                const record = {
                    ...json.record,
                    updated_at: context.getFormattedDateTimeLocale(json.record.updated_at)
                }

                setSeason(record);
            }

            dispFormState( { event: "SAVED", message: t("season_saved") });
        }
    }

    const changeValueHandler = (event) => {
        setSeason(
            {
                ...season,
                [event.target.id]: event.target.value
            }
        );
    }

    const showDeleteModalHandler = () => {
        setShowDeleteModal(true);
    }
            
    const onDeleteRecordHandler = async (event) => {
        context.debug("Season", "onDeleteRecordHandler()");
        
        const action = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };
        
        const response = await fetch(`/api/v1/season/${seasonId}`, action);
        
        context.debug("Season", "onDeleteRecordHandler()", response);

        setShowDeleteModal(false);
        
        if( response.ok ) {
            const json = await response.json();
                        
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                navigate("/admin/seasons");
            }
        }
    }

    const deleteModalCloseHandler = (event) => {
        setShowDeleteModal(false);
    }    

    /**
     * 
     */
    const getSeason = async () => {
        context.debug("Season", `getSeason(): Season ID changed to ${seasonId}`);
    
        const action = {
            ...context.defaultHeaders
        };
                    
        const response = await fetch(`/api/v1/season/${seasonId}`, action);
        
        context.debug("Season", "getSeason()", response);
        
        if( response.ok ) {
            const json = await response.json();

            context.debug("Season", "getSeason()", json);
                        
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setSeason(json.record);
                setNew(false);
            }
        }
    }

    useEffect(
        () => {
            if( seasonId ) {
                getSeason();
            }
        },
        [seasonId]
    )
    
    useEffect(
        () => {
            
            if( searchParams.get("id") ) {
                context.debug("Season", "useEffect(): Initializing By ID", searchParams.get("id"));
                
                setSeasonId(searchParams.get("id"));
            }
            else if(props.season) {
                context.debug("Season", "useEffect(): Initializing by props", props.season);
                                
                setSeason(
                    {
                        ...props.season,
                        ...getParameters()
                    }
                );
                
                dispFormState( { event: "LOADED", message: props.season.name });
            }
        },
        []
    )

    return (
        <DefaultLayout>
            <ConfirmModal message={t("confirm_delete")} header={`${t("delete")} '${season.name}'`} onContinue={onDeleteRecordHandler} isVisible={showDeleteModal} onClose={deleteModalCloseHandler} />

            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-6">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/seasons">{t('seasons')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/season">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-6 text-end px-2">
                        <Button onClick={submitHandler}                            style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave} size="2x" /></Button>
                        <Button onClick={showDeleteModalHandler} variant="danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash}  size="2x" /></Button>
                        { isNew ? "" : <Button onClick={setCurrentSeason}       variant="outline-primary" style={{ marginLeft: "10px", paddingBlock: "12px" }}>{t("set_current")}</Button> }
                    </div>
                </div>

                <Message state={formState} />

                <Row />

                <div className="row">
                    <div className="col col-md-6">
                        <Form.Label>{t("name")}</Form.Label>
                        <Form.Control id="name" type="text" value={season.name} onChange={changeValueHandler} />
                    </div>
                    <div className="col col-md-6">
                        <Form.Label>{t("year")}</Form.Label>
                        <Form.Control id="year" type="integer" value={season.year} onChange={changeValueHandler} />
                    </div>
                </div>

                <Row />

                <div className="row">
                    <div className="col col-md-6">
                        <Form.Label>{t("recreational_division_teamsnap_id")}</Form.Label>
                        <Form.Control id="recreational_tsid" type="text" value={season.recreational_tsid} onChange={changeValueHandler} />
                    </div>
                    <div className="col col-md-6">
                        <Form.Label>{t("start_date")}</Form.Label>
                        <Form.Control id="start_date" type="date" value={season.start_date} onChange={changeValueHandler} />
                    </div>
                </div>                

                <Row />
            </div>
            <Row />
        </DefaultLayout>
    )
}

export default Season;