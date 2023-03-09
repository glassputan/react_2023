import React from 'react';

import Card     from 'react-bootstrap/Card';
import Form     from 'react-bootstrap/Form';

const Game = (props) => {
    const game = props.game;

    const changeFormControl = (event) => {

    }

    return (
        <Card>
            <Card.Header>
                {`${game.gameDate} @ ${game.start_time}`}
            </Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col-6">
                        <Form.Label>Home Team</Form.Label>
                        <Form.Control type="text" value={game.home_team.name} onChange={changeFormControl} />
                    </div>
                    <div className="col-6">
                        <Form.Label>Away Team</Form.Label>
                        <Form.Control type="text" value={game.away_team.name} onChange={changeFormControl} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <Form.Label>Location</Form.Label>
                        <Form.Control type="text" value={game.location.name} onChange={changeFormControl} />
                    </div>
                    <div className="col-6">
                        <Form.Label>Location Detail</Form.Label>
                        <Form.Control type="text" value={game.location_detail} onChange={changeFormControl} />
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}

export default Game;