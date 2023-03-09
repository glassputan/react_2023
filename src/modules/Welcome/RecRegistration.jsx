import  React, { 
        useContext 
}                           from 'react';
import { useTranslation  }  from 'react-i18next';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome'
import { 
    faDesktop, 
    faDoNotEnter, 
    faFilePdf       
}                           from '@fortawesome/pro-regular-svg-icons'

import Button               from 'react-bootstrap/Button';
import Card                 from 'react-bootstrap/Card';
                            
import AppContext           from '../../context/AppContext';

import Row                  from '../../helpers/Row';

import Article              from '../../pages/public/Article';

const RecRegistration = (props) => {
    const { status, byMail, byWebsite, id, name } = props;

    const context = useContext(AppContext);

    const {t} = useTranslation();

    const navigateToOnlineForm = () => {
        if( props.onRedirectToOnlineForm ) {
            props.onRedirectToOnlineForm();
        }
        else {
            context.warn("RecRegistration", "navigateToOnlineForm()", "Missing property 'onRedirectToOnlineForm'");
        }
    }

    const navigateToPDFForm = () => {
        if( props.onRedirectToDoc ) {
            props.onRedirectToDoc();
        }
        else {
            context.warn("RecRegistration", "navigateToPDFForm()", "Missing property 'onRedirectToDoc'");
        }
    }  
    
    return (
        <Card>
            <Card.Header>
                <div className="fw-bold text-center h6">{ t('recreational_program') }</div>
            </Card.Header>

            <Card.Body>
                <div className="row">
                    <div className="col-12 col-xl-6"><Article title="About the Recreational Program" /></div>
                    <div className="col-12 col-xl-6 text-center h6">
                        <div className="row">
                            <div className="col-12 col-sm-6">
                                <Button className='btn-blue' onClick={navigateToPDFForm} disabled={status != "true" || byMail != "true"} style={{ marginBottom: "5px"}}>
                                {t('register')}<br/>
                                <FontAwesomeIcon icon={faFilePdf} size="2x" aria-hidden="true" className="menu_link" style={{ color: "white" }} /><br/>
                                {t('registration_by_mail')}
                                </Button>
                            </div>
                            <div className="col-12 col-sm-6">
                                <Button className="btn-blue" disabled={status != "true" || byWebsite != "true"} onClick={navigateToOnlineForm}>
                                    {t('register')}<br/>
                                    <FontAwesomeIcon icon={faDesktop} size="2x" aria-hidden="true" className="menu_link" style={{ color: "white" }} /><br/>
                                    {t('registration_by_online_form')}
                                </Button>
                            </div>
                        </div>
                        <Row />
                        {
                            status != "true" &&
                            <div className="row"><div className="col-12 text-center">{t("registration_closed")}</div></div>
                        }
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}

export default RecRegistration;