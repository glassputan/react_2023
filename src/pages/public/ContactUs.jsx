import React              from 'react'
import { useTranslation } from "react-i18next";
import { Link }           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                         from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout      from "../../layouts/DefaultLayout";
import Row                from '../../helpers/Row'

import Article            from "./Article";

/**
 * 
 * @returns The Travel Page
 */
const ContactUs = () => {
    const { t }    = useTranslation();

    return (
        <DefaultLayout>
            <div className="news">
                <Row />  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item">{ t('about') }</li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/contact">{t('contact_us')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Row><Article title="Contact"/></Row>
            </div>
        </DefaultLayout>
    )
}

export default ContactUs;