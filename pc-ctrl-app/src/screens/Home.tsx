import { Text, View, Image, SafeAreaView, StyleSheet, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { Button, Touchpad, IpModal } from 'components';

import AppStates from 'constants/AppStates';
import { mediaOperation, ping } from 'helpers/ApiHelper';
import { ActivityIndicator } from 'react-native';

const Home: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputIp, setInputIp] = useState('');
  const [ip, setIp] = useState('');
  const [touchPadVisible, setTouchPadVisible] = useState(false);
  const [holdingTimer, setHoldingTimer] = useState<NodeJS.Timeout>();
  const [state, setState] = useState<AppStates>(AppStates.Pinging);

  const fetchAbortController = useRef(new AbortController());

  const pingServer = () => {
    fetchAbortController.current.abort();
    fetchAbortController.current = new AbortController();
    ping(getUrl(), fetchAbortController.current.signal, setState);
  }

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

  useEffect(() => {
    pingServer();
  }, [ip])

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
        setState={setState}
        socketUrl={getUrl(true)}
        setVisibility={setTouchPadVisible}
      />
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <IpModal 
        visible={modalVisible} 
        ip={inputIp} 
        setVisibility={setModalVisible}
        setIp={setInputIp} 
        onDone={onIpInputDone}        
      />

      <View style={styles.upperContainer}>
        <Button 
          text="Server IP"
          iconName="server"
          iconSize={30}
          btnStyle={styles.optionBtn}
          onPress={() => setModalVisible(true)}
        />
      </View>

      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require('assets/logo.png')}
        />
        <Text style={styles.title}>
          PC-CTRL
        </Text>
        <View style={styles.btnsContainer}>
          <Button 
            iconName="step-backward"
            onPressIn={() => mediaOperation(getUrl(), fetchAbortController.current.signal, setState, 'BACKWARD', setHoldingTimer)}
            onPressOut={() => clearTimeout(holdingTimer)}
          />
          <Button 
            iconName="play-pause"
            iconSize={60}
            onPress={() => mediaOperation(getUrl(), fetchAbortController.current.signal, setState, 'PLAYPAUSE')}
          />
          <Button 
            iconName="step-forward"
            onPressIn={()=>mediaOperation(getUrl(), fetchAbortController.current.signal, setState, 'FORWARD', setHoldingTimer)}
            onPressOut={()=>clearTimeout(holdingTimer)}
          />
        </View>

        <View style={styles.divider}/>

        <View style={styles.btnsContainer}>
          <Button 
            iconName="fit-to-screen"
            onPress={()=>mediaOperation(getUrl(), fetchAbortController.current.signal, setState, 'FULLSCREEN')}
          />
          <Button 
            iconName="mouse-move-vertical"
            onPress={()=>mediaOperation(getUrl(), fetchAbortController.current.signal, setState, 'SHAKECURSOR')}
          />
          <Button 
            iconName="volume-plus"
            onPressIn={()=>mediaOperation(getUrl(), fetchAbortController.current.signal, setState, 'VOLUP', setHoldingTimer)}
            onPressOut={()=>clearTimeout(holdingTimer)}
          />
          <Button 
            iconName="volume-minus"
            onPressIn={()=>mediaOperation(getUrl(), fetchAbortController.current.signal, setState, 'VOLDOWN', setHoldingTimer)}
            onPressOut={()=>clearTimeout(holdingTimer)}
          />
        </View>
        
        <View style={styles.btnsContainer}>
          <Button 
            iconName="cursor-default-click"
            text='Touchpad / Keyboard'
            iconSize={30}
            onPress={() => {
              setTouchPadVisible(true);
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
            }}
          />
        </View>
        <View style={styles.serverState}>
          {
            state === AppStates.Pinging ?
            <ActivityIndicator size="large" color="white"/> :
            <MaterialCommunityIcons
              name={state === AppStates.Unreachable ? 'connection' : 'check-circle'}
              color={state === AppStates.Unreachable ? '#FF3B3B' : "#3BFF70"}
              size={40}
            />
          }
        </View>
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
    marginBottom: 30,
    marginRight: 5
  },
  optionBtn: {
    margin: 8,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 25,
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
    marginBottom: 30,
    textAlign: 'center'
  },
  btnsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  serverState: {
    marginTop: 20,
    alignItems: "center"
  }
});

export default Home;
