import { Text, View, Image, SafeAreaView, StyleSheet, Platform } from 'react-native';
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';

import { Button, Touchpad, IpModal } from 'components';

import errorMessages from 'constants/ErrorMessages';
import { mediaOperation } from 'helpers/MediaOperations';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputIp, setInputIp] = useState('');
  const [ip, setIp] = useState('');
  const [touchPadVisible, setTouchPadVisible] = useState(false);
  const [holdingTimer, setHoldingTimer] = useState<NodeJS.Timeout>();
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const ipValue = await AsyncStorage.getItem('@pc_ctrl_ip');
        if(ipValue != undefined) {
          setInputIp(ipValue);
          setIp(ipValue);
        }
      } catch(e) {
        alert('Failed to fetch the data from storage');
      }
    })();
  }, [])

  useEffect(()=>{
    if(!touchPadVisible) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, [touchPadVisible])

  const getUrl = (isSocket: boolean = false) => {
    let preFix = "http://";
    if(isSocket) {
      preFix = "ws://";
    }
    return preFix + ip + ":9876";
  }

  const onIpInputDone = () => {
    AsyncStorage.setItem(
      '@pc_ctrl_ip',
      inputIp
    );
    setIp(inputIp);
    setModalVisible(false);
  }

  if(touchPadVisible) {
    return (
      <Touchpad
        setError={(err)=>{
          if(err) {
            setError(errorMessages.connectionError)
          } else {
            setError('')
          }
        }}
        socketUrl={getUrl(true)}
        setVisibility={setTouchPadVisible}
      />
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <IpModal 
        visible={modalVisible} 
        ip={ip} 
        setVisibility={setModalVisible}
        setIp={setIp} 
        onDone={onIpInputDone}        
      />

      <View style={styles.upperContainer}>
        <Button 
            iconName="cursor-default-click"
            iconSize={30}
            btnStyle={styles.optionBtn}
            onPress={() => {
              setTouchPadVisible(true);
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
            }}
        />
        <Button 
            iconName="server"
            iconSize={30}
            btnStyle={styles.optionBtn}
            onPress={() => setModalVisible(true)}
        />
      </View>

      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require('./assets/laptop.png')}
        />
        <Text style={styles.title}>
          PC-CTRL
        </Text>
        <View style={styles.mediaBtnContainer}>
          <Button 
            iconName="step-backward"
            onPressIn={() => mediaOperation(getUrl(), setError, 'BACKWARD', setHoldingTimer)}
            onPressOut={() => clearTimeout(holdingTimer)}
          />
          <Button 
            iconName="play-pause"
            iconSize={60}
            onPress={() => mediaOperation(getUrl(), setError, 'PLAYPAUSE')}
          />
          <Button 
            iconName="step-forward"
            onPressIn={()=>mediaOperation(getUrl(), setError, 'FORWARD', setHoldingTimer)}
            onPressOut={()=>clearTimeout(holdingTimer)}
          />
        </View>

        <View style={styles.divider}/>

        <View style={styles.mediaBtnContainer}>
          <Button 
            iconName="fit-to-screen"
            onPress={()=>mediaOperation(getUrl(), setError, 'FULLSCREEN')}
          />
          <Button 
            iconName="mouse-move-vertical"
            onPress={()=>mediaOperation(getUrl(), setError, 'SHAKECURSOR')}
          />
          <Button 
            iconName="volume-plus"
            onPressIn={()=>mediaOperation(getUrl(), setError, 'VOLUP', setHoldingTimer)}
            onPressOut={()=>clearTimeout(holdingTimer)}
          />
          <Button 
            iconName="volume-minus"
            onPressIn={()=>mediaOperation(getUrl(), setError, 'VOLDOWN', setHoldingTimer)}
            onPressOut={()=>clearTimeout(holdingTimer)}
          />
        </View>
        <Text style={{color: "red", fontWeight: "bold", marginTop: 10, fontSize: 20}}>{error}</Text>
      </View>
      <StatusBar style="light"/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  upperContainer: {
    flexDirection: 'row', 
    justifyContent: 'flex-end',
    marginTop: Platform.OS === 'android' ? 45 : 10,
  },
  optionBtn: {
    backgroundColor: "white",
    color: "black", 
    borderRadius: 100,
    padding: 10,
    margin: 8,
    alignSelf: 'flex-end',
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
    width: '70%',
    alignSelf: 'center',
    margin: 10
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'black',
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
    marginBottom: 40,
    textAlign: 'center'
  },
  mediaBtnContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
