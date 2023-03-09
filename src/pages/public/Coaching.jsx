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
const Coaching = () => {
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
                                <li className="breadcrumb-item active" aria-current="page">{ t('coach_resources') }</li>
                                <li className="breadcrumb-item"><Link to="/coaching/faq">{t('coach_faq')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Row><Article title="Coaching Corner"/></Row>
            </div>  
        </DefaultLayout>
    )
}

export default Coaching;