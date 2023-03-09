import React                from 'react'

import { 
    useCallback, 
    useState
}                           from "react";

import { useTranslation }   from "react-i18next";

import Button           from 'react-bootstrap/Button';
import Modal            from 'react-bootstrap/Modal';
import Image            from 'react-bootstrap/Image';

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import { 
    faClipboard,
    faFilePdf,
    faFile,
    faMap
}                           from '@fortawesome/pro-regular-svg-icons'
import { faFileWord } from '@fortawesome/pro-solid-svg-icons';

const Attachment = (props) => {
    const [modalVisible, setModalVisible] = useState(false);

    const {t} = useTranslation();

    const getIcon = () => {
        if( props.target.indexOf("pdf")  > 0 ) return faFilePdf;
        if( props.target.indexOf("docx") > 0 ) return faFileWord;

        switch(props.type) {
            case 'map': return faMap
            default:    return faFile
        }
    }

    const copyToClipboard = useCallback(
        async () => {
            await navigator.clipboard.writeText(props.target);

            setModalVisible(true);

            setTimeout(
                () => {
                    setModalVisible(false);
                }, 
                3000
            );
        }   
    )

    return (
        <>
            { 
                props.target && props.type != "image" &&
                    <div className="row">
                        <div className="col-6 h5">{t("attachment")}</div>
                        <div className="col-4">
                            <a href={props.target} target="_blank"><FontAwesomeIcon icon={getIcon()} size="4x" /></a>
                        </div>
                        <div className="col-2">
                            <FontAwesomeIcon icon={faClipboard} onClick={copyToClipboard} size="2x" />
                        </div>
                    </div> 
            }

            {
                props.target && props.type == "image" &&
                <div className="row">
                    <div className="col-10">
                        <Image src={props.target} fluid /> : 
                    </div>
                    <div className="col-2">
                       <FontAwesomeIcon icon={faClipboard} onClick={copyToClipboard} size="2x" />
                    </div>
                </div> 
            }

            { !props.target && <h5>No attachment...</h5> }
 
            <Modal show={modalVisible} >
                <Modal.Header closeButton>
                    <Modal.Title>{t("system_event")}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>{t("attachment_copy_to_clipboard")}</p>
                </Modal.Body>

                <Modal.Footer>
                    <div className="row">
                        <div className="col text-end">
                            <Button onClick={ () => setModalVisible(false) }>{t("close")}</Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>

        </>
    )
}

export default Attachment;