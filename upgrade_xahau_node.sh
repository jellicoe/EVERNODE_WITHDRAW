
#!/bin/bash
mv /root/mainnet-docker /root/mainnet-docker_old_"$(date '+%Y-%m-%d')"
cd /root
git clone https://github.com/Xahau/mainnet-docker

#copy backedup configs
cp /root/zkeep/*.cfg /root/mainnet-docker/store/etc/
cd /root/mainnet-docker
./build
./up

#docker exec xahaud-mainnet xahaud server_info