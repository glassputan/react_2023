import 
    React,
    { 
        useContext,
        useEffect,
        useState
    }                       from 'react'

import { 
        useTranslation 
    }                       from 'react-i18next';

import Alert                from 'react-bootstrap/Alert';
import Button               from 'react-bootstrap/Button';
import FormControl          from 'react-bootstrap/FormControl';

import AppContext           from '../../context/AppContext';
import NoPanelLayout        from '../../layouts/NoPanelLayout';

const AccountUpdate = () => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    const [account, setAccount] = useState({});
    const [error,   setError]   = useState("");

    const changeHandler = (event) => {
        setAccount(
            {
                ...account,
                [event.target.id]:  event.target.value
            }
        );
    }

    const saveOnEnter = (event) => {
        if(event.nativeEvent.key == "Enter") {
            submitHandler(event);
        }
    }

    const submitHandler = async (event) => {
        event.preventDefault();

        const target  = `/api/v1/account/${context.member.id}`;
        const headers = {
            ...context.defaultHeaders,
            body: JSON.stringify(
                { 
                    "account": { 
                        "password":          account.password,
                        "new_password":      account.new_password,
                        "confirm_password":  account.confirm_password
                    }
                }
            ),
            method:  "PATCH"
        };

        context.debug("AccountUpdate", `submitHandler(): ${headers.method} to ${target}.`, account);

        const response = await fetch(target, headers);

        context.debug("AccountUpdate", "submitHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("AccountUpdate", "submitHandler(2): Received...", json);

            if( json.status === "error") {
                setError(t(json.message));
            }
            else {
                window.location = "/";
            }
        }
        else {
            setError(response.statusText);
        }
    }

    useEffect(
        async () => {
            const token = localStorage.getItem("token");

            if( token ) {
                const response = await fetch('/api/v1/login', context.defaultHeaders);

                if( response.ok ) {
                    const json = await response.json();

                    if( json.status == "ok" && json.member ) {
                        context.setMember(json.member);
                        context.setLocale(json.locale);
                    }
                }
            }
        }, 
        []
    )    

    if( localStorage.getItem("token") ) {
        return (
            <NoPanelLayout>
                <div className={ error.length > 0 ? "row": "row d-none" }>
                    <div className="col-12">
                        <Alert>{error}</Alert>
                    </div>
                </div>

                <div className={ error.length > 0 ? "row": "row d-none" }>
                    <div className="col-12">&nbsp;</div>
                </div>

                <form>
                    <FormControl type="hidden" id="emailfield" value={ context.member ? context.member.full_name : "" } autoComplete="username" />

                    <div className="news page-header">
                        <div className="row">
                            <div className="col-12">
                                <h2 className="text-center">Password change for { context.member ? context.member.full_name : "" }</h2>
                            </div>
                        </div>

                        <div className="row"><div className="col-1">&nbsp;</div></div>
        
                        <div className="row">
                            <div className="col-1">&nbsp;</div>        
                            <div className="col-12 col-md-2">{t("password")}</div>
                        </div>
                        <div className="row">
                            <div className="col-1">&nbsp;</div>        
                            <div className="col-12 col-md-2"><FormControl type="password" id="password" autoComplete="current-password" onChange={changeHandler} /></div>
                        </div>
        
                        <div className="row"><div className="col-12">&nbsp;</div></div>
        
                        <div className="row">
                            <div className="col-1">&nbsp;</div>        
                            <div className="col-12 col-md-2">{t("password_new")}</div>
                        </div>
                        <div className="row">
                            <div className="col-1">&nbsp;</div>        
                            <div className="col-12 col-md-2"><FormControl type="password" id="new_password" autoComplete="new-password" onChange={changeHandler} /></div>
                        </div>
        
                        <div className="row"><div className="col-12">&nbsp;</div></div>
        
                        <div className="row">
                            <div className="col-1">&nbsp;</div>        
                            <div className="col-12 col-md-2">{t("password_confirm")}</div>
                        </div>
                        <div className="row">
                            <div className="col-1">&nbsp;</div>        
                            <div className="col-12 col-md-2"><FormControl type="password" id="confirm_password" autoComplete="new-password" onChange={changeHandler} onKeyUp={saveOnEnter} /></div>
                        </div>
        
                        <div className="row"><div className="col-12">&nbsp;</div></div>
        
                        <div className="row">
                            <div className="col-1">&nbsp;</div>    
                            <div className="col-12 col-md-2"><Button onClick={submitHandler}>{t("submit")}</Button></div>
                        </div>
                    </div>
                </form>
            </NoPanelLayout>
        )        
    }
    else {
        return <h1>Cannot find User token; see localStorage</h1>;
    }    


}

export default AccountUpdate;