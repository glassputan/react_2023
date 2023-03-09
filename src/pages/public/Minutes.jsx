import 
    React,
    {
        useState,
        useEffect,
        useCallback,
        useContext
    }                       from 'react';

import { 
    useTranslation 
}                           from "react-i18next";

import { 
    Link 
}                           from 'react-router-dom'

import Table                from 'react-bootstrap/Table';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { faHome }         from '@fortawesome/pro-regular-svg-icons'

import Alert              from 'react-bootstrap/Alert';

import DefaultLayout      from "../../layouts/DefaultLayout";

import AppContext         from '../../context/AppContext';
import Row                from '../../helpers/Row'
import AttachmentIcon     from '../../helpers/AttachmentIcon';

import Article            from './Article';


const ArticleRow = (prop) => {
    const article = prop.record;
    const {t}     = useTranslation();

    const getMonthLabel = (number) => {
        switch(number) {
            case 0:  return t("january");
            case 1:  return t("february");
            case 2:  return t("march");
            case 3:  return t("april");
            case 4:  return t("may");
            case 5:  return t("june");
            case 6:  return t("july");
            case 7:  return t("august");
            case 8:  return t("september");
            case 9: return t("october");
            case 10: return t("november");
            case 11: return t("december");
        }
    }

    return (
        <tr>
            <td>{article.meeting_year}</td>
            <td>{getMonthLabel(article.meeting_month)}</td>
            <td className="text-center"><AttachmentIcon id={article.id} /></td>
            <td>{ article.title }<br/>{article.description}</td>
            <td>{ new Intl.DateTimeFormat("ISO", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(article.updated_at))}</td>
        </tr>
    )
}

/**
 * 
 * @returns The Travel Page
 */
const Minutes = () => {
    const { t }   = useTranslation();
    const context = useContext(AppContext);

    const [ minutes,   setMinutes ] = useState([]);
    const [ error,     setError   ] = useState();
    const [ isLoading, setLoading ] = useState(true);

    const getListMinutesHandler = useCallback(
        async () => {
            setLoading(true);
            setError(null);
    
            const request  = await fetch(`/api/v1/minutes`, context.defaultHeaders);

            if( request.ok ) {
                const response = await request.json();

              // console.info("getListMinutesHandler()", response);

                if( response.status && response.status === "error") {
                    throw new Error(response.message);
                }
                else {
                    setMinutes(response.records);
                }
            }
            else {
                setError(request.statusText);
            }
           
            setLoading(false);
        },
        []
    )

    useEffect(
        () => {
            getListMinutesHandler();
        },
        []
    )

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
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/minutes">{t('minutes')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {
                    error && <Alert variant="danger">{error}</Alert>
                }

                <Row><Article title="Minutes"/></Row>

                { 
                    isLoading && <Alert variant="warn">{t("loading")}</Alert>
                }

                {
                    !isLoading &&
                    <Table striped hover>
                        <thead>
                            <tr>
                                <th>{t("year")}</th>
                                <th>{t("month")}</th>
                                <th style={{ width: "25px" }}>&nbsp;</th>
                                <th>{t("document")}</th>
                                <th>{t("updated_at")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                !error && Array.isArray(minutes) && minutes.map(
                                    (meeting) => { return <ArticleRow key={meeting.id} record={meeting} /> }
                                )
                            }
                        </tbody>
                    </Table>
                }

            </div>
        </DefaultLayout>
    )
}

export default Minutes;