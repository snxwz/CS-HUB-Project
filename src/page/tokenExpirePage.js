
const TokenExpirePage = () => {

    const btnHandle = () => {
        window.location.href = '/login';
    }

    return (
        <div className="bgImg">

        <div className="center" style={{color: 'white', backgroundColor: 'rgba(38, 38, 38, 0.85)', height: '100vh'}}>
            <div style={{textAlign: 'center', backgroundColor: 'rgb(55, 55, 55)', borderRadius: '25px', width: '30%'}}>
            <div style={{margin: '25px'}}>
            <h1>Your Token has Expired</h1> 
            <h3>Please Login Again</h3> 
            <button className="btn btn-primary" onClick={btnHandle}>Login</button>
            </div>
            </div>
        </div>
        </div>
    )
}

export default TokenExpirePage;