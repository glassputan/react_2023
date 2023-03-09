import React            from 'react';

import { 
    useContext,
    useEffect,
    useState
}                         from 'react';

import { 
    useTranslation 
}                         from 'react-i18next';

import AppContext         from '../../context/AppContext';

import Errors             from '../../helpers/Errors';

import { 
    FacebookProvider, 
    Page
}                         from 'react-facebook';

function Facebook(props) {
    const { t }   = useTranslation();
    const context = useContext(AppContext);

    const [ error, setError ] = useState();
    const [ isProduction, setProduction] = useState(true);
    
    const getServiceStatus = async () => {
        setError(null);

        const response  = await fetch("/api/v1/system/status");

        context.debug("Facebook", "getServiceStatus()", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Facebook", "getServiceStatus()", json);

            //setProduction( json.environment == "production" );
        }
    };

    useEffect( 
        () => {
            getServiceStatus();
        }, 
        []
    );    

    if( error ) {
        return <Errors messages={[error]}/>
    }
    else if( isProduction ) {
        return (
            <div className="row d-none d-md-block d-lg-block d-xl-block">
                <div className="col quicklink">
                    <FacebookProvider appId="1563306717302838">
                        <Page href="https://www.facebook.com/hulmevillesoccer" tabs="timeline" adaptContainerWidth={true} smallHeader={true} hideCover={true} />
                    </FacebookProvider>
                </div>
            </div>
        )
    }
    else {
        return <strong>{t('facebook_suppressed')}</strong>
    }
}

export default Facebook;