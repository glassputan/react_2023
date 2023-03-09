/**
 * 
 * @param { JSONObject } values Values to load this Model with.
 * @returns 
 */
const SponsorModel = ( values ) => {
    const fields = {
        "id":                   "",
        "address_line1":        "",
        "address_line2":        "",
        "city":                 "",
        "company_name":         "",
        "company_url":          "",
        "created_at":           "",
        "current":              true,
        "email":                "",
        "first_name":           "",
        "first_sponsored":      new Date().getFullYear(),
        "label":                "",
        "last_name":            "",
        "last_sponsored":       new Date().getFullYear(),
        "notes":                "",
        "office_phone":         "",
        "order":                "",
        "public_phone":         "",
        "shirt_text":           "",
        "show_label":           "",
        "sponsor_type":         "Single",
        "state":                "PA",
        "updated_at":           "",
        "zip_code":             0
    }

    return {
        ...fields,
        ...values
    }
}

export default SponsorModel;