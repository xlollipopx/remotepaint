import React, { useState } from "react";
import '../styles/canvas.scss'
import { observer } from 'mobx-react-lite'
import { useRef } from "react";
import { useEffect } from "react";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useParams } from "react-router-dom";
import Rect from "../tools/Rect";
import axios from 'axios'
import Eraser from "../tools/Eraser";

const Canvas = observer(() => {

    const canvasRef = useRef();
    const usernameRef = useRef();
    const [modal, setModal] = useState(true)
    const params = useParams()
    const [users, setUsers] = useState([])


    useEffect(() => {
        canvasState.setCanvas(canvasRef.current)
        let ctx = canvasRef.current.getContext('2d')
        axios.get(`http://${process.env.REACT_APP_SERV_URL}/api/image?id=${params.id}`)
            .then(res => {
                if (res.data) {
                    const img = new Image();
                    img.src = res.data;
                    img.onload = () => {
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                }
            })
    }, [])

    useEffect(() => {
        if (canvasState.username) {
            const socket = new WebSocket(`ws://${process.env.REACT_APP_SERV_URL}/wsc`)
            canvasState.setSocket(socket)
            canvasState.setSessionId(params.id)
            toolState.setTool(new Brush(canvasRef.current, socket, params.id))
            socket.onopen = () => {
                socket.send(JSON.stringify({
                    id: params.id,
                    username: canvasState.username,
                    method: 'connection'
                }))
            }
            socket.onmessage = (event) => {
                console.log(event.data)
                let msg = JSON.parse(event.data)

                switch (msg.method) {
                    case "connection":
                        console.log(`User ${msg.username} connected!`)
                        setUsers(msg.users)
                        break;
                    case "draw":
                        drawHandler(msg);
                        break;
                    case "users":
                        setUsers(msg.users)
                        break;

                }
            }
        }
    }, [canvasState.username])

    const drawHandler = (msg) => {
        const figure = msg.figure
        const ctx = canvasRef.current.getContext('2d')
        switch (figure.type) {
            case 'brush':
                Brush.draw(ctx, figure.x, figure.y)
                break;
            case 'rect':
                Rect.drawStatic(ctx, figure.x, figure.y, figure.width, figure.height, figure.color)
                ctx.beginPath();
                break;
            case 'eraser':
                Eraser.draw(ctx, figure.x, figure.y)
                ctx.strokeStyle = 'white'
                ctx.lineWidth = 20;
                break;
            case 'stop':
                ctx.beginPath();
                toolState.setLineWidth(1)
                toolState.setStrokeColor('black')
                break;
        }

    }

    const mouseDownHandler = () => {
        canvasState.pushToUndo(canvasRef.current.toDataURL())
    }

    const mouseUpHandler = () => {
        axios.post(`http://${process.env.REACT_APP_SERV_URL}/api/image?id=${params.id}`, { img: canvasRef.current.toDataURL() })
            .then(res => console.log(res.data))
    }

    const connectionHandler = () => {
        canvasState.setUsername(usernameRef.current.value)
        setModal(false)
    }

    const usersItem = users.map((d) => <li key={d}>{d}</li>);

    return (
        <div className="canvas">
            <Modal show={modal} onHide={() => { }}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter your username</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="text" ref={usernameRef}></input>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => connectionHandler()}>
                        Log in
                    </Button>
                </Modal.Footer>
            </Modal>

            <canvas onMouseDown={() => { mouseDownHandler() }} onMouseUp={() => { mouseUpHandler() }} ref={canvasRef} width={1200} height={800} />
            <div className="users"> Connected users: <br /> {usersItem} </div>
        </div>
    );
});

export default Canvas;