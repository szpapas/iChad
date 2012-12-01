#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
require 'serialport'
require 'pg'
require 'find'

sp = SerialPort.new "/dev/ttyUSB0", 9600 if File.exist?('/dev/ttyUSB0')
sp = SerialPort.new "/dev/ttyUSB1", 9600 if File.exist?('/dev/ttyUSB1')

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

#电流值15分种  #烟感和门禁　要５秒轮一次
sj=0
every_n_seconds(5) do
  rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
  puts rq
  list=$conn.exec("select zn_nx.*,zn_sb_cz.czzl,zn_sb.sbh from zn_sb_cz,zn_sb,zn_nx where zn_sb_cz.id=zn_nx.czid and zn_sb.id=zn_nx.sbid and zn_nx.nxdj=1;")
  for k in 0..list.count-1
    li = list[k]
    puts "insert into zn_sb_cz_list(sbid,sbh,sbczid,sbczzl,userid,sfnx) values (#{li['sbid']}, '#{li['sbh']}', #{li['czid']},'#{li['czzl']}',0,1);"
    user = $conn.exec("select count(*) from zn_sb_cz_list where sbid = #{li['sbid']} and sbh = '#{li['sbh']}' and sbczzl = '#{li['czzl']}';")
    $conn.exec("insert into zn_sb_cz_list(sbid,sbh,sbczid,sbczzl,userid,sfnx) values (#{li['sbid']}, '#{li['sbh']}', #{li['czid']},'#{li['czzl']}',0,1);")   if user[0]['count'].to_i == 0   
  end
  sj=sj+1
  if sj==180
    list=$conn.exec("select zn_nx.*,zn_sb_cz.czzl,zn_sb.sbh from zn_sb_cz,zn_sb,zn_nx where zn_sb_cz.id=zn_nx.czid and zn_sb.id=zn_nx.sbid and zn_nx.nxdj=2;")
    for k in 0..list.count-1
      li = list[k]
      puts "insert into zn_sb_cz_list(sbid,sbh,sbczid,sbczzl,userid,sfnx) values (#{li['sbid']}, '#{li['sbh']}', #{li['czid']},'#{li['czzl']}',0,1);"
      user = $conn.exec("select count(*) from zn_sb_cz_list where sbid = #{li['sbid']} and sbh = '#{li['sbh']}' and sbczzl = '#{li['czzl']}';")
      $conn.exec("insert into zn_sb_cz_list(sbid,sbh,sbczid,sbczzl,userid,sfnx) values (#{li['sbid']}, '#{li['sbh']}', #{li['czid']},'#{li['czzl']}',0,1);")  if user[0]['count'].to_i == 0   
    end
    sj=0
  end
end

#烟感和门禁　要５秒轮一次
