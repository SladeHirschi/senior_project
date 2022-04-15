import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import normalize from '../../../assets/fontSize.js';
import { PieChart } from 'react-native-chart-kit';


export default function BudgetCard({ title, totalMoney, expenses }) {

    function map(expenses){
        if (expenses) {
            expenses.map((expense) => {
                expense.color = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
                expense.amount = parseInt(expense.amount);
            })
        } else {
            expenses = [];
        }
        return expenses;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={{ fontSize: normalize(16) }}>{title}</Text>
            </View>

            <View style={styles.cardBody}>

                <View style={styles.rectangle}>
                    <View style={styles.total}>
                        <Text>Total Money: </Text>
                        <Text style={styles.totalMoney}>{'$' + totalMoney}</Text>
                    </View>

                    <View style={styles.expenses}>
                        <Text>Expenses: </Text>
                        {expenses  &&
                            expenses.map((expense, index) => {
                                return (
                                    <View key={index} style={{ width: '100%', alignItems: 'start' }}>
                                        <View  style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: normalize(2) }}>{'\u2B24'}</Text>
                                            <Text style={{ fontSize: normalize(10), marginLeft: '5%' }}>{expense.name}</Text>
                                            <Text style={{ fontSize: normalize(10), marginLeft: '5%' }}>{'$' + expense.amount}</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>
                </View>

                <View style={styles.graph}>
                    <PieChart
                        hasLegend={false}
                        data={map(expenses)}
                        width={150}
                        height={100}
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
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="15"
                    />
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '2%',
        paddingBottom: '2%',
        justifyContent: 'center'
    },
    header: {
        flex: 0.25,
        alignItems: 'center',
    },
    cardBody: {
        flex: 0.8,
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    rectangle: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 2,
        borderColor: 'black',
    },
    total: {
        flex: 1,
        padding: '2%',
        borderRightWidth: 1,
        borderColor: 'black',
        alignItems: 'center'
    },
    totalMoney: {
        marginTop: '15%',
        fontSize: normalize(14)
    },
    expenses: {
        flex: 1,
        padding: '2%',
        alignItems: 'center',
        overflow: 'hidden'
    },
    graph: {
        width: '40%',
        height: 'auto',
        paddingLeft: '12%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})