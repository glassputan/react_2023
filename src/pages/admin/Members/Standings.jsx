import React              from 'react'
import {
    Fragment,
    useEffect,
    useCallback,
    useState
}                         from 'react';

import { useTranslation } from "react-i18next";
import { Link }           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                         from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout      from "../layouts/DefaultLayout";
import Article            from "../Article";
import Row             from '../helpers/Row'
import Row                from '../helpers/Row'
import StandingsBuilder   from '../StandingsBuilder'

/**
 * 
 * @returns The Travel Page
 */
const Standings = () => {
    const { t }    = useTranslation();

    const [error,         setError]       = useState();
    const [isBoardMember, setBoardMember] = useState(false);
    const [standings,     setStandings]   = useState();
    const [table_body,    setTableBody]   = useState(<tr><td colSpan="6">Component not completed...</td></tr>);

    const standingsHandler = useCallback(
        async () => {
            setError(false);

            try {
                const request   = await fetch("/api/v1/standings");
                const response  = await request.json();

                console.log("standingsHandler()", response);

                if( response.status ) {
                    console.error("standingsHandler()", response.message);
                    
                    setError(response.message);
                }
                else {
                    console.log("standingsHandler()::divisions", response);

                    setStandings(response);

                    let tableContent = [];

                    response.forEach(
                        (division) => {
                            tableContent.push(
                                <Fragment>
                                    <tr>
                                        <td colSpan="9" style={{ paddingTop: "10px", paddingBottom: "10px", fontWeight: "bold" }}>
                                            {division.name}
                                            <span className="text-right">({ division.teams.count }  {t("teams")})</span>
                                        </td>
                                    </tr>

                                    <StandingsBuilder teams={division.teams} />
                                </Fragment>
                            )
                        }
                    );

                    setTableBody(tableContent);
                }
            }
            catch(xx) {
                setError(true);
            }
        },
        []
    );    

    useEffect( 
        () => {
            standingsHandler();
        }, 
        [standingsHandler]
    );

    const table_head = <Fragment>
        { 
            isBoardMember && 
            (
                <Fragment>
                    <tr>
                        <th colSpan="5">&nbsp;</th>
                        <th colSpan="3" style={{ textAlign: "center"}}>Goals</th>
                        <th>&nbsp;</th>
                    </tr>

                    <tr>
                        <th className="text-center">Team</th>
                        <th className="text-center">Points</th>
                        <th className="text-center">Wins</th>
                        <th className="text-center">Losses</th>
                        <th className="text-center">Ties</th>

                        <th className="text-center">For</th>
                        <th className="text-center">Against</th>
                        <th className="text-center">Delta</th>

                        <th className="text-center">Games</th>
                    </tr>
                </Fragment>
            )
        }

        {   
            !isBoardMember &&
            (
                <tr>
                    <th className="text-center">Team</th>
                    <th className="text-center">Points</th>
                    <th className="text-center">Wins</th>
                    <th className="text-center">Losses</th>
                    <th className="text-center">Ties</th>
                    <th className="text-center">Games</th>
                </tr>
            )
        }
        </Fragment>;

    return (
        <DefaultLayout>
            <div className="news">  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item"><Link to="/recreational">{t('recreational_news')}</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">{ t('recreational_team_standings') }</li>
                            </ol>
                        </nav>
                    </div>
                </div> 
                
                <Row />

                <Row><Article title="Scoring" /></Row>
                

                { 
                    error && <Row><pre>{error}</pre></Row> 
                }
                { 
                    !error && 
                    <div className="row">
                        <div className="col-12 table-responsive">                    
                            <table className="table table-striped table-bordered">
                                <thead>
                                    {table_head}
                                </thead>

                                <tbody>
                                    {table_body}
                                </tbody>
                            </table>
                        </div>          
                    </div>
                }

                <Row />   
            </div>
        </DefaultLayout>
    )
}

export default Standings;