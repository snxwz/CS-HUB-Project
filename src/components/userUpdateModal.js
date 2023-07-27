import { useState } from "react";
import { getToken } from "./session";

const UserUpdate = (props) => {

    const session = props.data;
    const [username, setUsername] = useState(session.U_name);
    const [email, setEmail] = useState(session.U_mail);
    const [propic, setPropic] = useState(null);
    const [bannerpic, setBannerpic] = useState(null);

    const api = 'http://localhost:8900/update/user/user';

    const handleUsername = (e) => {
        setUsername(e.target.value);
        e.preventDefault();
    }

    const handleEmail = (e) => {
        setEmail(e.target.value);
        e.preventDefault();
    }

    const handlePropic = (e) => {
        setPropic(e.target.files[0]);
    }

    const handleBanner = (e) => {
        setBannerpic(e.target.files[0]);
    }

    const sendRequest = () => {
        const formData = new FormData();
        const data = {
            'U_id': session.U_ID,
            'username': username,
            'email': email
        }
        
        formData.append('data', JSON.stringify(data));
        formData.append('pro', propic);
        formData.append('banner', bannerpic);

        const token = getToken();
        console.log(data);
            fetch(api, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer '+ token
                },
                body: formData
            })
            .then((response) => {
                if(response.ok){
                    props.update();
                }
            })
            .catch((e) => {
                console.error(e);
            })
    }

    return (
        <div className='container-fluid'>
            <div className='row' style={{ color: 'white' }}>
                <div className='col center'><h5>User Setting</h5></div>
            </div>
            <div className='row'>
                <div className='col' style={{ color: 'white' }}>
                    <form>
                        <h5>
                            <div className="form-group">
                                <label htmlFor='nameInput'>User Name</label>
                                <input type="text" className="from-control" id="nameInput" placeholder="" value={username} style={{ width: '100%' }} onChange={handleUsername} />
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor='mailInput'>Email</label>
                                <input type="email" className="from-control" id="mailInput" placeholder="" value={email} style={{ width: '100%' }} onChange={handleEmail} />
                            </div>
                            <br />
                            <div className="form-gropup">
                                <label htmlFor='imgInput'>User Profile Image</label>
                                <input type="file" className="from-control" accept="image/*" id="imgInput" style={{ width: '100%' }} onChange={handlePropic} />
                            </div>
                            <br />
                            <div className="form-gropup">
                                <label htmlFor='bannerInput'>Banner Image</label>
                                <input type="file" className="from-control" accept="image/*" id="bannerInput" style={{ width: '100%' }} onChange={handleBanner} />
                            </div>
                        </h5>

                    </form>
                </div>

            </div>
            <div className='row'>
                <div className='col center'>
                    <button className='btn btn-primary rounded-pill'onClick={sendRequest} style={{ margin: '5px' }}>save</button>
                    <button className='btn btn-danger rounded-pill' onClick={props.closeModal} style={{ margin: '5px' }}>cancle</button>
                </div>
            </div>
        </div>
    )
}

export default UserUpdate