import React            from 'react'

import { 
    useState,
    useEffect
}                       from 'react';

import Alert            from 'react-bootstrap/Alert';

import Header           from '../modules/Header/Header';
import Footer           from '../Footer';
import InfoPanel        from '../modules/InfoPanel/InfoPanel';

import ErrorBoundary    from 'antd/lib/alert/ErrorBoundary';
import background       from '../../../assets/images/background.png'

import Row           from '../helpers/Row';

const DefaultLayout = (props) => {
    const [errors, setErrors] = useState([]);

    const setErrorHandler = (error) => {
        setErrors([ ...errors, error]);
    }

    useEffect(
        () => {
            setErrors([]);
        }, 
        []
    )

    return (
        <ErrorBoundary>
            <div className="site" style={{ backgroundImage: background }}>
                <div className="row">
                    <div className="col">
                        <Header onSetError={setErrorHandler} />
                        <div className="row body">  
                            <div className="col-9">                               
                                { 
                                    errors.length > 0 && <div><Row />{ errors.map( (error, index) => <Alert key={index} variant="danger">{error}</Alert>) }</div>
                                }

                                <div>{ props.children }</div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <InfoPanel onSetError={setErrorHandler} />
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
        </ErrorBoundary>
    )
}

export default DefaultLayout;