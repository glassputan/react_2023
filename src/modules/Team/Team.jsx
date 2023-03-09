import React              from 'react'

import { 
    Fragment,
    useState,
    useCallback,
    useEffect 
}                           from "react";
import { 
    Link, 
    useParams 
}                           from "react-router-dom"
import { useTranslation }   from "react-i18next";
import DefaultLayout        from "../Layouts/DefaultLayout";
import Row               from "../Row"
import Scores               from "../Team/Scores"
import Club                 from "../Team/Club"
import Member               from "../Team/Member"
import Row                  from "../UI/Row"

import logo                 from '../assets/images/2016_hsc_logo_125_148.png'

const Team = (props) => {
    const {t} = useTranslation();

    const params = useParams();

    const [team, setTeam] = useState(
        {
            "status":  "",
            "message": "",
            "data": {
                "id":                   -1,
                "name":                 "",
                "club_id":              -1,
                "team_logo":            "",
                "manager_id":           -1,
                "head_coach_id":        -1,
                "assistant_coach_id":   -1
            }
        }
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);

    const fetchHandler = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);
    
            try {
                const response = await fetch(`http://localhost:8081/team/${params.id}`);
                const data     = await response.json();

                if( data.status && data.status === "error") {
                    throw new Error(team.message);
                }
                else {
                    setTeam(data.object);
                }
            }
            catch(xx) {
                setError(xx.message);
            }
    
            setIsLoading(false);
        },
        [],
    );

    useEffect( 
        () => {
            fetchHandler();
        }, 
        [fetchHandler]
    );     

    return (               
        <DefaultLayout>
            <Row />
            
            <div className="news">  
                <div className="row">
                    <div className="col-12" style={{ paddingLeft: "0px"}}>
                        <nav aria-label="breadcrumb">
                            <ul className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><i className="fas fa-home"></i></Link></li>
                                <li className="breadcrumb-item"><Link to="/standings">{ t('recreational_team_standings') }</Link></li>
                                <li className="breadcrumb-item active"><span>{ team.name }</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <Row />

                { isLoading  && <Row><p>Loading...</p></Row>       }
                { !isLoading && error && <Row><p>{error}</p></Row> }
                { !isLoading && !error && 
                    <Fragment>
                        <div className="row">
                            <div className="col-8">
                                <div className="h1">
                                    { team.name }<br/>
                                    <small className="text-muted"><Club id={team.club_id} /></small>
                                </div>
                            </div>
                            <div className="col-4 float-right">
                                <img src={logo} className="float-right img-fluid" style={{ maxHeight: "125px", width: "auto"}}  />
                            </div>            
                        </div>

                        <Row />

                        <div className="row">
                            <div className="col-12 col-md-6">
                                <Member title="Head Coach" id={team.head_coach_id} />                        
                                <Member title="Assistant Coach" id={team.assistant_coach_id} />
                                <Member title="Manager" id={team.manager_id} />
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="jumbotron">{ team.note }</div>
                            </div>            
                        </div>

                        <div className="row">
                            <div className="col-8 ml-3">
                                <Scores id={team.id} />
                            </div>
                        </div>
                    </Fragment>
                }
                
                <Row />
            </div>        
        </DefaultLayout>
    )
}

export default Team;