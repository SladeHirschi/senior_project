
import React, { useEffect, useState } from 'react';
import { Button, View, StyleSheet, TextInput, Text, TouchableOpacity, Image, LogBox, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { WEBCLIENTID, BASE_URL } from '@env'
import axios from 'axios';
import * as Google from 'expo-auth-session/providers/google';


import GoogleLogo from '../../../assets/images/google-icon.png'
import normalize from '../../../assets/fontSize.js';
import { COLORS } from '../../../assets/colors.js';
import Loading from '../../../assets/images/loading.gif'


LogBox.ignoreAllLogs();

export default function LoginScreen({ navigation, route }) {

    
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: WEBCLIENTID,
    });
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (response?.type === 'success') {
            fetchUserInfo(response.authentication.accessToken)
        }
    }, [response])

    function fetchUserInfo(token) {
        var profileData;
        axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }).then(response => {
            profileData = response.data
            axios.post(BASE_URL + '/users', profileData).then(response => {
                navigation.navigate('Tabs', { screen: 'Home', username: profileData.name})
            })
        });
    }

    function login() {
        if (email.length < 1 || password.length < 1) {
            Alert.alert("Email and password must be longer than 0 characters");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Password must be longer than 6 characters");
            return;
        }
        setLoading(true)
        axios.post(BASE_URL + '/login', {email: email, password: password}).then(response => {
            setLoading(false);
            navigation.navigate('Tabs', { screen: 'Home' })
        }).catch(error => {
            setLoading(false);
            if (error.message.includes("401")) {
                Alert.alert("Failure", "Email does not exist")
                return;
            } else if (error.message.includes("403")) {
                Alert.alert("Failure", "Incorrect Password")
                return;
            }
            Alert.alert("Failure", "Login failed");
        })
    }

    if (loading) {
        return (
            <View style={{ alignItems: 'center' }}>
                <Image source={Loading} style={{ marginTop: '50%' }} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.body}>

                <Text style={styles.loginTitle}>Login</Text>

                <View style={styles.inputs}>
                    <View style={styles.input}>
                        <FontAwesomeIcon icon={faEnvelope} size={25} color={'lightgray'} />

                        <TextInput
                            style={styles.textInput}
                            placeholder="Email"
                            autoCapitalize='none'
                            onChangeText={newText => setEmail(newText)}
                        />
                    </View>

                    <View style={styles.input}>
                        <FontAwesomeIcon icon={faLock} size={25} color={'lightgray'} />

                        <TextInput
                            style={styles.textInput}
                            placeholder="Password"
                            secureTextEntry={true}
                            autoCapitalize='none'
                            onChangeText={newText => setPassword(newText)}
                        />
                    </View>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        title="Login"
                        onPress={login}
                    >
                        <Text style={{ fontSize: normalize(14) }}>Login</Text>
                    </TouchableOpacity>
                    <View>
                        <TouchableOpacity onPress={() => promptAsync()} style={styles.googleButton}>
                            <Image source={GoogleLogo} />
                            <Text style={styles.googleText}>Sign in with Google</Text>
                            <View style={{ flex: 0.3 }}></View>
                        </TouchableOpacity>
                    </View>
                    <Button style={styles.button} title="Don't have account? Sign Up" onPress={() => navigation.navigate('SignUp')} />
                </View>
            </View>
        </View>

    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '10%',
        justifyContent: 'center',
        backgroundColor: '#f7f7f7'
    },
    body: {
        flex: 0.85,
        alignItems: 'center'
    },
    loginTitle: {
        flex: 0.15,
        fontSize: normalize(36),
        color: '#525252'
    },
    inputs: {
        flex: 0.25,
        width: '100%',
    },
    input: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderBottomColor: 'lightgray',
        padding: 10,
        marginVertical: '5%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 25,
        borderColor: '#bfbfbf',
        shadowColor: '#171717',
        shadowOffset: { height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    textInput: {
        flex: 1,
        fontSize: normalize(16),
        marginLeft: '5%',
    },
    buttonsContainer: {
        flex: 0.5,
        marginTop: '10%',
        width: '100%',

    },
    loginButton: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        borderBottomColor: 'lightgray',
        marginVertical: '4%',
        backgroundColor: COLORS.MainColor,
        borderWidth: 1,
        borderRadius: 25,
        borderColor: '#bfbfbf',
        shadowColor: '#171717',
        shadowOffset: { height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    button: {
        fontSize: normalize(12)
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 25,
        borderColor: '#bfbfbf',
        shadowColor: '#171717',
        shadowOffset: { height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        backgroundColor: 'white'
    },
    googleText: {
        fontSize: normalize(14),
        fontWeight: '500'
    }
})
