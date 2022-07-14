# react-native-chat-socket-component
This is a sample project developed using a chat component implemented using Socket.io
You can find the chat component in this link of the same repo
[a link](https://github.com/Mayuri-Markandu/react-native-chat-socket-component/blob/main/src/Components/ChatSocket)

## Dependencies for socket component alone
1. @react-native-community/netinfo 
2. socket.io-client 
3. realm 

###### Functionalities covered:
The sample project and the component is done in React Native Javascript.
Console is added for debugging purpose and feel free to eliminate those.
Socket keywords may be subject to change according to the organization or the projects requirement.

1. **connectToSocket** - Connects to socket.
2. **checkConnectedStatus** - Check the connection status of the socket.
3. **checkDisConnectedStatus** - Check the disconnected status of the socket.
4. **disconnectOnTermination** - Disconnects the socket on termination of the app.
5. **connectOnForeground** - Connects the socket when the app is in foreground.
6. **highlightRoom** - HighlightRoom is called when the socket emits or user receives the message in their socket.
7. **listenUserJoined** - Triggers when the user joins the chat.
8. **newUserChat(param,callback)** - Used when the new user joins the 1 on 1 chat in the chatroom. It accepts the userId which is got while login. 
9. **joinUserChat(param,callback)** - Used when the sender and receiver needs to join the user chatroom. Params are senderid and receiverid. It depends on the server params used.
10. **highlightRoom** -
11. **highlightRoom** -
12. **highlightRoom** -
13. **highlightRoom** -
14. **highlightRoom** -

