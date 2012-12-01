#!/usr/bin/ruby
require 'socket'

client = TCPSocket.open "114.234.71.128", 50000
puts "port opened"

recv_length = 1024

$sxh = 50
def set_k(cmd)
  ss="\n\r\00645678901234567890"
  $sxh = ($sxh+1) % 128
  $sxh = $sxh+1 if $sxh==10 || $sxh == 13
  code = cmd.split(' ')
  for k in 0..code.size-1
     ss[k+4]=code[k].to_i(16)
  end
  ss[3] = $sxh
  for k in 9..19
    ss[k]=0
  end
  ss[2] = (ss[3]+ss[4]+ss[5]+ss[6]+ss[7]+ss[8]) % 256
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
    puts str
  end
}

while (l = gets) do
  l = l.chomp
  if l == "exit"
    client.close
    exit
  elsif l == "open"
    #ss=set_k("F7 8D A1 00 00")  #8D --  ZigBee ID, A1 -- WSD ID
    ss=set_k("F7 10 A9 00 00")   #8D --  ZigBee ID, A1 -- WSD ID
    
    
    puts("#{Time.now.to_f}:#{hex_str(ss)}")
    client.send ss, 0
    
  elsif l == "close"
    ss=set_k("F2 80 22 00 00")
    puts("#{Time.now.to_f}:#{hex_str(ss)}")
    client.send ss, 0  
  else
    client.send l.sub("\n", "\r"), 0  
  end    
end