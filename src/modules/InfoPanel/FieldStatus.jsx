import React              from 'react'

import { 
    useCallback,
    useEffect,
    useContext,
    useState
}                         from 'react';

import { 
    useTranslation 
}                         from 'react-i18next';

import Alert              from 'react-bootstrap/Alert';
import Button             from 'react-bootstrap/Button';
import ButtonGroup        from 'react-bootstrap/ButtonGroup';
import Form               from 'react-bootstrap/Form';

import AppContext         from '../../context/AppContext';

import SystemPropertyModel from '../../models/SystemPropertyModel';

function FieldStatus() {
    const { t } = useTranslation();

    const context = useContext(AppContext);

    const [ isEditable,   setEditable ] = useState(false);    

    const [ error,        setError        ] = useState();
    const [ fieldStatus,  setFieldStatus  ] = useState( new SystemPropertyModel() );
    const [ fieldMessage, setFieldMessage ] = useState( new SystemPropertyModel() );
    const [ needsUpdate,  setNeedsUpdate  ] = useState(false);

    const closeFieldStatusHandler = () => {
        setFieldStatus(
            {
                ...fieldStatus,
                value: "closed"
            }
        );

        setFieldMessage(
            {
                ...fieldMessage,
                value: t("fields_closed_message")
            }
        );

        setEditable( false );
    }

    const openFieldStatusHandler = () => {
        setFieldStatus(
            {
                ...fieldStatus,
                value: "true"
            }
        );

        setFieldMessage(
            {
                ...fieldMessage,
                value: t("fields_open_message")
            }
        );

        setEditable( false );
    }

    const setCustomMessageHandler = (event) => {
        context.debug("FieldStatus", "setCustomMessageHandler()", event);

        setFieldMessage(
            {
                ...fieldMessage,
                value: event.target.value
            }
        );
    }

    const onEnterStopEdit = (event) => {
        if(event.nativeEvent.key == "Enter") {
            setEditable( false );
        }
    }

    const handleDblClickEvent = () => {
        if( context.isAdmin ) {
            setEditable( !isEditable );
        }
    }

    const getFieldStatus = useCallback(
        async () => {
            const response   = await fetch("/api/v1/system/property?name=field_status");

            context.debug("FieldStatus", "getFieldStatus()", response);

            if( response.ok ) {
                const json  = await response.json();

                context.debug("FieldStatus", "getFieldStatus()", json);

                if(json.status == "error") {
                    setError(json.message);
                }
                else {
                    setFieldStatus(json.record);                    
                }
            }
            else {
                setError(response.statusText);
            }
        },
        []
    );

    const getFieldMessage = useCallback(
        async () => {
            const response   = await fetch("/api/v1/system/property?name=field_message");

            context.debug("FieldStatus", "getFieldMessage()", response);

            if( response.ok ) {
                const json  = await response.json();

                context.debug("FieldStatus", "getFieldMessage()", json);

                if(json.status == "error") {
                    setError(json.message);
                }
                else {
                    setFieldMessage(json.record);
                }
            }
            else {
                setError(response.statusText);
            }
        },
        []
    );

    const updateFieldStatus = async () => {
        context.debug("FieldStatus", "updateFieldStatus()");

        if( fieldStatus.id ) {
            const parameters = {
                ...context.defaultHeaders,
                body:    JSON.stringify( { property: fieldStatus } ),
                method:  "PATCH"
            }

            const response    = await fetch(`/api/v1/system/property/${fieldStatus.id}`, parameters);

            if( response.ok ) {
                const json   = await response.json();

                context.debug("FieldStatus", "updateFieldStatus()", json);

                if(json.status == "error") {
                    context.debug("FieldStatus", json.message);
                }
                else {
                    context.debug("FieldStatus", "updateFieldStatus()", json);
                    setFieldStatus(json.record);
                }
            }
        }
    }

    const updateFieldMessage = async () => {
        context.debug("FieldStatus", "updateFieldMessage()");

        if( fieldMessage.id ) {
            const parameters = {
                ...context.defaultHeaders,
                body:    JSON.stringify( { property: fieldMessage } ),
                method:  "PATCH"
            }

            const response    = await fetch(`/api/v1/system/property/${fieldMessage.id}`, parameters);

            if( response.ok ) {
                const json   = await response.json();

                context.debug("FieldStatus", "updateFieldMessage()", json);

                if(json.status == "error") {
                    context.debug("FieldStatus", json.message);
                }
                else {
                    context.debug("FieldStatus", "updateFieldMessage()", json);
                    setFieldMessage(json.record);
                }
            }
        }
    }

    useEffect(
        () => {
            if( !isEditable ) {
                updateFieldStatus();
                updateFieldMessage();
            }
        },
        [isEditable]
    )

    useEffect(
        () => {
            getFieldStatus();
            getFieldMessage();
        }, 
        []
    );

    return (
        <div className="row">
            <div className="col quicklink d-none d-md-block d-lg-block d-xl-block" onDoubleClick={handleDblClickEvent}>
                <ul>
                    { t('field_status') }
                </ul>

                { 
                    error && 
                    <Alert variant="danger">{error}</Alert>
                }
                {
                    !error &&
                    <Alert variant={fieldStatus.value == "true" ? "success" : "danger"}>
                    { 
                        !isEditable && fieldMessage.value 
                    }

                    {  
                        isEditable && (
                            <>
                                <div className="row">
                                    <div className="col">
                                        <ButtonGroup size="sm">
                                            <Button variant="success" onClick={openFieldStatusHandler} style={{ marginRight: "10px" }}>Open</Button>
                                            <Button variant="danger"  onClick={closeFieldStatusHandler}>Closed</Button>
                                        </ButtonGroup>
                                    </div>
                                </div> 
                                <div className="row">
                                    <div className="col">
                                        <Form.Control className="field-status-input" onKeyUp={onEnterStopEdit} onChange={setCustomMessageHandler} value={fieldMessage.value} />
                                    </div>
                                </div> 
                            </>
                        )
                    }
                </Alert>
                }

            </div>
        </div>
    )
}

export default FieldStatus;