import React               from 'react'
import { useTranslation }  from "react-i18next";
import { Link }            from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHome }         from '@fortawesome/pro-regular-svg-icons';

import DefaultLayout      from "../../layouts/DefaultLayout";
import Row                from '../../helpers/Row';

import Article            from "./Article";

/**
 * 
 * @returns The Travel Page
 */
const Safety = () => {
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
                                <li className="breadcrumb-item active" aria-current="page">{ t('sr_management') }</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Row>
                    <div className="row bg-external-link">
                        <div className="col-1">&nbsp;</div>
                        <div className="col-10 ">                           
                            <a href="http://www.epysa.org/membership/pa_child_protection_laws__clearances/" target="_blank" style={{ paddingRight: "5px" }}>
                                <div className="btn btn-success">{t('sr_management_background_checks')}</div>
                            </a>

                            <a href="http://www.wikihow.com/Do-Basic-First-Aid" target="_blank" style={{ paddingRight: "5px" }}>
                                <div className="btn btn-primary">{t('sr_management_first_aid')}</div>
                            </a>

                            <a href="https://usys-assets.ae-admin.com/assets/1/15/Heat_Hydration_GuidelinesUSSF.pdf" target="_blank" style={{ paddingRight: "5px" }}>
                                <div className="btn btn-primary">{t('sr_management_heat_management')}</div>
                            </a>

                            <a href="http://www.cdc.gov/headsup/basics/concussion_symptoms.html" target="_blank" style={{ paddingRight: "5px" }}>
                                <div className="btn btn-primary">{t('sr_management_concussion_management')}</div>
                            </a>

                            <a href="http://www.redcross.org/take-a-class/aed/using-an-aed/aed-steps" target="_blank" style={{ paddingRight: "5px" }}>
                                <div className="btn btn-primary">{t('sr_management_aed')}</div>
                            </a>
                        </div>
                        <div className="col-1">&nbsp;</div>
                    </div> 
                </Row>

                <Row>
                    <Article title="Safety News"/>
                </Row>
            </div>  
        </DefaultLayout>
    )
}

export default Safety;