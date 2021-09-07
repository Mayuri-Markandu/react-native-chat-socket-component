
import React,{Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  Keyboard,
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
import {getLinkPreview} from 'link-preview-js';
import FastImage from "react-native-fast-image"

export default class MessageBubble extends React.PureComponent {
  
  state = {
    visible: false,
    onSelect: this.props.onSelect,
    urlData: {
      title:"",
      images:[],
      url:""
    }
  };


  _openMenu = () => this.setState({ visible: true });

  _closeMenu = () => this.setState({ visible: false });

  renderLinkPreview = () => {
    var bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, {backgroundColor:this.props.receiverBubbleColor,borderBottomLeftRadius:0},this.props.messageStyle] : [styles.messageBubble, {backgroundColor:this.props.senderBubbleColor,borderBottomRightRadius:0},this.props.messageStyle];
    getLinkPreview(this.props.text)
        .then((data) => {
        this.setState({
          urlData: data
        })             
    })
    return(
      <TouchableOpacity disabled={this.props.disableTouch} onLongPress={() => {
              // this.setState({
              //   onSelect:true
              // })
              this.props.deleteClicked(this.props.item)
            }} style={[bubbleStyles,{borderRadius:0,flex:1,backgroundColor: this.props.direction == "left" ? "#F3F6F8" : "#ADC8E3"}]}>
            <View style={{flex:1,flexDirection:"row",marginLeft:-5}}>
              <Image style={{width:70,height:70,backgroundColor:"gray",resizeMode:"cover"}} source={{uri:this.state.urlData.images != undefined ? this.state.urlData.images[0] : ""}}/>
              <View style={{flexDirection:"column",justifyContent:"center"}}>
                <Text style={{fontSize:13,color:"#3E3F40",width:"58%",fontWeight:"bold",marginLeft:5}}>{this.state.urlData.title != undefined ? this.state.urlData.title : ""}</Text>
                <Text style={{fontSize:11,color:"#3E3F40",width:"58%",marginLeft:5}}>{this.state.urlData.url != undefined ? this.state.urlData.url : ""}</Text>
              </View>
            </View>
            </TouchableOpacity>
    ); 
  }

    render() {
      console.log("BUBBLE TYPING",this.props.isTyping)
      //var gmtDateTime = moment.utc(this.props.time, "YYYY-MM-DD HH")
      //var localDate = gmtDateTime.local().format("h:mm a");
      var localDate = moment(this.props.time).format("MMM DD")
      //These spacers make the message bubble stay to the left or the right, depending on who is speaking, even if the message is multiple lines.
      var leftSpacer = this.props.direction === 'left' ? null : <View style={{width: 70}}/>;
      var rightSpacer = this.props.direction === 'left' ? <View style={{width: 70}}/> : null;
      var bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, {backgroundColor:this.props.receiverBubbleColor,borderBottomLeftRadius:0},this.props.messageStyle] : [styles.messageBubble, {backgroundColor:this.props.senderBubbleColor,borderBottomRightRadius:0},this.props.messageStyle];
      var bubbleTextStyle = this.props.direction === 'left' ? {color:this.props.receiverTextColor,width:"98%"} : {color:this.props.senderTextColor};
      return (
        <View style={{flex:1,minHeight:40}}>
        <View style={{flexDirection:"column",flex:1,backgroundColor:this.state.onSelect ? 'rgba(167,212,255,0.7)' : "white"}}>
              {/* {this.props.isToday == 1 && (
                <View style={[this.props.dateView]}>
                <Text style={this.props.dateStyle}>{utils.dateTag(this.props.todayDate)}</Text>
                </View>
              )} */}
          <View style={{justifyContent: 'space-between',padding:3,marginBottom:5,flexDirection: 'row', flex:1,minHeight:40}}>
              {leftSpacer}
              {this.props.isGif && this.props.isTyping == null && (
                  <TouchableOpacity disabled={this.props.disableTouch} onLongPress={() => {
                    this.props.deleteClicked(this.props.item)
                  }} style={{marginRight:this.props.direction == "left" ? 0 : 10, marginLeft: this.props.direction == "right" ? 0 : 10}}>
                 {this.props.text != "" && this.props.isGif == true && this.props.isTyping == null && (
                    <FastImage 
                      style={[styles.imageStyle,{alignSelf:"center",marginTop:0,borderBottomLeftRadius: this.props.direction == "left" ? 0 : 20 ,borderBottomRightRadius: this.props.direction == "left" ? 20 : 0}]} 
                      source={{uri:this.props.text, priority: FastImage.priority.high}}
                      resizeMode={FastImage.resizeMode.cover}
                      />
                  )}
              </TouchableOpacity>
              )}
              {this.props.isUrl == true && this.props.isTyping == null && (
                this.renderLinkPreview()
              )}
              {this.props.isGif == false && this.props.isUrl == false && (
              <TouchableOpacity disabled={this.props.disableTouch} onLongPress={() => {
                  // this.setState({
                  //   onSelect:true
                  // })
                  this.props.deleteClicked(this.props.item)
                }} style={[bubbleStyles]}>
              {this.props.text != "" && this.props.isGif == false && this.props.isTyping == null && (
                <View style={{flex:1}}>
                  <Text style={[bubbleTextStyle,{marginTop:5}]}>
                  {this.props.text != "" ? this.props.text : "empty"}
                </Text>
                {/* <View style={{alignSelf:"flex-end",flexDirection:"row",margin:3}}>
                {this.props.readStatus == "Sent" && (
                  <FontAwesome5 name="check" size={10} color="#e9f5f8" light/>
                )}
                {this.props.readStatus == "Read" && (
                  <FontAwesome5 name="check-double" size={10} color="#44a6c6" light/>
                )}
                </View> */}
                </View>
                
              )}
                {this.props.isTyping && (
                  <TypingAnimation
                  style={{height:20,width:50, marginTop:10,marginLeft:10}}
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
              )}
              {rightSpacer}
            </View>
            <View style={{alignSelf:this.props.direction === 'left' ? "flex-start" : "flex-end",flexDirection:"row",marginRight:this.props.direction === 'left' ? 0 : 17,marginLeft:this.props.direction === 'left' ? 17 : 0,margin:3}}>
             <Text style={[this.props.timeStyle,{marginTop:-5,alignSelf: this.props.direction === 'left' ? "flex-start" : "flex-end"}]}>
                {this.props.isToday == 1 ? "Today" : localDate}
                </Text>
                {this.props.readStatus == "Sent" || this.props.readStatus == "Delivered" && this.props.direction === 'right' && (
                  <FontAwesome5 name="check" size={8} style={{marginLeft:3,marginTop:-2}} color="gray" light/>
                )}
                {this.props.readStatus == "Read" && this.props.direction === 'right' && (
                  <FontAwesome5 name="check-double" size={8} color="#44a6c6" light/>
                )}
                </View>
            </View>
          </View>
        );
    }
  }

  MessageBubble.propTypes = {
    ...View.propTypes,
    text: PropTypes.string,
    direction: PropTypes.string,
    receiverBubbleColor: PropTypes.string,
    senderBubbleColor: PropTypes.string,
    receiverTextColor: PropTypes.string,
    senderTextColor: PropTypes.string,
    disableTouch: PropTypes.bool
  };

  MessageBubble.defaultProps = {
    ...View.defaultProps,
    enableScrollToCaret: false,
    receiverBubbleColor:'#f0f0F1',
    senderBubbleColor:'#4291E2',
    receiverTextColor: 'black',
    senderTextColor: 'white',
    disableTouch:false
  };

const styles = StyleSheet.create({

//MessageBubble

messageBubble: {
    borderRadius: 20,
    marginTop: 8,
    marginRight: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection:'column',
    flex: 1,
    minHeight:40
},

//gif style
imageStyle:{
  flex:1,
  minHeight:150,
  minWidth:150,
  backgroundColor:"transparent",
  borderRadius:20,
},

})