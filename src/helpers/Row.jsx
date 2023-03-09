import React              from 'react'

const Row = (props) => {
    return (
        <div className="row">
            <div className={`'col${ props.width ? "-${props.width}" : "" }' ${ props.align ? "\'text-${props.align}\'" : "" }` }>
                {props.children ? props.children : <div>&nbsp;</div> }
            </div>
        </div>        
    )
}

export default Row;