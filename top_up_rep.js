// MAIN file to send XAH to Reputation Wallets

// This Script will cycle through an array of addresses, get their HAX balance
// then top up their XAH balance if lower than 5,


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

const accounts = process.env.rep_accounts.split('\n');

//Signing Wallet which is set as Regular Key for all Nodes
//set secret in .env file from regular key set for nodes
const secret = process.env.secret;
const keypair = lib.derive.familySeed(secret)

//connect to xahau blockchain WSS server
const xahaud = process.env.xahaud;
const client = new XrplClient(xahaud);

const myDate = new Date().toUTCString();

console.log('Printing Account INFO...:', myDate);

const sendAccount = process.env.sendAccount

const main = async () => {

    for(const account of accounts) {

      //Get sender wallet info to get updated sequence number
      const sender = await client.send({ command: 'account_info', account: sendAccount })
      // /console.log(sender)

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
      if (balance <= 5) {
        console.log('# XAH Balance TOO LOW: ', balance)
        

      //send to top up nodes
      const tx = {
        TransactionType: "Payment",
        Account: sendAccount,
        Amount: "5000000", //IN Drops 
        Destination: account, //wallet in the accounts loop from env
        Fee: "12", //12 drops aka 0.000012 XAH, Note: Fee is XAH NOT EVR
        NetworkID: "21337", //XAHAU Production ID
        Sequence: sender.account_data.Sequence
      }

      const {signedTransaction} = lib.sign(tx, keypair)

      console.log(tx)

      //SUBmit sign TX to ledger
      const submit = await client.send({ command: 'submit', 'tx_blob': signedTransaction })
      console.log(submit.engine_result, submit.engine_result_message, submit.tx_json.hash)
    
      //continue;
    }
    

    } //end of for loop

  console.log('Shutting down...');

  client.close()
}

main()
