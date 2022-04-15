import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { BASE_URL } from '@env'
import BudgetCard from '../components/BudgetCard';
import axios from 'axios';
import normalize from '../../../assets/fontSize';


export default function HomeScreen({ navigation, route, setTitle }) {

    const isFocused = useIsFocused();

    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        if (isFocused) {
            setTitle('Budgets')
        }
    }, [isFocused]);


    useEffect(() => {
        axios.get(BASE_URL + '/budgets').then(response => {
            console.log(response.data)
            if (response.data) {
                setBudgets(response.data)
            }
        })
    }, [isFocused])

    return (
        <ScrollView style={styles.container}>
            {budgets && budgets.length > 0 ? budgets.map((budget, index) => {
                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => navigation.navigate('Compare', { budget: budget })}
                    >
                        <BudgetCard title={budget.name} totalMoney={budget.totalBudget} expenses={budget.expenses} />
                    </TouchableOpacity>
                )
            }) : <View style={{justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: normalize(18)}}>You have no budgets right now (create one by clicking the "+"" button in the lower left hand corner)</Text></View>}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '50%',
        backgroundColor: 'white',
        paddingHorizontal: '8%',
        paddingVertical: '10%',
    },
    card: {
        flex: 1,
        height: 120,
        justifyContent: 'center',
        marginVertical: '5%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#A6A6A6',
        shadowColor: '#171717',
        shadowOffset: { height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    }
})