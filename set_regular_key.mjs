import { derive, utils, signAndSubmit } from 'xrpl-accountlib'
import { XrplClient } from 'xrpl-client'

// Use:
// node setregularkey.mjs rekeyToRaddress originAccountSecret


/*console.log("Arguments are 0:", process.argv[0]);
console.log("Arguments are 1:", process.argv[1]);
console.log("Arguments are 2:", process.argv[2]);
console.log("Arguments are 3:", process.argv[3]);*/

const account = derive.familySeed(process.argv[3])

console.log("Account :", account);
//exit();

const nodes = {
  xahau: [
    new XrplClient('wss://xahau.network'),
  ]
}

console.log('Waiting for network connections to be ready')
await Promise.all(Object.keys(nodes).map(k => Promise.race(nodes[k].map(n => n.ready()))))

const [
  xahauParams,
] = await Promise.all([
  Promise.race(nodes.xahau.map(n => utils.accountAndLedgerSequence(n, account))),
])

const tx = {
  ...xahauParams.txValues,
  TransactionType: 'SetRegularKey',
  Fee: '10',
  RegularKey: process.argv[2],
}

console.log('Submitting TX')

const txsubm = await Promise.race(nodes.xahau.map(n => signAndSubmit(tx, n, account)))

console.log(' -->', 'Submitted! TX on Xahau mainnet:')
console.log(' -->', 'https://xahauexplorer.com/explorer/' + txsubm?.tx_id)
console.log('     -->', txsubm.response.engine_result, txsubm.response.engine_result_message)

// Closing connections
Object.keys(nodes).map(k => nodes[k].map(n => n.close()))