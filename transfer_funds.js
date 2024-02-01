//MAIN file to send EVR to XAHAU Wallet

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

//Node Wallets r Addresses 
//replace with one or more of your rAddresses for each node
const accounts = [
'rAddressNode01',
'rAddressNode02',
'rAddressNode03'
];

//Signing Wallet which is set as Regular Key for all Nodes
const secret = 'ssWalletSecretThatCanSIGN'; //secret - set as secret from regular key set for nodes
const keypair = lib.derive.familySeed(secret)

//connect to xahau blockchain RPC server
const client = new XrplClient('wss://xahau.network');
const wallets = []

const main = async () => {
    for(const account of accounts) {
      console.log('\n\nGetting ready...'); 
   
        const { account_data } = await client.send({ command:"account_info", account })
        console.log('Printing Account INFO...');

        console.log(account);
        console.log(account_data);

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
        console.log(`Got ${lines.lines.length} results`)
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
    
    //send all funds to your chosen Exchange, Xaman or other Xahau account 
    const tx = {
      TransactionType: 'Payment',
      Account: account,
      Amount: {
          "currency": "EVR",
          "value": balance, //*** Change to balance (no quotes) or use "0.01" for testing low payment
          "issuer": "rEvernodee8dJLaFsujS6q1EiXvZYmHXr8" //DO NOT CHANGE - this is the EVR Trustline Issuer address
      },
      //Destination: 'rYourWalletYouControl'
      Destination: 'rYourWalletYouControl', //your exchnage or xaman wallet address
      DestinationTag: 123456, //*** set to YOUR exchange wallet TAG Note: no quotes << do not forget to set TAG
      Fee: '12', //12 drops aka 0.000012 XAH, Note: Fee is XAH NOT EVR
      NetworkID: '21337', //XAHAU Production ID
      Sequence: account_data.Sequence
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
