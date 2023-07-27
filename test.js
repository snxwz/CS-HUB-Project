import React, { useEffect, useState } from 'react';
import { getlocalData, removelocalData, isSessionSet } from './session';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './../css/utilities.css';
import './../css/sidebar.css';

const Sidebar = ({ children }) => {
  const [search, setSearch] = useState('');

  const logoutHandler = (e) => {
    localStorage.clear()
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  }

  const goSearch = (e) => {
    e.preventDefault();
    window.location.href = '/search?search=' + search;
  }

  if (isSessionSet('session') && isSessionSet('isLoggedIn')) {
    const expDate = getlocalData('expDate');
    if (Date.now() >= expDate) {
      logoutHandler();
      window.location.href = '/token-expired';
    } else {
      var session = getlocalData('session');
      var isLoggedIn = getlocalData('isLoggedIn');
    }
  }

  return (
    <div className='container-fluid'>
      <div className='row'>
        {isLoggedIn ? (
          <>
            <div className='bg-dark col-2 col-md-2 min-vh-100 d-flex justify-content-betweet flex-column'>
              <div>
                <a className='text-decoration-none text-white d-none d-sm-inline d-flex align-itemcenter ms-3 mt-2' href='/'>
                  <span className='ml-1 fs-4 d-none d-sm-inline'>CS HUB</span>
                </a>
                <hr className='text-secondary d-none d-sm-block' />

                <ul className='nav nav-pills flex-column'>
                  <li className='nav-item text-white fs-4 my-1 py-2 py-sm-0'>
                    <a href='/' className='nav-link text-white fs-5' aria-current="page">
                      <i className="bi bi-house"></i>
                      <span className='ms-3 d-none d-sm-inline'>Home</span>
                    </a>
                  </li>

                  <li className='nav-item text-white fs-4 my-1 py-2 py-sm-0'>
                    <a href={`/profile?profile=${session.U_id}`} className='nav-link text-white fs-5' aria-current="page">
                      <i class="bi bi-person"></i>
                      <span className='ms-3 d-none d-sm-inline'>Profile</span>
                    </a>
                  </li>

                  <li className='nav-item text-white fs-4 my-1 py-2 py-sm-0'>
                    <a href='/history' className='nav-link text-white fs-5' aria-current="page">
                      <i class="bi bi-clock-history"></i>
                      <span className='ms-3 d-none d-sm-inline'>History</span>
                    </a>
                  </li>

                  {session.U_permit === 1 && (
                    <li className='nav-item text-white fs-4 my-1 py-2 py-sm-0'>
                      <a href='/upload' className='nav-link text-white fs-5' aria-current="page">
                        <i class="bi bi-upload"></i>
                        <span className='ms-3 d-none d-sm-inline'>Upload Video</span>
                      </a>
                    </li>
                  )}

                  {session.U_type === 'admin' && (
                    <li className='nav-item text-white fs-4 my-1 py-2 py-sm-0'>
                      <a href='/admin' className='nav-link text-white fs-5' aria-current="page">
                        <i class="bi bi-gear"></i>
                        <span className='ms-3 d-none d-sm-inline'>Administration</span>
                      </a>
                    </li>
                  )}

                  <li className='nav-item text-white fs-4 my-1 py-2 py-sm-0'>
                    <a href='/login' className='nav-link text-white fs-5' aria-current="page" onClick={logoutHandler}>
                      <i class="bi bi-box-arrow-right"></i>
                      <span className='ms-3 d-none d-sm-inline'>Logout</span>
                    </a>
                  </li>

                </ul>
              </div>

              <div class="dropdown open">
                <a class="text-decoration-none text-white dropdown-toggle p-3" type="button" id="triggerId" data-bs-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false">
                  <i class="bi bi-person-circle"></i><span className='ms-2 d-none d-sm-inline'>CS ADMIN</span>
                </a>
                <div class="dropdown-menu" aria-labelledby="triggerId">
                  <a href={`/profile?profile=${session.U_id}`} className='dropdown-item'>View Profile</a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='bg-dark col-2 col-md-2 min-vh-100 d-flex justify-content-betweet flex-column'>
            <div>
              <a className='text-decoration-none text-white d-none d-sm-inline d-flex align-itemcenter ms-3 mt-2' href='/'>
                <span className='ml-1 fs-4 d-none d-sm-inline'>CS HUB</span>
              </a>
              <hr className='text-secondary d-none d-sm-block' />
              <ul className='nav nav-pills flex-column'>
                <li className='nav-item text-white fs-4 my-1 py-2 py-sm-0'>
                  <a href='/' className='nav-link text-white fs-5' aria-current="page">
                    <i className="bi bi-house"></i>
                    <span className='ms-3 d-none d-sm-inline'>Home</span>
                  </a>
                </li>

                <li className='nav-item text-white fs-4 my-1 py-2 py-sm-0'>
                  <a href='/login' className='nav-link text-white fs-5' aria-current="page" >
                    <i class="bi bi-box-arrow-in-right"></i>
                    <span className='ms-3 d-none d-sm-inline'>Login</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className='bg-dark col-10 col-md-10 min-vh-100 d-flex justify-content-betweet flex-column'>
          <div className='sidebar-vertical-line d-md-none'></div>
          <div className="row" >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
