import { StyleProp, TextStyle, TouchableOpacity, ViewStyle, StyleSheet, Text } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons'

type Props = {
  text?: string;
  textStyle?: StyleProp<TextStyle>;
  iconName: any;
  iconSize?: number;
  iconStyle?: StyleProp<TextStyle>;
  btnStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disable?: boolean;
}

const Button: React.FC<Props> = (props) => {
  return (
    <TouchableOpacity 
    onPress={props.onPress}
    onPressIn={props.onPressIn}
    onPressOut={props.onPressOut}
    style={[styles.button, props.btnStyle]}
    disabled={props.disable}
    >
        <MaterialCommunityIcons
          name={props.iconName}
          style={props.iconStyle}
          size={props.iconSize ?? 40}
        />
        {
          props.text &&
          <Text
          style={[styles.text, props.textStyle]}
          >
            {props.text}
          </Text>
        }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "white",
    margin: 10,
    color: "black", 
    padding: 10, 
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontSize: 15,
    marginLeft: 5,
    fontWeight: "bold"
  }
});

export default Button;