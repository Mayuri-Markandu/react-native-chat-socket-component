import React,{Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Keyboard,
  StatusBar,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  NativeModules, Button
} from 'react-native';
import io from 'socket.io-client';
import OfflineNotice from "Components/OfflineNotice/OfflineNotice";
import Ionicons from "react-native-vector-icons/Ionicons"
import ChatSocket from "Components/ChatSocket/ChatSocket";
import {chatLogs,exportChat,clearChat,muteChat,archiveSingleChat,deleteRoom} from "Components/ChatSocket/ChatSocketApi";
import { Avatar } from 'react-native-paper';
import { connect } from 'react-redux'
import { FAB } from 'react-native-paper';
import {kChatGlobalURL} from '../../lib/networking/ApiConstants'
import FontAwesome from "react-native-vector-icons/FontAwesome"
import TypingAnimation  from "Components/TypingIndicator/TypingAnimation";
import utils from "../../Utils/utils";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import EvilIcons from "react-native-vector-icons/EvilIcons"
import { SwipeListView } from 'react-native-swipe-list-view';
import Modal from "react-native-modal";
import { NavigationEvents } from 'react-navigation';
import Share from 'react-native-share';
import { Snackbar } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import moment from 'moment';
import DBInterface from "../../DBInterface/DBInterface";
import NetInfo from "@react-native-community/netinfo";
import Reactotron from "reactotron-react-native"
import AsyncStorage from '@react-native-community/async-storage';
import { userId } from '../../actions/Login/LoginAction'

let receiveData = ""

class ChatLog extends React.Component{  

    /** constructor */
    constructor(props) {  
        super(props);
        this.state = { 
          chatslogs:[],
          load:false,
          limit:20,
          isTyping:false,
          typingUserId: "",
          visibleModal:false,
          exportURL:"",
          snackBarMsg:"",
          selectedLog:"",
          snackVisible:false,
          scrollDirection:"",
          archiveCount:0,
          searchText:"",
          connection_Status: ""
        };
        this.pageNumber = 1
        this.userTypingResponseFromSocketLog = this.userTypingResponseFromSocketLog.bind(this);
        this.receivedMsgFromOtheruserToLogs = this.receivedMsgFromOtheruserToLogs.bind(this);
        this.openRowRefs = [];
    }

    /** Component Cycle */
    async componentDidMount() {
        //Internet Connection
        const userIDD = await AsyncStorage.getItem('user-id')
        console.log("USERID",userIDD)
        this.props.userId(userIDD)
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);

        NetInfo.isConnected.fetch().done((isConnected) => {
         console.log("CONNECTION STATUS DID MOUNT",isConnected)
          if (isConnected == true) {
            this.setState({ connection_Status: "Online" })
            this.refresh()
          }
          else {
            this.setState({ connection_Status: "Offline" })
            this.setState({
               // chatslogs: DBInterface.getChatLogs()
            },()=>{
                console.log("offline chatlogs",DBInterface.getChatLogs(), this.state.chatslogs)
            })
          }
        });
    }

    componentWillUnmount() {
        //NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }

     handleConnectivityChange = (isConnected) => {
        console.log("CONNECTION STATUS",isConnected)
        if (isConnected == true) {
          this.setState({ connection_Status: "Online" })
          this.setState({
                load:true,
                chatslogs:[]
            })
            this.chatLogsApiHit(this.pageNumber)
        }
        else {
          this.setState({ connection_Status: "Offline" })
          this.importDBData()
        }
      };

    async importDBData() {
        let logsDataFromDB = await DBInterface.getChatLogs(this.props.loginId)
        let unarchived = new Array()
        for (let i = 0; i < logsDataFromDB.length; i++) {
            const element = logsDataFromDB[i];
            if(element.TChat_Log_IS_Archive == 0){
                unarchived.push(element)
            }else{
                this.setState({
                    archiveCount: this.state.archiveCount + 1
                })
            }
        }
        this.setState({
            chatslogs: unarchived
        })
        console.log("offline chatlogs",DBInterface.getChatLogs(), this.state.chatslogs)
    }

    /** ChatLogs */
    chatLogsApiHit = (page) => {
        chatLogs(this.state.limit,page,this.props.loginId,() => {
            },(response) => {
            console.log("CHATLOGS",response)
            this.setState({
                load:false
            })
            if(response.data.statusCode == 200){
                let dataArray = response.data.data
                DBInterface.insertLogData(dataArray)
                let unarchived = new Array()
                for (let i = 0; i < dataArray.length; i++) {
                    const element = dataArray[i];
                    if(element.TChat_Log_IS_Archive == 0){
                        unarchived.push(element)
                    }else{
                        this.setState({
                            archiveCount: this.state.archiveCount + 1
                        })
                    }
                }
                this.setState({
                    chatslogs: unarchived
                })
            }
        })
    }

    /** Message Received */
    receivedMsgFromOtheruserToLogs(data) {
        if(receiveData != data){
            receiveData = data
            this.chatLogsApiHit(this.pageNumber)
        }
    }

    /** Export Chat */
    exportingChat = (roomId) => {
        exportChat(this.props.loginId,roomId,() => {},(responseData) => {
            if(responseData.data.statusCode == 200){
                this.setState({
                    exportURL:responseData.data.URL,
                },() => {this.onShare()})
            }
        })
    }
    
    /** Clear Chat */
    clearingChat = (roomId) => {
        this.setState({
            visibleModal:false
        })
        clearChat(this.props.loginId,roomId,() => {this.setState({
            load:true
        })},(responseData) => {
            this.setState({
                load:false
            })
            if(responseData.data.statusCode == 200){
                this.setState({
                    snackVisible:true,
                    snackBarMsg:"Chat cleared successfully"
                })
                DBInterface.deleteSingleLogData(roomId)
            }
        })
    }

    /** Archive chat */
    archivingchat = (roomId,index) => {
        archiveSingleChat(this.props.loginId,roomId,1,() => {this.setState({
            load:true
        })},(responseData) => {
            this.setState({
                load:false,
            })
            if(responseData.status == 200){
                let arr1 = this.state.chatslogs
                arr1[index].TChat_Log_IS_Archive = 1
                arr1.splice(index,1)
                this.setState({
                    chatLogs:arr1,
                    archiveCount:this.state.archiveCount + 1
                })
                let archiveitem = this.state.selectedLog
                archiveitem.TChat_Log_IS_Archive = 1
                console.log("BEFORE UPDATING",archiveitem)
                DBInterface.UpdateSingleLogData(roomId,archiveitem)
            }
        })
    }

    /** Deleting Room */
    deletingRoom = (roomId,index) => {
        this.setState({
            visibleModal:false
        })
        deleteRoom(this.props.loginId,roomId,() => {this.setState({
            load:true
        })},(responseData) => {
            this.setState({
                load:false,
            })
            if(responseData.status == 200){
                let arr1 = this.state.chatslogs
                arr1.splice(index,1)
                this.setState({
                    chatLogs:arr1,
                    snackVisible:true,
                    snackBarMsg:"Chat deleted successfully"
                })
                DBInterface.deleteSingleLogData(roomId)
            }
        })
    }

    /** Muting and Unmuting Chat */
    mutingchat = (roomId,ismute,index) => {
        this.setState({
            visibleModal:false
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
                    snackBarMsg:"Chat muted successfully"
                })
                let arr1 = this.state.selectedLog
                console.log("BEFORE MUTING",arr1)
                arr1.TChat_Log_Is_Mute = ismute
                console.log("BEFORE MUTING",arr1)
                this.chatLogsApiHit(this.pageNumber)
                setTimeout(() => {
                    DBInterface.UpdateSingleLogData(roomId,arr1)
                }, 200);
            }
        })
    }

    /** user typing response */
  userTypingResponseFromSocketLog(data) {
    console.log("LOG TYPING",data.isTyping,this.state.isTyping, this.state.typingUserId)
    if(data.userId != this.props.loginId ){
      if(this.state.isTyping != data.isTyping){
        this.setState({
          isTyping:data.isTyping,
          typingUserId:data.roomId
        })
        let dataDict = {
          isTyping: data.isTyping
        }
        if(data.isTyping == false){
          //let lastIndex = this.state.messages.length
          this.setState({
              typingUserId:"",
              isTyping:false
          })
          this.chatLogsApiHit(this.pageNumber)
        }else{

        }
      }
    }
  }

  refresh = () => {
    console.log("REFRESH CALLED", this.state.connection_Status)
    if(this.state.connection_Status == "Online"){
        this.setState({
            load:true,
            chatslogs:[]
        })
        this.chatLogsApiHit(this.pageNumber)
    }else{
        this.setState({
            load:false,
            chatslogs:[]
        },() => {
            this.importDBData()
        })
    }
  }

  //More features
  onShare = async () => {
      this.setState({
          visibleModal:false
      })
    const shareOptions = {
        title: 'Export chat',
        failOnCancel: false,
        url: this.state.exportURL,
      };
  
      // If you want, you can use a try catch, to parse
      // the share response. If the user cancels, etc.
      try {
        const ShareResponse = await Share.open(shareOptions);
        this.setState({
            snackVisible:true,
            snackBarMsg:"Your chat has been exported successfully"
        })
      } catch (error) {
        console.log('Error =>', error);
      }
  };

 


  //RENDER MODAL
  renderModalContent = () => (
    <View style={styles.modalContent}>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{
          if(this.state.selectedLog.TChat_Log_Is_Mute == 0){
            this.mutingchat(this.state.selectedLog.TChat_Log_Chat_Room_ID,1)
          }else{
            this.mutingchat(this.state.selectedLog.TChat_Log_Chat_Room_ID,0)
          }
      }}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:10,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}>Mute</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.exportingChat(this.state.selectedLog.TChat_Log_Chat_Room_ID)}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:10,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}>Export Chat</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.clearingChat(this.state.selectedLog.TChat_Log_Chat_Room_ID)}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:10,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}>Clear Chat</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{this.deletingRoom(this.state.selectedLog.TChat_Log_Chat_Room_ID)}}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:10,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}>Delete</Text>
      </TouchableOpacity>
      <View style={styles.divider}/>
      <TouchableOpacity style={{flex:1,height:40}} onPress={()=>{
        this.setState({
          visibleModal:null
        })
      }}>
        <Text style={{fontSize:17,color:"#1679F4",paddingTop:10,fontWeight:'bold',height:40,textAlign:"center",width:"90%",alignSelf:"center"}}> Cancel</Text>
      </TouchableOpacity>
    </View>
  )

    /** Render logs */
    renderlogs(item,index) {
        let name = item.DC_FIRST_NAME+ " " +item.DC_LAST_NAME
        console.log("TYPING IN RENDER",this.state.isTyping && this.state.typingUserId == item.TChat_Log_Chat_Room_ID)
        //2020-02-12T12:22:46.000Z
        var localText = moment(item.TChat_Log_Updated_On).format("MMM DD")
        // var localDate = gmtDateTime.local().format("MMM d");
        // var offset = moment().utcOffset();
        // var localText = moment.utc(item.TChat_Log_Updated_On).utcOffset(offset).format("MMM d");
        return(
            <View style={{flex:1}}>
            <TouchableOpacity
            activeOpacity={1.0}
            style={styles.viewLog}
            onPress={() => {
                let receiver = item.HCHAT_ROOM_Name.split('&')
                console.log("Log nviagtion",item.TChat_Log_Chat_Room_ID,receiver,receiver[receiver.length - 1])
                let userStatusParam = {
                    //"status":"Online",
                    "active": false, 
                    "userId":this.props.loginId,
                    "lastSeen":(new Date())
                   }
                this.chatSocket.updateUserStatus(userStatusParam,(data)=>{
                })
                this.props.navigation.navigate("ChatRoom",{
                    "chat_roomId": item.TChat_Log_Chat_Room_ID,
                    "chat_roomName": item.HCHAT_ROOM_Name,
                    "receiverId": item.DN_ID,
                    "name":name,
                    "archive":item.TChat_Log_IS_Archive,
                    "mute":item.TChat_Log_Is_Mute,
                    "userImage":item.DC_USER_IMAGE,
                     onGoBack: () =>  this.refresh(),
                    "from":"ChatLog"
                })
            }}>
            <View style={styles.outerViewAlign}>
                <View style={styles.avatar}>
                    <Image style={{height:50,width:50,borderRadius:25,backgroundColor:"gray"}} source={item.DC_USER_IMAGE == null ? require('Components/ChatSocket/assets/user.png') : {uri:item.DC_USER_IMAGE}} />
                </View>
                <View style={styles.innerView}>
                    <Text style={{fontSize:17,color: item.Unread_msg_count != 0 && item.TMESSAGES_UID != this.props.loginId ? "black" : "rgb(80,80,80)",margin:2,fontWeight: 'bold'}}>{utils.capitalizeEachWord(name)}</Text>
                    {this.state.isTyping && this.state.typingUserId == item.TChat_Log_Chat_Room_ID && (
                         <TypingAnimation
                            style={{height:20,width:50,marginLeft:5, marginTop:20}}
                            dotColor="#00004d"
                            dotMargin={6}
                            dotAmplitude={3}
                            dotSpeed={0.30}
                            dotRadius={4}
                            dotX={12}
                            dotY={6}
                       />
                    )}
                    {item.TMESSAGES_File_Type == "text" && this.state.typingUserId != item.TChat_Log_Chat_Room_ID && (
                        <Text numberOfLines={1} style={{marginRight:5,fontSize:13,flex:1,margin:2,fontWeight: item.Unread_msg_count != 0 && item.TMESSAGES_UID != this.props.loginId ? 'bold' : 'normal'}}>{item.TMESSAGES_Content}</Text>
                    )}
                    {item.TMESSAGES_File_Type == "image" && this.state.typingUserId != item.TChat_Log_Chat_Room_ID && (
                        <FontAwesome name="photo" style={{marginLeft:5}} size={20} color="gray" light/>
                    )}
                    {item.TMESSAGES_File_Type == "video" && this.state.typingUserId != item.TChat_Log_Chat_Room_ID && (
                        <Entypo name="video" style={{marginLeft:5}} size={20} color="gray" light/>
                    )}
                    {item.TMESSAGES_File_Type != "video" && item.TMESSAGES_File_Type != "text" && item.TMESSAGES_File_Type != "image" && this.state.typingUserId != item.TChat_Log_Chat_Room_ID && (
                        <MaterialCommunityIcons name="file-document" style={{marginLeft:5}} size={20} color="gray" light/>
                    )}
                </View>
                <Text style={{color:"gray",fontSize:12,marginTop:5}}>{localText}</Text>
                {item.TChat_Log_Is_Mute == 1 && (
                    <TouchableOpacity style={{height:30,alignSelf:"flex-end",width:50,zIndex:999,justifyContent:"center",alignItems:"center"}} onPress={()=>{
                        this.setState({
                            selectedLog:item
                        },() => {
                            this.mutingchat(item.TChat_Log_Chat_Room_ID,0)
                        })
                    }}>
                        <FontAwesome5 name="volume-mute" size={18} color={"rgb(80,80,80)"}/>
                    </TouchableOpacity>
                )}
              </View>
              
              {item.Unread_msg_count != 0 && item.TMESSAGES_UID != this.props.loginId && (
                <View style={styles.count}>
                  <Text style={{color:"white",fontWeight:"bold"}}>{item.Unread_msg_count}</Text>
                </View>
                )}  
              {/* {item.Unread_msg_count != 0 && item.TMESSAGES_UID == this.props.loginId && (
                <View style={[styles.count,{marginTop:10,right:15,backgroundColor:"white"}]}>
                <Ionicons name="md-arrow-dropright" size={25} color={"rgb(80,80,80)"}/>
                </View>              
                )}
              {item.Unread_msg_count == 0 && (
                <View style={[styles.count,{marginTop:10,right:15,backgroundColor:"white"}]}>
                <Ionicons name="md-arrow-dropright" size={25} color={"rgb(80,80,80)"}/>
                </View>               
             )} */}
            
                
            </TouchableOpacity>
            <View style={styles.divider}/>
            
            </View>         
        )
    }

    onRowDidOpen = (rowKey, rowMap) => {
        //this.openRowRefs = []
        this.openRowRefs.push(rowMap[rowKey]);
        //console.log(this.openRowRefs)
      }
    
      closeAllOpenRows = () => {
        this.openRowRefs.forEach(ref => {
            ref.closeRow && ref.closeRow();
        });
      }

      onScroll = (event) => {
        var currentOffset = event.nativeEvent.contentOffset.y;
        var direction = currentOffset > this.offset ? 'down' : 'up';
        this.offset = currentOffset;
        console.log("OFFSET",currentOffset,this.offset)
        if(currentOffset >= 10){
            console.log("DIRECTION",direction);
            this.setState({
                scrollDirection:"UP"
            })
        }else{
            this.setState({
                scrollDirection:direction
            })
        }
      }

      //SEARCH UPDATE
      updateSearch = (txt) => {
        this.setState({
            searchText:txt
        })
      }

    /** Rendering */
    render() {
        return (
            <SafeAreaView style={styles.container}>
            <View style={styles.headerBg}>
            <TouchableOpacity style={{height:40,width:80,marginLeft:15,justifyContent:"center"}} onPress={()=>{
                 let userStatusParam = {
                  "roomId" : this.state.roomId, 
                  "userId":this.props.loginId ,
                  "active" :false
                 }
                 console.log("UPDATE PARAM",userStatusParam)
                 this.chatSocket.updateUserStatus(userStatusParam,(data) => {

                 })
                 let logOutParam = {
                    userId:this.props.loginId
                 }
                 this.chatSocket.disconnectOnTermination(logOutParam)
                 AsyncStorage.removeItem("access_token")
                 this.props.navigation.navigate("UnRegisteredRoot")
               }}>
                 <Entypo color={"white"} size={25} name={"log-out"}/>
               </TouchableOpacity>
             <Text style={styles.headerText}>Message</Text>
             <View style={{flexDirection:"row"}}>
                <TouchableOpacity style={{height:40,width:40,justifyContent:"center",alignItems:"center"}} onPress={()=>{
                        this.props.navigation.navigate("Users",{
                            onGoBack: () =>  this.refresh(),
                            "from":"ChatLog"
                        })
                }}>
                    <AntDesign color={"white"} size={25} name={"plus"}/>
                </TouchableOpacity>
                <TouchableOpacity style={{height:40,width:40,justifyContent:"center",alignItems:"center"}} onPress={()=>{
                        
                }}>
                    <AntDesign color={"white"} size={25} name={"filter"}/>
                </TouchableOpacity>
            </View>
            </View>
            <ScrollView onScroll={(e) => this.onScroll(e)} contentContainerStyle={{flexGrow:1}}>
            <NavigationEvents
                onDidFocus={() => {
                    this.refresh()
                }}
            />
            <Snackbar
             duration={5000}
             style={{backgroundColor:"gray",marginBottom:50,opacity:10,color:"red"}}
             visible={this.state.snackVisible}
             onDismiss={() => this.setState({ snackVisible: false })}
            >
                {this.state.snackBarMsg}
            </Snackbar>
            
            {this.state.load && (
                <View style={[styles.activityContainer, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#FA1100" />
                </View>
            )}
            {this.state.load == false && (
                <View style={styles.searchView}>
                    <AntDesign color="#696A6C" size={25} name={"search1"} style={{alignSelf:"center"}}/>
                    <TextInput 
                        placeholder="Search" 
                        placeholderTextColor="#696A6C" 
                        style={styles.searchBar} 
                        onChangeText={(text) => {this.updateSearch(text)}}
                        value={this.state.searchText}
                        />
                </View>
            )}
            
            {this.state.chatslogs.length == 0 && this.state.load == false ? (
                <Text style={{fontSize:15,fontWeight:'bold',marginTop:50,alignSelf:"center",color:"#00004d"}}>No Logs found</Text>
            ) : 
                <SwipeListView
                    useFlatList={true}
                    // closeOnScroll={true}
                    // closeOnRowBeginSwipe={true}
                    // closeOnRowPress={true}
                    onRowDidOpen={this.onRowDidOpen}
                    data={this.state.chatslogs}
                    renderItem={ ({item,index}) => (
                        this.renderlogs(item,index)
                    )}
                    renderHiddenItem={ ({item,index}) => (
                        <View style={{flexDirection:"row",alignSelf:"flex-end"}}>
                            <TouchableOpacity style={{height:40,width:25,alignItems:"center",alignSelf:"center",justifyContent:"center",marginTop:20}} onPress={() => {   
                                this.closeAllOpenRows()
                                this.setState({
                                    //visibleModal:true,
                                    selectedLog:item
                                },() => {
                                    if(item.TChat_Log_Is_Mute == 0){
                                        this.mutingchat(item.TChat_Log_Chat_Room_ID,1)
                                      }else{
                                        this.mutingchat(item.TChat_Log_Chat_Room_ID,0)
                                      }
                                })
                            }}>
                                <FontAwesome5 name={item.TChat_Log_Is_Mute == 0 ? "volume-off" : "volume-mute"} size={22} color={"#696A6C"}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={{height:40,width:25,alignItems:"center",alignSelf:"flex-end",justifyContent:"center",marginTop:20}} onPress={() => {   
                                this.closeAllOpenRows()
                                this.setState({
                                    selectedLog:item
                                },()=>{this.archivingchat(item.TChat_Log_Chat_Room_ID,index)})
                            }}>
                                <EvilIcons name="archive" size={22} color={"#696A6C"}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={{height:40,width:25,marginRight:30,alignItems:"center",alignSelf:"flex-end",justifyContent:"center",marginTop:20}} onPress={() => {   
                                this.closeAllOpenRows()
                                this.setState({
                                    selectedLog:item
                                },()=>{this.deletingRoom(item.TChat_Log_Chat_Room_ID,index)})
                            }}>
                                <AntDesign name="delete" size={18} color={"#696A6C"}/>
                            </TouchableOpacity>
                        </View>
                    )}
                    leftOpenValue={0}
                    rightOpenValue={-150}
                    onRowOpen={(rowKey, rowMap) => {
                        setTimeout(() => {
                          rowMap[rowKey] && rowMap[rowKey].closeRow()
                        }, 2000)
                      }}
                    keyExtractor={(item, index) => index.toString()}
                />
            }
            {this.state.scrollDirection != "UP" && this.state.chatslogs.length != 0 && (
                <TouchableOpacity style={styles.archiveChat} onPress={()=>{
                    this.props.navigation.navigate("ArchiveChats")
                }}>
                    <Text style={{fontSize:14,color:"#1679F4",fontWeight:"bold"}}>Archived Messages</Text>
                </TouchableOpacity>
            )}
            </ScrollView>            
            <ChatSocket
                ref={(refs) => { this.chatSocket = refs }} 
                SERVER_URL={kChatGlobalURL}
                receivedMsgFromLog={(data)=>{this.receivedMsgFromOtheruserToLogs(data)}}
                //userTypingMethod={(data) => {this.userTypingResponseFromSocketLog(data)}}
                userTypingMethodFromLog={(data) => {this.userTypingResponseFromSocketLog(data)}}
            />
                     <Modal
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
                           {this.renderModalContent()}
                        </Modal>

            {/* <FAB
            style={styles.fab}
            color={"white"}
            large
            icon="add"
            onPress={() => {
                
            }} 
        /> */}
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: 'white'
    },
    headerBg:{
        backgroundColor:"#4291E2",
        height: 50,
        width:"100%",
        justifyContent:"space-between",
        alignItems:"center",
        flexDirection:"row"
    },
    headerText:{
        color:"white",
        fontWeight:'bold',
        fontSize:18,
        marginLeft:-10
    },
    divider:{
        backgroundColor:"#E1E1E1",
        height:1,
        width:"100%",
        alignSelf:"center"
      },
    avatar:{
        backgroundColor:"#d3d3d3",
        height:50,
        width:50,
        borderRadius:25,
        justifyContent:"center",
        alignItems:"center"
    },
    online:{
        height:10,
        width:10,
        marginTop:5,
        borderRadius:7.5,
        backgroundColor:"#32CD32"
    },
    fab: {
        position: 'absolute',
        width:50,
        height:50,
        justifyContent:"center",
        alignItems:"center",
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: "#CC4D00"
    },
    offline:{
        height:10,
        width:10,
        marginTop:5,
        borderRadius:7.5,
        backgroundColor:"#d3d3d3" 
    },
    innerView:{
        flexDirection:"column",
        marginLeft:10,
        backgroundColor:"white",
        flex:1,
    },
    archiveChat:{
        height:50,
        width:"100%",
        borderWidth:1,
        padding:10,
        borderColor:"rgb(234,234,234)"
    },
    count:{
        marginTop:20,
        height:25,
        right:30,
        width:25,
        marginRight:30,
        backgroundColor:"#4291E2",
        borderRadius:12.5,
        justifyContent:"center",
        alignItems:"center"
    },
    outerViewAlign:{
        flexDirection:"row",
        marginRight:10,
        paddingLeft:15,
        backgroundColor:"white",
        alignSelf:"center",
    },
    activityContainer: {
    height:100,
    width:100,
    justifyContent: 'center',
    alignSelf:"center"
  },
    viewLog:{
        flexDirection:"row",
        flex:1,
        width:"100%",
        backgroundColor:"white",
        alignSelf:"center",
        //justifyContent:"center",
        margin: 5,
        padding:10,
       // backgroundColor:"white"
    },
 activityContainer: {
    height:100,
    width:100,
    justifyContent: 'center',
    alignSelf:"center"
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent:{
    minHeight: 200,
    flexDirection:"column",
    justifyContent:"center",
    backgroundColor:"white"
  },
  searchView:{
      height:55,
      backgroundColor:"white",
      flexDirection:"row",
      paddingLeft:30,
      borderBottomColor:"#696A6C",
      borderBottomWidth:0.3
  },
  searchBar:{
      fontSize:16,
      paddingLeft:10,
      color:"#696A6C"
  }
})

const mapStateToProps = state => {
    const { loginId } = state.LoginReducer
  
    return {
      loginId,
    }
}
  
export default connect(
    mapStateToProps,{
        userId
    }
)(ChatLog)