import {Col, Row, Container} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import WaitingRoom from './components/waitingroom';
import { useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './components/chatroom';

function App() {

  const[connection, setConnection] = useState();
  const[messages, setMessages] = useState([]);

  const joinChatRoom = async (username, chatroom) => {
    try {
      const connection = new HubConnectionBuilder()
                          .withUrl("https://localhost:7081/Chat")
                          .configureLogging(LogLevel.Information)
                          .build();

      connection.on("JoinSpecificChatRoom", (username, msg) => {
        setMessages(messages => [...messages, {username, msg}]);
      });

      connection.on("ReceiveSpecificMessage", (username, msg) => {
        setMessages(messages => [...messages, {username, msg}]);
      });

      await connection.start();
      await connection.invoke("JoinSpecificChatRoom", {username, chatroom});
      
      setConnection(connection);
    } catch (error) {
        console.log(error);
    }
  }

  const sendMessage = async(message) => {
    try {
      await connection.invoke("SendMessage", message);
    } catch (error) {
        console.log(error);
    }
  }

  return (
    <div className="App">
      <main>
        <Container>
          <Row className="px-5 my-5">
            <Col sm='12'>
              <h1 className='font-weight-light'>Welcome to the Chat App</h1>
            </Col>
          </Row>
          {!connection 
           ? <WaitingRoom  joinChatRoom={joinChatRoom}/>
           : <ChatRoom messages={messages} sendMessage={sendMessage}/>
          }
        </Container>
      </main>
    </div>
  );
}

export default App;
