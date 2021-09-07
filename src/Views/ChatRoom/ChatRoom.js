/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React,{Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  Keyboard,
  Clipboard,
  ActivityIndicator,
  StatusBar,
  TouchableHighlight,
  TouchableOpacity,
  NativeModules, Button, 
  Modal
} from 'react-native';
import io from 'socket.io-client';
import OfflineNotice from "Components/OfflineNotice/OfflineNotice";
import ChatSocket from "Components/ChatSocket/ChatSocket";
import AutogrowInput from "Components/AutoGrowingTextInput/AutoGrowingTextInput";
import KeyboardSpacer from 'react-native-keyboard-spacer';
import MessageBubble from 'Components/MessageBubble/MessageBubble';
import { connect } from 'react-redux'
import {fetchMessages,chatImageUpload,chatVideoUpload,chatFileUpload} from "Components/ChatSocket/ChatSocketApi";
import InputBar from "Components/InputBar/InputBar";
import ImagePicker from 'react-native-image-crop-picker';
import {kChatGlobalURL} from '../../lib/networking/ApiConstants'
import Imagebubble from 'Components/Imagebubble/Imagebubble'
import { identifier, isFlowType } from '@babel/types';
import moment from "moment";
import Modall from "react-native-modal";
import AttachmentModal from "react-native-modal";
import MoreModal from "react-native-modal";
import utils from "../../Utils/utils";
import VideoBubble from "Components/VideoBubble/VideoBubble";
import DocumentPicker from 'react-native-document-picker';
import Filebubble from "Components/Filebubble/Filebubble";
import ReplyBubble from "Components/ReplyBubble/ReplyBubble";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import GiphySearch from "Components/GiphySearch/GiphySearch"
import searchGifs from '../../Utils/searchGifs';
import GifModal from "react-native-modal";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { Snackbar } from 'react-native-paper';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AntDesign from "react-native-vector-icons/AntDesign";
import EvilIcons from "react-native-vector-icons/EvilIcons"
import DBInterface from "../../DBInterface/DBInterface";
import NetInfo from "@react-native-community/netinfo";
import {muteChat,archiveSingleChat,deleteRoom} from "Components/ChatSocket/ChatSocketApi";
import ImageViewer from 'react-native-image-zoom-viewer';

//DEVELOPMENT CHAT URL
let kGlobalBaseURL = "http://52.66.180.172:9060/"
// let kChatGlobalURL = "http://52.66.180.172:9003"
let kChatAPIBaseURL = "http://52.66.180.172:9003/api"
let kChatImageUploadURL = "http://54.173.185.173:9003/chat/uploadImage"
let kChatVideoUploadURL = "http://54.173.185.173:9003/chat/uploadVideo"
let kChatThumbNailImageUploadURL = "http://54.173.185.173:9003/api/chatrooms/videoThumbnail"
let kChatDocUploadURL = "http://54.173.185.173:9003/chat/uploadDoc"
let highlightData = ''

//used to make random-sized messages
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


class ChatRoom extends React.Component{  
  constructor(props) {  
    super(props);

    this.state = {
      messages: [],
      load:false,
      limit:20,
      inputBarText: '',
      roomId: this.props.navigation.getParam("chat_roomId"),
      roomName: this.props.navigation.getParam("chat_roomName"),
      receiverId: this.props.navigation.getParam("receiverId"),
      onlineStatus: false,
      userName: this.props.navigation.getParam("name"),
      isTyping: false,
      isMute:this.props.navigation.getParam("mute"),
      urlData : {
        title: "",
        images: [],
        url:""
      },
      snackVisible:false,
      msgType:"text",
      selectedImage:"",
      imageData:"",
      visibleModal:null,
      isDelete:false,
      selectedMsg:"",
      isKeyboardOpen:false,
      replyMsgItem:"",
      snackBarMsg:"",
      isReply:false,
      fileData:"",
      visibleAttachModal:null,
      is_gif_modal_visible:null,
      query: '',
      gif_url: '',
      attachmentChosen: "",
      totalCount:1,
      update:false,
      visibleMoreModal:null,
      isArchived: this.props.navigation.getParam("archive"),
      userImage: this.props.navigation.getParam("userImage"),
      lastSeen : "",
      connection_Status: "Online",
      isClickedImage: false,
      clickedImage : "",
      imageLoad: false
    }
    this.onlineListenerCalled = this.onlineListenerCalled.bind(this);
    this.userTypingResponseFromSocket = this.userTypingResponseFromSocket.bind(this);
    this.receivedMsgFromOtherUser = this.receivedMsgFromOtherUser.bind(this);
    this.chooseImageFromCamera = this.chooseImageFromCamera.bind(this)
    this.chooseImageFromGallery = this.chooseImageFromGallery.bind(this)
    this.chooseFileFromDocuments = this.chooseFileFromDocuments.bind(this)
    this.onImgClicked = this.onImgClicked.bind(this)
    this.deleteClicked = this.deleteClicked.bind(this)
    this.pageNumber = 1;
    this.endReached = false;
    this.onEndReachedCalledDuringMomentum = true;
  }

  /** Component cycle */
  UNSAFE_componentWillMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  //When the keyboard appears, this gets the ScrollView to move the end back "up" so the last message is visible with the keyboard up
  //Without this, whatever message is the keyboard's height from the bottom will look like the last message.
  keyboardDidShow (e) {
    this.setState({
      isKeyboardOpen:true
    })
    //this.refs.flatList.scrollToEnd()
    
  }

  //When the keyboard dissapears, this gets the ScrollView to move the last message back down.
  keyboardDidHide (e) {
    this.setState({
      isKeyboardOpen:false
    })
    //this.refs.flatList.scrollToEnd()
  }

  //scroll to bottom when first showing the view
  componentDidMount() {
    this.socketMethods()
    //Internet Connection
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);

    NetInfo.isConnected.fetch().done((isConnected) => {
      if (isConnected == true) {
        this.setState({ connection_Status: "Online" })
        if(this.state.roomId != null && this.state.roomId != undefined){
          this.setState({
            load:true
          })
          this.chatFetchMessages("send")
        }
      }
      else {
        this.setState({ connection_Status: "Offline" })
        console.log("Fetch")
        this.importDBMsgsData()
      }
    });

    
    setTimeout(function() {
      //this.refs.flatList.scrollToEnd()
    }.bind(this))
    this.searchGifs()
  }  

  componentDidUpdate() {
    setTimeout(function() {
      //this.refs.flatList.scrollToEnd()
    }.bind(this))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log("chatroom props called")
    //this.chatSocket.userTypingResponse()
  }

  handleConnectivityChange = (isConnected) => {
    console.log("CONNECTION STATUS",isConnected)
    if (isConnected == true) {
      this.setState({ connection_Status: "Online" })
    }
    else {
      this.setState({ connection_Status: "Offline" })
      console.log("HANDLECONNECTIVITY CALLED")
      //this.importDBMsgsData()
    }
  };

  /** socketMethods */
  socketMethods = () => {
    if(this.chatSocket != undefined){
      this.chatSocket.connectOnForeground()
      this.chatSocket.checkConnectedStatus((status) => {
        console.log("status CHATROOM",status)
        
        if(status){
          // let param1 = {
          //    receiverId : this.state.receiverId,
          //    senderId:this.props.loginId
          // }

          // this.chatSocket.joinUserChat(param1,(data) => {
          //   console.log("APP JOIN CHAT",data)
          // })

          let on1Param = { 
            "chatRoomId": this.state.roomId,
            "userId": this.props.loginId
          }

          this.chatSocket.joinUser1On1Chat(on1Param,(data) => {
            console.log("JOIN 1ON 1",data)
          })
                  
          this.chatSocket.getRoomId((data)=>{
            console.log("APP ROOM ID CHAT",data)
            this.chatSocket.newMessage()
          })

          let userStatusParam = {
            "roomId" : this.state.roomId, 
            "userId":this.props.loginId ,
            "active" :true
           }
           this.chatSocket.updateUserStatus(userStatusParam,(data) => {
             console.log("SOCKET SUCCESS UPDATE STATUS DATA",data)
           })

          let param = {
            username:"",
            userId:this.state.receiverId
          }
          this.chatSocket.getOnlineStatus(param,(data) => {
            console.log("ONLINE STATUS",param,data)
            if(data.userStatus){
              this.setState({
                onlineStatus: data.userStatus.online
              })
            }else{
              this.setState({
                onlineStatus: false
              })
            }
          })
        }
      })
    }
  }

  /** user typing response */
  userTypingResponseFromSocket(data) {
    console.log("ROOM TYPING",this.state.messages[this.state.messages.length -1],data.userId,this.state.receiverId,data.roomId,this.state.roomId,this.state.isTyping,data.isTyping)

    if(data.userId == this.state.receiverId && data.roomId == this.state.roomId){
      if(this.state.isTyping != data.isTyping){
        this.setState({
          isTyping:data.isTyping
        },()=>{
          //console.log("TYPING IN ROOM",this.state.isTyping)
        })
        let dataDict = {
          isTyping: data.isTyping
        }
        if(data.isTyping == false){
          //let lastIndex = this.state.messages.length
          this.state.messages.splice(0,1)
          this.setState({
            isTyping: false,
            update: false
          })
          this.chatFetchMessages("send")
        }else{
          console.log("TYPING PUSHED >>>>>>>>>>>>>>>")
          this.setState({
            update: true
          })
          let msgs = this.state.messages
          msgs.splice(0,0,dataDict)
          this.setState({
            messages:msgs
          })
        }
      }
    }
  }

  /** Messages received */
  receivedMsgFromOtherUser(data) {
      if (highlightData != data) {
        highlightData = data;
        this.chatFetchMessages("")
      }
  }

  async importDBMsgsData() {
    this.setState({
      messages: [],
      load:false
    })
    console.log("ROOMID CHAT MSGS",this.state.roomId)
    let msgsDataFromDB = await DBInterface.getChatMsgs(this.props.loginId,this.state.roomId)
    let chats = new Array()
    for (let i = 0; i < msgsDataFromDB.length; i++) {
        const element = msgsDataFromDB[i];
        chats.push(element)
    }
    this.setState({
      messages: chats
    })
    console.log("offline ChatMsgs")
}

  /** Fetch messages */
  chatFetchMessages = (text) => {
    console.log("room id",this.state.roomId)
    console.log("CONNECTION CHAT FETCHES",this.state.connection_Status)

    if(this.state.connection_Status == "Online" || this.state.connection_Status == ""){
        fetchMessages(this.state.limit,this.pageNumber,this.props.loginId,this.state.roomId,() => {
          
        },(responseData) => {
          this.setState({
            load:false,
          })
          if(responseData.data.statusCode == 200){
            console.log("CHATFETCH",responseData.data.statusCode,responseData.data.data.message,this.pageNumber,responseData.data.total_count)
            DBInterface.insertChatRoomData(responseData.data.data.message,this.state.roomId)
            if (
              Array.isArray(responseData.data.data.message) &&
              this.pageNumber == 1
            ) {
                console.log("Chat fETCH INSIDE")
                let re = Object.assign([], this.state.messages);
                let fre = re.concat(responseData.data.data.message);
                let pages = (responseData.data.total_count / 20)
                this.setState({
                  messages: responseData.data.data.message,
                  imageLoad: false,
                  totalCount: responseData.data.total_count % 20 == 0 ? Math.round( pages ) : Math.round( pages ) + 1,
                  receiverId: responseData.data.data.userRoom[0].DUSER_ROOM_UID
                },()=>{
                  console.log("Total count",this.state.totalCount)
                })
              }else if (this.state.messages.length >= 0 && this.pageNumber >= 1) {
                var joined = this.state.messages.concat(
                  responseData.data.data.message,
                );
                let pages = (responseData.data.total_count / 20)
                // DBInterface.insertChatRoomData(responseData.data.data.message)
                this.setState(
                  {
                    messages: joined,
                    imageLoad: false,
                    totalCount: responseData.data.total_count % 20 == 0 ? Math.round( pages ) : Math.round( pages ) + 1,
                    load: false,
                  })
                }
          
          }else{
            console.log("NODATA",responseData)
          }
        })
      }else{
        this.importDBMsgsData()
      }
  }

  onEndReached = () => {
    console.log("endReached triggered",this.pageNumber,this.state.totalCount)
    this.pageNumber = this.pageNumber + 1;
    if (this.pageNumber <= this.state.totalCount && this.pageNumber > 1) {
      
      //if(!this.onEndReachedCalledDuringMomentum && !this.endReached){
      this.chatFetchMessages("");
      this.onEndReachedCalledDuringMomentum = true;
      // }
    }
  };

  sendParamConstruct = () => {
    console.log("MSGTYPe",this.state.msgType)
    
      if(this.state.msgType == "text"){
        let msgParam = { 
          "roomname": this.state.roomName,
          "username": this.state.userName,
          "msg": this.state.inputBarText,
          "hasMsg": true,
          "hasFile": false,
          "isReply": this.state.isReply,
          "reply_file_type": 'text',
          "replayMsgId": this.state.isReply ? this.state.replyMsgItem.TMESSAGES_Message_ID : 0,
          "messageContant": this.state.isReply ? this.state.replyMsgItem.TMESSAGES_Content : "",
          "msgTime": moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS"),
          "istype": 'text',
          "isGroup": false,
          "userId": this.props.loginId,
          "chatRoomId": this.state.roomId,
          //"unique_ref_id": '8011561035877350' 
        }
    
        this.setState({
         // messages: this.state.messages,
          inputBarText: ''
        }); 
        this._sendMessageToSocket(msgParam)
      }else if(this.state.msgType == "image" || this.state.msgType == "video"){
        const formData = new FormData()
        formData.append('roomname',this.state.roomName)
        formData.append('username',this.state.userName)
        formData.append('userAvatar',"test")
        formData.append('hasFile',true)
        formData.append('isReply',this.state.isReply)
        formData.append('reply_file_type',this.state.isReply ? this.state.msgType: "")
        formData.append('replayMsgId',this.state.isReply ? this.state.replyMsgItem.TMESSAGES_Message_ID : null)
        formData.append('messageContant',this.state.isReply ? this.state.inputBarText : "")
        formData.append('msgTime',moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS"))
        formData.append('istype',this.state.msgType)
        formData.append('isGroup',false)
        formData.append('userId',this.props.loginId)
        formData.append('chatRoomId',this.state.roomId)
        formData.append('file',this.state.selectedImage)
        console.log("MESSAGE TYPE",this.state.msgType,formData)
        if(this.state.msgType == "image"){
          chatImageUpload(formData,() => {
          },(responseData) => {
            console.log("IMAGE UPLOAD",responseData)
            if(this.state.messages[this.state.messages.length-1].isTyping){
              this.state.messages.splice(0,1)
            }
            this.setState({
              isTyping:false
            })
            this.chatFetchMessages()
          })
        }else if(this.state.msgType == "video"){
          chatVideoUpload(formData,() => {
          },(responseData) => {
            console.log("VIDEO UPLOAD",responseData)
            if(this.state.messages[this.state.messages.length-1].isTyping){
              this.state.messages.splice(0,1)
            }
            this.setState({
              isTyping:false
            })
            this.chatFetchMessages()
          })
        }
        // setTimeout(() => {
        //   this.chatFetchMessages("send")
        // }, 500);
      }else{
        const formData = new FormData()
        formData.append('roomname',this.state.roomName)
        formData.append('username',this.state.userName)
        formData.append('userAvatar',"test")
        formData.append('hasFile',true)
        formData.append('isReply',this.state.isReply)
        formData.append('reply_file_type',this.state.isReply ? this.state.msgType: "")
        formData.append('replayMsgId',this.state.isReply ? this.state.replyMsgItem.TMESSAGES_Message_ID : null)
        formData.append('messageContant',this.state.isReply ? this.state.inputBarText : "")
        formData.append('msgTime',moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS"))
        formData.append('istype',this.state.msgType)
        formData.append('isGroup',false)
        formData.append('userId',this.props.loginId)
        formData.append('chatRoomId',this.state.roomId)
        formData.append('file',this.state.selectedImage)
        console.log("MESSAGE TYPE",this.state.msgType,formData)
        chatFileUpload(formData,() => {
        },(responseData) => {
          console.log("DOC UPLOAD",responseData)
          if(this.state.messages[this.state.messages.length-1].isTyping){
            this.state.messages.splice(0,1)
          }
          this.setState({
            isTyping:false
          })
          this.chatFetchMessages()
        })
        // setTimeout(() => {
        //   this.chatFetchMessages("send")
        // }, 500);
      }
      if(this.state.isReply == true){
        this.setState({
          isReply:false
        })
      }
  }

  /** Send Button Action */
  _sendMessageToSocket(sendMsgParam) {
  this.chatSocket.connectOnForeground()
  this.chatSocket.checkConnectedStatus((status) => {
    console.log("status",status)
    if(status){
      //console.log("SENT",sendMsgParam)
      let param1 = {
        userName:"",
        userId: this.props.loginId,
        roomname:this.state.roomName,
        roomId:this.state.roomId
      }
      this.chatSocket.userStopTyping(param1,(data) => {
          console.log("TYPING",data)
      })
      console.log("SEND MESSAGE",sendMsgParam)
      this.chatSocket.sendMessage(sendMsgParam,(data)=>{
        console.log("sent data callback",data)
        this.setState({
          update:true
        })
        this.chatFetchMessages("send")
      })
      // setTimeout(() => {
      //   this.chatFetchMessages("send")
      // }, 500);
    }
  })
  }

  _onChangeInputBarText(text) {
    this.setState({
      msgType: "text"
    })
    let param1 = {
      userName:"",
      userId: this.props.loginId,
      roomname:this.state.roomName,
      roomId:this.state.roomId
    }
    console.log(param1)
    this.chatSocket.userTyping(param1,(data) => {
        console.log("TYPING",data)
    })
    this.setState({
      inputBarText: text
    });
  }

  //This event fires way too often.
  //We need to move the last message up if the input bar expands due to the user's new message exceeding the height of the box.
  //We really only need to do anything when the height of the InputBar changes, but AutogrowInput can't tell us that.
  //The real solution here is probably a fork of AutogrowInput that can provide this information.
  _onInputSizeChange() {
    setTimeout(function() {
      //this.refs.flatList.scrollToEnd()
    }.bind(this))
  }

  /** Muting and Unmuting Chat */
  mutingchat = (roomId,ismute) => {
    this.setState({
      visibleMoreModal:false
    })
    muteChat(this.props.loginId,roomId,ismute,() => {this.setState({
        load:true
    })},(responseData) => {
        this.setState({
            load:false
        })
        if(responseData.data.statusCode == 200){
            this.setState({
                snackVisible:true,
                isMute: ismute,
                snackBarMsg:"Chat muted successfully"
            })
        }
    })
}

/** Archive chat */
archivingchat = (roomId,isArchive) => {
  this.setState({
    visibleMoreModal:false
  })
  archiveSingleChat(this.props.loginId,roomId,isArchive,() => {this.setState({
      load:true
  })},(responseData) => {
      this.setState({
          load:false,
      })
      if(responseData.status == 200){
        this.setState({
          snackVisible:true,
          isArchived: isArchive,
          snackBarMsg:"Chat archived successfully"
      })
      }
  })
}

/** Deleting Room */
deletingRoom = (roomId) => {
  this.setState({
      visibleMoreModal:false
  })
  deleteRoom(this.props.loginId,roomId,() => {this.setState({
      load:true
  })},(responseData) => {
      this.setState({
          load:false,
      })
      if(responseData.status == 200){
          this.setState({
              snackVisible:true,
              snackBarMsg:"Chat deleted successfully"
          },()=>{
            DBInterface.deleteSingleLogData(roomId)
            if(this.props.navigation.getParam("from") == "ChatLog"){
              this.props.navigation.state.params.onGoBack();
             }
             this.props.navigation.goBack()
          })
      }
  })
}

  /** IMAGES GALLERY AND CAMERA PICKER */
  chooseImageFromGallery = () => {
    setTimeout(() => {
    ImagePicker.openPicker({
            width: 500,
            height: 500,
            cropping: true,
            compressImageMaxWidth: 640,
            compressImageMaxHeight: 480,
            includeBase64: true
          })
            .then(image => {
              console.log("image is", image)

              let pathParts = image.path.split('/');
              let file = {
                uri: image.path,
                type: image.mime,
                imageLoad: true,
                name: pathParts[pathParts.length - 1]
              }
              console.log("FILE is", file)
              let msgTypee = file.type.split("/")
              this.setState({
                msgType: msgTypee[0],
                imageData:image,
                selectedImage:file
              },() => {this.sendParamConstruct()})
              
    //this.storeUploadedData(image);
            })
            .catch(e => {
              console.log("GALLERY PICKER....", e)
            })
    
      },300)
    }


  chooseImageFromCamera = () => {
    setTimeout(() => {
    ImagePicker.openCamera({
            width: 500,
            height: 500,
            cropping: true,
            compressImageMaxWidth: 640,
            compressImageMaxHeight: 480,
            includeBase64: true
          })
            .then(image => {
              let pathParts = image.path.split('/');
              let file = {
                uri: image.path,
                imageLoad: true,
                type: image.mime,
                name: pathParts[pathParts.length - 1]
              } 
              console.log("FILE is", file)
              let msgTypee = file.type.split("/")
              this.setState({
                msgType: msgTypee[0],
                imageData:image,
                selectedImage:file
              },() => {this.sendParamConstruct()})

    //this.storeUploadedData(image);
            })
            .catch(e => {
    
            });
        }, 100);
      }

     //Choose files to upload
     chooseFileFromDocuments = async() => {
      try {
        const res = await DocumentPicker.pick({
          type: [DocumentPicker.types.allFiles],
        });
        let file1 = {
          uri: res.uri,
          type: res.type,
          name: res.name
        }
        let msgtypee = res.name.split(".")

        this.setState({
          msgType: msgtypee[msgtypee.length-1],
          fileData:res,
          selectedImage:file1
        },() => {this.sendParamConstruct()})

        console.log(
          res.uri,
          res.type, // mime type
          res.name,
          res.size
        );

      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          console.log("FILE PICKER CANCELLED")
          // User cancelled the picker, exit any dialogs or menus and move on
        } else {
          console.log("FILE PICKER error",err)
          throw err;
       
        }
      }
    }

    /** delete clicked  */
    deleteClicked = (item) => {
      console.log("delete CLicked",item)
      setTimeout(() => {
        this.setState({
          visibleModal:true,
          selectedMsg:item,
          isDelete:false,
        })
      }, 100);
    }

    /** Online Listener called */
    onlineListenerCalled = (data) => {
      console.log("ONLINE DATA STATUS",data,this.state.receiverId)
      var gmtDateTime = moment.utc(data.lastSeen, "YYYY-MM-DD HH:mm:ss")
      var localDate = gmtDateTime.local().format("h:mm a");
      if(data.userId == this.state.receiverId){
        // if(this.state.onlineStatus != data.online){
          this.setState({
            onlineStatus:data.online,
            lastSeen: localDate
          })
        // }
      }
    }

    /** Image preview */
    onImgClicked = (data) => {
      console.log("IMAGE CLICKED",data)
      this.setState({
        isClickedImage:true,
        clickedImage: data.TMESSAGES_Content
      })
    }

    /** Chat Features */
    forwardClicked = () => {
      this.setState({
        visibleModal:false
      },() => {
        this.props.navigation.navigate("ForwardUsers",{
          "selectedMsgToForward":this.state.selectedMsg,
          "roomName":this.state.roomName
        })
      })
    }

    replyClicked = () => {
      this.setState({
        isDelete:false,
        visibleModal:false,
        isReply:true,
        replyMsgItem:this.state.selectedMsg
      })
    }

    copyClicked = async () => {
      this.setState({
        visibleModal:false
      })
      await Clipboard.setString(this.state.selectedMsg.TMESSAGES_Content);
    }

    deleteforEveryOne = () => {
      let deleteMsgParam = {
        "messageId": [this.state.selectedMsg.TMESSAGES_Message_ID], 
        "userId": this.props.loginId, 
        "roomId": this.state.roomId, 
        "deleteForEveryOne": true, 
        "roomname": this.state.roomName, 
        "istype": this.state.selectedMsg.TMESSAGES_File_Type
      }
      this.setState({
        isDelete:false,
        visibleModal:null
      })
      console.log("delete param",deleteMsgParam)
      this.chatSocket.connectOnForeground()
      this.chatSocket.checkConnectedStatus((status) => {
        console.log("status CHATROOM",status)
        if(status){
          this.chatSocket.deleteMessage(deleteMsgParam,(data)=>{
            console.log("DELETED",data)
            this.chatFetchMessages("delete")
          })
         
        }
      })
    }

    deleteforMyself = () => {
      let deleteMsgParam = {
        "messageId": [this.state.selectedMsg.TMESSAGES_Message_ID], 
        "userId": this.props.loginId, 
        "roomId": this.state.roomId, 
        "deleteForEveryOne": false, 
        "roomname": this.state.roomName, 
        "istype": this.state.selectedMsg.TMESSAGES_File_Type
      }
      this.setState({
        isDelete:false,
        visibleModal:null
      })
      console.log("delete param",deleteMsgParam)
      this.chatSocket.connectOnForeground()
      this.chatSocket.checkConnectedStatus((status) => {
        console.log("status CHATROOM",status)
        if(status){
          this.chatSocket.deleteMessage(deleteMsgParam,(data)=>{
            console.log("DELETED",data)
            this.chatFetchMessages("delete")
          })
         
        }
      })
    }


  //RENDER MODAL
  renderModalContent = () => (
    <View style={styles.modalContent}>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.deleteforEveryOne()}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:10,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}> Delete for Everyone</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.deleteforMyself()}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:10,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}> Delete for Myself</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{
        this.setState({
          isDelete:false,
          visibleModal:null
        })
      }}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:10,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}> Cancel</Text>
      </TouchableOpacity>
    </View>
  )

  renderMoreModalContent = () => (
    <View style={styles.modalContent}>
      <TouchableOpacity style={{flex:1,height:40,flexDirection:"row",justifyContent:"center"}} onPress={()=>{
        this.mutingchat(this.state.roomId,this.state.isMute == 0 ? 1 : 0)
      }}>
        <FontAwesome5 name={this.state.isMute == 0 ? "volume-off" : "volume-mute"} size={22} color={"#696A6C"} style={{alignSelf:"center"}}/>
        <Text style={{fontSize:17,color:"black",marginLeft:5,paddingTop:10,height:40,textAlign:"center",alignSelf:"center"}}>{this.state.isMute == 0 ? "Mute      " : "Unmute    "}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{flex:1,height:40,flexDirection:"row",justifyContent:"center"}} onPress={()=>{
        this.archivingchat(this.state.roomId,this.state.isArchive == 0 ? 1 : 0)
      }}>
        <EvilIcons name="archive" size={22} color={"#696A6C"} style={{alignSelf:"center"}}/>
        <Text style={{fontSize:17,marginLeft:5,color:"black",paddingTop:10,height:40,textAlign:"center",alignSelf:"center"}}> {this.state.isArchived == 0 ? "Archieve  " : "Unarchieve"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{flex:1,height:40,flexDirection:"row",justifyContent:"center"}} onPress={()=>{
        this.deletingRoom(this.state.roomId)
      }}>
        <AntDesign name="delete" size={18} color={"#696A6C"} style={{alignSelf:"center"}}/>
        <Text style={{fontSize:17,marginLeft:5,color:"black",paddingTop:10,height:40,textAlign:"center",alignSelf:"center"}}>Delete    </Text>
      </TouchableOpacity>
    </View>
  )

  renderForwardModalContent = () => (
    <View style={styles.modalContent}>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.forwardClicked()}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:5,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}>Forward</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.replyClicked()}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:5,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}>Reply</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.copyClicked()}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:5,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}>Copy</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.setState({
        isDelete:true
      })}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:5,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}>Delete</Text>
      </TouchableOpacity>
    </View>
  )

  //RENDER ATTACHMENT MODAL
  renderAttachModalContent = () => (
    <View style={styles.modalContent}>
      <TouchableOpacity style={{flex:1,height:70,flexDirection: "row",justifyContent:"center"}} onPress={()=>{
          this.setState({
            attachmentChosen: "Camera",
            visibleAttachModal:null
          })
        }}>
        <Entypo size={25} color="#1679F4" name="camera" style={{marginTop:5}}/>
        <Text style={{fontSize:17,color:"#black",padding:10,fontWeight:'bold',height:40,width:"90%"}}>Take a photo</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:70,flexDirection: "row",justifyContent:"center"}} onPress={()=>{
          this.setState({
            attachmentChosen: "Gallery",
            visibleAttachModal:null
          })
        }}>
        <FontAwesome size={25} color="#1679F4" name="photo" style={{marginTop:5}}/>
        <Text style={{fontSize:17,color:"#black",padding:10,fontWeight:'bold',height:40,width:"90%"}}>Choose from Gallery</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:70,flexDirection: "row",justifyContent:"center"}} onPress={()=>{
        this.setState({
          attachmentChosen: "Documents",
          visibleAttachModal: null
        })}}>
        <Entypo size={25} color="#1679F4" name="documents" style={{marginTop:5}}/>
        <Text style={{fontSize:17,color:"black",padding:10,fontWeight:'bold',height:40,width:"90%"}}>Documents</Text>
      </TouchableOpacity>
      <View style={[styles.divider]}/>
      <TouchableOpacity style={{flex:1,height:80}} onPress={()=>{
        this.setState({
          isDelete:false,
          attachmentChosen: "",
          visibleAttachModal:null
        })
      }}>
        <Text style={{fontSize:17,color:"#1679F4",padding:10,textAlign:"center",alignSelf:"center",fontWeight:'bold',height:40,width:"90%"}}> Cancel</Text>
      </TouchableOpacity>
      <View style={[styles.divider,{height:5,backgroundColor:"clear",marginTop:10}]}/>
    </View>
  )

  searchGifs = async () => {
    //const { query } = this.state;
    const search_results = await searchGifs(this.state.query == "" ? "Latest" : this.state.query);
    this.setState({
      search_results: search_results
    });
  }

  closeGifModal = (gif_url) => {
    Keyboard.dismiss()
    this.setState({
      is_gif_modal_visible: false,
      gif_url: gif_url,
      msgType: "text",
      inputBarText: gif_url,
    },() => {
      this.sendParamConstruct()
    });
  }

  //RENDER GIF MODAL
  renderGifModal = () => (
    <View style={[styles.modalContent,{minHeight: this.state.isKeyboardOpen ? 620 : 500}]}>
    <View style={styles.modal_body}>
      <TouchableOpacity onPress={() => this.closeGifModal('')}>
          <View style={styles.modal_close_container}>
            <Text style={styles.modal_close_text}>Close</Text>
          </View>
        </TouchableOpacity>
        <GiphySearch
          query={this.state.query}
          onSearch={(query) => this.setState({ query: query })}
          search={this.searchGifs}
          search_results={this.state.search_results}
          onPick={(gif_url) => this.closeGifModal(gif_url)} 
        />
        </View>
    </View>
  )

  /** Render Messages */
  renderMessages(item,index){
    if(item.TMESSAGES_IS_Reply == 1 && item.TMESSAGES_File_Type == "text"){
      if(item.TMESSAGES_UID == this.props.loginId){ // receiver's Message
            return(
              <ReplyBubble 
                key={index} 
                item={item}
                onSelect={false}
                direction={'right'} 
                deleteClicked={(data) => {this.deleteClicked(data)}}
                receiverBubbleColor={'#cfe7ff'}
                senderBubbleColor={'#005fbb'}
                todayDate={item.TMESSAGES_Created_On}
                isToday={item.TMESSAGES_Record_Today_First_message}
                dateView={styles.dateView}
                dateStyle={styles.dateStyle}
                imageStyle={styles.imgBubble}
                fileStyle={styles.fileStyle}
                text={item.TMESSAGES_Content} 
                time={item.TMESSAGES_Created_On} 
                timeStyle={{fontSize:10,color:"gray"}} 
                readStatus={item.TMESSAGES_Read_Status}
              />
          )
          }else{ // Receiver's message
            return(
              <ReplyBubble 
                key={index} 
                item={item}
                fileStyle={styles.fileStyle}
                onSelect={false}
                direction={'left'}
                deleteClicked={(data) => {this.deleteClicked(data)}} 
                receiverBubbleColor={'#cfe7ff'}
                senderBubbleColor={'#005fbb'}
                imageStyle={styles.imgBubble}
                todayDate={item.TMESSAGES_Created_On}
                isToday={item.TMESSAGES_Record_Today_First_message}
                dateView={styles.dateView}
                dateStyle={styles.dateStyle}
                text={item.TMESSAGES_Content}
                time={item.TMESSAGES_Created_On} 
                timeStyle={{fontSize:10,color:"gray"}} 
              />
          )
        }

    }else if(item.isTyping){
      console.log("RETURN TYPING BUBBLE>>>>>>>>>>>>")
      return(
        <MessageBubble 
          key={index} 
          direction={'left'} 
          isTyping={item.isTyping}
          isGif={false}
          isUrl={false}
          disableTouch={true}
          // text={item.TMESSAGES_Content} 
          // time={item.TMESSAGES_Created_On} 
          // timeStyle={{fontSize:8,color:"white"}} 
          // readStatus={item.TMESSAGES_Read_Status}
        />
      )
    }else {
        if(item.TMESSAGES_File_Type == "text"){ //Users text message
          var isGif = false
          var splitMsg = ""
          var isUrl = false
          if(item.TMESSAGES_Content != ""){
            splitMsg = item.TMESSAGES_Content.split(".")
            if(splitMsg[splitMsg.length - 1] == "gif"){
              isGif = true
            }else{
              isGif = false
              if(item.TMESSAGES_Content.includes("https://") || item.TMESSAGES_Content.includes("http://")){
                isUrl = true
              }else{
                isUrl = false
              }
            } 
          }
          if(item.TMESSAGES_UID == this.props.loginId){ // sender's Message
            return(
              <MessageBubble 
                key={index} 
                item={item}
                isGif={isGif}
                isUrl={isUrl}
                //urlData={this.state.urlData}
                onSelect={false}
                direction={'right'} 
                deleteClicked={(data) => {this.deleteClicked(data)}}
                receiverBubbleColor={'#f0f0f1'}
                senderBubbleColor={'#4291E2'}
                todayDate={item.TMESSAGES_Created_On}
                isToday={item.TMESSAGES_Record_Today_First_message}
                dateView={styles.dateView}
                dateStyle={styles.dateStyle}
                text={item.TMESSAGES_Content} 
                time={item.TMESSAGES_Created_On} 
                timeStyle={{fontSize:10,color:"gray"}} 
                readStatus={item.TMESSAGES_Read_Status}
              />
          )
          }else{ // Receiver's message
            return(
              <MessageBubble 
                key={index} 
                item={item}
                isGif={isGif}
                isUrl={isUrl}
                //urlData={this.state.urlData}
                onSelect={false}
                direction={'left'}
                deleteClicked={(data) => {this.deleteClicked(data)}} 
                receiverBubbleColor={'#F0F0F1'}
                senderBubbleColor={'#4291E2'}
                todayDate={item.TMESSAGES_Created_On}
                isToday={item.TMESSAGES_Record_Today_First_message}
                dateView={styles.dateView}
                dateStyle={styles.dateStyle}
                text={item.TMESSAGES_Content}
                time={item.TMESSAGES_Created_On} 
                timeStyle={{fontSize:10,color:"gray"}} 
              />
          )
        }
      }else if(item.TMESSAGES_File_Type == "image"){//Image message
          if(item.TMESSAGES_UID == this.props.loginId){ // receiver's Message
            return(
              <Imagebubble 
                key={index}
                //disableTouch={true}
                item={item} 
                direction={'right'} 
                onImgClicked={(item) => {this.onImgClicked(item)}}
                deleteClicked={(data) => {this.deleteClicked(data)}}
                receiverBubbleColor={'#F0F0F1'}
                senderBubbleColor={'#4291E2'}
                todayDate={item.TMESSAGES_Created_On}
                isToday={item.TMESSAGES_Record_Today_First_message}
                dateView={styles.dateView}
                dateStyle={styles.dateStyle}
                imgUri={item.TMESSAGES_Content} 
                imageStyle={styles.imgBubble}
                time={item.TMESSAGES_Created_On} 
                timeStyle={{fontSize:10,color:"gray"}} 
                readStatus={item.TMESSAGES_Read_Status}
              />
          )
          }else{ // Receiver's message
            return(
              <Imagebubble 
                key={index} 
                //disableTouch={true}
                item={item}
                direction={'left'} 
                receiverBubbleColor={'#F0F0F1'}
                senderBubbleColor={'#4291E2'}
                todayDate={item.TMESSAGES_Created_On}
                onImgClicked={(data) => {this.onImgClicked(data)}}
                deleteClicked={(data) => {this.deleteClicked(data)}}
                isToday={item.TMESSAGES_Record_Today_First_message}
                dateView={styles.dateView}
                dateStyle={styles.dateStyle}
                imageStyle={styles.imgBubble}
                imgUri={item.TMESSAGES_Content}
                time={item.TMESSAGES_Created_On} 
                timeStyle={{fontSize:10,color:"gray"}} 
              />
          )
        }
      }else if(item.TMESSAGES_File_Type == "video"){//video message
        if(item.TMESSAGES_UID == this.props.loginId){ // receiver's Message
          return(
            <VideoBubble 
              key={index}
              item={item} 
              //disableTouch={true}
              direction={'right'} 
              deleteClicked={(data) => {this.deleteClicked(data)}}
              receiverBubbleColor={'#F0F0F1'}
              senderBubbleColor={'#4291E2'}
              todayDate={item.TMESSAGES_Created_On}
              isToday={item.TMESSAGES_Record_Today_First_message}
              dateView={styles.dateView}
              dateStyle={styles.dateStyle}
              imgUri={item.TMESSAGES_Content} 
              imageStyle={[styles.imgBubble]}
              time={item.TMESSAGES_Created_On} 
              timeStyle={{fontSize:10,color:"gray"}} 
              readStatus={item.TMESSAGES_Read_Status}
            />
        )
        }else{ // Receiver's message
          return(
            <VideoBubble 
              key={index} 
              item={item}
              //disableTouch={true}
              direction={'left'} 
              deleteClicked={(data) => {this.deleteClicked(data)}}
              receiverBubbleColor={'#F0F0F1'}
              senderBubbleColor={'#4291E2'}
              todayDate={item.TMESSAGES_Created_On}
              isToday={item.TMESSAGES_Record_Today_First_message}
              dateView={styles.dateView}
              dateStyle={styles.dateStyle}
              imageStyle={[styles.imgBubble]}
              imgUri={item.TMESSAGES_Content}
              time={item.TMESSAGES_Created_On} 
              timeStyle={{fontSize:10,color:"gray"}} 
            />
        )
      }
      }else if(item.TMESSAGES_File_Type != "video" && item.TMESSAGES_File_Type != "image" && item.TMESSAGES_File_Type != "text"){ //File or doc message
      if(item.TMESSAGES_UID == this.props.loginId){ // receiver's Message
        return(
          <Filebubble 
            key={index}
            item={item} 
            //disableTouch={true}
            direction={'right'} 
            fileStyle={styles.fileStyle}
            deleteClicked={(data) => {this.deleteClicked(data)}}
            //onImgClicked={() => {this.onImgClicked()}}
            receiverBubbleColor={'#F0F0F1'}
            senderBubbleColor={'#4291E2'}
            todayDate={item.TMESSAGES_Created_On}
            isToday={item.TMESSAGES_Record_Today_First_message}
            dateView={styles.dateView}
            dateStyle={styles.dateStyle}
            imgUri={item.TMESSAGES_Content} 
            imageStyle={styles.imgBubble}
            time={item.TMESSAGES_Created_On} 
            timeStyle={{fontSize:10,color:"gray"}} 
            readStatus={item.TMESSAGES_Read_Status}
          />
      )
      }else{ // Receiver's message
        return(
          <Filebubble 
            key={index} 
            item={item}
            direction={'left'}
            //disableTouch={true}
            fileStyle={styles.fileStyle} 
            receiverBubbleColor={'#F0F0F1'}
            senderBubbleColor={'#4291E2'}
            todayDate={item.TMESSAGES_Created_On}
            deleteClicked={(data) => {this.deleteClicked(data)}}
            //onImgClicked={() => {this.onImgClicked()}}
            isToday={item.TMESSAGES_Record_Today_First_message}
            dateView={styles.dateView}
            dateStyle={styles.dateStyle}
            imageStyle={styles.imgBubble}
            imgUri={item.TMESSAGES_Content}
            time={item.TMESSAGES_Created_On} 
            timeStyle={{fontSize:10,color:"gray"}} 
          />
      )
    }
      }    
    }
  }

  render_FlatList_footer = () => {
    var footer_View = null
    if(this.state.imageLoad){
      footer_View = (
        <View style={[styles.activityContainer,{alignself: "flex-end"}]}>
          <ActivityIndicator size="large" color="blue"/>
        </View>
      )
    }else{
      footer_View = null
    }
    return footer_View
  };

  /** RENDER */
  render() {
    return (
              <SafeAreaView style={styles.outer}>
               <View style={styles.headerBg}>
               <TouchableOpacity style={{height:40,width:40,marginLeft:10,justifyContent:"center",marginTop:10}} onPress={()=>{
                 let userStatusParam = {
                  "roomId" : this.state.roomId, 
                  "userId":this.props.loginId ,
                  "active" :false,
                  "lastSeen":(new Date())
                 }
                 this.chatSocket.updateUserStatus(userStatusParam,(data) => {
                   console.log("UPdate status data",data)
                 })
                 if(this.props.navigation.getParam("from") == "ChatLog"){
                  this.props.navigation.state.params.onGoBack();
                 }
                 this.props.navigation.goBack()
               }}>
                  <Ionicons size={35} color="white" name="ios-arrow-back"/>
               </TouchableOpacity>
               <View style={{flexDirection: "row",flex:1}}>
                  <Image style={{height:30,width:30,borderRadius:15,backgroundColor:"gray",alignSelf:"center"}} source={this.state.userImage == null ? require('Components/ChatSocket/assets/user.png') : {uri:this.state.userImage}} />
                  <View style={{flexDirection:"column", justifyContent:"center"}}>
                    <Text style={styles.headerText}>{utils.capitalizeEachWord(this.state.userName)}</Text>
                    <Text style={styles.onlineText}>{this.state.onlineStatus ? "Online" : "Last Seen: " + this.state.lastSeen}</Text>
                  </View>
               </View>
               <TouchableOpacity style={{height:40,width:40,marginLeft:10,justifyContent:"center",marginTop:10}} onPress={()=>{
                 this.setState({
                   visibleMoreModal:true
                 })
               }}>
                  <Feather size={35} color="white" name="more-horizontal"/>
               </TouchableOpacity>
              </View>
              
              <View
                onStartShouldSetResponder={() => true}
                style={styles.outer}>
              
                
                {this.state.load && (
                  <View style={[styles.activityContainer, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#FA1100" />
                  </View>
                )}
            
                {this.state.messages.length == 0 && this.state.load == false ? (
                  <Text style={{fontSize:15,fontWeight:'bold',alignSelf:"center",color:"#00004d"}}></Text>
                ) : 
                  <FlatList
                    ref="flatList"
                    inverted={true}
                    nestedScrollEnabled={true}
                    extradata={this.state.update}
                    onContentSizeChange={()=> {
                      if(this.pageNumber == 1){
                        this.refs.flatList.scrollToOffset({ animated: true, offset: 0 })
                      }
                    }}
                    data={this.state.messages}
                    onEndReached={() => this.onEndReached()}
                    onEndReachedThreshold={0}
                    onMomentumScrollBegin={() => {
                      this.onEndReachedCalledDuringMomentum = false;
                    }}
                    renderItem={({item, index}) => (this.renderMessages(item,index))}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingBottom:50,marginBottom:100}}
                    ListFooterComponent={this.render_FlatList_footer}
                  />
                }
                  {/* <ScrollView ref={(refs) => { this.scrollView = refs }} style={styles.messages}>
                    {messages}
                  </ScrollView> */}
                  <Snackbar
                duration={5000}
                style={{backgroundColor:"gray",marginBottom:50,opacity:10,zIndex:999,color:"red"}}
                visible={this.state.snackVisible}
                onDismiss={() => this.setState({ snackVisible: false })}
                >
                {this.state.snackBarMsg}
                </Snackbar>
                  <ChatSocket
                        ref={(refs) => { this.chatSocket = refs }} 
                        SERVER_URL={kChatGlobalURL}
                        //userTypingMethod={(data) => {this.userTypingResponseFromSocket(data)}}
                        userTypingMethodFromRoom={(data) => {this.userTypingResponseFromSocket(data)}}
                        receivedMsg={(data)=>{this.receivedMsgFromOtherUser(data)}}
                        isOnlineListens={(data) => {this.onlineListenerCalled(data)}}
                  />
                  {this.state.isReply && this.state.replyMsgItem.TMESSAGES_File_Type == "text" && (
                    <View style={styles.replyView}>
                      <MessageBubble 
                        key={99} 
                        isGif={false}
                        isUrl={false}
                        disableTouch={true}
                        item={this.state.replyMsgItem}
                        onSelect={false}
                        direction={'left'}
                        receiverBubbleColor={'#cfe7ff'}
                        senderBubbleColor={'#005fbb'}
                        //messageStyle={{minWidth:250}}
                        //deleteClicked={(data) => {this.deleteClicked(data)}} 
                        receiverBubbleColor={'red'}
                        senderBubbleColor={'red'}
                        todayDate={this.state.replyMsgItem.TMESSAGES_Created_On}
                        isToday={this.state.replyMsgItem.TMESSAGES_Record_Today_First_message}
                        dateView={styles.dateView}
                        dateStyle={styles.dateStyle}
                        text={this.state.replyMsgItem.TMESSAGES_Content}
                        time={this.state.replyMsgItem.TMESSAGES_Created_On} 
                        timeStyle={{fontSize:10,color:"gray"}} 
                    />
                     <TouchableOpacity 
                      style={{height:50,width:50,alignSelf:"flex-start"}}
                      onPress={() => {this.setState({isReply:false,replyMsgItem:""})}}
                    >
                      <Text style={[styles.dateStyle,{color:"rgb(80,80,80)"}]}>Cancel</Text>
                    </TouchableOpacity>
                    </View>
                  )}
                  {this.state.isReply && this.state.replyMsgItem.TMESSAGES_File_Type == "image" && (
                    <View style={styles.replyView}>
                      <Imagebubble 
                        key={99}
                        disableTouch={true}
                        item={this.state.replyMsgItem} 
                        direction={'left'} 
                        messageStyle={{minWidth:90,minHeight:90,flex:1}}
                        //onImgClicked={() => {this.onImgClicked()}}
                        //deleteClicked={(data) => {this.deleteClicked(data)}}
                        receiverBubbleColor={'#cfe7ff'}
                        senderBubbleColor={'#005fbb'}
                        todayDate={this.state.replyMsgItem.TMESSAGES_Created_On}
                        isToday={this.state.replyMsgItem.TMESSAGES_Record_Today_First_message}
                        dateView={styles.dateView}
                        dateStyle={styles.dateStyle}
                        imgUri={this.state.replyMsgItem.TMESSAGES_Content} 
                        imageStyle={[styles.imgBubble,{minWidth:90,minHeight:90}]}
                        time={this.state.replyMsgItem.TMESSAGES_Created_On} 
                        timeStyle={{fontSize:10,color:"black"}} 
                        //readStatus={this.state.replyMsgItem.TMESSAGES_Read_Status}
                    />
                    <TouchableOpacity 
                      style={{height:50,width:50,alignSelf:"flex-start"}}
                      onPress={() => {this.setState({isReply:false,replyMsgItem:""})}}
                    >
                      <Text style={[styles.dateStyle,{color:"rgb(80,80,80)"}]}>Cancel</Text>
                    </TouchableOpacity>
                    </View>
                  )}

                  {this.state.isReply && this.state.replyMsgItem.TMESSAGES_File_Type == "video" && (
                    <View style={styles.replyView}>
                    <VideoBubble 
                        key={99}
                        item={this.state.replyMsgItem} 
                        direction={'left'} 
                        disableTouch={true}
                        messageStyle={{minWidth:90,minHeight:90}}
                        //onImgClicked={() => {this.onImgClicked()}}
                        //deleteClicked={(data) => {this.deleteClicked(data)}}
                        receiverBubbleColor={'#cfe7ff'}
                        senderBubbleColor={'#005fbb'}
                        todayDate={this.state.replyMsgItem.TMESSAGES_Created_On}
                        isToday={this.state.replyMsgItem.TMESSAGES_Record_Today_First_message}
                        dateView={styles.dateView}
                        dateStyle={styles.dateStyle}
                        imgUri={this.state.replyMsgItem.TMESSAGES_Content} 
                        imageStyle={[styles.imgBubble,{minHeight:"80%",minWidth:80}]}
                        time={this.state.replyMsgItem.TMESSAGES_Created_On} 
                        timeStyle={{fontSize:10,color:"gray"}} 
                        //readStatus={this.state.replyMsgItem.TMESSAGES_Read_Status}
                    />
                    <TouchableOpacity 
                    style={{height:50,width:50,alignSelf:"flex-start"}}
                    onPress={() => {this.setState({isReply:false,replyMsgItem:""})}}
                  >
                    <Text style={[styles.dateStyle,{color:"rgb(80,80,80)"}]}>Cancel</Text>
                  </TouchableOpacity>
                  </View>
                  )}

                {this.state.isReply && this.state.replyMsgItem.TMESSAGES_File_Type != "text" && this.state.replyMsgItem.TMESSAGES_File_Type != "image" && this.state.replyMsgItem.TMESSAGES_File_Type != "video" && (
                    <View style={styles.replyView}>
                    <Filebubble 
                        key={99}
                        disableTouch={true}
                        item={this.state.replyMsgItem} 
                        direction={'left'} 
                        fileStyle={styles.fileStyle}
                        messageStyle={{minWidth:200,minHeight:90}}
                        //onImgClicked={() => {this.onImgClicked()}}
                        //deleteClicked={(data) => {this.deleteClicked(data)}}
                        receiverBubbleColor={'#cfe7ff'}
                        senderBubbleColor={'#005fbb'}
                        todayDate={this.state.replyMsgItem.TMESSAGES_Created_On}
                        isToday={this.state.replyMsgItem.TMESSAGES_Record_Today_First_message}
                        dateView={styles.dateView}
                        dateStyle={styles.dateStyle}
                        imgUri={this.state.replyMsgItem.TMESSAGES_Content} 
                        imageStyle={[styles.imgBubble,{minHeight:50,minWidth:200}]}
                        time={this.state.replyMsgItem.TMESSAGES_Created_On} 
                        timeStyle={{fontSize:10,color:"gray"}} 
                        //readStatus={this.state.replyMsgItem.TMESSAGES_Read_Status}
                    />
                    <TouchableOpacity 
                    style={{height:50,width:50,alignSelf:"flex-start"}}
                    onPress={() => {this.setState({isReply:false,replyMsgItem:""})}}
                  >
                    <Text style={[styles.dateStyle,{color:"rgb(80,80,80)"}]}>Cancel</Text>
                  </TouchableOpacity>
                  </View>
                  )}
                 
                  
                  <InputBar 
                      attachmentPressed={()=>{this.setState({visibleAttachModal: true})}}
                      smileyPressed={()=>{this.setState({is_gif_modal_visible: true, query: ""})}}
                      onSendPressed={() => this.sendParamConstruct()} 
                      onSizeChange={() => this._onInputSizeChange()}
                      type={this.state.selectedImage.uri}
                      selectedImage={this.state.imageData}
                      onChangeText={(text) => this._onChangeInputBarText(text)}
                      text={this.state.inputBarText}
                      galleryClicked={() => this.chooseImageFromGallery()}
                      cameraClicked={() => this.chooseImageFromCamera()}
                      docClicked={() => this.chooseFileFromDocuments()}
                      containerStyle={[styles.inputBar,{marginTop:this.state.isReply ? 20 : 20}]} //required
                      textInputStyle={styles.textBox} //required
                      sendBtnStyle={styles.sendButton} //required
                      />
                       <Modall
                          isVisible={this.state.visibleModal}
                          onSwipeComplete={() => this.setState({ visibleModal: null })}
                          swipeDirection={['up', 'down']}
                          style={styles.bottomModal}
                          animationInTiming={1000}
                          animationOutTiming={1000}
                          backdropTransitionInTiming={800}
                          backdropTransitionOutTiming={800}
                          onBackdropPress={() => this.setState({ visibleModal: null })}
                        >
                          {this.state.isDelete ? (
                            this.renderModalContent()
                          ):(
                            this.renderForwardModalContent()
                          )}
                        </Modall>
                        <AttachmentModal
                          isVisible={this.state.visibleAttachModal}
                          onSwipeComplete={() => {
                            setTimeout(() => {
                              this.setState({ visibleAttachModal: null })
                            }, 100);
                          }}
                          swipeDirection={['up', 'down']}
                          style={styles.bottomModal}
                          animationInTiming={1000}
                          animationOutTiming={1000}
                          backdropTransitionInTiming={800}
                          backdropTransitionOutTiming={800}
                          onModalHide={() => {
                            if(this.state.attachmentChosen == "Camera"){
                              this.chooseImageFromCamera()
                            }else if(this.state.attachmentChosen == "Gallery"){
                              this.chooseImageFromGallery()
                            }else if(this.state.attachmentChosen == "Documents"){
                              console.log("HIDED MODAL")
                              setTimeout(() => {
                                this.chooseFileFromDocuments()
                              },100)
                            }
                          }}
                          onBackdropPress={() => {
                            setTimeout(() => {
                              this.setState({ visibleAttachModal: null })
                            }, 100);
                          }}
                        >
                          {this.renderAttachModalContent()}
                        </AttachmentModal>
                        <GifModal
                          isVisible={this.state.is_gif_modal_visible}
                          //onSwipeComplete={() => this.setState({ is_gif_modal_visible: null })}
                          //swipeDirection={['up', 'down']}
                          style={styles.bottomModal}
                          animationInTiming={1000}
                          animationOutTiming={1000}
                          backdropTransitionInTiming={800}
                          backdropTransitionOutTiming={800}
                          onBackdropPress={() => this.setState({ is_gif_modal_visible: null })}
                        >
                          {this.renderGifModal()}
                        </GifModal>

                        <MoreModal
                          isVisible={this.state.visibleMoreModal}
                          onSwipeComplete={() => {
                            setTimeout(() => {
                              this.setState({ visibleMoreModal: null })
                            }, 100);
                          }}
                          swipeDirection={['up', 'down']}
                          style={styles.bottomModal}
                          animationInTiming={1000}
                          animationOutTiming={1000}
                          backdropTransitionInTiming={800}
                          backdropTransitionOutTiming={800}
                          onModalHide={() => {
                            
                          }}
                          onBackdropPress={() => {
                            setTimeout(() => {
                              this.setState({ visibleMoreModal: null })
                            }, 100);
                          }}
                        >
                          {this.renderMoreModalContent()}
                        </MoreModal>
                        <Modal style={{flexDirection:"column",backgroundColor:"black"}} visible={this.state.isClickedImage} transparent={true}>
                          <TouchableOpacity style={{height:40,weight:40,backgroundColor:"black"}} onPress={()=>{this.setState({isClickedImage:false})}}>
                          <AntDesign name={"close"}  style={{alignSelf:"flex-end",marginTop:15}} size={40} color={"white"}/>
                          </TouchableOpacity>
                          <ImageViewer imageUrls={[{url:this.state.clickedImage}]}>
                          </ImageViewer>
                        </Modal>
                        </View>
                        {Platform.OS == 'ios' && <KeyboardSpacer />}
              </SafeAreaView>
            );
  }
}



//TODO: separate these out. This is what happens when you're in a hurry!
const styles = StyleSheet.create({

  //ChatView
  outer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white'
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  headerBg:{
    backgroundColor:"#4291E2",
    height: 55,
    width:"100%",
    justifyContent:"space-between",
    flexDirection:"row"
    //alignItems:"center"
  },
  imgBubble:{
    flex:1,
    minHeight:150,
    minWidth:150,
    backgroundColor:"transparent",
    borderRadius:20,
  },
  headerText:{
      color:"white",
      fontWeight:'bold',
      fontSize:18,
      alignSelf:"center",
      marginLeft:10
  },
  onlineText:{
    fontSize:12,
    fontWeight:"bold",
    //backgroundColor:"red",
    color:"white",
    textAlign:"left",
    //width:60,
    marginLeft:10
  },
  messages: {
    flex: 1
  },
  modalContent:{
    minHeight: 160,
    borderTopLeftRadius:15,
    borderTopRightRadius:15,
    flexDirection:"column",
    justifyContent:"center",
    backgroundColor:"white"
  },
  divider:{
    backgroundColor:"#E1E1E1",
    height:1,
    width:"100%",
    alignSelf:"center"
  },
  //InputBar
  inputBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 3,
    paddingTop:5,
    marginTop:20,
    backgroundColor:"white",
    alignSelf:"flex-end",
    borderTopWidth:1,
    borderTopColor:"gray"
  },

  textBox: {
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'gray',
    flex: 1,
    width:"90%",
    marginLeft:2,
    marginRight:2,
    fontSize: 16,
    paddingHorizontal: 10,
    marginTop:-2,
    marginBottom:12
  },

  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    marginLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    height: 40,
    width: 40,
    marginTop:-3,
  },
  activityContainer: {
    height:100,
    width:100,
    justifyContent: 'center',
    alignSelf:"center"
  },
  dateView:{
    flex:1,
    minWidth:"30%",
    alignSelf:"center",
    height:21,
    margin:10,
    padding:5,
    borderRadius:5,
    backgroundColor:"#f0f0F1"
  },
  dateStyle:{
    fontSize: 10,
    fontWeight:"bold",
    textAlign:"center",
    color:"black",
    alignSelf:"center",
  },
  modal_body: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10
  },
  modal_close_container: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 10
  },
  modal_close_text: {
    color: '#0366d6'
  },
  fileStyle:{
    fontSize: 14,
    fontWeight:"bold",
    textAlign:"center",
    color:"black",
    alignSelf:"center",
    marginTop:10
  },
  replyView:{
    flex:1,
    minHeight:120,
    alignSelf:"center",
    flexDirection:"row",
    width:"90%",
    padding:10,
    justifyContent:"space-between",
    borderColor:"gray",
    borderWidth:1,
    borderRadius:10,
    width:"98%",
    //backgroundColor:"rgb(234,234,234)"
  }
})

const mapStateToProps = state => {
    const { loginId } = state.LoginReducer
  
    return {
      loginId,
    }
  }
  
  export default connect(
    mapStateToProps
  )(ChatRoom)



