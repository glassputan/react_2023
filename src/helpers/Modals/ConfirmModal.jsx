import React                from 'react'; 

import Modal                from 'react-bootstrap/Modal';

import { 
    useTranslation 
}                           from 'react-i18next';


const ConfirmModal = (props) => {
    const {t} = useTranslation();

    const closeModalHandler = () => {
        if( props.onClose ) {
            props.onClose();
        }
        else {
            console.warn("Missing props 'onClose'");
        }
    }
    
    const continueHandler = () => {
        if( props.onContinue ) {
            props.onContinue(props.id);
        }
        else {
            console.warn("Missing props 'onContinue'");
        }
    }

    const getHeader = () => {
        if( props.header ) {
            return props.header;
        }
        else {
            return t("confirm_dialog");
        }
    }

    const getMessage = () => {
        if( props.message ) {
            return props.message;
        }
        else {
            return "Missing props 'message'";
        }
    }

    return(
        <Modal show={props.isVisible} onHide={closeModalHandler} >
            <Modal.Header>{getHeader()}</Modal.Header>
            <Modal.Body>{getMessage()}</Modal.Body>
            <Modal.Footer>
                <div className="row">
                    <div className="col text-end">
                        <button style={{ marginRight: "10px" }} type="button" className="btn btn-secondary" onClick={closeModalHandler}>{t("close")}</button>
                        { props.onContinue  && <button type="button" className="btn btn-primary"   onClick={continueHandler}>{t("continue")}</button> }
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    )

}

export default ConfirmModal;