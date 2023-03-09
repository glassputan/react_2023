import React                from 'react'

import { 
    useState, 
    useEffect,
    useContext
}                           from "react";

import { useTranslation }   from "react-i18next";

import Alert                from 'react-bootstrap/Alert';
import Button               from 'react-bootstrap/Button';
import Modal                from 'react-bootstrap/Modal';

import Multiselect          from 'multiselect-react-dropdown';

import Row                  from '../../../helpers/Row';

import AppContext           from '../../../context/AppContext';

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome';

import { 
    faSave 
}                           from '@fortawesome/pro-regular-svg-icons';

const SponsorModal = (props) => {
    const context    = useContext(AppContext);

    const {t}        = useTranslation();

    const [error,             setError]             = useState();
    const [selectedDivisions, setSelectedDivisions] = useState([]);

    const divisionTypes = [
        { name: "U04",  value: "U04" },
        { name: "U06",  value: "U06" },
        { name: "U08F", value: "U08F" },
        { name: "U08M", value: "U08M" },
        { name: "U10F", value: "U10F" },
        { name: "U10M", value: "U10M" },
        { name: "U14F", value: "U14F" },
        { name: "U14M", value: "U14M" },
        { name: "U19F", value: "U19F" },
        { name: "U19M", value: "U19M" }
    ]

    const saveSponsoredTeamHandler = (event) => {
        if(props.onSave) {
            props.onSave();
        }
        else {
            context.warn("SponsorModal", "saveSponsoredTeamHandler", "Missing props 'onSave'");
        }
    }

    const deleteRecord = () => {
        setShowDeleteModal(true);
    }  

    const fieldChangeHandler = (event) => {
        context.debug("SponsorEdit", "fieldChangeHandler()", event);

        if( props.onFieldChange ) {
            props.onFieldChange(event);
        }
        else {
            context.warn("SponsorModal", "fieldChangeHandler()", "Missing props 'onFieldChange'");
        }
    }

    const closeModalHandler = (event) => {
        if( props.onCloseModal )
            props.onCloseModal();
        else {
            context.warn("SponsorModal", "closeModalHandler", "Missing expected props 'onCloseModal'");
        }
    }

    const onChangeDivisionList = (itemArray) => {
        fieldChangeHandler( { target: { id: "divisions", value: itemArray.map( (item) => { return item.name } ) } } );
    }

    useEffect(
        () => {
            try {
                if( props.record && props.record.divisions ) {
                    const json = JSON.parse(props.record.divisions);
                    
                    if( Array.isArray(json) ) {
                        setSelectedDivisions(
                            json
                                .map(    (type) => { return { name: type }  } )
                                .filter( (item) => { return item.name != "" } )
                        );
                    }
                }
            }
            catch(xx) {
            }
        },
        [props.record]
    )
   
    return (
        <Modal show={props.isVisible} onHide={closeModalHandler}>
            <Modal.Header closeButton>
                <Row><h4 className="modal-title">{ props.record.id == "" ? t("new") : t("edit") } {t("sponsored_team")}</h4></Row>
                    { error && <Row><Alert variant="danger">{error}</Alert></Row> }
            </Modal.Header>

            <Modal.Body>
                <div className="row">
                    <div className="col-4">
                        <label>{t("year")}</label>
                        <input type="number" id="year" className="form-control" onChange={fieldChangeHandler} defaultValue={props.record.year} />
                    </div>
                    <div className="col-4">
                        <label>{t("shirt_color")}</label>
                        <select id="shirt_color" className="form-control" onChange={fieldChangeHandler} value={props.record.shirt_color}>
                            <option value=""></option>
                            <option value="Gold"  >{t("gold")}</option>
                            <option value="Blue"  >{t("blue")}</option>
                            <option value="Orange">{t("orange")}</option>
                            <option value="Lime"  >{t("lime")}</option>
                            <option value="Red"   >{t("red")}</option>
                            <option value="Purple">{t("purple")}</option>
                            <option value="Black" >{t("black")}</option>
                            <option value="Green" >{t("green")}</option>
                            <option value="Pink"  >{t("pink")}</option>
                            <option value="White" >{t("white")}</option>
                        </select>
                    </div>
                    <div className="col-4">
                        <label>{t("divisions")}</label>
                        <Multiselect
                            options={divisionTypes}            // Options to display in the dropdown
                            selectedValues={selectedDivisions} // Preselected value to persist in dropdown
                            onSelect={onChangeDivisionList}    // Function will trigger on select event
                            onRemove={onChangeDivisionList}    // Function will trigger on remove event
                            displayValue="name"                // Property name to display in the dropdown options
                        />  
                    </div>
                </div>

                <Row />

                <div className="row">
                    <div className="col">
                        <label>{t("shirt_text")}</label>
                        <input type="text" onChange={fieldChangeHandler} className="form-control" id="shirt_text" value={props.record.shirt_text} />
                    </div>        
                </div>                    

                <Row />

                <div className="row">
                    <div className="col">
                        <label>{t("with_player")}</label>
                        <input type="text" onChange={fieldChangeHandler} className="form-control" id="player_name" value={props.record.player_name} />
                    </div>        
                    <div className="col">
                        <label>{t("total_contribution")}</label>
                        <input type="number" onChange={fieldChangeHandler} className="form-control" id="total_contribution" value={props.record.total_contribution} />
                    </div>        
                </div>

                <Row /> 

                <div className="row">
                    <div className="col">
                        <label>{t("notes")}</label>
                        <textarea onChange={fieldChangeHandler} className="form-control" id="note" value={props.record.note}></textarea>
                    </div>
                </div>

                <Row /> 

            </Modal.Body>
            <Modal.Footer>
                <div className="row">
                    <div className="col text-end">
                        <button style={{ marginRight: "10px" }} type="button" className="btn btn-secondary" onClick={closeModalHandler}>{t("close")}</button>
                        <button type="button" className="btn btn-primary"   onClick={saveSponsoredTeamHandler}><FontAwesomeIcon icon={faSave} /></button>
                    </div>
                </div>
            </Modal.Footer>                
        </Modal>
    )
}

export default SponsorModal;