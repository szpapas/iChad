#!/usr/bin/ruby
$:<<'C:/Ruby187/lib/ruby/gems/1.8/gems/digest-crc-0.3.0/lib'

require 'socket'
require 'digest/crc16_modbus'

if ARGV[0].nil?
  host = "127.0.0.1"
else
  host = ARGV[0]
end  


client = TCPSocket.open "192.168.0.18", 50000

recv_length = 1024

def set_k(cmd)
  ss, chr = "", "\000"
  code = cmd.split(" ")
  #code = cmd.scan /.{2}/
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
  l = l.chomp
  if l == "exit"
    client.close
    exit
  elsif l == "open"
    ss=set_k("01 02 03 04")
    puts("#{Time.now.to_f}:#{hex_str(ss)}")
    client.send ss, 0
  elsif l.include?("send:")
    ss=set_k(l.gsub("send:","").strip)
    puts("#{Time.now.to_f} send:#{hex_str(ss)}")
    client.send ss, 0  
  elsif l == "close"
    ss=set_k("F2 80 22 00 00")
    puts("#{Time.now.to_f}:#{hex_str(ss)}")
    client.send ss, 0  
  else
    client.send l.sub("\n", "\r"), 0  
  end    
end