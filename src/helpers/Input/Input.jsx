import React, { useRef, useImperativeHandle } from 'react'

const Input = React.forwardRef((props, ref) => {
    const inputRef = useRef();
    
    const activateField = () => {
        inputRef.current.focus();
    }

    useImperativeHandle(ref, () => {
        return {
            focus: activateField
        }
    })

    return (
        <React.Fragment>
            <label htmlFor={props.id} className="form-label">{props.label}</label>
            <input 
                className="form-control"
                ref={inputRef}
                type={props.type}
                id={props.id}
                value={props.value}
                onChange={props.onChange}
                onBlur={props.onBlur}
            />
            <div className="invalid-feedback">
                Please provide a valid {props.label}.
            </div>
        </React.Fragment>
    )
});

export default Input;