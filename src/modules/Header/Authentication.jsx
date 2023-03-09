import 
    React,
    { 
        useContext,
        useEffect
    }                       from 'react';

import { useTranslation }   from 'react-i18next';
import { Link }             from 'react-router-dom';

import AppContext           from '../../context/AppContext'

function Authentication(props) {
    const context = useContext(AppContext);

    const { t } = useTranslation();

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
        return <><span>{ context.member ? context.member.full_name : "" }</span><span style={{ marginLeft: "10px"}}><Link to="/logout">{ t('logout') }</Link></span></>;
    }
    else {
        return <span style={{ marginLeft: "5px"}}><Link to="/login" className="btn btn-sm btn-primary">{ t('login') }</Link></span>;
    }
}

export default Authentication;