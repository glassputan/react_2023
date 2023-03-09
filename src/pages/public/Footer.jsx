import React              from 'react'

function Footer(props) {
    return (
        <div className="row footer text-center">
            <div className="col">
                <div className="row">
                    <div className="col text-left">
                        <hr/>
                    </div>
                </div>
                <div className="row ">
                    <div className="col-6 text-left">
                        Club suggestions, comments, issues? <br/>
                        <a href="mailto:info@hulmevillesoccer.org">info@hulmevillesoccer.org</a>
                    </div>    
                    <div className="col-6 text-right">
                        <a href="https://app.termly.io/document/privacy-policy/3abeddef-9290-41cd-adbe-74ee02e7026d">Privacy Policy</a>
                    </div>    
                </div>

                <div className="row"><div className="col">&nbsp;</div></div>
                <div className="row"><div className="col">&nbsp;</div></div>
            </div>
        </div>
    )
}

export default Footer;