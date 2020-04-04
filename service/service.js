// request is defined as a peer-dependency and thus has to be installed separately
const request = require('request');
const rp = require('request-promise');

module.exports = {
    getConfigurationEndpoint,
    particularCashInCommition,
    particularCashOutJuridicalPersons,
    weekWiseGrouping, 
    particularCashOutNaturalPersons
};

const DaysOfWeek = {
    sun: 0,
    mon: 1,
    tue: 2,
    wen: 3,
    thu: 4,
    fri: 5,
    sat: 6,
}


function getConfigurationEndpoint(path) {
    return rp(path)
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
}

function particularCashInCommition(item, configCashIn) {
    let commission = 0;

    if (item.operation && item.operation.amount && item.operation.currency === "EUR" && item.operation.currency === configCashIn.max.currency) {
        let amount = parseFloat(item.operation.amount);
        let percents = parseFloat(configCashIn.percents)
        commission += (amount / 100) * percents;

        if (parseFloat(commission) > parseFloat(configCashIn.max.amount)) {
            //  example 0.023 should return 0.03
            commission = roundUp(configCashIn.max.amount, 2).toFixed(2);
        } else {
            commission = roundUp(commission, 2).toFixed(2);
        }

    } else {
        console.error(" Some this Wrong ");

    }
    return commission;
}

// Cash Out Natural Persons commintion fee calculating 
function particularCashOutJuridicalPersons(item, cashOutJuridical) {
    let commission = 0;
    if (item.operation && item.operation.amount && item.operation.currency === "EUR" && item.operation.currency === cashOutJuridical.min.currency) {
        let amount = parseFloat(item.operation.amount);
        let percents = parseFloat(cashOutJuridical.percents)
        // Not less than 0.50 EUR for operation
        if (parseFloat(item.operation.amount) > parseFloat(cashOutJuridical.min.amount)) {
            //  example 0.023 should return 0.03
            commission = roundUp(((amount / 100) * percents), 2).toFixed(2);     
        } else {
            console.error("Less than 0.50 EUR");
        }
    } else {
        console.error(" Some this Wrong ");

    }
    return commission;

}

// Cash Out Natural Persons commintion fee calculating 
function particularCashOutNaturalPersons(weeklyOperation, cashoutnatural) {
    let commission = 0.00;
    totalAmountPerWeek = 0;
    // Add per week total  
    if (weeklyOperation.transactions.length > 0) {
        weeklyOperation.transactions.forEach(item => {
            if (item.operation && item.operation.currency === "EUR") {
                totalAmountPerWeek += item.operation.amount;
            }
        })
    }
    if (totalAmountPerWeek > cashoutnatural.week_limit.amount) {
        commission = 0;
        // If total cash out amount is exceeded - commission is calculated only from exceeded amount
        let perWeek = parseFloat(totalAmountPerWeek) - parseFloat(cashoutnatural.week_limit.amount);
        let amount = parseFloat(perWeek);
        let percents = parseFloat(cashoutnatural.percents)
        commission = roundUp(((amount / 100) * percents), 2).toFixed(2);
    } else if(parseInt(totalAmountPerWeek) <= parseInt(cashoutnatural.week_limit.amount)) {
        // for 1000.00 EUR there is still no commission fee
        commission = "0.00" ;
    }

    return commission;

}

// Will return a array of object.
// Each object will have startDateOfWeek, endDateOfWeek, transactions
function weekWiseGrouping(transactions, startDayOfWeek, endDayOfWeek) {
    // sort the transations
    transactions.sort(function (transaction) {
        return transaction.date > transaction.date ? -1 : 1
    })

    let index = 0
    let weekWiseGroup = []
    while (index < transactions.length) {
        let transaction = transactions[index]
        const startDateOfWeek = getPreceedingDayDate(
            new Date(transaction.date),
            startDayOfWeek
        )
        const endDateOfWeek = getNextDayDate(
            new Date(transaction.date),
            endDayOfWeek
        )

        const transactionsWithinSameWeek = [transaction]
        index++
        while (
            index < transactions.length &&
            startDateOfWeek <= new Date(transactions[index].date) && // Optimization possible createing single Date() object
            new Date(transactions[index].date) <= endDateOfWeek
        ) {
            transactionsWithinSameWeek.push(transactions[index])
            index++
        }

        weekWiseGroup.push({
            startDateOfWeek: startDateOfWeek,
            endDateOfWeek: endDateOfWeek,
            transactions: transactionsWithinSameWeek,
        })
    }

    return weekWiseGroup
}



// First parameter is number that you want to round. Second parameter is number (integer) of numbers after point that you want to get
function roundUp(num, precision) {
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}



function getPreceedingDayDate(date, dayOfWeek) {
    const day = date.getDay()
    let dayToMinus = 0
    if (dayOfWeek < day) {
        dayToMinus = day - dayOfWeek
    } else if (dayOfWeek > day) {
        dayToMinus = day + 1 + (DaysOfWeek.sat - dayOfWeek)
    }

    const preceededDate = new Date(date)
    preceededDate.setDate(preceededDate.getDate() - dayToMinus)
    return preceededDate
}

function getNextDayDate(date, dayOfWeek) {
    const day = date.getDay()
    let dayToAdd = 0

    if (day < dayOfWeek) {
        dayToAdd = dayOfWeek - day
    } else if (day > dayOfWeek) {
        dayToAdd = dayOfWeek + 1 + (DaysOfWeek.sat - day)
    }

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + dayToAdd)
    return nextDate
}



// First parameter is number that you want to round. Second parameter is number (integer) of numbers after point that you want to get
function roundUp(num, precision) {
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}
