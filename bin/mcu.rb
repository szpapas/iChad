#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/digest-crc-0.3.0/lib'
$:<<'/usr/lib/ruby/gems/1.8/gems/digest-crc-0.3.0/lib'
$:<<'C:\Ruby187\lib\ruby\gems\1.8\gems\digest-crc-0.3.0\lib'
     

require 'socket'
require 'digest/crc16_modbus'

#client = TCPSocket.open "114.234.71.128", 50000
host = ARGV[0] || "127.0.0.1"
port = ARGV[1] || "50000"
puts "connect to #{host} #{port}..."
client = TCPSocket.open host, 50000
puts "port opened"

recv_length = 1024

#set_k("11 22 33 44 55 66 88 99 00")
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


Thread.new {
  while true do
    ss = client.recv(recv_length)
    str = ''
    for k in 0..ss.length-1
      str = str +  sprintf("%02X", ss[k]) + ' '
    end  
    puts "recv: #{str}"
  end
}

while (l = gets) do
  cmd = l.chomp
  if cmd == "exit"
    client.close
    exit
  elsif cmd == "open"
    puts "unknown cmd"
  elsif cmd.include?("send:")
    ss=set_k(cmd.gsub("send:","").strip)
    puts("#{Time.now.to_f} send:#{hex_str(ss)}")
    client.send ss, 0
  else
    puts "unknown cmd"
  end    
end