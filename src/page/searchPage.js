import { useEffect, useState } from "react"
import Sidebar from "../components/sidebar"
import ShowVideos from "../components/showVideo";


const SearchPage = () => {
    const param = new URLSearchParams(window.location.search); 
    const search = param.get('search');

    const [ videos, setVideos ] = useState(null);

    const api = 'http://localhost:8900/get/videos/search?s=' + search;

    useEffect(() => {
        fetch(api)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setVideos(data)
        })
    }, [api])

    if(videos) {
        return (
            <div>
                <Sidebar>
                    <div> 
                        <div style={{ marginTop: '15px' }}>
                            <ShowVideos videos={videos} />
                        </div>
                    </div>
                </Sidebar>
            </div>
        )
    }else {
        return (
            <Sidebar>
                <div className="loading center" />
            </Sidebar>
        )
    }
}

export default SearchPage