import React              from 'react'

import { 
    useCallback, 
    useContext,
    useState, 
    useEffect
}                         from "react";

import { useTranslation } from "react-i18next";
import { Link }           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                         from '@fortawesome/pro-regular-svg-icons'

import Alert              from 'react-bootstrap/Alert';
import Button             from 'react-bootstrap/Button';
import Table              from 'react-bootstrap/Table';

import DefaultLayout      from "../../../layouts/DefaultLayout";

import Row             from '../../../helpers/Row';
import AppContext         from '../../../context/AppContext';

const Season = (prop) => {
    const team = prop.team;

    return (
            <tr>             
                <td>
                    <Link to={`/admin/season?id=${team.id}`}>{team.name}</Link>
                </td>
                <td>{team.recreational_tsid}</td>
                <td>{
                    new Intl.DateTimeFormat("ISO", 
                        {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        }
                    ).format(new Date(team.updated_at))}                    
                </td>
            </tr>
    )
}

const Seasons = () => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [isLoading,       setIsLoading]   = useState(false);
    const [error,           setError]       = useState();
    const [seasons,         setSeasons]     = useState([]);

    const getListSeasons = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);

            const response  = await fetch("/api/v1/seasons", context.defaultHeaders);

            context.debug("Seasons", "getListSeasons() Response", response);

            if( response.ok ) {                    
                const json = await response.json();

                context.debug("Seasons", "getListSeasons() JSON", json);

                if( json.status && (json.status === "error" || json.status === "not_authorized")) {
                    setError(json.message);
                }
                else {
                    setSeasons(json.records);
                }
            }
            else {
                setError(response.statusText);
            }
    
            setIsLoading(false);
        },
        []
    );  
    
    useEffect(
        () => {
            getListSeasons();
        },
        []
    );

    return (
        <DefaultLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/seasons">{t('seasons')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/season">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                { isLoading && <Alert variant="warning">{t("loading")}</Alert> }
                { error     && <Alert variant="danger">{error}</Alert>         }

                <Row />

                <Table striped bordered hover>
                    <thead>
                        <tr>                    
                            <th>{t("name")}</th>
                            <th>{t("recreational_division_teamsnap_id")}</th>
                            <th>{t("updated_at")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            Array.isArray(seasons) && seasons.sort(
                                (a, b) => {
                                    var nameA = (a.name || "").toUpperCase(), // ignore upper and lowercase
                                        nameB = (b.name || "").toUpperCase(); // ignore upper and lowercase
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .map(
                                (team) => {
                                    return <Season key={team.id} team={team} />
                                }
                            )
                        }
                    </tbody>
                </Table>
            </div>
        </DefaultLayout>
    )
}

export default Seasons;