import TeamModel        from "./TeamModel";
import LocationModel    from "./LocationModel";

/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const GameModel = ( settings ) => {
    const fields = {
        "gameDate" : new Date(),
        "home_team": new TeamModel(),
        "away_team": new TeamModel(),
        "location":  new LocationModel(),
        "location_details": "",
    }

    return {
        ...fields,
        ...settings
    }
}

export default GameModel;

