/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const DivisionModel = ( settings ) => {
    const fields = {
            "id":                   "",
            "division_id":          "",
            "parent_id":            "",
            "is_travel":            "false",
            "name":                 "",
            "tsid":                 "",
            "game_duration":        "",
            "created_at":           "",
            "updated_at":           ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default DivisionModel;