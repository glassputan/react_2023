import React              from 'react'

import { 
    useCallback, 
    useState, 
    useEffect, 
    useContext,
    Fragment 
}                   from "react";

import AppContext   from '../../context/AppContext';

const Article = (props) => {
    const [ article,   setArticle ] = useState(<div className="alert alert-danger">Article '{props.name}' ({(props.lang || "en")}) was not found.</div>);
    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);

    const query = ( props.id ? `id=${props.id}` : "" ) + ( props.title ? `title=${props.title}` : "" ) + ( props.lang ? `&lang=${props.lang}` : "" );

    const context = useContext(AppContext)

    const articleHandler = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);
    
            const response  = await fetch(`/api/v1/article?${query}`);

            if( response.ok ) {
                const json = await response.json();

                context.debug("Article", "articleHandler", json);

                if( json.status === "error" ) {
                    setError(json.message);
                }
                else if( json.status == "unprocessable_entity" ) {
                    setArticle({ text: `Article '${query}' was not found.` });
                }
                else {
                    setArticle(json.record);
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
            articleHandler();
        }, 
        [articleHandler]
    );

    return (
        <Fragment>
            { isLoading && <p>Loading...</p> }
            { !isLoading && !error && <div className="row"><div className="col tinyedit-wysiwyg" dangerouslySetInnerHTML={{__html: article.text}}></div></div> }
            { !isLoading && !error && <div className="row"><div className="col">{error}</div></div>   }
        </Fragment>
    )

}

export default Article;