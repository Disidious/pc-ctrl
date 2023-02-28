import { StyleProp, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native'

import { MaterialCommunityIcons } from '@expo/vector-icons'

type Props = {
  iconName: any;
  iconSize?: number;
  iconStyle?: StyleProp<TextStyle>;
  btnStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

const Button: React.FC<Props> = (props) => {
  return (
    <TouchableOpacity 
    onPress={props.onPress}
    onPressIn={props.onPressIn}
    onPressOut={props.onPressOut}
    style={[styles.mediaBtn, props.btnStyle]}
    >
        <MaterialCommunityIcons
          name={props.iconName}
          style={props.iconStyle}
          size={props.iconSize ?? 40}
        />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mediaBtn: {
    backgroundColor: "white",
    margin: 10,
    color: "black", 
    padding: 10, 
    borderRadius: 100
  }
});

export default Button;