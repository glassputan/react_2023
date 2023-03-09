import React              from 'react'

import { 
    useState, 
    useEffect,
    useContext,
    useRef
}                         from "react";

import { 
    useTranslation 
}                         from "react-i18next";

import { 
    Link,
    useNavigate 
}                         from 'react-router-dom'

import Alert              from 'react-bootstrap/Alert';
import Button             from 'react-bootstrap/Button';
import Pagination         from 'react-bootstrap/Pagination';
import Table              from 'react-bootstrap/Table';

import {
    Editor 
}                           from '@tinymce/tinymce-react';

import Form                 from 'react-bootstrap/Form';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                         from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout      from "../../../layouts/DefaultLayout"
import Row                from '../../../helpers/Row';

import AppContext         from '../../../context/AppContext';

import { 
    faFloppyDisk,
    faBan,
    faTrash
}                         from '@fortawesome/pro-light-svg-icons';

const AlertRow = (props) => {
    const error=props.error;

    return <tr><td colSpan="2"><Alert variant="danger">{error}</Alert></td></tr>
}

const Article = (props) => {
    const {t}                         = useTranslation();
    const context                     = useContext(AppContext);
    const [isEditing,    setEdit ]    = useState(false);
    const [article,      setArticle]  = useState(props.article);
    const articleRef                  = useRef();

    const submitHandler = async (event) => {
        const record = { ...article, text: articleRef.current.getContent() };
        setEdit(false);

        props.onSave(record);        
    }

    const cancelHandler = () => {
        setEdit(false);
    }

    const deleteHandler = () => {
        props.onDelete(article);
    }    

    const editArticle = (event) => {
        setEdit(true);
    }


    const articleChangeHandler = (event) => {
        console.info("NewsFeed::articleChangeHandler()", event);

        setArticle(
            {
                ...article,
                [event.target.id]: event.target.value
            }
        );
    }

    if(isEditing) {
        return (
            <tr rowSpan="2">
                <td colSpan="5">
                    <form>                        
                        <div className="row outline">
                            <div className="col-1">
                                <Button onClick={cancelHandler} variant="default"><FontAwesomeIcon icon={faBan} /></Button>
                            </div>
                            <div className="col-9">&nbsp;</div>
                            <div className="col-2">
                                <Button onClick={submitHandler}><FontAwesomeIcon icon={faFloppyDisk} /></Button>
                                &nbsp;<Button onClick={deleteHandler} variant="danger"><FontAwesomeIcon icon={faTrash} /></Button>
                            </div>                            
                        </div>
                        <div className="row" id={article.id}>
                            <div className="col-2"><Form.Control type="text" onChange={articleChangeHandler} id="title" value={article.title} /></div>
                            <div className="col-2"><Form.Control type="date" onChange={articleChangeHandler} id="start" value={article.start} /></div>
                            <div className="col-2"><Form.Control type="date" onChange={articleChangeHandler} id="end"   value={article.end} /></div>
                            <div className="col-6" style={{ height: "100px", overflowY: "auto" }}>
                                <div style={{ height: "200px", overflowY: "auto" }}>
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
                                                toolbar: false,
                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                save_onsavecallback: submitHandler
                                            }
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </td>
            </tr>
        )
    }
    else {
        return (
            <tr id={article.id} onDoubleClick={editArticle}>
                <td>{article.title}</td>
                <td>{article.start}</td>
                <td>{article.end}</td>
                <td style={{ height: "100px", overflowY: "auto" }}>
                    <div style={{ height: "200px", overflowY: "auto" }} dangerouslySetInnerHTML={{__html: article.text}}></div>
                </td>
            </tr>
        )
    }
}

const NewsFeed = () => {
    const {t} = useTranslation();

    const context = useContext(AppContext);
    const navigate = useNavigate();

    const [error,    setError ]       = useState();
    const [message,  setMessage ]     = useState();
    const [feed,     setNewsFeed  ]   = useState([]);
    const [page,     setPage]         = useState(1);
    const [pages,    setPages]        = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const getListNewsFeedHandler = async (event) => {
        console.debug(`NewsFeed::getListNewsFeedHandler(): fetching /api/v1/news?page=${page}`);

        const response = await fetch(`/api/v1/news?page=${page}`, context.defaultHeaders);

        if( response.ok ) {
            const json = await response.json();
            
            console.debug("NewsFeed::getListNewsFeedHandler: Received...", json);

            if( json.status === "error") { 
                setError(json.message); 
            }
            else { 
                setNewsFeed(json.records);
                setTotalPages(json.total_pages);                
            }
        }
        else {
            context.error("NewsFeed", "updateArticleHandler()", response.statusText);
            setError(response.statusText);
        }
    }
    
    const setPageNumber = (event) => {
        console.debug("NewsFeed::setPageNumber()", event);
        setPage(event.target.id);
    }

    const NavigateHandler = (page) => {
        console.debug("NewsFeed::NavigateHandler()", page);
        navigate(page);
    }

    const removeArticle = async (record) => {
        const action = `/api/v1/news/article/${record.id}`;
        const header = {
            ...context.defaultHeaders,
            method: "DELETE"
        };
    
        console.debug("NewsFeed::removeArticle(): Sending...", action, header);

        const response = await fetch(action, header);

        console.debug("NewsFeed::removeArticle(2): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            console.warn("NewsFeed::removeArticle(3): JSON...", json);

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setMessage(t("record_removed"));

                const lastPage = page;

                setPage(page + 1);
                setPage(lastPage);
            }
        }
        else {
            setError(response.statusText);
        }        
    }

    const saveArticle = async (record) => {
        console.debug("NewsFeed::submitHandler()", record);

        const action = `/api/v1/news/article/${record.id}`;
        const header = {
            ...context.defaultHeaders,
            method: "PATCH",
            body: JSON.stringify({ article: { ...record }})
        };
    
        console.debug("NewsFeed::submitHandler(): Sending...", action, header);

        const response = await fetch(action, header);

        console.debug("NewsFeed::submitHandler(2): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            console.warn("NewsFeed::submitHandler(3): JSON...", json);

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setMessage(t("record_saved"));

                const lastPage = page;

                setPage(page + 1);
                setPage(lastPage);
            }
        }
        else {
            setError(response.statusText);
        }        
    }

    useEffect(
        () => {
            let rows = [];
            for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
                // note: we are adding a key prop here to allow react to uniquely identify each
                // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
                rows.push(<Pagination.Item key={pageNumber} active={pageNumber === page} id={pageNumber} onClick={setPageNumber}>{pageNumber}</Pagination.Item>);
            }

            setPages(rows);
        },
        [totalPages, page]
    )

    useEffect(
        () => {
            getListNewsFeedHandler();
        },
        [page]
    )

    return (
        <DefaultLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/news/feed">{t('feed')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/admin/news/article">{t('new')}</Link></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className={ error && error.length > 0 ? "row": "d-none row" }>
                    <div className="col-12">
                        <Alert variant="danger">{message}</Alert>
                    </div>
                </div>

                <div className={ message && message.length > 0 ? "row": "d-none row" }>
                    <div className="col-12">
                        <Alert variant="success">{message}</Alert>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <Table striped hover bordered>
                            <thead>
                                <tr>
                                    <th style={{ width: "250px"}}>Title</th>
                                    <th style={{ width: "100px"}} className="text-center">Start Date</th>
                                    <th style={{ width: "100px"}} className="text-center">End Date</th>
                                    <th>Text</th>
                                </tr>
                            </thead>
                            <tbody>
                                { 
                                    !error &&
                                    feed
                                        .map(
                                            (article) => {
                                                return (
                                                    <Article 
                                                        key={article.id} 
                                                        article={article} 
                                                        onRedirect={NavigateHandler} 
                                                        onError={setError} 
                                                        onMessage={setMessage} 
                                                        onSave={saveArticle}
                                                        onDelete={removeArticle}
                                                    />
                                                )
                                            }
                                        )
                                }
                                {  error && <AlertRow error={error} /> }
                            </tbody>
                        </Table>
                    </div>
                </div>
                
                <Row />
                
                <div className="row">
                    <div className="col">
                        <div>                            
                            <Pagination>{pages}</Pagination>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    )
}

export default NewsFeed;
