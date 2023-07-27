import React, { useState } from 'react';
import './../css/login.css';

// const conn = require('../conn');

const RegisterPage = () => {
  const api = 'http://localhost:8900/register' 

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    con_password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const jsonData = JSON.stringify(formData);
    // console.log(jsonData);
    //sending request to register API
    if (formData.password === formData.con_password) {

      // conn.query('INSERT INTO userdb SET (U_name, U_mail, U_pass) VALUES (?, ?, ?)',[formData.username, formData.email, formData.password], (err, results) => {
      //   if (err) {
      //     console.error('Error inserting data: ', err);
      //     return;
      //   }
      //   console.log('Data inserted successfully');
        
      //   // Close the connection
      //   conn.end();
      // });

      fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
      })
        .then((response) => {
          if (response.ok) {
            // success
            // console.log('Registration successful');
            return response.json()
          } else {
            // failed
            // console.log('Registration failed');
          }
        })
        .then((data) => {
          if(data.status === 'success') {
            alert('Registration successful')
            window.location.href = '/login'
          }else {
            alert('Registration failed')
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }else if(formData.username === '' || formData.email === '' || formData.password === ''){
      alert('Please fill in all the fields')
    }else {
      alert('Password do not match!!!')
    };
  };

  return (
    <div className='bgImg'>
      <div style={{ backgroundColor: 'rgba(38, 38, 38, 0.85)', backgroundSize: 'cover', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="container">
          <div className="row vh-100">
            <div className="col-12">
              <div className="card mx-auto rounded" style={{ width: '300px', backgroundColor: 'rgb(55, 55, 55)' }}>
                <div className="card-body">
                  <h2 style={{ color: 'white', textAlign: 'center' }}>CS Streaming 888</h2>
                  <h4 style={{ color: 'white', textAlign: 'center' }}>Registration</h4>
                  <br />
                  <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginTop: '10px', marginBottom: '20px' }}>
                      <input type="text" className="form-control rounded-pill" name="username" id="username" placeholder="User name" onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginTop: '10px', marginBottom: '20px' }}>
                      <input type="email" className="form-control rounded-pill" name="email" id="email" placeholder="Email" onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginTop: '20px', marginBottom: '10px' }}>
                      <input type="password" className="form-control rounded-pill" name="password" id="password" placeholder="Password" onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginTop: '20px', marginBottom: '10px' }}>
                      <input type="password" className="form-control rounded-pill" name="con_password" id="con_password" placeholder="Confirm Password" onChange={handleChange} />
                    </div>
                    <br /><br />
                    <div className="div-center">
                      <button type="submit" className="btn btn-primary rounded-pill" style={{ width: '150px' }}>Register</button>
                    </div>
                  </form>
                  <div className="div-center">
                    <a href="/login">
                      <button className="btn btn-danger rounded-pill" style={{ marginTop: '10px', width: '100px' }}>Cancel</button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
