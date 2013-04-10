#!/usr/bin/ruby
#统计影像文件缺重卷情况
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
require 'pg'
require 'find'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")


  mlhdata=$conn.exec("select distinct dh ,count(*) from archive where mlh='102' group by dh;")
  for ii in 0..mlhdata.count-1
    if mlhdata[ii]['count']=='2'
      user = $conn.exec("select * from  archive where  dh ='#{mlhdata[ii]['dh']}'   order by mlh,ajh;")
      size = user.count
      for k in 0..size-1
        doc=$conn.exec("select * from  document where  ownerid =#{user[k]['id']};")
        if doc.count=0 
          puts "delete from archive where id=#{user[k]['id']}"
        end
      end
    end
  end

