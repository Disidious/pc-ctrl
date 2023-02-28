import { Modal, View, Text, TextInput } from 'react-native';
import { StyleSheet } from 'react-native'

import { MaterialCommunityIcons } from '@expo/vector-icons'

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
      animationType="slide"
      transparent={true}
      visible={props.visible}
      onRequestClose={() => props.setVisibility(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.inputLabel}>Server IP</Text>
          <TextInput
            style={styles.input}
            value={props.ip}
            onChangeText={(text) => props.setIp(text)}
          />
          <MaterialCommunityIcons.Button
            name="check"
            style={styles.doneIcon}
            color="black"
            onPress={props.onDone}
          >
            <Text style={styles.doneBtnText}>
              Done
            </Text>
          </MaterialCommunityIcons.Button>
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
  doneIcon: {
    backgroundColor: "white"
  },
  doneBtnText: {
    color: "black", 
    fontWeight: "bold"
  }
});

export default IpModal;