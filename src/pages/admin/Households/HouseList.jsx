import React from 'react';

import {
    useState,
    useCallback,
    useEffect
}                   from 'react';

import { 
    FontAwesomeIcon 
}                   from '@fortawesome/react-fontawesome'

import { 
    faPlus,
}                   from '@fortawesome/pro-regular-svg-icons';

import Table        from 'react-bootstrap/Table';
import { useTranslation } from 'react-i18next';

const HouseList = (props) => {
    const {t} = useTranslation();

    const debug = (message, extra) => {
        if( extra ) {
            //console.info(`HouseList::${message}`, extra);
        }
        else {
            //console.info(`HouseList::${message}`);
        }
    };

    const [ households, setHouseholds ] = useState([]);
    

    const getListHouseholds = async() => {
        const target = `/api/v1/households`;

        debug("getListHouseholds(REQ): Calling ", target);

        const record = {
            headers: {
                'Content-Type':  "application/json",
                "Accept":        "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        };

        const request  = await fetch(target, record);

        if (request.ok ) {
            const response = await request.json();

            debug("getListHouseholds(RSP)", response);

            if( response.status && response.status === "error") {
                throw new Error(response.message);
            }
            else {
                setHouseholds(response.records);
            }
        }
        else {
            setError( request.statusText );
        }
    }    

    useEffect(
        () => {
            getListHouseholds();
        }, 
        [props.household]
    )

    const selectHouseholdHandler = (event) => {
        debug("selectHouseholdHandler()", event);

        if( props.onSelect ) {
            props.onSelect(event.target.id);
        }
        else {
            console.warn("selectHouseholdHandler(): Missing prop onSelect");
        }
    }

    return (
        <div className="row">
            <div className="col">
                <div style={{ height: (props.height || "200px"), overflowY: "scroll" }}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                            </tr>
                        </thead>
        
                        <tbody>
                            {
                                households.map(
                                    (household) => {
                                        return <tr key={household.id}><td id={household.id} onDoubleClick={selectHouseholdHandler}>{household.name}</td></tr>
                                    }
                                )
                            }
                        </tbody>
                    </Table>        
                </div>
            </div>
        </div>
    )
}

export default HouseList;
