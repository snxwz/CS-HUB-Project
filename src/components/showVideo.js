import '../css/video.css'


function ShowVideos(props) {

    try {
        return (
            <div className="container-fluid" style={{ flexWrap: 'wrap' }}>
                <div className="row">
                    {props.videos.map((video) => ( 
                        <div className="video-card " style={{ width: '300px'}} key={video.V_ID}>
                            <a href={'/watch?u=' + video.U_folder + '&v=' + video.V_encode} style={{textDecoration: 'none', color: 'white'}}>
                                <img className="card-img-top " src={'data:image/jpeg;base64,' + video.V_pic} style={{marginBottom: '10px', borderRadius: '20px', aspectRatio: '16/9'}} alt={video.V_title+' thumbnail'} />
                                <div style={{marginLeft: '8px', marginRight: '8px'}}>
                                    <div>
                                    <div className='row'>
                                        <div className='col-9'>
                                            <h5>{video.V_title}</h5>
                                        </div>
                                        <div className='col-3' style={{textAlign: 'right'}}>
                                            <h6>{Math.floor(video.V_length/60)}:{Math.floor(video.V_length%60)}</h6>
                                        </div>
                                    </div>
                                    <div className='row' style={{opacity: '60%'}}>
                                        <div className='col-6'>
                                            {/* ❌ this cause an warning but not effect to app */}
                                            <a href={'/profile?profile='+ video.U_ID} className='href-noline-w' >
                                                <h6>{video.U_name}</h6>
                                            </a>
                                        </div>
                                        <div className='col-6' style={{textAlign: 'right'}}>
                                            <h6>view: {video.V_view}</h6>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </a>
                        </div>
    
                    ))}
                </div>
            </div>
        )
    } catch (error) {
        return (
            <div className='center'>
                <div className='loading'/>
            </div>
        )
    }
    
    

    
}

export default ShowVideos;