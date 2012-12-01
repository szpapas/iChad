#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' 
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'socket'
require 'timeout'

def hex_str(ss)
  str = ''
  for k in 0..ss.length-1
    str = str +  sprintf("%02X", ss[k]) + ' '
  end  
  str
end

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")


def get_image(cameraIP, port, deviceID)
    client = TCPSocket.open cameraIP, port
    puts "port opened"
    #send comand to take photos
    client.send "UG3#", 0
    
    recv_length = 1024
    saveStr, bNewImage, $count, ss  = '', false, 0, ''
    
    while true do
      begin 
        timeout(10) do
           ss = client.recv(recv_length)
           
           #str = hex_str(ss)
           #puts str
           
           saveStr = saveStr+ss
           if !saveStr.index("\377\330").nil? && bNewImage == false
              idx = saveStr.index("\377\330")
              saveStr = saveStr[idx..-1]
              bNewImage = true
           elsif !saveStr.index("\377\331").nil?  #FF D9
              idx = saveStr.index("\377\331") + 1
              saveStr = saveStr[0..idx]
              filename = Time.now.strftime('%Y%m%d%H%M%S')+'.jpg'
              timeStr = Time.now.strftime('%Y-%m-%d %H:%M:%S')

              #save file to database
              edata=PGconn.escape_bytea(saveStr)
              puts "update mc_image set yxmc = '#{filename}', yxdx = #{saveStr.length}, created_at = TIMESTAMP '#{timeStr}', zt=1 where id = #{deviceID};"  

              $conn.exec "update mc_image set yxmc = '#{filename}', yxdx = #{saveStr.length}, created_at = TIMESTAMP '#{timeStr}', zt=1, data = E'#{edata}' where id = #{deviceID};"  

              #save to file for later use
              ff = File.open("./dady/camera/"+filename,'w+')
              ff.write(saveStr)
              ff.close
              puts "File received Finished"

              client.close
              $conn.close

              exit
           else 
              #puts "more data..."
              $count = 0
           end
           
        end
      rescue Timeout::Error
        $count = $count + 1
        puts "Timed out #{$count}!"
        if $count >= 5 
          if bNewImage == true
            filename = Time.now.strftime('%Y%m%d%H%M%S')+'_cap.log'
            ff = File.open("./camera/"+filename,'w+')
            ff.write(saveStr)
            ff.close
            puts "File received Finished on Timeout."
          else
            exit
          end  
        end  
      end
    end
    puts "Close client."
    client.close
end

#wl_sb_cz_m1.rb 192.168.117.13 50002 2
get_image(ARGV[0], ARGV[1], ARGV[2])

$conn.close

