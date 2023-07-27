
import { useState, useEffect } from "react";
import ShowVideos from "./showVideo";

const GetVideo = (props) => {
    const [ videos, setVideos ] = useState(null);

    const api = 'http://localhost:8900/getVideos/profile?u='+ props.user +'&p='+props.permit

    useEffect(() => {
        fetch(api)
          .then(response => response.json())
          .then(data => {
            setVideos(data)
          })
          .catch(e => {
            console.error('Error:', e);
          })
      }, [api])

      if(videos !== null ) {
            return(
                <div>
                    <ShowVideos videos={videos} />
                </div>
            )
      } else {
        <div className="loading center"></div>
      }
    
}

export default GetVideo