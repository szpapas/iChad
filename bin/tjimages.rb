#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' #<< '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
#require 'serialport'
require 'pg'
require 'find'

#sp = SerialPort.new "/dev/ttyUSB0", 9600

# ********************************************************************************************
#
#   main fucntions 
#   用来在后台运行，读取zn_nx数据，并根据此表的记录进行设备操作，操作完后做日志记录zn_nx_rz
#
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
  list=$conn.exec("select distinct qzh,dalb,mlh from archive where dalb<>'24' order by qzh,dalb,mlh;") 
  for j in 0..list.count-1
    #puts "select count(*) from timage where dh like '#{list[j]['qzh']}-#{list[j]['dalb']}-#{list[j]['mlh']}-%';"
    imagecount=$conn.exec("select count(*) from timage where dh like '#{list[j]['qzh']}-#{list[j]['dalb']}-#{list[j]['mlh']}-%' and sfzs<>1;")
    
    puts list[j]['qzh'].to_s + "_" + list[j]['dalb'].to_s + "_" + list[j]['mlh'].to_s + "-" + imagecount[0]['count'].to_s

  end
   # for i in 0..180
   #   date=Time.mktime(2012,3,1,8)+(i.to_i*86400).to_i
   #   for k in 1..40
   #     date=date+900
   #     rq1=date.strftime("%Y-%m-%d %H:%M:%S")
   #     sj=date.to_i    
   #     list=$conn.exec("select * from zn_sb where sblx in (1,2,3);")  
   #     for j in 0..list.count-1
   #       kgzt=rand(100)+20
   #       if kgzt.to_i>50
   #         kgzt=1
   #       else
   #         kgzt=0
   #       end      
   #       puts "insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('1', '1', #{list[j]['id']}, '#{rq1}', 1,#{kgzt.to_i}, '#{sj}');"
   #       $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('1', '1', #{list[j]['id']}, '#{rq1}', 1,#{kgzt.to_i}, '#{sj}');")
   #     end    
   #   end
   # end
