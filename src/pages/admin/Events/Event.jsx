import 
    React,
{ 
    useRef,
    useState, 
    useEffect,
    useContext
}                         from "react";

import { useTranslation } from "react-i18next";
import { Link }           from 'react-router-dom'

import Alert              from 'react-bootstrap/Alert';
import Button             from 'react-bootstrap/Button';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faCheck,
    faPlus,
    faTrash,
    faWindowClose
}                         from '@fortawesome/pro-regular-svg-icons'

import AppContext         from '../../../context/AppContext';

import { Editor }         from '@tinymce/tinymce-react';

import EventModel         from '../../../models/EventModel';

const Event = (props) => {
    const context = useContext(AppContext);    
    const {t}     = useTranslation();

    const [editing,   setEditing   ] = useState(false);
    const [clubEvent, setClubEvent ] = useState(new EventModel());
    const [isNew,     setNew       ] = useState(true);

    const eventRef = useRef();

    const editHandler = () => {
        setEditing( !editing );
    }

    const onChangeHandler = (event) => {
        context.debug("Event", "onChangeHandler()", event);

        const note = eventRef.current.getContent();

        if( event.target.id == "note" ) {
            setClubEvent(
                { 
                    ...clubEvent,
                    note: note
                }
            );
        }
        else {
            setClubEvent(
                { 
                    ...clubEvent,
                    [event.target.id]: event.target.value
                }
            );
        }
    }

    const onSaveHandler = () => {
        context.debug("Event", "onSaveHandler()", clubEvent);

        setEditing(false);

        if( props.onSave ) {
            props.onSave(clubEvent, isNew);
            setClubEvent( new EventModel() );
        }
    }

    const onDeleteHandler = () => {
        context.debug("Event", "onDeleteHandler()", clubEvent);

        setEditing(false);

        if( props.onDelete ) {
            props.onDelete(clubEvent, isNew);
        }
    }

    useEffect(
        () => {
            if( props.data ) {
                setNew(false);
                setClubEvent(context.deNullObject(props.data))
            }
            else {
                setClubEvent( new EventModel() );
            }
        },
        []
    )
    
    return (
        <tr id={module.id} onDoubleClick={editHandler}>
            {
                !editing && isNew && <td colSpan="7"><FontAwesomeIcon icon={faPlus} /></td>
            }
        { 
            !editing && !isNew &&
            <>
                <td><Link to={`#`} onClick={editHandler}>{clubEvent.title}</Link></td>
                <td className="text-center">{clubEvent.event_date}</td>
                <td className="text-center">{clubEvent.all_day ? t("yes") : t("no")}</td>
                <td className="text-center">{clubEvent.auto_close ? t("yes") : t("no")}</td>
                <td className="text-center">{clubEvent.event_start ? new Date(clubEvent.event_start).toLocaleTimeString() : "" }</td>
                <td className="text-center">{clubEvent.event_end   ? new Date(clubEvent.event_end).toLocaleTimeString() : "" }</td>
                <td className="text-center">{clubEvent.event_type == "club_event" ? "Club event" : clubEvent.event_type}</td>
            </>
        }

        {
            editing &&
            <td colSpan="7">
                <div className="row" style={{ marginBottom: "10px"}}>
                    <div className="col text-end">
                        <Button onClick={onSaveHandler}   variant="success" style={{ marginRight: "10px" }} data-bs-toggle="tooltip" title="Save Event"><FontAwesomeIcon icon={faCheck} /></Button>
                        <Button onClick={editHandler}                       style={{ marginRight: "10px" }} data-bs-toggle="tooltip" title="Cancel Changes"><FontAwesomeIcon icon={faWindowClose} /></Button>
                        <Button onClick={onDeleteHandler} variant="danger"><FontAwesomeIcon icon={faTrash}  data-bs-toggle="tooltip" title="Delete Event" /></Button>
                    </div>
                </div>                
                <div className="row">
                    <div className="col">
                        <label>{t("title")}</label>
                        <input type="text" className="form-control" value={clubEvent.title}      onChange={onChangeHandler} id="title" />
                    </div>
                    <div className="col">
                        <label>{t("date")}</label>
                        <input type="date" className="form-control" value={clubEvent.event_date} onChange={onChangeHandler} id="event_date" />
                    </div>
                    <div className="col">
                        <label>{t("all_day")}</label>
                        <select className="form-control" value={clubEvent.all_day} onChange={onChangeHandler} id="all_day">
                            <option value={false}>No</option>
                            <option value={true}>Yes</option>
                        </select>
                    </div>
                    <div className="col">
                        <label>{t("auto_close")}</label>
                        <select className="form-control" value={clubEvent.auto_close} onChange={onChangeHandler} id="auto_close">
                            <option value={false}>No</option>
                            <option value={true}>Yes</option>
                        </select>
                    </div>                    
                    <div className="col">
                        <label>{t("time")}</label>
                        <input type="time" className="form-control" value={clubEvent.event_start.length > 6 ? clubEvent.event_start.substring(11,16) : clubEvent.event_start}   onChange={onChangeHandler} id="event_start" />
                        <input type="time" className="form-control" value={clubEvent.event_end.length > 6 ? clubEvent.event_end.substring(11,16) : clubEvent.event_end}     onChange={onChangeHandler} id="event_end" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-3">
                        <label>{t("event_type")}</label>
                        <select id="event_type" value={clubEvent.event_type}  className="form-control" onChange={onChangeHandler} >
                            <option value=""></option>
                            <option value="club_event">{t("club_event")}</option>
                            <option value="recuritment">{t("recruitment")}</option>
                        </select>
                    </div>
                    <div className="col-9">
                        <label>{t("description")}</label>
                        <Editor
                            onInit={
                                (evt, editor) => eventRef.current = editor
                            }

                            initialValue={clubEvent.note || ""}
                            
                            init={
                                {
                                    height: 300,
                                    menubar: false,
                                    plugins: ['code wordcount link table print'],
                                    toolbar: 'undo redo | formatselect | ' +
                                    'bold italic backcolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | code | help',
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                }
                            }
                        />
                    </div>
                </div>
            </td>
        }
        </tr>
    )
}

export default Event;