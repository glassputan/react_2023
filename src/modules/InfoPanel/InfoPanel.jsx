import React                from 'react'

import { 
    useTranslation 
}                           from 'react-i18next';

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import { 
    faAt
}                           from '@fortawesome/pro-regular-svg-icons'

import { 
    faFacebookSquare,
    faTwitterSquare,
    faInstagram
}                           from '@fortawesome/free-brands-svg-icons'

import ClubEvents           from './ClubEvents/ClubEvents'
import Facebook             from './Facebook'
import Fact                 from './Fact';
import FieldStatus          from './FieldStatus';
import Sponsor              from './Sponsor';

import WelcomeBack          from './WelcomeBack'


function InfoPanel(props) {
    const { t } = useTranslation(props.locale);

    /**
     * 
     * @returns {String} A random message of the day.
     */
    function getMessageOfTheDay() {
        return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi semper eleifend velit, blandit accumsan neque aliquet.";
    }

    return (
        <div className="container-fluid">
            <WelcomeBack />

            <FieldStatus />

            {/* <div className="row">
                <div className="col quicklink d-none d-md-block d-lg-block d-xl-block">
                    <ul>{ t('covid_status') }</ul>
                    <div className="col alert alert-warning link" ng-click="goto('/covid')">{ t('covid_status_message') }</div>
                </div>
            </div> */}

            <Sponsor />

            <ClubEvents />

            {/* <Fact /> */}
            
            <div className="row">
                <div className="col">&#xa0;</div>
            </div>    

            <div className="row">
                <div className="col quicklink">
                    <ul>{ t('social_media') }</ul>
                </div>
            </div>
            
            <div className="row">
                <div className="col quicklink">
                    <div className="row" style={{ marginBottom: "10px" }}>
                        <div className="col-2">&nbsp;</div>

                        <div className="col-2">
                            <a href="https://www.facebook.com/hulmevillesoccer" target="_blank" rel="noreferrer" >
                                <FontAwesomeIcon icon={faFacebookSquare} size="2x" aria-hidden="true" className="menu_link" />
                            </a>
                        </div>

                        <div className="col-2">
                            <a href="https://twitter.com/HulmevilleSC" target="_blank" rel="noreferrer" >
                                <FontAwesomeIcon icon={faTwitterSquare} size="2x" aria-hidden="true" className="menu_link" />
                            </a>
                        </div>

                        <div className="col-2">
                            <a href="http://eepurl.com/cfye1L" target="_blank" rel="noreferrer" >
                                <FontAwesomeIcon icon={faAt} size="2x" aria-hidden="true" className="menu_link" />
                            </a><br/>
                        </div>

                        <div className="col-2">
                            <a href="https://www.instagram.com/hulmeville_soccer_club/" target="_blank" rel="noreferrer" >
                                <FontAwesomeIcon icon={faInstagram} size="2x" aria-hidden="true" className="menu_link" />
                            </a>
                        </div>
                        <div className="col-2">&nbsp;</div>
                    </div>
                </div>
            </div>

            <div className="row  d-none d-md-block d-lg-block d-xl-block">
                <div className="col quicklink"><ul>{ t('facebook') }</ul></div>
            </div>

            <Facebook />

            <div className="row"><div className="col-12">&nbsp;</div></div>
            <div className="row"><div className="col-12">&nbsp;</div></div>   
        </div>
    );
}

export default InfoPanel;