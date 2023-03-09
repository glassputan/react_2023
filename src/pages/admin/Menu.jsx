import React, { useContext, useState }    from 'react';

import Button       from 'react-bootstrap/Button'

import { 
    Link,
    useNavigate 
}                   from 'react-router-dom';

import { 
    useTranslation 
}                   from 'react-i18next';

import Row          from '../../helpers/Row';
import AppContext   from '../../context/AppContext';

import { 
    FontAwesomeIcon 
}                   from '@fortawesome/react-fontawesome';

import { 
    faHome 
}                   from '@fortawesome/pro-regular-svg-icons';

const Menu = () => {
    const {t} = useTranslation();

    const context  = useContext(AppContext);
    const navigate = useNavigate();

    const updateField = async (fieldStatus) => {
        context.debug("Menu", "closeFields", "updateFieldStatus()");

        const parameters = {
            ...context.defaultHeaders,
            body:    JSON.stringify( 
                { 
                    control: { 
                        field_status:         fieldStatus == "open" ? "o" : "c",
                        field_status_message: fieldStatus == "open" ? t("fields_open_message") : t("fields_closed_message")
                        } 
                }
            ),
            method:  "POST"
        }

        const request    = await fetch("/api/v1/control", parameters);

        if( request.ok ) {
            const response   = await request.json();

            context.debug("FieldStatus", "updateFieldStatus()", response);

            if(response.status && response.status == "error" ) {
                context.error("Menu", "closeFields", response.message);
            }
            else {
                context.debug("Menu", "closeFields", response);
                navigate("/");
            }    
        }
    }

    const closeFieldHandler = (event) => {
        updateField("close")
    }

    const openFieldHandler = (event) => {
        updateField("open");
    }

    return(
        <div>
            <Row />

            <div className="row">
                <div className="col">
                    <Link to="/"><FontAwesomeIcon icon={faHome} size="2x" /></Link>
                </div>
                <div className="col text-end">
                    <h5>{t("admin_menu")}</h5>
                </div>
            </div>

            <Row />

            <div className="d-grid gap-2">
                <Button size="lg">{t("members")}</Button>
                <Button size="lg">{t("teams")}</Button>
                <Button size="lg">{t("games")}</Button>
                <Row />
                <Button size="lg" variant="danger"  onClick={closeFieldHandler}>{t("close_fields")}</Button>
                <Button size="lg" variant="success" onClick={openFieldHandler}>{t("open_fields")}</Button>
                <Row />
            </div>
        </div>
    )
}

export default Menu;