import React from 'react';

const TeamImportModel = () => {
    return {
        season_id:           0,
        groups_total:        0,
        groups_completed:    0,
        divisions_total:     0,
        divisions_completed: 0,
        teams_total:         0,
        teams_completed:     0,
        group:               "",
        division:            "",
        team:                "",
        job_status:          "initializing",
        message:             ""
    }
}

export default TeamImportModel;