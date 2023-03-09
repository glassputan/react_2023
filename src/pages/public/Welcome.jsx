import React              from 'react'

import { 
    useContext,
    useState,
    useEffect,
    useReducer
}                         from 'react'

import {
    useNavigate
}                         from 'react-router-dom';

import { 
    useTranslation 
}                           from 'react-i18next';

import AppContext           from '../../context/AppContext';
import Row                  from '../../helpers/Row';
import Message              from '../../helpers/Message';



import DefaultLayout        from '../../layouts/DefaultLayout'
import Karousel             from '../../modules/Welcome/Karousel'
import NewsFeed             from '../../modules/Welcome/NewsFeed'
import RecRegistration      from '../../modules/Welcome/RecRegistration';
import TravelTryouts        from '../../modules/Welcome/TravelTryouts';
import CampRegistration     from '../../modules/Welcome/CampRegistration';
import SponsorRegistration  from '../../modules/Welcome/SponsorRegistration';

const Welcome = () => {
    const { t } = useTranslation();

    const context = useContext(AppContext);

    const [properties,    setProperties  ] = useState({});
    const [redirect,      navigate    ] = useState();

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
    
    const setError = (message) => {
        if( message ) {
            dispFormState({ event: "ERROR",     message: message });
        }
        else {
            dispFormState({ event: "CLEAR" });
        }
    }

    const setMessage = (message) => {
        dispFormState({ event: "SUCCESS",   message: message });
    }

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

    const navigateToTravelURL = () => {
        if(properties.travel_registration_url) {
            window.open(
                properties.travel_registration_url,
                '_blank' // <- This is what makes it open in a new window.
            );
        }
    }

    const navigateToRecOnlineURL = () => {
        if(properties.rec_registration_url) {
            window.open(
                properties.rec_registration_url,
                '_blank' // <- This is what makes it open in a new window.
            );
        }
    }

    const navigateToRecDocumentURL = () => {
        if(properties.rec_registration_doc) {
            window.open(
                properties.rec_registration_doc,
                '_blank' // <- This is what makes it open in a new window.
            );
        }
    }
    
    useEffect( 
        () => {
            getSystemProperties();
        }, 
        []
    ); 

    useEffect(
        () => {
            context.debug("Welcome", "properties changed", properties);
        },
        [properties]
    )
    
    if( redirect ) {
        return <useNavigate to={redirect} />
    }

    return (
        <DefaultLayout>
            <div className="container-fluid">
                <div className="row">
                    <div className="col">&nbsp;</div>
                </div>

                <div className="news">
                    <Message formState={formState} />

                    <h1>{ t('welcome') }</h1>

                    <div className="row d-flex">
                        <div className="col-12 col-md-5">
                            <div className="row">
                                <div className="col-12">
                                    <address>
                                        <strong>Hulmeville Soccer Club</strong><br/>
                                        P.O. Box 7050<br/>
                                        Penndel, PA&nbsp;19047<br/>
                                        <abbr title={t("phone")}>P:</abbr> 215-757-7037<br/>
                                        <br/><br/>
                                        <strong>E-mail:</strong><br />
                                        {properties.club_email}
                                    </address>
                                </div>
                            </div>
                            <Row />
                            <div className="row">
                                <div className="col-12">
                                    <blockquote>
                                        { t('who_are_we') }
                                    </blockquote>
                                </div>
                            </div>                            
                            <div className="row">
                                <div className="col-12">
                                    <h4 className="text-center">
                                        { t('board_member_questions') }
                                    </h4>
                                </div>
                            </div>
                            <Row />
                        </div>
                        <div className="col">
                            <Karousel />
                        </div>
                    </div>
                    
                    <Row />

                    <div className="row">
                        <div className="col col-lg-6">
                            {
                                properties.rec_registration == "true" && 
                                <RecRegistration    status={properties.rec_registration} byMail={properties.rec_registration_by_mail} byWebsite={properties.rec_registration_online} onError={setError} onRedirectToOnlineForm={navigateToRecOnlineURL} onRedirectToDoc={navigateToRecDocumentURL} />
                            }
                        </div>
                        <div className="col col-lg-6">
                            { 
                                properties.travel_tryouts == "true" && 
                                <TravelTryouts status={properties.travel_registration} onError={setError} onRedirectToOnlineForm={navigateToTravelURL} />
                            }
                            {
                                properties.camp_registration == "true" &&
                                <CampRegistration status={properties.camp_registration} onError={setError} online_url={properties.camp_registration_url} document_url={properties.camp_document}/>
                            }
                            {
                                properties.sponsor_registration == "true" &&
                                <SponsorRegistration status={properties.sponsor_registration} onError={setError} online_url={properties.sponsor_registration_url} document_url={properties.sponsor_document}/>
                            }                            
                        </div>
                    </div>

                    <Row />
                    <Row />

                    <NewsFeed />      
                </div>
            </div>
        </DefaultLayout>
    );
}

export default Welcome;