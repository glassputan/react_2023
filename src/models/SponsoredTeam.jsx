

/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
const SponsoredTeam = ( settings ) => {

    const fields = {
            "id":                   "",
            "sponsor_id":           "",
            "divisions":            [],
            "gender":               "",
            "player_name":          "",
            "shirt_text":           "",
            "shirt_color":          "",
            "total_contribution":   "",
            "year":                 ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default SponsoredTeam;