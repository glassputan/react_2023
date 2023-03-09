/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const UserModel = ( settings ) => {
    const fields = {
        "admin":                    false,
        "email":                    "",
        "must_change_password":     false,
        "last_login":               "",
        "member_id":                -1,
        "locked_out":               false,
        "login_count":              0,
        "created_at":               "",
        "updated_at":               "",
        "updated_by":               ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default UserModel;