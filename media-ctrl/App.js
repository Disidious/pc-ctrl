import styles from './styles.js'
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import Button from './components/Button.js';
import TouchPad from './components/TouchPad.js';

const port = ":9876"
var url = "http://"
var socketUrl = "ws://"

const errMsgs = {
  connectionErr: "Couldn't reach host"
}

function setUrl(ip) {
  url = "http://" + ip + port
  socketUrl = "ws://" + ip + port
}

function operation(setErr, type, setTimer, timeout=200) {
  setErr('')
  switch (type) {
    case 'PLAYPAUSE':
      fetch(url + "/playpause").catch((e) => {
        setErr(errMsgs.connectionErr)
      })
      break;

    case 'BACKWARD':
      fetch(url + "/backward").catch((e) => {
        setErr(errMsgs.connectionErr)
      })
      setTimer(setTimeout(()=>operation(setErr, 'BACKWARD', setTimer, 50), timeout))
      break;

    case 'FORWARD':
      fetch(url + "/forward").catch((e) => {
        setErr(errMsgs.connectionErr)
      })
      setTimer(setTimeout(()=>operation(setErr, 'FORWARD', setTimer, 50), timeout))
      break;

    case 'FULLSCREEN':
      fetch(url + "/fullscreen").catch((e) => {
        setErr(errMsgs.connectionErr)
      })
      break;

    case 'SHAKECURSOR':
      fetch(url + "/shakecursor").catch((e) => {
        setErr(errMsgs.connectionErr)
      })
      break;

    case 'VOLUP':
      setErr('')
      fetch(url + "/volup").catch((e) => {
        setErr(errMsgs.connectionErr)
      })
      setTimer(setTimeout(()=>operation(setErr, 'VOLUP', setTimer, 50), timeout))
      break;

    case 'VOLDOWN':
      setErr('')
      fetch(url + "/voldown").catch((e) => {
        setErr(errMsgs.connectionErr)
      })
      setTimer(setTimeout(()=>operation(setErr, 'VOLDOWN', setTimer, 50), timeout))
      break;

    default:
      setErr(errMsgs.connectionErr)
      break;
  }
}

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputIp, setInputIp] = useState('')
  const [ip, setIp] = useState('')
  const [touchPadVisible, setTouchPadVisible] = useState(false)
  const [holdingTimer, setHoldingTimer] = useState(null)
  const [err, setErr] = useState('')

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

  useEffect(()=>{
    if(!touchPadVisible) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    }
  }, [touchPadVisible])

  useEffect(() => {
    setUrl(ip)
  }, [ip])

  if(touchPadVisible) {
    return (
      <TouchPad
        setErr={()=>setErr(errMsgs.connectionErr)}
        socketUrl={socketUrl}
        setVisible={setTouchPadVisible}
      />
    );
  }
  return (
    <View style={styles.wrapper}>
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
            <Text style={{color: "white", fontWeight: "bold"}}>Server IP</Text>
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
        <Button 
            iconName="cursor-default-click"
            iconSize={30}
            iconStyle={styles.optionBtn}
            press={()=>{
              setTouchPadVisible(true)
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
            }}
        />
        <Button 
            iconName="server"
            iconSize={30}
            iconStyle={styles.optionBtn}
            press={()=>setModalVisible(true)}
        />
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
          <Button 
            iconName="step-backward"
            pressIn={()=>operation(setErr, 'BACKWARD', setHoldingTimer)}
            pressOut={()=>clearTimeout(holdingTimer)}
          />
          <Button 
            iconName="play-pause"
            iconSize={60}
            press={()=>operation(setErr, 'PLAYPAUSE')}
          />
          <Button 
            iconName="step-forward"
            pressIn={()=>operation(setErr, 'FORWARD', setHoldingTimer)}
            pressOut={()=>clearTimeout(holdingTimer)}
          />
        </View>

        <View style={styles.divider}/>

        <View style={styles.mediaBtnContainer}>
          <Button 
            iconName="fit-to-screen"
            press={()=>operation(setErr, 'FULLSCREEN')}
          />
          <Button 
            iconName="mouse-move-vertical"
            press={()=>operation(setErr, 'SHAKECURSOR')}
          />
          <Button 
            iconName="volume-plus"
            pressIn={()=>operation(setErr, 'VOLUP', setHoldingTimer)}
            pressOut={()=>clearTimeout(holdingTimer)}
          />
          <Button 
            iconName="volume-minus"
            pressIn={()=>operation(setErr, 'VOLDOWN', setHoldingTimer)}
            pressOut={()=>clearTimeout(holdingTimer)}
          />
        </View>
        <Text style={{color: "red", fontWeight: "bold", marginTop: 10, fontSize: 20}}>{err}</Text>
      </View>
      <StatusBar style="light"/>
    </View>
  );
}

