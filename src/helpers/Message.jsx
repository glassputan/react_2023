import React from 'react';

import {
    useState
}            from 'react';

import Alert from 'react-bootstrap/Alert'

const Message = (props) => {
    const formState       = props.formState;

    const [show, setShow] = useState(true);

    // if(props.formState) {
    //     props.setFormState( props.formState );
    // }

    const getVariant = () => {
        if( formState && formState.variant ) {
            return formState.variant 
        }
        else if( props.variant ) {
            return props.variant;
        }
        else {
            return "";
        }
    }

    const getMessage = () => {
        if( formState && formState.message ) { 
            return formState.message 
        }
        else if( props.message ) {
            return props.message;
        }
        else {
            return "";
        }
    }

    if( getMessage().length == 0 ) return <></>

    return <Alert show={show} style={{marginTop: "10px"}} variant={getVariant()} onClose={() => setShow(false)} dismissible>{getMessage()}</Alert>
}

export default Message;