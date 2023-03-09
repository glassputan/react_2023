import 
    React,
    {
        useContext,
        useCallback,
        useEffect,
        useState
    }                       from 'react';

import { useTranslation }   from "react-i18next";

import { Link }             from 'react-router-dom'

import Alert                from 'react-bootstrap/Alert';
import Table                from 'react-bootstrap/Table';

import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome'

import { faHome }         from '@fortawesome/pro-regular-svg-icons';

import DefaultLayout        from "../../layouts/DefaultLayout";
import AppContext           from '../../context/AppContext';
import Row                  from '../../helpers/Row'
import ImageAttachment      from '../../helpers/ImageAttachment';

import Article              from "./Article";

const Sponsor = (props) => {
    const sponsor = props.record;
    const context = useContext(AppContext);

    const goToLocation = (event) => {
        if( sponsor.company_url ) window.open(sponsor.company_url, '_blank');
    }

    return (
        <tr onClick={goToLocation} id={sponsor.id}>
            <td className={sponsor.sponsor_type}>&nbsp;</td>
            <td>
                <ImageAttachment type="sponsor" image={sponsor.id} />
            </td>
            <td>
                {
                    sponsor.company_url ? <a href={sponsor.company_url} target="_blank">{sponsor.company_name}</a> : sponsor.company_name
                }
                {
                    sponsor.address_line1.length > 0 &&
                    <address>
                        {sponsor.address_line1}<br/>
                        {sponsor.address_line2 ? sponsor.address_line2 : ""}{sponsor.address_line2.length > 0 ? <br/> : ""}
                        {sponsor.city}, {sponsor.state} {sponsor.zip_code}
                    </address>
                }
            </td>
            <td>{sponsor.public_phone}</td>
        </tr>
    )
}

/**
 * 
 * @returns The Travel Page
 */
const Sponsors = () => {
    const context  = useContext(AppContext);

    const { t }    = useTranslation();

    const [ isLoading, setLoading  ] = useState(false);
    const [ sponsors,  setSponsors ] = useState([]);
    const [ error,     setError    ] = useState();
    

    const getListSponsorHandler = useCallback(
        async () => {
            setLoading(true);
            setError(null);
    
            const request  = await fetch("/api/v1/sponsors/active", context.defaultHeaders);

            if( request.ok ) {
                const response = await request.json();

                context.debug("Sponsors", "getListSponsors(RSVP)", response);

                if( response.status && response.status === "error") {
                    setError(response.message);
                }
                else {
                    setSponsors(response.records);
                }
            }
            else {
                setError( request.statusText );
            }
    
            setLoading(false);
        },
        [],
    );

    useEffect( 
        () => {
            getListSponsorHandler();
        }, 
        [getListSponsorHandler]
    );       

    return (
        <DefaultLayout>
            <div className="news">
                <Row />  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item">{ t('about') }</li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/sponsors">{t('sponsors')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                { error && <Alert variant="danger">${error}</Alert> }

                <Row><Article title="Sponsors"/></Row>

                <Table hover className="sponsor">
                    <thead>
                        <tr className="header">
                            <th style={{ width: "25px" }}>&nbsp;</th>
                            <th>&nbsp;</th>
                            <th>{t("sponsor")}</th>                            
                            <th>{t("phone_number")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            isLoading && !error && <tr><td colSpan="4">{t("loading")}</td></tr>
                        }

                        {
                            !isLoading && !error && Array.isArray(sponsors) &&
                            sponsors
                            .sort(
                                (a, b) => {
                                    var nameA = a.company_name.toUpperCase(), // ignore upper and lowercase
                                        nameB = b.company_name.toUpperCase(); // ignore upper and lowercase
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .sort(
                                (a, b) => {
                                    var nameA = (a.sponsor_type == "gold" ? -1 : 0), 
                                        nameB = (b.sponsor_type == "gold" ? -1 : 0); 
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .sort(
                                (a, b) => {
                                    var nameA = (a.sponsor_type == "blue" ? -1 : 0), 
                                        nameB = (b.sponsor_type == "blue" ? -1 : 0); 
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )                            
                            .map(
                                (sponsor) => { return <Sponsor key={sponsor.id} record={sponsor} image={sponsor.id} /> }
                            )
                        }
                    </tbody>
                </Table>
            </div>
        </DefaultLayout>
    )
}

export default Sponsors;