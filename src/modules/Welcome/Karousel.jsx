import "react-responsive-carousel/lib/styles/carousel.min.css";

import React      from 'react'

import { 
    useCallback, 
    useState, 
    useEffect,
    useContext
} from "react";

import Carousel   from 'react-bootstrap/Carousel';

import AppContext from "../../context/AppContext";

const Karousel = () => {
    const context = useContext(AppContext);

    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);
    const [carousel,  setCarousel]  = useState();    

    const getImagesHandler = useCallback(
        async () => {
            setError(null);
    
            setIsLoading(true);

            try {
                const request  = await fetch("/api/v1/images/carousel");

                //debug("getImagesHandler()", request);

                if( !request.ok ) throw new Error(request.statusText);

                const response = await request.json();

                //debug("getImagesHandler('response')", response);

                if( response.status && response.status === "error") {
                    throw new Error(response.message);
                }
                else {
                    context.debug("Karousel", "getImagesHandler()", response.records);

                    setCarousel(response.records);
                }
            }
            catch(xx) {
                setError(xx.message);
            }
    
            setIsLoading(false);
        },
        [],
    );
    
    useEffect( 
        () => {
            getImagesHandler();
        }, 
        [getImagesHandler]
    ); 
    
    return (
        <>
            {  isLoading && <div>Loading...</div> }
            { !isLoading && error && <div>{error}</div> }
            { 
                !isLoading && carousel && 
                <Carousel indicators={false} controls={false} fade>
                    {
                        carousel.map( 
                            (cx) => { 
                                return (
                                    <Carousel.Item interval={3000} key={cx.id}><img className="d-block w-100" src={cx.image_url} alt={cx.name} />
                                        { cx.show_label && <Carousel.Caption><h3 className="text-white">{cx.label}</h3></Carousel.Caption> }
                                    </Carousel.Item> 
                                )
                            } 
                        )
                    }
                </Carousel> 
            }
        </>
    );
}

export default Karousel;