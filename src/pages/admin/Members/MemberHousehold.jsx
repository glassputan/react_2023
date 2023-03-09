import React            from 'react';

import {
    useState,
    useEffect,
    useContext
}                       from 'react';

import {
    useTranslation
}                       from 'react-i18next'


import Accordion        from 'react-bootstrap/Accordion';
import Alert            from 'react-bootstrap/Alert';
import Button           from 'react-bootstrap/Button';
import Card             from 'react-bootstrap/Card';

import Row           from '../../../helpers/Row';

import Guardian         from '../Households/Guardian';
import HouseMembers     from '../Households/HouseMembers';

import MemberSearch     from './MemberSearch';

import AppContext       from '../../../context/AppContext';
import HouseholdModel   from '../../../models/HouseholdModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHomeHeart } from '@fortawesome/pro-regular-svg-icons';
import { useNavigate } from 'react-router';

const MemberHousehold = (props) => {
    const context   = useContext(AppContext);
    const navigate  = useNavigate();

    const {t} = useTranslation();
   
    const [ members,   setMembers   ] = useState([]);
    const [ guardians, setGuardians ] = useState([]);
    const [ household, setHousehold ] = useState( new HouseholdModel() );
    const [ error,     setError     ] = useState();

    const getHouseholdHandler = async () => {
        setError(null);

        if(household.id && household.id != "-1") {
            const target = `/api/v1/household/${household.id}`;

            context.debug("Household", "getHouseholdHandler(REQ): Calling ", target);

            const request  = await fetch(target, context.defaultHeaders);

            if (request.ok ) {
                const response = await request.json();

                context.debug("Household", "getHouseholdHandler(RSP)", response);

                if( response.status && response.status === "error") {
                    setError(response.message);
                }
                else {
                    setMembers(response.members);
                    setGuardians(response.guardians);
                    setHousehold(context.deNullObject(response.record));
                }
            }
            else {
                setError( request.statusText );
            }
        }
    }

    const assignPrimaryGuardianHandler = () => {
        context.debug("MemberHousehold", "assignPrimaryGuardianHandler()");

        if( props.onsetGuardianType ) {
            props.onsetGuardianType("primary");
        }
    }

    const dispFormState = (event) => {
        if( props.onEvent ) {
            props.onEvent(event);
        }
        else {
            console.warn("The props 'onEvent' is missing.");
        }
    }

    const editGuardian = (member_id) => {
        context.debug("MemberHousehold", "editGuardian()", member_id);

        if( props.onRedirect ) {
            props.onRedirect(`/admin/member?id=${member_id}`);
        }
        else {
            console.warn("The props 'onRedirect' is missing.");
        }
    }
    
    const newGuardian = () => {
        if( props.onRedirect ) {
            props.onRedirect(`/admin/member?household_id=${household.id}`);
        }
        else {
            console.warn("The props 'onRedirect' is missing.");
        }            
    }

    const setGuardianType = async (member_id, guardianType) => {
        context.debug("MemberHousehold", `setGuardianType(${member_id}, '${guardianType}')`);

        setError(null);
        
        const actionURL = `/api/v1/member/${member_id}`;

        const record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ member: { guardian_type: guardianType }}),
            method:  "PATCH"
        };        

        context.debug("MemberHousehold", "setGuardianType(): Sending...", record);

        const response = await fetch(actionURL, record);

        context.debug("MemberHousehold", "setGuardianType(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("MemberHousehold", "setGuardianType(2): Received...", json);
        
            if( json.status === "error") {
                dispFormState( { event: "ERROR", message: json.message });
            }
            else {
                getHouseholdHandler();
            }
        }
        else {
            setError(response.statusText);
        }        
    }

    const removeGuardian = (member_id) => {
        context.debug("MemberHousehold", "removeGuardian()", member_id);
        
        setGuardianType(member_id, "none");
    }
        
    const addMemberToHousehold = async (member_id) => {
        context.debug("MemberHousehold", "addMemberToHousehold()", member_id);

        setError(null);
        
        const actionURL = `/api/v1/member/${member_id}`;

        const record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ member: { household_id: household.id }}),
            method:  "PATCH"
        };        

        context.debug("MemberHousehold", "addMemberToHousehold(): Sending...", record);

        const response = await fetch(actionURL, record);

        context.debug("MemberHousehold", "addMemberToHousehold(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("MemberHousehold", "addMemberToHousehold(2): Received...", json);
        
            if( json.status === "error") {
                dispFormState( { event: "ERROR", message: json.message });
            }
            else {
                getHouseholdHandler();
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const setMember = (memberId) => {
        if(props.onSetMember) {
            props.onSetMember(memberId);
        }
        else {
            console.warn("MemberHousehold::setMember(): Missing property 'onSetMember'");
        }
    }

    /**
     * Called from a modal, this responds to a user generated event.
     * @param {JSONObject} action 
     */
    const memberActionHandler = async (action) => {
        context.debug("Households", "actionHandler()", action);

        const house = action.household_id;

        switch(action.action) {
            case "redirectToMember":
                setMember(action.id);
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
            getHouseholdHandler()
        }, 
        [household.id]
    );

    useEffect(
        () => {
            setHousehold({ id: props.member.household_id });
        },
        [props.member.household_id]
    )

    return (
        <Card>
            {
                error &&
                <Card.Header>
                    <Alert variant="danger">{error}</Alert>
                </Card.Header>
            }
            {
                !error &&
                <Card.Header>
                    <div className="col text-end">
                        <Button style={{ marginRight: "10px" }} onClick={assignPrimaryGuardianHandler}>{t("assign_primary_guardian")}</Button>                        
                    </div>
                </Card.Header>
            }
            <Card.Body>
                <div className="row" style={{ paddingBottom: "10px" }}>
                    <div className="col-12 col-md-6">
                        <label className="control-label">{t("household")}</label>
                        <input type="text" className="form-control" defaultValue={household.name} disabled />
                    </div>
                    <div className="col-12 col-md-6" >   
                        <MemberSearch onSelect={addMemberToHousehold} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-6">
                        <Accordion defaultActiveKey="0">
                        {
                            guardians.map(
                                (guardian) => {
                                    return (
                                        <Accordion.Item key={guardian.id} eventKey={guardian.id}>
                                            <Accordion.Header>
                                                { guardian.guardian_type=="primary" && <FontAwesomeIcon icon={faHomeHeart} /> } &nbsp; { guardian.full_name }
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Guardian guardian={guardian} onNew={newGuardian} onEdit={editGuardian} onRemove={removeGuardian} onSet={setGuardianType} />
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    );
                                }
                            )
                        }
                        </Accordion>
                    </div>
                    <div className="col-6">                        
                        { members && <HouseMembers members={members} onRefresh={getHouseholdHandler} onAction={memberActionHandler} /> }
                    </div>
                </div>

                <Row />

                <div className="row">
                    <div className="col-6">
                        <div className="form-group">
                            <label className="control-label" htmlFor="created_at">{t("created_at")}</label>
                            <input type="datetime-local" id="created_at" className="form-control" defaultValue={context.getFormattedDateTimeLocale(household.created_at)} disabled />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label className="control-label" htmlFor="updated_at">{t("updated_at")}</label>
                            <input type="datetime-local" id="updated_at" className="form-control" defaultValue={context.getFormattedDateTimeLocale(household.updated_at)} disabled />
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

export default MemberHousehold;