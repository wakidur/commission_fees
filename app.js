// The fs module provides an API for interacting with the file system
const fs = require('fs');
const http = require('http');

/**
 * Input data ----------------------
 * Input data is given in JSON file
 * Performed operations are given in that file
 */
const input = JSON.parse(fs.readFileSync(`${__dirname}/_data/input.json`, 'utf-8'));
// Function Invock 
calculatedCommissionFees(input);

// As a single argument program must accept a path to the input file
async function calculatedCommissionFees(inputFile) {
    try {
        weeklyUserOperationGroup = [];
        const configCashIn = {
            "percents": 0.03,
            "max": {
                "amount": 5,
                "currency": "EUR"
            }
        }
        const cashOutNatural = {
            "percents": 0.3,
            "week_limit": {
                "amount": 1000,
                "currency": "EUR"
            }
        }
        cashOutJuridical = {
            "percents": 0.3,
            "min": {
                "amount": 0.5,
                "currency": "EUR"
            }
        }
        /**
         * For Cash Out ----------- Natural Persons
         * 
         */
        // Sort objects by date ascending order
        const paymentRequestSorted = inputFile.sort((a, b) => new Date(a.date) - new Date(b.date));
        // Filter by user_type, type  and sort by user_id. 
        const cashOutNaturalPersonsList = paymentRequestSorted.filter(item => item.user_type === "natural" && item.type === "cash_out");
        let groupByUserId = cashOutNaturalPersonsList.reduce((r, a) => {
            r[a.user_id] = [...r[a.user_id] || [], a];
            return r;
        }, {});


        for (const key in groupByUserId) {
            if (groupByUserId.hasOwnProperty(key)) {
                const particularUserOperation = groupByUserId[key];
                // Get User operation weekly group data 
                weeklyUserOperationGroup.push(Object.values(particularUserOperation.reduce((acc, val) => {
                    let dateparts = val.date.split(/T+|-|:/g);
                    let date = new Date(dateparts[0], dateparts[1] - 1, dateparts[2]);
                    let weekNo = getISO8601WeekNo(date);
                    if (!acc[weekNo]) acc[weekNo] = [];
                    acc[weekNo].push(val);
                    return acc;
                }, {})));
            }
        }

        // Loop into group by id
        weeklyUserOperationGroup.forEach(item => {
            item.forEach(nested => {
                console.log(perticularCashOutNaturalPersons(nested, cashOutNatural));
                return perticularCashOutNaturalPersons(nested, cashOutNatural);
            });
        })

        /**
         * For Cash In 
         * For Cash Out ----------- Legal persons
         * 
         * 
         */
        paymentRequestSorted.forEach(item => {
            if (item.type === "cash_in") {
                console.log(perticularCashInCommition(item, configCashIn));
                return perticularCashInCommition(item, configCashIn);
            } else if (item.type === "cash_out" && item.user_type === "juridical") {
                console.log(perticularCashOutJuridicalPersons(item, cashOutJuridical));
                return perticularCashOutJuridicalPersons(item, cashOutJuridical);
            }
        });

    } catch (error) {
        console.error(error);
    }
}

function perticularCashInCommition(item, configcashin) {
    let commission = 0;

    if (item.operation && item.operation.amount && item.operation.currency === "EUR" && item.operation.currency === configcashin.max.currency) {
        let amount = parseFloat(item.operation.amount);
        let percents = parseFloat(configcashin.percents)
        commission += (amount / 100) * percents;

        if (parseFloat(commission) > parseFloat(configcashin.max.amount)) {
            commission = parseFloat(configcashin.max.amount).toFixed(2);
        } else {
            commission.toFixed(2);
        }

    } else {
        console.error(" Some this Wrong ");

    }
    return commission;
}

function perticularCashOutJuridicalPersons(item, cashoutjuridical) {
    let commission = 0;
    if (item.operation && item.operation.amount && item.operation.currency === "EUR" && item.operation.currency === cashoutjuridical.min.currency) {
        let amount = parseFloat(item.operation.amount);
        let percents = parseFloat(cashoutjuridical.percents)
        // Not less than 0.50 EUR for operation
        if (parseFloat(item.operation.amount) > parseFloat(cashoutjuridical.min.amount)) {
            commission = parseFloat((amount / 100) * percents).toFixed(2);
        } else {
            console.error("Less than 0.50 EUR");
        }
    } else {
        console.error(" Some this Wrong ");

    }
    return commission;

}

function perticularCashOutNaturalPersons(weeklyOperation, cashoutnatural) {
    let commission = 0;
    totalAmaountPerWeek = 0;
    if (weeklyOperation.length > 0) {
        weeklyOperation.forEach(item => {
            if (item.operation && item.operation.currency === "EUR") {
                totalAmaountPerWeek += item.operation.amount;
            }
        })
    }
    if (totalAmaountPerWeek > cashoutnatural.week_limit.amount) {
        let perWeek = parseFloat(totalAmaountPerWeek) - parseFloat(cashoutnatural.week_limit.amount);
        let amount = parseFloat(perWeek);
        let percents = parseFloat(cashoutnatural.percents)
        commission = parseFloat((amount / 100) * percents).toFixed(2);
    } else {
        // Default commission fee - 0.3% from cash out amount.
        let amount = parseFloat(totalAmaountPerWeek);
        let percents = parseFloat(cashoutnatural.percents)
        commission = parseFloat((amount / 100) * percents).toFixed(2);;
    }

    return commission;

}

function getISO8601WeekNo(date) {
    let startDate = startOfWeek(new Date(date.getFullYear(), 0));
    let endDate = endOfWeek(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    while (endDate.getDay() < 6) endDate.setDate(endDate.getDate() + 1);
    endDate = endDate.getTime();
    let weekNo = 0;
    while (startDate.getTime() < endDate) {
        if (startDate.getDay() == 4) weekNo++;
        startDate.setDate(startDate.getDate() + 1);
    }
    return weekNo;
}
// Get the week start date
function startOfWeek(date) {
    let diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}
// Get the week end date
function endOfWeek(date) {
    let lastday = date.getDate() - (date.getDay() - 1) + 6;
    return new Date(date.setDate(lastday));
}

