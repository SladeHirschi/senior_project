import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart, ProgressChart } from 'react-native-chart-kit';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';

import { BASE_URL } from '@env'
import normalize from '../../../assets/fontSize.js';
import { COLORS } from '../../../assets/colors.js'


export default function CompareScreen({ navigation, route }) {

    const isFocused = useIsFocused();

    const [budget, setBudget] = useState({});
    const [showActual, setShowActual] = useState(false);

    useEffect(() => {
        setBudget(route.params.budget);
        route.params.budget.expenses.map(expense => {
            if (expense.actualAmount > 0) {
                setShowActual(true);
            }
        })
    }, [route])

    useEffect(() => {
        axios.get(BASE_URL + '/budgets').then(response => {
            if (response.data) {
                response.data.map(elt => {
                    if (elt.id == budget.id) {
                        setBudget(elt);
                    }
                })
            }
        })
    }, [isFocused])

    function map(expenses) {
        if (expenses) {
            expenses.map((expense) => {
                expense.color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
                expense.amount = parseInt(expense.amount);
                expense.legendFontColor = '#000000'
                expense.legendFontSize = normalize(12)
            })
        } else {
            expenses = [];
        }
        return expenses;
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={{ fontSize: normalize(26) }}>{budget.name}</Text>
                <Text style={{ fontSize: normalize(18), color: '#69A45B' }}>{'Amount: $' + budget.totalBudget}</Text>
            </View>

            <View>
                <View style={styles.projectedContainer}>
                    <View style={{ height: 'auto', width: '100%', alignItems: 'center', marginBottom: '5%' }}>
                        <Text style={{ fontSize: normalize(26), textDecorationLine: 'underline' }}>Projected</Text>
                    </View>

                    <View style={{ flexDirection: 'row', flexGrow: 1 }}>
                        <View style={{ width: '50%', justifyContent: 'center' }}>
                            <PieChart
                                data={map(budget.expenses)}
                                width={300}
                                height={180}
                                chartConfig={{
                                    backgroundColor: '#1cc910',
                                    backgroundGradientFrom: '#eff3ff',
                                    backgroundGradientTo: '#efefef',
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                    },
                                }}
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                }}
                                hasLegend={false}
                                accessor="amount"
                                backgroundColor="transparent"
                            />
                        </View>

                        <View style={{ width: '50%', justifyContent: 'center' }}>
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <Text style={{ textDecorationLine: 'underline', fontSize: normalize(22), marginBottom: '10%' }}>Expenses</Text>

                                {budget.expenses &&
                                    budget.expenses.map((expense, index) => {
                                        return (
                                            <View key={index} style={{ width: '100%', alignItems: 'start' }}>
                                                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: normalize(8), color: expense.color }}>{'\u2B24'}</Text>
                                                    <Text style={{ fontSize: normalize(18), marginLeft: '5%' }}>{expense.name}</Text>
                                                    <Text style={{ fontSize: normalize(18), marginLeft: '5%' }}>{'$' + expense.amount}</Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                }

                                <View style={{ alignSelf: 'start' }}>
                                    <Text style={{ fontSize: normalize(18), marginTop: '5%', textAlign: 'center' }}>{'Total Expenses: $' + (budget.expenses ? budget.expenses.reduce((tot, expense) => { return tot + parseInt(expense.amount) }, 0) : '')}</Text>
                                </View>
                            </View>

                        </View>
                    </View>

                </View>

                <View style={styles.actualContainer}>
                    <View style={{ height: 'auto', width: '100%', alignItems: 'center', marginBottom: '5%' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: normalize(24), textDecorationLine: 'underline' }}>Actual</Text>
                            { showActual && <TouchableOpacity
                                onPress={() => navigation.navigate('AddExpense', { budget: budget })}
                                style={{marginLeft: '2%', marginTop: '2%', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightgray', width: '10%' }}
                            >
                                <FontAwesomeIcon icon={faPen} size={20} color={'black'} />

                            </TouchableOpacity>}
                        </View>
                    </View>

                    {showActual ?

                        <View style={{ flexDirection: 'row', flexGrow: 1 }}>
                            <View style={{ width: '60%', justifyContent: 'flex-start'}}>
                                <ProgressChart
                                    data={budget.expenses.map(expense => {
                                        return expense.actualAmount / expense.amount < 1 ? expense.actualAmount / expense.amount : 1;
                                    })}
                                    width={180}
                                    height={200}
                                    hideLegend={true}
                                    chartConfig={{
                                        backgroundColor: 'white',
                                        backgroundGradientFrom: 'white',
                                        backgroundGradientTo: 'white',
                                        decimalPlaces: 2,
                                        color: (opacity = 1) => `rgba(16, 120, 255, ${opacity})`,
                                        style: {
                                            borderRadius: 16,
                                        },
                                    }}
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16,
                                    }}
                                />
                            </View>

                            <View style={{ width: '40%', justifyContent: 'center' }}>
                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    <Text style={{ textDecorationLine: 'underline', fontSize: normalize(22), marginBottom: '10%' }}>Expenses</Text>

                                    {budget.expenses &&
                                        budget.expenses.map((expense, index) => {
                                            return (
                                                <View key={index} style={{ width: '100%', alignItems: 'flex-end' }}>
                                                    <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={{ fontSize: normalize(8), color: expense.color }}>{'\u2B24'}</Text>
                                                        <Text style={{ fontSize: normalize(18), marginLeft: '5%' }}>{expense.name}</Text>
                                                        <Text style={{ fontSize: normalize(18), marginLeft: '5%', color: expense.amount < expense.actualAmount ? 'red' : 'green' }}>{'$' + expense.actualAmount}</Text>
                                                    </View>
                                                </View>
                                            )
                                        })
                                    }

                                    <View style={{ alignSelf: 'start' }}>
                                        <Text style={{ fontSize: normalize(18), marginTop: '5%', textAlign: 'center' }}>{'Total Expenses: $' + (budget.expenses ? budget.expenses.reduce((tot, expense) => { return tot + parseInt(expense.actualAmount) }, 0) : '')}</Text>
                                    </View>
                                </View>

                            </View>
                        </View>

                        :
                        <View>
                            <Text style={{ fontSize: normalize(18), textAlign: 'center' }}>Nothing to display yet please add actual expenses.</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AddExpense', { budget: budget })}
                                style={{ alignSelf: 'center', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.SecondaryColor, width: '50%', height: normalize(36), marginTop: '25%' }}
                            >
                                <Text style={{ fontSize: normalize(14) }}>Add Actual Expenses</Text>
                            </TouchableOpacity>
                        </View>

                    }
                </View>
            </View>

        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    header: {
        alignItems: 'baseline',
        height: 'auto',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
    },
    projectedContainer: {
        height: '45%',
        width: '100%',
        paddingHorizontal: '2%',
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    actualContainer: {
        height: '50%',
        width: '100%',
        paddingHorizontal: '5%',
    },
})
