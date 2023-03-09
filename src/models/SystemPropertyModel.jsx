import React from 'react';

const SystemPropertyModel = (values) => {
    const fields = {
        "name":       "",
        "value":      "",
        "field_type": "",
        "user_id":    "",
        "created_at": "",
        "updated_at": new Date()
    }

    return {
        ...fields,
        ...values
    }
}

export default SystemPropertyModel;