import 
    React,
    {
        useState,
        useEffect,
        useReducer,
        useContext
    }               from 'react';

import Alert        from 'react-bootstrap/Alert';
import ListGroup    from 'react-bootstrap/ListGroup';

import { 
    useTranslation 
}                   from 'react-i18next';

import AppContext   from '../../../context/AppContext';

const HouseSearch = (props) => {
    const {t} = useTranslation();

    const context = useContext(AppContext)
    
    const [ error,  setError        ] = useState();
    const [ query,  setQuery        ] = useState("");
    const [ search, dispSearchEvent ] = useReducer(
        (state, action) => {
            context.debug("HouseSearch", "dispSearchEvent(STTE)", state);
            context.debug("HouseSearch", "dispSearchEvent(ACTN)", action);

            switch(action.event) {
                case "CLEAR":      
                    setQuery("");  
                    return { query: "", options: [] }
                case "SET_LIST":
                    return {
                        query:   "",
                        options: action.list 
                    }
                case "SET_QUERY":
                    return { 
                        ...state,
                        query:   action.query
                    }
                default:
                    break;
            }

            return state;
        }, 
        { query: "", options: [] }
    )    

    const autoCompleteSearch = async () => {    
        setError(null);

        if( search.query && search.query != "" ) {
            const record = {
                ...context.defaultHeaders,
                body: JSON.stringify(
                    { 
                        query: [ 
                            { field: "last_name", operation: "sw", value: search.query },
                            { field: "household", operation: "sw", value: search.query }
                        ] 
                    }
                ),
                method:  "POST"
            };

            const target = `/api/v1/households/search`;

            context.debug("HouseSearch", "autoCompleteSearch(REQ): Calling ", target);

            const response  = await fetch(target, record);

            if (response.ok ) {
                const json = await response.json();

                context.debug("HouseSearch", "autoCompleteSearch(RSP)", json);

                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    const records = JSON.parse( json.records );

                    dispSearchEvent(
                        { 
                            event: "SET_LIST", 
                            list: records.sort( 
                                (a,b) => { 
                                    var nameA = (a.name || "").toUpperCase(), // ignore upper and lowercase
                                        nameB = (b.name || "").toUpperCase(); // ignore upper and lowercase
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                } 
                            )
                        }
                    );
                }
            }
            else {
                setError(response.statusText);
            }
        }
        else {
            context.debug("HouseSearch", "autoCompleteSearch(): Skipping", search.query);
        }
    }
    
    useEffect(
        () => {
            const timeout = setTimeout(
                () => {        
                    dispSearchEvent({ event: "SET_QUERY", query: query });
                }, 500);

            return () => { clearTimeout( timeout ) }
        },
        [query]
    )

    useEffect(
        () => {
            autoCompleteSearch()
        },
        [search.query]
    )
    
    const autoCompleteSelect = (event) => {
        context.debug("HouseSearch", `autoCompleteSelect(${event.target.id})`);
    
        if(props.onSelectEvent) {
            props.onSelectEvent({ target: { id: "household_id", value: event.target.id } } );
        }
        else if(props.onSelect) {
            props.onSelect(event.target.id);
        }
        else {
            console.warn("autoCompleteSelect(): Missing prop 'onChangeValue'");
        }

        dispSearchEvent({ event: "CLEAR" });
    }
    
    const changeQueryHandler = (event) => {
        setQuery(event.target.value);
    }

    return (
        <>           
            { 
                error && 
                <div className="row"><div className="col"><Alert variant="danger">{error}</Alert></div></div>
            }
            
            <div className="row">
                <div className="col-12 col-md-6" >
                    <div className="form-group">
                        <label className="control-label">{t("change_household")}</label>
                        <div className="dropdown">
                            <input type="text" className="form-control" data-live-search="true" onChange={changeQueryHandler} value={query} id="member_search" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" />
                            { 
                                Array.isArray(search.options) && search.options.length > 0 && 
                                    <ListGroup>
                                        { 
                                            search.options.map(
                                                (hh) => {
                                                    const guardian = hh.guardians[0];
                                                    return <ListGroup.Item key={hh.id} id={hh.id} onClick={autoCompleteSelect}>{guardian ? `${guardian.last_name}, ${guardian.first_name}`: ""} - {hh.name}</ListGroup.Item>
                                                }
                                            )
                                        }
                                    </ListGroup>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HouseSearch;