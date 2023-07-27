import { isSessionSet } from "./session"

export const insertHistories = async (data) => {
    // const f = isSessionSet('session')
    // await fetch('http://localhost:8900/test/json/get?t='+time, {}).catch(() => {})
    // data.preventDefault();
    // for(let i=0;i<2;i++) {
        await fetch('http://localhost:8900/update/history/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
        }).then(response => { }).catch((error) => { })
    // }
    
}

export const createHistory = (data) => {
    fetch('http://localhost:8900/insert/history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).catch(() => { })
}