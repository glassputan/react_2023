import 
    React, 
    {
            useContext,
            useEffect,
            useState,
            useReducer
    }                   from 'react';

import { 
    Link,
    useNavigate,
    useSearchParams
}                       from 'react-router-dom';

import DefaultLayout    from '../../../layouts/DefaultLayout';

import Button           from 'react-bootstrap/Button';
import Card             from 'react-bootstrap/Card';
import Form             from 'react-bootstrap/Form';
import Image            from 'react-bootstrap/Image';
import Tab              from 'react-bootstrap/Tab';
import Table            from 'react-bootstrap/Table';
import Tabs             from 'react-bootstrap/Tabs';

import { 
    FontAwesomeIcon 
}           from '@fortawesome/react-fontawesome';

import { 
    faHome,
    faSave,
    faTrash,
    faCalendarAlt,
    faFileUser,
    faFutbol
}                           from '@fortawesome/pro-regular-svg-icons';

import MemberSearch         from '../Members/MemberSearch';

import { 
    useTranslation 
}                           from 'react-i18next';

import Row                  from '../../../helpers/Row';
import TeamModel            from '../../../models/TeamModel';
import AppContext           from '../../../context/AppContext';
import Message              from '../../../helpers/Message';
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';

const Schedule = (props) => {
    const schedule = props.schedule;

    return (
        <tr>
            <td>{ schedule.event_date.strftime("%Y-%m-%d %I:%M %p") }</td>
            <td>{ "game" == schedule.event_type.toLowerCase() ? schedule.opponent.name : schedule.event_name }</td>
            <td>{ schedule.location && schedule.location.name }</td>
            <td>{ schedule.location_detail }</td>
        </tr>
    )
}

const Game = (props) => {
    const game = props.game;

    return (
        <tr className={ game.archived ? "archived" : "" }>
            <td>{ game.game_date.strftime("%F") }</td>
            <td>{ game.away_team_id ? game.opponent_name : game.away_team.name  }</td>
            <td>{ game.home_score }</td>
            <td>{ game.away_score }</td>
            <td>{ game.formatted_score }</td>
        </tr>
    )
}

const Member = (props) => {
    const member = props.member;

}

const Team = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const context  = useContext(AppContext);
    const {t}      = useTranslation();
    const navigate = useNavigate();

    const [ showDeleteModal, setShowDeleteModal] = useState(false);
    const [ clubs,     setClubs       ] = useState([]);
    const [ divisions, setDivisions   ] = useState([]);
    const [ games,     setGames       ] = useState([]);
    const [ image,     setImage       ] = useState();
    const [ members,   setTeamMembers ] = useState([]);
    const [ record,    setRecord      ] = useState( new TeamModel() );
    const [ isNew,     setNew         ] = useState(true);
    const [ schedules, setSchedules   ] = useState([]);
    const [ teamId,    setTeamId      ] = useState();
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
    
    const getListClubs = async () => {
        const target = "/api/v1/clubs";

        context.debug("Team", "getListClubs(): Calling ", target);

        const response  = await fetch(target, context.defaultHeaders);

        context.debug("Team", "getListClubs(RSP)", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Team", "getListClubs(JSON)", json);
            
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setClubs(json.records);
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const getListDivisions = async () => {
        const target = "/api/v1/divisions";

        context.debug("Team", "getListDivisions(): Calling ", target);

        const response  = await fetch(target, context.defaultHeaders);

        context.debug("Team", "getListDivisions(RSP)", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Team", "getListDivisions(JSON)", json);
            
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
    }    

    const submitHandler = (event) => {
        if(event) event.preventDefault();

        if( isNew ) {

        }
    }

    const changeValueHandler = (event) => {
        setRecord(
            {
                ...record,
                [event.target.id]: event.target.value
            }
        );
    }

    const assignHeadCoach = (event) => {
        context.debug("Teams", "assignHeadCoach()", event);

    }
    
    const assignAssistantCoach = (event) => {
        context.debug("Teams", "assignAssistantCoach()", event);
    
    }
    
    const assignManager = (id) => {
        context.debug("Teams", "assignManager()", id);
    
    }

    const getTeamHandler = async () => {
        dispFormState( { event: "LOADING" });

        if(teamId) {
            const target = `/api/v1/team/${teamId}`;

            context.debug("Team", "getTeamHandler(): Calling ", target);

            const response  = await fetch(target, context.defaultHeaders);

            context.debug("Team", "getTeamHandler(RSP)", response);

            if( response.ok ) {
                const json = await response.json();

                context.debug("Team", "getTeamHandler(JSON)", json);
                
                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    setNew(false);
                    setRecord(context.deNullObject(json.record));
                    setImage( json.image );
                }
            }
            else {
                setError(response.statusText);
            }
        }
    }
    
    const getParameters = () => {
        extras = null;
        
        if( searchParams.get("guardian") || searchParams.get("household_id") ) {
            extras = {};
            
            if( searchParams.get("guardian") ) {
                extras.guardian_type = searchParams.get("guardian");
            }
            
            if( searchParams.get("household_id") ) {
                extras.household_id = searchParams.get("household_id");
            }
        }
        
        return extras;
    }

    const showDeleteModalHandler = () => {
        setShowDeleteModal(true);
    }
            
    const onDeleteRecordHandler = async (event) => {
        context.debug("Article", "onDeleteRecordHandler()");
        
        const action = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };
        
        const response = await fetch(`/api/v1/team/${teamId}`, action);
        
        context.debug("Team", "onDeleteRecordHandler()", response);

        setShowDeleteModal(false);
        
        if( response.ok ) {
            const json = await response.json();
                        
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                navigate("/admin/teams");
            }
        }
    }
    
    const deleteModalCloseHandler = (event) => {
        setShowDeleteModal(false);
    }    

    useEffect(
        () => {
            getTeamHandler();
        }, 
        [teamId]
    )

    useEffect(
        () => {
            
            if( searchParams.get("id") ) {
                context.debug("Team", "useEffect(): Initializing By ID", searchParams.get("id"));
                
                setTeamId(searchParams.get("id"));
            }
            else if(props.team) {
                context.debug("Team", "useEffect(): Initializing by props", props.team);
                                
                setTeam(
                    {
                        ...props.team,
                        ...getParameters()
                    }
                );
                
                dispFormState( { event: "LOADED", message: props.team.name });
            }

            getListClubs();
            getListDivisions();
        },
        []
    )    
    
    return (
        <DefaultLayout>
            <ConfirmModal message={t("confirm_delete")} header={`${t("delete")} '${record.name}'`} onContinue={onDeleteRecordHandler} isVisible={showDeleteModal} onClose={deleteModalCloseHandler} />

            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-8">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/teams">{t('teams')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/team">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-4 text-end px-2">
                        <Button onClick={submitHandler} style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave} size="2x" /></Button>
                        <Button onClick={showDeleteModalHandler} variant="danger" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash}  size="2x" /></Button>
                    </div>
                </div>

                <Message state={formState} />

                <Row />

                <div className="row">
                    <div className="col col-md-6">
                        <Form.Label>{t("name")}</Form.Label>
                        <Form.Control id="name" value={record.name} onChange={changeValueHandler} />
                    </div>
                    <div className="col col-md-2">
                        <Form.Label>{t("status")}</Form.Label>
                        <Form.Select aria-label="Default select example" id="status" value={record.status} onChange={changeValueHandler}>
                            <option value="active">{t("active")}</option>
                            <option value="disabled">{t("disabled")}</option>
                            <option value="retired">{t("retired")}</option>
                        </Form.Select>
                    </div>
                    <div className="col col-md-2">
                        <Form.Label>{t("is_travel")}</Form.Label>
                        <Form.Select aria-label={t("is_travel")} id="is_travel" value={record.is_travel} onChange={changeValueHandler}>
                            <option value="false">{t("no")}</option>
                            <option value="true">{t("yes")}</option>
                        </Form.Select>                        
                    </div>
                </div>

                <Row />

                <div className="row">
                    <div className="col col-md-6">
                        <Form.Label>{t("home_club")}</Form.Label>
                        <div className="dropdown">
                            <Form.Select id="club_id" value={record.club_id}>
                                {
                                    clubs.map(
                                        (club) => {
                                            return <option key={club.id} value={club.id}>{club.name}</option>
                                        }
                                    )
                                }
                            </Form.Select>
                        </div>
                    </div>
                    <div className="col col-md-6">
                        <div className="row">
                            <div className="col">                                   
                                <MemberSearch
                                    onError={setError} 
                                    onSelect={assignHeadCoach} 
                                    label={t("head_coach")} 
                                    persist={true} 
                                    defaultValue={ record.head_coach ? record.head_coach.full_name : "" } 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <Row />
                <div className="row">
                    <div className="col col-md-6">
                        <Form.Label>{t("division")}</Form.Label>
                        <Form.Select id="division_id" value={record.division_id} onChange={changeValueHandler} >
                            <option value=""></option>
                            {
                                Array.isArray(divisions) && divisions.map(
                                    (division) => {
                                        return <option key={division.id} value={division.id}>{division.name}</option>
                                    }
                                )
                            }
                        </Form.Select>
                    </div>
                    <div className="col col-md-6">
                        <MemberSearch 
                            onError={setError} 
                            onSelect={assignAssistantCoach} 
                            label={t("assistant_coach")} 
                            persist={true} 
                            defaultValue={ record.assistant_coach ? record.assistant_coach.full_name : "" }
                        />
                    </div>
                </div>
                <Row />
                <div className="row">
                    <div className="col col-md-6">&nbsp;</div>
                    <div className="col col-md-6">
                        <MemberSearch
                            onError={setError} 
                            onSelect={assignManager} 
                            label={t("manager")} persist={true} defaultValue={ record.manager ? record.manager.full_name : "" } 
                        />
                    </div>
                </div>

                <Row />

                <div className="row">
                    <div className="col">
                        <Form.Label>{t("notes")}</Form.Label>
                        <Form.Control as="textarea" rows="5" placeholder="Leave a comment here" id="note" value={record.note} onChange={changeValueHandler} />
                    </div>
                </div>        

                <Row />

                <div className="row">
                    <div className="col-6">
                        <Form.Control type="file" id="team_logo" value={record.file} />
                    </div>
                    <div className="col-6">
                        { image && <Image src={image} className="img-fluid" /> }
                    </div>
                </div>

                <Row />
                <Row />
            </div>

            <Tabs>
                <Tab eventKey="members" title={t("members")}>
                    <Row />

                    <div className="row">
                        <div className="col">
                            <Table striped hover bordered>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Team Number</th>
                                        <th>Birthdate</th>
                                        <th>Position</th>
                                        <th>Years Played</th>
                                    </tr>
                                </thead>

                                { record.suppress_roster ? <tr><td>Roster suppressed at coaches request.</td></tr> : members.map( (member) => { return <Member member={member} /> }) }

                                {
                                    members.map(
                                        (member) => {
                                            <tr>
                                                <td>{ [ member.member.full_name_lf, edit_member_path(member.member) ] }</td>
                                                <td>{ member.team_number }</td>
                                                <td>{ member.birthdate }</td>
                                                <td>{ member.team_position }</td>
                                                <td>{ member.member.years_played }</td>
                                            </tr>
                                        }
                                    )
                                }
                            </Table>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="games" title={t("games")}>
                    <div className="row">
                        <div className="col section">
                            <div className="row">
                                <div className="col-9">Games</div>
                                <div className="col-2 text-right">
                                    &nbsp;
                                </div>
                                <div className="col-1">&nbsp;</div>
                            </div>
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col">
                            <Table className="Table-persist Table Table-responsive" data-property-name="team_games.sort_column" data-page-length="15" style={{width: "100%"}}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Opponent</th>
                                        <th>Team Score</th>
                                        <th>Opponent Score</th>
                                        <th>Final</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        games.map(
                                            (game) => {
                                                return <Game game={game} />
                                            }
                                        )
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="schedules" title={`Schedules ${ schedules.length > 0 ? `(${schedules.length})` : "" }`}>
                    <div className="row">
                        <div className="col section">
                            <div className="row">
                                <div className="col-9">Schedules</div>
                                <div className="col-2 text-right">
                                    &nbsp;
                                </div>
                                <div className="col-1">&nbsp;</div>
                            </div>
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col">
                            <div className="row">
                                <div className="col">
                                    <Table className="Table-persist Table" data-property-name="team_games.sort_column" data-page-length="15" style={{width: "100%"}}>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Opponent/Event</th>
                                                <th>Location</th>
                                                <th>Location Detail</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            { 
                                                schedules.map(
                                                    (schedule) => { return <Schedule schedule={schedule} /> }
                                                ) 
                                            }
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="administration" title={t("administration")}>
                    <div className="row">
                        <div className="col section">
                            <div className="row">
                                <div className="col-9">{t("administration")}</div>
                                <div className="col-2 text-right">&nbsp;</div>
                                <div className="col-1">&nbsp;</div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <Card>
                                <Card.Body>
                                    <div className="row">
                                        <div className="col-6">
                                            <Card>
                                                <Card.Header>
                                                    <h3 className="card-title">Update HSC WebSite</h3>
                                                </Card.Header>

                                                <Card.Body>
                                                    <div className="row">
                                                        <div className="col-2 pb-2">
                                                            <Button><i className="fas fa-running"></i></Button>
                                                        </div>
                                                        <div className="col-2 pb-2">
                                                            <Button variant="secondary"><FontAwesomeIcon icon={faCalendarAlt} /></Button>
                                                    </div>
                                                        <div className="col-2 pb-2">
                                                            <Button variant="secondary"><FontAwesomeIcon icon={faFutbol} /></Button>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                        <div className="col-6">
                                            <div className="card">
                                                <div className="card-header">
                                                    <h3 className="card-title">Update TeamSnap</h3>
                                                </div>

                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-2 pb-2">
                                                            <Button variant="secondary"><FontAwesomeIcon icon={faFileUser} /></Button>
                                                        </div>
                                                        <div className="col-2 pb-2">
                                                            <Button variant="secondary"><FontAwesomeIcon icon={faCalendarAlt} /></Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Row />

                                    <div className="row">
                                        <div className="col col-md-3">
                                            <Form.Label>{t("team_code")}</Form.Label>
                                            <Form.Control type="text" id="tcode" />
                                        </div>
                                        <div className="col col-md-3">
                                            <Form.Label>{t("teamsnap_id")}</Form.Label>
                                            <Form.Control type="text" id="tsid" />
                                        </div>
                                        <div className="col col-md-3">
                                            <Form.Select id="suppress_roster">
                                                <option value="false">{t("no")}</option>
                                                <option value="true">{t("yes")}</option>
                                            </Form.Select>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-6 col-md-3">
                                            <Form.Label>{t("year")}</Form.Label>
                                            <Form.Control type="text" id="year" />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <Form.Label>{t("gender")}</Form.Label>
                                            <Form.Select id="gender">
                                                <option value="c">{t("coed")}</option>
                                                <option value="f">{t("female")}</option>
                                                <option value="m">{t("male")}</option>
                                            </Form.Select>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-6 col-md-6">
                                            <Form.Label>{t("teamsnap_url")}</Form.Label>
                                            <Form.Control id="teamsnap_url" disabled />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <i className="glyphicon glyphicon-email"></i>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Tab>
            </Tabs>
            <Row />
        </DefaultLayout>


    )

}

export default Team;