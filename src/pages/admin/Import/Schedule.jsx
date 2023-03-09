import 
    React,
    {
        useContext,
        useState,
        useEffect,
        useReducer
    }                   from 'react';

import moment           from 'moment';

import {
    Link
}                       from 'react-router-dom';

import { 
    faHome,
    faCalendarPlus, 
    faClock, 
    faSave 
}                       from '@fortawesome/pro-regular-svg-icons';

import { 
    FontAwesomeIcon 
}                       from '@fortawesome/react-fontawesome';

import Badge            from 'react-bootstrap/Badge';
import Button           from 'react-bootstrap/Button';
import Form             from 'react-bootstrap/Form';
import Table            from 'react-bootstrap/Table';

import { 
    useTranslation 
}                       from 'react-i18next';

import AppContext       from '../../../context/AppContext';
import Row              from '../../../helpers/Row';
import NoPanelLayout    from '../../../layouts/NoPanelLayout';
import Message          from '../../../helpers/Message';

import DivisionModel    from '../../../models/DivisionModel';
import LocationModel    from '../../../models/LocationModel';
import ScheduleModel    from '../../../models/ScheduleModel';

const GameRow = (props) => {
    const game    = props.game;
    const context = useContext(AppContext);

    const isValidGame = () => {
        return game.location.tsid && game.home_team.tsid && game.away_team.tsid
    }

    context.debug("Schedule", "RENDER Game()", game);

    return (
        <tr className={ isValidGame() ? 'text-success': 'bg-danger text-white' }>
            <td>{game.gameDate}</td>
            <td>{game.start_time}</td>
            <td>{game.location.name}</td>
            <td className="text-center"><Badge>{game.location.tsid}</Badge></td>
            <td>{game.field}</td>
            <td>{game.home_team.name}</td>
            <td className="text-center"><Badge>{game.home_team.tsid}</Badge></td>
            <td>{game.away_team.name}</td>
            <td className="text-center"><Badge>{game.away_team.tsid}</Badge></td>
            <td>{game.division.game_duration}</td>
            <td>{game.status}&nbsp;<Badge>{game.id}</Badge></td>
        </tr>
    )
}

const Schedule = (props) => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [locations,  setLocations   ] = useState([]);
    const [divisions,  setDivisions   ] = useState([]);

    const [divisionID, setDivisionID  ] = useState("");
    const [isValid,    setValid       ] = useState(false);
    const [division,   setDivision    ] = useState( new DivisionModel() );

    const [gameDates,  setGameDates   ] = useState([]);
    const [schedule,   setSchedule    ] = useState(new ScheduleModel());

    const [isSubmitting, setSubmitting] = useState(false);

    const [ formState, dispFormState  ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "NEW":
                    return { variant: "success",  message: "New Team"     }
                case "ERROR":
                    return { variant: "danger",   message: action.message }
                case "SAVED":
                    return { variant: "success", message: action.message  }
                case "LOADED":
                    return { variant: "success", message: action.message  }
                case "WARNING":
                    return { variant: "warning", message: action.message  }
                default:
                    return {};
            }
        }, 
        {}
    )

    const setError = (message) => {
        dispFormState( { event: "ERROR", message: message });
    } 
    
    const setMessage = (message) => {
        dispFormState( { event: "SAVED", message: message });
    }

    const resetGrid = (event) => {
        context.debug("Schedule", "resetGrid()", event);

        setValid(false);
        setGameDates([]);
        setSchedule(new ScheduleModel());
    }

    const getListDivisions = async() => {
        const target = "/api/v1/divisions";

        context.debug("Schedule", "getListDivisions(): Calling ", target);

        const response  = await fetch(target, context.defaultHeaders);

        context.debug("Schedule", "getListDivisions(RSP)", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Schedule", "getListDivisions(JSON)", json);
            
            if( json.status === "error") {
                setError(json.message);
            }
            else {

                setDivisions(
                    json.records.filter(
                        (record) => {
                            return record.name.indexOf("U") > -1; 
                        }
                    )
                );
            }
        }
        else {
            setError(response.statusText);
        }        
    }

    const getListLocations = async() => {
        const target = "/api/v1/locations";

        context.debug("Schedule", "getListLocations(): Calling ", target);

        const response  = await fetch(target, context.defaultHeaders);

        context.debug("Schedule", "getListLocations(RSP)", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Schedule", "getListLocations(JSON)", json);
            
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setLocations(json.records.filter( (location) => { return location.tsid != null }));
            }
        }
        else {
            setError(response.statusText);
        }        
    }    

    const getDivision = async () => {
        context.debug("Schedule", "getDivision()");

        const target = `/api/v1/division/${divisionID}`;

        context.debug("Schedule", "getDivision(): Calling ", target);

        const response  = await fetch(target, context.defaultHeaders);

        context.debug("Schedule", "getDivision(RSP)", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Schedule", "getDivision(JSON)", json);
            
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setDivision(
                    {
                        ...json.record,
                        teams: JSON.parse(json.teams)
                    }
                );
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const updateGameState = (eventid, state) => {
        let newState = [ ...gameDates];

        setGameDates(
            newState.map(
                (game) => {
                    if( game.id == eventid ) {
                        return {
                            ...game,
                            status: state
                        }
                    }
                    else {
                        return game;
                    }
                }
            )
        );
    }

    const createTeamSnapGames = () => {
        setSubmitting(true);

        const events = gameDates.filter( 
            (game) => { 
                return game.home_team && game.away_team 
            } 
        );
        
        events.map(
            async (game, index) => {

                const gameId = game.id;
                const event  = {
                    division_id:   game.division.tsid, 
                    home_team_id:  game.home_team.tsid,
                    home_team:     game.home_team.name,
                    away_team_id:  game.away_team.tsid,
                    away_team:     game.away_team.name,
                    location_id:   game.location.tsid,
                    game_date:     game.gameDate, 
                    start_time:    game.start_time,
                    duration:      game.division.game_duration,
                    field:         game.field
                }

                context.debug("Schedule", "createTeamSnapGames()", event);

                const target = "/api/v1/division/event";
                const header = {
                    ...context.defaultHeaders,
                    body: JSON.stringify({ game: event }),
                    method:  "POST"
                }
        
                context.debug("Schedule", "createTeamSnapGames(): Calling ", target);
        
                const response  = await fetch(target, header);
        
                context.debug("Schedule", "createTeamSnapGames(RSP)", response);
        
                if( response.ok ) {
                    const json = await response.json();

                    context.debug("Schedule", "createTeamSnapGames(JSON)", json);
                    
                    if( json.status === "error") {
                        updateGameState(gameId, "Error");
                        setError(json.message);
                    }

                    updateGameState(gameId, "Accepted");
                }
                else {
                    updateGameState(gameId, "Error");
                    setError(response.statusText);
                }
            }
        )

        setSubmitting(false);
        setMessage(`${gameDates.length} games where submitted.`);
    }

    const validateSchedule = () => {
        context.debug("Schedule", "validateSchedule()");
    }

    const addDays = (dateString, increment) => {
        context.debug("Schedule", `addDays('${dateString}', ${increment})`);

        const date = moment(dateString);
        
        date.add(increment, 'days');
        
        return date.format("yyyy-MM-DD");
    }

    const addGame = () => {
        // setGameDates(
        //     [
        //         ...gameDates,
        //         {
        //             "id": context.getUUID(),
        //             "home": "0",
        //             "away": "0",
        //             "gameDate": ""
        //         }
        //     ]
        // );
    }

    const addTimeSlot = () => {
    }

    const getLocation = (tsid) => {
        let location = {
            "id": "-1",
            "name": "Not found!",
            "tsid": tsid
        }

        locations.forEach(
            (record) => {
                if( record.tsid == tsid) {
                    location = record;
                }
            }
        )

        return location;
    }

    const onChangeLocation = (event) => {
        context.debug("Schedule", `onChangeLocation(${event.target.id || 0})`, event.target.value);

        let newTimes = [ ...schedule.times ]

        newTimes[event.target.id || 0] = {
            ...schedule.times[event.target.id || 0],
            location: getLocation(event.target.value),
            location_id: event.target.value 
        }

        setSchedule( 
            {
                ...schedule,
                times: newTimes
            }
        );
    }

    const onChangeLocationDetail = (event) => {
        context.debug("Schedule", `onChangeLocationDetail(${event.target.id || 0})`, event.target.value);

        let newTimes = [ ...schedule.times ]

        newTimes[event.target.id || 0] = {
            ...schedule.times[event.target.id || 0],
            location_detail: event.target.value 
        }

        setSchedule( 
            {
                ...schedule,
                times: newTimes
            }
        );
    }  
    
    const onChangeSundayEvent = (event) => {
        context.debug("Schedule", `onChangeSundayEvent(${event.target.id || 0})`, event.target.value);

        let newTimes = [ ...schedule.times ]

        newTimes[event.target.id || 0] = {
            ...schedule.times[event.target.id || 0],
            sundayTime: event.target.value 
        }

        setSchedule( 
            {
                ...schedule,
                times: newTimes
            }
        );
    }

    const onChangeSaturdayEvent = (event) => {
        context.debug("Schedule", `onChangeSaturdayEvent(${event.target.id || 0})`, event.target.value);

        let newTimes = [ ...schedule.times ]

        newTimes[event.target.id || 0] = {
            ...schedule.times[event.target.id || 0],
            saturdayTime: event.target.value 
        }

        setSchedule( 
            {
                ...schedule,
                times: newTimes
            }
        );
    }

    const onChangeGameDate = (event) => {
        context.debug("Schedule", `onChangeGameDate(${event.target.id || 0})`, event.target.value);

        let newTimes = [ ...schedule.gameDates ]

        newTimes[event.target.id || 0] = {
            ...schedule.gameDates[event.target.id || 0],
            gameDate: event.target.value 
        }

        setSchedule( 
            {
                ...schedule,
                gameDates: newTimes
            }
        );
    }

    const getTeam = (teamName) => {
        context.debug("Schedule", `getTeam('${teamName}')`);

        if( parseInt(teamName) < 10 ) {
            teamName = "0" + teamName;
        }

        let selectedTeam = {
            "id":   "-1",
            "name": "NotFound"
        }

        if( division && Array.isArray(division.teams) ) {
            division.teams.forEach(
                (team) => {
                    if( team.name.substring(5, 7) == teamName.toString()) {
                        selectedTeam = team
                    }
                }
            )
        }

        return selectedTeam;
    } 

    const onChangeHomeTeam = (event) => {
        context.debug("Schedule", `onChangeHomeTeam(${event.target.id}, ${event.target.value})`, event);

        const [gameIndex, eventIndex] = event.target.id.substring(1).split(":");
        
        const game = {
            ...schedule.gameDates[gameIndex].events[eventIndex],
            home_team: event.target.value
        }

        let newSchedule = {
            ...schedule
        }

        newSchedule.gameDates[gameIndex].events[eventIndex] = game;

        context.debug("Schedule", "onChangeHomeTeam()", newSchedule);

        setSchedule(newSchedule);
    }

    const onChangeAwayTeam = (event) => {
        context.debug("Schedule", `onChangeAwayTeam(${event.target.id}, ${event.target.value})`, event);

        const [gameIndex, eventIndex] = event.target.id.substring(1).split(":");
        
        const game = {
            ...schedule.gameDates[gameIndex].events[eventIndex],
            away_team: event.target.value
        }

        let newSchedule = {
            ...schedule
        }

        newSchedule.gameDates[gameIndex].events[eventIndex] = game;

        context.debug("Schedule", "onChangeHomeTeam()", newSchedule);

        setSchedule(newSchedule);
    }

    const onSelectDivision = (event) => {
        setDivisionID(event.target.value);
    }

    const createSchedule = () => {
        context.debug("Schedule", "createSchedule()");

        try {

            let  gameGrid = [];

            schedule.gameDates.map(
                (gameDate, index) => {
                    const eventDate = moment(gameDate.gameDate);

                    // Filtered by Game Day
                    const filteredEvents = gameDate.events.filter(
                        (event, timeIndex) => {
                            const eventSchedule = schedule.times[timeIndex];
                            return (eventSchedule.location_id != "" && event.home_team != 0 && event.away_team != 0);
                        }
                    );

                    // Work with only valid Locations
                    return filteredEvents.map(
                        (event, timeIndex) => {
                            const eventSchedule = schedule.times[timeIndex];

                            gameGrid.push(
                                {
                                    id:         context.getUUID(),
                                    home_team:  getTeam(event.home_team),
                                    away_team:  getTeam(event.away_team),
                                    location:   getLocation(eventSchedule.location_id),
                                    field:      eventSchedule.location_detail,
                                    division:   division,
                                    start_time: eventDate.day() == 0 ? eventSchedule.sundayTime : eventSchedule.saturdayTime,
                                    gameDate:   gameDate.gameDate,
                                    status:     t("pending")
                                }
                            );
                        }
                    )
                }
            )

            setGameDates(gameGrid);

            if( gameGrid.length > 0) {
                setValid(true);
            }

            context.debug("Schedule", "createSchedule()", gameGrid);
        }
        catch(xx) {
            console.error("createSchedule()", xx.message);
        }
    }
    
    const getSeason = () => {
        context.debug("Schedule", `recalulateSeason('${schedule.gameDates[0].gameDate}')`);

        const today   = moment(schedule.gameDates[0].gameDate);

        setSchedule(
            {
                ...schedule,
                gameDates: [ 
                    today, 
                    ...schedule.gameDates.slice(1).map(
                            (event) => {
                                const newDate = today.add( 7, 'd').format("YYYY-MM-DD");
                                return {
                                    ...event,
                                    gameDate: newDate
                                }
                            }
                        )
                ]
            }
        ) 
    }
    
    useEffect(
        () => {
            if(division.id) {
                createSchedule();
            }
        },
        [schedule, division]
    )    

    useEffect(
        () => {
            if( divisionID != "" ) {
                getDivision();
            }
        },
        [divisionID]
    )

    useEffect(
        () => {
            getListLocations();
            getListDivisions();
        },
        []
    )

    return (
        <NoPanelLayout>
            <Row />

            <div className="news">
                <div className="row">
                    <div className="col-8">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item">{t('import')}</li>
                                <li className="breadcrumb-item active"><Link to="/admin/import/schedule">{t('schedule')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>  

                <Row />

                <Message state={formState} />

                <div className="row">
                    <div className="col-12">
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th className="text-right">{t("division")}</th>
                                    <th className="text-right">
                                        <Form.Select id="division" value={division.id} onChange={onSelectDivision}>
                                            <option key="-1" value=""></option>
                                            {
                                                divisions.map(
                                                    (division) => {
                                                        return <option key={division.id} value={division.id}>{division.name}</option>
                                                    }
                                                )
                                            }
                                        </Form.Select>
                                    </th>
                                </tr>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th className="text-right">{t("location")}</th>
                                    {
                                        schedule.times.map(
                                            (time, index) => {
                                                return (
                                                    <th key={index}>
                                                        <Form.Select id={index} onChange={onChangeLocation} value={time.location_id}>
                                                            <option value=""></option>
                                                        {
                                                            locations.map(
                                                                (location) => {
                                                                    return <option key={location.id} value={location.tsid}>{location.name}</option>
                                                                }
                                                            )
                                                        }
                                                        </Form.Select>
                                                    </th>
                                                )
                                            }
                                        )
                                    }
                                </tr>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th className="text-right">{t("field")}</th>
                                    {
                                        schedule.times.map(
                                            (time, index) => {
                                                return <th key={index}><Form.Control id={index} type="text" disabled={time.location_id == ""} onChange={onChangeLocationDetail} value={time.location_details} /></th>
                                            }
                                        )
                                    }
                                </tr>
                                <tr>
                                    <th className="col">&nbsp;</th>
                                    <th className="col text-right">{t("saturday")}</th>
                                    {
                                        schedule.times.map(
                                            (time, index) => {
                                                return <th key={index}><Form.Control disabled={time.location_id == ""} id={index} onChange={onChangeSaturdayEvent} type="time" value={time.saturdayTime} /></th>
                                            }
                                        )
                                    }
                                </tr>
                                <tr>
                                    <th className="col">&nbsp;</th>
                                    <th className="col pull-right">{t("sunday")}</th>
                                    {
                                        schedule.times.map(
                                            (time, index) => {
                                                return <th key={index}><Form.Control disabled={time.location_id == ""} id={index} onChange={onChangeSundayEvent} type="time" value={time.sundayTime} /></th>
                                            }
                                        )
                                    }
                                </tr>
                            </thead>
                    
                            <tbody>
                                <tr>
                                    <td><Button ng-click="addDate" disabled={true}><FontAwesomeIcon icon={faCalendarPlus} /></Button></td>
                                    <td>&nbsp;</td>
                                    {
                                        schedule.times.map(
                                            (time, index) => {
                                                return (
                                                    <td key={index}>
                                                        <div className="row">
                                                            <div className="col text-center">{t("home")}</div>
                                                            <div className="col text-center">{t("away")}</div>
                                                        </div>
                                                    </td>
                                                )
                                            }
                                        )
                                    }
                                </tr>
                                {   // Game Grid Starts Here
                                    schedule.gameDates.length > 0 &&
                                    <tr key="0">
                                        <td><Button onClick={getSeason}><FontAwesomeIcon icon={faClock} /></Button></td>
                                        <td>
                                            <div className="row">
                                                <div className="col">
                                                    <Form.Control id="0" onChange={onChangeGameDate} type="date" value={schedule.gameDates[0].gameDate} min={new Date()} max={ new Date( new Date().getFullYear(), 12, 31) } />
                                                </div>
                                            </div>
                                        </td>
                                        {
                                            schedule.times.map(
                                                (time, i) => {
                                                    return (
                                                        <td key={`K0:${i}`} className={ (0 % 2 == 0) ? 'bg-light' : "" }>
                                                            <div className="row">
                                                                <div className="col">
                                                                    <Form.Control id={`H0:${i}`} onChange={onChangeHomeTeam} disabled={time.location_id == ""} type="text" />
                                                                </div>
                                                                <div className="col">
                                                                    <Form.Control id={`A0:${i}`} onChange={onChangeAwayTeam} disabled={time.location_id == ""} type="text" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    )    
                                                }
                                            )
                                        }
                                    </tr>
                                }
                                {
                                    schedule.gameDates.slice(1).map(
                                        (game, gameIndex) => {
                                            const rowIndex = 1 + gameIndex;

                                            return (
                                                <tr key={rowIndex}>
                                                    <td>&nbsp;</td>
                                                    <td>
                                                        <div className="row">
                                                            <div className="col">
                                                                <Form.Control id={rowIndex} onChange={onChangeGameDate} type="date" value={game.gameDate} min={new Date()} max={ new Date( new Date().getFullYear(), 12, 31) } />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {
                                                        schedule.times.map(
                                                            (time, i) => {
                                                                return (
                                                                    <td key={`K${rowIndex}:${i}`} className={ (rowIndex % 2 == 0) ? 'bg-light' : "" }>
                                                                        <div className="row">
                                                                            <div className="col">
                                                                                <Form.Control id={`H${rowIndex}:${i}`} onChange={onChangeHomeTeam} disabled={time.location_id == ""} type="text" />
                                                                            </div>
                                                                            <div className="col">
                                                                                <Form.Control id={`A${rowIndex}:${i}`} onChange={onChangeAwayTeam} disabled={time.location_id == ""} type="text" />
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                )    
                                                            }
                                                        )
                                                    }
                                                </tr>
                                            )
                                        }
                                    )
                                }
                            </tbody>
                        </Table>
                    </div>    
                </div>

                <Row />

                {   // Generated Game Report
                    gameDates.length > 0 &&
                    <div className="row">
                        <div className="col">
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th className="font-weight-bold">Date</th>
                                        <th className="font-weight-bold">Start time</th>
                                        <th colSpan="2">Location</th>
                                        <th>Field</th>
                                        <th colSpan="2">Home Team</th>
                                        <th colSpan="2">Away Team</th>
                                        <th>Length</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        gameDates.map(
                                            (game, index) => {
                                                context.debug("Schedule", "==> Mapping Game", game);

                                                return <GameRow key={index} game={game} />
                                            }
                                        )
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </div>
                }
                <Row />
                <div className={`row ${ !isValid && "d-none"}`}>
                    <div className="col text-end">
                        <Button onClick={createTeamSnapGames} style={{ marginLeft: "10px"}} disabled={!isSubmitting}>{t("commit")}</Button>
                    </div>
                </div>
            </div>
        </NoPanelLayout>
    )
}

export default Schedule;
