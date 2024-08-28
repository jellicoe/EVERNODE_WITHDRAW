// MAIN file to send EVR to XAHAU Wallet

// This Script will cycle through an array of addresses, get their EVR balance
// then send all of the EVR balance to a single receiving address with TAG.
// This script is designed to use a single signing address where all nodes
// have set their Regular Key to the signing address.
// To set the Regular Key for a node..on each node issue the command from the terminal
// $ evernode regkey set rWalletAddressThatYouOwnThatCanSignTransactions, 
// the secret for this address is set below

//create client to connect to xahau blockchain RPC server
const { XrplClient } = require('xrpl-client')
const lib = require('xrpl-accountlib');
const { exit } = require('process');
//const path = require('path')

//get variables from .env files
//const env = require("dotenv").config({path:".env"});
//const env = require("dotenv").config({path: __dirname + '.env'})
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

//accounts = your Node Wallets r Addresses 
//replace with one or more of your rAddresses for each node in .env file
const args = process.argv.slice(2);
console.log("Arguments are ", args);


var accounts = [];
if (args[0]=='rep') {

  //Note need to set regular key.
  accounts = process.env.rep_accounts.split('\n');

  //console.log("Repping ");
  //exit();
} else {
  accounts = process.env.accounts.split('\n');

  //console.log("Normal accounts ");
  //exit();
}

//Signing Wallet which is set as Regular Key for all Nodes
//set secret in .env file from regular key set for nodes
const secret = process.env.secret;
const keypair = lib.derive.familySeed(secret)

//connect to xahau blockchain WSS server
const xahaud = process.env.xahaud;
const client = new XrplClient(xahaud);

const wallets = []

const myDate = new Date().toUTCString();

const sendAccount = process.env.sendAccount

console.log('Printing Account INFO...:', myDate);
const main = async () => {
    for(const account of accounts) {
      //console.log('\nGetting ready...'); 
   
      //Get sender wallet info to get updated sequence number
      const sender = await client.send({ command: 'account_info', account: sendAccount })
      

      var balance = 0
      var raw_balance = 0
     
      const lines = await client.send({ command: 'account_info', account })
   
      raw_balance = lines.account_data.Balance

      //console.log(account,',', lines.account_data.Balance)
      //console.log("RAW ", raw_balance)

      balance = parseInt(raw_balance) / 1000000;

      console.log(account,':', balance)
      //console.log("BAL ", balance)
  
      //check just the XAH below 5 and top up
      if (balance <= 2) {
        console.log('# XAH Balance TOO LOW: ', balance)
        continue;
      }

      //Destination Adress and TAG set in.env file
      const destination = process.env.destination;
      const tag = process.env.tag;

      //floatpoint numbers are not precise- convert toFixed
      var val = parseFloat(balance)-parseFloat(5.02) //Trustline, reg and fee
      //let value = val.toFixed(2) 
      
      var value = parseInt(raw_balance) - 2000000   ///check or reservers under 2
      console.log('# Value is:', value)
      
      var valval = value.toString();


      //exit();
      
      //send all funds to your chosen Exchange, Xaman or other Xahau account 
      const tx = {
        TransactionType: 'Payment',
        Account: account,
        Amount: valval,
        Destination: destination, //sendAccount,// //your exchnage or xaman wallet address
        DestinationTag: tag, //*** set to YOUR exchange wallet TAG Note: no quotes << do not forget to set TAG
        Fee: '12', //12 drops aka 0.000012 XAH, Note: Fee is XAH NOT EVR
        NetworkID: '21337', //XAHAU Production ID
        Sequence: lines.account_data.Sequence
      }

      const {signedTransaction} = lib.sign(tx, keypair)
      console.log(tx)

      //SUBmit sign TX to ledger
      const submit = await client.send({ command: 'submit', 'tx_blob': signedTransaction })
      console.log(submit.engine_result, submit.engine_result_message, submit.tx_json.hash)
      

    } //end of for loop

  console.log('Shutting down...');

  client.close()
}

main()
