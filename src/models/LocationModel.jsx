/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const LocationModel = ( settings ) => {
    const fields = {
        "name" :          "",
        "address_line_1": "",
        "address_line_2": "",
        "city":           "",
        "state":          "",
        "zip_code":       "",
        "tsid":           ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default LocationModel;
