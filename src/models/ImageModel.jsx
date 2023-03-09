import { useContext }   from 'react';
import AppContext       from '../context/AppContext';

/**
 * 
 * @param { JSONObject } settings 
 * @returns 
 */
 const ImageModel = ( settings ) => {
    const context = useContext(AppContext);

    const fields = {
        name:         "",
        approved:     "false",
        start:        context.getFormattedDate(new Date()),
        expires:      "",
        created_by:   "",
        approved:     "",
        image_type:   "carousel",
        order:        1000,
        target_url:   "",
        label:        "",
        show_label:   "false",
        target_url:   ""
    }

    return {
        ...fields,
        ...settings
    }
}

export default ImageModel;