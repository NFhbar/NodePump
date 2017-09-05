//==============================================
//INSTALLATION
//==============================================
// install node
// install npm
// move to directory
// : npm init
// : npm install
// : npm install --save node.bittrex.api"
// : node basicBitrexQuery.js
// this will dump the basic query into the console


//===============================================
//VARIABLES
//===============================================
//Variables that can be modified
var percentDif = 5;           //variable to check for percentage difference check
var timeInterval = 50000;     //time to wait before iterations in milliseconds
var iterations = 10;          //number of iterations to run script
//==============================================

//Variables (do not modify)
var request = require("request-promise");        //What is this?
var bittrex = require("node.bittrex.api");       //What is this?
const TEST_URI = "https://bittrex.com/api/v1.1/public/getmarketsummaries"; //bittrex API
var previousResult = [];   //array to store first check of last price
var nextResult = [];       //array to store second check of last price
var count = 0;             //variable to count number of iterations
var numbersToNamesHash = {};    //array to store ticker name and both last prices
var differenceArray = [];       //array to store difference between last prices
var dif = 0;                    //variable to store percentage difference
//=====================================================


//What is this?
var reqOptions = {
  method: "GET",
  uri: TEST_URI,
  headers: {
    "user-agent": "node.js"
  },
  json: true
};


//load up an initial result from the API call
request(reqOptions)
  .then(function(parsedBody) {
    previousResult = parsedBody.result;
  })
  .catch(function(err) {
    console.log("request failed : " + err);
  });



var intervalObject = setInterval(
  function() {
    request(reqOptions)
      .then(function(parsedBody) {
        // reset the storage arrays
        numbersToNamesHash = {};
        differenceArray = [];

        //load up the difference arrays and hashes
        nextResult = parsedBody.result;
        if (previousResult.length === nextResult.length) {
          nextResult.forEach((element, i, array) => {
            dif = nextResult[i].Last / previousResult[i].Last * 100 - 100;
            // console.log(dif);
            if (dif > percentDif) {
              numbersToNamesHash[dif] = {
                name: element.MarketName,
                last: nextResult[i].Last,
                prev: previousResult[i].Last
              };
              differenceArray.push(dif);
            }
          });
        } else {
          console.log(
            "WARNING: length match failure, different number of coins returned. Comparison failed."
          );
        }

        //sort it in ascending order
        differenceArray.sort((a, b) => {
          return b - a;
        });

        //iterate through the difference array and log out names and percentages
        differenceArray.forEach((elem, i, array) => {
          console.log(
            `${numbersToNamesHash[elem].name} increased ${elem.toFixed(
              5
            )}% from ${numbersToNamesHash[elem].prev} to ${numbersToNamesHash[
              elem
            ].last}`
          );
        });
        console.log("---------------");

        //make the new result into the old one for the next loop
        previousResult = nextResult;
      })
      .catch(function(err) {
        console.log("request failed : " + err);
      });
    count++;

    // adjust the count here or comment this out to disable automatic shutdowns
    if (count == iterations) {
      console.log(`exiting after ${count} iterations`);
      clearInterval(intervalObject);
    }
  },
  //adjust this number in milliseconds to change the polling time
  timeInterval
);
