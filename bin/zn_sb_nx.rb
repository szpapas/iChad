#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
require 'serialport'
require 'pg'
require 'find'

sp = SerialPort.new "/dev/ttyUSB0", 9600

# ********************************************************************************************
#
#   main fucntions 
#   用来在后台运行，读取zn_nx数据，并根据此表的记录进行设备操作，操作完后做日志记录zn_nx_rz
#
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

def every_n_seconds(n) 
     loop do 
         before= Time.now 
         yield 
         interval=n-(Time.now-before) 
         sleep(interval) if interval>0 
     end 
end 



every_n_seconds(20) do 

  rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")

  list=$conn.exec("select zn_nx.*,zn_sb_cz.czzl,zn_sb.sbh from zn_sb_cz,zn_sb,zn_nx where zn_sb_cz.id=zn_nx.czid and zn_sb.id=zn_nx.sbid;")
  for k in 0..list.count-1
    li = list[k]
    puts "insert into zn_sb_cz_list(sbid,sbh,sbczid,sbczzl,userid) values (#{li['sbid']}, '#{li['sbh']}', #{li['czid']},'#{li['czzl']}',0);"
    $conn.exec("insert into zn_sb_cz_list(sbid,sbh,sbczid,sbczzl,userid) values (#{li['sbid']}, '#{li['sbh']}', #{li['czid']},'#{li['czzl']}',0);")
    
 #  sbczzl=li['czzl']
 #  sbh=li['sbh']
 #  puts sbh
 #  puts sbczzl
 #
 #  czzl=sbczzl.split(',')
 #  sy="0a,0d,06," +czzl[0] + ","+ sbh + "," +czzl[1]
 #  kzzl = sy.split(',') 
 #  yy=0
 #  for k in 3..7
 #    yy=kzzl[k].to_i(16)+yy
 #  end
 #  xx=(yy%256).to_s(16)
 #  sy=sy + "," +xx
 #  kzzl = sy.split(',') 
 #  ss="012345678"
 #  for k in 0..kzzl.length-1
 #    ss[k]=kzzl[k].to_i(16)
 #  end
 #  puts sy
 #  
 #  sp.write(ss)
 #  
 #  if li['userid']==''
 #    li['userid']=0
 #  end
#    puts "insert into zn_nx_cz(czid, sbh, sbid, rq) values ('#{li['czid']}', '#{li['sbh']}', #{li['sbid']}, '#{rq}');"
 #   $conn.exec("insert into zn_nx_cz(czid, sbh, sbid, rq) values ('#{li['czid']}', '#{li['sbh']}', #{li['sbid']}, '#{rq}');")
    
 #   sleep 2
  end
end