import React, { useEffect, useState } from 'react';
import { Button, View, KeyboardAvoidingView, StyleSheet, TextInput, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

import { BASE_URL } from '@env'
import normalize from '../../../assets/fontSize.js';
import { COLORS } from '../../../assets/colors.js';
import Loading from '../../../assets/images/loading.gif'
import axios from 'axios';


export default function LoginScreen({ navigation }) {

    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',

    });
    const [loading, setLoading] = useState(false);
    const [inputEntered, setInputEntered] = useState()


    function createUser() {
        setLoading(true)
        var userToCreate = { ...user }
        for (var key in user) {
            if (userToCreate[key].length < 1) {
                Alert.alert("Failure", toCapitalizedWords(key) + " must not be empty.");
                setLoading(false);
                return;
            }
            userToCreate[key] = user[key].trim()
        }
        if (user.password.length < 6) {
            Alert.alert("Failure", "Your password must be longer than 6 characers");
            setLoading(false);
            return;
        }
        axios.post(BASE_URL + '/users', userToCreate).then(response => {
            setLoading(false);
            navigation.navigate('Tabs', { screen: 'Home', username: user.firstName })
        }).catch(error => {
            setLoading(false);
            Alert.alert("Failure", "Your account creation failed");
        })
    }

    function toCapitalizedWords(word) {
        var words = word.match(/[A-Za-z][a-z]*/g) || [];

        return words.map(capitalize).join(" ");
    }


    function capitalize(word) {
        return word.charAt(0).toUpperCase() + word.substring(1);
    }

    if (loading) {
        return (
            <View style={{ alignItems: 'center' }}>
                <Image source={Loading} style={{ marginTop: '50%' }} />
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.body}>

                <Text style={styles.loginTitle}>Sign Up</Text>

                <View style={styles.inputs}>

                    <View style={{ ...styles.input, marginVertical: inputEntered ? '2%' : '4%' }}>
                        <FontAwesomeIcon icon={faUser} size={25} color={'lightgray'} />

                        <TextInput
                            onFocus={() => setInputEntered(true)}
                            onBlur={() => setInputEntered(false)}
                            style={styles.textInput}
                            placeholder="First Name"
                            onChangeText={inputText => setUser({ ...user, firstName: inputText })}
                        />
                    </View>

                    <View style={{ ...styles.input, marginVertical: inputEntered ? '2%' : '4%' }}>
                        <FontAwesomeIcon icon={faUser} size={25} color={'lightgray'} />

                        <TextInput
                            onFocus={() => setInputEntered(true)}
                            onBlur={() => setInputEntered(false)}
                            style={styles.textInput}
                            placeholder="Last Name"
                            onChangeText={inputText => setUser({ ...user, lastName: inputText })}
                        />
                    </View>

                    <View style={{ ...styles.input, marginVertical: inputEntered ? '2%' : '4%' }}>
                        <FontAwesomeIcon icon={faEnvelope} size={25} color={'lightgray'} />

                        <TextInput
                            onFocus={() => setInputEntered(true)}
                            onBlur={() => setInputEntered(false)}
                            autoCapitalize='none'
                            style={styles.textInput}
                            placeholder="Email"
                            onChangeText={inputText => setUser({ ...user, email: inputText })}
                        />
                    </View>

                    <View style={{ ...styles.input, marginVertical: inputEntered ? '2%' : '4%' }}>
                        <FontAwesomeIcon icon={faLock} size={25} color={'lightgray'} />

                        <TextInput
                            onFocus={() => setInputEntered(true)}
                            onBlur={() => setInputEntered(false)}
                            secureTextEntry={true}
                            autoCapitalize='none'
                            style={styles.textInput}
                            placeholder="Password"
                            onChangeText={inputText => setUser({ ...user, password: inputText })}
                        />
                    </View>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={{ ...styles.loginButton, marginVertical: inputEntered ? '2%' : '4%' }}
                        title="Login"
                        onPress={createUser}
                    >
                        <Text>Sign Up</Text>
                    </TouchableOpacity>
                    <Button style={styles.button} title="Back To Login" onPress={() => navigation.navigate('Login')} />
                </View>
            </View>

        </KeyboardAvoidingView>
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
        alignItems: 'center',
    },
    loginTitle: {
        flex: 0.15,
        fontSize: normalize(36),
        color: '#525252'
    },
    inputs: {
        flex: 0.65,
        width: '100%',
        marginTop: '5%'
    },
    input: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderBottomColor: 'lightgray',
        padding: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 25,
        borderColor: '#bfbfbf',
        shadowColor: '#171717',
        shadowOffset: { height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        minHeight: '6%'
    },
    textInput: {
        flex: 1,
        fontSize: normalize(15),
        marginLeft: '5%',
    },
    buttonsContainer: {
        flex: 0.5,
        marginTop: '10%',
        width: '100%',

    },
    loginButton: {
        flex: 0.28,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        borderBottomColor: 'lightgray',
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
    }
})
