import React            from 'react'

import { Fragment }     from 'react';
import Header           from '../modules/Header/Header';
import Footer           from '../pages/public/Footer';

const NoPanelLayout = (props) => {
    return (
        <Fragment>
            <div className="site">
                <div className="row">
                    <div className="col">
                        <Header />
                        <div className="row body">  
                            <div className="col">
                                <div>
                                    { props.children }
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <Footer />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default NoPanelLayout;