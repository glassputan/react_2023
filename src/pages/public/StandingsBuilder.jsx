import React              from 'react'
import { Fragment }       from "react"
import { useTranslation } from "react-i18next";
import { Link }           from 'react-router-dom'

const StandingsBuilder = (props) => {
    const {t} = useTranslation();

    const teams     = props.teamss;
    const teamGraph = [];

    //console.log("StandingsBuilder()::teamss", teams);

    const isBoardMember = props.boardMember || false;

    let idx = 1;

    while( idx++ < teams.length ) {
        teamGraph.push(
            <tr>
                <td><Link to={`/team/${teams[idx].id}`}>{ teams[idx-1] }</Link></td>

                <td className="bg-success font-weight-bold text-center">{ teams[idx].pts }</td>

                <td className="text-center">{ teams[idx].win }</td>
                <td className="text-center">{ teams[idx].los }</td>
                <td className="text-center">{ teams[idx].tie }</td>

                { isBoardMember && 
                    <Fragment>
                        <td className="bg-warning text-center">{ teams[idx].gf }</td>
                        <td className="bg-warning text-center">{ teams[idx].ga }</td>
                        <td className="bg-warning text-center">{ teams[idx].gf - teams[idx].ga }</td>
                    </Fragment>
                }
                
                <td className="bg-info text-center">
                    { teams[idx].gp } 
                    { 
                        teams[idx].gm != 0 &&
                            <span className="badge bg-warning" data-toggle="tooltip" title={t('missing_scores')}>{ teams[idx].gm }</span>
                    }
                </td>
            </tr>
        );
    }
    
    return ( <Fragment>{ teamGraph }</Fragment> );
}

export default StandingsBuilder;