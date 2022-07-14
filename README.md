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
10. **joinUser1On1Chat(param,callback)** - Used when the user wants to join the room with the known roomID. Params include roomId and userId
11. **getRoomId(callback)** - Used to get the roomID of the chat room
12. **sendMessage(param,callback)** - used to send the messages and the param description is given below
13. **sendMessageToUsers(param,callback)** - used to send the messages to various users like Forward feature. Follows the same param as above.
14. **newMessage** - Triggers when the user receives the message
15. **userOnlineStatus** - Sends the user's online status to the socket.
16. **getOnlineStatus(param,callback)** - Get the online status of the particular user. The param includes userID
17. **updateUserStatus(param,callback)** - Used to update the user status and the param includes are roomid, userid, active status
18. **userTyping(param,callback)** - called when the user is typing and the params are userid,roomid,userName,roomName
19. **userStopTyping(param,callback)** - Called when the user stopped typing adn the params are same as userTyping
20. **userTypingResponse** - gets the typing response of the user.
21. **deleteMessage(param,callback)** - called when user wants to delete the message and the params are messageid, userid, roomid, roomname, isType, deleteforeveryone (boolean flag)

sendMessages_param = {
- **roomname** "",
- **username**: "",
- **msg**: "message text",
- **hasMsg**: Boolean param to denote its a text message,
- **hasFile**: Boolean param to denote the media file,
- **isReply**: Boolean param to denote its an reply to the particular message,
- **reply_file_type**: 'file type fo the reply message eg: text or media',
- **replayMsgId**: Id of the particular message for which the reply is sent,
- **messageContant**: "message content of the reply message",
- **msgTime**: time of the message - format "YYYY-MM-DDTHH:mm:ss.SSS"  depends on the socket server,
- **istype**: 'type of the main message eg: text or media',
- **isGroup**: boolean param to inform its a group message,
- **userId**: Login user id,
- **chatRoomId**: chat room id         
}

Offline storage is handled in the link [a link](https://github.com/Mayuri-Markandu/react-native-chat-socket-component/tree/main/src/DBInterface).
Basic offline storage functionalities handled are insert logs, insert messages, update logs, delete single chat, delete logs, get chat msgs and logs are covered.
