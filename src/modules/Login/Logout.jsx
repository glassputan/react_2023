import React            from 'react'
import { 
    useEffect,
    useContext 
}                       from 'react'

import {
    useNavigate
}                       from 'react-router-dom';

import { 
    useTranslation 
}                       from 'react-i18next';

import AppContext       from '../../context/AppContext'

const Logout = () => {
    const context = useContext(AppContext);

    const {t} = useTranslation();

    useEffect(
        () => {
            context.setMessage(t("thanks_for_coming"));
            
            context.doLogout();

            window.location = "/";
        }, 
        []
    )

    return (
        <NoPanelLayout>
            <h2>{t("logout_successful")}</h2>
        </NoPanelLayout>
    )
}

export default Logout;