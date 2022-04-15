import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import LoginScreen from './screens/LoginScreen.js';
import CompareScreen from './screens/CompareScreen.js';
import AddExpenseScreen from './screens/AddExpenseScreen.js';
import Tabs from './screens/Tabs.js';
import SignUp from './screens/SignUpScreen.js'
import { COLORS } from '../../assets/colors.js';

const Stack = createNativeStackNavigator();

export default function App() {

	const [title, setTitle] = useState('');

	return (
		<NavigationContainer>
			<StatusBar/>
			<Stack.Navigator
				screenOptions={{
					headerStyle: {
						backgroundColor: COLORS.MainColor,
					},
					headerTintColor: '#fff',
					// headerTitleStyle: {
						// fontSize: '26'
					// },
					headerBackVisible: false
				}}
			>
				<Stack.Screen options={{ title: 'Budget Planner' }} name="Login" component={LoginScreen} />
				<Stack.Screen options={{ title: 'Budget Planner' }} name="SignUp" component={SignUp} />
				<Stack.Screen options={{ title: 'Budget Planner', headerBackVisible: true, headerBackTitle: 'Back' }} name="Compare" component={CompareScreen} />
				<Stack.Screen options={{ title: 'Budget Planner', headerBackVisible: true, headerBackTitle: 'Back' }} name="AddExpense" component={AddExpenseScreen} />
				<Stack.Screen options={{ title: title }} name="Tabs" component={Tabs} initialParams={{ setTitle: setTitle }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};
