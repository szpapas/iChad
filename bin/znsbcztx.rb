#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'socket'

client = TCPSocket.open "192.168.114.46", 50000
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

$saveStr, $NewImage = '', false

Thread.new {
  while true do
    ss = client.recv(recv_length)
    
    str = ''
    for k in 0..ss.length-1
      str = str +  sprintf("%02X", ss[k]) + ' '
    end
    #puts str
    
    #for image save
    if str.include?("FF D8")
      puts "New image begin"
      $saveStr = ss
      $NewImage = true
    elsif str.include?("FF D9") && $NewImage == true
      $saveStr = $saveStr + ss 
      filename = Time.now.strftime('%Y%m%d%H%M%S')+'.jpg'
      ff = File.open(filename,'w+')
      ff.write($saveStr)
      ff.close
      puts "File received Finished"
      $NewImage = false
      $saveStr = ''
    elsif $NewImage == true
      puts "... more data"
      $saveStr = $saveStr + ss
    end
    
  end
}

while (l = gets) do
  l = l.chomp
  if l == "exit"
    #srv.close
    break
  elsif l == "UG3#"
    ss="UG3#"
    puts("#{Time.now.to_f}:#{hex_str(ss)}")
    client.send ss, 0
  elsif l == "UG2#"
    ss="UG2#"
    puts("#{Time.now.to_f}:#{hex_str(ss)}")
    client.send ss, 0  
  else
    client.send l.sub("\n", "\r"), 0  
  end    
end