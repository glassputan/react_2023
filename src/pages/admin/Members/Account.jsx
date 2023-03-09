import React    from 'react';

import { 
    useState,
    useEffect,
    useContext
}               from 'react';

import { 
    useTranslation 
}                   from 'react-i18next';

import { 
    FontAwesomeIcon 
}                   from '@fortawesome/react-fontawesome';

import { 
    faSave 
}                   from '@fortawesome/pro-regular-svg-icons';

import Alert        from 'react-bootstrap/Alert';
import Button       from 'react-bootstrap/Button';
import Card         from 'react-bootstrap/Card';
import Form         from 'react-bootstrap/Form';
import InputGroup   from 'react-bootstrap/InputGroup';

import Row          from '../../../helpers/Row';
import AppContext   from '../../../context/AppContext';
import UserModel    from '../../../models/UserModel';


const Account = (props) => {
    const context = useContext(AppContext);
    context.debug = console.debug;
    
    const [isUpdate, setUpdate  ]  = useState(false);
    const [user,     setUser    ]  = useState( new UserModel() );
    const [member,   setMember  ]  = useState(props.member);
    const [password, setPassword]  = useState("");
    const [isAdmin,  setAdmin]     = useState(false);

    const {t} = useTranslation();

    const setError = (message) => {
        if(props.onError) {
            props.onError(message);
        }
    }   

    const setSuccess = (message) => {
        if(props.onSuccess) {
            props.onSuccess(message);
        }
    }

    const renderErrors = (errors) => {
      // console.info("renderErrors()", errors);

        return (
            <ul>
                {
                    Object.keys(errors).map(
                        (field) => {

                          // console.info("renderErrors()", field);

                            return errors[field].map(
                                (error) => {

                                    return <li>{field} {error}</li>
                                }
                            )
                            
                        }
                    )
                }
            </ul>            
        )
    }    

    const onChangeValue = (event) => {
      // console.info("onChangeValue()", event);

        const value = event.target.type == "checkbox" ? event.target.checked : event.target.value;

        setUser(
            {
                ...user,
                [event.target.id]: value
            }
        )
    }

    const onChangePassword = (event) => {
        setPassword(event.target.value);

        setUser(
            {
                ...user,
                password: event.target.value,
                password_confirm: event.target.value
            }
        );
    }

    const onChangeAdmin = (event) => {
        setAdmin(event.target.value);
    }    

    const getUserRecord = async () => {
        setError(null);

        if( member.id && member.id != "" ) {
            const targetUrl = `/api/v1/user/${member.id}`;

            const request  = await fetch(targetUrl, context.defaultHeaders);

            if( request.ok ) {
                const response = await request.json();

                context.debug("getUserRecord() Response", response);

                if( response.status && response.status === "error") {
                    setError(response.message);
                }
                else {

                    if( response.record ) {
                        const record = {
                            ...response.record,
                            last_login: context.getFormattedDate(response.record.last_login)
                        }

                        setAdmin(response.is_admin);
                        setUser(record);

                        if( response.record.last_login )
                            setUpdate(true);
                    }
                }
            }
            else {
                setError(request.statusText);
            }
        }
    }

    const saveUserHandler = async () => {

        let headers  = {
            ...context.defaultHeaders,
            body: JSON.stringify({ user: user }),
            method: "POST"
        }

        let targetURL = "/api/v1/user";

        if( isUpdate ) {
            targetURL = `/api/v1/user/${user.id}`

            headers = {
                ...headers,
                method: "PATCH"
            }
        }

        const response = await fetch(targetURL, headers);

        context.debug("Account", "saveUserHandler()", response);

        if(response.ok) {
            const json = await response.json();

            context.debug("Account", "saveUserHandler()", json);

            if( json.status === "error" ) {                
                setError(renderErrors(json.errors));
            }
            else {
                setSuccess(t("record_updated"));
            }
        }
        else {
            setError(response.statusText);
        }
    }

    useEffect(
        () => {
            getUserRecord();
        },
        [member]
    )

    useEffect(
        () => {
            setMember(props.member)
        },
        [props.member]
    )

    return (
        <div className="row">
            <div className="col-12">
                <Card style={{ width: '100%' }}>
                    <Card.Header className="text-end" >
                        <Button onClick={saveUserHandler}><FontAwesomeIcon icon={faSave} />&nbsp;&nbsp;{user && user.password_digest ? t("update"): t("create") }</Button>
                    </Card.Header>
                    <Card.Body>
                        <div className="row">
                            <div className="col-12">
                                { !isUpdate && <Alert>User cannnot login</Alert> }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3">
                                <Form.Label htmlFor="login">{t("email")}</Form.Label>
                                <Form.Control type="text" id="account_email" value={user.email} onChange={onChangeValue} disabled />
                            </div>
                            <div className="col-5">
                                <div className="col-6" style={{ marginTop: "25px" }}> 
                                    <InputGroup style={{ wrap: "none"}}>
                                        <InputGroup.Text>{t("admin")}</InputGroup.Text>
                                        <InputGroup.Checkbox id="admin" value={isAdmin} onChange={onChangeAdmin}  checked={isAdmin} />
                                    </InputGroup>
                                </div>
                            </div>                            
                            <div className="col-4">
                                <div className="form-group">
                                    <Form.Label htmlFor="last_login">{t("last_login")}</Form.Label>
                                    <div className="rails-bootstrap-forms-date-select">
                                        <Form.Control type="date" id="last_login" disabled value={user.last_login} onChange={onChangeValue} />
                                    </div>
                                </div>
                            </div> 
                        </div>
                        <Row />                        
                        <div className="row">
                            <div className="col-3">
                                <Form.Label htmlFor="password">{t("password")}</Form.Label>
                                <Form.Control type="password" id="password" value={password} onChange={onChangePassword} />                                                                    
                            </div>
                            <div className="col-2" style={{ marginTop: "25px" }}> 
                                <InputGroup style={{ wrap: "none"}}>
                                    <InputGroup.Text>{t("lock_out")}</InputGroup.Text>
                                    <InputGroup.Checkbox id="locked_out" value={user.locked_out} onChange={onChangeValue}  checked={user.locked_out}/>
                                </InputGroup>
                            </div>
                            <div className="col-3" style={{ marginTop: "25px" }}> 
                                <InputGroup>                                
                                    <InputGroup.Text>{t("must_change_password")}</InputGroup.Text>
                                    <InputGroup.Checkbox id="must_change_password" onChange={onChangeValue} checked={user.must_change_password} />
                                </InputGroup>
                            </div>
                            <div className="col-4">
                                <Form.Label>{t("updated_at")}</Form.Label>
                                <Form.Control type="datetime-local" disabled={true} value={context.getFormattedDateTimeLocale(user.updated_at)} />
                            </div>
                        </div>


                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}

export default Account;
