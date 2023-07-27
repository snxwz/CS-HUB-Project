import { useEffect, useState } from "react"
import { getToken } from "./session";
import { getAPI } from "./callAPI";


const VideoUpdateModal = (props) => {
    // desc, title, permit

    const [title, setTitle] = useState(props.title);
    const [desc, setDesc] = useState(props.desc);
    const [permit, setPermit] = useState(props.permit);
    const [isConfirm, setIsConfirm] = useState(false);
    const [tags, setTags] = useState(null);
    const [vidTags, setVidTags] = useState(props.tags);

    const updateApi = 'http://localhost:8900/update/video/user';
    const deleteApi = 'http://localhost:8900/delete/video/user';

    useEffect(() => {
        getAPI('tags')
            .then(response => {
                const removeID = vidTags.map(tmp => tmp.T_ID);
                const tmp_tag = response.filter(tag => !removeID.includes(tag.T_ID));
                setTags(tmp_tag)
            });
    }, [])

    const handleSubmit = () => {
        // console.log(props.id);
        // console.log(title);
        // console.log(desc);
        // console.log(permit);
        const tmp = ({
            'V_id': props.V_id,
            'U_id': props.id,
            'title': title,
            'desc': desc,
            'permit': permit,
            'encode': props.encode,
            'tag': vidTags
        })
        const token = getToken();

        fetch(updateApi, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(tmp)
        })
            .then(response => {
                if (response.ok) {
                    props.update();
                } else {
                    console.log(response);
                }
            })
            .catch((e) => {
                console.error();
            })
    }

    const handleTitle = (e) => {
        setTitle(e.target.value);
        e.preventDefault();
    }

    const handleDesc = (e) => {
        setDesc(e.target.value);
        e.preventDefault();
    }

    const handlePermit = (e) => {
        setPermit(e.target.value);
    }

    const handleConfirm = () => {
        setIsConfirm(true);
    }

    const cancleConfirm = () => {
        setIsConfirm(false);
    }

    const handleTag = (tag) => {
        const tmp_vidTags = [...vidTags];
        const tmp_tags = tags.filter(tmp_tag => tmp_tag !== tag);
        tmp_vidTags.push(tag);
        setVidTags(tmp_vidTags);
        setTags(tmp_tags);
    }

    const removeTag = (tag) => {
        const tmp_vidTags = vidTags.filter(tmp_tag => tmp_tag !== tag);
        const tmp_tags = [...tags];
        tmp_tags.push(tag);
        setVidTags(tmp_vidTags);
        setTags(tmp_tags);
    }

    const handleDelete = () => {
        const tmp = {
            'U_id': props.id,
            'U_folder': props.path,
            'V_encode': props.encode
        }
        const token = getToken();

        fetch(deleteApi, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(tmp)
        })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/'
                }
            })
            .catch((e) => {

            })
    }

    return (
        <div className='container-fluid'>
            <div className='row' style={{ color: 'white' }}>
                <div className='col center'><h5>Video Setting</h5></div>
            </div>
            <div className='row'>
                <div className='col' style={{ color: 'white' }}>
                        <h5>
                            <div>
                                <label htmlFor='nameInput'>Title</label>
                                <input type="text" className="from-control" id="titleInput" value={title} onChange={handleTitle} style={{ width: '100%' }} />
                            </div>
                            <br />
                            <div className="row">
                                <div className="col">
                                    <label htmlFor='mailInput'>Description</label>
                                    {/* <input type="text" className="from-control" id="descInput" value={desc} onChange={handleDesc} style={{ width: '100%' }} /> */}
                                    <textarea className="form-control" value={desc} onChange={handleDesc} rows="4"></textarea>
                                </div>
                                <div className="col">
                                    <label>Tag</label>
                                    <h6>
                                        <div className="row">
                                            {vidTags.map((tag, index) => (
                                                <div className="col-auto">
                                                    <div className="" style={{ width: 'fit-content', backgroundColor: 'white', borderRadius: '10px' }}>
                                                        <div style={{ marginRight: '8px', marginTop: '5px', color: 'black' }}>
                                                            <button onClick={() => removeTag(tag)} className="btn">x</button>
                                                            {tag.T_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="col-auto">
                                                <div style={{ width: 'fit-content', backgroundColor: 'white', borderRadius: '10px' }}>
                                                    <div className="dropdown" style={{ marginTop: '5px', color: 'black' }}>
                                                        <button className="btn" type="button" id="dropdownTag" aria-haspopup="true" data-bs-toggle="dropdown" aria-expanded="false">+</button>
                                                        <div className='dropdown-menu dropdown-menu-dark ' aria-labelledby='dropdownTag'>
                                                            {tags && tags.map((d_tag, index) => (
                                                                <button className='dropdown-item' onClick={() => handleTag(d_tag)}>+ {d_tag.T_name}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </h6>
                                </div>
                            </div>
                        </h5>
                </div>

            </div>
            <div className="row" style={{ color: 'white', marginBottom: '10px' }}>


                <div className="col">
                    <h5>Video Permission</h5>
                    <input type="checkbox" value={'public'} checked={permit === 'public'} onChange={handlePermit} style={{ marginRight: '5px' }} />
                    <label>Public</label>
                    <br />
                    <input type="checkbox" value={'private'} checked={permit === 'private'} onChange={handlePermit} style={{ marginRight: '5px' }} />
                    <label>Private</label>
                    <br />
                    <input type="checkbox" value={'unlisted'} checked={permit === 'unlisted'} onChange={handlePermit} style={{ marginRight: '5px' }} />
                    <label>Unlisted</label>
                </div>
                <div className="col">
                    <h5>Delete Video</h5>
                    {!isConfirm ? (
                        <button className="btn btn-danger" onClick={handleConfirm}>Delete</button>
                    ) : (
                        <div>
                            <button className="btn btn-primary" onClick={handleDelete} style={{ marginRight: '15px' }}>Confirm</button>
                            <button className="btn btn-danger" onClick={cancleConfirm} >Cancle</button>

                        </div>
                    )}
                </div>
            </div>
            <div className='row'>
                <div className='col center'>
                    <button className='btn btn-primary rounded-pill' onClick={handleSubmit} style={{ margin: '5px' }}>save</button>
                    <button className='btn btn-danger rounded-pill' onClick={props.closeModal} style={{ margin: '5px' }}>cancle</button>
                </div>
            </div>
        </div>
    )
}

export default VideoUpdateModal