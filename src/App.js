import './css/App.css';
import 'video.js/dist/video-js.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'react-bootstrap'


import Home from "./page/Home"
import Contact from "./page/Contact"
import LoginPage from "./page/LoginPage"
import RegisterPage from "./page/RegisterPage" 
import ProfilePage from './page/profilePage';
import AdminPage from './page/AdminPage';
import UploadPage from './page/uploadPage';
import NotFoundPage from './page/notfoundPage';
import WatchPage from './page/WatchPage';
import TokenExpirePage from './page/tokenExpirePage';
import HistoryPage from './page/HistoryPage';
import TagPage from './page/tagPage';
import SearchPage from './page/searchPage';

import { getlocalData, isSessionSet, setlocalData } from './components/session';
import { useEffect, useRef } from 'react';

function App() {

	// useEffect(() => {
	// 	const handleUnload = () => {
	// 	  if(!getlocalData('check')) {
	// 		localStorage.clear();
	// 	  }
	// 	}
	
	// 	window.addEventListener('beforeunload', handleUnload)
	
	// 	return () => {
	// 	  window.removeEventListener('beforeunload', handleUnload)
	// 	}
	//   }, [])

	if(isSessionSet('session') && isSessionSet('isLoggedIn')) {
		
		return (
			<Router>
				<Routes>
					<Route path="/contact" element={<Contact />} />
					
					{/* login/register page */}
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />
	
					{/* main page */}
					<Route path="/" element={<Home />} />
					<Route path='/profile' element={<ProfilePage />} />
					<Route path='/upload' element={<UploadPage />} />
					<Route path='/admin' element={<AdminPage />} />
					<Route path='/watch' element={<WatchPage />} />
					<Route path='/token-expired' element={<TokenExpirePage />} />
					<Route path='/history' element={<HistoryPage />} />
					<Route path='/tag' element={<TagPage />} />
					<Route path='/search' element={<SearchPage />} />

					{/* not found page */}
					<Route path='*' element={<NotFoundPage />} />	
				</Routes>
			</Router>
		);
	} else {
		return(
			<Router>
				<Routes>
					{/* login/register page */}
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />
	
					{/* main page */}
					<Route path="/" element={<Home />} />
					<Route path='/profile' element={<ProfilePage />} />
					<Route path='/watch' element={<WatchPage />} />
					<Route path='/token-expired' element={<TokenExpirePage />} />
					<Route path='/tag' element={<TagPage />} />
					<Route path='/search' element={<SearchPage />} />
				
					{/* not found page */}
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</Router>
		)
	}

	
}

export default App;
