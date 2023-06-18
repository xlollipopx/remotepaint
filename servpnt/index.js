const express = require('express')
const app = express()
const WSServer = require('express-ws')(app)
const aWss = WSServer.getWss()
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const UserService = require('./service/UserService')

const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


app.ws('/wsc', (ws, req) => {
    console.log('Connected.')
    ws.on('message', msg => {
        msg = JSON.parse(msg);
        switch (msg.method) {
            case 'connection':
                connectionHandler(ws, msg)
                break;
            case 'draw':
                broadcastConnection(ws, msg)
                break;
        }
    })

    ws.on('close', () => {
        const id = UserService.deleteUserFromSession(ws);
        console.log('disconected');
        broadcastConnection(ws, { id: id, method: 'users' })
    });
})

app.post('/api/image', (req, res) => {
    try {
        const data = req.body.img.replace(`data:image/png;base64,`, '')
        fs.writeFileSync(path.resolve(__dirname, 'data', `${req.query.id}.jpg`), data, 'base64')
        return res.status(200).json('')
    } catch (e) {
        console.log(e)
        return res.status(500).json('Error')
    }

})

app.get('/api/image', (req, res) => {
    try {
        const image = fs.readFileSync(path.resolve(__dirname, 'data', `${req.query.id}.jpg`))
        const data = `data:image/png;base64,` + image.toString('base64')
        res.json(data)
    } catch (e) {
        console.log(e)
        return res.status(200).json({ data: '' })
    }
})

const connectionHandler = (ws, msg) => {
    UserService.addUserToSession(msg.id, msg.username, ws);
    ws.id = msg.id;
    broadcastConnection(ws, msg);
}

const broadcastConnection = (ws, msg) => {
    aWss.clients.forEach(client => {
        if (client.id === msg.id) {
            if (msg.method === 'connection' || msg.method === 'users') {
                msg.users = UserService.getUsersForSession(msg.id);
            }
            client.send(JSON.stringify(msg));
        }
    })
}

app.listen(PORT, () => console.log(`server started on port ${PORT}`))