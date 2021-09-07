
import React,{Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Keyboard,
  Image,
  StatusBar,
  TouchableHighlight,
  TouchableOpacity,
  NativeModules
} from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import  TypingAnimation  from "Components/TypingIndicator/TypingAnimation";
import utils from "../../Utils/utils"
import { Button, Paragraph, Menu, Divider, Provider } from 'react-native-paper';
import MessageBubble from 'Components/MessageBubble/MessageBubble';
import Imagebubble from 'Components/Imagebubble/Imagebubble'
import VideoBubble from "Components/VideoBubble/VideoBubble";
import Filebubble from "Components/Filebubble/Filebubble";
import Video from 'react-native-video';

export default class ReplyBubble extends React.PureComponent {
  
  state = {
    visible: false,
    onSelect: this.props.onSelect
  };


  _openMenu = () => this.setState({ visible: true });

  _closeMenu = () => this.setState({ visible: false });

  renderBubbles(reply) {
    var bubbleTextStyle = this.props.direction === 'left' ? {color:this.props.senderTextColor} : {color:this.props.receiverTextColor};
    var bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, {backgroundColor:this.props.senderBubbleColor}] : [styles.messageBubble, {backgroundColor:this.props.receiverBubbleColor}];

      let fileType = reply ? this.props.item.TMESSAGES_Reply_File_Type : this.props.item.TMESSAGES_File_Type
        if(fileType == "text"){
            return(
                <View style={reply ? styles.replyBubble : bubbleStyles}>
                    <Text style={bubbleTextStyle}>
                        {reply ? this.props.item.TMESSAGES_Reply_contand : this.props.text}
                    </Text>
                </View> 
            )
        }else if(fileType == "image"){
            return(
              <View style={reply ? styles.replyBubble : bubbleStyles}>
                <Image style={[this.props.imageStyle,{alignSelf:"center",marginTop:-5}]} source={{uri:reply ? this.props.imgUri : this.props.text}}/>
              </View>
            )
        }else if(fileType == "video"){
            return(
             <View style={reply ? styles.replyBubble : bubbleStyles}>
                <Video source={{uri: reply ? this.props.imgUri : this.props.text}}   // Can be a URL or a local file.
                   ref={(ref) => {
                       this.player = ref
                   }}  
                   paused={true}                                    // Store reference
                   //onBuffer={this.onBuffer}                // Callback when remote video is buffering
                   //onError={this.videoError}               // Callback when video cannot be loaded
                   style={[this.props.imageStyle,{alignSelf:"center",marginTop:-5}]} 
               />
             </View>
            )
        }else if(fileType != "text" && fileType != "image" && fileType != "video") {
            return(
             <View style={reply ? styles.replyBubble : bubbleStyles}>
                <View style={{backgroundColor:"rgba(167,212,255,0.7)",borderColor:"white",borderWidth:0.7,borderRadius:5,justifyContent:"center",minHeight:50, width:"95%",alignSelf:"center"}}>
                    <Text style={this.props.fileStyle}>{reply ? this.props.item.TMESSAGES_Reply_contand : this.props.item.TMESSAGES_File_Name}</Text>
                </View>
              </View>
            )
        }else{
            return null
        }
  }

    render() {
      // var gmtDateTime = moment.utc(this.props.time, "YYYY-MM-DD HH")
      // var localDate = gmtDateTime.local().format("MMM d");
      var localDate = moment(this.props.time).format("MMM DD")
      //These spacers make the message bubble stay to the left or the right, depending on who is speaking, even if the message is multiple lines.
      var leftSpacer = this.props.direction === 'left' ? null : <View style={{width: 70}}/>;
      var rightSpacer = this.props.direction === 'left' ? <View style={{width: 70}}/> : null;
      var bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, {backgroundColor:this.props.receiverBubbleColor,borderBottomLeftRadius:0},this.props.messageStyle] : [styles.messageBubble, {backgroundColor:this.props.senderBubbleColor,borderBottomRightRadius:0},this.props.messageStyle];
      return (
        <View>
        <View style={{flexDirection:"column",backgroundColor:this.state.onSelect ? 'rgba(167,212,255,0.7)' : "white"}}>
            {/* {this.props.isToday == 1 && (
                <View style={[this.props.dateView]}>
                <Text style={this.props.dateStyle}>{utils.dateTag(this.props.todayDate)}</Text>
                </View>
              )} */}
          <View style={{justifyContent: 'space-between',marginBottom:5, flexDirection: 'row', flex:1,minHeight: 30}}>
              {leftSpacer}
              <TouchableOpacity onLongPress={() => {
                  // this.setState({
                  //   onSelect:true
                  // })
                  this.props.deleteClicked(this.props.item)
                }} style={bubbleStyles}>
                {this.renderBubbles(true)}
                {this.renderBubbles(false)}

                 <View style={{alignSelf:"flex-end",flexDirection:"row",margin:3}}>
                {/* <Text style={[this.props.timeStyle,{marginRight:5}]}>
                {localDate}
                </Text>
                {this.props.readStatus == "Sent" && (
                  <FontAwesome5 name="check" size={10} color="#e9f5f8" light/>
                )}
                {this.props.readStatus == "Read" && (
                  <FontAwesome5 name="check-double" size={10} color="#44a6c6" light/>
                )} */}
                </View>
                    
                {this.props.isTyping && (
                  <TypingAnimation
                  style={{height:20,width:50,marginLeft:10}}
                  dotColor="#00004d"
                  dotMargin={6}
                  dotAmplitude={3}
                  dotSpeed={0.15}
                  dotRadius={4}
                  dotX={12}
                  dotY={6}
                />
               )} 
              </TouchableOpacity>
              {rightSpacer}
            </View>
            <View style={{alignSelf:this.props.direction === 'left' ? "flex-start" : "flex-end",flexDirection:"row",marginRight:this.props.direction === 'left' ? 0 : 17,marginLeft:this.props.direction === 'left' ? 17 : 0,margin:3}}>
             <Text style={[this.props.timeStyle,{marginTop:-5,alignSelf: this.props.direction === 'left' ? "flex-start" : "flex-end"}]}>
                {this.props.isToday == 1 ? "Today" : localDate}
                </Text>
                {this.props.readStatus == "Sent" && this.props.direction === 'right' && (
                  <FontAwesome5 name="check" size={8} style={{marginLeft:3,marginTop:-2}} color="gray" light/>
                )}
                {this.props.readStatus == "Read" && this.props.direction === 'right' && (
                  <FontAwesome5 name="check-double" size={10} color="#44a6c6" light/>
                )}
                </View>
            </View>
          </View>
        );
    }
  }

  ReplyBubble.propTypes = {
    ...View.propTypes,
    text: PropTypes.string,
    direction: PropTypes.string,
    receiverBubbleColor: PropTypes.string,
    senderBubbleColor: PropTypes.string,
    receiverTextColor: PropTypes.string,
    senderTextColor: PropTypes.string
  };

  ReplyBubble.defaultProps = {
    ...View.defaultProps,
    enableScrollToCaret: false,
    receiverBubbleColor:'#f0f0F1',
    senderBubbleColor:'#4291E2',
    receiverTextColor: 'black',
    senderTextColor: 'white'
  };

const styles = StyleSheet.create({

//MessageBubble

messageBubble: {
    borderRadius: 5,
    marginTop: 8,
    marginRight: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection:'column',
    flex: 1
},
replyBubble:{
    borderRadius: 5,
    marginTop: 8,
    marginRight: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection:'column',
    flex: 1,
    backgroundColor:"#ff9999"
}

})