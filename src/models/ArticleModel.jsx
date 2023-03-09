/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const ArticleModel = ( settings ) => {
    const fields = {       
        "title":        "",
        "text":         "",
        "article_type": "article",
        "description":  "",
        "language":     "en"
    }

    return {
        ...fields,
        ...settings
    }
}

export default ArticleModel;