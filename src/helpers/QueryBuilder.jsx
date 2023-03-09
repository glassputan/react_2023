import React                    from 'react';
import { 
    useState, 
    useEffect,
    useContext
}                               from 'react';

import { 
    v4 as uuidv4 
}                               from 'uuid';

import AppContext               from '../context/AppContext';

import MemberQueryParameter     from './MemberQueryParameter';
import TeamQueryParameter       from './TeamQueryParameter';

const QueryBuilder = (props) => {
    const [query,       setQuery]        = useState({});
    const [conditions,  setUIConditions] = useState([]);
    const [data,        setData]         = useState([]); 

    const context = useContext(AppContext);
    
    const updateQueryHandler = (id, condition) => {
        context.debug("QueryBuilder", "updateQueryHandler()", condition);

        const q = {
            ...query,
            [id]: condition
        }

        context.debug("QueryBuilder", "updateQueryHandler(): New Query", q);

        setQuery(q);
    }

    useEffect(
        () => {
            let array = [];

            context.debug("QueryBuilder", "useEffect(): Processing " + Object.keys(query).length + " items.");

            for( let item in query ) {
                array.push(query[item]);
            } 

            context.debug("QueryBuilder", `useEffect(): The query is now..`, array);
            
            setData(array);
        },
        [query]
    )

    useEffect(
        () => {
            let isValid = data.length > 0;

            data.forEach(
                item => {
                    switch( item.operation ) {
                        case "%":
                        case "sw":
                        case "eq":
                        case "ne":
                        case "gt":
                        case "lt":
                            if( item.value.length == 0 ) {
                                isValid = false;
                            }
                            break;
                        default:
                            break;
                    }                        
                }
            )

            if( isValid ) {
                context.debug("QueryBuilder", "useEffect(): Calling REST service.");
                props.onSetQuery(data);
            }
            else {
                context.debug("QueryBuilder", "useEffect(): Skipping query, the data is NOT valid.");
            }
        },
        [data]
    );

    const removeQueryParameter = (index) => {
        context.debug("QueryBuilder", `removeQueryParameter(key: ${index}, length: ${conditions.length})`, conditions);

        if( conditions.length > 1 ) {
            const items = conditions.filter( item => { return item != index } );

            context.debug("QueryBuilder", "removeQueryParameter(): post-filter", items);

            setUIConditions(items);

            const q     = {
                ...query
            };

            delete q[index];

            setQuery(q);
        }
    }

    const execQueryHandler = () => {
        if( props.onExecuteQuery ) {
            props.onExecuteQuery();
        }
        else {
            context.warn("QueryBuilder", "execQueryHandler()", "Missing property 'onExecuteQuery'");
        }
    }

    const addQueryParameter = () => {
        context.debug("QueryBuilder", "addQueryParameter()");

        setUIConditions(conditions => [...conditions, uuidv4().replaceAll("-", "")]);
    }

    useEffect(
        () => {
            setUIConditions([uuidv4().replaceAll("-", "")]);
        }, 
        []
    );

    return (
        <div className="row">
            <div className="col">
                <div className="card card-header">
                    <div className="row">
                        <div className="col">
                            {
                                props.queryType === "member" &&
                                conditions.map( 
                                    (item) => { 
                                        return <MemberQueryParameter data={props.data} onUpdateCondition={updateQueryHandler} onEnter={execQueryHandler} key={item} index={item} onAddParam={addQueryParameter} onRemoveParam={removeQueryParameter} />;
                                    } 
                                )
                            }

                            {
                                props.queryType === "teams" && 
                                conditions.map( 
                                    (item) => { 
                                        return <TeamQueryParameter data={props.data} onUpdateCondition={updateQueryHandler} onEnter={execQueryHandler} key={item} index={item} onAddParam={addQueryParameter} onRemoveParam={removeQueryParameter} />
                                    }
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QueryBuilder;