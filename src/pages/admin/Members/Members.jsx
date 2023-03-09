import React              from 'react'

import { 
    useCallback, 
    useContext,
    useState, 
    useEffect
}                           from "react";

import { 
    useTranslation 
}                           from "react-i18next";

import { 
    Link 
}                           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import { 
    faHome
}                           from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout        from "../../../layouts/DefaultLayout";

import Alert                from 'react-bootstrap/Alert';
import Table                from 'react-bootstrap/Table';

import Row                  from '../../../helpers/Row';

import QueryBuilder         from '../../../helpers/QueryBuilder';
import AppContext           from '../../../context/AppContext';

import MemberQueryResultRow from './MemberQueryResultRow';

const Members = () => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [query,         setQuery]       = useState();
    const [isLoading,     setIsLoading]   = useState(false);
    const [error,         setError]       = useState();
    const [members,       setMembers ]    = useState();
    const [teams,         setTeams]       = useState([]);
    const [households,    setHouseholds]  = useState([]);
    const [execute,       setExecute]     = useState(false);

    const houseHandler = useCallback(
        async () => {
            const response  = await fetch("/api/v1/households", context.defaultHeaders);

            if( response.ok ) {
                const json = await response.json();

                context.debug("Members", "teamHandler() Response", json);

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    setHouseholds(json.records);
                }
            }
            else {
                setError(response.statusText);
            }
        }
    );

    const teamHandler = useCallback(
        async () => {
            const response  = await fetch("/api/v1/teams", context.defaultHeaders);

            if( response.ok ) {
                const json = await response.json();

                context.debug("Members", "teamHandler() Response", json);

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    setTeams(json.records);
                }
            }
            else {
                setError(response.statusText);
            }
        }
    );

    const memberHandler = useCallback(
        async () => {

            if( execute ) {

                setIsLoading(true);
                setError(null);

                setExecute(false);

                context.debug("Members", "memberHandler()", query);

                const record = {
                    ...context.defaultHeaders,
                    body:    JSON.stringify({ query: query }),
                    method:  "POST"
                };

                const response  = await fetch("/api/v1/search/members", record);

                if( response.ok ) {
                    const json = await response.json();

                    context.debug("Members", "memberHandler() Response", json);

                    if( json.status && (json.status === "error" || json.status === "not_authorized")) {
                        setError(json.message);
                    }
                    else {
                        setMembers(json.records);
                    }
                }
                else {
                    setError(response.statusText);
                }
        
                setIsLoading(false);
            }
        },
        [execute],
    );

    useEffect( 
        () => {
            const wp = setTimeout(
                () => {
                    memberHandler();
                },
                300
            )

            return () => {
                clearTimeout(wp);
            }
            
        }, 
        [memberHandler, query]
    );   
    
    useEffect(
        () => {
            teamHandler();
            houseHandler();
        },
        []
    );

    const setQueryHandler = (data) => {
        context.debug("Members", "setQueryHandler()", data);        
        
        setQuery(data);
    }

    const executeQueryHandler = () => {
        context.debug("Members", "executeQueryHandler()");

        setExecute(true);
    }

    return (
        <DefaultLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/members">{t('members')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/members">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Row />

                <QueryBuilder onSetQuery={setQueryHandler} onExecuteQuery={executeQueryHandler} data={{ teams: teams, households: households }} queryType="member" />

                <Row />

                { error     && <Alert variant="danger">{error}</Alert>  }
                { isLoading && <Alert variant="warn">Loading...</Alert> }

                <Table striped hover>
                    <thead>
                        <tr>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Type</th>
                            <th>Updated at</th>
                        </tr>
                    </thead>

                    <tbody>
                        { 
                            !isLoading && !error && Array.isArray(members) && 
                            members.sort(
                                (a, b) => {
                                    var nameA = (a.last_name || "").toUpperCase(), // ignore upper and lowercase
                                        nameB = (b.last_name || "").toUpperCase(); // ignore upper and lowercase
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .sort(
                                (a, b) => {
                                    var nameA = (a.first_name || "").toUpperCase(), // ignore upper and lowercase
                                        nameB = (b.first_name || "").toUpperCase(); // ignore upper and lowercase
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .map(
                                (member) => {
                                    return (
                                        <MemberQueryResultRow key={member.id} member={member} />
                                    )
                                }
                            )
                        }
                    </tbody>    
                </Table>

                <Row />
            </div>
        </DefaultLayout>
    )
}

export default Members;