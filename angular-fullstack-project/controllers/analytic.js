const moment = require('moment')
const Order = require('../models/Order')
const errorHandler = require('../utils/errorHandler')

module.exports.overview = async function (req,res){
    try{
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1})
        const ordersMap = getOrdersMap(allOrders)
        const yesterdayOrders = ordersMap[moment().add(-1,'d').format('DD.MM.YYYY')] || []


        //Yesterday all orders count
        const yesterdayOrdersNumber = yesterdayOrders.length
        //All orders count
        const totalOrdersNumber = allOrders.length
        //All days count
        const daysNumber = Object.keys(ordersMap).length
        //Orders count per day
        const ordersPerDay = (totalOrdersNumber / daysNumber).toFixed(0)
        //((Orders yesterday / Orders count per day) -1) * 100
        //Orders count percent
        const ordersPercent = (((yesterdayOrdersNumber / ordersPerDay) - 1) * 100).toFixed(2)
        //Total gain
        const totalGain = calculatePrice(allOrders)
        //Gain per day
        const gainPerDay = totalGain / daysNumber
        //Yesterday gain
        const yesterdayGain = calculatePrice(yesterdayOrders).toFixed(2)
        //Gain percent
        const gainPercent = (((yesterdayGain / gainPerDay) - 1) * 100).toFixed(2)
        //Compare gain
        const compareGain = (yesterdayGain - gainPerDay).toFixed(2)
        //Compare orders count
        const compareNumber = (yesterdayOrdersNumber - ordersPerDay).toFixed(0)

        res.status(200).json({
            gain:{
                percent: Math.abs(Number(gainPercent)),
                compare: Math.abs(Number(compareGain)),
                yesterday: Number(yesterdayGain),
                isHigher: Number(gainPercent) > 0
            },
            orders:{
                percent: Math.abs(Number(ordersPercent)),
                compare: Math.abs(Number(compareNumber)),
                yesterday: Number(yesterdayOrdersNumber),
                isHigher: Number(ordersPercent) > 0
            }
        })

    }catch (e) {
        errorHandler(res,e)
    }
}
module.exports.analytic = async function (req,res){
    try{
        const allOrders = await Order.find({user: req.user.id}).sort({date: 1})
        const ordersMap = getOrdersMap(allOrders)
        const average = Number(calculatePrice(allOrders) / Object.keys(ordersMap).length.toFixed(2))

        const chart = Object.keys(ordersMap).map(label => {
            //label == 18.04.2022
            const gain = calculatePrice(ordersMap[label])
            const order = ordersMap[label].length

            return {label, order, gain}
        })

        res.status(200).json({
            average: Number(average).toFixed(2) | 0,
            chart
        })
    }catch(e){
        errorHandler(res,e)
    }
}

function getOrdersMap(orders = []){
    const daysOrders = {}
    orders.forEach(order => {
        const date = moment(order.date).format('DD.MM.YYYY')
        if(date === moment().format('DD.MM.YYYY')){
            return
        }
        if(!daysOrders[date]){
            daysOrders[date] =[]
        }
        daysOrders[date].push(order)
    })
    return daysOrders
}
function calculatePrice(orders = []) {
    return orders.reduce((total,order) => {
        const orderPrice = order.list.reduce((orderTotal,item) => {
            return orderTotal += item.cost * item.quantity
        },0)
        return total += orderPrice
    },0)
}
