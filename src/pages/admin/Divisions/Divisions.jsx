import React              from 'react'

import { 
    useState, 
    useEffect,
    useContext
}                         from "react";

import { useTranslation } from "react-i18next";
import { Link }           from 'react-router-dom'

import Alert              from 'react-bootstrap/Alert';
import Table              from 'react-bootstrap/Table';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                         from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout      from "../../../layouts/DefaultLayout"
import Row                from '../../../helpers/Row';

import AppContext         from '../../../context/AppContext';

const Division = (prop) => {
    const context = useContext(AppContext);

    const division = prop.division;

    return (
        <tr>
            <td><Link to={`/admin/division?id=${division.id}`}>{division.name}</Link></td>
            <td className="text-center">{division.game_duration}</td>
            <td className="text-center">{ context.getFormattedDateTime(division.updated_at) }</td>
            <td className="text-center"><a href={`https://go.teamsnap.com/${division.tsid}/division_teams`} target="_blank">{division.tsid}</a></td>
        </tr>
    )
}

const Divisions = () => {
    const {t} = useTranslation();

    const context = useContext(AppContext);

    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);
    const [divisions, setDivisions] = useState([]);
    
    const getListDivisions = async () => {
        setIsLoading(true);
        setError(null);

        const response  = await fetch(`/api/v1/divisions`, context.defaultHeaders);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Divisions", "getListDivisions()", json);

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setDivisions(json.records);
            }
        }
        else {
            setError(response.statusText);
        }

        setIsLoading(false);
    }

    useEffect( 
        () => {
            getListDivisions();
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
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/divisions">{t('divisions')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/divisions">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Table striped hover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th className="text-center">Game Duration</th>
                            <th className="text-center">Updated at</th>
                            <th className="text-center">Teamsnap ID</th>
                        </tr>
                    </thead>

                    <tbody>
                        { 
                            !isLoading && !error && 
                            Array.isArray(divisions) && 
                            divisions
                                .sort(
                                    (a, b) => {
                                        var nameA = (a.title || "").toUpperCase(), // ignore upper and lowercase
                                            nameB = (b.title || "").toUpperCase(); // ignore upper and lowercase
                                    
                                        if (nameA < nameB) { return -1; }
                                        if (nameA > nameB) { return  1; }
                                        return 0;
                                    }
                                )
                                .map(
                                    (division) => {
                                        return <Division key={division.id} division={division} />
                                    }
                                )
                        }

                        { 
                            !isLoading && error && 
                            <tr><td colSpan="4"><Alert variant="danger">{error}</Alert></td></tr>
                        }


                        { 
                            isLoading && 
                            <tr><td colSpan="4">Loading...</td></tr>
                        }
                    </tbody>
                </Table>

                <Row />
            </div>
        </DefaultLayout>
    )
}

export default Divisions;