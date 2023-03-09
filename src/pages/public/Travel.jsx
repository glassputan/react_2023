import 
    React,
    { 
        useContext,
        useState,
        useEffect,
        useReducer
    }                       from 'react'

import { useTranslation }   from "react-i18next";
import { Link }             from 'react-router-dom';

import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome'

import { faHome }         from '@fortawesome/pro-regular-svg-icons';

import AppContext           from '../../context/AppContext';
import DefaultLayout        from "../../layouts/DefaultLayout";
import Teams                from '../../modules/TravelTeamList/Teams'
import Row                  from '../../helpers/Row'
import TravelRegistration   from '../../modules/Welcome/TravelRegistration';

import Article              from "./Article";

/**
 * 
 * @returns The Travel Page
 */
const Travel = () => {
    const { t }    = useTranslation();

    const context = useContext(AppContext);

    const [ formState,       dispFormState     ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "ERROR":
                    return { variant: "danger",  message: action.message }
                case "SUCCESS":
                    return { variant: "success", message: action.message }
                case "WARNING":
                    return { variant: "warning", message: action.message }
                default:
                    return {};
            }
        }, 
        {}
    );
    
    const getSystemProperties = async () => {
        const response = await fetch("/api/v1/system/properties");
    
        if( response.ok ) {
            const json  = await response.json();
    
            context.debug("Welcome", "getSystemProperties()", json);
    
            if( json.status == "error" ) {
                setError(json.message);
            }
            else {
                let props = {};
    
                json.records.map(
                    (prop) => {
                        props = {
                            ...props,
                            [prop.name]: prop.value
                        };
                    }
                )
    
                setProperties(props);
            }    
        }
        else {
            setError(response.statusText);
        }
    }
    
    const setError = (message) => {
        if( message ) {
            dispFormState({ event: "ERROR",     message: message });
        }
        else {
            dispFormState({ event: "CLEAR" });
        }
    }
    
    const navigateToTravelURL = () => {
        if(properties.travel_registration_url)
            window.location = properties.travel_registration_url;
    }
    
    useEffect( 
        () => {
            getSystemProperties();
        }, 
        []
    ); 
    
    const [properties,    setProperties  ] = useState({});

    return (
        <DefaultLayout>
            <div className="news">
                <Row />  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page">{ t('travel_teams') }</li>
                                <li className="breadcrumb-item"><Link to="/locations">{t('locations')}</Link></li>
                                <li className="breadcrumb-item" ><Link to="/travel/recruitment">{ t('travel_recruitment') }</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xs-5 col-md-4 d-lg-none d-xl-none" style={{ paddingBottom: "10px"}}>
                        <Link to="/travel/leagues">
                            <div className="btn btn-primary">{ t('travel_leagues') }</div>
                        </Link>
                    </div>
                    <div className="col-xs-7 col-md-4 d-lg-none d-xl-none" style={{ paddingBottom: "10px"}}>
                        <Link to="/travel/recruitment">
                            <div className="btn btn-primary">{ t('travel_recruitment') }</div>
                        </Link>
                    </div>        
                </div>

                <div className="row"><div className="col-12">&nbsp;</div></div>    

                <div className="row">
                    <div className="col-12">
                        <div className="row">
                            <div className="col-12">
                                <Article title="Travel Teams" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-6">
                        <TravelRegistration status={properties.travel_registration} onError={setError} onRedirectToOnlineForm={navigateToTravelURL} />
                    </div>
                </div>

                <div className="row"><div className="col-12">&nbsp;</div></div>
                
                <div className="row">
                    <div className="col-12">

                        <h3>{ new Date().getFullYear() } { t('travel_coaches') }</h3>

                        <div className="row">
                            <div className="col-6">
                                <div className="title">{ t('boys') }</div>
                                <Teams gender="m" />
                            </div>
                            <div className="col-6">
                                <div className="title">{ t('girls') }</div>
                                <Teams gender="f" />
                            </div>
                        </div>
                    </div>
                </div>  
            </div>  
        </DefaultLayout>
    )
}

export default Travel;