import React, { useState } from 'react';

import Alert    from 'react-bootstrap/Alert'
import Button   from 'react-bootstrap/Button'

const Errors = (props) => {
    const [show, setShow] = useState(true);

    if (show) {
        return props.messages.map(
            (warning) => {
                return (
                    <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                        <Alert.Heading>{warning.message || warning }</Alert.Heading>
                        <p>{warning.detail || ""}</p>
                    </Alert>
                )
            }
        );
    }

    return <a href="javascript: void(0)" onClick={() => setShow(true)}>Show Errors</a>; 
}

export default Errors;