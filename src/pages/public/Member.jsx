import 
    React,
    { 
        useContext, 
        useState, 
        useEffect 
    }                   from "react";

import AppContext       from '../../context/AppContext';

const Member = (props) => {
    const context = useContext(AppContext);

    const [member,    setMember]   = useState(
        {
            "status": "ok",
            "message": "",
            "id": "-1"
        }
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);

    const getMember = async () => {
        setIsLoading(true);
        setError(null);

        if( props.id ) {
            const response  = await fetch(`/api/v1/team/${props.id}/coach`);

            context.debug("Member", "getMember()", response);

            if(response.ok) {
                const json = await response.json();

                context.debug("Member", "getMember()", json);

                if( json.status === "error") {
                    setError(json.message);
                }
                else {
                    setMember(json.record);
                }
            }
            else {
                context.error("Member", "getMember()", response.statusText);
            }
        }

        setIsLoading(false);
    };

    useEffect( 
        () => {
            getMember();
        }, 
        []
    );    

    return (
        <>
            { isLoading  && <p>Loading...</p> }            
            { !isLoading && <a href={`mailto:${member.email}`}>{member.first_name}&nbsp;{member.last_name}</a> }
            { !isLoading && error && <p>{error}</p> }
        </>
    )
}

export default Member;