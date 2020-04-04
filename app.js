// The fs module provides an API for interacting with the file system
const fs = require('fs');
const service = require('./service/service')


/**
 * Input data ----------------------
 * Input data is given in JSON file
 * Performed operations are given in that file
 */
const input = JSON.parse(fs.readFileSync(`${__dirname}/_data/input.json`, 'utf-8'));
const DaysOfWeek = {
    sun: 0,
    mon: 1,
    tue: 2,
    wen: 3,
    thu: 4,
    fri: 5,
    sat: 6,
}


// Function Invock 
calculatedCommissionFees(input);

// As a single argument program must accept a path to the input file
async function calculatedCommissionFees(inputFile) {
    try {
      // Weekly Cash out Natural Persons Group array init 
        let weeklyCashOutNaturalPersonsGroup = [];
        // Http request for Config Cash In
        let configCashIn = await service.getConfigurationEndpoint('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in');
        // String to Object 
        configCashIn = JSON.parse(configCashIn);
        // Http request for Cash Out Natural Persons
        let cashOutNatural = await service.getConfigurationEndpoint('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural');
        // String to Object
        cashOutNatural = JSON.parse(cashOutNatural);
        // Http request for Cash Out Legal persons
        let cashOutJuridical = await service.getConfigurationEndpoint('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical');
        // String to Object
        cashOutJuridical = JSON.parse(cashOutJuridical);
        /**
         * For Cash Out ----------- Natural Persons
         * 
         */
        // Sort objects by date ascending order
        const paymentRequestSorted = inputFile.sort((a, b) => new Date(a.date) - new Date(b.date));

        // GET Cash In Persons Filter type. 
        const cashInPersonsList = paymentRequestSorted.filter(item => item.type === "cash_in");
        // Cash in Persons commission fee
        if (cashInPersonsList && cashInPersonsList.length > 0) {
            cashInPersonsList.forEach(element => {
                console.log(service.particularCashInCommition(element, configCashIn));
                return service.particularCashInCommition(element, configCashIn);
            });

        }
        //GET Cash Out Legal persons Filter by user_type, type. 
        const cashOutLegalPersonsList = paymentRequestSorted.filter(item => item.user_type === "juridical" && item.type === "cash_out");
        // Cash Out Legal persons commission fee
        if (cashOutLegalPersonsList && cashOutLegalPersonsList.length > 0) {
            cashOutLegalPersonsList.forEach(element => {
                console.log(service.particularCashOutJuridicalPersons(element, cashOutJuridical));
                return service.particularCashOutJuridicalPersons(element, cashOutJuridical);
            });
        }
        // User ID Group for per user operation check 
        // GET Cash Out Natural Persons Filter by user_type, type. 
        const cashOutNaturalPersonsList = paymentRequestSorted.filter(item => item.user_type === "natural" && item.type === "cash_out");
        // Group By UserID
        let groupByUserId = cashOutNaturalPersonsList.reduce((r, a) => {
            r[a.user_id] = [...r[a.user_id] || [], a];
            return r;
        }, {});

        // Particular user Weely Operation Group
        for (const key in groupByUserId) {
            if (groupByUserId.hasOwnProperty(key)) {
                const particularUserOperation = groupByUserId[key];
                weeklyCashOutNaturalPersonsGroup.push(service.weekWiseGrouping(particularUserOperation, DaysOfWeek.mon, DaysOfWeek.sun));                
            }
        }

       // Retrieve user weekly  commission fees
        weeklyCashOutNaturalPersonsGroup.forEach(item => {
            item.forEach(nested => {
                console.log(service.particularCashOutNaturalPersons(nested, cashOutNatural));
                // return particularCashOutNaturalPersons(nested, cashOutNatural);
            });
        })

    } catch (error) {
        console.error(error);
    }
}



