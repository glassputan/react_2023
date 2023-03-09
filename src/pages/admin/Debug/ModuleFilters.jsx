import React              from 'react'

import { 
    useState, 
    useEffect,
    useContext
}                         from "react";

import { useTranslation } from "react-i18next";
import { Link }           from 'react-router-dom'

import Alert              from 'react-bootstrap/Alert';
import Button             from 'react-bootstrap/Button';
import Card               from 'react-bootstrap/Card';
import Table              from 'react-bootstrap/Table';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                         from '@fortawesome/pro-regular-svg-icons'

import AppContext         from '../../../context/AppContext';
import Row                from '../../../helpers/Row';
import NoPanelLayout      from "../../../layouts/NoPanelLayout"

import Logs               from './Logs';

const ModuleFilter = (props) => {
    const module = props.data;

    const {t} = useTranslation();

    const [editing, setEditing ] =  useState(false);

    const editFilter = () => {
        setEditing(!editing);
    }

    const onChangeHandler = (event) => {

        setEditing(false);

        if( props.onChange ) {
            props.onChange(event);
        }
    }

    return (
        <tr >
            <td>{module.name}</td>
            { !editing && <td id={module.id} onDoubleClick={editFilter} className="text-center">{ module.active == "true" ? t("yes") : t("no") }</td> }
            { 
                editing && 
                <td>
                    <select id={module.id} onChange={onChangeHandler} className="form-control" value={module.active}>
                        <option value="true">{t("yes")}</option>
                        <option value="false">{t("no")}</option>
                    </select>
                </td>
            }
        </tr>
    )
}

const ModuleFilters = () => {
    const {t} = useTranslation();

    const context = useContext(AppContext);

    const [error,      setError]      = useState();
    const [filters,    setFilters]    = useState([]);
    const [timeFilter, setTimeFilter] = useState(
        {
            "start": "",
            "end":   ""
        }
    );
    const [expanded,  setExpanded]    = useState(false);

    const getFilter = (filter_id) => {
        let filter = null;

        context.moduleFilters.forEach(
            (item) => {
                if( item.id == filter_id ) {
                    filter = item;
                }
            }
        )

        return filter;
    }
    
    const updateFilterHandler = async (event) => {
        //console.info("updateFilterHandler()", event);

        const record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ module_filter: { ...getFilter(event.target.id), active: event.target.value }}),
            method:  "PATCH"
        };        
    
        const response = await fetch(`/api/v1/module_filter/${event.target.id}`, record);

        if( response.ok ) {
            const json = await response.json();
            
            //console.info("updateFilterHandler: Received...", json);

            if( json.status === "error") { setError(json.message); }
            else { setFilters(json.records); }
        }
        else {
            setError(json.statusText);
        }
    }

    const disableAllHandler = () => {
        context.moduleFilters.map(
            (filter) => {
                updateFilterHandler( { target: { id: filter.id, value: "false" } } );
            }
        )
    }

    const enableAllHandler = () => {
        context.moduleFilters.map(
            (filter) => {
                updateFilterHandler( { target: { id: filter.id, value: "true" } } );
            }
        )
    }

    const showFilterHandler = () => {
        setExpanded( !expanded );
    }

    const updateTimeFilterHandler = (event) => {
        //console.info("updateTimeFilterHandler()", event);

        setTimeFilter(
            {
                ...timeFilter,
                [event.target.id]: event.target.value
            }
        );
    }

    useEffect(
        () => {
            //console.info("useEffect()", context.moduleFilters);
            setFilters(context.moduleFilters);
        },
        [context.moduleFilters]
    )

    return (
        <NoPanelLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/debug">{t('modules')}</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">{t('logs')}</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Card>

                {
                    !expanded && <div className="cardlike-header" onClick={showFilterHandler}><div className="col text-start fs-5">{t("module_filters")}</div></div>
                }

                {
                    expanded && <>
                        <Card.Header onClick={showFilterHandler}>
                            <div className="row">
                                <div className="col text-start fs-5">{t("module_filters")}</div>
                                <div className="col text-end">
                                    <Button variant="success" size="sm" onClick={enableAllHandler} style={{ marginRight: "10px"}}>{t("enable_all")}</Button>
                                    <Button variant="danger"  size="sm" onClick={disableAllHandler}>{t("disable_all")}</Button>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                <div className="col-3">
                                    <div className="row" style={{ marginBottom: "10px"}}>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>{t("timestamp")}</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <label>{t("start")}</label>
                                                        <input type="datetime-local" id="start" className="form-control" value={timeFilter.start} onChange={updateTimeFilterHandler} />
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <label>{t("end")}</label>
                                                        <input type="datetime-local" id="end"   className="form-control" value={timeFilter.end}   onChange={updateTimeFilterHandler} />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                                <div className="col-9">
                                    <Table striped hover>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th className="text-center">Active</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            { 
                                                !error && Array.isArray(filters) &&
                                                filters
                                                    .sort(
                                                        (a, b) => {
                                                            var nameA = (a.name || "").toUpperCase(), // ignore upper and lowercase
                                                                nameB = (b.name || "").toUpperCase(); // ignore upper and lowercase
                                                        
                                                            if (nameA < nameB) { return -1; }
                                                            if (nameA > nameB) { return  1; }
                                                            return 0;
                                                        }
                                                    )                            
                                                    .map(
                                                        (module) => {
                                                            return <ModuleFilter key={module.id} data={module} onChange={updateFilterHandler} />
                                                        }
                                                    )
                                            }

                                            { 
                                                error && 
                                                <tr><td colSpan="2"><Alert variant="danger">{error}</Alert></td></tr>
                                            }
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Card.Body>
                    </>
                }

                </Card>

                <Row />

                <Logs chain={filters} />
            </div>
        </NoPanelLayout>
    )
}

export default ModuleFilters;