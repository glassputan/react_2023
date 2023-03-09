
import React, { 
    createContext,
    useContext 
}                               from 'react';

import { 
    useTranslation 
}                               from 'react-i18next';

import { 
    Link 
}                               from 'react-router-dom';

import { 
    FontAwesomeIcon 
}                               from '@fortawesome/react-fontawesome';

import { 
    faHome, faToolbox
}                               from '@fortawesome/pro-regular-svg-icons';

import logo                     from '../../assets/images/2016_hsc_logo_125_148.png';
import title                    from '../../assets/images/title-sm.png';
import union                    from '../../assets/images/union.png';
import union_affiliate          from '../../assets/images/union_affiliate_154_150.png';

import NavBar                   from './NavBar';
import Authentication           from './Authentication';
import AppContext               from '../../context/AppContext';



const Header = (props) => {
    const context = useContext(AppContext);
    
    const { t }    = useTranslation();
    
    const setLocaleHandler = (event) => {
        context.setLocale(event.target.value);
    }    

    return (
        <div className="container-fluid unset-margin">     
            <header className="row yellow_top"> 
                <div className="col-8 text-left">
                    <Link to="/">
                        <FontAwesomeIcon icon={faHome} size="2x" />
                    </Link>
                    &nbsp; 
                    { context.isAdmin && <span className="d-md-none"><Link to="/admin/menu" style={{ paddingRight: "10px"}}><FontAwesomeIcon size="2x" icon={faToolbox} /></Link></span> }
                    <label style={{ paddingRight: "10px"}} className="d-none d-md-inline">Locale:</label> 
                    <select  className="bg-gold rounded pad-top-2" onChange={setLocaleHandler} value={context.locale}>
                        <option value="en">EN</option>
                        <option value="es">Española</option>
                        <option value="ru">Rусский</option>
                    </select>                                      
                </div>           
                <div className="col-4 text-end" >
                    &nbsp;
                    <Authentication onSetError={props.onSetError} />
                    &nbsp;
                </div>
            </header>

            <div className="row">
                <div className="col">&nbsp;</div>
            </div>

            <div className="row" id="site_content">
                <div className="col">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="d-none d-lg-block d-xl-block col-lg-2">
                                <img  src={logo} alt="HSC" className="image-responsive" />
                            </div>
                            <div className="col-xs-9 d-lg-none d-xl-none text-center">
                                <img  src={title} alt="Hulmeville Soccer Club" className="text-center image-responsive" />
                            </div>
                            <div className="d-none col-lg-8 d-lg-block text-center" style={{ verticalAlign: "middle" }}>
                                <span style={{ fontFamily: "'Londrina Solid', cursive", color: "rgba(245, 196, 54, 1.0)", fontSize: "57pt"}}>
                                    <span>HULMEVILLE SOCCER&nbsp;</span><span>CLUB</span>
                                </span>
                            </div>
                            <div className="d-none d-lg-block d-xl-block col-lg-2 text-right">
                                <a href="https://www.philadelphiaunion.com/" target="_blank" rel="noreferrer">
                                    <img  src={union_affiliate} alt="Union" className="image-responsive" />
                                </a>
                            </div>

                            <div className="col-lg-2 d-none text-right">
                                <span className="fw-bold" style={{ color: "#fff" }}>{t('union_association_with')}:</span><br/>
                                <img  src={union} alt="Union" className="image-responsive" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col">
                            <NavBar onSetError={props.onSetError} />
                        </div>
                    </div>
                </div>
            </div>  
        </div>
    );
  }
  
  export default Header;