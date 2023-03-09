import React              from 'react'

import { 
    useCallback, 
    useState, 
    useEffect,
    useContext,
    useReducer
}                         from "react";

import { useTranslation } from "react-i18next";
import { 
    Link
}           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                           from '@fortawesome/pro-regular-svg-icons'

import Alert                from 'react-bootstrap/Alert';
import Button               from 'react-bootstrap/Button';
import Table                from 'react-bootstrap/Table';

import DefaultLayout        from "../../../layouts/DefaultLayout"
import Row                  from '../../../helpers/Row';

import AppContext           from '../../../context/AppContext';

const Job = (prop) => {
    const {t} = useTranslation();

    const job = prop.job;

    return (
            <tr>
                <td className="col-2"><Link to={`/admin/system/job?id=${job.id}`}>{t(job.name)}</Link></td>
                <td className="col-7">{job.target_url}</td>
                <td className="col-2">{
                    new Intl.DateTimeFormat("ISO", 
                        {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        }
                    ).format(new Date(job.updated_at))}
                </td>
            </tr>
    )
}

const Jobs = () => {
    const {t} = useTranslation();

    const context = useContext(AppContext);

    const [isLoading, setIsLoading ] = useState(false);
    const [error,     setError     ] = useState(null);
    const [jobs,      setJobs      ] = useState();
        
    const getListJobHandler = async () => {
        setIsLoading(true);
        setError(null);

        const response  = await fetch("/api/v1/system/jobs", context.defaultHeaders);

        if( response.ok ) {
            const json = await response.json();

            if( json.status && json.status === "error") {
                setError(json.message);
            }
            else {
                setJobs(json.records);
            }    
        }

        setIsLoading(false);
    }

    useEffect( 
        () => {
            getListJobHandler();
        }, 
        []
    );    

    return (
        <DefaultLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-10">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item">{t('system')}</li>
                                <li className="breadcrumb-item"><Link to="/admin/system/jobrunner">{t('job_runner')}</Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/system/jobs">{t('jobs')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-2 text-end">
                        <Link to="/admin/system/job"><Button variant="outline-primary">New</Button></Link>
                    </div>
                </div>

                <Row />
                                        
                { isLoading && <Alert variant="warning">Loading...</Alert> }
                { error     && <Alert variant="error">{error}</Alert>      }

                <Table bordered striped>
                    <thead>
                        <tr>
                            <th>{t("name")}</th>
                            <th>{t("target_url")}</th>
                            <th>{t("updated_at")}</th>
                        </tr>
                    </thead>

                    <tbody>
                    { 
                        !isLoading && !error && Array.isArray(jobs) && 
                        jobs
                            .sort(
                                (a, b) => {
                                    var nameA = (a.name || "").toUpperCase(), // ignore upper and lowercase
                                        nameB = (b.name || "").toUpperCase(); // ignore upper and lowercase
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .map(
                                (job) => {
                                    return (
                                        <Job key={job.id} job={job} />
                                    )
                                }
                            )
                    }
                    </tbody>
                </Table>

                <Row />
            </div>
        </DefaultLayout>
    )
}

export default Jobs;