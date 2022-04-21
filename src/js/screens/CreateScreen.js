import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Alert, Image } from 'react-native';
import Modal from "react-native-modal";
import { useIsFocused } from '@react-navigation/native';
import { BASE_URL } from '@env'
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPen, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

import normalize from '../../../assets/fontSize';
import { COLORS } from '../../../assets/colors.js'
import Loading from '../../../assets/images/loading.gif'


export default function CreateScreen({ navigation, setTitle }) {

    const isFocused = useIsFocused();

    const [budget, setBudget] = useState({});
    const [expense, setExpense] = useState({});
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [gettingBaseInfo, setGettingBaseInfo] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    useEffect(() => {
        if (isFocused) {
            setTitle('New Budget')
        }
    }, [isFocused]);

    function openModal(expense, index) {
        if (expense) {
            setSelectedExpense(index)
            setExpense(expense);
        }
        setShowExpenseModal(true);
    }

    function addExpense() {
        if (!hasNumber(expense.amount)) {
            alert("Amount must be filled.");
            return;
        }
        if (expense.name.length < 1) {
            alert("Name must be filled.");
            return;
        }
        if (selectedExpense === null) {
            let tempExpense = {name: expense.name, amount: expense.amount};
            setExpenses([...expenses, tempExpense]);
        } else {
            let tempExpenses = [...expenses];
            tempExpenses[selectedExpense].name = expense.name;
            tempExpenses[selectedExpense].amount = expense.amount;
            setExpenses(tempExpenses);
        }
        setExpense({});
        setShowExpenseModal(false);
        setSelectedExpense(null);
    }

    
    function deleteExpense(index) {
        let tempExpenses = [...expenses];
        tempExpenses.splice(index, 1);
        setExpenses(tempExpenses);
    }
    
    function hasNumber(myString) {
        return /\d/.test(myString);
    }

    function submitBudget() {
        setLoading(true)
        let tempBudget = {...budget};
        let tempExpenses = [...expenses];
        tempBudget['expenses'] = tempExpenses;
        axios.post(BASE_URL + '/budgets', tempBudget).then(response => {
            setLoading(false);
            setBudget({});
            setExpenses([]);
            setGettingBaseInfo(true);
            navigation.navigate('Tabs', { screen: 'Home' })
        }).catch(error => {
            setLoading(false);
            Alert.alert("Failure", "Something went wrong creating your budget");
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setGettingBaseInfo(true)}><Text style={{ fontSize: normalize(32) }}>{budget.name}</Text></TouchableOpacity>
                    <View>
                        <TouchableOpacity onPress={() => setGettingBaseInfo(true)}><Text style={{ fontSize: normalize(18) }}>{'Total: ' + ('$' + (budget.totalBudget || 0))}</Text></TouchableOpacity>
                        {(expenses && expenses.length > 0) ?
                            <Text style={{ fontSize: normalize(18) }}>{'Remaining: $' + (budget.totalBudget - (expenses.reduce((tot, expense) => {return tot + parseInt(expense.amount)}, 0)))}</Text> 
                        : null}
                    </View>

                </View>

                <View style={styles.body}>
                    <View style={styles.expenses}>
                        {expenses.map((expense, index) => {
                            return (
                                <View key={index} style={{ flexDirection: 'row', overflow: 'hidden', paddingBottom: 5, flex: 0.1 }}>
                                    <View style={styles.expenseCard}>
                                        <Text style={{ fontSize: normalize(18), color: '#212121' }}>{expense.name}</Text>
                                        <Text style={{ fontSize: normalize(18), color: '#212121' }}>{'$' + expense.amount}</Text>
                                        <TouchableOpacity onPress={() => openModal(expense, index)}>
                                            <FontAwesomeIcon icon={faPen} size={20} color={'gray'} />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => deleteExpense(index)} style={styles.deleteButton}>
                                        <FontAwesomeIcon icon={faTimes} size={25} color={'black'} />
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                        <TouchableOpacity onPress={() => openModal()} style={styles.addExpenseButton}>
                            <Text style={{ fontSize: normalize(16) }}>Add Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => submitBudget()} style={styles.finishButton}>
                            <Text style={{ fontSize: normalize(16) }}>Finish</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {gettingBaseInfo && 
                    <View>
                        <Modal
                            style={{justifyContent: 'flex-start', backgroundColor: 'white', alignSelf: 'center', width: '75%', flex: 0.5, marginTop: '45%', borderRadius: 10, padding: '5%'}}
                            animationIn="slideInUp"
                            backdropOpacity={0.7}
                            isVisible={isFocused}
                            swipeDirection={['down', 'left']}
                            onSwipeComplete={() => navigation.navigate('Tabs', { screen: 'Home' })}
                        >
                            <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => {navigation.navigate('Tabs', { screen: 'Home' })}}>
                                <FontAwesomeIcon icon={faTimesCircle} size={25} color={'gray'} />
                            </TouchableOpacity>
                            <View style={styles.title}>
                                <View>
                                    <Text style={{ fontSize: normalize(18) }}>Budget Info</Text>
                                </View>
                                <TextInput
                                    style={styles.titleInput}
                                    placeholder="Title..."
                                    value={budget.title}
                                    onChangeText={inputText => setBudget({ ...budget, name: inputText })}
                                />
                            </View>

                            <View style={styles.totalContainer}>
                                <Text style={{ fontSize: normalize(16), marginRight: '2%' }}>Total: </Text>
                                <TextInput
                                    style={styles.totalInput}
                                    placeholder="$500..."
                                    keyboardType='numeric'
                                    value={budget.totalBudget && (!budget.totalBudget.includes('$') ? '$' + budget.totalBudget : budget.totalBudget)}
                                    onChangeText={inputText => setBudget({ ...budget, totalBudget: inputText.replaceAll('$', '') })}
                                />
                            </View>
                            {(budget.name && budget.totalBudget) ? 
                                <TouchableOpacity
                                    style={{ borderRadius: 10, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', height: '10%', backgroundColor: COLORS.SecondaryColor, width: '50%' }}
                                    onPress={() => setGettingBaseInfo(false)}
                                >
                                    <Text>Submit</Text>
                                </TouchableOpacity>
                            : null}
                        </Modal>
                    </View>}

                {showExpenseModal &&
                    <View>
                        <Modal
                            style={{justifyContent: 'flex-start', backgroundColor: 'white', alignSelf: 'center', width: '75%', flex: 0.5, marginTop: '45%', borderRadius: 10, padding: '5%'}}
                            animationIn="slideInUp"
                            backdropOpacity={0.7}
                            isVisible={true}
                        >
                            <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => {setShowExpenseModal(false); setExpense({})}}>
                                <FontAwesomeIcon icon={faTimesCircle} size={25} color={'gray'} />
                            </TouchableOpacity>
                            <TextInput 
                                style={{...styles.totalInput, width: '100%', alignSelf: 'center', marginTop: '25%'}} 
                                placeholder='Expense Name: (Gas)' 
                                value={expense ? expense.name : null}
                                onChangeText={text => setExpense({...expense, name: text})}
                            />
                            <TextInput 
                                style={{...styles.totalInput, width: '100%', alignSelf: 'center', marginTop: '10%'}} 
                                placeholder='Expense amount: ($200)'
                                keyboardType='numeric'
                                value={expense.amount && (!expense.amount.includes('$') ? '$' + expense.amount : expense.amount)}
                                onChangeText={text => setExpense({...expense, amount: text.replaceAll('$', '')})}
                            />
                            {(expense.name && expense.amount ) ? 
                                <TouchableOpacity
                                    style={{ borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: '15%', height: '15%', backgroundColor: COLORS.SecondaryColor, width: '50%', alignSelf: 'center' }}
                                    onPress={addExpense}
                                >
                                    <Text>Submit</Text>
                                </TouchableOpacity> : null}
                        </Modal>
                    </View>
                }

            </KeyboardAvoidingView>
        </TouchableWithoutFeedback >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: '6%',
    },
    header: {
        flex: 0.1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2%'
    },
    title: {
        height: '20%',
        width: '100%',
        alignItems: 'center',
    },
    titleInput: {
        width: '70%',
        textAlign: 'center',
        fontSize: normalize(20),
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        fontWeight: 'bold',
    },
    totalContainer: {
        height: '20%',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '5%',
    },
    totalInput: {
        fontSize: normalize(18),
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
    },
    body: {
        flex: 0.87,
    },
    expenses: {
        flex: 1,
        margin: 15
    },
    button: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        backgroundColor: COLORS.SecondaryColor,
        borderWidth: 1,
        borderRadius: 25,
        borderColor: '#bfbfbf',
        shadowColor: '#171717',
        shadowOffset: { height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    expenseCard: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#bfbfbf',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
    },
    addExpenseButton: {
        borderRadius: 15,
        width: '75%',
        alignSelf: 'center',
        flex: 0.1,
        marginTop: '5%',
        backgroundColor: COLORS.SecondaryColor,
        justifyContent: 'center',
        alignItems: 'center'
    },
    finishButton: {
        borderRadius: 15,
        width: '50%',
        alignSelf: 'center',
        flex: 0.1,
        marginTop: 'auto',
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center'
    }, 
    deleteButton: {
        flex: 0.1, 
        borderRadius: 5, 
        alignSelf: 'center', 
        marginLeft: '2%', 
        backgroundColor: '#f24643', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60%'
    }
})