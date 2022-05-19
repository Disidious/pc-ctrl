import { StyleSheet, Dimensions } from 'react-native'
 
 export default styles = StyleSheet.create({
  upperContainer: {
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    height: Math.max(Dimensions.get('window').height, Dimensions.get('window').width) * 0.15, 
    marginTop: Math.max(Dimensions.get('window').height, Dimensions.get('window').width) * 0.01
  },
  
  settingsBtn: {
    backgroundColor: "white",
    margin: 10,
    color: "black", 
    padding: 10, 
    borderRadius: 100,
    alignSelf: 'flex-end',
    top: 25,
    right: 5,
  },

  ipModal: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  ipView: {
    backgroundColor: "black", 
    width: "100%", 
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  ipInput: {
    width: "90%",
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "black",
    backgroundColor: "white",
    borderRadius: 100
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
    resizeMode: 'stretch'
  },

  divider: {
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    width: '70%',
    alignSelf: 'center',
    margin: 10
  },

  wrapper: {
    flex: 1,
    backgroundColor: 'black'
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
    marginBottom: 50,
    textAlign: 'center'
  },

  mediaBtnContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  mediaBtn: {
    backgroundColor: "white",
    margin: 10,
    color: "black", 
    padding: 10, 
    borderRadius: 100
  }
});