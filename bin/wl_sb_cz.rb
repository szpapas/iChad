#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' 
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
require 'pg'
require 'socket'

def hex_str(ss)
  str = ''
  for k in 0..ss.length-1
    str = str +  sprintf("%02X", ss[k]) + ' '
  end  
  str
end

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

#Client thread 
client = TCPSocket.open "192.168.114.46", 50000
recv_length = 2048

#/dady/camera/
$saveStr, $NewImage, $CameraId, $DeviceID = '', false, 0, 0
Thread.new {
  while true do
    ss = client.recv(recv_length)
    str = hex_str(ss)
    #puts str
    
    #for image save
    if str.include?("FF D8")
      puts "new image begin"
      $saveStr = ss
      $NewImage = true
    elsif str.include?("FF D9") && $NewImage == true
      $saveStr = $saveStr + ss 
      filename = Time.now.strftime('%Y%m%d%H%M%S')+'.jpg'
      timeStr = Time.now.strftime('%Y-%m-%d %H:%M:%S')
      
      #save file to database
      edata=PGconn.escape_bytea($saveStr)
      update_str ="update mc_image set yxmc = '#{filename}', yxdx = #{$saveStr.length}, created_at = TIMESTAMP '#{timeStr}', zt=1 where id = #{$DeviceID};"  
      puts update_str
      $conn.exec "update mc_image set yxmc = '#{filename}', yxdx = #{$saveStr.length}, created_at = TIMESTAMP '#{timeStr}', zt=1, data = E'#{edata}' where id = #{$DeviceID};"  
    
      #save to file for later use
      ff = File.open("./dady/camera/"+filename,'w+')
      ff.write($saveStr)
      ff.close
      puts "File received Finished"
      
      $NewImage,  $saveStr = false, ''
    elsif $NewImage == true
      puts "... more data"
      $saveStr = $saveStr + ss
    end
    
  end
}


#Server thread
srv = TCPServer.open(50000)
server = srv.accept

while true do
  ss = server.recv(recv_length)
  puts hex_str(ss)
  
  #"camera:10,id:100"
  if dd=/\w+:(\d+),\w+:(\d+)/.match(ss)
    $CameraId, $DeviceID = dd[1], dd[2]
    puts "#{$CameraId}, #{$DeviceID}"
    client.send "UG3#", 0
  end

end


$conn.close