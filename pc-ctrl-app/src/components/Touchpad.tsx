import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet } from 'react-native'

import { StatusBar } from 'expo-status-bar';
import { View, TextInput, BackHandler, Dimensions, GestureResponderEvent, KeyboardAvoidingView, Platform, SafeAreaView, Text, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { Button } from 'components';

import {socketConnect, socketClose} from 'helpers/WebSocket';
import errorMessages from 'constants/ErrorMessages';

const touchPadDelay = 55
var lastTouchRequestDate: number;
var lastKeyPressDate: number = 0;

type Props = {
  setError: (error: string) => void;
  setVisibility: (visible: boolean) => void;
  socketUrl: string;
}

const Touchpad: React.FC<Props> = (props) =>  {
  const [touch, setTouch] = useState<{[key:string]: [number, number]}>({});
  const keyboardInputRef = React.createRef<TextInput>();

  const onBack = () => {
    socketClose(socket);
    props.setVisibility(false);
    return true;
  }

  useEffect(()=>{
    BackHandler.addEventListener(
      "hardwareBackPress",
      onBack
    )
  }, []);

  const socket = useMemo(() => socketConnect(props.socketUrl, props.setError, onBack), []);
  
  const setTouchPosition = (touchId: string, x: number, y: number) => {
    let newTouchPos = Object.assign({}, touch);
    newTouchPos[touchId] = [x, y];
    setTouch(newTouchPos);
  }

  const removeTouch = (touchId: string) => {
    let newTouchPos = Object.assign({}, touch);
    delete newTouchPos[touchId];
    setTouch(newTouchPos);
  }

  const onTouchStart = (e: GestureResponderEvent) => {
    setTouchPosition(e.nativeEvent.identifier, e.nativeEvent.pageX, e.nativeEvent.pageY);

    try {
      socket.send('START;' + e.nativeEvent.pageX + ';' + e.nativeEvent.pageY + ';' + Date.now());
    } catch(e) {
      props.setError(errorMessages.connectionError);
      onBack();
    }
  }

  const onTouchMove = (e: GestureResponderEvent) => {
    setTouchPosition(e.nativeEvent.identifier, e.nativeEvent.pageX, e.nativeEvent.pageY);

    if(lastTouchRequestDate && Date.now() - lastTouchRequestDate < touchPadDelay) {
      return;
    }
    lastTouchRequestDate = Date.now();

    try {
      socket.send('MOVING;' + e.nativeEvent.touches[0].pageX + ';' + e.nativeEvent.touches[0].pageY);
    } catch(e) {
      props.setError(errorMessages.connectionError);
      onBack();
    }
  }

  const onTouchEnd = (e: GestureResponderEvent) => {
    removeTouch(e.nativeEvent.identifier);

    try {
      socket.send('END;' + e.nativeEvent.pageX + ';' + e.nativeEvent.pageY + ';' + Date.now());
    } catch(e) {
      props.setError(errorMessages.connectionError);
      onBack();
    }
  }

  return (
      <SafeAreaView style={styles.container}>
        <MaterialCommunityIcons
          name="cursor-default-click" 
          size={90}
          style={styles.backgroundIcon} 
        >
          Touchpad
        </MaterialCommunityIcons>
        <View 
          style={styles.touchpad}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        <TextInput 
          style={styles.hiddenInput} 
          disableFullscreenUI={true}
          autoCapitalize='none'
          ref={keyboardInputRef}
          value={'12345'}
          autoCorrect={false}
          multiline={true}
          onKeyPress={(e)=>{
            if(e.timeStamp - lastKeyPressDate < 30) {
              return;
            }
            lastKeyPressDate = e.timeStamp;
            if(socket.readyState === WebSocket.OPEN) {
              socket.send('TYPE;' + e.nativeEvent.key);
            }
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Button
            iconName="keyboard"
            iconSize={30}
            iconStyle={styles.keyboardIcon}
            btnStyle={styles.keyboardBtn}
            onPress={() => {
              keyboardInputRef.current?.blur();
              if(Keyboard.isVisible()) {
                Keyboard.dismiss();
              } else {
                keyboardInputRef.current?.focus();
              }
            }}
          />
        </KeyboardAvoidingView>
        {
          Object.keys(touch).map((e, i) => {
            return (
              <View key={i}
              style={[styles.touchCircle, 
                {
                  left: touch[e][0] - 20,
                  top: touch[e][1] - 20
                }
              ]}
              />
            )
          })
        }
        <Button 
          iconName={'keyboard-backspace'}
          iconSize={30}
          btnStyle={styles.backBtn}
          iconStyle={styles.backIcon}
          onPress={onBack}
        />
        <StatusBar style="light" hidden={true}/>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white", 
    height: "100%", 
    width: "100%"
  },
  touchpad: {
    height: "100%", 
    width: "100%",
    flex: 1
  },
  backBtn: {
    position: "absolute",
    backgroundColor: "black",
    left: Platform.OS === 'ios' ? 44 : 10,
    top: 5
  },
  backIcon: {
    color: "white"
  },
  keyboardBtn: {
    backgroundColor: "black",
    color: "black",  
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: "99%",
    padding: 2,
    margin: 5
  },
  backgroundIcon: {
    position: 'absolute', 
    justifyContent: 'center', 
    alignSelf: 'center', 
    top: Math.min(Dimensions.get('window').height, Dimensions.get('window').width)/2 - (90/2), 
    color: 'rgb(0,0,0)',
    opacity: 0.2
  },
  touchCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'black',
    borderWidth: 2.5,
    borderRadius: 100, 
    width: 40, 
    height: 40,
    position: 'absolute'
  },
  hiddenInput: {
    height: 0.5,
    width: "100%", 
    backgroundColor:'red', 
    right: 10000
  },
  keyboardIcon: {
    color: "white",
  }
});

export default Touchpad;
