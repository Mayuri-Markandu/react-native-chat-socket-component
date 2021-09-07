// import io from 'socket.io-client';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules, Button
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

let knew_userSocket = "new-user"
let ksend_message = "send-message"
let knew_messageSocket = "new-message"
let kjoin_user_chatSocket = "join-user-chat"
let kjoin_1on1_roomSocket = "join-1on1-room"
let KChatUpdateReadStatus = "update-message-status"
let kChatUpdateUserActiveStatus = ""
// var manager: SocketManager = SocketManager.init(socketURL: URL.init(string: Constant().kChatGlobalURL)!, config: [.log(false), .compress, .forcePolling(true), .forceNew(true), .reconnects(true), .reconnectAttempts(99)])
const io = require('socket.io-client');
   
var socket = null

export default class ChatSocket extends React.PureComponent {

    /** constructor */
    constructor(props) {  
        super(props);
        this.state = { 
          isConnected: false,
          isSocketConnected: "",
        }; 
        console.log(this.props.SERVER_URL)
        // let manager = new Manager(this.props.SERVER_URL,{
        //      forceNew:true, reconnection: true, reconnectionAttempts:99
        // })
        socket = io(this.props.SERVER_URL, {
            transports: ['websocket','polling'],
            reconnectionDelay: 1000,
            agent: false, 
            upgrade: false,
            rejectUnauthorized: false,
            forceNew:true, 
            reconnection: true, 
            reconnectionAttempts:99,
            jsonp: false,
            rejectUnauthorized: false
          });
      }

    /** component cycle */
    componentDidMount() {
        NetInfo.isConnected.addEventListener('change', this.handleConnectionChange);
        NetInfo.isConnected.fetch().done(
          (isConnected) => { this.setState({ isConnected: isConnected }); }
        );
    }

    UNSAFE_componentWillReceiveProps(nextprops) {
        // console.log("CHAT SOCKET RECEIVE PROPS CALLED")
        this.highlightRoom()
        this.newMessage()
        this.listenUserJoined()
        this.userOnlineStatus()
         this.userTypingResponse()
    }

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('change', this.handleConnectionChange);     
    }

    /** listener method */
    handleConnectivityChange = (isConnected) => {
        setState({ isConnected: isConnected });
    }

    //CHECK INTERNET CONNECTION
    isNetworkConnected = () => {
        return state.isConnected
    }

    //SOCKET CONNECT
    connectToSocket = () => {
        socket.connect(); 
        socket.on('connect', () => { 
          console.log('connected to socket server');
          console.log('SOCKET ID',socket.id); // 'G5p5...' 
          console.log("CONECTION STATUS", socket.connected)
        });
    }

    //CHECK CONNECT STATUS
    checkConnectedStatus = (callback) =>  {
        socket.on('connect', () => {
            callback(socket.connected)
         });
    }

    //CHECK DISCONNECT STATUS
    checkDisConnectedStatus = (callback) =>  {
        socket.on('connect', () => {
           console.log(socket.disconnected);
           callback(socket.disconnected) 
         });
   }

   //DISCONNECT MANUALLY ON APP TERMINATION
   disconnectOnTermination = (param) => { // param userId
   // socket.on('connect', () => {
        socket.emit('disconnect-mannual', param , (data) => {
            console.log("DISCONNECTED",data); // data will be 'woot'
          });
        socket.disconnect()
    //})
   }

   //CONNECT ON APP FOREGROUND
   connectOnForeground = () => {
        socket.disconnect()
        socket = io(this.props.SERVER_URL, {
            transports: ['websocket'],
            jsonp: false
          });
        socket.connect()
        console.log("SOCKET INFO",socket)
   }

   //HIGHLIGHT ROOM
   highlightRoom = () => {
        socket.on('highlight-room', (data) => {
            console.log("HIGHLIGHT ROOM",data);
            // // if (this.props.receivedMsg(data) != undefined) {
            //     this.props.receivedMsg(data)
            // // }
            // // if (this.props.receivedMsgFromLog(data) != undefined) {
            //     this.props.receivedMsgFromLog(data)
            // // }
           // return data
        });
   }

   //LISTEN USER JOINED THE ROOM
   listenUserJoined = () => {
      socket.on('1on1-room-name',(data) => {
          console.log("LISTENER CALLED 1 ON 1",data)
      })
   }

   //NEW USER JOINS SOCKET
   newUserChat = (param,callback) => { // param userId
        socket.emit(knew_userSocket, param, (data) => {
            console.log("NEW USER",data);
            callback(data)
        });
   }

   //JOIN CHAT
   joinUserChat = (param,callback) => { //param senderId and receiverId
        socket.emit(kjoin_user_chatSocket, param, (data) => {
            if(typeof(data) === 'string'){
                callback({success:false,responseData:data,failure:data})
            }else{
                callback({success:true,responseData:data,failure:null})
            }
        });
    }

   //JOIN 1 On 1 CHAT
   joinUser1On1Chat = (param,callback) => { //param roomId and userId
    socket.emit(kjoin_1on1_roomSocket, param, (data) => {
        if(typeof(data) !== 'string'){
            callback({success:true,responseData:data,failure:null})
        }else{
            callback({success:false,responseData:data,failure:data})
        }
    });
    }

   //GET ROOM ID
   getRoomId = (callback) => {
        socket.on("get-room-id", (data) => {
            if(typeof(data) !== 'string'){
                callback({success:true,responseData:data,failure:null})
            }else{
                callback({success:false,responseData:data,failure:data})
            }
      });
    
   }

   //Send message single user
   sendMessage = (param,callback) => {
        socket.emit('send-message', param, (data) =>    {
            // if(typeof(data) !== 'string'){
            //     callback({success:false,responseData:data,failure:data})
            // }else{
                callback({success:true,responseData:data,failure:null})
            //}
        });
    }

    //send messsage to multiple users (Forward)
    sendMessageToUsers = (param,callback) => {
        socket.emit('send-message-to-users', param, (data) =>    {
               if(typeof(data) === 'string'){
                   callback({success:false,responseData:data,failure:data})
               }else{
                   callback({success:true,responseData:data,failure:null})
               }
           });
    }

   /** 
   {
    roomname: '',
     msg : '',
    istype: “image/text/PDF/video/contact/location/dazz/nynm”,
    isGroup : false,
   userId:,
   chatRoomId:
    isReply:true,
    contact_name:name,
     contact_number:number,
     lat:lat,
      long:long
    isReply:true
      replayMsgId:msgId
      messageContant: replied msg condent
    reply_file_type:”image/text/PDF/video/contact/location”
    nynm:string,
    buxs:false
    reply_thumbnail:”reply messg for video”
    dazzId:dazzIDs
}
*/

   

   // New Message
   newMessage = () => {
        socket.on("new-message", (cb) => {
            console.log("RECEIVED DATA",cb);
            if (this.props.receivedMsg != undefined) {
                this.props.receivedMsg(cb)
            }
            if (this.props.receivedMsgFromLog != undefined) {
                this.props.receivedMsgFromLog(cb)
            }
        });
   }

   //Online members
   getOnlineStatus = (param,callback) => { // param is userId
        socket.emit('get-user-online-status', param, (data) => {
            callback(data)
        })
   }

   //User Online Status
   userOnlineStatus = () => { //param is  roomid, userid, active status
    socket.on('user-online-status', (data) => {
        this.props.isOnlineListens(data)
    })
   }

   //Update User Status
   updateUserStatus = (param,callback) => { //param is  roomid, userid, active status
    socket.emit('update-user-active-status', param, (data) => {
        console.log("UPDATE USER STATUS DATA",data)

        callback(data)
    })
   }

   //Typing indicating
   userTyping = (param,callback) => {// param is userid,roomid,userName,roomName
    socket.emit('user-typing', param, (data) => {
        if(typeof(data) === 'string'){
            callback({success:false,responseData:data,failure:data})
        }else{
            callback({success:true,responseData:data,failure:null})
        }
    })
   }
    
   //stopped typing
   userStopTyping = (param,callback) => {// same as above
    socket.emit('user-stop-typing', param, (data) => {
        if(typeof(data) === 'string'){
            callback({success:false,responseData:data,failure:data})
        }else{
            callback({success:true,responseData:data,failure:null})
        }
    })
   }

   //user typing response
   userTypingResponse = () => {
       socket.on("user-typing-response",(data) => {
        // if(this.props.userTypingMethod != undefined){
        //     this.props.userTypingMethod(data)
        // }
        if(this.props.userTypingMethodFromRoom != undefined){
            this.props.userTypingMethodFromRoom(data)
        }
        if(this.props.userTypingMethodFromLog != undefined){
            this.props.userTypingMethodFromLog(data)
        }        

           // callback(data)
       })
   }

   //delete Message
   deleteMessage = (param,callback) => { // param messageid, userid, roomid, roomname, isType, deleteforeveryone
    socket.emit('delete-message', param, (data) => {
        if(typeof(data) === 'string'){
            callback({success:false,responseData:data,failure:data})
        }else{
            callback({success:true,responseData:data,failure:null})
        }
    })
   }

    render() {
        const {SERVER_URL,isOnlineListens,userTypingMethod,userTypingMethodFromRoom,userTypingMethodFromLog} = this.props
        return (
            <View>

            </View>
        )
    }
  }