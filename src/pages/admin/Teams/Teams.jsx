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
import Table              from 'react-bootstrap/Table';
import Tab                from 'react-bootstrap/Tab';
import Tabs               from 'react-bootstrap/Tabs';

import DefaultLayout      from "../../../layouts/DefaultLayout";

import Row             from '../../../helpers/Row';
import AppContext         from '../../../context/AppContext';
import { Accordion } from 'react-bootstrap';

const Team = (prop) => {
    const team = prop.team;

    return (
            <tr>             
                <td>
                    <Link to={`/admin/team?id=${team.id}`}>{team.name}</Link>
                </td>
                <td>{ team.year            && `${team.year}${team.gender.toUpperCase()}`   }</td>
                <td>{ team.head_coach      && team.head_coach.full_name      }</td>
                <td>{ team.assistant_coach && team.assistant_coach.full_name }</td>
                <td>{ team.manager         && team.manager.full_name         }</td>
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

const Division = (prop) => {
    const {t} = useTranslation();

    const division = prop.division;

    return (
        <Table striped bordered hover>
            <thead>
                <tr>                    
                    <th>{t("name")}</th>
                    <th>{t("year")}</th>
                    <th>{t("coach")}</th>
                    <th>{t("assistant_coach")}</th>
                    <th>{t("manager")}</th>
                    <th>{t("updated_at")}</th>
                </tr>
            </thead>

            <tbody>
                {
                    Array.isArray(division.teams) && division.teams.sort(
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
                            return <Team key={team.id} team={team} />
                        }
                    )
                }
            </tbody>
        </Table>
    )
}

const Teams = () => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [isLoading,     setIsLoading]   = useState(false);
    const [error,         setError]       = useState();
    const [recTeams,      setRecTeams]    = useState([]);
    const [travelTeams,   setTravelTeams] = useState([]);

    const getListTeams = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);

            const response  = await fetch("/api/v1/teams", context.defaultHeaders);

            context.debug("Teams", "getListTeams() Response", response);

            if( response.ok ) {                    
                const json = await response.json();

                context.debug("Teams", "getListTeams() JSON", json);

                if( json.status && (json.status === "error" || json.status === "not_authorized")) {
                    setError(json.message);
                }
                else {
                    setTravelTeams(json.records.travel);
                    setRecTeams(json.records.rec);
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
            getListTeams();
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
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/teams">{t('teams')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/teams">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                { isLoading && <Alert variant="warning">{t("loading")}</Alert> }
                { error     && <Alert variant="danger">{error}</Alert>         }

                <Row />

                <Tabs defaultActiveKey="rec" id="uncontrolled-tab-example" className="mb-3">
                    <Tab eventKey="rec" title={t("recreational")}>
                        <Accordion>
                            {
                                Array.isArray(recTeams) && recTeams.sort(
                                    (a, b) => {
                                        var nameA = (a.name || "").toUpperCase(), // ignore upper and lowercase
                                            nameB = (b.name || "").toUpperCase(); // ignore upper and lowercase
                                    
                                        if (nameA < nameB) { return -1; }
                                        if (nameA > nameB) { return  1; }
                                        return 0;
                                    }
                                )
                                .map(
                                    (division) => {
                                        return (
                                            <Accordion.Item key={division.id} eventKey={division.id}>
                                                <Accordion.Header>{division.name}</Accordion.Header>
                                                <Accordion.Body>
                                                    <Division key={division.id} division={division} />
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        )
                                    }
                                )
                            }
                        </Accordion>
                    </Tab>
                    <Tab eventKey="travel" title={t("travel")}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>{t("name")}</th>
                                    <th>{t("year")}</th>
                                    <th>{t("coach")}</th>
                                    <th>{t("assistant_coach")}</th>
                                    <th>{t("manager")}</th>
                                    <th>{t("updated_at")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    Array.isArray(travelTeams) && travelTeams.sort(
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
                                            return <Team key={team.id} team={team} />
                                        }
                                    )
                                }
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
            </div>
        </DefaultLayout>
    )
}

export default Teams;