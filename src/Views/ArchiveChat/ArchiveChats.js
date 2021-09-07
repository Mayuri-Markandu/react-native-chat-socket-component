import React,{Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Keyboard,
  StatusBar,
  TouchableHighlight,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  NativeModules, Button
} from 'react-native';
import io from 'socket.io-client';
import OfflineNotice from "Components/OfflineNotice/OfflineNotice";
import ChatSocket from "Components/ChatSocket/ChatSocket";
import {archiveLists,archiveSingleChat} from "Components/ChatSocket/ChatSocketApi";
import { Avatar } from 'react-native-paper';
import { connect } from 'react-redux'
import { FAB } from 'react-native-paper';
import {kChatGlobalURL} from '../../lib/networking/ApiConstants'
import Ionicons from "react-native-vector-icons/Ionicons"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import TypingAnimation  from "Components/TypingIndicator/TypingAnimation";
import utils from "../../Utils/utils";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SwipeListView } from 'react-native-swipe-list-view';
import Modal from "react-native-modal";
import { NavigationEvents } from 'react-navigation';
import Share from 'react-native-share';
import { Snackbar } from 'react-native-paper';
import DBInterface from "../../DBInterface/DBInterface";

class ArchiveChat extends React.Component{  

    /** constructor */
    constructor(props) {  
        super(props);
        this.state = { 
          archivelogs:[],
          load:false,
        };
    }

    /** Component Cycle */
    componentDidMount() {
        this.setState({
            load:true,
            archivelogs:[]
        })
        this.archivesApiHit(this.pageNumber)
    }

    /** ChatLogs */
    archivesApiHit = (page) => {
        archiveLists(this.props.loginId,() => {
            },(response) => {
            this.setState({
                load:false
            })
            if(response.data.statusCode == 200){
                let dataArray = response.data.data
                this.setState({
                    archivelogs: dataArray
                })
            }
        })
    }

     /** Archive chat */
     archivingchat = (roomId,index,item) => {
        archiveSingleChat(this.props.loginId,roomId,0,() => {this.setState({
            load:true
        })},(responseData) => {
            let arr1 = this.state.archivelogs
            arr1.splice(index,1)
            this.setState({
                load:false,
                archivelogs:arr1,
            })
            if(responseData.status == 200){
                // let archiveitem = item
                // archiveitem.TChat_Log_IS_Archive = 0
                // console.log("BEFORE UPDATING",archiveitem)
                // DBInterface.UpdateSingleLogData(roomId,archiveitem)
            }
        })
    }

    /** RENDER ARCHIVES */
    renderArchives(item,index) {
        let name = item.receiverUser.DC_USERNAME
        return(
            <View>
            <TouchableOpacity
            activeOpacity={1.0}
            style={styles.viewLog}
            onPress={() => {
                let receiver = item.chatRoomLogs.HCHAT_ROOM_Name.split('&')
                let userStatusParam = {
                    "status":"Online",
                    "online": true, 
                    "userId":this.props.loginId,
                    "lastSeen":(new Date()).toUTCString
                   }
                this.chatSocket.updateUserStatus(userStatusParam,(data)=>{
                })
                this.props.navigation.navigate("ChatRoom",{
                    "chat_roomId": item.chatRoomLogs.HCHAT_ROOM_Chat_Room_ID,
                    "chat_roomName": item.chatRoomLogs.HCHAT_ROOM_Name,
                    "receiverId": receiver[receiver.length - 1],
                    "name":name,
                    "from":"ArchiveChats"
                })
            }}>
            <View style={styles.outerViewAlign}>
                <View style={styles.avatar}>
                    <Avatar.Image style={{backgroundColor:"#d3d3d3",resizeMode:"contain"}} size={50} source={item.receiverUser.DC_USER_IMAGE == null ? require('Components/ChatSocket/assets/user.png') : {uri:item.receiverUser.DC_USER_IMAGE}} />
                </View>
                <View style={styles.innerView}>
                     <Text style={{fontSize:15,color:"#00004d",margin:2,fontWeight: item.Unread_msg_count != 0 && item.senderUser.DN_ID != this.props.loginId ? 'bold' : 'normal'}}>{utils.capitalizeEachWord(name)}</Text>
                    {/* {item.TMESSAGES_File_Type == "text" && this.state.typingUserId != item.TChat_Log_Chat_Room_ID && (
                        <Text numberOfLines={1} style={{marginRight:5,fontSize:15,flex:1,margin:2,fontWeight: item.Unread_msg_count != 0 && item.senderUser.DN_ID != this.props.loginId ? 'bold' : 'normal'}}>{item.TMESSAGES_Content}</Text>
                    )}
                    {item.TMESSAGES_File_Type == "image" && this.state.typingUserId != item.TChat_Log_Chat_Room_ID && (
                        <FontAwesome name="photo" style={{marginLeft:5}} size={20} color="gray" light/>
                    )}
                    {item.TMESSAGES_File_Type == "video" && this.state.typingUserId != item.TChat_Log_Chat_Room_ID && (
                        <Entypo name="video" style={{marginLeft:5}} size={20} color="gray" light/>
                    )}
                    {item.TMESSAGES_File_Type != "video" && item.TMESSAGES_File_Type != "text" && item.TMESSAGES_File_Type != "image" && this.state.typingUserId != item.TChat_Log_Chat_Room_ID && (
                        <MaterialCommunityIcons name="file-document" style={{marginLeft:5}} size={20} color="gray" light/>
                    )}  */}
                </View>
              </View>
                 <TouchableOpacity style={styles.archiveBtn} onPress={()=>{
                     this.archivingchat(item.chatRoomLogs.HCHAT_ROOM_Chat_Room_ID,index,item)
                    }}>
                    <Text style={{fontSize:12,color:"rgb(80,80,80)",marginTop:5,fontWeight:"bold",alignSelf:"center"}}>Unarchive</Text>
                 </TouchableOpacity>
            </TouchableOpacity>
            <View style={styles.divider}/>
            </View>         
        )
    }

     /** Rendering */
     render() {
        return (
            <SafeAreaView style={styles.container}>
            <View style={styles.headerBg}>
            <TouchableOpacity style={{height:40,width:80,justifyContent:"center"}} onPress={()=>{
                 this.props.navigation.goBack()
               }}>
               <Ionicons color={"rgb(80,80,80)"} size={40} name={"md-arrow-dropleft"}/>
             </TouchableOpacity>
             <Text style={styles.headerText}>Archived Chats</Text>
             <View style={{height:10,width:50}}></View> 
            </View>
            <ScrollView onScroll={(e) => this.onScroll(e)} contentContainerStyle={{flexGrow:1}}>            
            {this.state.load && (
                <View style={[styles.activityContainer, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#FA1100" />
                </View>
            )}
            
            {this.state.archivelogs.length == 0 && this.state.load == false ? (
                <Text style={{fontSize:15,fontWeight:'bold',marginTop:50,alignSelf:"center",color:"#00004d"}}>No Archives found</Text>
            ) : 
                <FlatList
                    ref = "flatList"
                    onContentSizeChange={()=> this.refs.flatList.scrollToOffset({ animated: true, offset: 0 })}
                    data={this.state.archivelogs}
                    renderItem={({item, index}) => (this.renderArchives(item,index))}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingBottom:70,marginBottom:100}}
                />
            }
            </ScrollView>            
            <ChatSocket
                ref={(refs) => { this.chatSocket = refs }} 
                SERVER_URL={kChatGlobalURL}
                //userTypingMethod={(data) => {this.userTypingResponseFromSocketLog(data)}}
                userTypingMethodFromLog={(data) => {this.userTypingResponseFromSocketLog(data)}}
            />
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
        backgroundColor:"rgb(234,234,234)",
        height: 60,
        paddingLeft:20,
        width:"100%",
        justifyContent:"space-between",
        alignItems:"center",
        flexDirection:"row"
    },
    headerText:{
        color:"rgb(80,80,80)",
        fontWeight:'bold',
        fontSize:18,
        marginLeft:-30
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
        width:"50%"
    },
    archiveChat:{
        height:50,
        width:"100%",
        borderWidth:1,
        padding:10,
        borderColor:"rgb(234,234,234)"
    },
    count:{
        marginTop:10,
        height:25,
        width:25,
        marginRight:30,
        backgroundColor:"green",
        borderRadius:12.5,
        justifyContent:"center",
        alignItems:"center"
    },
    outerViewAlign:{
        flexDirection:"row",
        marginRight:10,
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
        //alignSelf:"center",
        justifyContent:"center",
        margin: 5,
        padding:10,
       // backgroundColor:"white"
    },
    archiveBtn:{
        height:30,
        width:80,
        alignSelf:"center",
        borderRadius:5,
        borderColor:"rgb(234,234,234)",
        borderWidth:2,
        zIndex:999
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
})

const mapStateToProps = state => {
    const { loginId } = state.LoginReducer
  
    return {
      loginId,
    }
}
  
export default connect(
    mapStateToProps
)(ArchiveChat)