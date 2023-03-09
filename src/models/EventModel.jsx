
/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const EventModel = ( settings ) => {
    const fields = {
        "id":            "",
        "title":         "",
        "start":         "",
        "end":           "",
        "event_date":    "",
        "event_start":   "",
        "event_end":     "",
        "event_type":    "",
        "event_expires": "",
        "note":          "",
        "position":      "",
        "created_at":    "",
        "updated_at":    "",
        "all_day":       ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default EventModel;