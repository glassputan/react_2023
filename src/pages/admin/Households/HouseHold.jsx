import 
    React,
    {
        useState,
        useEffect,
        useContext
    }                 from 'react';

import {
    useTranslation
}                     from 'react-i18next'

import Alert          from 'react-bootstrap/Alert';
import Button         from 'react-bootstrap/Button';
import Card           from 'react-bootstrap/Card';

import Guardian       from '../Households/Guardian';
import MemberModal    from '../Members/MemberModal';

import AppContext     from '../../../context/AppContext';
import HouseholdModel from '../../../models/HouseholdModel';
import Row            from '../../../helpers/Row';


const HouseHold = (props) => {
    const context   = useContext(AppContext); 

    const {t} = useTranslation();
   
    const [ household,          setHouseHold            ] = useState( new HouseholdModel() );
    const [ primaryGuardian,    setPrimaryGuardian      ] = useState({});
    const [ secondaryGuardian,  setSecondaryGuardian    ] = useState({});
    const [ error,              setError                ] = useState();

    const [ showMemberModal,    setShowMemberModal      ] = useState(false);

    const autoCompleteSelect = (event) => {
        context.debug("Household", "autoCompleteSelect()", event);

        if(props.onChangeValue) {
            props.onChangeValue({ target: { id: "household_id", value: event } } );
        }
        else {
            console.warn("autoCompleteSelect(): Missing prop onChangeValue");
        }
    }

    const getHouseholdHandler = async () => {
        try {
            if(household.id && household.id != "-1") {

                const target = `/api/v1/household/${household.id}`;

                context.debug("Household", "getHouseholdHandler(REQ): Calling ", target);

                const request  = await fetch(target, context.defaultHeaders);

                if (request.ok ) {
                    const response = await request.json();
    
                    context.debug("Household", "getHouseholdHandler(RSP)", response);
    
                    if( response.status && response.status === "error") {
                        throw new Error(response.message);
                    }
                    else {
                        const   record             = context.deNullObject(response),
                                primary_guardian   = context.deNullObject(record.primary_guardian),
                                alternate_guardian = context.deNullObject(record.secondary_guardian || {});

                        setPrimaryGuardian(  primary_guardian );
                        setSecondaryGuardian(alternate_guardian );

                        setHouseHold({ name: record.name, id: record.id });
                    }
                }
                else {
                    setError( request.statusText );
                }
            }
        }
        catch(xx) {
            console.warn("getHouseholdHandler(): Household not detected.", xx.message);
        }
    }

    const assignPrimaryGuardianHandler = () => {
        context.debug("Household", "assignPrimaryGuardianHandler()");

        if( props.onSetAsGuardian ) {
            props.onSetAsGuardian("primary");
        }
    }

    const assignAlternateGuardianHandler = () => {
        context.debug("Household", "assignAlternateGuardianHandler()");

        if( props.onSetAsGuardian ) {
            props.onSetAsGuardian("alternate");
        }
    }

    const associateGuardianToHousehold = (guardian_id) => {

    }

    const associateGuardianHandler = () => {
        setShowMemberModal(true);
    }

    useEffect(
        () => {
            getHouseholdHandler()
        }, 
        [household.id]
    );

    useEffect(
        () => {
            setHouseHold({ id: props.member.household_id });
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
                        <Button onClick={assignAlternateGuardianHandler}>{t("assign_alternate_guardian")}</Button>
                    </div>
                </Card.Header>
            }
            <Card.Body>

                <MemberModal visible={showMemberModal} onSelect={associateGuardianToHousehold} />

                <div className="row" style={{ paddingBottom: "10px" }}>
                    <div className="col-12 col-md-6">
                        <label className="control-label">{t("household")}</label>
                        <input type="text" className="form-control" defaultValue={household.name} disabled />
                    </div>
                    <div className="col-12 col-md-6" >   
                        <helpers onSelect={autoCompleteSelect} /> 
                    </div>
                </div>

                <div className="row">
                    <div className="col-6">
                        <Guardian guardian={primaryGuardian}   onLink={associateGuardianHandler} />
                    </div>
                    <div className="col-6">
                        <Guardian guardian={secondaryGuardian} onLink={associateGuardianHandler} />
                    </div>        
                </div>

                <Row />

                <div className="row">
                    <div className="col-6">
                        <div className="form-group">
                            <label className="control-label" htmlFor="created_at">{t("created_at")}</label>
                            <input type="datetime" id="created_at" className="form-control" defaultValue={household.created_at} disabled />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label className="control-label" htmlFor="updated_at">{t("updated_at")}</label>
                            <input type="datetime" id="updated_at" className="form-control" defaultValue={household.updated_at} disabled />
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

export default HouseHold;