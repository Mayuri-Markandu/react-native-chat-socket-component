
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
  NativeModules, Button
} from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import TypingAnimation  from "Components/TypingIndicator/TypingAnimation";
import utils from "../../Utils/utils"
import Video from 'react-native-video';

export default class VideoBubble extends React.PureComponent {
    

    render() {
      const {onImgClicked} = this.props
      var gmtDateTime = moment.utc(this.props.time, "YYYY-MM-DD HH")
      var localDate = gmtDateTime.local().format("h:mm a");
      //These spacers make the message bubble stay to the left or the right, depending on who is speaking, even if the message is multiple lines.
      var leftSpacer = this.props.direction === 'left' ? null : <View style={{width: 70}}/>;
      var rightSpacer = this.props.direction === 'left' ? <View style={{width: 70}}/> : null;
      var bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, {backgroundColor:this.props.receiverBubbleColor,borderRadius:20,borderBottomLeftRadius:0},this.props.messageStyle] : [styles.messageBubble, {backgroundColor:this.props.senderBubbleColor,borderRadius:20,borderBottomRightRadius:0},this.props.messageStyle];
      var bubbleTextStyle = this.props.direction === 'left' ? {color:this.props.receiverTextColor} : {color:this.props.senderTextColor};
      return (
        <View style={{flexDirection:"column",backgroundColor:"white"}}>
        {this.props.isToday == 1 && (
          <View style={[this.props.dateView]}>
          <Text style={this.props.dateStyle}>{utils.dateTag(this.props.todayDate)}</Text>
          </View>
        )}
          <View style={{justifyContent: 'space-between',marginBottom:5,minHeight:30,flex:1, flexDirection: 'row'}}>
            
              {leftSpacer}
              <View style={bubbleStyles}>
              {this.props.imgUri && (
                <TouchableOpacity disabled={this.props.disableTouch} onLongPress={() => {
                  // this.setState({
                  //   onSelect:true
                  // })
                  this.props.deleteClicked(this.props.item)
                }} style={{flex:1}}>
                <Video source={{uri: this.props.imgUri}}   // Can be a URL or a local file.
                  ref={(ref) => {
                    this.player = ref
                  }}  
                  paused={true}                                    // Store reference
                  //onBuffer={this.onBuffer}                // Callback when remote video is buffering
                  //onError={this.videoError}               // Callback when video cannot be loaded
                  style={[{alignSelf:"center",resizeMode:"cover",width:"100%",height:"100%",marginTop:-5}]} />
                <View style={{alignSelf:"flex-end",flexDirection:"row",margin:3,marginTop:5}}>
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
                  </TouchableOpacity>
              )}
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
              </View>
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
                  <FontAwesome5 name="check-double" size={10} color="#44a6c6" light/>
                )}
                </View>
            </View>
        );
    }
  }

  VideoBubble.propTypes = {
    ...View.propTypes,
    text: PropTypes.string,
    direction: PropTypes.string,
    receiverBubbleColor: PropTypes.string,
    senderBubbleColor: PropTypes.string,
    receiverTextColor: PropTypes.string,
    senderTextColor: PropTypes.string,
    disableTouch: PropTypes.bool
  };

  VideoBubble.defaultProps = {
    ...View.defaultProps,
    enableScrollToCaret: false,
    receiverBubbleColor:'#f0f0F1',
    senderBubbleColor:'#4291E2',
    receiverTextColor: 'black',
    senderTextColor: 'white',
    disableTouch: false
  };

const styles = StyleSheet.create({

//MessageBubble

messageBubble: {
    borderRadius: 5,
    marginTop: 8,
    marginRight: 10,
    marginLeft: 10,
    //paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection:'column',
    minWidth:200,
    minHeight:200,
},

})