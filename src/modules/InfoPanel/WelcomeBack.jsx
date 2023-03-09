import React, { useContext }    from 'react'
import { useTranslation }       from 'react-i18next';

import AppContext               from '../../context/AppContext'

const WelcomeBack = () => {   
    const { t } = useTranslation();

    const ctx = useContext(AppContext)

    let message = <div>&nbsp;</div>

    if( ctx.member ) {
        message = (
            <>
                <div className="row">
                    <div className="col">&nbsp;</div>
                </div>

                <div className="row">
                    <div className="col quicklink-inverted d-none d-md-block d-lg-block d-xl-block">
                        <ul>{ t('welcome_back') + " " + ctx.member.first_name }</ul>
                    </div>
                </div>             
            </>
        );
    }
    // else {
    //     message = (
    //         <>
    //             <div className="row">
    //                 <div className="col">&nbsp;</div>
    //             </div>

    //             <div className="row">
    //                 <div className="col quicklink-inverted">
    //                     <pre>{ JSON.stringify(ctx, null, 4) }</pre>
    //                 </div>
    //             </div>             
    //         </>
    //     );        
    // }

    return <>{message}</>;
}

export default WelcomeBack;