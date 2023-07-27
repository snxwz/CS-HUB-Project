import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { isSessionSet, getlocalData } from '../components/session';

import Sidebar from '../components/sidebar';

import './../css/profile.css';
import GetVideo from '../components/getVideo';
import UserUpdate from '../components/userUpdateModal';


const ProfilePage = () => {
  const param = new URLSearchParams(window.location.search);
  const U_id = param.get('profile');
  const getAPI = 'http://localhost:8900/getUser/id?u=' + U_id;

  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  ReactModal.setAppElement('#root');

  let [currentComp, setCurrentComp] = useState('public');
  var session

  if (isSessionSet('token')) {
    session = getlocalData('session');
  } else {
    session = {
      'U_id': null
    }
  }

  useEffect(() => {
    fetch(getAPI)
      .then(response => response.json())
      .then(data => {
        setUser(data)
      })
      .catch(e => {
        console.error('Error:', e);
      })
  }, [getAPI])

  useEffect(() => {
    if (user){
        document.title = user.U_name+' | Profile';
    }
  }, [user]);

  if (user) {

    const bgStyle = {
      backgroundImage: `url('data:image/jpeg;base64, ${user.U_banner}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '300px',
      position: 'relative'
    };

    const openModal = () => {
      setIsOpen(true);
    }

    const buttonHandler = (btnId) => {
      setCurrentComp(btnId)
    };

    const closeModal = () => {
      setIsOpen(!isOpen);
    }

    const update = () => {
      window.location.reload();
    }


    const modalStyle = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        height: 'max-content',
        backgroundColor: 'rgb(44, 48, 56)',
      },
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
    };


    return (

      <div>
        <Sidebar>
          <div className='container'>
            <div className='row' style={bgStyle}>
              <div className='col-11' style={{ position: 'absolute', left: '0', bottom: '0', marginBottom: '10px' }}>
                <div className='row'>
                  <div className='col-1 info-bg-profile' style={{ width: 'fit-content' }}>
                    <img src={'data:image/jpeg;base64, ' + user.U_pro_pic} style={{ width: '110px', borderRadius: '50%', border: '5px solid white' }} alt='user banner' />
                  </div>
                  <div className='col-5 info-bg-name ' style={{ width: 'fit-content', color: 'white' }}>
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '20px' }}>
                      <div>
                        <h3>{user.U_name}</h3>
                        <h5>{user.U_mail}</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-1 '>
                {session.U_id === user.U_ID &&
                  <button id='settingBtn' onClick={openModal} className='btn btn-secondary' style={{ position: 'absolute', right: '0', margin: '20px', borderRadius: '40%', opacity: '0.8' }}>
                    <h5>. . .</h5>
                  </button>
                }

                <ReactModal isOpen={isOpen} onRequestClose={closeModal} style={modalStyle}>

                  <UserUpdate data={user} closeModal={closeModal} update={update} />

                </ReactModal>

              </div>
            </div>
            {/* profile content */}
            <div className='row' style={{ marginTop: '20px' }}>
              <div className='col'>
                <div className='card' style={{ backgroundColor: 'rgb(44,48,52)' }}>

                  <div className='card-header'>
                    <div className='btn-margin'>

                      {session.U_id === user.U_ID ?
                        <div>
                          <button className='btn btn-secondary' onClick={() => buttonHandler('public')} >Public Video</button>
                          <button className='btn btn-secondary' onClick={() => buttonHandler('private')} >Private Video</button>
                          <button className='btn btn-secondary' onClick={() => buttonHandler('unlisted')} >Unlisted Video</button>
                          <button className='btn btn-secondary' onClick={() => buttonHandler('management')} >Management</button>
                        </div>
                        :
                        <div>
                          <button className='btn btn-secondary' onClick={() => buttonHandler(1)} >public video</button>
                        </div>
                      }
                    </div>
                  </div>
                  <div className='card-body'>
                    {/* card content */}
                    {currentComp === 'management' ?
                      <div style={{ color: 'white' }}>
                        <div>
                          <h5>User Storage Usege: {user.U_storage + ' MB'}</h5>
                          <br />
                          <h5>Development Token: </h5>
                        </div>
                      </div>
                      :
                      <div>
                        <GetVideo permit={currentComp} user={user.U_ID} />
                      </div>}
                  </div>

                </div>
              </div>
            </div>
          </div>

        </Sidebar>
      </div>

    );
  } else {
    <div>
      <Sidebar>
        <div className='loading center'></div>
      </Sidebar>
    </div>
  }

};

export default ProfilePage;