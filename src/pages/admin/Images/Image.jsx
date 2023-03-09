import 
    React,
    { 
        useCallback, 
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
    faTrash,
    faClipboard
}                           from '@fortawesome/pro-regular-svg-icons'

import Form                 from 'react-bootstrap/Form';
import BSImage              from 'react-bootstrap/Image';
import Alert                from 'react-bootstrap/Alert';

import AppContext           from '../../../context/AppContext';
import DefaultLayout        from "../../../layouts/DefaultLayout";
import Row                  from '../../../helpers/Row';
import Message              from '../../../helpers/Message';
import Attachment           from '../../../helpers/Attachment';

import ImageModel           from '../../../models/ImageModel';

// import * as ActiveStorage   from "@rails/activestorage"
// import { 
//     DirectUpload 
// }                           from 'activestorage';

import ConfirmModal from '../../../helpers/Modals/ConfirmModal';


const Image = (props) => {
    ActiveStorage.start();

    const navigate    = useNavigate();

    const context    = useContext(AppContext);
    const {t}        = useTranslation();

    const [isNew,           setIsNew]           = useState(true);
    const [image,           setImage ]          = useState(new ImageModel());
    const [binary,          setBinary ]         = useState({})
    const [imageURL,        setImageURL ]       = useState();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [ formState,      dispFormState  ]    = useReducer(
        (current, action) => {
            switch(action.event) {
                case "MESSAGE":
                    return { variant: "",        message: action.message  }
                case "SUCCESS":
                    return { variant: "success", message: action.message  }
                case "WARNING":
                    return { variant: "warning", message: action.message  }
                case "ERROR":
                    return { variant: "danger",   message: action.message }
                default:
                    return {};
            }
        }, 
        {}
    )

    const [searchParams, setSearchParams] = useSearchParams();

    const setError = (message) => {
        dispFormState( { event: "ERROR", message: message });
    }     

    const setSuccess = (message) => {
        dispFormState( { event: "SUCCESS", message: message });
    }

    const setMessage = (message) => {
        dispFormState( { event: "MESSAGE", message: message });
    }

    const uploadImage = (file, json) => {
        context.debug("Image", `uploadImage(Record: ${json.id})`, json);

        const upload = new DirectUpload(file, "/upload")

        upload.create(
            async ( error, blob ) => {
                if(error) {
                    setError(error);
                }
                else {

                    const headers = {
                        ...context.defaultHeaders,
                        body: JSON.stringify({ image: { image: blob.signed_id }}),
                        method: "PATCH"
                    }

                    const response = await fetch(`/api/v1/image/${json.id}`, headers);

                    if( response.ok) {
                        const json     = await response.json();

                        context.debug("Image", "uploadImage()", json) 
    
                        setImageURL(json.image_url)
                        setIsNew(false);
                        setSuccess("Image updated.");    
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

        let target  = "",
            headers = "";

        setImage( 
            {
                ...image,
                approved:   image.approved   == "true" ? true : false,
                show_label: image.show_label == "true" ? true : false
            }
        );

        if(isNew) {
            target  = "/api/v1/image";
            headers = {
                ...context.defaultHeaders,
                body: JSON.stringify({ image: image }),
                method:  "POST"
            };
        }
        else {
            target  = `/api/v1/image/${image.id}`;
            headers = {
                ...context.defaultHeaders,
                body: JSON.stringify({ image: image }),
                method:  "PATCH"
            };
        }

        context.debug("Image", `submitHandler(): ${headers.method} to ${target}.`, image);

        const response = await fetch(target, headers);

        context.debug("Image", "submitHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Image", "submitHandler(2): Received...", json);

            if( json.status === "error") {
                setError(json.message);
            }
            else if( binary ) {
                uploadImage( binary, json.record );
                setSuccess("Image saved.");
            }
            else {
                setImage(json.record);
                setImageURL(json.image_url);
                setIsNew(false);

                setSuccess("Image saved.");
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const getImageHandler = useCallback(
        async () => {
            setError(null);

            const imageId = searchParams.get("id");

            if(imageId) {
                setIsNew(false);

                const response  = await fetch(`/api/v1/image/${imageId}`);

                if(response.ok) {
                    const json = await response.json();
    
                    context.debug("Image", "getImageHandler()", json);
    
                    if( json.status === "error") {
                        setError(response.message);
                    }
                    else {

                        const record = context.deNullObject(json.record);

                        record.approved   = record.approved.toString();
                        record.show_label = record.show_label.toString();

                        setImage(record);

                        if( json.image_url ) {
                            setImageURL(json.image_url);
                        }
                    }
                }
                else {
                    setError(response.statusText);
                }
            }
        },
        [],
    );

    const onDeleteRecordHandler = async () => {
        const headers  = {
            ...context.defaultHeaders,
            method: "DELETE"
        };

        const response = fetch(`/api/v1/image/${image.id}`, headers);

        if( response.ok ) {
            deleteModalCloseHandler();
            navigate("/admin/images");
        }
        else {
            setError(response.statusText);
        }
    }

    const deleteRecordHandler = () => {
        setShowDeleteModal(true);
    }

    const deleteModalCloseHandler = () => {
        setShowDeleteModal(false);
    }

    useEffect( 
        () => {
            if( isNew ) {
                setMessage("New Image");
            }

            getImageHandler();
        }, 
        [getImageHandler]
    );    

    const fieldChangeHandler = (event) => {

        if(event.target.id === "image" ) {
            setBinary( event.target.files[0] );
        }
        else {
            setImage(
                {
                    ...image,
                    [event.target.id]: event.target.value
                }
            );
        }
    }

    return (
        <DefaultLayout>
            
            <Row />

            <form onSubmit={submitHandler}>
                <div className="news">  
                    <div className="row">
                        <div className="col-8">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                    <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/images">{t('images')}</Link></li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col-4 text-end px-2">
                            <button onClick={submitHandler} className="btn btn-default" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></button>
                            <div    className="btn btn-default"         style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></div>
                            <div    className="btn btn-outline-danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" onClick={deleteRecordHandler} /></div>
                        </div>
                    </div>

                    <Row />

                    <Message formState={formState} />
                    
                    <ConfirmModal   message={t("confirm_delete")} 
                                    header={`${t("delete")} '${image.name}'`} 
                                    onContinue={onDeleteRecordHandler} 
                                    isVisible={showDeleteModal} 
                                    onClose={deleteModalCloseHandler} 
                    />

                    <div className="row">
                        <div className="col-4">
                            <label>{t("name")}</label>
                            <Form.Control type="text" id="name" onChange={fieldChangeHandler} defaultValue={image.name} />
                        </div>
                        <div className="col-4">
                            <label>{t("approved")}</label>
                            <Form.Select id="approved" onChange={fieldChangeHandler} value={image.approved}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>                                
                            </Form.Select>
                        </div>
                        <div className="col-4">
                            <label>{t("image_type")}</label>
                            <Form.Select id="image_type" onChange={fieldChangeHandler} value={image.image_type}>
                                <option value="carousel">Carousel</option>
                                <option value="email">Email</option>
                                <option value="sponsor">Sponsor</option>
                            </Form.Select>
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-4">
                            <label>{t("show_label")}</label>
                            <Form.Select onChange={fieldChangeHandler} hint={t("show_label_help")} id="show_label" value={image.show_label}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </Form.Select>
                        </div>        
                        <div className="col-4">
                            <label>{t("label")}</label>
                            <Form.Control type="text" id="label" onChange={fieldChangeHandler} value={image.label} />
                        </div>            
                        <div className="col-4">
                            <label>{t("order")}</label>
                            <Form.Control 
                                type="number" 
                                step="1" 
                                id="order" 
                                className="form-control"
                                onChange={fieldChangeHandler} 
                                value={image.order} 
                            />
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-12">
                            <label>{t("target_url")}</label>
                            <Form.Control type="text" hint={t("target_url_help")} id="target_url" label="Target URL" onChange={fieldChangeHandler} value={image.target_url} />
                        </div>
                    </div>  

                    <Row />      

                    <div className="row">
                        <div className="col-4">
                            <label>{t("start_date")}</label>
                            <Form.Control type="date" id="start" onChange={fieldChangeHandler} value={image.start} />
                        </div>
                        <div className="col-4">
                            <label>{t("expires")}</label>
                            <Form.Control type="date" id="expires" onChange={fieldChangeHandler} value={image.expires} />
                        </div>
                        <div className="col-4">
                            <label>{t("created_by")}</label>
                            <Form.Control type="text" id="created_by" readOnly value={image.created_by} />
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-12">
                            <Alert>{t("image_size_warning")}</Alert>
                        </div>
                    </div>                    

                    <div className="row">
                        <div className="col-6">
                            <label>{t("file")}</label>
                            <Form.Control type="file" id="image" onChange={fieldChangeHandler} />
                        </div>
                        <div className="col-6">
                            { imageURL && <Attachment target={imageURL} type="image" /> }
                        </div>
                    </div>   

                    <Row />
                </div>
            </form>
        </DefaultLayout>
    )
}

export default Image;