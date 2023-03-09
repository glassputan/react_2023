import 
    React,
    { 
        useCallback, 
        useState, 
        useEffect
    }                     from "react";

import { 
    useTranslation 
}                         from "react-i18next";

import { 
    Link,
    useNavigate
}                         from 'react-router-dom'

import Alert              from 'react-bootstrap/Alert';
import Button             from 'react-bootstrap/Button';
import Table              from 'react-bootstrap/Table';

import { 
    FontAwesomeIcon 
}                         from '@fortawesome/react-fontawesome'

import { 
    faHome
}                           from '@fortawesome/pro-regular-svg-icons'

import DefaultLayout        from "../../../layouts/DefaultLayout"          //"../../../layouts/DefaultLayout";
import Row                  from '../../../helpers/Row';
import ImageAttachment      from '../../../helpers/ImageAttachment';


const ImageRow = (prop) => {
    const {t}       = useTranslation();
    const navigate  = useNavigate();

    const image = prop.image;
    
    const onRedirect = () => {
        navigate(`/admin/image?id=${image.id}`);
    }

    return (
        <tr onDoubleClick={onRedirect}>
            <td>
                {image.name}
            </td>
            <td className="text-center">{image.approved ? t("yes") : t("no") }</td>
            <td>
                <ImageAttachment image={image} />
            </td>
            <td>
                { image.label }
            </td>
            <td>{
                new Intl.DateTimeFormat("ISO", 
                    {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                    }
                ).format(new Date(image.updated_at))}                    
            </td>
        </tr>
    )
}

const Images = () => {
    const {t} = useTranslation();

    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState(null);
    const [images,    setImages ]   = useState();

    const navigate = useNavigate();
    
    const imageHandler = useCallback(
        async () => {
            setIsLoading(true);
            setError(null);
    
            const response  = await fetch("/api/v1/images");

            if( response.ok ) {
                const json = await response.json();

                if( json.status && json.status === "error") {
                    setError(json.message);
                }
                else {
                    setImages(json);
                }
            }
            else {
                setError(response.statusText);
            }
    
            setIsLoading(false);
        },
        [],
    );

    const gotoNew = () => {
        navigate("/admin/image");
    }

    useEffect( 
        () => {
            imageHandler();
        }, 
        [imageHandler]
    );    

    return (
        <DefaultLayout>
            <Row />
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
                    <div className="col-4 text-end">
                        <Button variant="outline-primary" onClick={gotoNew}>{t("new")}</Button>
                    </div>
                </div>

                <Row />

                {  error && <Alert variant="danger">{error}</Alert>              }
                {  isLoading && <Alert variant="warning">{t("loading")}</Alert>  }

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>{t("name")}</th>
                            <th>{t("approved")}</th>
                            <th>{t("image")}</th>
                            <th>{t("title")}</th>
                            <th>{t("updated_at")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            images && Array.isArray(images) &&
                            images
                                .sort(
                                    (a, b) => {
                                        var nameA = (a.name || "").toUpperCase(), // ignore upper and lowercase
                                            nameB = (b.name || "").toUpperCase(); // ignore upper and lowercase
                                    
                                        if (nameA < nameB) { return -1; }
                                        if (nameA > nameB) { return  1; }
                                        return 0;
                                    }
                                )
                                .map(
                                    (image) => {
                                        return <ImageRow key={image.id} image={image} />
                                    }
                                )
                        }
                    </tbody>
                </Table>

                <Row />
            </div>
        </DefaultLayout>
    )
}

export default Images;