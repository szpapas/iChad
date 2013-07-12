#!/usr/bin/ruby

#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
require 'pg'
require 'find'


# ********************************************************************************************
#
#   main fucntions 
#   直接调用，对设置进行相应的操作，操作完后做日志记录zn_cz_rz 　调用方式　ruby ./dady/bin/zn_sb_cz_lan.rb '192.168.114.47' '关' 28
#继电器ip      操作动作　　设备id
#
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
require 'socket'
require 'timeout'
require 'iconv'

def hex_str(ss)
  str = ''
  for k in 0..ss.length-1
    str = str +  sprintf("%02X", ss[k]) + ' '
  end  
  str
end

def scan_host(host_ip,sbid,cz,port)  #cmd = "80 40"
  client = TCPSocket.open host_ip, port
  recv_length = 1024
  list=$conn.exec("select * from zn_sb where id=#{sbid};") 
  rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
  case cz
    when '开'
      sbls=list[0]['kgls'].to_i
      sbcz="1"
      sbcz=sbcz.ljust(sbls.to_i,"0")
      sbcz16=sbcz.to_i(2).to_s(16)
      sy="CC DD A1 01 00 " + sbcz16.to_s + " 00 " + sbcz16.to_s
      kzzl = sy.split(' ') 
      yy=0
      for k in 2..7
        yy=kzzl[k].to_i(16)+yy
      end
      xx=(yy%256).to_s(16)
      sy=sy + " " +xx
      yy=xx.to_i(16) + yy
      xx=(yy%256).to_s(16)
      sy=sy + " " +xx
      kgzt="01"
    when '关'
      sbls=list[0]['kgls'].to_i
      sbcz="1"
      sbcz=sbcz.ljust(sbls.to_i,"0")
      sbcz16=sbcz.to_i(2).to_s(16)
      sy="CC DD A1 01 00 00 00 " + sbcz16.to_s
      kzzl = sy.split(' ') 
      yy=0
      for k in 2..7
        yy=kzzl[k].to_i(16)+yy
      end
      xx=(yy%256).to_s(16)
      sy=sy + " " +xx
      yy=xx.to_i(16) + yy
      xx=(yy%256).to_s(16)
      sy=sy + " " +xx
      kgzt="00"
    else
      sy="CC DD C0 01 00 00 0D CE 9C"
  end 
  puts("#{Time.now.to_f}:#{sy}")
  kzzl = sy.split(' ') 
  ss="0123456780"
  for k in 0..kzzl.length-1
    ss[k]=kzzl[k].to_i(16)
  end  
  client.send ss, 0 
  ss = client.recv(1024)
  puts ss
  str= hex_str(ss)
  puts str  
  if ss=='OK!'
    $conn.exec("update  zn_sb set czzt='成功',kgzt='#{cz}',ktzt='#{kgzt}' where id=#{sbid};")
    puts "insert into zn_cz_rz(czid, userid, sbid, rq,czsm) values (0, 0, #{sbid}, '#{rq}', '#{cz}');"
    $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,czsm) values (0, 0, #{sbid}, '#{rq}', '#{cz}');")
  else
   # if cz=='读取状态'
   #   fhz=str.split(" ")
   #   if fhz.length==8
   #     if fhz[5]=='08'
   #       scan_host("192.168.114.49",41,"开")
   #     end
   #     $conn.exec("update  zn_sb set czzt='成功',kgzt='#{kgzt}' where id=#{sbid};")
   #   else
   #     $conn.exec("update  zn_sb set czzt='失败' where id=#{sbid};")
   #   end
   # else
      $conn.exec("update  zn_sb set czzt='失败' where id=#{sbid};")
   # end
  end
  client.close
end


sbh, cz, sbid,port = ARGV[0], ARGV[1], ARGV[2], ARGV[3]
host_ip = sbh
puts "查询  #{host_ip}"


scan_host(host_ip,sbid,cz,port)


