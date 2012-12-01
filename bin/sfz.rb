#!/usr/bin/ruby

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

def scan_host(host_ip)  #cmd = "80 40"
  client = TCPSocket.open host_ip, 50000
  recv_length = 1024

  ss="D&C00040101"
  
  puts("#{Time.now.to_f}:#{hex_str(ss)}")
  zz="4426433030303430313031"
  client.send ss, 0

  begin 
    str=""
    timeout(2) do
      while true do
         #ss = client.recv(1024)
         #str= hex_str(ss)
         #str=str  + str1
         #puts str
      end
      #ss = client.recv(1024)
      #str = hex_str(ss)
      #puts str
      
      #Processing data here
      
    end
    
  rescue Timeout::Error
      puts "Timed out!"
  end
  ss = client.recv(1024)
  str= hex_str(ss)
  puts str
  puts str.length
  if str.length>200
    idx = str.index("AA AA AA 96 69 05 08 00 00 90 ")/3
    if !idx.nil?
      wb_len = ss[idx+10]*256+ss[idx+11]
      tx_len = ss[idx+12]*256+ss[idx+13]
      wb = ss[idx+14..idx+4+wb_len-1]
    
      wbxx = Iconv.iconv('UTF-8','UTF-16LE', wb).to_s
      puts wbxx
    
      #tx = ss[idx+wb_len..-1]
    end
  else
    puts "请移动一下身份证。"
  end
  client.close
end

host_ip = "192.168.114.48"
puts "查询  #{host_ip}"


scan_host(host_ip)


