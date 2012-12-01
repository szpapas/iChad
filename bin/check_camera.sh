#!/bin/sh
RAILS_ROOT="/home/liujun/iChad"
if ps ax | grep -v grep | grep wl_sb_cz  > /dev/null
then
    echo "Camera service running, everything is fine"
    kill $(ps ax | grep -v grep | grep wl_sb_cz | awk '{print $1}')
    sleep 5
else
    echo "Camera is not running"
fi
echo "Restart Camera service"
su -c "cd $RAILS_ROOT && ruby ./dady/bin/wl_sb_cz.rb > /tmp/wl_sb_cz.log 2>&1 &"
