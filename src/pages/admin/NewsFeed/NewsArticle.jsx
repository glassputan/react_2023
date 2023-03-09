import 
    React,
    { 
        useContext,
        useState,
        useEffect,
        useReducer,
        useRef
    }                       from "react";

import { useTranslation }   from "react-i18next";
import {
    Link, 
    useSearchParams
}                           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import Button               from 'react-bootstrap/Button';
import Form                 from 'react-bootstrap/Form';

import { 
    faCopy,
    faHome,
    faSave,
    faTrash
}                           from '@fortawesome/pro-regular-svg-icons'

import {
    Editor 
}                           from '@tinymce/tinymce-react';

import AppContext           from '../../../context/AppContext';
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';
import Row                  from '../../../helpers/Row';
import Message              from '../../../helpers/Message';

import DefaultLayout        from '../../../layouts/DefaultLayout';

import NewsArticleModel     from '../../../models/NewsArticleModel';

const NewsNewsArticle = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const {t}        = useTranslation();
    const context    = useContext(AppContext);
    const articleRef = useRef();

    const [ articleId,       setNewsArticleID]   = useState();
    const [ isNew,           setIsNew]           = useState(true);
    const [ article,         setNewsArticle ]    = useState(new NewsArticleModel());
    const [ showDeleteModal, setShowDeleteModal] = useState(false);

    const [ formState,       dispFormState     ] = useReducer(
        (current, action) => {
            switch(action.event) {
                case "ERROR":
                    return { variant: "danger",  message: action.message }
                case "SUCCESS":
                    return { variant: "success", message: action.message }
                case "WARNING":
                    return { variant: "warning", message: action.message }
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
    
    const submitHandler = async (event) => {
        if(event) event.preventDefault();

        context.debug("NewsArticle", "submitHandler()", articleRef.current.getContent());

        let record = { ...article, text: articleRef.current.getContent() };

        let action = "/api/v1/news/article";
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
    
        context.debug("NewsArticle", "submitHandler(): Sending...", action, header);

        const response = await fetch(action, header);

        context.debug("NewsArticle", "submitHandler(2): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("NewsArticle", "submitHandler(3): JSON...", json);

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setMessage(t("record_saved"));
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const getNewsArticleHandler = async () => {
        setError(null);

        if(articleId) {
            setIsNew(false);

            const response  = await fetch(`/api/v1/news/article/${articleId}`, context.defaultHeaders);

            context.debug("NewsArticle", "getNewsArticleHandler(2): Received...", response);

            if( response.ok ) {
                const json = await response.json();

                context.debug("NewsArticle", "getNewsArticleHandler(3): JSON...", json);

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    setIsNew(false);

                    const record = context.deNullObject(json.record);

                    setNewsArticle(record);

                    setMessage(t("record_loaded"));
                }
            }
            else {
                setError(response.statusText);
            }
        }
    }

    const onDeleteRecordHandler = async () => {
        context.debug("NewsArticle", "onDeleteRecordHandler()");

        const action = {
            ...context.defaultHeaders,
            method:  "DELETE"
        };

        const response = await fetch(`/api/v1/news/article/${article.id}`, action);
        
        context.debug("NewsArticle", "onDeleteRecordHandler()", response);

        if( response.ok ) {
            const json = await response.json();

            if( json.status && json.status === "error") {
                throw new Error(json.message);
            }
            else {
                setShowDeleteModal(false);
            }
        }
        else {
            setError(response.statusText);
        }
    }
    
    const onDeleteRecord = () => {
        setShowDeleteModal(true);
    }

    const deleteModalCloseHandler = () => {
        setShowDeleteModal(false);
    }

    const articleChangeHandler = (event) => {
        context.debug("NewsArticle", "articleChangeHandler()", event);

        setNewsArticle(
            {
                ...article,
                [event.target.id]: event.target.value
            }
        );
    }

    const copyHandler = () => {

    }

    useEffect(
        () => {
            getNewsArticleHandler();
        },
        [articleId]
    )

    useEffect( 
        () => {
            const id = searchParams.get("id");

            if( id ) {
                setNewsArticleID(id); 
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
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/news/articles">{t('articles')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/news/article">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col-4 text-end px-2">
                        <Button onClick={submitHandler}   variant="outline-primary"   style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></Button>
                        <Button onClick={copyHandler}     variant="outline-secondary" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></Button>
                        <Button onClick={onDeleteRecord}  variant="outline-danger"    style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" /></Button>
                    </div>
                </div>

                <Row />

                <Message formState={formState} />

                <div className="row">
                    <div className="col-6">
                        <label>{t("title")}</label>
                        <Form.Control type="text" onChange={articleChangeHandler} id="title" value={article.title} />    
                    </div>
                    <div className="col-3">
                        <label>{t("start")}</label>
                        <Form.Control type="date" onChange={articleChangeHandler} id="start" value={article.start} />
                    </div>
                    <div className="col-3">
                        <label>{t("end")}</label>
                        <Form.Control type="date" onChange={articleChangeHandler} id="end" value={article.end} />
                    </div>                    
                </div>

                <Row />

                <div className="row">
                    <div className="col-12"> 
                        <label>{t("language")}</label>
                        <Form.Select onChange={articleChangeHandler} value={article.language}>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                        </Form.Select>
                    </div>
                </div>  

                <Row />       
                <Row />

                <div className="row">
                    <div className="col-12">
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
                                    toolbar: 'undo redo | formatForm.Select | ' +
                                    'bold italic backcolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | code | help',
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                }
                            }
                        />
                    </div>
                </div>

                <Row />

                <div className="row">
                    <div className="col text-end">
                        <Button onClick={submitHandler} variant="outline-primary"  style={{ marginLeft: "10px"}}>{t("save")}</Button>
                    </div>
                </div> 
            </div>                      
        </DefaultLayout>
    );
}

export default NewsNewsArticle;