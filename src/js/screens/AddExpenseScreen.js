import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { BASE_URL } from '@env'
import {COLORS} from '../../../assets/colors.js'
import normalize from '../../../assets/fontSize.js';
import axios from 'axios';


export default function AddExpenseScreen({ route }) {

    const [budget, setBudget] = useState({});
    const [expenseId, setExpenseId] = useState('');
    const [actualExpense, setActualExpense] = useState({});
    const [showActualExpenseModal, setShowActualExpenseModal] = useState(false);

    useEffect(() => {
        setBudget(route.params.budget)
    }, [route])

    function getBudget() {
        axios.get(BASE_URL + '/budgets').then(response => {
            if (response.data) {
                response.data.map(elt => {
                    if (elt.id == budget.id) {
                        setBudget(elt);
                    }
                })
            }
        })
    }

    function openActualExpenseModal(expense) {
        setExpenseId(expense.id);
        setShowActualExpenseModal(true);
    }

    function addActualExpense() {
        if (!actualExpense.amount) {
            alert("Amount must be filled.");
            return;
        }
        let tempExpense = {...actualExpense};
        tempExpense['expenseId'] = expenseId;
        axios.post(BASE_URL + '/expenses', tempExpense).then(response => {
            setShowActualExpenseModal(false);
            setActualExpense(null);
            getBudget();
        })
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={{ fontSize: normalize(26) }}>{budget.name}</Text>
                <Text style={{ fontSize: normalize(18), color: '#69A45B' }}>{'Amount: $' + budget.totalBudget}</Text>
            </View>

            <View style={styles.body}>
                <View style={{height: 'auto', alignItems: 'center', marginTop: '3%'}}>
                    <Text style={{fontSize: normalize(26)}}>Actual Expenses</Text>
                </View>

                <View style={{alignItems: 'center', marginTop: '10%'}}>
                    <Text style={{fontSize: normalize(20), textDecorationLine: 'underline'}}>
                        {'Budget: $' + (budget.expenses ? budget.expenses.reduce((tot, expense) => { return tot + (expense.actualAmount ? parseInt(expense.actualAmount) : 0) }, 0) : 0) + '/$' + budget.totalBudget}
                    </Text>
                </View>

                <View style={{height: '100%'}}>
                    <ScrollView style={{marginTop: '5%'}}>
                        {budget.expenses &&
                            budget.expenses.map((expense, index) => {
                                return (
                                    <View key={index} style={styles.card}>
                                        <Text style={{fontSize: normalize(18)}}>{expense.name}</Text>
                                        <Text 
                                            style={{
                                                fontSize: normalize(18), 
                                                color: expense.amount < expense.actualAmount ? 'red' : 'green'
                                            }}
                                        >
                                            {'$' + (expense.actualAmount ? expense.actualAmount : 0) + '/$' + expense.amount}
                                        </Text>
                                        <TouchableOpacity 
                                            onPress={() => openActualExpenseModal(expense)}
                                            style={{backgroundColor: 'lightgray', padding: '1%', borderRadius: 5}}>
                                            <FontAwesomeIcon icon={faPlus} size={40} color={'#1a1a1a'}/>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })
                        
                        }
                    </ScrollView>
                </View>
                {showActualExpenseModal &&
                    <View style={styles.modalContainer}>
                        <View style={styles.modal}>
                            <Modal
                                animationType="slide"
                                transparent={true}
                            >
                                <TouchableOpacity style={{top: 350, width: '23%', alignSelf: 'flex-end'}} onPress={() => {setShowActualExpenseModal(false); setActualExpense({}); setExpenseId('')}}>
                                    <FontAwesomeIcon icon={faTimesCircle} size={25} color={'gray'} />
                                </TouchableOpacity>
                                <TextInput 
                                    style={{...styles.totalInput, top: 380, width: '50%', alignSelf: 'center', fontWeight: 'bold'}} 
                                    placeholder='Expense amount: ($200)'
                                    keyboardType='numeric'
                                    value={(actualExpense && actualExpense.amount) && '$' + actualExpense.amount}
                                    onChangeText={text => setActualExpense({...actualExpense, amount: text.replaceAll('$', '')})}
                                />
                                {(actualExpense.amount ) ? 
                                    <TouchableOpacity
                                        style={{ borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: '100%', flex: 0.08, backgroundColor: COLORS.SecondaryColor, width: '20%', left: '40%' }}
                                        onPress={addActualExpense}
                                    >
                                        <Text>Submit</Text>
                                    </TouchableOpacity> : null}
                            </Modal>
                        </View>
                    </View>
                }
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
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
    body: {
        height: '100%',
        width: '100%',
        paddingHorizontal: '5%',
    },
    card: {
        height: normalize(50),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5%',
        marginVertical: '3%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#A6A6A6',
        shadowColor: '#171717',
        shadowOffset: { height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    modal: {
        flex: 0.4,
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
        padding: '5%'
    },
    modalContainer: {
        paddingTop: '48%',
        paddingHorizontal: '15%',
        backgroundColor: 'black',
        opacity: 0.9,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '114%',
        height: '120%',
    }
})
