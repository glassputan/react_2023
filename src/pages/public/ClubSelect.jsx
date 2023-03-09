import 
    React,
    {
        useState,
        useCallback,
        useEffect,
        useContext
    }               from 'react'

import { 
        useTranslation 
    }               from 'react-i18next';

import Form         from "react-bootstrap/Form";

import AppContext   from '../../context/AppContext';

const ClubSelect = (props) => {
    const [clubs,   setClubs]    = useState([]);
    const [error,   setError]    = useState();    

    const {t}                    = useTranslation();

    const context = useContext(AppContext);

    const getClubsHandler = useCallback(
        async () => {
            setError(null);

            const response  = await fetch("/api/v1/clubs", context.defaultHeaders);

            if( response.ok ) {
                const json      = await response.json();

                context.debug("ClubSelect", "getClubsHandler()", json);

                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    setClubs(json.records);
                }
            }
            else {
                setError(response.statusText);
            }
        },
        [],
    ); 
    
    const onChangeHandler = (event) => {
        if( props.onChange ) {
            props.onChange(event);
        }
        else {
            context.warn("ClubSelect", "onChangeHandler(): Missing property 'onChange(<event>)'");
        }
    }
    
    useEffect(
        () => {
            getClubsHandler();
        },
        [getClubsHandler]
    )

    if(error) {
        return <div className="text-danger">{error}</div>
    }
    else {
        return (
            <>
                <label>{t("home_club")}</label><br/>
                <Form.Select id="club_id" onChange={onChangeHandler} value={props.value} >
                    {
                        clubs && clubs.map(
                            (club) => {
                                return <option key={club.id} value={club.id}>{club.name}</option>
                            }
                        )
                    }
                </Form.Select>
            </>
        )
    }
}

export default ClubSelect;