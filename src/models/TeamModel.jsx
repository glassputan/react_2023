/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
const TeamModel = (settings) => {
    const fields = {
        name:               "",
        head_coach_id:      "",
        assistant_coach_id: "",
        is_travel:          "",
        email:              "",
        updated_by:         "",
        url:                "",
        color:              "",
        team_number:        "",
        schedule_id:        "",
        tsid:               "",
        teamsnap_url:       "",
        tcode:              "",
        year:               "",
        gender:             "",
        suppress_roster:    "",
        division_tsid:      "",
        division_id:        "",
        manager_id:         "",
        created_at:         "",
        updated_at:         "",
        note:               "",
        status:             "",
        club_id:            "",
        season_id:          ""
    }

    return {
        ...fields,
        ...settings
    }    

}

export default TeamModel;