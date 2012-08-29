#!/bin/sh
RAILS_ROOT="/home/liujun/iChad"
if ps ax | grep ruby | grep rails | grep 800[0123]  > /dev/null
then
    echo "Rails service running, everything is fine"
    kill $(ps ax | grep ruby | grep rails | grep 800[0123] | awk '{print $1}')
    sleep 5
else
    echo "Rails is not running"
fi
echo "Restart Rails"
/etc/init.d/rails start
