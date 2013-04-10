#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'

require 'pg'
require 'find'
require 'socket'
require 'timeout'

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
def sb_cz(host_ip,cz,port)   #cz　１代表读取开关量，２代表读取当前继电器状态
  begin 
    timeout(5) do
      rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
      puts ">>>> 查询： #{host_ip}  #{port}, #{cz}"
      client = TCPSocket.open host_ip, port      
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
    rescue Timeout::Error,Errno::EHOSTUNREACH,Errno::EHOSTDOWN,Errno::ECONNREFUSED
        puts "eeeeeeeeeeee #{host_ip} #{port} #{cz} Timed out! eeeeeeeee"
        return ""
    end  
end


jg37=0 #库房一继电器中红外无运作时间
jg38=0 #库房二继电器中红外无运作时间

mc37zt=0 #库房一继电器中门磁状态
mc38zt=0 #库房二继电器中门磁状态

jg39=0 #库房继电器中门磁状态
mc39zt=0 #库房继电器中门磁状态

jgdas=0

t1 = 0
wsd=0
sd=0
def kf1
  
end

every_n_seconds(1) do

      rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")  
      puts '办公室。。。。。。'      
        client = TCPSocket.open '10.5.6.24',50008
        ss = client.recv(1024)
        #获取温湿度
        str=ss.split('A2 00')
        if str.length>1
          sss=str[1]
          puts sss[0..11]
          wsdz=sss[2..11].gsub('&',',')
          puts wsdz
          wsd1=wsdz.split(',')
          sd=wsd1[1].to_i
          puts "update zn_sb set czzt='#{wsdz}',kgzt='#{wsdz}', ktzt='#{wsdz}' where id=47;"
          $conn.exec("update zn_sb set czzt='#{wsdz}',kgzt='#{wsdz}', ktzt='#{wsdz}' where id=47;")
        end
        #获取红外
        str=ss.split('A3 40D1')
        client.close
        if str.length>1
          puts "insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('10.5.6.24:50008,1,办公室',0, 0, 0, '#{rq}', '开');"
          $conn.exec("insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('10.5.6.24:50008,1,办公室',0, 0, 0, '#{rq}', '开');")
          fhz=sb_cz("10.5.6.24",2,50006)  #办公室继电器
          fhz2=fhz.split(" ")
          fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
          puts fhz
          jg39=1            
          if fhz2jz_kg[8-4..-4]=='0' #办公室灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 2 50006  ")
          end
        else
          jg39=jg39+1          
        end
        if jg39>3600
          fhz=sb_cz("10.5.6.24",2,50006)  #办公室继电器
          fhz2=fhz.split(" ")
          fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
          puts fhz
          if fhz2jz_kg[8-4..-4]=='1' #办公室灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 2 50006  ")
          end
          jg39=1
        end      
        

      #开始先把库房一的开关的状态读取出来
      #库房一根据红外来　开关灯光
      puts "库房一........."
      fhz=sb_cz("10.5.6.24",1,50000)
      fhz1=fhz.split(" ")
      puts fhz
      if fhz1.length==8
        fhz2jz=fhz1[5].to_i(16).to_s(2).rjust(8,"0") #把返回值中的开关量状态数据　变成　８位的２进制数组，然后用来判断各个开关量的状态
    #    puts fhz2jz[8-1..-1]
        
        if fhz2jz[8-1..-1]=='1'  #37开关量的第１位是红外，如果红外的开关量状态为１的话就开灯
          puts "insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('10.5.6.24:50000,1,库房一',0, 0, 0, '#{rq}', '开');"
          $conn.exec("insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('10.5.6.24:50000,1,库房一',0, 0, 0, '#{rq}', '开');")
          fhz=sb_cz("10.5.6.24",2,50007)  #库房一继电器
          fhz2=fhz.split(" ")
          fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
          puts fhz
          jg37=0            
          if fhz2jz_kg[8-4..-4]=='0' #库房一灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 9 50007  ")
          end
          if fhz2jz_kg[8-3..-3]=='0' #库房一灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 8 50007  ")
          end
          if fhz2jz_kg[8-2..-2]=='0' #库房一灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 7 50007  ")
          end
          if fhz2jz_kg[8-1..-1]=='0' #库房一灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 1 50007  ")
          end
        else
          jg37=jg37.to_i+1
        end    
        puts "库房一时间间隔：" + jg37.to_s
        if jg37.to_i>900
          fhz=sb_cz("10.5.6.24",2,50007)  #库房一继电器
          fhz2=fhz.split(" ")
          fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
          puts fhz
          if fhz2jz_kg[8-4..-4]=='1' #库房一灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 9 50007  ")
          end
          if fhz2jz_kg[8-3..-3]=='1' #库房一灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 8 50007  ")
          end
          if fhz2jz_kg[8-2..-2]=='1' #库房一灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 7 50007  ")
          end
          if fhz2jz_kg[8-1..-1]=='1' #库房一灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 1 50007  ")
          end
          jg37=0
        end
        puts fhz2jz[8-4..-4]
        if fhz2jz[8-4..-4]=='0' #37开关量的第４位是门磁，如果门磁的开关量状态为１的话就照像
          if mc37zt!=0
              $conn.exec("insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('',0, 0, 5, '#{rq}', '开');")
              mcinsert= $conn.exec("update zn_sb set kgzt='开' where id=5;")
              mcinsert= $conn.exec("insert into mc_image(device_id,sbh,zt) values(5,'192.168.117.10',0)  RETURNING id;")                
              ss="camera:10,id:" + mcinsert[0]['id'].to_s
              system("ruby ./bin/wl_sb_cz_m1.rb 10.5.6.24 50002 #{mcinsert[0]['id']} &")   #库房一摄像头地址       
          end
        else
          if mc37zt!=1
            $conn.exec("insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('',0, 0, 5, '#{rq}', '关');")
            mcinsert= $conn.exec("update zn_sb set kgzt='关' where id=5;")
          end
        end
        mc37zt=fhz2jz[8-4..-4].to_i
      end
 
 
      #库房二根据红外来　开关灯光
      puts "库房二........."
      fhz=sb_cz("10.5.6.24",1,50001)
      fhz1=fhz.split(" ")
      puts fhz
      if fhz1.length==8
        fhz2jz=fhz1[5].to_i(16).to_s(2).rjust(8,"0") #把返回值中的开关量状态数据　变成　８位的２进制数组，然后用来判断各个开关量的状态
      #  puts fhz2jz[8-1..-1]
        if fhz2jz[8-1..-1]=='1'  #37开关量的第１位是红外，如果红外的开关量状态为１的话就开灯
          puts "insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('10.5.6.24:50001,1,库房二',0, 0, 0, '#{rq}', '开');"
          $conn.exec("insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('10.5.6.24:50001,1,库房二',0, 0, 0, '#{rq}', '开');")
          jg38=0  
          #开始先把库房二的开关的状态读取出来
            fhz=sb_cz("10.5.6.24",2,50005)  #库房二继电器
            fhz2=fhz.split(" ")
            fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
            puts fhz          
          if fhz2jz_kg[8-4..-4]=='0' #库房二灯在第４位         
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 16 50005  ")
          end
          if fhz2jz_kg[8-3..-3]=='0' #库房二灯在第４位         
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 15 50005  ")
          end
          if fhz2jz_kg[8-2..-2]=='0' #库房二灯在第４位         
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 14 50005  ")
          end
          if fhz2jz_kg[8-1..-1]=='0' #库房二灯在第４位         
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 3 50005  ")
          end
        else
          jg38=jg38.to_i+1
        end    
        puts "库房二时间间隔：" + jg38.to_s
        if jg38.to_i>900
          #开始先把库房二的开关的状态读取出来
            fhz=sb_cz("10.5.6.24",2,50005)  #库房二继电器
            fhz2=fhz.split(" ")
            fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
            puts fhz

          if fhz2jz_kg[8-4..-4]=='1' #库房二灯在第４位         
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 16 50005  ")
          end
          if fhz2jz_kg[8-3..-3]=='1' #库房二灯在第４位         
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 15 50005  ")
          end
          if fhz2jz_kg[8-2..-2]=='1' #库房二灯在第４位         
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 14 50005  ")
          end
          if fhz2jz_kg[8-1..-1]=='1' #库房二灯在第４位         
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 3 50005  ")
          end
          jg38=0
        end
      #  puts fhz2jz[8-4..-4]
        if fhz2jz[8-4..-4]=='0' #37开关量的第４位是门磁，如果门磁的开关量状态为１的话就照像
          if mc38zt!=0
              $conn.exec("insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('',0, 0, 6, '#{rq}', '开');")
              mcinsert= $conn.exec("update zn_sb set kgzt='开' where id=6;")
              mcinsert= $conn.exec("insert into mc_image(device_id,sbh,zt) values(6,'192.168.117.11',0)  RETURNING id;")                
              ss="camera:10,id:" + mcinsert[0]['id'].to_s
              system("ruby ./bin/wl_sb_cz_m1.rb 10.5.6.24 50003 #{mcinsert[0]['id']} &")   #库房二摄像头地址                    
          end
        else
          if mc38zt!=1
            $conn.exec("insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('',0, 0, 6, '#{rq}', '关');")
            mcinsert= $conn.exec("update zn_sb set kgzt='关' where id=6;")
          end
          
        end
        mc38zt=fhz2jz[8-4..-4].to_i
      end 
  
      #办公室根据红外来　开关灯光
      puts "办公室........."
      fhz=sb_cz("10.5.6.24",1,50004)
      fhz1=fhz.split(" ")
      puts fhz
      if fhz1.length==8
        fhz2jz=fhz1[5].to_i(16).to_s(2).rjust(8,"0") #把返回值中的开关量状态数据　变成　８位的２进制数组，然后用来判断各个开关量的状态        
        if fhz2jz[8-3..-3]=='1'  
          $conn.exec("insert into zn_cz_rz(dlz,czid, userid, sbid, rq,czsm) values ('10.5.6.24:50004,4,办公室2',0, 0, 0, '#{rq}', '开');")
          jg39=0
          #开始先把办公室的开关的状态读取出来
         fhz=sb_cz("10.5.6.24",2,50006)  #办公室继电器
         fhz2=fhz.split(" ")
         fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
         puts fhz            
          if fhz2jz_kg[8-4..-4]=='0' #办公室灯在第４位
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 2 50006  ")
          end
        else
          jg39=jg39.to_i+1
        end      
        puts "办公室时间间隔：" + jg39.to_s
        if jg39.to_i>3600
          #开始先把办公室的开关的状态读取出来
          fhz=sb_cz("10.5.6.24",2,50006)  #办公室继电器
          fhz2=fhz.split(" ")
          fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
          puts fhz
        if fhz2jz_kg[8-4..-4]=='1'
          system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 2 50006  ")
        end
          jg39=0
        end  
      end
      fhz=sb_cz("10.5.6.24",2,50004)  #加湿器继电器
      puts "加湿器继电器:" + fhz
      fhz2=fhz.split(" ")
      fhz2jz_kg=fhz2[5].to_i(16).to_s(2).rjust(8,"0")
      if sd>55
        if fhz2jz_kg[8-4..-4]=='1'
          system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '关' 48 50004 ")
        end
      else
        if sd<45
          if fhz2jz_kg[8-4..-4]=='0'
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 48 50004 ")
          end
        else
          if fhz2jz_kg[8-4..-4]=='0'
            system("ruby ./dady/bin/zn_sb_cz_lan.rb '10.5.6.24' '开' 48 50004 ")
          end
        end
      end

  
end
  
  
  


