import styles from '../styles.js'
import { TouchableOpacity } from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons'

export default function OperationBtn(props) {
    return (
        <TouchableOpacity 
        onPress={()=>props.hasOwnProperty('operationPress') ? props.operationPress() : null}
        onPressIn={()=>props.hasOwnProperty('operationPressIn') ? props.operationPressIn() : null}
        onPressOut={()=>props.hasOwnProperty('operationPressOut') ? props.operationPressOut() : null}
        >
            <MaterialCommunityIcons
              name={props.iconName} 
              size={props.hasOwnProperty('iconSize') ? props.iconSize : 40}
              style={styles.mediaBtn} 
            />
        </TouchableOpacity>
    );
}