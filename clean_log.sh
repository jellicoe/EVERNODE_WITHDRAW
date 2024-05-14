#!/bin/bash

rm /root/mainnet-docker/store/log/debug.log
rm /root/mainnet-docker/store/db/transaction.db
rm /root/mainnet-docker/store/db/ledger.db
rm /root/mainnet-docker/store/db/nudb/nudb.dat

wait 
cd /root/mainnet-docker/
/usr/bin/bash up

echo `date`
