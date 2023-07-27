import { useEffect, useState } from "react"
import Sidebar from "../components/sidebar"
import ShowVideos from "../components/showVideo";
import { getAPI } from "../components/callAPI";


const TagPage = () => {
    const param = new URLSearchParams(window.location.search); 
    
    const tag = param.get('tag');

    const [ videos, setVideos ] = useState(null);
    const [ tags, setTags ] = useState(null)

    const api = 'http://localhost:8900/get/videos/tag?tag=' + tag;

    const changeTag = (tag) => {
        if(tag === 'all') {
            window.location.href = '/'
        }else {
            window.location.href = '/tag?tag='+tag
        }
      }

    useEffect(() => {
        fetch(api)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setVideos(data)
        })
        getAPI('tags')
        .then(response => {
        setTags(response);
        })
    }, [api])

    if(videos) {
        return (
            <div>
                <Sidebar>
                    <div style={{ marginTop: '15px' }}> 
                        <div className="row">
                            <div className='col-auto'>
                                <button className='btn rounded-pill' style={{ backgroundColor: 'white' }} onClick={() => changeTag('all')}>
                                   All
                                </button>
                            </div>
                            {tags && tags.slice(0, 5).map((tag, index) => (
                                <div className='col-auto' key={index} style={{marginTop: '5px'}}>
                                    <button className='btn rounded-pill' style={{ backgroundColor: 'white' }} onClick={() => changeTag(tag.T_name)}>
                                        {tag.T_name} : {tag.count}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="row">
                            <div style={{color: 'white', marginTop: '15px'}}><h2>Tag: {tag}</h2></div>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <ShowVideos videos={videos} />
                        </div>
                    </div>
                </Sidebar>
            </div>
        )
    }else {
        return (
            <div className="loading center" />
        )
    }
}

export default TagPage