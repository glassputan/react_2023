import React              from 'react';

import {
    useEffect,
    useState,
    useContext
}                         from 'react';

import Image              from 'react-bootstrap/Image';

import AppContext         from '../context/AppContext';

const ImageAttachment = (props) => {
    const context                 = useContext(AppContext);
    const imageId                 = typeof(props.image) == "object" ? props.image.id : props.image;
    const [imageURL, setImageURL] = useState();

    const table                   = props.type ? props.type : "image";

    const setError = (message) => {
        if(props.onError) {
            props.onError(message);
        }
    }

    const getImage = async () => {

        if( imageId ) {
            const response  = await fetch(`/api/v1/${table}/${imageId}/thumb`, context.defaultHeaders);

            //context.debug("ImageAttachment", "getImage()", response);

            if( response.ok ) {
                const json = await response.json();

                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    context.debug("ImageAttachment", "getImage()", json);

                    setImageURL(json.image_url);
                }
            }
            else {
                setError(response.statusText);
            }
        }
    }

    useEffect(
        () => {
            getImage();
        },
        [imageId]
    )

    return <Image src={imageURL} thumbnail={true} rounded />
}

export default ImageAttachment;