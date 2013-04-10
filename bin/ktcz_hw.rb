#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/Library/Ruby/Gems/1.8/gems/digest-crc-0.3.0/lib'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/lib/ruby/gems/1.8/gems/digest-crc-0.3.0/lib' 

require 'socket'
require 'timeout'
require 'pg'
require 'digest/crc16_modbus'

def set_k(cmd)
  ss, chr = "", "\000"
  code = cmd.split(" ")
  
  for k in 0..code.size-1
    chr[0] = code[k].to_i(16)
    ss = ss + chr
  end
  crc = Digest::CRC16Modbus.new  
  crc = crc.hexdigest(ss)
  chr1, chr2 = "\000" , "\000"
  chr1[0] =  crc[0..1].to_i(16)  #高位
  chr2[0] = crc[2..3].to_i(16)   #低位
  ss = ss + chr2 + chr1          #这个可能要倒换一下，地位在前，高位在后
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
  
  zt_str = sprintf("%02X", zt)
  
  cmd = "01 05 02 06 00 00 07 02 01 00 01 01 #{zt_str} 00"
    
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
      
      if zt == 1
        ktzt[3] = (zt+1)/2 == 0 ? '关' : '开' 
      elsif zt == 2  
        ktzt[2] = '制热'
      elsif zt == 3    
        ktzt[2] = '制冷'
      elsif zt == 4 
        ktzt[2] = (ktzt[2].to_i + 1).to_s
      elsif zt == 5 
        ktzt[2] = (ktzt[2].to_i - 1).to_s
      else
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





