import AppContext   from "../context/AppContext";

import {
    useContext
}                   from 'react';


/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const NewsArticleModel = ( settings ) => {
    const context = useContext(AppContext);

    const date    = new Date();
    const start   = context.getFormattedDate(date);

    date.setMonth( date.getMonth() + 1);
    const end     = context.getFormattedDate(date);


    const fields = {
        "title":      "",
        "text":       "",
        "start":      start,
        "end":        end,
        "updated_by": "",
        "created_at": "",
        "updated_at": ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default NewsArticleModel;