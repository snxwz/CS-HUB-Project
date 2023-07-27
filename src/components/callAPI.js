
// get API
const getUserAPI = 'http://localhost:8900/getUsers';
const getServerAPI = 'http://localhost:8900/server_resource';
const getVideosPublic = 'http://localhost:8900/getVideos/public';
const getUploadLog = 'http://localhost:8900/get/uploadLog';
const getTag = 'http://localhost:8900/get/tags';

// post API


export const getAPI = async (call_api) => {
  let api = '';
  if (call_api === 'users') {
    api = getUserAPI;
  }else if (call_api === 'serverRes') {
    api = getServerAPI
  }else if (call_api === 'videosPublic') {
    api = getVideosPublic
  }else if (call_api === 'uploadLog') {
    api = getUploadLog
  }else if (call_api === 'tags') {
    api = getTag
  }

  try {
    const response = await fetch(api);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

