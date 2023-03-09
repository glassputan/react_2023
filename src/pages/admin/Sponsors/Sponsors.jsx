import React              from 'react'

import { 
    useCallback, 
    useState, 
    useEffect,
    useContext,
    useReducer
}                         from "react";

import { useTranslation } from "react-i18next";
import { Link }           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                         from '@fortawesome/pro-regular-svg-icons'

import Table              from 'react-bootstrap/Table';

import DefaultLayout      from "../../../layouts/DefaultLayout"          //"../../../../layouts/DefaultLayout";
import Row                from '../../../helpers/Row';
import Message            from '../../../helpers/Message';
import ImageAttachment    from '../../../helpers/ImageAttachment';

import AppContext         from '../../../context/AppContext'

const Sponsor = (props) => {
    const context = useContext(AppContext);

    const sponsor = props.sponsor;

    const upcase = (text) => {

        try {
            return text[0].toUpperCase() + text.substring(1);
        }
        catch(xx) {

        }

        return text;
    }

    const getImage = () => {
        if(props.image) {
            return props.image;
        }
        else {
            context.warn("Sponsors", "getImage()", "Missing 'image' attribute!");
        }
    }

    return (
            <tr>
                <td>
                    <Link to={`/admin/sponsor?id=${sponsor.id}`}>{sponsor.company_name}</Link>
                </td>
                <td>
                    { sponsor.current ? "True" : "False" }
                </td>
                <td>
                    { upcase(sponsor.sponsor_type) }
                </td>
                <td>
                   <ImageAttachment type="sponsor" image={getImage()} />
                </td>
            </tr>
    )
}

const Sponsors = () => {
    const {t} = useTranslation();

    const [isLoading, setIsLoading]  = useState(false);
    const [sponsors,  setSponsors ]  = useState([]);

    const [ formState,       dispFormState     ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "ERROR":
                    return { state: "danger",  message: action.message }
                case "SUCCESS":
                    return { state: "success", message: action.message }
                case "WARNING":
                    return { state: "warning", message: action.message }
                default:
                    return {};
            }
        }, 
        {}
    );
    
    const setError = (message) => {
        if( message ) {
            dispFormState({ event: "ERROR",     message: message });
        }
        else {
            dispFormState({ event: "CLEAR" });
        }
    }

    const setMessage = (message) => {
        dispFormState({ event: "SUCCESS",   message: message });
    }    

    const context = useContext(AppContext);

    const sponsorHandler = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);
    
            const response  = await fetch("/api/v1/sponsors", context.defaultHeaders);

            if( response.ok ) {
                const json = await response.json();

                context.debug("Sponsors", "getListSponsors(RSVP)", json);

                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    setSponsors(json.records);
                }
            }
            else {
                setError(response.statusText);
            }
    
            setIsLoading(false);
        },
        [],
    );

    useEffect( 
        () => {
            sponsorHandler();
        }, 
        [sponsorHandler]
    );    

    return (
        <DefaultLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/sponsors">{t('sponsors')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/sponsor">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <Row />

                <Message formState={formState} />

                <Row />

                <Table striped hover bordered>
                        <thead>
                            <tr>
                                <th>{t("company_name")}</th>
                                <th>{t("current")}</th>
                                <th>{t("sponsor_level")}</th>
                                <th>{t("logo")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            { 
                              !isLoading && 
                                sponsors.sort(
                                    (a, b) => {
                                        var nameA = (a.company_name || "").toUpperCase(), // ignore upper and lowercase
                                            nameB = (b.company_name || "").toUpperCase(); // ignore upper and lowercase
                                    
                                        if (nameA < nameB) { return -1; }
                                        if (nameA > nameB) { return  1; }
                                        return 0;
                                    }
                                )
                                .map(
                                    (sponsor) => {
                                        return (
                                            <Sponsor key={sponsor.id} sponsor={sponsor} image={sponsor.id} />
                                        )
                                    }
                                )
                            }
                            {  isLoading && <tr><td colSpan="4">Loading...</td></tr> }
                        </tbody>
                    </Table>


                <Row />
            </div>
        </DefaultLayout>
    )
}

export default Sponsors;