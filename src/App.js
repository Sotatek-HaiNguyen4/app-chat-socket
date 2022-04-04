import logo from './logo.svg';
import './App.css';
import socketIOClient from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

const host = "http://localhost:3000"

function App() {
  const [mess, setMess] = useState([]);
  const [message, setMessage] = useState('');
  const [id, setId] = useState();
  const [listImg, setListImg] = useState();

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = socketIOClient.connect(host);
    console.log(socketRef.current);

    socketRef.current.emit('setRole', 'sender');

    document.getElementById('fileSelector').addEventListener('change', function () {
      submitImg();
    })

    socketRef.current.on('receivePhoto', function (data) {
      console.log(data);
      // document.getElementById('showPhoto').src = `http://localhost:3000/${data.path}`;
      setListImg(data.data.content)

    })

    socketRef.current.on('getId', data => {
      setId(data);
    })

    socketRef.current.on('sendDataServer', dataGot => {
      console.log(dataGot);
      setMess(oldMsgs => [...oldMsgs, dataGot.data])
    })

    return () => {
      socketRef.current.disconnect();
    }

  }, []);

  function submitImg() {
    var selector = document.getElementById('fileSelector');
    var reader = new FileReader();
    reader.onload = function (e) {
      const msg = {
        content: { base64: e.target.result },
        id: id
      }
      console.log(msg);
      // socketRef.current.emit('sendImage', { base64: e.target.result })
      socketRef.current.emit('sendImage', msg)
    }
    reader.readAsDataURL(selector.files[0])
  }

  const sendMessage = () => {
    if (message != null) {
      const msg = {
        content: message,
        id: id
      }
      socketRef.current.emit('sendDataClient', msg)

      setMessage('')
    }
  }

  const renderMess = mess.map((m, index) =>
    <div key={index} className={`${m.id === id ? 'your-message' : 'other-people'} chat-item`}>
      {m.content}
    </div>
  )


  return (
    <div className='app-chat'>
      <div className='div-left'></div>
      <div className='div-center'>
        <div className='box-chat'>
          {renderMess}
          {/* <img src="" id='showPhoto' width={50} height={50} /> */}
          <img src={listImg ? listImg : ''} alt="" width={50} />
        </div>
        <div className='send-box'>
          <input type="file" id='fileSelector' />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Nhap tin nhan...'  ></textarea>
          <button onClick={sendMessage} >Send</button>
        </div>
      </div>
      <div className='div-right'></div>

    </div>
  );
}

export default App;
