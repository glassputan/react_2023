import React                from 'react'

import { 
    useCallback, 
    useState, 
    useEffect,
    useReducer,
    useContext
}                           from "react";

import Form                 from 'react-bootstrap/Form';
import FormControl          from 'react-bootstrap/FormControl';
import Tabs                 from 'react-bootstrap/Tabs';
import Tab                  from 'react-bootstrap/Tab';

import { useTranslation }   from "react-i18next";
import { 
    Link, 
    useNavigate,
    useSearchParams
}                           from 'react-router-dom'

import Multiselect          from 'multiselect-react-dropdown';

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import { 
    faCopy,
    faHome,
    faSave,
    faTrash
}                           from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout        from '../../../layouts/DefaultLayout';
import Row                  from '../../../helpers/Row';

import Registrations        from './Registrations';
import Certifications       from './Certifications';
import Clearances           from './Clearances';
import MemberHousehold      from './MemberHousehold';
import Account              from './Account';
import AppContext           from '../../../context/AppContext';

import Message              from '../../../helpers/Message';
import MemberModel          from '../../../models/MemberModel';

import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';

const Member = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const context   = useContext(AppContext);
    const navigate  = useNavigate();

    const [showDeleteModal, setShowDeleteModal ] = useState(false);
    const [isNew,           setNew             ] = useState(true);

    const [member_id,       setMemberId        ] = useState();
    const [member,          setMember          ] = useState(new MemberModel());
    const [memberTypes,     setMemberTypes     ] = useState([]);
    const [selectedTypes,   setSelectedTypes   ] = useState([]);
    const [formState,       dispFormState      ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "MESSAGE":
                    return { variant: "",         message: action.message  }
                case "ERROR":
                    return { variant: "danger",   message: action.message }
                case "SUCCESS":                    
                    return { variant: "success",  message: action.message  }
                case "WARNING":
                    return { variant: "warning",  message: action.message  }
                default:
                    return {};
            }
        }, 
        {}
    )

    const setError = (message) => {
        dispFormState( { event: "ERROR", message: message });
    }

    const setMessage = (message) => {
        dispFormState( { event: "SUCCESS", message: message });
    }

    const {t} = useTranslation();

    const updateMemberHandler = async (event) => {
        if(event) event.preventDefault();

        context.debug("Member", "updateMemberHandler()");

        let target = "", record={};
        
        if(isNew) {
            target = "/api/v1/member";
            record = {
                ...context.defaultHeaders,
                body: JSON.stringify({ member: { ...member }}),
                method:  "POST"
            }; 
        }
        else {
            target = `/api/v1/member/${member.id}`;
            record = {
                ...context.defaultHeaders,
                body: JSON.stringify({ member: { ...member }}),
                method:  "PATCH"
            }; 
        }

        context.debug("Member", "updateMemberHandler(): Sending...", record);

        const response = await fetch(target, record);

        context.debug("Member", "updateMemberHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Member", "updateMemberHandler(2): Received...", json);
        
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setMember(context.deNullObject(json.record));
                setMessage(t("record_updated"));
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const setMemberValueHandler = (event) => {
        context.debug("Member", "setMemberValueHandler()", event);

        setMember(
            {
                ...member,
                [event.target.id]: event.target.value
            }
        );
    }

    const getMemberHandler = useCallback(
        async () => {
            dispFormState( { event: "LOADING" });

            if(member_id && member_id != "-1" && member_id != "" ) {
                const target = `/api/v1/member/${member_id}`;

                context.debug("Member", "getMemberHandler(): Calling ", target);

                const request  = await fetch(target, context.defaultHeaders);

                if( request.ok ) {
                    const response = await request.json();
    
                    context.debug("Member", "getMemberHandler()", response);
                    
                    if( response.status === "error") {
                        setError(response.message);
                    }
                    else {
                        const record = context.deNullObject(response.record)

                        setNew(false);

                        setSelectedTypes(
                            record.member_type
                                .map(    (type) => { return { name: type }  } )
                                .filter( (item) => { return item.name != "" } )
                        );

                        const params = getParameters();

                        if( params ) {
                            setMember(
                                {
                                    ...member,
                                    ...record,
                                    ...params
                                }
                            );
                        }
                        else {   
                            setMember(
                                {
                                    ...member,
                                    ...record
                                }
                            );
                        }
                    }
                }
                else {
                    setError(request.statusText);
                }
            }
        },
        [member_id],
    );
    
    const getMemberTypesHandler = useCallback(
        async () => {
            const request  = await fetch("/api/v1/member_types", context.defaultHeaders);
            
            if( request.ok ) {
                const response = await request.json();
                
                context.debug("Member", "getMemberTypesHandler()", response);
                
                if( response.status && response.status === "error") {
                    setError(response.message);
                }
                else {
                    setMemberTypes(response.records);
                }
            }
            else {
                setError(request.statusText);
            }
        },
        [],
    );
        
    const onSelectMemberType = (itemArray) => {
        context.debug("Member", "onSelectMemberType()", itemArray);
        
        setMember(
            {
                ...member,
                member_type: itemArray.map( (item) => { return item.name } )
            }
        )
    }
        
    const onRemoveMemberType = (itemArray) => {
        context.debug("Member", "onRemoveMemberType()", itemArray);
        
        setMember(
            {
                ...member,
                member_type: itemArray.map( (item) => { return item.name } )
            }
        )
    }
                
    const NavigateHandler = (target) => {        
        navigate(target);
    }
    
    const getParameters = () => {
        let extras = null;
        
        if( searchParams.get("guardian") || searchParams.get("household_id") ) {
            extras = {};
            
            if( searchParams.get("guardian") ) {
                extras.guardian_type = searchParams.get("guardian");
            }
            
            if( searchParams.get("household_id") ) {
                extras.household_id = searchParams.get("household_id");
            }
        }
        
        return extras;
    }
    
    const showDeleteModalHandler = () => {
        setShowDeleteModal(true);
    }
            
    const onDeleteRecordHandler = async (event) => {
        context.debug("Article", "onDeleteRecordHandler()");
        
        const action = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };
        
        const response = await fetch(`/api/v1/member/${member.id}`, action);
        
        context.debug("Member", "onDeleteRecordHandler()", response);
        
        if( response.ok ) {
            const json = await response.json();
            
            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setShowDeleteModal(false);
                navigate("/admin/members");
            }
        }
        else {
            setError(response.statusText);
        }
    }
    
    const deleteModalCloseHandler = (event) => {
        setShowDeleteModal(false);
    }
    
    useEffect(
        () => {
            dispFormState( { event: "LOADED", message: props.member ? props.member.full_name : "" });
        },
        [props.member]
    )
             
    const postAsGuardian = async (guardian_role) => {
        context.debug("Member", "postAsGuardian()", member);
        
        dispFormState({ event: "CLEAR_MESSAGE" });
        
        let record = {
            ...context.defaultHeaders,
            body:  JSON.stringify({ household: { member_id: member.id, role: guardian_role } }),
            method:  "POST"
        };
        
        const target = `/api/v1/household/guardian/${member.household_id}`;
        
        context.debug("Member", "postAsGuardian(REQ): Calling ", target);
        
        const request  = await fetch(target, record);
        
        if (request.ok ) {
            const response = await request.json();
            
            context.debug("Member", "postAsGuardian(RSP)", response);
            
            if( response.status && (response.status === "error" || response.status === "unprocessable_entity") ) {
                dispFormState({ event: "ERROR", message: response.message });
            }
        }
    }

    const changeMember = (memberId) => {
        setMemberId(memberId);
    }
    
    useEffect(
        () => {
            getMemberHandler();
        },
        [member_id]
    );

    useEffect(
        () => {
            if( !context.isAuthenticated() ) {
                navigate("/");
            }

            const houseId = searchParams.get("household");

            if( searchParams.get("id") ) {
                context.debug("Member", "useEffect(): Initializing By ID", searchParams.get("id"));
                
                setMemberId(searchParams.get("id"));
            }
            else if(props.member) {
                context.debug("Member", "useEffect(): Initializing by props", props.member);
                
                if( member.household_id != props.member.household_id && member.household_id != "" ) {
                    console.warn(`useEffect(): Overwriting household_id. old=${member.household_id} new=${props.member.household_id}`);
                }
                
                setMember(
                    {
                        ...props.member,
                        ...getParameters()
                    }
                );
                
                dispFormState( { event: "LOADED", message: props.member.full_name });
            }
            
            getMemberTypesHandler();                

            if(houseId) {
                context.debug("Member", "useEffect()", `Setting Household to ${houseId}`);

                setMember(
                    {
                        ...member,
                        household_id: houseId
                    }
                );
            }
        },
        []
    )
               
    return (
        <DefaultLayout>
            <Row />

            { member && <ConfirmModal message={t("confirm_delete")} header={`${t("delete")} '${member.full_name}'`} onContinue={onDeleteRecordHandler} isVisible={showDeleteModal} onClose={deleteModalCloseHandler} /> }

            <div className="news"> 
                <form onSubmit={updateMemberHandler}>
                    <div className="row">
                        <div className="col" style={{ paddingLeft: "0px" }}>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                    <li className="breadcrumb-item"><Link to="/admin/members">{t('members')}</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">{` ${isNew ? t("new") : t("edit")} ${t("member")} `}</li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col text-end px-2">
                            <button onClick={updateMemberHandler} className="btn btn-default" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></button>
                            <div    className="btn btn-default"         style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></div>
                            <div    className="btn btn-outline-danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" onClick={showDeleteModalHandler} /></div>
                        </div>            
                    </div>

                    <Message formState={formState} />

                    <Row />

                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label>{t('first_name')}</label>
                                <FormControl type="text" onChange={setMemberValueHandler} id="first_name" className="form-control required" value={member.first_name} />
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label>{t('last_name')}</label>
                                <FormControl type="text" onChange={setMemberValueHandler} id="last_name" className="form-control required" value={member.last_name} />
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                        <label>{t('member_type')}</label>
                            <Multiselect
                                options={memberTypes}           // Options to display in the dropdown
                                selectedValues={selectedTypes}  // Preselected value to persist in dropdown
                                onSelect={onSelectMemberType}   // Function will trigger on select event
                                onRemove={onRemoveMemberType}   // Function will trigger on remove event
                                displayValue="name"             // Property name to display in the dropdown options
                            />                            
                        </div>
                    </div> 

                    <Row />

                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="gender">{t('gender')}</label>
                                <Form.Select id="gender" onChange={setMemberValueHandler} value={member.gender}>
                                    <option value="m">Male</option>
                                    <option value="f">Female</option>
                                </Form.Select>
                            </div>                
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="birthdate">{t('birthdate')}</label>
                                <FormControl type="date" id="birthdate" onChange={setMemberValueHandler} value={member.birthdate} />
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label>{t('birth_certificate')}</label>
                                <FormControl type="text" id="birth_certificate_id" onChange={setMemberValueHandler} className="form-control required" value={member.birth_certificate_id} />
                            </div>
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label>{t('email')}</label>
                                <FormControl type="text" id="email" onChange={setMemberValueHandler} value={member.email} />
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="primary_phone">{t('primary_phone')}</label>
                                <FormControl type="tel" id="primary_phone" value={member.primary_phone} onChange={setMemberValueHandler} />
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="alternate_phone">{t('alternate_phone')}</label>
                                <FormControl type="tel" id="alternate_phone" value={member.alternate_phone} onChange={setMemberValueHandler}  />
                            </div>
                        </div>
                    </div>

                    <Row />
                    <Row />

                    <div className="row d-none">
                        <div className="col"><pre>{ JSON.stringify(member, null, 5) }</pre></div>
                    </div>

                    <div className="row d-none d-md-block">
                        <div className="col-12">
                            <Tabs defaultActiveKey="address" id="uncontrolled-tab-example" className="mb-3">
                                
                                <Tab eventKey="address" title={t("address")}>
                                    <div className="row">
                                        <div className="col-12"> 
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <label htmlFor="address_line1">{t("address")}</label>
                                                                <div className="rails-bootstrap-forms-date-select">
                                                                    <FormControl type="text" id="address_line1" value={member.address_line1} onChange={setMemberValueHandler} /><br/>
                                                                    <FormControl type="text" id="address_line2" value={member.address_line2} onChange={setMemberValueHandler} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Row />
                                                    <div className="row">
                                                        <div className="col-12 col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="city">{t("city")}</label>
                                                                <FormControl type="text" id="city" value={member.city} onChange={setMemberValueHandler} /><br/>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="state">{t("state")}</label>
                                                                <FormControl type="text" id="state" value={member.state} onChange={setMemberValueHandler} /><br/>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-2">
                                                            <div className="form-group">
                                                                <label htmlFor="zip_code">{t("zip_code")}</label>
                                                                <FormControl type="text" id="zip_code" value={member.zip_code} onChange={setMemberValueHandler} /><br/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                </Tab>

                                <Tab eventKey="profile" role="tab" title={t("registrations")}>
                                   <Registrations member={member} onSetState={dispFormState} onChangeValue={setMemberValueHandler} />
                                </Tab>
                                
                                <Tab eventKey="certifications" role="tab" title={t("certifications")}>
                                    <Certifications member={member} onSetState={dispFormState} />
                                </Tab>
                                
                                <Tab eventKey="clearances" role="tab" title={t("clearances")}>
                                    <Clearances member={member} />
                                </Tab>
                                
                                <Tab eventKey="household" role="tab" title={t("household")}>
                                    <MemberHousehold  member={member} onChangeValue={setMemberValueHandler} onRedirect={NavigateHandler} onSetAsGuardian={postAsGuardian} onSetMember={changeMember} />
                                </Tab>
                                
                                <Tab eventKey="references" role="tab" title={t("account")}>
                                    <Account member={member} onChangeValue={setMemberValueHandler} onError={setError} onSuccess={setMessage} />
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </form>

                <Row />
            </div>
        </DefaultLayout>
    );
}

export default Member;