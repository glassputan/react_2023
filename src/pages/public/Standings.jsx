import 
    React,
    {
        useContext,
        useEffect,
        useCallback,
        useState
    }                     from 'react';

import { useTranslation }  from "react-i18next";
import { Link }            from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHome }         from '@fortawesome/pro-regular-svg-icons';

import Alert               from 'react-bootstrap/Alert';
import Badge               from 'react-bootstrap/Badge';
import Button              from 'react-bootstrap/Button';
import Modal               from 'react-bootstrap/Modal';
import Table               from 'react-bootstrap/Table';

import AppContext          from '../../context/AppContext';
import Row                 from '../../helpers/Row'
import NoPanelLayout       from "../../layouts/NoPanelLayout";

import Article             from "./Article";

const Result = (teamScore, opponentScore) => {
    if( teamScore > opponentScore ) {
        return <div className="text-green">W: { teamScore + "-" + opponentScore }</div>
    }
    else if( teamScore < opponentScore ) {
        return <div className="text-red">L: { teamScore + "-" + opponentScore }</div>
    }
    else {
        return <div>T: { teamScore + "-" + opponentScore }</div>
    }
}

const Game  = (props) => {
    const context = useContext(AppContext);
    const game    = props.game;

    const onSelectTeam = (event) => {
        if( props.onSelectTeam ) {
            props.onSelectTeam(event);
        }
        else {
            context.warn("Game::onSelectTeam(): Missing prop 'onSelectTeam'");
        }
    }

    return (
        <>
            <div className="row pt-2 game-grid-text">
                <div className="col-2">{game.date}</div>
                <div className="col-2" id={game.opponent_id} onClick={onSelectTeam}>{game.opponent_name}</div>
                {
                    game.result == "MISSING" ? <div className="col-8 text-red">MISSING</div> :
                    <>
                        <div className="col-2 text-center">{game.team_score}</div>
                        <div className="col-1 text-center">{game.opponent_score}</div>
                        <div className="col-2 text-center">{Result(game.team_score, game.opponent_score)}</div>
                        <div className="col-1 text-center fw-bold">{game.points.total}</div>
                        <div className="col-2 text-end">
                            { game.points.win == 0 ? "" : <span className="text-green score-grid-text">W</span>     }
                            { game.points.tie == 0 ? "" : <span className="text-green score-grid-text">T</span>     }
                            { game.points.shutout == 0 ? "" : <span className="text-green score-grid-text">SO</span> }
                            { game.points.goals == 0 ? "" :   <span className="text-green score-grid-text">G{game.points.goals}</span> }
                            { game.points.penalty == 0 ? "" : <span className="text-red score-grid-text">P{game.points.penalty}</span> }
                        </div>
                    </>
                }
            </div>
        </>
    )
}

const Games = (props) => {
    const {t}     = useTranslation();

    const [games, setGames] = useState([]);
    const [error, setError] = useState();
    const [score, setScore] = useState(0);
    const [name,  setName]  = useState("");
    const [team,  setTeam]  = useState(props.team);

    const context = useContext(AppContext);

    const teamChangeHandler = (event) => {
        setTeam(event.target.id);
    }

    const getListTeamGames = async () => {
        setError(null);

        const response = await fetch(`/api/v1/team/${team}/games`, context.defaultHeaders);

        if( response.ok ) {
            const json = await response.json();

            //context.debug("Standings", "getListTeamGames()", json);
          // console.info("getListTeamGames()", json);

            setGames(json.records);
            setScore(json.points);
            setName(json.name);
        }
        else {
            setError(response.statusText);
        }
    }

    useEffect(
        () => {
            getListTeamGames()            
        },
        [team]
    )

    const isVisible = () => {
        if( props.visible ) {
            return props.visible;
        }
        else {
            context.warn("Games::Missing Property 'visible'");
        }
        
        return false;
    }

    const handleClose = () => {
        if( props.onClose ) {
            return props.onClose();
        }
        else {
            context.warn("Games::Missing Property 'onClose'");
        }
    }

    return (
        <Modal show={isVisible} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <h5>{`${t("games")} for ${name}`}</h5>
            </Modal.Header>
            <Modal.Body>
                <div className="row border-bottom">
                    <div className="col-2 fw-bold">{t("date")}</div>
                    <div className="col-2 fw-bold">{t("opponent")}</div>
                    <div className="col-2 fw-bold">{t("team_score")}</div>
                    <div className="col-1 fw-bold">{t("opponent")}</div>
                    <div className="col-2 fw-bold text-center">{t("final")}</div>
                    <div className="col-1 fw-bold text-center">{t("points")}</div>
                    <div className="col-2 fw-bold text-end">{t("breakdown")}</div>
                </div>
                <div className="row"><div className="col">&nbsp;</div></div>
                {
                    !error && games && Array.isArray(games) &&
                    games.map(
                        (game) => {
                            return <Game key={game.date} game={game} onSelectTeam={teamChangeHandler} />
                        }
                    )
                }
                <div className="row"><div className="col">&nbsp;</div></div>
                <div className="row border-top">
                    <div className="col-2 offset-10 text-center">
                            {
                                score.win == 0 ? "" : 
                                    <div className="row text-green score-grid-text">
                                        <div className="col text-end">
                                            Win
                                        </div>
                                        <div className="col text-end">
                                            {score.win}
                                        </div>
                                    </div>
                            }
                            {
                                score.tie == 0 ? "" : 
                                    <div className="row text-green score-grid-text">
                                        <div className="col text-end">
                                            Tie
                                        </div>
                                        <div className="col text-end">
                                            {score.tie}
                                        </div>
                                    </div>
                            }
                            {
                                score.shutout == 0 ? "" : 
                                    <div className="row text-green score-grid-text">
                                        <div className="col text-end">
                                            Shutout
                                        </div>
                                        <div className="col text-end">
                                            {score.shutout}
                                        </div>
                                    </div>
                            }
                            {
                                score.goals == 0 ? "" :
                                    <div className="row text-green score-grid-text">
                                        <div className="col text-end">
                                            Goals
                                        </div>
                                        <div className="col text-end">
                                            {score.goals}
                                        </div>
                                    </div>
                            }
                            {
                                score.penalty == 0 ? "" :
                                    <div className="row text-red score-grid-text">
                                        <div className="col text-end">
                                            Penalty
                                        </div>
                                        <div className="col text-end">
                                            {score.penalty}
                                        </div>
                                    </div>
                            }
                            <div className="row score-grid-text border-top border-primary">
                                <div className="col text-end fw-bold">
                                    Total
                                </div>
                                <div className="col text-end fw-bold">
                                    {score.total}
                                </div>
                            </div>
                        </div>                    
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose}>{t("close")}</Button>
            </Modal.Footer>
        </Modal>
    )
}

const Team = (props) => {
    const {t}      = useTranslation();
    const context  = useContext(AppContext);
    const team     = props.team;

    const showDetail = (event) => {
        context.debug("Standings", "Team::showDetail()", event);

        if( props.detail ) {
            props.detail(event);
        }
        else {
            context.warn("Team(): Missing props 'detail'");
        }
    }

    return (
        <tr onDoubleClick={showDetail} id={team.id}>
            <td>{ team.name }</td>
            <td className="bg-success font-weight-bold text-center text-white">{ team.stats.pts }</td>
            <td className={ ( parseInt(team.stats.gd) >= 0 ? "goal-differential-positive" : "text-red") + " text-center" }>
                { team.stats.gd }
            </td>
            <td className="text-center">{ team.stats.win }</td>
            <td className="text-center">{ team.stats.los }</td>
            <td className="text-center">{ team.stats.tie }</td>                            
            <td className="bg-info text-center">
                { team.stats.gp }&nbsp;
                { 
                    team.stats.gm != 0 && <Badge bg="warning" title={t('missing_games')}>{ team.stats.gm }</Badge>
                }
            </td>
        </tr>
    )
}

const Division = (props) => {
    const context  = useContext(AppContext);

    const division = props.division;
    const teams    = division.teams;

    const {t}      = useTranslation();

    const showDetail = (event) => {
        context.debug("Standings", "Division::showDetail()", event);

        if( props.detail ) {
            props.detail(event);
        }
        else {
            context.warn("Division(): Missing props 'detail'");
        }
    }

    return (
        <>
            <tr>
                <td colSpan="9" style={{ paddingTop: "10px", paddingBottom: "10px", fontWeight: "bold" }}>
                    {`${division.name} (${ division.teams.length } ${t("teams")})`}
                </td>
            </tr>
            {
                teams && Array.isArray(teams) &&
                teams.map(
                    (team) => {
                        return <Team key={team.id} team={team} detail={showDetail} />
                    }
                )
            }
        </>
    )
}

/**
 * 
 * @returns The Travel Page
 */
const Standings = () => {
    const { t }    = useTranslation();

    const context = useContext(AppContext);

    const [error,         setError]       = useState();
    const [isLoading,     setLoading]     = useState(true);
    const [standings,     setStandings]   = useState();
    const [team,          setTeam ]       = useState();

    const standingsHandler = useCallback(
        async () => {
            setError(false);
            setLoading(true);

            // teams#standings
            const request   = await fetch("/api/v1/standings");

            context.error("standingsHandler(REQ)", request);

            if( request.ok ) {
                const response  = await request.json();

                context.debug("Standings", "standingsHandler(RSP)", response);

                if( response.status && response.status == "error" ) {
                    setError(response.message);
                }
                else {
                  // console.info("Standings", response);
                    setStandings(response);
                }
            }
            else {
                setError(request.statusText);
            }

            setLoading(false);
        },
        []
    );    

    const handleDetailClose = (event) => {
        setTeam(null);
    }

    const showDetail = (event) => {
        context.debug("Standings", `showDetail(${event.target.parentNode.id})`, event);
        setTeam(event.target.parentNode.id);
    }

    useEffect( 
        () => {
            standingsHandler();
        }, 
        [standingsHandler]
    );

    return (
        <NoPanelLayout>
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

                { error && <Alert variant="danger">{error}</Alert> }
                { isLoading && <Alert variant="warning">{t("loading")}</Alert> }

                { team && <Games team={team} onClose={handleDetailClose} /> }

                <Row><Article title="Scoring" /></Row>
                
                { 
                    !error && 
                    <Table bordered striped hover>
                        <thead>
                            <tr>
                                <th className="text-center">Team</th>
                                <th className="text-center">Pts</th>
                                <th className="text-center">GD</th>
                                <th className="text-center">W</th>
                                <th className="text-center">L</th>
                                <th className="text-center">T</th>
                                <th className="text-center">GP</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                !error && standings && Array.isArray(standings) &&
                                standings.map(
                                    (division) => {
                                        return (
                                            <Division key={division.name} division={division} detail={showDetail} />
                                        )
                                    }
                                )
                            }
                        </tbody>
                    </Table>
                }

                <Row />   
            </div>
        </NoPanelLayout>
    )
}

export default Standings;