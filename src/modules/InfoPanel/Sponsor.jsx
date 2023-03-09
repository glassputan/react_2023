import React          from 'react';
import { 
    Fragment,
    useState,
    useCallback,
    useEffect,
    useContext 
}                           from "react";

import { 
    useTranslation 
}                           from "react-i18next";

import SponsorModel         from '../../models/SponsorModel';
import Row                  from '../../helpers/Row'
import Errors               from '../../helpers/Errors'
import AppContext           from '../../context/AppContext';


const Sponsor = () => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [sponsor,   setSponsor   ] = useState(new SponsorModel());
    const [isLoading, setIsLoading ] = useState(false);
    const [error,     setError     ] = useState(null);
    const [image,     setImage     ] = useState("");

    const getSponsorHandler = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);
    
            try {
                const request  = await fetch("/api/v1/sponsor/random");

                if( !request.ok ) {
                    console.error("getSponsorHandler()", request.statusText);
                    return;
                }

                const response = await request.json();

                context.debug("Sponsor", "getSponsorHandler()", response);

                setSponsor(context.deNullObject(response.record));
                setImage(response.image_url);
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
            getSponsorHandler();
        }, 
        [getSponsorHandler]
    );     

    return (
        <Fragment>
            <div className="row info-panel-section">
                <div className="col quicklink">
                    <ul>{ t('thank_a_sponsor') }</ul>
                </div>
            </div>

            { isLoading  &&  <Row>Loading...</Row>               }

            { 
                !isLoading && !error && image && sponsor.company_url &&
                <Row>
                    <a href={sponsor.company_url} target="_blank">
                        <img style={{ marginBottom: "10px" }} src={image} alt={sponsor ? sponsor.company_name : ""} className="image-fluid" width="100%" />
                    </a>
                </Row>
            }

            { 
                !isLoading && !error && !image && sponsor.company_url && 
                <Row>
                    <a href={sponsor.company_url} target="_blank">
                        <div className="sponsor-div"><br/>{ sponsor ? sponsor.company_name : "" }</div>
                    </a>
                </Row>
            }

{ 
                !isLoading && !error && image && !sponsor.company_url &&
                <Row>
                    <img style={{ marginBottom: "10px" }} src={image} alt={sponsor ? sponsor.company_name : ""} className="image-fluid" width="100%" />
                </Row>
            }

            { 
                !isLoading && !error && !image && !sponsor.company_url && 
                <Row>
                    <div className="sponsor-div"><br/>{ sponsor ? sponsor.company_name : "" }</div>
                </Row>
            }            

            { !isLoading && error  && <Errors messages={[error]} />  }
        </Fragment>
    )
}

export default Sponsor;