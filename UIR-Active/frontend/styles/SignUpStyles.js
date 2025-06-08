import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      position: 'relative',
    width: '100%',
    height: 600,
    },
    logoImage: {
      width:500,
      height: 600,
      borderRadius: 15,
      marginTop: 30
      

    },
    gradient: {
      position: 'absolute',
      bottom: -315,
      height: '120%',
      width: '200%',
      
    },
    // topBackground: {
     
    //   justifyContent: 'flex-end',
    //   padding: 20,
    // },
    
    keyboardAvoid: {
      flex: 1,
    },
    content: {
      padding: 24,
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: 24,
      color: 'white',
      fontWeight: 'bold',
    },
    heading: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
       marginTop: 80,
      // marginBottom: 30
    },
    subheading: {
      fontSize: 16,
      color: '#666',
      marginBottom: 50,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 30,
      marginTop: 130,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#92a724',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      backgroundColor: '#F7F7F7',
      paddingHorizontal: 12,
    },
    input: {
      flex: 1,
      height: 50,
      paddingHorizontal: 8,
      color: '#333',
    },
    inputIcon: {
      marginRight: 10,
    },
    eyeIcon: {
      padding: 8,
    },
    // termsContainer: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   marginBottom: 24,
    // },
    // checkbox: {
    //   width: 20,
    //   height: 20,
    //   borderRadius: 4,
    //   borderWidth: 1,
    //   borderColor: '#6C63FF',
    //   marginRight: 10,
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   backgroundColor: agreeToTerms => agreeToTerms ? '#6C63FF' : 'transparent',
    // },
    // termsText: {
    //   flex: 1,
    //   fontSize: 14,
    //   color: '#666',
    // },
    // termsHighlight: {
    //   color: '#6C63FF',
    //   fontWeight: '600',
    // },
    button: {
      backgroundColor: '#92a724',
      borderRadius: 12,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: 'white', 
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 24,
    },
    buttonDisabled: {
      backgroundColor: '#92a724',
      shadowOpacity: 0.1,
    },
    buttonText: {
      color: '#021651',
      fontSize: 16,
      fontWeight: '600',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: '#E0E0E0',
    },
    dividerText: {
      color: '#999',
      paddingHorizontal: 12,
      fontSize: 14,
    },
    socialButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 24,
    },
    socialButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#F7F7F7',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signInText: {
      color: '#021651',
      fontSize: 14,
    },
    signInLink: {
      color: '#ff9522',
      fontWeight: '600',
      fontSize: 14,
      marginLeft: 5,
    },
  });
  export default styles;