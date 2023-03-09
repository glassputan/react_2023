import 
    React,
    {
        useState,
        useCallback,
        useEffect,
        useContext
    }              from 'react';

import { 
    Button,
    Card,
    Form,
    Table 
}                   from 'react-bootstrap';

import { 
    useTranslation 
}                   from 'react-i18next';

import { 
    Navigate 
}                   from 'react-router';

import MemberSearchDialog from './MemberSearchDialog';

import AppContext   from '../../../context/AppContext';

const HouseMembers = (props) => {
    const {t} = useTranslation();

    const context = useContext(AppContext);

    const [ members,        setMembers        ] = useState([]);
    const [ household_id,   setID             ] = useState();
    const [ error,          setError          ] = useState();
    const [ checkedMembers, setCheckedMembers ] = useState([]);
    const [ memberAction,   setMemberAction   ] = useState("");
 
    // Member Search Dialog
    const [ showMSD, setShowMSD] = useState(false);

    const getListMembers = useCallback(
        async () => {
            console.warn(`HouseMembers::getListMembers(${household_id}): NEEDS WORK`);
            return;

            if( household_id ) {
                const target = "/api/v1/members";

                context.debug("HouseMembers", "getListMembers(REQ): Calling ", target);

                const response  = await fetch(target, context.defaultHeaders);

                if (response.ok ) {
                    const json = await response.json();

                    context.debug("HouseMembers", "getListMembers(RSP)", json);

                    if( json.status === "error") {
                        setError(json.message);
                    }
                    else {
                        setMembers(json.records);
                    }
                }
                else {
                    setError( response.statusText );
                }
            }
        }
    ) 
    
    const selectMemberHandler = (event) => {
        context.debug("HouseMembers", "selectMemberHandler()", event);

        if( props.onSelect ) {
            props.onSelect(event.target.id);
        }
        else {
            context.warn("HouseMembers", "selectMemberHandler()", "Missing prop 'onSelect'");
        }
    }

    const memberCheckedHandler = (event) => {
        if( event.target.checked ) {
            setCheckedMembers([ ...checkedMembers, event.target.id]);
        }
        else {
            setCheckedMembers(checkedMembers.filter( (item) => { context.debug("HouseMembers", `filter(${event.target.id})`, item); return item != event.target.id }));
        }
    }

    const refresh = () => {
        if(props.onRefresh) {
            props.onRefresh(household_id);
        }
        else {
            context.warn("HouseMembers", "refresh()", "Missing prop 'onRefresh'");
        }
    }

    const setMemberAsGuardian = async (member_id, guardianType) => {
        context.debug("HouseMembers", "setMemberAsGuardian()", member_id);
        
        const targetURL = `/api/v1/member/${member_id}`;

        const record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ member: { guardian_type: guardianType }}),
            method:  "PATCH"
        };        

        context.debug("HouseMembers", "setMemberAsGuardian(): Sending...", record);

        const response = await fetch(targetURL, record);

        context.debug("HouseMembers", "setMemberAsGuardian(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("HouseMembers", "setMemberAsGuardian(2): Received...", json);
        
            if( json.status === "error") {
                dispFormState( { event: "ERROR", message: json.message });
            }
            else {
                refresh();
            }
        }
        else {
            setError(response.statusText);
        }
    }   
    
    const memberActionHandler = (event) => {
        context.debug("HouseMembers", "memberActionHandler()", event);

        switch(event.target.value) {
            case "set_guardian":
                checkedMembers.forEach(
                    (member) => {
                        setMemberAsGuardian(member, "alternate");
                    }
                )
                break;
            default:
                context.debug("HouseMembers", "memberActionHandler()", `Executing ${event.target.value} against ${checkedMembers.join()}`);
                break;
        }

        setCheckedMembers([]);
        setMemberAction("");
        refresh();
    }

    const newMember = () => {
        context.debug("HouseMembers", "newMember()");

        setShowMSD(true);
    }

    const addMemberHandler = (member_id) => {
        setShowMSD(false);
    }

    const closeDialogHandler = () => {
        setShowMSD(false);
    }  
    
    const setAction = (action) => {
        context.debug("HouseMembers", "setAction()", action);
        
        if(props.onAction) {
            props.onAction({ ...action, household_id: household_id });
        }
        else {
            console.warn("HouseMembers(): Missing Property 'onAction'");
        }
    }

    const onChangeMember = (event) => {
        //console.info("onChangeMember()", event);

        setAction( { action: "redirectToMember", id: event.target.parentElement.id });
    }

    useEffect(
        () => {
            getListMembers()
        },
        [household_id]
    )

    useEffect(
        () => {
            if( props.members ) {
                setMembers(props.members);
            }
            else if( props.id ) {
                setID(props.id)
            }
        }, 
        [props]
    )
    
    const getGuardianClass = (type) => {
        if( type && type == "alternate" ) return "bg-gold-dilute";
        return "";
    }

    return (
        <>
            <MemberSearchDialog visible={showMSD} onClose={addMemberHandler} onCancel={closeDialogHandler} onAction={setAction} />
            <div className="row d-none">
                <div className="col">
                    <pre>{ JSON.stringify(members, null, 5)}</pre>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Card>
                        <Card.Header>
                            <div className="row">
                                <div className="col">
                                    {t("members")}
                                </div>                                
                                <div className={`col text-end ${household_id ? "" : "d-none"}`}>
                                    <Button size="sm" onClick={newMember}>{t("new")}</Button>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            { error && <Alert variant="danger">{error}</Alert> }

                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th colSpan="3">{t("name")}</th>
                                        <th>{t("birthdate")}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        Array.isArray(members) && members.map(
                                            (member) => {
                                                if( member.removed ) return;

                                                return (
                                                    <tr key={member.id} id={member.id} onDoubleClick={onChangeMember} className={`${getGuardianClass(member.guardian_type)} ${member.removed ? "text-decoration-line-through" : ""}`}>
                                                        <td><Form.Check type="checkbox" onChange={memberCheckedHandler} id={member.id} value={checkedMembers.indexOf(member.id) > -1} /></td>
                                                        <td>{member.first_name}</td>
                                                        <td>{member.last_name}</td>
                                                        <td>{member.birthdate}</td>
                                                    </tr>
                                                );
                                            }
                                        )
                                    }
                                </tbody>

                                <tfoot>
                                    <tr style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}>
                                        <td colSpan="4">
                                            <label>{t("action")}</label>
                                            <select id="member_action" value={memberAction} className="form-control" onChange={memberActionHandler}>
                                                <option value=""></option>
                                                <option value="set_guardian">{t("set_guardian")}</option>
                                                <option value="delete">{t("delete_records")}</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </Card.Body>
                    </Card>   
                </div>
            </div>
        </>
    )
}

export default HouseMembers;

