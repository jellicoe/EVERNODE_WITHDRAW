// MAIN file to send EVR to node Wallet


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

const wallets = []

const myDate = new Date().toUTCString();

const sendAccount = process.env.sendAccount

console.log('Printing Account INFO...:', myDate);
const main = async () => {
    for(const account of accounts) {
      //console.log('\nGetting ready...'); 
   
        const { account_data } = await client.send({ command:"account_info", account })
        //console.log('Printing Account INFO...');

        //console.log(account); //print address
        //console.log(account_data); // FULL Output

    ////GET Trustline Details - Get EVR Balance
    // Ensure only ONE Trustline per node wallet which is set to EVERNODE
    // currency: EVR
    // issuer: rEvernodee8dJLaFsujS6q1EiXvZYmHXr8
      let marker = ''
      const l = []
      var balance = 0
      while (typeof marker === 'string') {
        const lines = await client.send({ command: 'account_lines', account, marker: marker === '' ? undefined : marker })
        marker = lines?.marker === marker ? null : lines?.marker
        //console.log(`Got ${lines.lines.length} results`)
        lines.lines.forEach(t => {

            //t is the details for the EVR trustline to evernode and the balance
            console.log(account,',',t.balance)

            l.push(t.account) // t.account = evernode wallet trustline issuer NOT USED
            wallets.push(account, t.balance)

            balance = t.balance
        })
      }

      //check just the EVRs trustline is set
      if (l.length > 1) {
        console.log('# TOO MANY Trust Lines:', l.length, '\n\n')
        exit();
      }

       //check just the EVRs balance is > 0 if not go to start of for loop with continue
      if (balance < 1) {
        console.log('# Evr Balance TOO LOW:', balance)
        continue;
      }

      const sender = await client.send({ command: 'account_info', account: sendAccount })
    
    //Destination Adress and TAG set in.env file
    //const destination = process.env.destination;
    //const tag = process.env.tag;

    //send all funds to your chosen Exchange, Xaman or other Xahau account 
    const tx = {
      TransactionType: 'Payment',
      Account: sendAccount,
      Amount: {
          "currency": "EVR",     //leave 0.2 EVR to pay for Reputation Hooks
          "value": 0.01, //*** Change to balance-0.2 (no quotes) or use "0.01" for testing low payment
          "issuer": "rEvernodee8dJLaFsujS6q1EiXvZYmHXr8" //DO NOT CHANGE - this is the EVR Trustline Issuer address
      },
      //Destination: 'rYourWalletYouControl'
      Destination: account, //your exchnage or xaman wallet address
      DestinationTag: '121212', //*** set to YOUR exchange wallet TAG Note: no quotes << do not forget to set TAG
      Fee: '12', //12 drops aka 0.000012 XAH, Note: Fee is XAH NOT EVR
      NetworkID: '21337', //XAHAU Production ID
      Sequence: sender.account_data.Sequence
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
