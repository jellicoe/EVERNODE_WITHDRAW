# EVERNODE_WITHDRAW
Script to withdraw EVR rewards from one or more nodes.

// This Script will cycle through an array of addresses, get their EVR balance
// then send all of the EVR balance to a single receiving address with TAG.
// This script is designed to use a single signing address where all nodes
// have set their Regular Key to the signing address.
// To set the Regular Key for a node..on each node issue the command from the terminal
// $ evernode regkey set rWalletAddressThatYouOwnThatCanSignTransactions

Fields to SET 
secret = 'ssWalletSecretThatCanSIGN';
Destination: 'rYourWalletYouControl';
DestinationTag: 123456,

