

/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const SeasonModel = ( settings ) => {

    const fields = {
            "id":                   "",
            "name":                 "",
            "year":                 "",
            "recreational_tsid":    "",
            "start_date":           "",
            "created_at":           "",
            "updated_at":           ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default SeasonModel;