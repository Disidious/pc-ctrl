import styles from '../styles.js'
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, TextInput, BackHandler, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Button from './Button.js';

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
      setErr()
      goBack()
    }
  }
  socket.onerror = function () {
    setErr()
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
    const [touchPos, setTouchPos] = useState({})
    
    const touchPadBackAction = () => {
        socketClose()
        props.setVisible(false)
        return true
    }

    
    useEffect(()=>{
      BackHandler.addEventListener(
          "hardwareBackPress",
          touchPadBackAction
      )
      socketConn(props.socketUrl, props.setErr, touchPadBackAction)
    },[])
    
    return (
        <View style={{backgroundColor: "white", height: "100%", width: "100%"}}>
          <MaterialCommunityIcons
            name="cursor-default-click" 
            size={90}
            style={{
              position: 'absolute', 
              justifyContent: 'center', 
              alignSelf: 'center', 
              top: Math.min(Dimensions.get('window').height, Dimensions.get('window').width)/2 - (90/2), 
              color: 'rgb(0,0,0)'}} 
          >
            Touch Pad
          </MaterialCommunityIcons>
          <View 
            style={{height: "100%", width: "100%", backgroundColor: 'rgba(255,255,255,0.8)', flex: 1}}
            onTouchStart={(e)=>{
              let newTouchPos = Object.assign({},touchPos)
              newTouchPos[e.nativeEvent.identifier] = [e.nativeEvent.pageX, e.nativeEvent.pageY]
              setTouchPos(newTouchPos)
              try {
                socket.send('START;' + e.nativeEvent.pageX + ';' + e.nativeEvent.pageY + ';' + Date.now());
              } catch(e) {
                props.setErr()
                touchPadBackAction()
              }
            }}
            onTouchMove={(e)=>{
                let newTouchPos = Object.assign({},touchPos)
                newTouchPos[e.nativeEvent.identifier] = [e.nativeEvent.pageX, e.nativeEvent.pageY]
                setTouchPos(newTouchPos)

                if(lastTouchPadReq != null && Date.now() - lastTouchPadReq < touchPadDelay) {
                  return
                }
                lastTouchPadReq = Date.now()
                try {
                  socket.send('MOVING;' + e.nativeEvent.touches[0].pageX + ';' + e.nativeEvent.touches[0].pageY);
                } catch(e) {
                  props.setErr()
                  touchPadBackAction()
                }
              }
            }
            onTouchEnd={(e)=>{
              let newTouchPos = Object.assign({},touchPos)
              delete newTouchPos[e.nativeEvent.identifier]
              setTouchPos(newTouchPos)
              try {
                socket.send('END;' + e.nativeEvent.pageX + ';' + e.nativeEvent.pageY + ';' + Date.now());
              } catch(e) {
                props.setErr()
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
          <Button
            iconName="keyboard"
            iconSize={30}
            iconStyle={{color:"white"}}
            btnStyle={styles.bottomBtn}
            press={() => {
              keyboardInputRef.blur()
              keyboardInputRef.focus()
            }}
          />
          {
            Object.keys(touchPos).map((e, i) => {
              return (
                <View key={i}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderColor: 'black',
                  borderWidth: 2.5,
                  borderRadius: 100, 
                  width: 40, 
                  height: 40,
                  position: 'absolute',
                  left: touchPos[e][0] - 20,
                  top: touchPos[e][1] - 20
                }}
                />
              )
            })
          }
          
          <StatusBar style="light" hidden={true}/>
        </View>
      );
}
