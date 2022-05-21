import styles from '../styles.js'
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, TextInput, BackHandler, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ScreenOrientation from 'expo-screen-orientation';

const touchPadDelay = 55
var lastTouchPadReq = null

var socket = null

function socketConn(url, setErr, goBack) {
  socketClose()
  socket = new WebSocket(url + '/touchpad');
  socket.onopen = function () {
    let width = Math.max(Dimensions.get('window').height, Dimensions.get('window').width)
    let height = Math.min(Dimensions.get('window').height, Dimensions.get('window').width)
    try {
      socket.send('ACTIVATED;' + width + ';' + height)
      setErr('')
    } catch(e) {
      setErr("Couldn't Reach Host")
      goBack()
    }
  }
  socket.onerror = function () {
    setErr("Couldn't Reach Host")
    goBack()
  }
}

function socketClose() {
  if(socket !== null) {
    socket.close()
  }
}

export default function TouchPad(props) {
    const [keyboardText, setKeyboardText] = useState('')
    const [keyboardInputRef, setKeyboardInputRef] = useState(null)
    
    const touchPadBackAction = () => {
        socketClose()
        props.setVisible(false)
        return true
    }

    BackHandler.addEventListener(
        "hardwareBackPress",
        touchPadBackAction
    )

    useEffect(()=>{
        socketConn(props.socketUrl, props.setErr, touchPadBackAction)
    },[])
    
    return (
        <View style={{backgroundColor: "white", height: "100%", width: "100%"}}>
          <MaterialCommunityIcons
            name="cursor-default-click" 
            size={100}
            style={{
              position: 'absolute', 
              justifyContent: 'center', 
              alignSelf: 'center', 
              top: Math.min(Dimensions.get('window').height, Dimensions.get('window').width)/2 - 50, 
              color: 'rgb(0,0,0)'}} 
          >
            Touch Pad
          </MaterialCommunityIcons>
          <View 
            style={{height: "100%", width: "100%", backgroundColor: 'rgba(255,255,255,0.8)', flex: 1}}
            onTouchStart={(e)=>{
              try {
                socket.send('START;' + e.nativeEvent.pageX + ';' + e.nativeEvent.pageY);
              } catch(e) {
                props.setErr("Couldn't Reach Host")
                touchPadBackAction()
              }
            }}
            onTouchMove={(e)=>{
                if(lastTouchPadReq != null && Date.now() - lastTouchPadReq < touchPadDelay) {
                  return
                }
                lastTouchPadReq = Date.now()
                try {
                  socket.send('MOVING;' + e.nativeEvent.touches[0].pageX + ';' + e.nativeEvent.touches[0].pageY);
                } catch(e) {
                  props.setErr("Couldn't Reach Host")
                  touchPadBackAction()
                }
              }
            }
            onTouchEnd={(e)=>{
              try {
                socket.send('END;' + e.nativeEvent.pageX + ';' + e.nativeEvent.pageY);
              } catch(e) {
                props.setErr("Couldn't Reach Host")
                touchPadBackAction()
              }
            }}
          >
          </View>
          <TextInput 
            style={{height: 0.5, width: "100%", backgroundColor:'red', right: 10000}} 
            disableFullscreenUI={true}
            autoCapitalize='none'
            ref={setKeyboardInputRef}
            value={keyboardText}
            multiline={true}
            onKeyPress={(e)=>{
              setKeyboardText('')
              socket.send('TYPE;' + e.nativeEvent.key)
            }}
          />
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => {
              keyboardInputRef.blur()
              keyboardInputRef.focus()
            }}
          >
            <MaterialCommunityIcons
              name='keyboard'
              size={30}
              style={{color:"white"}}
            />
          </TouchableOpacity>
          <StatusBar style="light" hidden={true}/>
        </View>
      );
}