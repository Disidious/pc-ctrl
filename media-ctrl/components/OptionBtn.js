import styles from '../styles.js'
import { TouchableOpacity } from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons'

export default function OptionBtn(props) {
    return (
        <TouchableOpacity 
        onPress={()=>props.hasOwnProperty('optionPress') ? props.optionPress() : null}
        onPressIn={()=>props.hasOwnProperty('optionPressIn') ? props.optionPressIn() : null}
        onPressOut={()=>props.hasOwnProperty('optionPressOut') ? props.optionPressOut() : null}
        >
            <MaterialCommunityIcons
              name={props.iconName} 
              size={props.hasOwnProperty('iconSize') ? props.iconSize : 30}
              style={styles.optionBtn} 
            />
        </TouchableOpacity>
    );
}