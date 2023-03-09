import React              from 'react'

import { 
    useCallback, 
    useState, 
    useEffect
}                         from "react";

import { 
    useTranslation 
}                         from "react-i18next";

import { 
    Link,
    useNavigate
}                         from 'react-router-dom'

import Alert              from 'react-bootstrap/Alert';
import Button             from 'react-bootstrap/Button';
import Table              from 'react-bootstrap/Table';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                           from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout        from "../../../layouts/DefaultLayout"          //"../../../layouts/DefaultLayout";
import Row                  from '../../../helpers/Row';

const TableRow = (prop) => {
    const {t}       = useTranslation();
    const navigate  = useNavigate();

    const game = prop.game;
    
    const onRedirect = () => {
        navigate(`/admin/game?id=${game.id}`);
    }

    return (
        <tr onDoubleClick={onRedirect} className={game.is_missing ? "row-highlight": "none" }>
            <td>
                {game.game_date}
            </td>
            <td>
                {game.division.name}
            </td>            
            <td>
                {game.home_team.name}
            </td>
            <td className="text-center">
                {game.home_score}
            </td>
            <td>
                { game.away_team.name }
            </td>
            <td className="text-center">
                { game.away_score }
            </td>
            <td>
                {
                    new Intl.DateTimeFormat("ISO", 
                        {
                            hour: "numeric",
                            minute: "2-digit"
                        }
                    ).format(new Date(game.start_time))
                }
            </td>
            <td>
                { game.duration }
            </td>
            <td className="text-center">
                {game.home_points}
            </td>
            <td className="text-center">
                {game.away_points}
            </td>
        </tr>
    )
}

const Games = () => {
    const {t} = useTranslation();

    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);
    const [games,    setGames ]    = useState();

    const navigate = useNavigate();
    
    const gameHandler = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);
    
            const response  = await fetch("/api/v1/games");

            if( response.ok ) {
                const json = await response.json();

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    setGames(json);
                }
            }
            else {
                setError(response.statusText);
            }
    
            setIsLoading(false);
        },
        [],
    );

    const gotoNew = () => {
        navigate("/admin/game");
    }

    useEffect( 
        () => {
            gameHandler();
        }, 
        [gameHandler]
    );    

    return (
        <DefaultLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-8">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/games">{t('games')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-4 text-end">
                        <Button variant="outline-primary" onClick={gotoNew}>{t("new")}</Button>
                    </div>
                </div>

                <Row />

                {  error && <Alert variant="danger">{error}</Alert>              }
                {  isLoading && <Alert variant="warning">{t("loading")}</Alert>  }

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>{t("date")}</th>
                            <th>{t("division")}</th>
                            <th>{t("home")}</th>
                            <th>{t("home_score")}</th>
                            <th>{t("away")}</th>
                            <th>{t("away_score")}</th>
                            <th>{t("start_time")}</th>
                            <th>{t("duration")}</th>
                            <th>{t("home_points")}</th>
                            <th>{t("away_points")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            games && Array.isArray(games) &&
                            games
                                .sort(
                                    (a, b) => {
                                        var nameA = (a.game_date || "").toUpperCase(), // ignore upper and lowercase
                                            nameB = (b.game_date || "").toUpperCase(); // ignore upper and lowercase
                                    
                                        if (nameA < nameB) { return -1; }
                                        if (nameA > nameB) { return  1; }
                                        return 0;
                                    }
                                )
                                .map(
                                    (game) => {
                                        return <TableRow key={game.id} game={game} />
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

export default Games;