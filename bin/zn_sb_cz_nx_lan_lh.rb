#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'

require 'pg'
require 'find'
require 'socket'


# ********************************************************************************************
#
#   main fucntions 
#   用来在后台运行，对各个房间的继电器状态进行读取，并根据读取后的数据对相应的设备进行操作，操作完后做日志记录zn_nx_rz
#
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

def every_n_seconds(n) 
     loop do 
         before= Time.now 
         yield 
         interval=n-(Time.now-before) 
         sleep(interval) if interval>0 
     end 
end 
def hex_str(ss)
  str = ''
  for k in 0..ss.length-1
    str = str +  sprintf("%02X", ss[k]) + ' '
  end  
  str
end
sj=0
def sb_cz(host_ip,cz)   #cz　１代表读取开关量，２代表读取当前继电器状态
      rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
      puts "查询  #{host_ip}"
      client = TCPSocket.open host_ip, 50000      
      recv_length = 1024
      if cz==1
        sy="CC DD C0 01 00 00 0D CE 9C"
      else
        sy="CC DD B0 01 00 00 0D BE 7C"
      end
      kzzl = sy.split(' ') 
      ss="0123456780"
      #puts kzzl.length-1
      for k in 0..kzzl.length-1
        ss[k]=kzzl[k].to_i(16)
      end  
      #puts("#{Time.now.to_f}:#{ss}")
      client.send ss, 0 
      ss = client.recv(1024)
      #puts ss
      str= hex_str(ss)
      #puts str
      client.close
      return str    
end


jg37=0 #阅档室继电器中红外无运作时间
jg38=0 #档案室继电器中红外无运作时间

mc37zt=0 #阅档室继电器中门磁状态
mc38zt=0 #档案室继电器中门磁状态

jg39=0 #库房继电器中门磁状态
mc39zt=0 #库房继电器中门磁状态


t1 = 0
every_n_seconds(1) do
  
  
  #因为六合的开关都是集中在一个继电器上，所有一开始先把开关的状态读取出来
  fhz=sb_cz("192.168.114.47",2)  #阅档室继电器
  fhz2=fhz.split(" ")
  fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
  puts fhz
  
  
  #阅档室根据红外来　开关灯光
  puts "阅档室........."
  fhz=sb_cz("192.168.114.37",1)
  fhz1=fhz.split(" ")
  puts fhz
  if fhz1.length==8
    fhz2jz=fhz1[5].to_i(16).to_s(2).rjust(8,"0") #把返回值中的开关量状态数据　变成　８位的２进制数组，然后用来判断各个开关量的状态
    puts fhz2jz[8-2..-2]
    if fhz2jz[8-2..-2]=='1'  #37开关量的第２位是红外，如果红外的开关量状态为１的话就开灯
      jg37=0            
      if fhz2jz_kg[8-3..-3]=='0' #阅档室灯在第３位
        system("ruby ./dady/bin/zn_sb_cz_lan.rb '192.168.114.47' '开' 28  &")
      end
    else
      jg37=jg37.to_i+1
    end    
    puts "阅档室时间间隔：" + jg37.to_s
    if jg37.to_i>1800
      if fhz2jz_kg[8-3..-3]=='1'
        system("ruby ./dady/bin/zn_sb_cz_lan.rb '192.168.114.47' '关' 28  &")
      end
    end
    puts fhz2jz[8-1..-1]
    if fhz2jz[8-1..-1]=='0' #37开关量的第1位是门磁，如果门磁的开关量状态为１的话就照像
      if mc37zt!=0
          mcinsert= $conn.exec("insert into mc_image(device_id,sbh,zt) values(34,'192.168.114.37',0)  RETURNING id;")  
          $conn.exec("update zn_sb set kgzt='开' where id=34;")              
          ss="camera:10,id:" + mcinsert[0]['id'].to_s
          system("ruby ./bin/wl_sb_cz_m1.rb 192.168.114.46 #{mcinsert[0]['id']} &")                 
      end
    else
      $conn.exec("update zn_sb set kgzt='关' where id=34;")
    end
    mc37zt=fhz2jz[8-1..-1].to_i
  end
  
  
  #档案室根据红外来　开关灯光
  puts "档案室........."
  fhz=sb_cz("192.168.114.38",1)
  fhz1=fhz.split(" ")
  puts fhz
  if fhz1.length==8
    fhz2jz=fhz1[5].to_i(16).to_s(2).rjust(8,"0") #把返回值中的开关量状态数据　变成　８位的２进制数组，然后用来判断各个开关量的状态
    if fhz2jz[8-1..-1]=='1'  #38开关量的第1位是门口红外，如果红外的开关量状态为１的话就开灯
      jg38=0            
      if fhz2jz_kg[8-4..-4]=='0' #档案室灯在第4位
        system("ruby ./dady/bin/zn_sb_cz_lan.rb '192.168.114.47' '开' 42  &")
      end
    else
      jg38=jg38.to_i+1
    end  
    if fhz2jz[8-2..-2]=='1'  #38开关量的第2位是室内红外，如果红外的开关量状态为１的话就开灯
      jg38=0            
      if fhz2jz_kg[8-4..-4]=='0' #档案室灯在第4位
        system("ruby ./dady/bin/zn_sb_cz_lan.rb '192.168.114.47' '开' 42  &")
      end
    else
      jg38=jg38.to_i+1
    end
      
    puts "档案室时间间隔：" + jg38.to_s
    if jg38.to_i>3600
      if fhz2jz_kg[8-4..-4]=='1'
        system("ruby ./dady/bin/zn_sb_cz_lan.rb '192.168.114.47' '关' 42  &")
      end
    end
    
    
    #库房根据红外来　开关灯光
    puts "库房........."
    fhz=sb_cz("192.168.114.39",1)
    fhz1=fhz.split(" ")
    puts fhz
    if fhz1.length==8
      fhz2jz=fhz1[5].to_i(16).to_s(2).rjust(8,"0") #把返回值中的开关量状态数据　变成　８位的２进制数组，然后用来判断各个开关量的状态
      puts fhz2jz[8-1..-1]
      if fhz2jz[8-1..-1]=='1'  #37开关量的第1位是红外，如果红外的开关量状态为１的话就开灯
        jg39=0            
        if fhz2jz_kg[8-1..-1]=='0' #库房灯在第1位
          system("ruby ./dady/bin/zn_sb_cz_lan.rb '192.168.114.47' '开' 21  &")
        end
      else
        jg39=jg39.to_i+1
      end    
      puts "库房时间间隔：" + jg39.to_s
      if jg39.to_i>3600
        if fhz2jz_kg[8-1..-1]=='1'
          system("ruby ./dady/bin/zn_sb_cz_lan.rb '192.168.114.47' '关' 21  &")
        end
      end
      puts fhz2jz[8-3..-3]
      if fhz2jz[8-3..-3]=='0' #39开关量的第3位是门磁，如果门磁的开关量状态为１的话就照像
        if mc39zt!=0            
            mcinsert= $conn.exec("insert into mc_image(device_id,sbh,zt) values(19,'192.168.114.39',0)  RETURNING id;")
            $conn.exec("update zn_sb set kgzt='开' where id=19;")                
            ss="camera:10,id:" + mcinsert[0]['id'].to_s
            system("ruby ./bin/wl_sb_cz_m1.rb 192.168.114.49 #{mcinsert[0]['id']} &")          
        end
      else
        $conn.exec("update zn_sb set kgzt='关' where id=19;")
      end
      mc39zt=fhz2jz[8-3..-3].to_i
    end
  end
  
end
  
  
  


