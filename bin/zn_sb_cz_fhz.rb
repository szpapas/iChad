#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'

require 'serialport'
require 'pg'
require 'find'


# ********************************************************************************************
#
#   main fucntions 
#   用来在后台运行，监听串口数据，然后判断操作操作是否成功，如果成功在zn_sb_cz_list的zt上设为1，如果失败则设为2，以便让zn_sb_cz.rb判断此设备操作是否成功并做下一步操作
#
#*********************************************************************************************
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

sp = SerialPort.new "/dev/ttyUSB0", 9600
puts sp

def every_n_seconds(n) 
     loop do 
         before= Time.now 
         yield 
         interval=n-(Time.now-before) 
         sleep(interval) if interval>0 
     end 
end

fhz=""
js=0
fhz1=""

every_n_seconds(0.05) do 
  ss = sprintf("%02X", sp.getc)
  puts ss
  
  if ss.to_i(16)==10
    js=0
    fhz=ss
  else  
    if fhz==""
      fhz= ss
    else
      fhz=fhz + "," + ss
    end
    fhzs=fhz.split(',')
    if fhzs.length==9
      puts fhz 
      puts fhzs[5].to_i(16)
     if fhzs[5].to_i(16)==255
       
       list=$conn.exec("select * from zn_sb_cz_list order by id limit 1;")  
       size=list.count
       if size>0
         puts "update  zn_sb_cz_list set zt=2 id=#{list[0]['id']};"
         zt=  $conn.exec("update  zn_sb_cz_list set zt=2 where id=#{list[0]['id']};") 
       end
     else
       
       list=$conn.exec("select * from zn_sb_cz_list order by id limit 1;")  
       size=list.count
       if size>0
          puts "update  zn_sb_cz_list set zt=1 id=#{list[0]['id']};"
          zt=  $conn.exec("update  zn_sb_cz_list set zt=1 where id=#{list[0]['id']};")
       end
     end     
    end
    js=js+1
  end
end


sp.close