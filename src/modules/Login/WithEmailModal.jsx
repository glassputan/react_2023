import React        from 'react'
import { 
    useContext,     
    useReducer, 
    useRef 
}                   from 'react'
import { 
    useTranslation 
}                   from 'react-i18next';

import Input        from '../../helpers/Input/Input'
import Row          from '../../helpers/Row'

import { 
    FontAwesomeIcon 
}                   from '@fortawesome/react-fontawesome';

import { 
    faLock,
    faAt
}                   from '@fortawesome/pro-regular-svg-icons';

import Button       from 'react-bootstrap/Button';
import Modal        from 'react-bootstrap/Modal';
import AppContext   from '../../context/AppContext';


const WithEmailModal = props => {
    const context   = useContext(AppContext);
    const {t}       = useTranslation();
    
    const [ credentials, dispReadyToLogin ] = useReducer(
        ( state, action ) => {
            let email               = state.email, 
                password            = state.password, 
                isEmailValid        = state.isEmailValid, 
                isPasswordValid     = state.isPasswordValid;
            
            switch(action.type) {
                case "USER_EMAIL_INPUT":
                    email        = action.value;
                    isEmailValid = action.value.includes("@");
                    break;
                case "USER_PASS_INPUT":
                    password        = action.value;
                    isPasswordValid = action.value.length > 5;
                    break;
                default:
                    break;
            }
    
            const isFormValid = state.email.length > 0 && state.password.length > 0 && isEmailValid && isPasswordValid;
    
            return { email: email, password: password, isEmailValid: isEmailValid, isPasswordValid: isPasswordValid, isFormValid: isFormValid }
        }, 
        { email: "", password: "", isEmailValid: true, isPasswordValid: true, isFormValid: true }
    );
    
    const emailChangeHandler = (event) => {
        dispReadyToLogin( 
            { 
                "type": 'USER_EMAIL_INPUT', 
                "value": event.target.value 
            } 
        )
    }

    const passChangeHandler = (event) => {
        dispReadyToLogin( 
            { 
                "type": 'USER_PASS_INPUT',  
                "value": event.target.value 
            } 
        )
    }

    const inputHandler = () => {
        dispReadyToLogin(
            { 
                "type": 'INPUT_BLUR' 
            }
        )
    }

    const submitHandler = (event) => {
        event.preventDefault();

        context.debug("WithEmailModal", "submitHandler()", event);

        if( credentials.isFormValid ) {
            props.onLogin(credentials);
        }
        else {
            context.debug("WithEmailModal", "submitHandler(): Form does not appear to be valid.");
        }
    }

    const emailField = useRef();
    const passField  = useRef();

    return (
        
            <Modal show={props.isVisible} onHide={props.onModalClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{t("login")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="g-3 needs-validation" noValidate onSubmit={submitHandler} >
                        <div className="row">
                            <div className="col-12">
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><FontAwesomeIcon icon={faAt} size="2x" /></span>
                                    </div>
                                    <Input  value={credentials.email}
                                            ref={emailField}
                                            type="email" 
                                            id="email"                                         
                                            isValid={credentials.isEmailValid}
                                            onChange={emailChangeHandler}
                                            onBlur={inputHandler}
                                        />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><FontAwesomeIcon icon={faLock} size="2x" /></span>
                                    </div>
                                    <Input  type="password" 
                                            id="password"
                                            ref={passField}                                        
                                            isValid={credentials.isPasswordValid}
                                            value={credentials.password}
                                            onChange={passChangeHandler}
                                            onBlur={inputHandler}
                                        />
                                </div>
                            </div>
                        </div>
                        <Row align="right">
                            <Button variant="secondary" onClick={props.onModalClose}>{t("close")}</Button>
                            {  credentials.isFormValid && <Button variant="primary" type="submit">{t("login")}</Button> }
                            { !credentials.isFormValid && <Button variant="primary" disabled>{t("login")}</Button> }
                        </Row>
                    </form>
                </Modal.Body>
            </Modal> 
        
    )
}

export default WithEmailModal;