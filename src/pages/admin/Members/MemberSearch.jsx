import React from 'react';

import {
    useState,
    useEffect,
    useReducer,
    useContext
}                   from 'react';

import Form         from 'react-bootstrap/Form';
import InputGroup   from 'react-bootstrap/InputGroup';
import ListGroup    from 'react-bootstrap/ListGroup';

import { 
    useTranslation 
}                   from 'react-i18next';
import AppContext   from '../../../context/AppContext';

const MemberSearch = (props) => {
    const {t} = useTranslation();

    const context = useContext(AppContext)
        
    const [ queryText, setQuery           ] = useState("");
    const [ search,    dispSearchEvent    ] = useReducer(
        (state, action) => {
            context.debug("MemberSearch", "dispSearchEvent(STTE)", state);
            context.debug("MemberSearch", "dispSearchEvent(ACTN)", action || "");

            if( queryText == props.defaultValue ) {
                return {
                    query:   queryText,
                    options: action.list 
                }
            }

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
    
    const setError = (message) => {
        if(props.onError) {
            props.onError(message);
        }
        else {
            console.warn("MemberSearch(): Missing props 'onError'");
        }
    }

    const autoCompleteSearch = async () => {    
        if( search.query && search.query != "" ) {
            const record = {
                ...context.defaultHeaders,
                body: JSON.stringify({ query: [ { field: "last_name", operation: "sw", value: search.query}] }),
                method:  "POST"
            };

            const target = `/api/v1/member/search`;

            context.debug("MemberSearch", "autoCompleteSearch(REQ): Calling ", target);

            const response  = await fetch(target, record);

            if (response.ok ) {
                const json = await response.json();

                context.debug("MemberSearch", "autoCompleteSearch(RSP)", json);

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    dispSearchEvent({ event: "SET_LIST", list: json.records });
                }
            }
            else {
                setError(response.statusText);
            }
        }
        else {
            context.debug("MemberSearch", "autoCompleteSearch(): Skipping", search.query);
        }
    }
    
    useEffect(
        () => {
            if( queryText != props.defaultValue ) {
                const timeout = setTimeout(
                    () => {        
                        dispSearchEvent({ event: "SET_QUERY", query: queryText });
                    }, 500);

                return () => { clearTimeout( timeout ) }
            }
        },
        [queryText]
    )

    useEffect(
        () => {
            autoCompleteSearch();
        },
        [search.query]
    )

    useEffect(
        () => {
            setQuery(props.defaultValue);
        },
        [props.defaultValue]
    )
    
    const autoCompleteSelect = (event) => {
        context.debug("MemberSearch", `autoCompleteSelect(${event.target.id})`);
    
        if(props.onSelectEvent) {
            props.onSelectEvent({ target: { id: "household_id", value: event.target.id } } );
        }
        else if(props.onSelect) {
            props.onSelect(event.target.id);
        }
        else {
            context.warn("MemberSearch", "autoCompleteSelect()", "Missing prop 'onChangeValue'");
        }

        if( props.persist ) {
            let selected = null;

            search.options.map(
                (member) => {
                    if( member.id == event.target.id ) {
                        selected = member;
                    }
                }
            )

            setQuery( selected ? selected.full_name : "error" );
        }
        else {
            dispSearchEvent({ event: "CLEAR" });
        }
    }
    
    const changeQueryHandler = (event) => {
        setQuery(event.target.value);
    }

    const selectAll = (event) => {
        event.target.select();
    }

    return (
        <div className="col-12" style={{ position: "relative" }}>
            <div className="form-group">
                <Form.Label>{ props.label ? props.label : t("member_add") }</Form.Label>
                <div>
                    <InputGroup>
                        <Form.Control onFocus={selectAll} type="text" data-live-search="true" onChange={changeQueryHandler} value={queryText || ""} id="member_search" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" />
                        <InputGroup.Text>{t("search_by_last_name")}</InputGroup.Text>
                    </InputGroup>
                    { 
                        Array.isArray(search.options) && search.options.length > 0 && 
                            <ListGroup style={{position: "absolute", zIndex: 100, cursor: "pointer"}}>
                                { 
                                    search.options.map(
                                        (member) => {
                                            return <ListGroup.Item key={member.id} id={member.id} onClick={autoCompleteSelect}>{`${member.last_name} ${member.first_name} (${member.primary_phone})`}</ListGroup.Item>
                                        }
                                    )
                                }
                            </ListGroup>
                    }
                </div>
            </div>
        </div>
    )
}

export default MemberSearch;