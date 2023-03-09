import React              from 'react'

import { 
    useCallback, 
    useState, 
    useEffect,
    useContext
}                         from "react";

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faPaperclip
}                         from '@fortawesome/pro-regular-svg-icons'

import AppContext         from '../context/AppContext';

const AttachmentIcon = (props) => {
    const context = useContext(AppContext);

    const [attachment, setAttachment] = useState(false);

    const attachmentHandler = useCallback(
        async () => {
            try {
                const request  = await fetch(`/api/v1/article/${props.id}/doc`, context.defaultHeaders);
                const response = await request.json();

                if( response.status && response.status === "error") {
                    throw new Error(response.message);
                }
                else {
                    setAttachment(response.attachment);
                }
            }
            catch(xx) {
                console.error("AttachmentIcon::attachmentHandler()", xx);
            }
        },
        [],
    );

    const getTarget = () => {
        if( props.target ) return props.target;
        return "_blank";
    }

    useEffect( 
        () => {
            attachmentHandler();
        }, 
        [attachmentHandler]
    );    

    return (
        <div>{ attachment ? <a href={attachment} target={getTarget()}><FontAwesomeIcon icon={faPaperclip} /></a> : "" }</div>
    );
}

export default AttachmentIcon;