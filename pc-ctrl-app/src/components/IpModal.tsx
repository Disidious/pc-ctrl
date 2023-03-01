import { Modal, View, Text, TextInput } from 'react-native';
import { StyleSheet } from 'react-native'

import Button from './Button';

type Props = {
  visible: boolean;
  ip: string;
  setVisibility: (visible: boolean) => void;
  setIp: (ip: string) => void;
  onDone: () => void;
}

const IpModal: React.FC<Props> = (props) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.visible}
      onRequestClose={() => props.setVisibility(false)}
    >
      <View
      style={styles.modalShadow}
      />
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.inputLabel}>Server IP</Text>
          <TextInput
            style={styles.input}
            value={props.ip}
            onChangeText={(text) => props.setIp(text)}
          />
          <Button 
            btnStyle={styles.doneBtn}
            iconName={'check'} 
            iconSize={20}
            text={'Done'}
            onPress={props.onDone}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  modalContent: {
    backgroundColor: "black", 
    width: "100%", 
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  modalShadow: {
    backgroundColor: "black",
    opacity: 0.5,
    height: "100%",
    width: "100%",
    position: "absolute"
  },
  input: {
    width: "90%",
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "black",
    backgroundColor: "white",
    borderRadius: 100
  },
  inputLabel: {
    color: "white", 
    fontWeight: "bold"
  },
  doneBtn: {
    borderRadius: 5
  }
});

export default IpModal;