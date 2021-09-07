import React,{Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Dimensions,
  Keyboard,
  Image,
  StatusBar,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
  NativeModules, Button
} from 'react-native';
import AutogrowInput from "Components/AutoGrowingTextInput/AutoGrowingTextInput";
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Fontisto from 'react-native-vector-icons/Fontisto'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { FAB, DefaultTheme,Portal, Provider } from 'react-native-paper';

var {height, width} = Dimensions.get('window');
const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    background: '#3498db',
    accent: '#f1c40f',
  },
};

//The bar at the bottom with a textbox and a send button.
export default class InputBar extends Component {
  /** constructor */
  constructor(props) {  
    super(props);
    this.state = {
      fabOpen: false,
      bottomUp: 0
    };
  }

  componentDidMount(){
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove();
  }

    //AutogrowInput doesn't change its size when the text is changed from the outside.
    //Thus, when text is reset to zero, we'll call it's reset function which will take it back to the original size.
    //Another possible solution here would be if InputBar kept the text as state and only reported it when the Send button
    //was pressed. Then, resetInputText() could be called when the Send button is pressed. However, this limits the ability
    //of the InputBar's text to be set from the outside.
    componentWillReceiveProps(nextProps) {
      console.log("INPUTBAR",nextProps)
      if(nextProps.text === '') {
        //this.autogrowInput.resetInputText();
      }
    }

    keyboardDidHide (e) {
      console.log("KEYBOARD HIDE")
      this.setState({
        bottomUp : 0
      })
    }
  
    render() {
     const {containerStyle,sendBtnStyle,textInputStyle,attachmentBtnStyle,smileyBtnStyle} = this.props
      return (

            <View style={containerStyle}>
                    {/* <Provider> */}
            
            <TouchableOpacity style={[{width:40,height:40,marginTop:5},attachmentBtnStyle]} onPress={()=>{this.props.attachmentPressed()}}>
              <Entypo name="attachment" color="gray" size={25} />
            </TouchableOpacity>
              <AutogrowInput style={textInputStyle}
                  ref={(refs) => { this.autogrowInput = refs }} 
                  placeholder={"Write a message..."}
                  multiline={true}
                  defaultHeight={30}
                  onChangeText={(text) => this.props.onChangeText(text)}
                  onContentSizeChange={this.props.onSizeChange}
                  value={this.props.text}
                  onSubmit={()=>{
                    this.setState({
                      bottomUp : 0
                    })
                  }}
                  onFocus={()=>{
                    this.setState({
                      bottomUp : 260
                    })
                    console.log("focused")
                  }}
                  />
           <TouchableOpacity style={[{width:40,height:40,marginTop:5},smileyBtnStyle]} onPress={()=>{this.props.smileyPressed()}}>
              <Fontisto name="smiley" color="gray" size={25} />
            </TouchableOpacity>
              <TouchableOpacity style={sendBtnStyle} onPress={() => { 
                this.props.onSendPressed()
                }}>
                <FontAwesome name="send" color="#4291E2" size={20} />
              </TouchableOpacity>
              {/* </Provider> */}

            </View> 
            );
    }
}
