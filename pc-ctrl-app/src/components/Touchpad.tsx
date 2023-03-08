import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet } from 'react-native'

import { StatusBar } from 'expo-status-bar';
import { View, TextInput, BackHandler, Dimensions, GestureResponderEvent, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ScreenOrientation from 'expo-screen-orientation';

import { Button } from 'components';

import TouchpadSocketHandler from "handlers/TouchpadSocketHandler";
import { useRef } from "react";

import AppStates from "constants/AppStates";

type Props = {
  setState: (state: AppStates) => void;
  setVisibility: (visible: boolean) => void;
  socketUrl: string;
}

const touchPadDelay = 55;

const Touchpad: React.FC<Props> = (props) =>  {
  const [touch, setTouch] = useState<{[key: string]: [number, number]}>({});
  const keyboardInputRef = React.createRef<TextInput>();
  const lastKeyPressDate = useRef(0);
  const lastTouchRequestDate = useRef<number>();

  const onBack = useCallback(() => {
    socket.closeSocket();
    props.setVisibility(false);
    return true;
  }, [])

  const onFail = useCallback(() => {
    props.setState(AppStates.UNREACHABLE);
    onBack();
  }, [])

  useEffect(()=>{
    BackHandler.addEventListener(
      "hardwareBackPress",
      onBack
    )
  }, []);

  const socket = useMemo(() => new TouchpadSocketHandler(props.socketUrl, onFail), []);
  
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

  const onTouchStart = useCallback((e: GestureResponderEvent) => {
    setTouchPosition(e.nativeEvent.identifier, e.nativeEvent.pageX, e.nativeEvent.pageY);
    socket.startTouch(e.nativeEvent.pageX, e.nativeEvent.pageY);
  }, [])

  const onTouchMove = useCallback((e: GestureResponderEvent) => {
    setTouchPosition(e.nativeEvent.identifier, e.nativeEvent.pageX, e.nativeEvent.pageY);

    if(lastTouchRequestDate.current && Date.now() - lastTouchRequestDate.current < touchPadDelay) {
      return;
    }
    lastTouchRequestDate.current = Date.now();

    socket.moveTouch(e.nativeEvent.touches[0].pageX, e.nativeEvent.touches[0].pageY);
  }, [])

  const onTouchEnd = useCallback((e: GestureResponderEvent) => {
    removeTouch(e.nativeEvent.identifier);
    socket.endTouch(e.nativeEvent.pageX, e.nativeEvent.pageY);
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View 
        style={styles.touchpad}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <View style={styles.backgroundContainer}>
          <MaterialCommunityIcons
            name="cursor-default-click"
            size={60}
            adjustsFontSizeToFit={true}
            style={styles.backgroundIcon} 
          >
            Touchpad
          </MaterialCommunityIcons>
        </View>
        <Button 
          iconName={'keyboard-backspace'}
          iconSize={30}
          btnStyle={styles.backBtn}
          iconStyle={styles.backIcon}
          onPress={onBack}
        />
      </View>
      <TextInput 
        style={styles.hiddenInput} 
        keyboardAppearance='dark'
        disableFullscreenUI={true}
        autoCapitalize='none'
        ref={keyboardInputRef}
        value={'12345'}
        autoCorrect={false}
        multiline={true}
        onKeyPress={(e)=>{
          if(e.timeStamp - lastKeyPressDate.current < 30 || e.nativeEvent.key === '12345') {
            return;
          }
          lastKeyPressDate.current = e.timeStamp;
          socket.type(e.nativeEvent.key);
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
      <StatusBar style="light" hidden={true}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1
  },
  touchpad: {
    height: "100%", 
    width: "100%",
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
    flex: 1
  },
  backBtn: {
    backgroundColor: "white",
    position: "absolute"
  },
  backIcon: {
    color: "black"
  },
  keyboardBtn: {
    backgroundColor: "white",
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    padding: 2,
    margin: 5
  },
  keyboardIcon: {
    color: "black",
  },
  backgroundContainer: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  backgroundIcon: {
    color: 'white',
    opacity: 0.2,
  },
  touchCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'white',
    borderWidth: 2.5,
    borderRadius: 100, 
    width: 55, 
    height: 55,
    position: 'absolute'
  },
  hiddenInput: {
    height: 0.5,
    width: "100%", 
    backgroundColor:'red', 
    right: 10000
  },
});

export default Touchpad;
