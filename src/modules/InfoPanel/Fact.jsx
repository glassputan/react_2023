import React          from 'react';
import { 
    Fragment,
    useState,
    useCallback,
    useEffect 
}                           from "react";
// import { 
//     useParams 
// }                           from "react-router-dom"
import { 
    useTranslation 
}                           from "react-i18next";
import Row                  from '../../helpers/Row'
import Errors               from '../../helpers/Errors'

const Fact = () => {
    const debug = (fn, message) => {
        
        return;
      // console.info(`Fact::${fn}`, message);
    }

    const {t} = useTranslation();

    const [fact,      setFact      ] = useState({ "message": "" });
    const [isLoading, setIsLoading ] = useState(false);
    const [error,     setError     ] = useState(null);

    const fetchHandler = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);
    
            try {
                const request  = await fetch(`/api/v1/facts/random`);
                const response = await request.json();

                debug("fetchHandler()", response);

                setFact(response);
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
            <div className="row">
                <div className="col quicklink">
                    <ul>{ t('did_you_know') }</ul>
                </div>
            </div>

            { isLoading  &&  <Row>Loading...</Row>               }
            { !isLoading && !error && <Row>{fact.message}</Row>  }
            { !isLoading && error  && <Errors messages={[error]} />  }
        </Fragment>
    )
}

export default Fact;