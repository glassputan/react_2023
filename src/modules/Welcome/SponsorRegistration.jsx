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

const SponsorRegistration = (props) => {
    const status = props.status || "closed";

    const {t} = useTranslation();

    const navigateTo = () => {
        if( props.onRedirect ) {
            props.onRedirect(onlineForm);
        }
        else {
            context.warn("SponsorRegistration", "navigateTo()", "Missing property 'onRedirect'");
        }        
    }

    const navigateToOnlineForm = () => {
        if(props.online_url) {
            window.open(
                props.online_url,
                '_blank' // <- This is what makes it open in a new window.
              );
        }
        else {
            context.warn("SponsorRegistration", "navigateToPDFForm()", "Missing property 'onRedirectToDoc'");
        }
    }    

    const navigateToPDFForm = () => {
        if(props.document_url) {
            window.open(
                props.document_url,
                '_blank' // <- This is what makes it open in a new window.
              );
        }
        else {
            context.warn("SponsorRegistration", "navigateToPDFForm()", "Missing property 'onRedirectToDoc'");
        }
    }     

    return (
        <Card style={{ 'marginTop': "5px" }} >
            <Card.Header>
                <div className="fw-bold text-center h6">{ t('sponsorship') }</div>
            </Card.Header>

            <Card.Body>
                <div className="row">
                    <div className="col-12 col-xl-6"><Article title="About Sponsorship" /></div>
                    <div className="col-12 col-xl-6 text-end h6">
                        <div className="row text-center">
                            {
                                props.sponsor_registration_url && 
                                <div className="col-6 col-sm-6">
                                    <Button className="btn-gold" disabled={ status == "closed" } onClick={navigateToOnlineForm}>
                                        {t('sponsor')}<br/>
                                        <FontAwesomeIcon icon={faDesktop} size="2x" aria-hidden="true" className="menu_link" style={{ color: "white" }} /><br/>
                                        {t('registration_by_online_form')}
                                    </Button>
                                </div>
                            }
                            {
                                props.document_url && 
                                <div className="col-6 col-sm-6">
                                <Button className="btn-gold" disabled={ status == "closed" } onClick={navigateToPDFForm}>
                                    {t('sponsor')}<br/>
                                    <FontAwesomeIcon icon={faFilePdf} size="2x" aria-hidden="true" className="menu_link" style={{ color: "white" }} /><br/>
                                    {t('registration_by_mail')}
                                </Button>
                            </div>

                            }
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

export default SponsorRegistration;