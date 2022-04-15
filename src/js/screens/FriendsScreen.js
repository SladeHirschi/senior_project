import React, {useEffect} from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Text, View } from 'react-native'
import normalize from '../../../assets/fontSize';

export default function FriendsScreen({navigation, setTitle}) {

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            setTitle('Friends');
        }
    }, [isFocused]);

    return (
        <View style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: normalize(24), textAlign: 'center'}}>Functionality coming Soon!</Text>
        </View>
    );
}