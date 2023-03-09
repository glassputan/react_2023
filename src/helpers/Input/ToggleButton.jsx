import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const CheckedIcon   = () => <>🌜</>;
const UncheckedIcon = () => <>🌞</>;

const ToggleButton = (props) => {
    const [toggle, setToggle]   = useState(false);
    const { defaultValue, onChange, disabled, className, id, name } = props;
    const [control, setControl] = useState(
        {
            "id":      id,
            "name":    name,
            "value":   false,
            "loading": true
        }
    ); 

    useEffect(
        () => {
          // console.info(`The 'toggle' property of ${name} changed to '${toggle}'`);

            if( !control.loading && typeof onChange === 'function' ) {
               onChange( { "target": { "id": id, "value": toggle }} );
            }
        },
        [toggle]
    )
    //EHT4cytWz$^&6s
    useEffect(
        () => {
            if (defaultValue != undefined) {
                console.warn(`Setting default value of ${control.name} (${id}) to ${defaultValue}`);
                setToggle(defaultValue);
            }
            else {
              // console.info(`The property defaultValue for ${control.name} (${id}) was not found.`);
            }

            setControl(
                {
                    ...control,
                    "loading": false
                }
            );
        },
        []
    )
        
    const getIcon = (type) => {
        const { icons } = props;
        if ( ! icons ) {
            return null;
        }
    
        return icons[type] === undefined ?
            ToggleButton.defaultProps.icons[type] :
            icons[type];
    }

    const triggerToggle = () => {
      // console.info("triggerToggle()");

        if ( disabled ) {
            return;
        }
    
        setToggle(!toggle);
    }

    const toggleClasses = classNames(
        'wrg-toggle', 
        {
            'wrg-toggle--checked': toggle,
            'wrg-toggle--disabled': disabled
        }, 
        className
    );    

    return(
        <div onClick={triggerToggle} className={toggleClasses} style={{ paddingTop: "10px" }}>
            <div className="wrg-toggle-container">
                <div className="wrg-toggle-check">
                    <span style={{ color : "white", paddingTop: "10px"  }}>{ getIcon('checked') }</span>
                </div>
                <div className="wrg-toggle-uncheck">
                    <span style={{ color : "white", paddingTop: "10px" }}>{ getIcon('unchecked') }</span>
                </div>
            </div>
            <div style={{ paddingTop: "20px" }} className="wrg-toggle-circle"></div>
            <input type="checkbox" aria-label="Toggle Button" style={{ paddingTop: "10px" }} className="wrg-toggle-input" />
        </div>
    )
}

ToggleButton.defaultProps = {
    icons: {
        checked: <CheckedIcon />, 
        unchecked: <UncheckedIcon />
    }
};

ToggleButton.propTypes = {
    name:           PropTypes.string,
    id:             PropTypes.string,
    disabled:       PropTypes.bool,
    defaultValue:   PropTypes.bool,
    className:      PropTypes.string,
    onChange:       PropTypes.func,
    icons:          PropTypes.oneOfType(
        [
            PropTypes.bool,
            PropTypes.shape(
                {
                    "checked": PropTypes.node,
                    "unchecked": PropTypes.node
                }
            )
        ]
    )
};    

export default ToggleButton;