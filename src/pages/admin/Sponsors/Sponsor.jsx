import 
    React,
    { 
        useContext,
        useEffect,
        useReducer,
        useState
    }                       from "react";

import { 
    useTranslation 
}                           from "react-i18next";

import { 
    Link, 
    useNavigate,
    useSearchParams
}                           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import { 
    faCopy,
    faHome,
    faSave,
    faTrash
}                           from '@fortawesome/pro-regular-svg-icons'

import Alert                from 'react-bootstrap/Alert';
import Button               from 'react-bootstrap/Button';
import Card                 from 'react-bootstrap/Card';
import Form                 from 'react-bootstrap/Form';
import BSImage              from "react-bootstrap/Image";
import Tabs                 from 'react-bootstrap/Tabs';
import Tab                  from 'react-bootstrap/Tab';
import Table                from 'react-bootstrap/Table';

import AppContext           from '../../../context/AppContext';
import DefaultLayout        from "../../../layouts/DefaultLayout";
import Row                  from '../../../helpers/Row';
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';

import SponsorModal         from './SponsorModal';

// import * as ActiveStorage   from "@rails/activestorage"
// import { 
//     DirectUpload 
// }                           from 'activestorage';

import SponsorModel         from '../../../models/SponsorModel';
import SponsoredTeam        from '../../../models/SponsoredTeam';

const Sponsor = (props) => {
//    ActiveStorage.start()

    const [searchParams, setSearchParams] = useSearchParams();

    const context    = useContext(AppContext);

    const {t}        = useTranslation();
    const navigate = useNavigate();

    const [isNew,           setIsNew]           = useState(true);

    const [sponsor,         setSponsor ]        = useState(new SponsorModel());
    const [binary,          setBinary ]         = useState({})
    const [imageURL,        setImageURL ]       = useState();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isModalVisible,  setModalVisible]    = useState(false);
    const [sponsoredTeam,   setSponsoredTeam]   = useState(new SponsoredTeam());
    const [sponsoredTeams,  setSponsoredTeams]  = useState([]);
    

    const [formState,       dispFormState     ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "ERROR":
                    return { state: "error",   message: action.message }
                case "SUCCESS":
                    return { state: "success", message: action.message }
                case "WARNING":
                    return { state: "warning", message: action.message }
                case "CLEAR_MESSAGE":
                    return { state: null,      message: null }
                default:
                    break;
            }
        }, 
        { state: "new", message: "New Member" }
    )
    
    const setError = (message) => {
        dispFormState({ event: "ERROR", message: message });
    }

    const setMessage = (message) => {
        dispFormState({ event: "SUCCESS", message: message });
    }    

    const uploadSponsorImage = (file, json) => {
        context.debug("Sponsor", "uploadSponsorImage()", json);

        if( isNew ) return;

        const upload = new DirectUpload(file, "/upload")

        upload.create(
            async ( error, blob ) => {
                if(error) {
                    console.error("uploadSponsorImage()", error);
                    // setError(error);
                }
                else {
                    const response  = await fetch(`/api/v1/sponsor/${sponsor.id}`,
                        {
                            ...context.defaultHeaders,
                            method: "PATCH",
                            body: JSON.stringify( { sponsor: { logo: blob.signed_id } })
                        }
                    );

                    if( response.ok ) {
                        const json = await response.json();
                        setMessage("Image saved.");
                        context.debug("Sponsor", "uploadSponsorImage(RESP)", json);
                        setImageURL(json.image_url);
                    }
                    else {
                        setError(response.statusText);
                    }
                }
            }
        );
    }

    const submitHandler = async (event) => {
        event.preventDefault();

        let actionURL = "/api/v1/sponsor";
        let record    = {
            ...context.defaultHeaders,
            body: JSON.stringify({ sponsor: sponsor }),
            method:  "POST"
        };

        if( !isNew ) {   
            actionURL = `${actionURL}/${sponsor.id}`;

            record = {
                ...record,
                method: "PATCH"
            };
        }

        context.debug("Sponsor", "submitHandler(): Sending...", record);

        const response = await fetch(actionURL, record);

        context.debug("Sponsor", "submitHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Sponsor", "submitHandler(2): Received...", json);

            setIsNew(false);

            if( json.status && json.status === "error") {
                setError(json.message);
            }
            else if( binary ) {
                uploadSponsorImage( binary, json );
            }
            else {
                const record = {
                    ...json.record,
                    updated_at: context.getFormattedDateTimeLocale(json.record.updated_at)
                }

                setSponsor(record);
                setImageURL(json.image_url);
            }

            setMessage("Sponsor saved.");
        }
    }

    const getSponsorHandler = async () => {
        setError(null);

        const sponsorId = searchParams.get("id");

        if(sponsorId) {
            setIsNew(false);

            const response  = await fetch(`/api/v1/sponsor/${sponsorId}`, context.defaultHeaders);

            if( response.ok ) {
                const json = await response.json();

                context.debug("Sponsor", "getSponsorHandler()", json);

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    const record = {
                        ...context.deNullObject(json.record),
                        updated_at: context.getFormattedDateTimeLocale(json.record.updated_at)
                    }
    

                    setSponsor(
                        {
                            ...record,
                            current:    record.current    ? "true" : "false",
                            show_label: record.show_label ? "true" : "false",
                        }
                    );

                    if( json.image_url ) {
                        setImageURL(json.image_url);
                    }

                    setMessage(`Sponsor '${record.company_name}' loaded.`);
                }
            }
            else {
                setError(response.statusText);
            }
        }
    };    

    const getSponsoredTeamsHandler = async () => {
        if( sponsor.id != "" && sponsor.id != "-1" ) {

            const actionURL = `/api/v1/sponsored_teams/${sponsor.id}`;

            context.debug("Sponsor", "getSponsoredTeamsHandler(): Sending...", actionURL);

            const response = await fetch(actionURL, context.defaultHeaders);

            if( response.ok ) {
                const json     = await response.json();

                context.debug("Sponsor", "getSponsoredTeamsHandler(2): Received...", json);

                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    setSponsoredTeams(json.records);
                }
            }
            else {
                setError(response.statusText);
            }
        }
    }    

    const deleteRecordHandler = () => {
        setShowDeleteModal(true);
    }

    const fieldChangeHandler = (event) => {
        context.debug("Sponsor", "fieldChangeHandler()", event);

        if(event.target.id === "sponsor" ) {
            setBinary( event.target.files[0] );
        }
        else {
            setSponsor(
                {
                    ...sponsor,
                    [event.target.id]: event.target.value
                }
            );

            context.debug("Sponsor", "fieldChangeHandler()", sponsor);
        }
    }

    const newSponsoredTeam = () => {
        setSponsoredTeam( new SponsoredTeam( { sponsor_id: sponsor.id, year: new Date().getFullYear(), shirt_text: sponsor.shirt_text  } ));
    }

    /**
     * 
     * @param { Integer } team_id 
     * @returns { JSONObject } The sponsored team object
     */
    const getSponsoredTeam = (team_id) => {
        context.debug("Sponsor", "getSponsoredTeam()", team_id);

        let record = null;

        sponsoredTeams.forEach(
            (team) => {
                if( team.id == team_id ) {
                    record = team;
                }
            }
        )

        return record;
    }

    const editSponsoredTeamHandler = (event) => {
        context.debug("Sponsor", "editSponsoredTeamHandler()", event);

        const st = getSponsoredTeam(event.target.parentNode.id);

        context.debug("Sponsor", "editSponsoredTeamHandler()", st);

        if( st ) {
            setSponsoredTeam(st);
        }
        else {
            console.error("editSponsoredTeamHandler(): Cannot find team!", event);
        }
    }    

    const onCloseModal = (event) => {
        context.debug("Sponsor", "onCloseModal()", event);
        setModalVisible(false);
    }

    const onCloseDeleteModal = () => {
        setShowDeleteModal(false);
    }

    const onDeleteSponsor = async (sponsor_id) => {
        context.debug("onDeleteSponsor()", sponsor_id);

        const response  = await fetch(
            `/api/v1/sponsor/${sponsor_id}`, { ...context.defaultHeaders, method: "DELETE" }
        );

        if( response.ok ) {
            navigate("/admin/sponsors");
        }
        else {
            setError(response.statusText);
        }
    }

    const onSaveSponsoredTeam = async () => {
        let actionURL = `/api/v1/sponsored_team`;
        let record = {
            ...context.defaultHeaders,
            body: JSON.stringify({ sponsored_team: sponsoredTeam }),
            method:  "POST"
        };

        if( sponsoredTeam.id != "" && sponsoredTeam.id != "-1" ) {
            actionURL = `${actionURL}/${sponsoredTeam.id}`;
            record    = {
                ...record,
                method: "PATCH"
            };
        }

        context.debug("Sponsor", "saveSponsoredTeam(): Sending...", record);

        const response = await fetch(actionURL, record);

        context.debug("Sponsor", "saveSponsoredTeam(1): Received...", response);

        if( response.ok ) {
            const json     = await response.json();

            context.debug("Sponsor", "saveSponsoredTeam(2): Received...", json);

            if( json.status && json.status === "error") {
                setError(json.message);
            }
            else {
                setMessage("Sponsored Team saved.");

                setSponsoredTeam(new SponsoredTeam());
                getSponsoredTeamsHandler();
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const sponsoredTeamFieldHandler = (event) => {
        setSponsoredTeam(
            {
                ...sponsoredTeam,
                [event.target.id]: event.target.value
            }
        )
    }

    useEffect(
        () => {
            if( sponsoredTeam.sponsor_id == "" ) {
                setModalVisible(false);
            }
            else {
                setModalVisible(true);
            }
        },
        [sponsoredTeam]
    )    

    useEffect(
        () => {
            getSponsoredTeamsHandler();
        },
        [sponsor.id]
    );

    useEffect(
        () => {
            context.debug("Sponsor", "useEffect(): sponsoredTeams changed.", sponsoredTeams);
        },
        [sponsoredTeams]
    );

    useEffect( 
        () => {
            getSponsorHandler();            
        }, 
        []
    );  
    
    useEffect(
        () => {
            context.debug("Sponsor", "useEffect()", sponsor);
        },
        [sponsor]
    )

    const onCloseMessageModal = () => {
        setError(null);
    }

    const continueHandler = () => {
        setError(null);
    }

    return (
        <DefaultLayout>
            
            <Row />
            <SponsorModal isVisible={isModalVisible}  onCloseModal={onCloseModal} record={sponsoredTeam} onSave={onSaveSponsoredTeam} onFieldChange={sponsoredTeamFieldHandler} />
            <ConfirmModal isVisible={showDeleteModal} message={`Delete ${sponsor.company_name}`} onClose={onCloseDeleteModal} onContinue={onDeleteSponsor} id={sponsor.id} />
            
            <form onSubmit={submitHandler}>
                <div className="news">  
                    <div className="row">
                        <div className="col-8">
                            <nav aria-label={t("breadcrumbs")}>
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                    <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/sponsors">{t('sponsors')}</Link></li>
                                    <li className="breadcrumb-item"><Link to="/admin/sponsor">{t('new')}</Link></li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col-4 text-end px-2">
                            <button onClick={submitHandler} className="btn btn-default" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></button>
                            <div    className="btn btn-default"         style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></div>
                            <div    className="btn btn-outline-danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" onClick={deleteRecordHandler} /></div>
                        </div>
                    </div>

                    { formState && formState.state && <Alert style={{ marginTop: "10px" }} variant={formState.state}>{formState.message}</Alert> }

                    <Row />

                    <div className="row">
                        <div className="col-4">
                            <Form.Label>{t("company_name")}</Form.Label>
                            <input type="text" id="company_name" className="form-control" onChange={fieldChangeHandler} defaultValue={sponsor.company_name} />
                        </div>
                        <div className="col-4">
                            <Form.Label>{t("current")}</Form.Label>
                            <Form.Select id="current" className="form-control" onChange={fieldChangeHandler} value={sponsor.current}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>                                
                            </Form.Select>
                        </div>
                        <div className="col-4">
                            <Form.Label>{t("sponsor_type")}</Form.Label>
                            <Form.Select id="sponsor_type" onChange={fieldChangeHandler} className="form-control" value={sponsor.sponsor_type}>
                                <option value=""></option>
                                <option value="single">{t("single")}</option>
                                <option value="blue">{t("blue")}</option>
                                <option value="gold">{t("gold")}</option>
                            </Form.Select>
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-4">
                            <Form.Label>{t("image_label")}</Form.Label>
                            <Form.Select onChange={fieldChangeHandler} id="show_label" value={sponsor.show_label}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </Form.Select>
                        </div>        
                        <div className="col-4">
                            <Form.Label>{t("shirt_text")}</Form.Label>
                            <Form.Control type="text" id="shirt_text" onChange={fieldChangeHandler} value={sponsor.shirt_text} />
                        </div>            
                        <div className="col-4">
                            <Form.Label>{t("created_by")}</Form.Label>
                            <Form.Control type="text" id="created_by" readOnly value={sponsor.created_by} />
                        </div>
                    </div>

                    <Row /> 

                    <div className="row">
                        <div className="col-4">
                            <Form.Label>{t("sponsor_first")}</Form.Label>
                            <Form.Control type="number" min="2000" id="first_sponsored" onChange={fieldChangeHandler} value={sponsor.first_sponsored} />
                        </div>
                        <div className="col-4">
                            <Form.Label>{t("sponsor_last")}</Form.Label>
                            <Form.Control type="number" min="2020" id="last_sponsored" onChange={fieldChangeHandler} value={sponsor.last_sponsored} />
                        </div>
                        <div className="col-4">
                            <Form.Label>{t("updated_at")}</Form.Label>
                            <Form.Control type="datetime-local" id="updated_at" readOnly value={sponsor.updated_at} />
                        </div>
                    </div>  

                    <Row />
                    <Row />

                    <Tabs defaultActiveKey="image" id="uncontrolled-tab-example" className="mb-3">
                        <Tab eventKey="image" title={t("logo")}>
                            <Card>
                                <Card.Header>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="contact-title">{t("logo")}</div>
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div className="row">
                                        <div className="col-5">
                                            <div className="row">
                                                <div className="col">
                                                    <Form.Label>{t("file")}</Form.Label>
                                                    <Form.Control type="file" id="sponsor" onChange={fieldChangeHandler} />
                                                </div>
                                            </div>

                                            <Row />

                                            <div className="row">
                                                <div className="col">
                                                    <Form.Label>{t("sponsor_url")}</Form.Label>
                                                    <Form.Control type="text" hint={t("target_url_help")} id="company_url" value={sponsor.company_url} onChange={fieldChangeHandler} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-3">&nbsp;</div>
                                        <div className="col-4">
                                            { imageURL && <BSImage src={imageURL} fluid />}
                                            
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Tab>                        
                        <Tab eventKey="contact" title={t("contact")}>
                            <Card>
                                <Card.Header>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="contact-title">{t("contact")}</div>
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div className="row">
                                        <div className="col-6">
                                            <Form.Label>{t("first_name")}</Form.Label>
                                            <input type="text" id="first_name" className="form-control" value={sponsor.first_name} onChange={fieldChangeHandler}  />
                                        </div>
                                        <div className="col-6">
                                            <Form.Label>{t("last_name")}</Form.Label>
                                            <input type="text" id="last_name" className="form-control" value={sponsor.last_name} onChange={fieldChangeHandler}  />
                                        </div>
                                    </div>

                                    <Row />
                                    
                                    <div className="row">
                                        <div className="col-6">
                                            <Form.Label>{t("office_phone")}</Form.Label>
                                            <input type="phone" id="office_phone" className="form-control" value={sponsor.office_phone} onChange={fieldChangeHandler}  />
                                        </div>
                                        <div className="col-6">
                                            <Form.Label>{t("email")}</Form.Label>
                                            <input type="text" id="email" className="form-control" value={sponsor.email} onChange={fieldChangeHandler}  />
                                        </div>
                                    </div>

                                    <Row />     
                                    <div className="row">
                                        <div className="col">
                                            <Form.Label>{t("notes")}</Form.Label>
                                            <textarea id="notes" className="form-control" value={sponsor.notes} onChange={fieldChangeHandler} ></textarea>
                                        </div>
                                    </div>                            
                                </Card.Body>
                            </Card>
                        </Tab>
                        <Tab eventKey="address" title={t("address")}>
                            <Card>
                                <Card.Header>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="contact-title">{t("address")}</div>
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div className="row">
                                        <div className="col-6">
                                            <Form.Label>{t("address")}</Form.Label>
                                            <Form.Control type="text" id="address_line1" value={sponsor.address_line1} onChange={fieldChangeHandler} />
                                        </div>
                                        <div className="col-6">
                                            <Form.Label>{t("public_phone")}</Form.Label>
                                            <Form.Control type="text" id="public_phone" value={sponsor.public_phone} onChange={fieldChangeHandler} />
                                        </div>

                                    </div>  
                                    <Row /> 
                                    <div className="row">
                                        <div className="col-6">
                                            <Form.Label>{t("address")}</Form.Label>
                                            <Form.Control type="text" id="address_line2" value={sponsor.address_line2} onChange={fieldChangeHandler} />
                                        </div>
                                    </div>  
                                    <Row /> 
                                    <div className="row">
                                        <div className="col-4">
                                            <Form.Label>{t("city")}</Form.Label>
                                            <Form.Control type="text" id="city" value={sponsor.city} onChange={fieldChangeHandler} />
                                        </div>
                                        <div className="col-4">
                                            <Form.Label>{t("state")}</Form.Label>
                                            <Form.Control type="text" id="state" value={sponsor.state} onChange={fieldChangeHandler} />
                                        </div>
                                        <div className="col-4">
                                            <Form.Label>{t("zip_code")}</Form.Label>
                                            <Form.Control type="text" id="zip_code" value={sponsor.zip_code} onChange={fieldChangeHandler} />
                                        </div>
                                    </div>  
                                    <Row /> 
                                </Card.Body>
                            </Card>
                        </Tab>

                    </Tabs>

                    <Row />



                    <Row />

                    <Tabs defaultActiveKey="navigate" id="tabs" className="mb-3">
                        <Tab eventKey="navigate" title={t("navigate")}>
                            <Card>
                                <Card.Header>
                                    <div className="text-end">
                                        <Button onClick={newSponsoredTeam}>{t("new")}</Button>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>{t("year")}</th>
                                                <th>{t("divisions")}</th>
                                                <th>{t("shirt_color")}</th>
                                                <th>{t("with_player")}</th>
                                                <th className="text-end">{t("total_contribution")}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                sponsoredTeams.map(
                                                    (team) => {
                                                        return <tr onDoubleClick={editSponsoredTeamHandler} key={team.id} id={team.id}>                                                            
                                                            <td>{team.year}</td>
                                                            <td>{ JSON.parse(team.divisions).join(",") }</td>
                                                            <td>{team.shirt_color}</td>
                                                            <td>{team.player_name}</td>
                                                            <td className="text-end">{team.total_contribution}</td>
                                                        </tr>
                                                    }
                                                )
                                            }
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>                     
                </div>
            </form>
        </DefaultLayout>
    )
}

export default Sponsor;