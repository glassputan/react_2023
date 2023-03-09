
import React from 'react';

import { useTranslation       } from 'react-i18next'
import { FontAwesomeIcon      } from '@fortawesome/react-fontawesome'
import { 
    faDesktop, 
    faFilePdf, 
    faDoNotEnter 
}                               from '@fortawesome/pro-regular-svg-icons'

import Button                   from 'react-bootstrap/Button';
import Card                     from 'react-bootstrap/Card';

import Row                      from '../../helpers/Row';
import Article                  from '../../pages/public/Article';

const TravelRegistration = (props) => {
    const status = props.status || "closed";

    const {t} = useTranslation();

    const navigateTo = () => {
        if( props.onRedirect ) {
            props.onRedirect(onlineForm);
        }
        else {
            context.warn("TravelRegistration", "navigateTo()", "Missing property 'onRedirect'");
        }        
    }

    const navigateToOnlineForm = () => {
        if( props.onRedirectToOnlineForm ) {
            props.onRedirectToOnlineForm();
        }
        else {
            context.warn("TravelRegistration", "navigateToOnlineForm()", "Missing property 'onRedirectToOnlineForm'");
        }
    }

    const navigateToPDFForm = () => {
        if( props.onRedirectToDoc ) {
            props.onRedirectToDoc();
        }
        else {
            context.warn("TravelRegistration", "navigateToPDFForm()", "Missing property 'onRedirectToDoc'");
        }
    }     

    return (
        <Card>
            <Card.Header>
                <div className="fw-bold text-center h6">{ t('travel_registration') }</div>
            </Card.Header>

            <Card.Body>
                <div className="row">
                    <div className="col-12 col-xl-6"><Article title="About the Travel Program" /></div>
                    <div className="col-12 col-xl-6 text-end h6">
                        <div className="row text-center">
                            {
                                /*
                            <div className="col-12 col-sm-6">
                                <Button className='btn-gold' onClick={navigateToPDFForm} disabled={status != "open"} style={{ marginBottom: "5px"}}>
                                {t('register')}<br/>
                                <FontAwesomeIcon icon={faFilePdf} size="2x" aria-hidden="true" className="menu_link" style={{ color: "white" }} /><br/>
                                {t('registration_by_mail')}
                                </Button>
                            </div>

                                */
                            }
                            <div className="col-12 col-sm-6">
                                <Button className="btn-gold" disabled={ status == "closed" } onClick={navigateToOnlineForm}>
                                    {t('pay')}<br/>
                                    <FontAwesomeIcon icon={faDesktop} size="2x" aria-hidden="true" className="menu_link" style={{ color: "white" }} /><br/>
                                    {t('registration_by_online_form')}
                                </Button>
                            </div>
                        </div>
                        <Row />
                        {
                            status == "closed" &&
                            <div className="row"><div className="col-12 text-center">{t("registration_closed")}</div></div>
                        }
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}

export default TravelRegistration;