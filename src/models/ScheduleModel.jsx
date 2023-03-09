import React            from 'react';

import {
    useContext
}                       from 'react';

import AppContext       from '../context/AppContext';

import LocationModel    from "./LocationModel"

import moment           from 'moment';

const Time = (settings) => {
    const time = {
        "saturdayTime":     "12:00",
        "sundayTime":       "13:00",
        "location":         new LocationModel(),
        "location_id":      "",
        "location_detail":  ""
    }

    return {
        ...time,
        ...settings
    }
}

const GameDate = (eventDate) => {
    const context = useContext(AppContext);

    if( !eventDate ) {
        eventDate = context.getFormattedDate(new Date());
    }

    return {
        "gameDate": eventDate,
        "events": [
            {
                "home_team": "0",
                "away_team": "0"
            },
            {
                "home_team": "0",
                "away_team": "0"
            },
            {
                "home_team": "0",
                "away_team": "0"
            },
            {
                "home_team": "0",
                "away_team": "0"
            },
            {
                "home_team": "0",
                "away_team": "0"
            },
            {
                "home_team": "0",
                "away_team": "0"
            },
            {
                "home_team": "0",
                "away_team": "0"
            },
            {
                "home_team": "0",
                "away_team": "0"
            }
        ]
    }
}

const ScheduleModel = ( startDate ) => {
    const today   = moment(startDate);

    return {
        "times": [
            new Time({ location_id: "21927979" }),
            new Time(),
            new Time(),
            new Time(),
            new Time(),
            new Time(),
            new Time(),
            new Time(),
        ],
        "gameDates": [
            new GameDate( today.add( 7, 'd').format("YYYY-MM-DD") ),
            new GameDate( today.add( 7, 'd').format("YYYY-MM-DD") ),
            new GameDate( today.add( 7, 'd').format("YYYY-MM-DD") ),
            new GameDate( today.add( 7, 'd').format("YYYY-MM-DD") ),
            new GameDate( today.add( 7, 'd').format("YYYY-MM-DD") ),
            new GameDate( today.add( 7, 'd').format("YYYY-MM-DD") ),
            new GameDate( today.add( 7, 'd').format("YYYY-MM-DD") ),
            new GameDate( today.add( 7, 'd').format("YYYY-MM-DD") ),
        ]
    }
}

export default ScheduleModel;