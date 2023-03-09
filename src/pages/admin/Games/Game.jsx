import React                from 'react'

import { 
    useCallback, 
    useContext,
    useEffect,
    useReducer,
    useState
}                           from "react";

import { useTranslation }   from "react-i18next";
import { 
    Link,
    useNavigate,
    useSearchParams
}                           from 'react-router-dom'

import { 
    FontAwesomeIcon 
}                           from '@fortawesome/react-fontawesome'

import { 
    faCopy,
    faHome,
    faSave,
    faTrash
}                           from '@fortawesome/pro-regular-svg-icons'

import Form                 from 'react-bootstrap/Form';

import AppContext           from '../../../context/AppContext';
import DefaultLayout        from "../../../layouts/DefaultLayout";
import Row                  from '../../../helpers/Row';
import Message              from '../../../helpers/Message';
import Attachment           from '../../../helpers/Attachment';

import GameModel            from '../../../models/GameModel';
import ConfirmModal         from '../../../helpers/Modals/ConfirmModal';

const Game = (props) => {
    const navigate    = useNavigate();

    const context    = useContext(AppContext);
    const {t}        = useTranslation();

    const [game,            setGame]            = useState(new GameModel());
    const [isNew,           setIsNew]           = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formState,      dispFormState  ]    = useReducer(
        (current, action) => {
            switch(action.event) {
                case "MESSAGE":
                    return { variant: "",        message: action.message  }
                case "SUCCESS":
                    return { variant: "success", message: action.message  }
                case "WARNING":
                    return { variant: "warning", message: action.message  }
                case "ERROR":
                    return { variant: "danger",   message: action.message }
                default:
                    return {};
            }
        }, 
        {}
    )

    const [searchParams, setSearchParams] = useSearchParams();

    const setError = (message) => {
        dispFormState( { event: "ERROR", message: message });
    }     

    const setSuccess = (message) => {
        dispFormState( { event: "SUCCESS", message: message });
    }

    const setMessage = (message) => {
        dispFormState( { event: "MESSAGE", message: message });
    }

    const submitHandler = async (event) => {
        event.preventDefault();

        let target  = "",
            headers = "";

        if(isNew) {
            target  = "/api/v1/game";
            headers = {
                ...context.defaultHeaders,
                body: JSON.stringify({ game: game }),
                method:  "POST"
            };
        }
        else {
            target  = `/api/v1/game/${game.id}`;
            headers = {
                ...context.defaultHeaders,
                body: JSON.stringify({ game: game }),
                method:  "PATCH"
            };
        }

        context.debug("Game", `submitHandler(): ${headers.method} to ${target}.`, game);

        const response = await fetch(target, headers);

        context.debug("Game", "submitHandler(1): Received...", response);

        if( response.ok ) {
            const json = await response.json();

            context.debug("Game", "submitHandler(2): Received...", json);

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                setGame(json.record);
                setIsNew(false);

                setSuccess("Game saved.");
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const getGameHandler = useCallback(
        async () => {
            setError(null);

            const gameId = searchParams.get("id");

            if(gameId) {
                setIsNew(false);

                const response  = await fetch(`/api/v1/game/${gameId}`);

                if(response.ok) {
                    const json = await response.json();
    
                    context.debug("Game", "getGameHandler()", json);
    
                    if( json.status === "error") {
                        setError(response.message);
                    }
                    else {
                        const record = context.deNullObject(json.record);
                        setGame(record);
                    }
                }
                else {
                    setError(response.statusText);
                }
            }
        },
        [],
    );

    const onDeleteRecordHandler = async () => {
        const headers  = {
            ...context.defaultHeaders,
            method: "DELETE"
        };

        const response = fetch(`/api/v1/game/${game.id}`, headers);

        if( response.ok ) {
            deleteModalCloseHandler();
            navigate("/admin/games");
        }
        else {
            setError(response.statusText);
        }
    }

    const deleteRecordHandler = () => {
        setShowDeleteModal(true);
    }

    const deleteModalCloseHandler = () => {
        setShowDeleteModal(false);
    }

    useEffect( 
        () => {
            if( isNew ) {
                setMessage("New Game");
            }

            getGameHandler();
        }, 
        [getGameHandler]
    );    

    const fieldChangeHandler = (event) => {
        setGame(
            {
                ...game,
                [event.target.id]: event.target.value
            }
        );
    }

    return (
        <DefaultLayout>
            
            <Row />

            <form onSubmit={submitHandler}>
                <div className="news">  
                    <div className="row">
                        <div className="col-8">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/"><FontAwesomeIcon icon={faHome} /></Link></li>
                                    <li className="breadcrumb-item active" aria-current="page"><Link to="/admin/images">{t('images')}</Link></li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col-4 text-end px-2">
                            <button onClick={submitHandler} className="btn btn-default" style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faSave}  size="2x" /></button>
                            <div    className="btn btn-default"         style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faCopy}  size="2x" /></div>
                            <div    className="btn btn-outline-danger"  style={{ marginLeft: "10px"}}><FontAwesomeIcon icon={faTrash} size="2x" onClick={deleteRecordHandler} /></div>
                        </div>
                    </div>

                    <Row />

                    <Message formState={formState} />
                    
                    <ConfirmModal   message={t("confirm_delete")} 
                                    header={`${t("delete")} '${game.name}'`} 
                                    onContinue={onDeleteRecordHandler} 
                                    isVisible={showDeleteModal} 
                                    onClose={deleteModalCloseHandler} 
                    />

                    <div className="row">
                        <div className="col-4">
                            <label>{t("name")}</label>
                            <Form.Control type="text" id="name" onChange={fieldChangeHandler} defaultValue={game.name} />
                        </div>
                        <div className="col-4">
                            <label>{t("approved")}</label>
                            <Form.Select id="approved" onChange={fieldChangeHandler} value={game.approved}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>                                
                            </Form.Select>
                        </div>
                        <div className="col-4">
                            <label>{t("image_type")}</label>
                            <Form.Select id="image_type" onChange={fieldChangeHandler} value={game.image_type}>
                                <option value="carousel">Carousel</option>
                                <option value="email">Email</option>
                                <option value="sponsor">Sponsor</option>
                            </Form.Select>
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-4">
                            <label>{t("show_label")}</label>
                            <Form.Select onChange={fieldChangeHandler} hint={t("show_label_help")} id="show_label" value={game.show_label}>
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </Form.Select>
                        </div>        
                        <div className="col-4">
                            <label>{t("label")}</label>
                            <Form.Control type="text" id="label" onChange={fieldChangeHandler} value={game.label} />
                        </div>            
                        <div className="col-4">
                            <label>{t("order")}</label>
                            <Form.Control 
                                type="number" 
                                step="1" 
                                id="order" 
                                className="form-control"
                                onChange={fieldChangeHandler} 
                                value={game.order} 
                            />
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-12">
                            <label>{t("target_url")}</label>
                            <Form.Control type="text" hint={t("target_url_help")} id="target_url" label="Target URL" onChange={fieldChangeHandler} value={game.target_url} />
                        </div>
                    </div>  

                    <Row />      

                    <div className="row">
                        <div className="col-4">
                            <label>{t("start_date")}</label>
                            <Form.Control type="date" id="start" onChange={fieldChangeHandler} value={game.start} />
                        </div>
                        <div className="col-4">
                            <label>{t("expires")}</label>
                            <Form.Control type="date" id="expires" onChange={fieldChangeHandler} value={game.expires} />
                        </div>
                        <div className="col-4">
                            <label>{t("created_by")}</label>
                            <Form.Control type="text" id="created_by" readOnly value={game.created_by} />
                        </div>
                    </div>

                    <Row />

                    <div className="row">
                        <div className="col-6">
                            <label>{t("file")}</label>
                            <Form.Control type="file" id="game" onChange={fieldChangeHandler} />
                        </div>
                        <div className="col-6">
                            { imageURL && <Attachment target={imageURL} type="game" /> }
                        </div>
                    </div>   

                    <Row />
                </div>
            </form>
        </DefaultLayout>
    )
}

export default Game;