import styles from '../styles.js'
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function Button(props) {
    return (
        <TouchableOpacity 
        onPress={()=>props.hasOwnProperty('press') ? props.press() : null}
        onPressIn={()=>props.hasOwnProperty('pressIn') ? props.pressIn() : null}
        onPressOut={()=>props.hasOwnProperty('pressOut') ? props.pressOut() : null}
        style={props.hasOwnProperty('btnStyle') ? props.btnStyle : null}
        >
            <MaterialCommunityIcons
              name={props.iconName} 
              size={props.hasOwnProperty('iconSize') ? props.iconSize : 40}
              style={props.hasOwnProperty('iconStyle') ? props.iconStyle : styles.mediaBtn} 
            />
        </TouchableOpacity>
    );
}