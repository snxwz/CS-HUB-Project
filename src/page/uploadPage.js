import { useState, useEffect } from "react";
import axios from "axios";

import './../css/utilities.css';
import './../css/upload.css';

import Sidebar from "../components/sidebar";
import ProgressBar from "../components/progressBar";
import { getAPI } from "../components/callAPI";

import { getUser, getlocalData, isSessionSet } from "../components/session";

const UploadPage = () => {

    var session
    var token
    const user = getUser();
    document.title = "Upload Video";

    if (isSessionSet('token')) {
        // console.log('in local');
        session = getlocalData('session');
        token = getlocalData('token')
    }


    const uploadAPI = 'http://localhost:8900/upload';
    const gatUploadApi = 'http://localhost:8900/get/videos/upload?u=' + user;

    const [file, setFile] = useState();
    const [vidDesc, setVidDesc] = useState('');
    const [upProgress, setUpProgress] = useState('0');
    const [vidPermit, setVidPermit] = useState('public');
    const [tmp, setTmp] = useState('');
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoKey, setVideoKey] = useState(0);
    const [vidTags, setVidTags] = useState([]);
    const [tags, setTags] = useState(null);
    const [showTags, setShowTags] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [windows, setWindows] = useState('upload');
    const [uploading, setUploading] = useState(null)

    useEffect(() => {
        getAPI('tags')
            .then(response => {
                // const removeID = vidTags.map(tmp => tmp.T_ID);
                // const tmp_tag = response.filter(tag => !removeID.includes(tag.T_ID))
                setTags(response);
                setShowTags(response);
            })
    }, []);

    useEffect(() => {
        const fetchData = () => {
            fetch(gatUploadApi)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setUploading(data);
            })
        }

        let interval;

        fetchData();
        
        if(windows === 'uploading') {
            interval = setInterval(fetchData, 20000);
        }

        return () => clearInterval(interval);
    }, [windows]);

    const checkDate = () => {
        const expDate = getlocalData('expDate');
        if (Date.now() >= expDate) {
            localStorage.clear();
            window.location.href = '/token-expired';
        }
    }

    const handleTag = (tag) => {
        const tmp_vidTags = [...vidTags];
        const tmp_tags = showTags.filter(tmp_tag => tmp_tag !== tag);
        tmp_vidTags.push(tag);
        setVidTags(tmp_vidTags);
        // setTags(tmp_tags);
        setShowTags(tmp_tags);
    }

    const removeTag = (tag) => {
        const tmp_vidTags = vidTags.filter(tmp_tag => tmp_tag !== tag);
        const tmp_tags = [...showTags];
        tmp_tags.push(tag);
        const tmp = tmp_tags.map(tmp => tmp.T_ID);
        const show = tags.filter(tag => tmp.includes(tag.T_ID));
        setVidTags(tmp_vidTags);
        // setTags(tmp_tags);
        setShowTags(show);
    }

    const searchTag = (e) => {
        e.preventDefault();
        if (e.target.value === '') {
            const removeID = vidTags.map(tmp => tmp.T_ID);
            const tmp_tag = tags.filter(tag => !removeID.includes(tag.T_ID))
            setShowTags(tmp_tag);
        } else {
            const input = e.target.value;
            const tmp_tags = vidTags.map(tmp => tmp.T_ID);
            const show = tags.filter(tag => !tmp_tags.includes(tag.T_ID));
            const tmp = show.filter(tag =>
                tag.T_name.toLowerCase().includes(input.toLowerCase())
            );
            setShowTags(tmp);
        }
    };

    const handleFileChange = (e) => {
        // console.log(e.target.files[0]);
        const tmpFile = e.target.files[0];
        if (tmpFile) {
            setFile(tmpFile);
            setTmp(tmpFile.name);
            setVideoUrl(URL.createObjectURL(tmpFile));
            setVideoKey(videoKey + 1);
        }

    };

    const handleVidName = (e) => {
        setTmp(e.target.value)
        e.preventDefault();
    }

    const handleVidDesc = (e) => {
        setVidDesc(e.target.value)
        e.preventDefault();
    }

    const handleSelect = (e) => {
        setVidPermit(e.target.value);
    }

    const handleThumbnail = (e) => {
        var thumbnail = e.target.files[0];
        if (thumbnail) {
            const reader = new FileReader();

            reader.onload = () => {

                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxW = 800;
                    const aspectRatio = 16 / 9;


                    let w = image.width;
                    let h = image.height;

                    const maxH = Math.round(w / aspectRatio);

                    if (w > maxW || h > maxH) {
                        const wRatio = maxW / w;
                        const hRatio = maxH / h;

                        const ratio = Math.min(wRatio, hRatio);
                        w *= ratio;
                        h *= ratio;
                    }

                    canvas.width = w;
                    canvas.height = h;

                    const context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, w, h);

                    const b64 = canvas.toDataURL('image/jpeg');
                    const tmp = b64.replace("data:image/jpeg;base64,", "");
                    setThumbnail(tmp);
                };

                image.src = reader.result;
            };

            reader.readAsDataURL(thumbnail);
        }


    }

    const handleClickUpload = async () => {

        checkDate();

        setUpProgress('0');
        if (file) {

            document.getElementById('submitBtn').disabled = true;
            document.getElementById('cancleBtn').disabled = true;

            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);

            video.addEventListener('loadedmetadata', function () {
                const duration = video.duration;
                const w = video.videoWidth;
                const h = video.videoHeight;
                const type = file.type.split('/').pop(); // video/mp4 -> [video, mp4] -> mp4
                const tmpData = {
                    'videoName': tmp,
                    'videoOriginName': file.name,
                    'videoSize': file.size,
                    'videoDuration': duration,
                    'videoDesc': vidDesc,
                    'videoType': type,
                    'videoOwner': session.U_id,
                    'videoPermit': vidPermit,
                    'videoThumbnail': thumbnail,
                    'path': session.U_folder,
                    'width': w,
                    'height': h,
                    'tags': vidTags
                    // encode included
                }
                // setVidData(tmpData)

                const formData = new FormData();
                formData.append('video', file, file.name);
                formData.append('data', JSON.stringify(tmpData));
                // console.log(tmpData);
                axios.post(uploadAPI, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + token
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = (progressEvent.loaded / progressEvent.total);
                        let tmp = Math.round(progress * 100)
                        setUpProgress(tmp.toString());
                        if (tmp === 100.0 || tmp === 100) {
                            console.log('done upload');
                        }
                    },
                })
                    .then((response) => {
                        window.location.reload();
                    })
                    
                    .catch((error) => {
                        console.error('Upload failed:', error);
                    });
            });

        } else {
            // active button after upload function
            console.log('file not found');
        }
    }

    const cardClick = () => {
        document.getElementById('uploadBtn').click();
        // handleClickUpload
    }

    const thumbnailClick = () => {
        document.getElementById('imgBtn').click();
    }

    const logTest = () => {
        console.log('work!!!');
        console.log(vidPermit);
    }

    const changeWindows = (win) => {
        if(win === 'upload') {
            setUploading(null)
        }
        setWindows(win);
    }

    return (
        <div>
            <Sidebar>

                <div className="container-fluid">
                    {windows === 'upload' ?
                        <div className="card card-margin" style={{ marginTop: '6%', backgroundColor: 'rgb(44,48,52)' }}>
                            <div>
                                <button className="btn" style={{ margin: '10px', backgroundColor: 'gray' }} onClick={() => changeWindows('upload')}>upload</button>
                                <button className="btn" style={{ margin: '10px', backgroundColor: 'gray' }} onClick={() => changeWindows('uploading')}>uploading video</button>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-7">
                                        <div>
                                            {videoUrl ? (
                                                <div className="card" style={{ height: '65.7vh' }}>
                                                    <div className="card-body">
                                                        <video key={videoKey} controls style={{ width: '100%' }} >
                                                            <source src={videoUrl} type="video/mp4" />
                                                        </video>

                                                        <div className="center">
                                                            <button className="btn btn-primary" onClick={cardClick} style={{ marginRight: '5px' }}>
                                                                Change Video
                                                            </button>
                                                            <button className="btn btn-primary" onClick={thumbnailClick} style={{ marginLeft: '5px' }}>
                                                                Select Thumbnail
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                            ) : (
                                                <div className="card upload-card" onClick={cardClick} style={{ height: '65.7vh' }}>
                                                    <div className="card-body">
                                                        <h4 className="card-title center" style={{ marginTop: '20%' }}>Video Upload</h4>
                                                        <p className="card-text center">Choose a video to upload.</p>
                                                    </div>
                                                    {/* <input className="form-control-file" id="uploadBtn" type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} /> */}
                                                </div>
                                            )}

                                            <input className="form-control-file" id="uploadBtn" type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                            <input className="form-control-file" id="imgBtn" type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handleThumbnail} />

                                        </div>
                                    </div>
                                    <div className="col-5" style={{ color: 'white' }}>
                                        <div className="row" >
                                            <h4>Video Name</h4>
                                            <div className="input-group row mb-3">
                                                <input type="text" className="form-control" placeholder='' value={tmp} onChange={handleVidName} ></input>
                                            </div>
                                        </div>
                                        <div className="input-group row">
                                            <div className="col">
                                                <h4>Video Description</h4>
                                                <textarea className="form-control" onChange={handleVidDesc} rows="4"></textarea>
                                            </div>
                                            <div className="col">
                                                <h4>Video Permission</h4>
                                                <select className="form-control custom-select mb-3" value={vidPermit} onChange={handleSelect}>
                                                    <option value='public'>Public</option>
                                                    <option value="private">Private</option>
                                                    <option value="unlisted">Unlisted</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="input-group row" style={{ marginTop: '15px' }}>
                                            <label>Tag</label>
                                            {tags &&
                                                <h6>
                                                    <div className="row">
                                                        {vidTags && vidTags.map((tag, index) => (
                                                            <div className="col-auto" key={index}>
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
                                                                        <div className="col input-group">
                                                                            <input type="text" className="form-control" placeholder="search tag" onChange={searchTag} defaultValue={''} />
                                                                        </div>
                                                                        {showTags && showTags.slice(0, 5).map((d_tag, index) => (
                                                                            <button key={index} className='dropdown-item' onClick={() => handleTag(d_tag)}>+ {d_tag.T_name}</button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </h6>
                                            }
                                        </div>
                                        <div className="row" style={{ marginTop: '10%' }}>
                                            <div className="col btn-margin center">
                                                <button className="btn btn-primary rounded-pill" style={{ flex: '1', height: '130%' }} id="submitBtn" onClick={handleClickUpload}>upload</button>
                                                <button className="btn btn-danger rounded-pill" style={{ flex: '1', height: '130%' }} id="cancleBtn" onClick={logTest}>cancle</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br></br>
                                <div className="row" style={{ marginLeft: '2px', marginRight: '2px' }}>
                                    <div className="col-12">
                                        <div className="progress">
                                            <ProgressBar value={upProgress + '%'} />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        :
                        <div className="card card-margin" style={{ marginTop: '6%', backgroundColor: 'rgb(44,48,52)' }}>
                            <div>
                                <button className="btn" style={{ margin: '10px', backgroundColor: 'gray' }} onClick={() => changeWindows('upload')}>upload</button>
                                <button className="btn" style={{ margin: '10px', backgroundColor: 'gray' }} onClick={() => changeWindows('uploading')}>uploading video</button>
                            </div>
                            <div className="card-body" style={{color: 'white'}}>
                                {Object.keys(uploading).length > 0 ? 
                                    <table>
                                        <tr>
                                            <th scope="col-3">Video</th>
                                            <th scope="col">Coverting</th>
                                        </tr>
                                    
                                {uploading.map((upload, index) => (
                                     <tr key={index}> 
                                        <td className="col-3">
                                            <div>
                                            <img className="card-img-top " src={'data:image/jpeg;base64,' + upload.V_pic} style={{marginBottom: '5px', borderRadius: '20px'}} alt={upload.V_title+' thumbnail'} />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="row">
                                                <div className="col-12" style={{marginLeft: '10px'}}>
                                                    <div><h5>{upload.V_title} : {upload.V_encode}</h5></div>
                                                    <div className="progress">
                                                        <ProgressBar value={upload.V_permit} />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </table>
                            :  
                            <div className="center" style={{color: 'white'}}>
                                <h3>
                                    No video uploadig
                                </h3>
                            </div> 
                            }
                            </div>
                        </div>
                    }
                </div>
            </Sidebar>
        </div>

    );

}

export default UploadPage;