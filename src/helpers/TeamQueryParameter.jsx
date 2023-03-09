import React from 'react'

import { 
    useState,
    useEffect
 } from 'react'

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faPlusSquare,
    faMinusSquare
}                         from '@fortawesome/pro-regular-svg-icons'

import { useTranslation } from 'react-i18next'

const TeamQueryParameter = (props) => {
    const {t} = useTranslation();

    const [query,    setQuery] = useState(
        {
            "field":     "name",
            "operation": "%",
            "value":     ""
        }
    );

    const fieldChangeHandler = (event) => {
        console.log("fieldChangeHandler()", event.target.value);

        setQuery(
            {
                ...query,
                field: event.target.value
            }
        )

    }

    const opChangeHandler = (event) => {
        console.log("opChangeHandler()", event.target.value);

        setQuery(
            {
                ...query,
                operation: event.target.value
            }
        )
    }

    const valueChangeHandler = (event) => {
        const timer = setTimeout(
            () => {
                console.log("valueChangeHandler()", event.target.value);

                setQuery(
                    {
                        ...query,
                        value: event.target.value
                    }
                )        
            },
            100
        );

        return () => {
            clearTimeout(timer);
        }
    }

    const searchHandler = (event) => {
        if(event.nativeEvent.key == "Enter") {
            props.onEnter();
        }
    }

    const removeParamHandler = (event) => {
        props.onRemoveParam(props.index);
    }

    useEffect(
        () => {
            const timer = setTimeout(
                () => {
                  // console.info("queryParameters::useEffect()", query);

                    if( props.onUpdateCondition ) {
                        props.onUpdateCondition( props.index, query );
                    }
                    else {
                        console.error("Missing property onUpdateCondition");
                    }
                },
                100
            )

            return () => {
                clearTimeout(timer);
            }
        }, 
        [query]
    );

    useEffect(
        () => {
            console.log("Teams", props.teams);
        },
        []
    )

    const notTeamOps = [
        {   
            "value": "%",
            "label": t("contains")
        },
        {
            "value": "eq",
            "label": "is"
        },
        {
            "value": "sw",
            "label": "starts with"
        },
        {
            "value": "ne",
            "label": "is not"
        },
        {
            "value": "_",
            "label": "is empty"
        },
        {
            "value": "*",
            "label": "is not empty"
        },
        {
            "value": "gt",
            "label": "is greater than"
        },
        {
            "value": "lt",
            "label": "is less than"
        }
    ];

    const teamOps = [
        {
            "value": "eq",
            "label": "is"
        },
        {
            "value": "ne",
            "label": "is not"
        }
    ];


    return (
        <div className="row pb-1">
            <div className="col-12 col-md-4">
                <select className="form-control" onChange={fieldChangeHandler} >
                    <option value="name">{t("name")}</option>
                    <option value="is_travel">{t("is_travel")}</option>
                    <option value="coach">{t("coach")}</option>
                    <option value="division">{t("division")}</option>
                </select>
            </div>
            <div className="col-12 col-md-2">            
                <select className="form-control" onChange={opChangeHandler} >
                    { query.field != "team_id" && query.field != "household_id"   && notTeamOps.map( (op, i) => { return <option key={i} value={op.value}>{op.label}</option>; } ) }
                    { (query.field == "team_id" || query.field == "household_id") &&    teamOps.map( (op, i) => { return <option key={i} value={op.value}>{op.label}</option>; } ) }
                </select>
            </div>
            <div className="col-9 col-md-4">
                { query.field != "team_id" && query.field != "household_id" && query.operation != "_" && query.operation != "*" && <input type="text" className="form-control" onKeyPress={searchHandler} onChange={valueChangeHandler} /> }
                { query.field == "team_id"      && <select className="form-control" onChange={valueChangeHandler}>{props.data.teams.map( (team, i) => { return <option key={i} value={team.id}>{team.name}</option>; }) }</select> }
                { query.field == "household_id" && <select className="form-control" onChange={valueChangeHandler}>{props.data.households.map( (team, i) => { return <option key={i} value={team.id}>{team.name}</option>; }) }</select> }
            </div>
            <div className="col-2 col-md-2 float-right">
                <div className="btn btn-primary" onClick={props.onAddParam} style={{marginRight: "10px"}}>
                    <FontAwesomeIcon icon={faPlusSquare} />
                </div>
                <div className="btn btn-danger"  onClick={removeParamHandler}>
                    <FontAwesomeIcon icon={faMinusSquare} />
                </div>
            </div>
        </div>
    )
}

export default TeamQueryParameter;