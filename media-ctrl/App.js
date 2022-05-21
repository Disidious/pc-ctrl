import styles from './styles.js'
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import OperationBtn from './components/OperationBtn.js';
import OptionBtn from './components/OptionBtn.js';
import TouchPad from './components/TouchPad.js';

const port = ":9876"
var url = "http://"
var socketUrl = "ws://"


function setUrl(ip) {
  url = "http://" + ip + port
  socketUrl = "ws://" + ip + port
}

function operation(setErr, type, setTimer) {
  setErr('')
  switch (type) {
    case 'PLAYPAUSE':
      fetch(url + "/playpause").catch((e) => {
        setErr("Couldn't Reach Host")
      })
      break;

    case 'BACKWARD':
      fetch(url + "/backward").catch((e) => {
        setErr("Couldn't Reach Host")
      })
      break;

    case 'FORWARD':
      fetch(url + "/forward").catch((e) => {
        setErr("Couldn't Reach Host")
      })
      break;

    case 'FULLSCREEN':
      fetch(url + "/fullscreen").catch((e) => {
        setErr("Couldn't Reach Host")
      })
      break;

    case 'SHAKECURSOR':
      fetch(url + "/shakecursor").catch((e) => {
        setErr("Couldn't Reach Host")
      })
      break;

    case 'VOLUP':
      setErr('')
      fetch(url + "/volup").catch((e) => {
        setErr("Couldn't Reach Host")
      })
      setTimer(setTimeout(()=>operation(setErr, 'VOLUP', setTimer), 50))
      break;

    case 'VOLDOWN':
      setErr('')
      fetch(url + "/voldown").catch((e) => {
        setErr("Couldn't Reach Host")
      })
      setTimer(setTimeout(()=>operation(setErr, 'VOLDOWN', setTimer), 50))
      break;

    default:
      setErr("Couldn't Reach Host")
      break;
  }
}

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputIp, setInputIp] = useState('')
  const [ip, setIp] = useState('')
  const [touchPadVisible, setTouchPadVisible] = useState(false)
  const [volumeTimer, setVolumeTimer] = useState(null)
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
        setErr={setErr}
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
        <OptionBtn 
            iconName="cursor-default-click"
            optionPress={()=>{
              setTouchPadVisible(true)
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
            }}
        />
        <OptionBtn 
            iconName="server"
            optionPress={()=>setModalVisible(true)}
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
          <OperationBtn 
            iconName="step-backward"
            operationPress={()=>operation(setErr, 'BACKWARD')}
          />
          <OperationBtn 
            iconName="play-pause"
            iconSize={60}
            operationPress={()=>operation(setErr, 'PLAYPAUSE')}
          />
          <OperationBtn 
            iconName="step-forward"
            operationPress={()=>operation(setErr, 'FORWARD')}
          />
        </View>

        <View style={styles.divider}/>

        <View style={styles.mediaBtnContainer}>
          <OperationBtn 
            iconName="fit-to-screen"
            operationPress={()=>operation(setErr, 'FULLSCREEN')}
          />
          <OperationBtn 
            iconName="mouse-move-vertical"
            operationPress={()=>operation(setErr, 'SHAKECURSOR')}
          />
          <OperationBtn 
            iconName="volume-plus"
            operationPressIn={()=>operation(setErr, 'VOLUP', setVolumeTimer)}
            operationPressOut={()=>clearTimeout(volumeTimer)}
          />
          <OperationBtn 
            iconName="volume-minus"
            operationPressIn={()=>operation(setErr, 'VOLDOWN', setVolumeTimer)}
            operationPressOut={()=>clearTimeout(volumeTimer)}
          />
        </View>
        <Text style={{color: "red", fontWeight: "bold", marginTop: 10, fontSize: 20}}>{err}</Text>
      </View>
      <StatusBar style="light"/>
    </View>
  );
}

