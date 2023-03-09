import React from 'react';

import {
    useCallback,
    useContext,
    useEffect,
    useState
}                                        from 'react';

import { 
    useNavigate 
}                                        from 'react-router';

import { 
    useTranslation 
}                                        from 'react-i18next';

import Button                            from 'react-bootstrap/Button';

import { FontAwesomeIcon }               from '@fortawesome/react-fontawesome';
import { 
    faFacebookF 
}                                        from '@fortawesome/free-brands-svg-icons';

import { 
    faEnvelopeOpen
}                                        from '@fortawesome/pro-regular-svg-icons';

import Article                           from "../../pages/public/Article";

import Errors                            from '../../helpers/Errors';
import Row                               from '../../helpers/Row';

import DefaultLayout                     from '../../layouts/DefaultLayout';

import AppContext                        from '../../context/AppContext';
import WithEmailModal                    from './WithEmailModal';

import { ColorScheme } from 'react-facebook';

const Login = (props) => {
    const context  = useContext(AppContext);
    const navigate = useNavigate();

    const [errors,      setErrors]       = useState([]);
    const [isVisible,   setModalVisible] = useState(false);
    const [credentials, setCredentials ] = useState();
    

    const {t} = useTranslation();

    const setError = (message) => {
        setErrors( [ ...errors, message ]);
    }

    const doEmailLogin = useCallback(
        async () => {
            setErrors([]);

            if( credentials ) {
                setModalVisible(false);

                context.debug("Login", "doEmailLogin()", credentials);

                const record = {
                    ...context.defaultHeaders,
                    body:    JSON.stringify( credentials ),
                    method:  "POST"
                };

                const response  = await fetch("/api/v1/auth/email", record);

                if(response.ok) {
                    const json = await response.json();

                    context.debug("Login", "doEmailLogin() Response", json);

                    switch(json.status) {
                        case "error":
                            setError(json.message);
                            break;
                        case "unauthorized":
                            if(json.token) { 
                                context.setUserToken( json.token );
                            }
                            
                            if( json.message != "login_invalid" && json.location.length > 0 ) {
                               window.location=json.location;
                            }
                            else {
                                setError(t(json.message));
                            }
                            break;
                        default:
                            context.debug("Login", "doEmailLogin()", json);

                            context.setUserToken( json.token );
    
                            context.debug("Login", "doEmailLogin(): Redirecting to", json.location);                    
                            navigate(json.location);
                            break;
                    }
                }
                else {
                    setErrors([response.statusText]);
                }
            }
        },
        [credentials]
    );

    const handleEmailLogin = (creds) => {
        context.debug("Login", "handleEmailLogin()", creds);

        setModalVisible(false);
        setCredentials(creds);
    }

    useEffect(
        () => {
            if(credentials)
                doEmailLogin();
        }, 
        [credentials]
    )
    
    const facebookLogin = () => {

    }

    const createAccount = () => {

    }

    const responseGoogle = (response) => {
        context.debug("Login", "responseGoogle()", response);

    }

    const showEmailModalLogin = () => {
        setModalVisible(true);
    }

    const hideEmailModalLogin = () => {
        setModalVisible(false);
    }    

    return (
        <DefaultLayout>
            <Row />

            <div className="news page-header">
                <div className="row">
                    <div className="col">
                        <h2 className="text-center">Log in</h2>
                    </div>
                </div>

                <Row />

                <Errors messages={errors} />

                <div className="row">
                    <div className="col-1">&nbsp;</div>        
                    <div className="col-11 col-md-5">
                        <h3>{t("administrator_login")}</h3>
                        <hr/>
                        <div className="row d-none">
                            <div className="col">
                                { /* Google Login here */ }
                            </div>
                        </div>

                        <div className="row d-none">
                            <div className="col">
                                <Button className="btn-block btn-social btn-facebook" onClick={facebookLogin}>
                                    <FontAwesomeIcon icon={faFacebookF} className="inside" /> {t("facebook_signin")}
                                </Button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <Button className="btn-block btn-social btn-github" onClick={showEmailModalLogin}>
                                    <FontAwesomeIcon icon={faEnvelopeOpen} className="inside" /><span>{t("email_signin")}</span>
                                </Button>
                            </div>
                        </div>                        
                        <Row /> 
                        <div className="row">
                            <div className="col">
                                    <div className="btn btn-default btn-login">
                                        { t("password_forget") }
                                    </div>
                            </div>
                        </div>                                    
                        <Row />

                    </div>
                    <div className="col-11 col-md-5">
                        <h3>Members</h3>
                        <hr/>
                        <Article title="Member Login" />
                    </div>
                    <div className="col-11 col-md-5 d-none">

                        <h3>New Members</h3>
                        <hr/>
                        <div className="row">
                            <div className="col">
                                <Errors messages={errors} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <form name="myForm">
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="input-group mb-3">
                                                <input type="text" required={true} ng-model="user.first_name" className="form-control" placeholder="First name" aria-label="first_name" />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <input type="text" required={true} ng-model="user.last_name" className="form-control" placeholder="Last name" aria-label="last_name"  />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="input-group mb-3">
                                                <input type="text" required={true} ng-model="user.address_line1" className="form-control" placeholder="Address" aria-label="address" />
                                            </div>
                                        </div>
                                    </div>                
                                    <div className="row">
                                        <div className="col">
                                            <div className="input-group mb-3">
                                                <input type="text" ng-model="user.address_line2" className="form-control" placeholder="Address" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-8">
                                            <div className="input-group mb-3">
                                                <input type="text" required={true}  ng-model="user.city" className="form-control" placeholder="City" />
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="input-group mb-3">
                                                <input type="text" required={true}  ng-model="user.state" className="form-control" placeholder="State" />
                                            </div>
                                        </div>
                                    </div>                
                                    <div className="row">
                                        <div className="col">
                                            <div className="input-group mb-3">
                                                <input required={true} type="text" ng-model="user.zip_code"  className="form-control" placeholder="Zip code" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="input-group mb-3">
                                                <input type="tel" required={true}  ng-model="user.mobile_phone" className="form-control phone" placeholder="Phone number" />
                                            </div>
                                        </div>
                                    </div>                
                                    <div className="row">
                                        <div className="col">
                                            <div className="input-group mb-3">
                                                <input type="email" ng-model="user.email" className="form-control" placeholder="email" aria-label="email" aria-describedby="email" required={true} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">@</span>
                                                </div>
                                            </div>
                                            <small id="emailHelp" className="form-text text-muted">We'll never share your email or phone number with anyone else.</small>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-md-6">
                                            <Button variant="primary" onClick={createAccount}>Create Account</Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <Row />
                    </div>
                    <div className="col-1">&nbsp;</div>
                </div>
            </div>   

            <WithEmailModal onLogin={handleEmailLogin} isVisible={isVisible} onModalClose={hideEmailModalLogin} />

        </DefaultLayout>

        
    )
}

export default Login;