import 
    React,
    {
        useState,
        useEffect,
        useReducer,
        useContext
    }               from 'react';

import {
    useTranslation
}                   from 'react-i18next'

import { 
    useNavigate,
    useSearchParams
}                   from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                   from '@fortawesome/react-fontawesome'

import { 
    faExpand,
    faCompressWide,
    faSave,
    faTrash,
    faUser
}                   from '@fortawesome/pro-regular-svg-icons';

import Accordion    from 'react-bootstrap/Accordion';
import Alert        from 'react-bootstrap/Alert';
import Button       from 'react-bootstrap/Button';
import Card         from 'react-bootstrap/Card';
import FormControl  from 'react-bootstrap/FormControl';
import Tab          from 'react-bootstrap/Tab';
import Tabs         from 'react-bootstrap/Tabs';

import HouseSearch    from './HouseSearch';
import HouseList      from './HouseList';
import HouseMembers   from './HouseMembers';
import Guardian       from './Guardian';

import MemberModal    from '../Members/MemberModal';

import AppContext     from '../../../context/AppContext';

import Row            from '../../../helpers/Row';
import HouseholdModel from '../../../models/HouseholdModel';
import ConfirmModal   from '../../../helpers/Modals/ConfirmModal';
import NoPanelLayout  from '../../../layouts/NoPanelLayout';

const HouseHolds = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const context   = useContext(AppContext);
 
    const {t}       = useTranslation();
    const navigate  = useNavigate();
    
    const [ isNew,      setNew       ] = useState(true);

    const [ error,      setError     ] = useState();    
    const [ household,  setHousehold ] = useState( new HouseholdModel() );

    const [ isExpanded,        setExpanded         ] = useState(false);
    const [ showMemberModal,   setShowMemberModal  ] = useState(false);
    const [ showConfirmModal,  setShowConfirmModal ] = useState(false);
    const [ record,            dispFormState       ] = useReducer(
        (state, action) => {
            context.debug("Households", "dispFormState()", action);

            switch(action.event) {
                case "SAVED": 
                    setHousehold(action.record);
                    setSearchParams({ id: action.record.id });

                    return {
                        ...state,
                        message: action.message,
                        variant: "success"
                    }
                case "ADD_GUARDIAN":
                    return {
                        ...state,
                        guardians: [ ...state.guardians, action.record ]
                    }
                case "ERROR": 
                    return {
                        ...state,
                        message: action.message,
                        variant: "danger"
                    }
                case "ID":
                    //setSearchParams({ id: action.id });
                    context.debug("Households", "ID", action);

                    return { 
                        ...state,
                        id: action.id
                    }
                case "HOUSEHOLD":
                    setHousehold(action.household);
                    setSearchParams({ id: action.household.id });

                    return state;
                case "MEMBERS":
                    return { 
                        ...state,
                        members:   action.members
                    }
                case "VALUE_CHANGE":
                    context.debug("Households", "VALUE_CHANGE", action.update);

                    setHousehold(
                        {
                            ...household,
                            [action.update.id]: action.update.value
                        }
                    );

                    return state;
                case "CLEAR":
                    return { household: new HouseholdModel(), guardians: [] };                    
                default:
                    context.warn("Households", "Unrecognized event.", action);
                    break;
            }

            return state;
        },
        { household: new HouseholdModel(), guardians: [] }
    );

    const renderHousehold = (response) => {
        context.debug("Households", "renderHousehold()", response);

        if( response.status === "error") {
            setError(response.message);
        }
        else {
            setNew(false);
            
            dispFormState(
                { 
                    event: "CLEAR" 
                }
            );
            
            dispFormState(
                { 
                    event: "HOUSEHOLD",
                    household: context.deNullObject(response.record)
                }
            );
            
            response.guardians.map(
                (guardian) => {
                    dispFormState(
                        { 
                            event: "ADD_GUARDIAN", 
                            record: context.deNullObject(guardian)
                        }
                    );
                }
            )
            
            if( response.members ) {
                dispFormState(
                    { 
                        event: "MEMBERS", 
                        members:  response.members 
                    }
                );
            }
            else {
                dispFormState(
                    { 
                        event: "MEMBERS", 
                        members:  [] 
                    }
                );
            }
        }
    }

    /**
     * 
     */
    const saveRecordHandler = async () => {
        console.debug("saveRecordHandler()", household);

        let target = "";
        let params = {};

        if( isNew ) {
            target    = "/api/v1/household";
            params    = {
                ...context.defaultHeaders,
                body: JSON.stringify({ household: household }),
                method:  "POST"
            }
        }
        else {
            target = `/api/v1/household/${household.id}`;
            params    = {
                ...context.defaultHeaders,
                body: JSON.stringify({ household: household }),
                method:  "PATCH"
            }
        }

        context.debug("Households", "saveRecordHandler(): Sending...", params);

        const response = await fetch(target, params);

        context.debug("Households", "saveRecordHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Households", "saveRecordHandler(2): Received...", json);

            renderHousehold(json);
        }
        else {
            setError(response.statusText);
        }
    };

    /**
     * Triggered by a useEffect watching record.id.
     */
    const getHouseholdHandler = async () => {
        context.debug("Households", "getHouseholdHandler()", (record));

        if( record && record.id ) {

            const target = `/api/v1/household/${record.id}`;

            context.debug("Households", "getHouseholdHandler(RQST)", target);

            const response  = await fetch(target, context.defaultHeaders);

            if (response.ok ) {
                const json = await response.json();

                context.debug("Households", "getHouseholdHandler(RSP)", json);

                renderHousehold(json);
            }
            else {
                setError(response.statusText);
            }
        }
    }

    const deleteRecordHandler = async () => {
        context.debug("Households", "deleteRecordHandler()");

        const target = `/api/v1/household/${household.id}`;
        const params    = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };

        context.debug("Households", "deleteRecordHandler(): Sending...", params);

        const response = await fetch(target, params);

        context.debug("Households", "deleteRecordHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Households", "deleteRecordHandler(2): Received...", json);

            dispFormState({ event: "CLEAR" });
        }
        else {
            setShowConfirmModal(false);
            setError(response.statusText);
        }
    }

    /**
     * Changes the ID of a household causing a refresh of the data.
     * @param {integer} house_id 
     */
    const setHouseholdId = (house_id) => {
      // console.info(`setHouseholdId(${house_id})`);

        dispFormState({ event: "ID", id: house_id  });
    }    

    const onDeleteRecordHandler = (event) => {
        setShowConfirmModal(true);
    }
    
    const newGuardian = (event) => {
        context.debug("Households", "newPrimaryGuardian()", event);
        navigate(`/admin/member?id=-1&household_id=${record.id}&type=g`);
    }
    
    const editGuardian = (event) => {
        context.debug("Households", "editAlternateGuardian()", event);
        navigate(`/admin/member?id=${event.target.id}`);
    }
    
    const removeGuardian = (event) => {
        context.debug("Households", "removeAlternateGuardian()", event);
    }  

    const dispFormStateHandler = (household_id) => {
        context.debug("Households", "dispFormStateHandler()", household_id);
        dispFormState({ event: "ID", id: household_id });
    }
    
    const selectHouseholdHandler = (event) => {
        context.debug("Households", "selectHouseholdHandler()", event);
        
        dispFormState({ event: "ID", id: event.target.value });
    }  
    
    const nameChangeHandler = (event) => {
        context.debug("Households", "nameChangeHandler()", event);
        
        const name = event.target.value.replaceAll("(", "").replaceAll(")", "").replaceAll(" ", "").replaceAll("-", "");

        setHousehold(
            {
                ...household,
                name: name
            }
        )        
    }

    const hideMemberModal = () => {
        setShowMemberModal(false);
    }     

    const associateGuardianToHousehold = (guardian) => {
        dispFormState({ event: "ADD_GUARDIAN", record: guardian });
    }
    
    const hideConfirmModalHandler = () => {
        setShowConfirmModal(false);
    }

    const toggleListExpansion = () => {
        setExpanded( !isExpanded );
    }

    /**
     * Called from a modal, this responds to a user generated event.
     * @param {JSONObject} action 
     */
    const actionHandler = async (action) => {
        context.debug("Households", "actionHandler()", action);

        const house = action.household_id;

        switch(action.action) {
            case "redirectToMember":
                navigate(`/admin/member?id=${action.id}`);
                break;
            case "new":
                navigate(`/admin/member?household=${house}`);
                break;
            case "associate":
                const response = await fetch(`/api/v1/household/${house}/associate`, header);

                if(response.ok) {
                    const json = response.json();

                    if(json.status == "error") {
                        setError(json.message);
                    }
                    else {
                        setHouseholdId(house);
                    }
                }
                else {
                    setError(response.statusText);
                }
                break;
            default:
                break;
        }
    }

    useEffect(
        () => {
            setHouseholdId(searchParams.get("id"));
        },
        []
    )

    useEffect(
        () => {
            getHouseholdHandler();
        }, 
        [record.id]
    ); 
    


    return (
        <NoPanelLayout>

            <ConfirmModal 
                isVisible={showConfirmModal} 
                header={t("delete_record")} 
                message={t("delete_record")} 
                onContinue={deleteRecordHandler} 
                onClose={hideConfirmModalHandler} 
            />

            <Card>
                <Card.Header>

                    <div className="row">
                        <div className="col-1">
                            <Row />
                            <Button onClick={toggleListExpansion}>
                                { 
                                    isExpanded ?                                 
                                    <FontAwesomeIcon icon={faCompressWide} /> : <FontAwesomeIcon icon={faExpand} />
                                }
                            </Button> 
                        </div>
                        <div className="col-6">
                            <div className="row" style={{ paddingBottom: "10px" }}>
                                <HouseSearch onSelect={dispFormStateHandler} onChangeValue={selectHouseholdHandler} />
                            </div>
                        </div>
                        <div className="col text-end px-2">
                            <Row />
                            <button onClick={saveRecordHandler} className="btn btn-default" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></button>
                            <div    className="btn btn-outline-danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" onClick={onDeleteRecordHandler} /></div>
                        </div>            
                    </div>

                </Card.Header>
                <Card.Body>
                    {
                        record.message &&
                            <Alert variant={record.variant}>{record.message}</Alert>
                    }                    
                    { error && <Alert variant="danger">{error}</Alert> }

                    <MemberModal visible={showMemberModal} onSelect={associateGuardianToHousehold} onClose={hideMemberModal} />

                    <div className="row">
                        <div className={ isExpanded ? "col-5" : "d-none"}>
                            <HouseList height="800px" onSelect={dispFormStateHandler} household={household} />
                        </div>

                        { /* Details */ }
                        <div className={ isExpanded ? "col-6" : "col-11"}>
                            <Row />                            
                            <div className="row">
                                <div className="col-6">
                                    <Card>
                                        <Card.Header>
                                            Details
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="row">
                                                <div className="col">
                                                    <label className="control-label" htmlFor="name">{t("name")}</label>
                                                    <FormControl type="text" id="name" value={household.name} onChange={nameChangeHandler} />
                                                </div>
                                            </div>
                                            <Row />
                                            <div className="row">
                                                <div className="col">
                                                    <label className="control-label" htmlFor="created_at">{t("created_at")}</label>
                                                    <FormControl type="datetime-local" id="created_at" disabled defaultValue={context.getFormattedDateTimeLocale(household.created_at)} />
                                                </div>
                                            </div>
                                            <Row />
                                            <div>
                                                <div className="col">
                                                    <label className="control-label" htmlFor="updated_at">{t("updated_at")}</label>
                                                    <FormControl type="datetime-local" id="updated_at" disabled defaultValue={context.getFormattedDateTimeLocale(household.updated_at)} />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>                                        
                                <div className="col-6">
                                    <Tabs defaultActiveKey="info" className="mb-3">
                                        <Tab eventKey="info" title={t("Detail")}>
                                            <Card>
                                                <Card.Header>
                                                    <div className="row">
                                                        <div className="col">Guardians</div>
                                                        <div className="col text-end">
                                                            <Button><FontAwesomeIcon icon={faUser} /></Button>
                                                        </div>
                                                    </div>
                                                </Card.Header>
                                                
                                                <Card.Body>
                                                    <Accordion defaultActiveKey="0">
                                                    {
                                                        record.guardians.map(
                                                            (guardian) => {
                                                                return (
                                                                    <Accordion.Item key={guardian.id} eventKey={guardian.id}>
                                                                        <Accordion.Header>
                                                                            { guardian.full_name }
                                                                        </Accordion.Header>
                                                                        <Accordion.Body>
                                                                            <Guardian guardian={guardian} onNew={newGuardian} onEdit={editGuardian} onRemove={removeGuardian} />
                                                                        </Accordion.Body>
                                                                    </Accordion.Item>
                                                                );
                                                            }
                                                        )
                                                    }
                                                    </Accordion>
                                                </Card.Body>
                                            </Card>
                                        </Tab>
                                        <Tab eventKey="members" title={t("members")}>
                                            <HouseMembers members={record.members} id={record.id} onRefresh={setHouseholdId} onAction={actionHandler} />
                                        </Tab>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </NoPanelLayout>
    );
}

export default HouseHolds;