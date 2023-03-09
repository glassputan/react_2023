import React from 'react';

const Clearance = () => {
    return {
        member_id:          0,
        clearance_type_id:  0,
        issued_on:          new Date().toISOString().substring(0, 10),
        expires_on:         "",
        expired:            "",
        control_number:     "",
        status:             "",
        created_at:         "",
        updated_at:         ""
    }
}

export default Clearance;