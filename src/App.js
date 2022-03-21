import React, { useEffect, useRef, useState } from 'react';
import * as SockJS from 'sockjs-client';
import * as StompJs from '@stomp/stompjs';


function App() {

  const client = useRef({});
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    connect();
    return () => disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.current]);

  const connect = () => {
    client.current = new StompJs.Client({
      webSocketFactory: () => new SockJS("http://52.79.250.142/our-websocket"),
      // connectHeaders: {},
      debug: function (str) {
        console.log(str);
      },
      onConnect: (frame) => {
        subscribe();
        console.log(frame)
      },
      onStompError: (frame) => {
        console.error(frame);
      },
    });
    client.current.activate()
  };
  
  const disconnect = () => {
    client.current.deactivate();
  };

  const subscribe = () => {
    client.current.subscribe('/topic/message', (res) => {
      res = JSON.parse(res.body);
      console.log(res);
      setResult(res.content);
    });
  };

  const publish = (message) => {
    if (!client.current.connected) {
      return;
    };
    let content = {
      content: message,
    };
    client.current.publish({
      destination: "/ws/message",
      body: JSON.stringify(content)
    });
    setMessage("")
  };


  const handleChange = (e) => {
      setMessage(e.target.value)
      // publish(message);
  }

  const onKeyUp = (e) => {
    if( e.key === 'Enter'){
      publish(message);
    }
  }



  return (
    <div>
      <input type="text" onChange={handleChange} onKeyPress={onKeyUp} value={message}/>
      <button onClick={() => publish(message)}>클릭</button>
      <h1>{result}</h1>
    </div>
  );
}

export default App;
