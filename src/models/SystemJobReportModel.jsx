import { 
    useContext 
}                       from 'react';

import AppContext       from "../context/AppContext";

const SystemJobReportModel = ( properties ) => {
    const context = useContext(AppContext);

    const fields =  {
        "id":              context.getUUID(),
        "job":             "",
        "games":           0,
        "games_total":     0,
        "game_issues":     0,
        "divisions":       0,
        "divisions_total": 0,
        "job_status":      "ready",
        "message":         ""
    }

    return {
        ...fields,
        ...properties
    }
}

export default SystemJobReportModel;