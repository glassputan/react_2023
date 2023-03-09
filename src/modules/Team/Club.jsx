import React              from 'react'

import { 
    Fragment,
    useState,
    useCallback,
    useEffect 
}                           from "react";
import { 
    useParams 
}                           from "react-router-dom"
import { useTranslation }   from "react-i18next";

import Row                  from '../../helpers/Row'

const Club = (props) => {
    const {t} = useTranslation();

    const params = useParams();

    const [club, setClub] = useState(
        {
            "status":               "",
            "message":              "",
            "id":                   -1,
            "name":                 ""
        }
    )
    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);

    const fetchHandler = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);
    
            try {
                const response = await fetch(`http://localhost:8081/club/${props.id}`);
                const data     = await response.json();

                console.log("Club", data);

                if( data.status && data.status === "error") {
                    throw new Error(club.message);
                }
                else {    
                    setClub(data.object);
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
        <Fragment>
            { isLoading  && <Row><p>Loading...</p></Row>       }
            { !isLoading && error && <Row><p className="text-danger">{error}</p></Row> }
            { !isLoading && !error && <Row>{club.name}</Row>   }
        </Fragment>
    )
}

export default Club;