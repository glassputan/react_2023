import React               from 'react'
import { useTranslation }  from "react-i18next";
import { Link }            from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faHome }          from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout       from "../../layouts/DefaultLayout";
import Row                 from '../../helpers/Row'

import Article             from "./Article";

/**
 * 
 * @returns The Travel Page
 */
const Referees = () => {
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
                                <li className="breadcrumb-item active" aria-current="page">{ t('referee_news') }</li>
                                <li className="breadcrumb-item"><a href="https://epsarc.org/" target="_blank">EPSARC</a></li>
                                <li className="breadcrumb-item"><a href="https://www.theifab.com/" target="_blank">{t('referee_laws')}</a></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Row>
                    <div className="row bg-external-link">
                        <div className="col-1">&nbsp;</div>
                        <div className="col-10">    
                            <a href="http://www.usyouthsoccer.org/referees" target="_blank">
                                <div className="btn btn-primary btn-sm">New Referee Advice</div>
                            </a>
                        </div>
                        <div className="col-1">&nbsp;</div>
                    </div> 
                </Row>

                <Row><Article title="Referee News"/></Row>
            </div>  
        </DefaultLayout>
    )
}

export default Referees;