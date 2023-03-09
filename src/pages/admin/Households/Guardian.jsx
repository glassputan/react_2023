import 
    React,
    { 
        useContext,
        useState,
        useEffect
    }               from 'react';

import Button       from 'react-bootstrap/Button';
import Card         from 'react-bootstrap/Card';

import { 
    v4 as uuidv4 
}                   from 'uuid';

import {
    useTranslation 
}                   from 'react-i18next';

import { 
    FontAwesomeIcon 
}                   from '@fortawesome/react-fontawesome';

import { 
    faArrowDown,
    faArrowUp,
    faEdit,
    faTrash
}                   from '@fortawesome/pro-regular-svg-icons';

import AppContext   from '../../../context/AppContext';
import MemberModel  from '../../../models/MemberModel';
import Row          from '../../../helpers/Row';


const Guardian = (props) => {
    const {t} = useTranslation();

    const context = useContext(AppContext);

    const [guardian, setGuardian ] = useState(new MemberModel());

    const uuid = uuidv4().replaceAll("-", "");

    const editGuardian = () => {
        if( props.onEdit ) {
            props.onEdit(guardian.id);
        }
        else {
            console.warn("Guardian::editGuardian(): Missing prop 'onEdit'");
        }
    }

    const newGuardian = (event) => {
        if( props.onNew ) {
            props.onNew(event);
        }
        else {
            console.warn("Guardian::newGuardian(): Missing prop 'onNew'");
        }

    }

    const removeGuardian = () => {
        if( props.onRemove ) {
            props.onRemove(guardian.id);
        }
        else {
            console.warn("Guardian::removeGuardian(): Missing prop 'onRemove'");
        }
    }

    const setPrimaryGuardian = () => {
        if( props.onSet ) {
            props.onSet(guardian.id, "primary");
        }
        else {
            console.warn("Guardian::removeGuardian(): Missing prop 'onSet'");
        }
    }

    const setAltGuardian = () => {
        if( props.onSet ) {
            props.onSet(guardian.id, "alternate");
        }
        else {
            console.warn("Guardian::removeGuardian(): Missing prop 'onSet'");
        }
    }

    useEffect(
        () => {
            setGuardian(props.guardian);
        }, 
        [props.guardian]
    )  

    return (
        <Card>
            <Card.Header>
                <div className="row">
                    <div className="col-6">
                        <div className="float-left">{ context.toCamelCase(guardian.guardian_type)} {t("guardian")}</div>
                    </div>
                    <div className="col-6">
                        {
                            guardian.id &&
                            <div className="text-end" id={guardian.id}>
                                <Button size="sm" style={{ marginRight: "10px" }} onClick={editGuardian}><FontAwesomeIcon icon={faEdit} /></Button>
                                { guardian.guardian_type != "primary" && <Button size="sm" style={{ marginRight: "10px" }} onClick={setPrimaryGuardian}><FontAwesomeIcon icon={faArrowUp} /></Button>   }
                                { guardian.guardian_type == "primary" && <Button size="sm" style={{ marginRight: "10px" }} onClick={setAltGuardian}><FontAwesomeIcon icon={faArrowDown} /></Button> }
                                <Button size="sm" variant="danger" style={{ marginRight: "10px" }} onClick={removeGuardian}><FontAwesomeIcon icon={faTrash} /></Button>
                            </div>                            
                        }

                        {
                            !guardian.id &&
                            <div className="text-end" id={guardian.id}>
                                <Button size="sm" onClick={newGuardian}>{t("new")}</Button>
                            </div>
                        }
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="last_name">{t("last_name")}</label>
                            <input type="text" className="form-control" id={`${uuid}_household_last_name`} disabled defaultValue={guardian.last_name} />
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="first_name">{t("first_name")}</label>
                            <div>
                                <input type="text" id={`${uuid}_household_first_name`} className="form-control" disabled defaultValue={guardian.first_name} />
                            </div>
                        </div>
                    </div>
                </div>
                <Row />
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="address1">{t("address")}</label>
                            <div>
                                <input type="text" id={`${uuid}_household_address1`} className="form-control" disabled defaultValue={guardian.address1} />
                            </div>
                        </div>
                    </div>
                </div>
                <Row />
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="city">{t("city")}</label>
                            <div>
                                <input type="text" id={`${uuid}_household_city`} className="form-control" disabled defaultValue={guardian.city} />
                            </div>
                        </div>
                    </div>
                </div>
                <Row />
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="state">{t("state")}</label>
                            <div>
                                <input type="text" id={`${uuid}_household_state`} className="form-control" disabled defaultValue={guardian.state} />
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="zip_code">{t("zip_code")}</label>
                            <div>
                                <input type="text" id={`${uuid}_household_zip_code`} className="form-control" defaultValue={guardian.zip_code} disabled />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="email">{t("email")}</label>
                            <div>
                                <input type="email" id={`${uuid}_household_email`} className="form-control" disabled defaultValue={guardian.email} />
                            </div>
                        </div>
                    </div>
                </div>
                <Row />
                <div className="row">
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="home_phone">{t("home_phone")}</label>
                            <div>
                                <input type="phone" id={`${uuid}_household_home_phone`} className="form-control" disabled defaultValue={guardian.home_phone}/>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-group">
                            <label className="control-label" htmlFor="mobile_phone">{t("mobile_phone")}</label>
                            <input type="phone" id={`${uuid}_household_mobile_phone`} className="form-control" disabled defaultValue={guardian.mobile_phone} />
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}

export default Guardian;