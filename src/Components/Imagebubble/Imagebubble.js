
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
import FastImage from "react-native-fast-image"

export default class ImageBubble extends React.PureComponent {
    

    render() {
      const {onImgClicked} = this.props
      // var gmtDateTime = moment.utc(this.props.time, "YYYY-MM-DD HH")
      // var localDate = gmtDateTime.local().format("MMM d");
      var localDate = moment(this.props.time).format("MMM DD")
      //These spacers make the message bubble stay to the left or the right, depending on who is speaking, even if the message is multiple lines.
      var leftSpacer = this.props.direction === 'left' ? null : <View style={{width: 70}}/>;
      var rightSpacer = this.props.direction === 'left' ? <View style={{width: 70}}/> : null;
      var bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, {backgroundColor:this.props.receiverBubbleColor,borderBottomLeftRadius:0},this.props.messageStyle] : [styles.messageBubble, {backgroundColor:this.props.senderBubbleColor,borderBottomRightRadius:0},this.props.messageStyle];
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
                }} style={{flex:1,justifyContent:"center",alignSelf:"center"}} onPress={() => this.props.onImgClicked(this.props.item)}>
                  <FastImage 
                    style={[this.props.imageStyle,{alignSelf:"center",marginTop:0,borderBottomLeftRadius: this.props.direction == "left" ? 0 : 20 ,borderBottomRightRadius: this.props.direction == "left" ? 20 : 0}]} 
                    source={{uri:this.props.imgUri, priority: FastImage.priority.high}}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                {/* <View style={{alignSelf:"flex-end",flexDirection:"row",margin:3,marginTop:5}}>
               <Text style={[this.props.timeStyle,{marginRight:5}]}>
                {localDate}
                </Text>
                {this.props.readStatus == "Sent" && (
                  <FontAwesome5 name="check" size={10} color="#e9f5f8" light/>
                )}
                {this.props.readStatus == "Read" && (
                  <FontAwesome5 name="check-double" size={10} color="#44a6c6" light/>
                )} 
                </View> */}
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

  ImageBubble.propTypes = {
    ...View.propTypes,
    text: PropTypes.string,
    direction: PropTypes.string,
    receiverBubbleColor: PropTypes.string,
    senderBubbleColor: PropTypes.string,
    receiverTextColor: PropTypes.string,
    senderTextColor: PropTypes.string,
    disableTouch: PropTypes.bool
  };

  ImageBubble.defaultProps = {
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
    borderRadius: 20,
    marginTop: 8,
    marginRight: 10,
    marginLeft: 10,
    //paddingHorizontal: 10,
    //paddingVertical: 5,
    flexDirection:'column',
    minWidth:150,
    minHeight:150,
},

})