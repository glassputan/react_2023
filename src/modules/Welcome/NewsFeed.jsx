import React              from 'react'

import { 
    useCallback, 
    useContext,
    useState, 
    useEffect 
}                        from "react";
import { 
    useTranslation 
}                        from 'react-i18next';

import Row         from '../../helpers/Row'
import AppContext from '../../context/AppContext';
import { Card } from 'react-bootstrap';

function Article(props) {
    const story   = props.article;

    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    
    const getFormattedTime = () => {
        const date = new Date(story.updated_at);
        return date.toLocaleDateString("en-US", options);
    }

    return (
        <>
            <Card>
                <Card.Header>
                    <div className="row">
                        <div className="fw-bold h6">{story.title}</div>
                        <div style={{ width: "150px"}}>
                            <span className="text-muted">{getFormattedTime()}</span>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body dangerouslySetInnerHTML={{__html: story.text}}></Card.Body>
            </Card>
            <br/>
        </>
    )
}

function NewsFeed(props) {
    const { t } = useTranslation();
    const context = useContext(AppContext);

    const [news,      setNews]      = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);

    let   content = <Row>Loading...</Row>

    const getListNewsArticles = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/v1/news/feed`, context.defaultHeaders);

            if( response.ok) {
                const data     = await response.json();

                context.debug("NewsFeed", "getListNewsArticles()", data);

                if( data.status === "error" ) {
                    setError(data.message);
                }
                else {
                    setNews( data.records.sort(
                        (a, b) => {
                            const startA = new Date(a.created_at);
                            const startB = new Date(b.created_at);

                            return startB.getTime() - startA.getTime();
                        }
                    ) );
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
            getListNewsArticles();
        }, 
        []
    );

    return (
        <div className="news">
            <h1>{ t('latest_news') }</h1>

            { isLoading  && <Row>Loading...</Row> }
            { isLoading  && error  && <Row className="text-danger">{error}</Row> }
            { 
                !isLoading && !error && 
                <Row>
                    {
                        news.map( 
                            (article) => {
                                return <Article key={article.id} article={article} />
                            }
                        )
                    }
                </Row> 
            }
        </div>
    )
}

export default NewsFeed;