# EVERNODE_WITHDRAW
Script to withdraw EVR rewards from one or more nodes.

This Script will cycle through an array of addresses, get their EVR balance then send all of the EVR balance to a single receiving address with TAG. This script is designed to use a single signing address where all nodes have set their Regular Key to the signing address of an active account in Xaman or other wallet that you control.

To set the Regular Key for a node...on each node issue the command from the terminal 

$ evernode regkey set rWalletAddressThatYouOwnThatCanSignTransactions

and in Xaman (or other wallet app) import the rAddressNode01 to 03 as a ReadOnly existing account. This will let your Xaman account sign all node transactions.

Fields to SET in script:

const accounts = [
'rAddressNode01',
'rAddressNode02',
'rAddressNode03'
];

secret = 'ssWalletSecretThatCanSIGN';

Destination: 'rYourWalletYouControl';

DestinationTag: 123456,

install & run

npm install

node transfer_funds.js

*use at your own risk - double check all fields point to YOUR addresses that you CONTROL*

END.


