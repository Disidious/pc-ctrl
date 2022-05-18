import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, TextInput, BackHandler } from 'react-native';
import {Dimensions} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from "socket.io-client";
import * as ScreenOrientation from 'expo-screen-orientation';

const { height, width } = Dimensions.get('window');

var url = ""
var port = ":9876"
var socket = null

var lastTouchPadReq = null
var touchPadDelay = 90

function socketConn() {
  socketClose()

  socket = io(url);
}

function socketClose() {
  if(socket !== null) {
    socket.close()
  }
}

function setUrl(ip) {
  url = "http://" + ip + port
}

function back() {
  fetch(url + "/back")
}

function pauseplay() {
  fetch(url + "/pauseplay")
}

function forward() {
  fetch(url + "/forward")
}

function screen() {
  fetch(url + "/screen")
}

function shakeCursor() {
  fetch(url + "/shakeCursor")
}

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputIp, setInputIp] = useState('')
  const [ip, setIp] = useState('')
  const [touchPadVisible, setTouchPadVisible] = useState(false)
  
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
      socketConn()
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
            style={{position: 'absolute', justifyContent: 'center', alignSelf: 'center', top: Dimensions.get('window').width/2 - 50, color: 'rgb(0,0,0)'}} 
          >
            Touch Pad
          </MaterialCommunityIcons>
          <View 
            style={{height: "100%", backgroundColor: 'rgba(255,255,255,0.8)'}}
            onTouchStart={(e)=>{
              socket.emit('touchStart', {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY})
            }}
            onTouchMove={(e)=>{
              if(lastTouchPadReq != null && Date.now() - lastTouchPadReq < touchPadDelay) {
                return
              }
              lastTouchPadReq = Date.now()
              let padHeight = Dimensions.get('window').height
              let padWidth = Dimensions.get('window').width
              socket.emit(
                'touchCoords', 
                {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY, width: padWidth, height: padHeight}
                );
              }
            }
            onTouchEnd={(e)=>{
              socket.emit('touchEnd', {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY})
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
      <View style={{flexDirection: 'row', justifyContent: 'flex-end', height: height * 0.15, marginTop: height * 0.01}}>
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
          <TouchableOpacity onPress={back}>
            <MaterialCommunityIcons
              name="step-backward" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={pauseplay}>
            <MaterialCommunityIcons
              name="play-pause" 
              size={60}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={forward}>
            <MaterialCommunityIcons
              name="step-forward" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider}/>

        <View style={styles.mediaBtnContainer}>
          <TouchableOpacity onPress={screen}>
            <MaterialCommunityIcons
              name="fit-to-screen" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={shakeCursor}>
            <MaterialCommunityIcons
              name="mouse-move-vertical" 
              size={40}
              style={styles.mediaBtn} 
            />
          </TouchableOpacity>
        </View>
        <StatusBar style="light" hidden={touchPadVisible}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsBtn: {
    backgroundColor: "white",
    margin: 10,
    color: "black", 
    padding: 10, 
    borderRadius: 100,
    alignSelf: 'flex-end',
    top: 25,
    right: 5,
  },

  ipModal: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  ipView: {
    backgroundColor: "black", 
    width: "100%", 
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  ipInput: {
    width: "90%",
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "black",
    backgroundColor: "white",
    borderRadius: 100
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
    resizeMode: 'stretch'
  },

  divider: {
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    width: '70%',
    alignSelf: 'center',
    margin: 10
  },

  wrapper: {
    flex: 1,
    backgroundColor: 'black'
  },

  container: {
    top: 0,
    alignItems: 'center',
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 50,
    textAlign: 'center'
  },

  mediaBtnContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  mediaBtn: {
    backgroundColor: "white",
    margin: 10,
    color: "black", 
    padding: 10, 
    borderRadius: 100
  }
});
