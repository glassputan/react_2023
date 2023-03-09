/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const HouseholdModel = ( settings ) => {
    const fields = {       
        name:                  "",
        updated_by:            "",
        updated_at:            "",
        created_at:            "",
        primary_guardian_id:   "",
        secondary_guardian_id: ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default HouseholdModel;