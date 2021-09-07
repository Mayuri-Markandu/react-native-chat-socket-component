import React, { Component } from 'react';
import { SafeAreaView,Text,TouchableOpacity,FlatList,Alert, Button, TextInput, View, StyleSheet } from 'react-native';

export default class Feature extends Component {
    /** Constructor */
    constructor(props) {
      super(props);
      this.state = {
        featureData: ["One to One Text Chat"]
      }
    }

    /** Feature Render */
    renderFeature({item,index}) {
        return(
            <TouchableOpacity style={styles.feature} onPress={()=>{
                /** navigate to respective feature */
                console.log(this.props.navigation)
                this.props.navigation.navigate("ChatRoom")
            }}>
                <Text style={styles.featureText}>{item}</Text>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
            <View style={styles.headerBg}>
             <Text style={styles.headerText}>FEATURES</Text>
            </View>
                <FlatList
                 data={this.state.featureData}
                 renderItem={this.renderFeature}
                 keyExtractor={item => item.id}
                />
            </SafeAreaView>
        )
    }
}

/** Styling */
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
    },
    headerBg:{
      backgroundColor:"#00004d",
      height: 50,
      width:"100%",
      justifyContent:"center",
      alignItems:"center"
    },
    headerText:{
        color:"white",
        fontWeight:'bold',
        fontSize:18,
    },
    feature: {
      backgroundColor:"white",
      width: "99%",
      alignSelf:"center",
      height: 44,
      padding: 10,
      margin:10,
      borderWidth: 1,
      borderRadius: 2,
      borderColor: "#ff8c00",
      borderBottomWidth: 0,
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 1,
    },
    featureText:{
        fontSize:15,
        fontWeight:'bold',
        color:"#00004d",
    }
  });