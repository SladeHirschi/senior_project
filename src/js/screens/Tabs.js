import React, {useEffect} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faHouseUser, faPlus, faUserFriends } from '@fortawesome/free-solid-svg-icons';

import HomeScreen from './HomeScreen';
import CreateScreen from './CreateScreen';
import FriendsScreen from './FriendsScreen';
import {COLORS} from '../../../assets/colors.js';
import { Alert } from 'react-native';

const Tab = createBottomTabNavigator();

export default function Tabs({ navigation, route }) {


    useEffect(() => {
        if (route.params.username) {
            Alert.alert("Welcome " + route.params.username)
        }
    }, [])
    return (
        <Tab.Navigator
            screenOptions={
                ({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;
                        if (route.name === 'Create') {
                            iconName = faPlus;
                        } else if (route.name === 'Friends') {
                            iconName = faUserFriends;
                        } else if (route.name === 'Home') {
                            iconName = focused ? faHouseUser : faHome;   
                        }
                        return <FontAwesomeIcon icon={iconName} size={30} color={color} />;
                    },
                    tabBarActiveTintColor: COLORS.MainColor,
                    tabBarInactiveTintColor: 'black',
                    tabBarStyle: {
                        backgroundColor: '#F0F0F0',
                    },
                    tabBarIconStyle: {
                        marginTop: 15
                    },
                    tabBarLabelStyle: {
                        fontSize: 14,
                        marginTop: 10
                    }
                })
            }
        >
            <Tab.Screen options={{ headerShown: false}} name="Create" children={() => <CreateScreen navigation={navigation} setTitle={route.params.setTitle}/>}/>
            <Tab.Screen options={{ headerShown: false }} name="Home" children={() => <HomeScreen navigation={navigation} setTitle={route.params.setTitle}/>}/>
            <Tab.Screen options={{ headerShown: false }} name="Friends" children={() => <FriendsScreen navigation={navigation} setTitle={route.params.setTitle}/>}/>
        </Tab.Navigator>

    );
}