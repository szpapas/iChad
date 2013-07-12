#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' 

require 'socket'
require 'timeout'
require 'pg'

<<<<<<< HEAD
if !File.exists?('/tmp/sxh')
  system 'cp /home/liujun/iChad/bin/sxh /tmp/sxh'
end
=======
>>>>>>> 47c02519d45cf239f86f363d3fa584da473a5f20

def set_k(cmd)
  ss="\n\r\00645678901234567890"
  $sxh = File.open('/tmp/sxh').read.to_i
  $sxh = ($sxh+1) % 128
  $sxh = $sxh+1 if $sxh==10 || $sxh == 13
  ff = File.open('/tmp/sxh','w')
  ff.write($sxh)
  ff.close
  code = cmd.split(' ')
  for k in 0..code.size-1
     ss[k+4]=code[k].to_i(16)
  end
  ss[3] = $sxh
  for k in 9..19
    ss[k]=0
  end
  ss[2] = (ss[3]+ss[4]+ss[5]+ss[6]+ss[7]+ss[8]) % 256
  puts hex_str(ss)
  ss
end

def hex_str(ss)
  str = ''
  for k in 0..ss.length-1
    str = str +  sprintf("%02X", ss[k]) + ' '
  end  
  str
end

def scan_host(sbh, zt, sbid)  #cmd = "80 40"
  $client = nil
  host_ip, port = sbh.split(',')
  
  if zt == 0 || zt == 1
<<<<<<< HEAD
    #这里的　００　０１　或０１　００看空调情况
    cmd = "F2 #{sbid} 00 01"
    cmd = "F2 #{sbid} 01 00"
  elsif zt == 2 
    cmd = "F2 #{sbid} 00 02"
  elsif zt == 3
    cmd = "F2 #{sbid} 00 04"
  elsif zt == 4
    cmd = "F2 #{sbid} 00 08"  
  end
  
  puts cmd
=======
    cmd = "F2 #{sbid} 01 00"
  elsif zt == 2 
    cmd = "F2 #{sbid} 02 00"
  elsif zt == 3
    cmd = "F2 #{sbid} 04 00"
  elsif zt == 4
    cmd = "F2 #{sbid} 08 00"  
  end
>>>>>>> 47c02519d45cf239f86f363d3fa584da473a5f20
    
  begin 
    timeout(5) do
      $client = TCPSocket.open host_ip, port 
      recv_length = 1024
      ss=set_k("#{cmd}")
      puts("#{Time.now.to_f}:#{hex_str(ss)}")
      $client.send ss, 0
      ss = $client.recv(1024)
      str = hex_str(ss)
      puts str
      
      #设定空调状态
      datas = $conn.exec "select ktzt from zn_sb where id=#{ARGV[0]};"
      ktzt = datas[0]['ktzt'].split(",")  #当前温度， 设定温度， mode, power
      
      if zt == 0 || zt == 1
        ktzt[3] = zt.to_s
      elsif zt == 2 
        ktzt[1] = ktzt[1].to_i + 1
      elsif zt == 3    
        ktzt[1] = ktzt[1].to_i - 1
      elsif zt == 4
        ktzt[2] = (ktzt[2].to_i + 1) % 3 
      end  
      
      ktzt = ktzt.join(',')
      puts "update zn_sb set czzt='成功', ktzt='#{ktzt}' where id=#{ARGV[0]};"
      $conn.exec "update zn_sb set czzt='成功', ktzt='#{ktzt}' where id=#{ARGV[0]};"
      
    end
  rescue Timeout::Error,Errno::EHOSTUNREACH,Errno::EHOSTDOWN
      puts "Timed out!"
      $conn.exec "update zn_sb set czzt='失败' where id=#{ARGV[0]};"
  end
  
  $client.close if !$client.nil?
end

device_id, zt = ARGV[0].to_i, ARGV[1].to_i

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
datas = $conn.exec "select sbh, cmd from zn_sb where id = #{device_id};"
sbh, sbid = datas[0]['sbh'], datas[0]['cmd']
puts "查询  #{sbh}, #{sbid}"

scan_host(sbh, zt, sbid)

$conn.close





