import 
    React,
    { 
        useState, 
        useContext, 
        useEffect 
    }               from 'react';

import { 
    useTranslation 
}                   from 'react-i18next'

import Button       from 'react-bootstrap/Button';
import Form         from 'react-bootstrap/Form';
import Modal        from 'react-bootstrap/Modal';
import Table        from 'react-bootstrap/Table';

import Row          from '../../../helpers/Row';
import AppContext   from '../../../context/AppContext';

const MemberSearchDialog = (props) => {    
    const {t} = useTranslation();
    const context = useContext(AppContext);

    const [results,  setResults  ] = useState([]);
    const [criteria, setCriteria ] = useState("");
    const [members,  setMembers  ] = useState([]);

    const setError = (message) => {
        if( props.onError ) {
            props.onError(message);
        }
    }

    const memberSearch = async () => {
        if( criteria.length == 0 ) return;

        const record = {
            ...context.defaultHeaders,
            body: JSON.stringify(
                { 
                    query: [ 
                        { field: "last_name", operation: "sw", value: criteria }
                    ] 
                }
            ),
            method:  "POST"
        };

        const target = `/api/v1/member/search`;

        context.debug("MemberSearchDialog", "autoCompleteSearch(REQ): Calling ", target);

        const response  = await fetch(target, record);

        if (response.ok ) {
            const json = await response.json();

            context.debug("MemberSearchDialog", "autoCompleteSearch(RSP)", json);

            if( json.status === "error") {
                setError(json.message);
            }
            else {
                const records = json.records;

                setResults( 
                    records
                        .sort( 
                            (a,b) => { 
                                var nameA = (a.last_name || "").toUpperCase(), // ignore upper and lowercase
                                    nameB = (b.last_name || "").toUpperCase(); // ignore upper and lowercase
                            
                                if (nameA < nameB) { return -1; }
                                if (nameA > nameB) { return  1; }
                                return 0;
                            } 
                        )
                        .sort( 
                            (a,b) => { 
                                var nameA = (a.first_name || "").toUpperCase(), // ignore upper and lowercase
                                    nameB = (b.first_name || "").toUpperCase(); // ignore upper and lowercase
                            
                                if (nameA < nameB) { return -1; }
                                if (nameA > nameB) { return  1; }
                                return 0;
                            }     
                        )
                );
            }
        }
        else {
            setError(response.statusText);
        }
    }

    const executeSearch = (event) => {
        if(event.nativeEvent.key == "Enter") {
            memberSearch();
        }
    }

    const searchHandler = (event) => {
        setCriteria(event.target.value);
    }

    const onClose = ()  => {
        if(props.onAction) {
            props.onAction({ action: "associate", members: members });
        }
        else {
            console.warn("MemberSearchDialog::Missing Property 'onAction'");
        }
    }

    const onCreateNewMember = () => {
        if(props.onAction) {
            props.onAction({ action: "new" });
        }
        else {
            console.warn("MemberSearchDialog::Missing Property 'onAction'");
        }        
    }

    const onCancel = ()  => {
        if(props.onCancel) {
            props.onCancel();
        }
        else {
            console.warn("MemberSearchDialog::Missing Property 'onCancel'");
        }
    }

    const onSelectMember = (event) => {
        context.debug("MemberSearchDialog", "onSelectMember()", event);

        if( event.target.checked ) {
            setMembers([ ...members, event.target.id ]);
        }
        else {
            setMembers( members.filter( member => { return member != event.target.id } ) );
        }
    }

    useEffect(
        () => {
            //console.info("Members", members);
        },
        [members]
    )

    return (
        <Modal show={props.visible} onHide={onCancel}>
            <Modal.Header closeButton>
                {t("member_add_member")}
            </Modal.Header>

            <Modal.Body>
                <Form.Label>{t("last_name")}</Form.Label>
                <Form.Control id="last_name" onChange={searchHandler} onKeyUp={executeSearch} value={criteria.last_name} />

                <Row />

                <Table striped bordered>
                    <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th>{t("last_name")}</th>
                            <th>{t("first_name")}</th>
                            <th>{t("address")}</th>
                            <th>{t("address")}</th>
                            <th>{t("mobile_phone")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            results.map(
                                (member) => {
                                    return (
                                        <tr key={member.id}>
                                            <td><Form.Check id={member.id} onChange={onSelectMember} /></td>
                                            <td>{member.last_name}</td>
                                            <td>{member.first_name}</td>
                                            <td>{member.address_line1}</td>
                                            <td>{member.city}</td>
                                            <td>{member.primary_phone}</td>
                                        </tr>
                                    )
                                }
                            )
                        }
                    </tbody>
                </Table>

            </Modal.Body>
            <Modal.Footer>
                <div className="row">
                    <div className="col text-end">
                        <Button variant="secondary" onClick={onCancel} style={{ marginRight: "10px"}}>{t("cancel")}</Button>
                        <Button variant="success"   onClick={onCreateNewMember} style={{ marginRight: "10px"}}>{t("member_new")}</Button>
                        <Button onClick={onClose}>{t("members_associate")}</Button>
                    </div>
                </div>
            </Modal.Footer>

        </Modal>
    )
}

export default MemberSearchDialog;