/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const MinutesModel = ( settings ) => {
    const fields = {
        "id":           "",
        "year":         new Date().getFullYear(),
        "month":        "",
        "document":     ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default MinutesModel;