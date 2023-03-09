
import React                from 'react'

import { 
    useContext,
    useState,
    useEffect,
    useReducer,
    useRef
}                           from "react";

import { useTranslation }   from "react-i18next";
import {
    Link, 
    useNavigate,
    useSearchParams
}                           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import Alert                from 'react-bootstrap/Alert';
import Button               from 'react-bootstrap/Button';

import { 
    faCopy,
    faHome,
    faSave,
    faTrash
}                           from '@fortawesome/pro-regular-svg-icons'

import {
    Editor 
}                           from '@tinymce/tinymce-react';

// import * as ActiveStorage   from "@rails/activestorage"

// import { 
//     DirectUpload 
// }                           from 'activestorage';

import AppContext           from '../../../context/AppContext';
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';
import Row                  from '../../../helpers/Row';
import DefaultLayout        from '../../../layouts/DefaultLayout';
import ArticleModel         from '../../../models/ArticleModel';

import Attachment           from '../../../helpers/Attachment';

const Article = (props) => {
    ActiveStorage.start()

    const {t}        = useTranslation();
    const navigate = useNavigate();
    const context    = useContext(AppContext);
    const articleRef = useRef();

    const [ articleId,       setArticleID]       = useState();
    const [ isNew,           setIsNew]           = useState(true);
    const [ article,         setArticle ]        = useState( new ArticleModel({ meeting_month: 1 }) );
    const [ document,        setDocument ]       = useState()
    const [ targetURL,       setTargetURL ]      = useState();
    const [ showDeleteModal, setShowDeleteModal] = useState(false);

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
    
    const uploadDocument = async (file, json) => {
        context.debug("Article", "uploadDocument()", file, json);

        const upload = new DirectUpload(file, "/upload")

        upload.create(
            async ( error, blob ) => {
                context.debug("Article", "uploadDocument()", error, blob);

                if(error) {
                    console.error("uploadDocument()",            error);
                    context.error("Article", "uploadDocument()", error);
                }
                else {
                    const settings = {
                        ...context.defaultHeaders,
                        body: JSON.stringify( { article: { document: blob.signed_id } } ),
                        method: "PATCH"
                    }

                    const response = await fetch(`/api/v1/article/${json.record.id}`, settings );

                    context.debug("Article", "uploadDocument()", response);

                    if( response.ok ) {
                        const json = await response.json();

                        context.debug("Article", "uploadDocument()", json);

                        setMessage(t("record_saved"));

                        navigate(`/admin/article?id=${json.record.id}`);                        
                    }
                    else {
                        setError(response.statusText);
                    }
                }
            }
        );
    }

    const onSubmit = async (event) => {
        if(event) event.preventDefault();

        context.debug("Article", "onSubmit()", articleRef.current.getContent());

        let record = { ...article, text: articleRef.current.getContent() };

        if( "minutes" == record.article_type ) {
            record = {
                ...record,
                title: `Members' Meeting ${article.meeting_year || ""}-${parseInt(article.meeting_month) < 10 ? `0${article.meeting_month}` : article.meeting_month}`
            }
        }

        let action = "/api/v1/article";
        let header = {
            ...context.defaultHeaders,
            body: JSON.stringify({ article: { ...record }})
        };

        if( isNew ) {
            header = {
                ...header,
                method: "POST"
            };
        }
        else {
            action = `${action}/${article.id}`;
            header = {
                ...header,
                method: "PATCH"
            };
        }
    
        context.debug("Article", "onSubmit(): Sending...", action, header);

        const response = await fetch(action, header);

        context.debug("Article", "onSubmit(2): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Article", "onSubmit(3): JSON...", json);

            if( json.status && json.status === "error") {
                setError(json.message);
            }
            else if( document ) {
                uploadDocument( document, json );
            }
            else {
                setMessage(t("record_saved"));
                navigate(`/admin/article?id=${json.record.id}`);
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const getArticleHandler = async () => {
        setError(null);

        if(articleId) {
            setIsNew(false);

            const response  = await fetch(`/api/v1/article/${articleId}/edit`, context.defaultHeaders);

            context.debug("Article", "getArticleHandler(2): Received...", response);

            if( response.ok ) {
                const json = await response.json();

                context.debug("Article", "getArticleHandler(3): JSON...", json);

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    setIsNew(false);

                    const record = context.deNullObject(json.record);

                    setArticle(record);
                    
                    if( json.document ) {
                        setTargetURL( json.document );
                    }

                    setMessage(t("record_loaded"));
                }
            }
            else {
                setError(response.statusText);
            }
        }
    }

    const onDeleteRecordHandler = async () => {
        context.debug("Article", "onDeleteRecordHandler()");

        const action = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };

        const response = await fetch(`/api/v1/article/${article.id}`, action);
        
        context.debug("Article", "onDeleteRecordHandler()", response);

        if( response.ok ) {
            const json = await response.json();

            if( json.status && json.status === "error") {
                throw new Error(json.message);
            }
            else {
                setShowDeleteModal(false);
                navigate("/admin/articles");
            }
        }
        else {
            setError(response.statusText);
        }
    }
    
    const attachmentChangeHandler = (event) => {
        setDocument(event.target.files[0])
    }

    const onDeleteRecord = () => {
        setShowDeleteModal(true);
    }

    const deleteModalCloseHandler = () => {
        setShowDeleteModal(false);
    }

    const articleChangeHandler = (event) => {
        context.debug("Article", "articleChangeHandler()", event);

        const value = event.target.id.indexOf("meeting") > -1 ? parseInt(event.target.value) : event.target.value;

        setArticle(
            {
                ...article,
                [event.target.id]: value
            }
        );
    }

    const onCancel = () => {
        navigate("/admin/articles");
    }

    useEffect(
        () => {
            getArticleHandler();
        },
        [articleId]
    )

    const [params, setSearchParams] = useSearchParams();

    useEffect( 
        () => {
            
            const id = params.get("id");

            if( id ) {
                setArticleID(id); 
            }
            else {
                const filter = JSON.parse(localStorage.getItem("articles_query"));

                if(filter) {
                    articleChangeHandler( { target: { id: "language",       value: filter.locale        || "en" } } );
                    articleChangeHandler( { target: { id: "article_type",   value: filter.article_type  || ""   } } );
                }
            }
        }, 
        []
    ); 
       
    return (
        <DefaultLayout>
            <Row />

            <ConfirmModal message={t("confirm_delete")} header={`${t("delete")} '${article.title}'`} onContinue={onDeleteRecordHandler} isVisible={showDeleteModal} onClose={deleteModalCloseHandler} />

            <div className="news">  
                <div className="row">
                    <div className="col-8">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/articles">{t("articles")}</Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/article">{t("new")}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-4 text-end px-2">
                        <button onClick={onSubmit} className="btn btn-default" style={{ marginLeft: "10px" }}><FontAwesomeIcon icon={faSave}  size="2x" /></button>
                        <div    className="btn btn-default"         style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></div>
                        <div    className="btn btn-outline-danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" onClick={onDeleteRecord} /></div>
                    </div>
                </div>

                { formState.state && <Alert style={{ marginTop: "10px" }} variant={formState.state}>{formState.message || t("unknown_error")}</Alert> }

                <Row />

                <div className="row">
                    <div className="col-1">&nbsp;</div>
                    <div className="col-3">
                        <label>{t("article_type")}</label>
                        <select id="article_type" onChange={articleChangeHandler} className="form-control" value={article.article_type}>
                            <option value="article">{t("article")}</option>
                            <option value="pdf">{t("document_pdf")}</option>
                            <option value="map">{t("travel_map")}</option>
                            <option value="minutes">{t("meeting_minutes")}</option>
                        </select>
                    </div>

                    {
                        article.article_type != "minutes" &&
                        <div className="col-7">
                            <label>{t("title")}</label>
                            <input type="text" onChange={articleChangeHandler} id="title" className="form-control" value={article.title} />    
                        </div>
                    }

                    {
                        article.article_type == "minutes" && <>
                            <div className="col-4">
                                <label>{t("month")}</label>
                                <select onChange={articleChangeHandler} className="form-control" id="meeting_month" value={article.meeting_month}>
                                    <option value="0">{t("january")}  </option>
                                    <option value="1">{t("february")} </option>
                                    <option value="2">{t("march")}    </option>
                                    <option value="3">{t("april")}    </option>
                                    <option value="4">{t("may")}      </option>
                                    <option value="5">{t("june")}     </option>
                                    <option value="6">{t("july")}     </option>
                                    <option value="7">{t("august")}   </option>
                                    <option value="8">{t("september")}</option>
                                    <option value="9">{t("october")}  </option>
                                    <option value="10">{t("november")} </option>
                                    <option value="11">{t("december")} </option>
                                </select>
                            </div>
                            <div className="col-3">
                                <label>{t("year")}</label>
                                <select onChange={articleChangeHandler} className="form-control" id="meeting_year" value={article.meeting_year}>
                                    <option value=""></option>
                                    <option value={ new Date().getFullYear()     }>{ new Date().getFullYear()     }</option>
                                    <option value={ new Date().getFullYear() - 1 }>{ new Date().getFullYear() - 1 }</option>
                                    <option value={ new Date().getFullYear() - 2 }>{ new Date().getFullYear() - 2 }</option>
                                    <option value={ new Date().getFullYear() - 3 }>{ new Date().getFullYear() - 3 }</option>
                                    <option value={ new Date().getFullYear() - 4 }>{ new Date().getFullYear() - 4 }</option>
                                    <option value={ new Date().getFullYear() - 5 }>{ new Date().getFullYear() - 5 }</option>
                                </select>
                            </div></>
                    }
                    <div className="col-1">&nbsp;</div>
                </div>

                {
                    article.article_type != "minutes" &&
                    <>
                        <Row />

                        <div className="row">
                            <div className="col-1">&nbsp;</div>
                            <div className="col-10"> 
                                <label>{t("language")}</label>
                                <select onChange={articleChangeHandler} className="form-control" value={article.language}>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                </select>
                            </div>
                            <div className="col-1">&nbsp;</div>
                        </div>  
                    </>
                }

                <Row />   

                <div className="row">
                    <div className="col-1">&nbsp;</div>
                    <div className="col-10">
                        <label>{t("description")}</label>
                        <textarea onChange={articleChangeHandler} className="form-control" rows="4" value={article.description}></textarea>
                    </div>
                    <div className="col-1">&nbsp;</div>
                </div> 

                <Row />       

                <div className="row">
                    <div className="col-1">&nbsp;</div>
                    <div className="col-6">
                        <input onChange={attachmentChangeHandler} type="file" className="form-control" id="document" />
                    </div>
                    <div className="col-4">
                        <Attachment target={targetURL} type={article.article_type} />
                    </div>
                    <div className="col-1">&nbsp;</div>
                </div>

                <Row />   
                <Row />

                <div className="row">
                    <div className="col-1">&nbsp;</div>
                    <div className="col-10">
                        <label htmlFor="text">{t("article_text")}</label>
                        <Editor
                            onInit={
                                (evt, editor) => articleRef.current = editor
                            }

                            initialValue={article.text || ""}
                            
                            init={
                                {
                                    height: 500,
                                    menubar: false,
                                    plugins: ['code wordcount link table print'],
                                    toolbar: 'undo redo | formatselect | ' +
                                    'bold italic backcolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | code | help',
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                }
                            }
                        />
                    </div>
                    <div className="col-1">&nbsp;</div>
                </div>

                <Row />

                <div className="row">
                    <div className="col-11 text-end">
                        <Button onClick={onSubmit} variant="outline-primary"   style={{ marginLeft: "10px"}}>{t("save")}</Button>
                        <Button onClick={onCancel} variant="outline-secondary" style={{ marginLeft: "10px"}}>{t("cancel")}</Button>
                    </div>
                </div> 
            </div>                      
        </DefaultLayout>
    );
}

export default Article;