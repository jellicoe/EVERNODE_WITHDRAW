# EVERNODE_WITHDRAW
Script to withdraw EVR rewards from one or more Evernode nodes.

This Script will cycle through an array of addresses, get their EVR balance then send all of the EVR balance to a single receiving address with TAG. This script is designed to use a single signing address where all nodes have set their Regular Key to the signing address of an active account in Xaman or other wallet that you control.

To set the Regular Key for a node...on each node issue the command from the terminal 

$ evernode regkey set rWalletAddressThatYouOwnThatCanSignTransactions

Optionally: in Xaman (or other wallet app) import the nodes rAddressNode01 to 03 as a ReadOnly existing account for easy visability.

**install & run**

git clone https://github.com/jellicoe/EVERNODE_WITHDRAW/

cd EVERNODE_WITHDRAW

Copy .env.sample to .env
Fields to SET in .env file script:

accounts="rAddressNode01

rAddressNode02

rAddressNode03"

secret="ssWalletSecretThatCanSIGN"

destination="rYourWalletYouControl"

tag="1234567"

npm install

node transfer_funds.js

*use at your own risk - double check all fields point to YOUR addresses that you CONTROL*

To set a scheduled task to do this use cron, the example below runs the transfer script every 4 hours and logs the results to a file called log.log

$crontab -e

"* */4 * * * /usr/bin/node /root/EVERNODE_WITHDRAW/transfer_funds.js >> /root/EVERNODE_WITHDRAW/log.log 2>&1"

END.


