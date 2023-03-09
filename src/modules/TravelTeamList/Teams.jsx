import
    React,
    { 
        useState, 
        useEffect, 
        useCallback, 
        useContext 
    }                      from 'react';

import { useTranslation }  from "react-i18next";

import Table               from 'react-bootstrap/Table';

import AppContext          from '../../context/AppContext';
import Member              from '../../pages/public/Member';

const Team  = (props) => {
    const team = props.team;

    return (
        <tr>
            <td className="text-center">{ team.year }</td>
            <td className="text-center">{ `U${1 + (new Date().getFullYear() - team.year)}`}</td>
            <td>{team.name}</td>
            <td><Member id={team.head_coach_id} /></td>
            <td><Member id={team.manager_id} /></td>
        </tr>   
    )
}

const Teams = (props) => {
    const { t }                     = useTranslation();
    const context   = useContext(AppContext);

    const [teams,     setTeams]     = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);

    const getListTeams = useCallback(
        async () => {
            setIsLoading(true);
    
            const response  = await fetch(`/api/v1/teams/travel?gender=${props.gender}`);

            if(response.ok ) {
                const json = await response.json();

                context.debug("Teams", "getListTeams()", json);

                if( json.status === "error" ) {
                    setError(json.message);
                }
                else {
                    setTeams( json.records );
                }
            }
            else {
                setError(response.statusText);
            }
    
            setIsLoading(false);                
        },
        [],
    );

    useEffect( 
        () => {
            getListTeams();
        }, 
        [getListTeams]
    );

    

    return (
        <div className="table-responsive">
            <Table striped bordered>
                <thead className="cf">
                    <tr>
                        <th className="text-center">{ t('birth_year') }</th>
                        <th className="text-center">{ t('division') }</th>
                        <th>{ t('name') }</th>
                        <th>{ t('head_coach') }</th>
                        <th>{ t('manager') }</th>
                    </tr>
                </thead>

                <tbody>
                    { isLoading  && <tr><td colSpan="5"><p>Loading...</p></td></tr> }
                    { !isLoading && error && <tr><td colSpan="5"><p>{error}</p></td></tr> }
                    { 
                        !isLoading && !error && 
                        teams.sort(
                                (a,b) => {
                                    var nameA = parseInt(a.year), // ignore upper and lowercase
                                        nameB = parseInt(b.year); // ignore upper and lowercase
                                
                                    if (nameA > nameB) { return -1; }
                                    if (nameA < nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .map( 
                                (team) => ( <Team key={team.id} team={team} /> ) 
                            ) 
                    }
                </tbody>
            </Table>
        </div>
    );
}

export default Teams;