import React, { useEffect, useState } from 'react';

import Sidebar from '../components/sidebar';
import { getAPI } from '../components/callAPI';
import NameTable from '../components/nameTable';

import './../css/utilities.css';
import ServerMonitor from '../components/serverMonitor';
import UploadLog from '../components/uploadLog';
import TagList from '../components/tagList';

const Home = () => {
  const [users, setUsers] = useState(null);
  let [currentComp, setCurrentComp] = useState(null)
  document.title = "Administration";
  
  useEffect(() => {
    getAPI('users')
      .then(response => {
        setUsers(response);
      });

  }, [])

  useEffect(() => {
    if (users !== null) {
      setCurrentComp(<NameTable users={users} />);
    }
  }, [users]);




  const buttonHandler = (btnId) => {
    let tmp = null;
    if (btnId === 1) {
      tmp = <UploadLog />
    } else 
    if (btnId === 2) {
      tmp = <NameTable users={users} />
    } else if (btnId === 3) {
      tmp = <ServerMonitor />
    } else if (btnId === 4) {
      tmp = <TagList />
    }

    setCurrentComp(tmp)
  };

  if (users === null) {

    return (
      <Sidebar>
        <div className="center">
          <div className="loading" style={{marginTop: '25%'}}></div>
        </div>
      </Sidebar>
    )
  }

  return (

    <div>
      <Sidebar>

        <div style={{}}>
          <div className='card card-margin'>
            <div className='card-header'>
              <div className='btn-margin'>
                {/* <button className='btn btn-secondary' onClick={() => buttonHandler(1)} >clickk me</button> */}
                <button className='btn btn-secondary' onClick={() => buttonHandler(2)} >User List</button>
                <button className='btn btn-secondary' onClick={() => buttonHandler(1)} >Video Upload Log</button>
                <button className='btn btn-secondary' onClick={() => buttonHandler(3)} >Server Monitor</button>
                <button className='btn btn-secondary' onClick={() => buttonHandler(4)} >Tag Management</button>
              </div>
            </div>
            <div>
              {/* card content */}
              {currentComp}
            </div>
          </div>
        </div>

      </Sidebar>
    </div>

  );
};

export default Home;