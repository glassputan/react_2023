import React, { useContext } from 'react';
import AppContext from '../context/AppContext';

const Registration = ( initialize, member ) => {

    const fields = {
        amount_owed:        0,
        amount_paid:        0,
        birthdate:          "",
        division:           "",
        email:              "",
        first_name:         "",
        gender:             "",
        home_phone:         "",
        household_id:       "",
        is_guardian:        true,
        last_name:          "",
        member_id:          "",
        medical_conditions: "",
        mobile_phone:       "",
        registration_date:  new Date().toISOString().substring(0, 10),
        registration_id:    "",
        season_id:          "",
        status:             "accepted",
        source:             "form",
        special_request:    "",
        team:               "",
        team_id:            "",
        team_number:        "",
        team_position:      "",
        team_type:          "recreational",
        transaction_id:     ""
    }

    if(member) {
        return {
            ...fields,
            birthdate:          member.birthdate,
            email:              member.email,
            first_name:         member.first_name,
            gender:             member.gender,
            home_phone:         member.home_phone,
            household_id:       member.household_id,
            is_guardian:        true,
            last_name:          member.last_name,
            member_id:          member.id,
            mobile_phone:       member.mobile_phone,
            ...initialize
        }
    
    }
    else {
        return {
            ...fields,
            ...initialize
        }
    }
}

export default Registration;
