import React              from 'react'

import { 
    useState, 
    useEffect,
    useContext
}                         from "react";

import { useTranslation } from "react-i18next";
import { 
    Link,
    useNavigate 
}                         from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                           from '@fortawesome/pro-regular-svg-icons'

import Alert                from 'react-bootstrap/Alert';
import Button               from 'react-bootstrap/Button';

import AppContext           from '../../../context/AppContext';
import AttachmentIcon       from '../../../helpers/AttachmentIcon';
import Row                  from '../../../helpers/Row';
import DefaultLayout        from "../../../layouts/DefaultLayout"


const Article = (prop) => {
    const article = prop.article;

    return (
            <div className="row py-1">
                <div className="col-2">{article.language}</div>
                <div className="col-1 text-centered"><AttachmentIcon id={article.id} /></div>
                <div className="col-7">
                    <i className="fal fa-file-pdf" ng-if="article.article_type=='pdf'"></i>
                    <Link to={`/admin/article?id=${article.id}`}>{ article.title }</Link><br/>
                    {article.description}
                </div>
                <div className="col-2">{
                    new Intl.DateTimeFormat("ISO", 
                        {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        }
                    ).format(new Date(article.updated_at))}                    
                </div>
            </div>
    )
}

const Articles = () => {
    const {t} = useTranslation();

    const context  = useContext(AppContext);
    const navigate = useNavigate();

    const [isLoading, setIsLoading]     = useState(false);
    const [error,     setError]         = useState(null);
    const [articles,  setArticles ]     = useState();
    
    const [locale,    setLocale]        = useState("*");
    const [articleType, setArticleType] = useState("*");
    
    const queryChangeHandler = (event) => {
        //console.info("queryChangeHandler()", event);

        if( event.target.id == "locale") {
            setLocale(event.target.value);
        }

        if( event.target.id == "article_type") {
            setArticleType(event.target.value);
        }
    }

    const getListArticleHandler = async () => {
        setIsLoading(true);
        setError(null);

        const response  = await fetch(`/api/v1/articles?lang=${locale}&type=${articleType}`, context.defaultHeaders);

        if( response.ok ) {
            const json = await response.json();

            if( json.status && json.status === "error") {
                setError(json.message);
            }
            else {
                localStorage.setItem("articles_query", JSON.stringify({ locale: locale, article_type: articleType }));
                setArticles(json.records);
            }    
        }

        setIsLoading(false);
    }

    const createNewArticle = () => {
        navigate("/admin/article");
    }

    useEffect(
        () => {
            const filter = JSON.parse(localStorage.getItem("articles_query"));

            if(filter) {
                setLocale(filter.locale || "*");
                setArticleType(filter.article_type || "*");
            }
        },
        []
    )

    useEffect( 
        () => {
            getListArticleHandler();
        }, 
        [locale, articleType]
    );    

    return (
        <DefaultLayout>
            <Row />
            <div className="news">  
                <div className="row">
                    <div className="col-8">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/articles">{t("articles")}</Link></li>
                                
                            </ol>
                        </nav>
                    </div>
                    <div className="col-4 text-end">
                        <Button variant="outline-primary" onClick={createNewArticle}>{t("new")}</Button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-6">
                        <label>Language</label>
                        <select onChange={queryChangeHandler} className="form-control" id="locale" value={locale}>
                            <option value="*">{t("all")}</option>
                            <option value="en">{t("english")}</option>
                            <option value="es">{t("spanish")}</option>
                        </select>
                    </div>
                    <div className="col-6">
                        <label>{t("article_type")}</label>
                        <select onChange={queryChangeHandler} className="form-control" id="article_type" value={articleType}>
                            <option value="*">{t("all")}</option>
                            <option value="article">{t("article")}</option>
                            <option value="pdf">{t("document_pdf")}</option>
                            <option value="map">{t("travel_map")}</option>
                            <option value="minutes">{t("meeting_minutes")}</option>
                        </select>
                    </div>
                </div>

                <Row />

                                        
                { isLoading && <Alert variant="warning">Loading...</Alert> }
                { error     && <Alert variant="error">{error}</Alert>      }

                <div className="row p-3 mb-2 bg-dark text-white">
                    <div className="col-2">Language</div>
                    <div className="col-1">Doc</div>
                    <div className="col-7">Title</div>
                    <div className="col-2">Updated at</div>
                </div>

                <div className="container overflow-hidden">
                    { 
                        !isLoading && !error && Array.isArray(articles) && 
                        articles
                            .sort(
                                (a, b) => {
                                    var nameA = (a.title || "").toUpperCase(), // ignore upper and lowercase
                                        nameB = (b.title || "").toUpperCase(); // ignore upper and lowercase
                                
                                    if (nameA < nameB) { return -1; }
                                    if (nameA > nameB) { return  1; }
                                    return 0;
                                }
                            )
                            .map(
                                (article) => {
                                    return (
                                        <Article key={article.id} article={article} />
                                    )
                                }
                            )
                    }
                </div>

                <Row />
            </div>
        </DefaultLayout>
    )
}

export default Articles;