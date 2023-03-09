import React              from 'react'

import { useState, useCallback, useEffect }  from "react";
import { Link }           from 'react-router-dom'
import { Fragment } from "react/cjs/react.production.min";

const Member = (props) => {
    const [member,    setMember]    = useState(
        {
            "state":    "",
            "message":  "",
            "object":   {
            }
        }
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);

    const fetchHandler = useCallback(
        async () => {

            if( !props.id ) {
                return;
            } 
            
            setIsLoading(true);
            setError(null);
    
            try {
                const response = await fetch(`http://localhost:8081/member/${props.id}`);
                const data     = await response.json();

                console.log("Member", data);

                if( data.status && data.status === "error") {
                    throw new Error(data.message);
                }
                else {
                    setMember(data.object);
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
        <div className="row">
            <div className="col-12">
                <div className="form-group">
                    <label className="col-form-label" for={props.title}>{props.title}</label>
                    <div className="input-group mb-2 mr-sm-2">
                        { isLoading  && <p>Loading...</p> }            
                        { !isLoading && 
                            <Fragment>
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <Link to={`mailto:${member.email_address}`}><i className="fal fa-envelope-square"></i></Link>
                                    </div>
                                </div>
                                <input className="form-control" id={props.title} value={`${member.first_name || ""} ${member.last_name || ""}`} disabled="disabled" />
                            </Fragment>
                        }
                        { !isLoading && error && <div className="input-group-text text-danger">{error}</div> }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Member;