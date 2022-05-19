import styles from './styles.js'
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, Modal, TextInput, BackHandler, Dimensions } from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';

const { height, width } = Dimensions.get('window');

const port = ":9876"
var url = ""
var socketUrl = ""
var socket = null

const touchPadDelay = 55
var lastTouchPadReq = null

function socketConn(setErr, goBack) {
  socketClose()
  socket = new WebSocket(socketUrl + '/touchpad');
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

function setUrl(ip) {
  url = "http://" + ip + port
  socketUrl = "ws://" + ip + port
}

function back(setErr) {
  setErr('')
  fetch(url + "/backward").catch((e) => {
    setErr("Couldn't Reach Host")
  })
}

function playpause(setErr) {
  setErr('')
  fetch(url + "/playpause").catch((e) => {
    setErr("Couldn't Reach Host")
  })
}

function forward(setErr) {
  setErr('')
  fetch(url + "/forward").catch((e) => {
    setErr("Couldn't Reach Host")
  })
}

function fullScreen(setErr) {
  setErr('')
  fetch(url + "/fullscreen").catch((e) => {
    setErr("Couldn't Reach Host")
  })
}

function shakeCursor(setErr) {
  setErr('')
  fetch(url + "/shakecursor").catch((e) => {
    setErr("Couldn't Reach Host")
  })
}

function volUp(setErr, setTimer) {
  setErr('')
  fetch(url + "/volup").catch((e) => {
    setErr("Couldn't Reach Host")
  })

  setTimer(setTimeout(()=>volUp(setErr, setTimer), 50))
}

function volDown(setErr, setTimer) {
  setErr('')
  fetch(url + "/voldown").catch((e) => {
    setErr("Couldn't Reach Host")
  })

  setTimer(setTimeout(()=>volDown(setErr, setTimer), 50))
}

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputIp, setInputIp] = useState('')
  const [ip, setIp] = useState('')
  const [touchPadVisible, setTouchPadVisible] = useState(false)
  const [volumeTimer, setVolumeTimer] = useState(null)
  const [err, setErr] = useState('')
  
  const touchPadBackAction = () => {
    if(touchPadVisible) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
      setTouchPadVisible(false)
    }
    return true
  }
  BackHandler.addEventListener(
    "hardwareBackPress",
    touchPadBackAction
  );

  useEffect(() => {

    const storedIp = async () => {
      try {
        const ipValue = await AsyncStorage.getItem('@media_ctrl_ip')
        if(ipValue != undefined) {
          setInputIp(String(ipValue))
          setIp(String(ipValue))
        }
      } catch(e) {
        alert('Failed to fetch the data from storage');
      }
    }
    storedIp()
  }, [])

  useEffect(() => {
    if(touchPadVisible){
      socketConn(setErr, touchPadBackAction)
    }
    else{
      socketClose()
    }
  },[touchPadVisible])

  useEffect(() => {
    setUrl(ip)
  }, [ip])

  return (
    <View style={styles.wrapper}>
      {/*
      ===================================================================================================
      Touch Pad 
      ===================================================================================================
      */}
      {
        touchPadVisible &&
        <View style={{backgroundColor: "white"}}>
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
            style={{height: "100%", backgroundColor: 'rgba(255,255,255,0.8)'}}
            onTouchStart={(e)=>{
              try {
                socket.send('START;' + e.nativeEvent.locationX + ';' + e.nativeEvent.locationY);
              } catch(e) {
                setErr("Couldn't Reach Host")
                touchPadBackAction()
              }
            }}
            onTouchMove={(e)=>{
                if(lastTouchPadReq != null && Date.now() - lastTouchPadReq < touchPadDelay) {
                  return
                }
                lastTouchPadReq = Date.now()
                try {
                  socket.send('MOVING;' + e.nativeEvent.touches[0].locationX + ';' + e.nativeEvent.touches[0].locationY);
                } catch(e) {
                  setErr("Couldn't Reach Host")
                touchPadBackAction()
                }
              }
            }
            onTouchEnd={(e)=>{
              try {
                socket.send('END;' + e.nativeEvent.locationX + ';' + e.nativeEvent.locationY);
              } catch(e) {
                setErr("Couldn't Reach Host")
                touchPadBackAction()
              }
            }}
          />
        </View>
      }

      {/*
      ===================================================================================================
      Server IP Configuration modal 
      ===================================================================================================
      */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setInputIp(ip)
          setModalVisible(false)
        }}
      >
        <View style={styles.ipModal}>
          <View style={styles.ipView}>
            <Text style={{color: "white", fontWeight: "bold"}}>Server IP (Port: 9876)</Text>
            <TextInput
              style={styles.ipInput}
              value={String(inputIp)}
              onChangeText={(text) => {setInputIp(text)}}
            />
            <MaterialCommunityIcons.Button
              name="check"
              style={{backgroundColor: "white"}}
              color="black"
              onPress={() => {
                setIp(inputIp)
                AsyncStorage.setItem(
                  '@media_ctrl_ip',
                  inputIp
                );
                setModalVisible(false)
              }}
            >
              <Text style={{color: "black", fontWeight: "bold"}}>
                Done
              </Text>
            </MaterialCommunityIcons.Button>
          </View>
        </View>
      </Modal>

      {/*
      ===================================================================================================
      Upper Buttons View 
      ===================================================================================================
      */}
      <View style={styles.upperContainer}>
        <TouchableOpacity onPress={()=>{
            setTouchPadVisible(true)
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
          }}>
          <MaterialCommunityIcons
            name="cursor-default-click" 
            size={30}
            style={styles.settingsBtn} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setModalVisible(true)}>
          <MaterialCommunityIcons
            name="server" 
            size={30}
            style={styles.settingsBtn} 
          />
        </TouchableOpacity>
      </View>

      {/*
      ===================================================================================================
      Media Controller View 
      ===================================================================================================
      */}
      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require('./assets/laptop.png')}
        />
        <Text style={styles.title}>
          Media{"\n"}CTRL
        </Text>
        <View style={styles.mediaBtnContainer}>
          <TouchableOpacity onPress={()=>back(setErr)}>
            <MaterialCommunityIcons
              name="step-backward" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>playpause(setErr)}>
            <MaterialCommunityIcons
              name="play-pause" 
              size={60}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>forward(setErr)}>
            <MaterialCommunityIcons
              name="step-forward" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider}/>

        <View style={styles.mediaBtnContainer}>
          <TouchableOpacity onPress={()=>fullScreen(setErr)}>
            <MaterialCommunityIcons
              name="fit-to-screen" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>shakeCursor(setErr)}>
            <MaterialCommunityIcons
              name="mouse-move-vertical" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
          onPressIn={()=>volUp(setErr, setVolumeTimer)}
          onPressOut={()=>clearTimeout(volumeTimer)}
          >
            <MaterialCommunityIcons
              name="volume-plus" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
          onPressIn={()=>volDown(setErr, setVolumeTimer)}
          onPressOut={()=>clearTimeout(volumeTimer)}
          >
            <MaterialCommunityIcons
              name="volume-minus" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
        </View>
        <Text style={{color: "red", fontWeight: "bold", marginTop: 10, fontSize: 20}}>{err}</Text>
        <StatusBar style="light" hidden={touchPadVisible}/>
      </View>
    </View>
  );
}

