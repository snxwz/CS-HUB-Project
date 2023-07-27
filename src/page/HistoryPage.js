import { useEffect, useState } from "react"
import Sidebar from "../components/sidebar"
import { getToken, getUser } from "../components/session"
import ReactModal from "react-modal";


const HistoryPage = () => {
    const [ histories, setHistories ] = useState(null);
    const [ isOpen, setIsOpen ] = useState(false);
    
    const u = getUser();
    const api = 'http://localhost:8900/get/histories?u=' + u;

    const clearApi = 'http://localhost:8900/delete/histories';
    document.title = "History";

    useEffect(() => {
        fetch(api)
        .then(response => response.json())
        .then(data => {
            setHistories(data);
            console.log(data);
        })
        .catch(() => {});
    }, [api])

    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    const handleClear = () => {
        const token = getToken();
        const user = getUser();
        const tmp = {
            'user': user
        }

        fetch(clearApi, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(tmp)
        }).then(response => {
            if(response.ok) {
                window.location.reload();
            }
        }).catch(() => {});
    }

    const modalStyle = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          width: 'max-content',
          height: 'max-content',
          backgroundColor: 'rgb(44, 48, 56)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      };

    if(histories !== null ) {
        return (
            <Sidebar>
                <div className="container-fluid">
                    
                    <div className="row">
                        <div className="col" style={{margin: '15px', borderRadius: '25px', backgroundColor: 'black'}}>
                            <div className="row">
                                <div className="col right">
                                    <button className="btn btn-danger rounded-pill" onClick={openModal} style={{margin: '10px'}}>Clear History</button>
                                </div>

                                <ReactModal isOpen={isOpen} onRequestClose={closeModal} style={modalStyle}>
                                    <div>
                                        <div className="row">
                                            <div className="col center">
                                                <div style={{color: 'white'}}>
                                                    <h4>⚠ Clear All histories ⚠</h4>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="row">
                                            <div className="col center">
                                                <button className="btn btn-primary rounded-pill" onClick={handleClear} style={{margin: '10px'}}>Confirm</button>
                                                <button className="btn btn-danger rounded-pill" onClick={closeModal} style={{margin: '10px'}}>Cancle</button>
                                            </div>
                                        </div>
                                    </div>
                                </ReactModal>

                            </div>
                            <div>
                                <table className="table table-striped table-dark" style={{borderRadius: '25px'}}>
                                <tbody >
                                    {histories.map(history => (
                                        <tr key={history.H_ID}>
                                            <th className="">
                                            <a className="href-noline-in" href={'/watch?u='+ history.U_folder + '&v=' + history.V_encode}>
                                                <div className="row">
                                                    <div className="col-2">
                                                        <img className="card-img-top " src={'data:image/jpeg;base64,' + history.V_pic} style={{marginBottom: '5px', borderRadius: '20px'}} alt={history.V_title+' thumbnail'} />

                                                    </div>
                                                    <div className="col">
                                                        <div><h3>{history.V_title}</h3>  </div>  
                                                        <div><h3>{history.H_watchDate}</h3>  </div>  
                                                    </div>                                                   
                                                </div>
                                            </a>
                                            </th>
                                        </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </Sidebar>
        )
    }else {
        return (
            <Sidebar>
                <div className="center">
                 <div className="loading" />
                </div>
            </Sidebar>
        )
    }

    
}

export default HistoryPage