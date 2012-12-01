#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

require 'socket'
require 'serialport'
require 'pg'
require 'find'

sp = SerialPort.new "/dev/ttyUSB0", 9600 if File.exist?('/dev/ttyUSB0')
sp = SerialPort.new "/dev/ttyUSB1", 9600 if File.exist?('/dev/ttyUSB1')

begin
  system "kill $(ps ax | grep -v grep | grep wl_sb_cz | awk '{print $1}')"
  sleep 1
  system "cd /home/liujun/iChad && ruby ./dady/bin/wl_sb_cz.rb > /tmp/wl_sb_cz.log 2>&1 &"
  sleep 5
  client = TCPSocket.open "192.168.114.91", 50000
end

# ********************************************************************************************
#
#   main fucntions 
#   用来在后台运行，读取zn_sb_cz_list数据，并根据此表的记录进行设备操作，操作完后做日志记录zn_cz_rz ，并删除zn_sb_cz_list数据
#
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
$conn.exec("delete from zn_sb_cz_list;")

$fhz=''
def every_n_seconds(n) 
     loop do 
         before= Time.now 
         yield 
         interval=n-(Time.now-before) 
         sleep(interval) if interval>0 
     end 
end 
tbt=0
def write_sb(li,sp,tbt)
  sbczzl=li['sbczzl']
  sbh=li['sbh']
  czzl=sbczzl.split(',')
  if li['sblx'].to_i==3
    if li['sbh']=='55,80'
        sy=tbt.to_s(16)+ "," +czzl[0] + ","+ sbh + "," + czzl[1] +",00"  + ",00,00,00,00,00,00,00,00,00,00,00"
    else
      sy=tbt.to_s(16)+ "," +czzl[0] + ","+ sbh + ",00," +czzl[1] + ",00,00,00,00,00,00,00,00,00,00,00"
    end
  else
    if li['sblx'].to_i==1
      if li['ktzt']==''
        li['ktzt']='00'
      end
      li['ktzt']=li['ktzt'].to_i.to_s(2)
      kgzt=li['ktzt']
      if kgzt.length>15
        kgzt=kgzt
      else
        kgzt=sprintf("%016d", kgzt)
      end
      kgzt=kgzt[0..15-li['kgls'].to_i].to_s + czzl[1].to_i.to_s + kgzt[15-li['kgls'].to_i+2..-1].to_s
      kgzt=kgzt.to_i(2).to_s
      if kgzt.length>2
      else
        kgzt=sprintf("%02d", kgzt)
      end
      sy=tbt.to_s(16)+ "," +czzl[0] + ","+ sbh + "," +kgzt.to_s + ",00,00,00,00,00,00,00,00,00,00,00,00"
    else
     sy=tbt.to_s(16)+ "," +czzl[0] + ","+ sbh + "," +czzl[1] + ",00,00,00,00,00,00,00,00,00,00,00,00"
    end
  end
  #sy="09," +czzl[0] + ","+ sbh + "," +czzl[1] + ",00,55,55,55,55,55,55,55,55,55,55,55"
  kzzl = sy.split(',') 
  yy=0
  for k in 0..16
    yy=kzzl[k].to_i(16)+yy
  end
  xx=(yy%256).to_s(16)
  sy="0a,0d," +xx+","+ sy
  

  
  kzzl = sy.split(',') 
  ss="01234567800000000000"
  puts kzzl.length-1
  for k in 0..kzzl.length-1
    ss[k]=kzzl[k].to_i(16)
  end

  puts sy  
  
  sp.write(ss)
end

#开一个进程用来监听串口
   Thread.new {
     $fhz=""
     js=0
     fhz1=""
     while true do
       ss = sprintf("%02X", sp.getc)
       puts ss       
       if ss.to_i(16)==10
         if $fhz==""
           js=0
           $fhz=ss
          else
            $fhz=$fhz + "," + ss
            js=js+1
          end
       else  
         if $fhz==""
           $fhz= ss
         else
           $fhz=$fhz + "," + ss
         end           
         js=js+1
       end
       
       fhzs=$fhz.split(',')  
       if fhzs.length==20
         puts "jianting " + $fhz 
        if fhzs[3].to_i(16)==255
          list=$conn.exec("select * from zn_sb_cz_list order by id limit 1;")  
          size=list.count
          if size>0
            kt=$conn.exec("select * from zn_sb where id=#{list[0]['sbid']};") 
            #if kt[0]['sblx']=='0000'  #空调返回值有问题，都是ff
            #  puts "jianting " +"update  zn_sb_cz_list set zt=1 id=#{list[0]['id']};"
            #  zt=  $conn.exec("update  zn_sb_cz_list set zt=1 where id=#{list[0]['id']};") 
            #else
              puts "jianting " +"update  zn_sb_cz_list set zt=2 id=#{list[0]['id']};"
              zt=  $conn.exec("update  zn_sb_cz_list set zt=2 where id=#{list[0]['id']};")
            #end
          end
        else
          list=$conn.exec("select * from zn_sb_cz_list order by id limit 1;")  
          size=list.count
          if size>0
             puts "jianting " +"update  zn_sb_cz_list set fhz='#{$fhz}', zt=1 where id=#{list[0]['id']};"              
             zt=  $conn.exec("update  zn_sb_cz_list set fhz='#{$fhz}', zt=1 where id=#{list[0]['id']};")                 
          end
        end     
        $fhz=""
       end              
     end
   }
tbt=50
j=0
every_n_seconds(1) do     
  list=$conn.exec("select zn_sb_cz_list.*,zn_sb.sblx,zn_sb.ktzt,zn_sb.kgls from zn_sb_cz_list,zn_sb where zn_sb_cz_list.sbid=zn_sb.id order by id;")
  for k in 0..list.count-1
    li = list[k]
    j=j+1
    tbt = (tbt+1) % 128
    tbt = tbt+1 if tbt==10 || tbt==13
    write_sb(li,sp,tbt)    
    for j in 0..10000
     sleep 0.05
     rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
     sj=Time.now.to_i
     zt=$conn.exec("select * from zn_sb_cz_list where id=#{li['id']};") 
     #puts  li['id'].to_s + "dddddd"
     #puts zt[0]['zt']=='1'
     if zt.count==1
      if zt[0]['zt']=='1'
        li['userid']=0 if li['userid']==''
        $conn.exec("update  zn_sb set czzt='成功' where id=#{li['sbid']};")
        sb_cz=$conn.exec("select zn_sb.* ,zn_sb_lx.lxsm,zn_sb_cz.id as czid,zn_sb_cz.czsm from zn_sb,zn_sb_lx,zn_sb_cz where zn_sb.sblx=zn_sb_lx.id and zn_sb_lx.id=zn_sb_cz.lxid and zn_sb.id=#{li['sbid']} and zn_sb_cz.id=#{li['sbczid']};")
        if sb_cz.count>0
          puts sb_cz[0]['lxsm']
          case sb_cz[0]['lxsm']
          when '空调'
            ktzt=zt[0]['fhz'].split(',')
            sbzt=sb_cz[0]['ktzt'].split(',')
            czsm = sb_cz[0]['czsm']
            sbzt[3]=1 if czsm ==  '开'          
            sbzt[3]=0 if czsm ==  '关'              
            sbzt[1]=sbzt[1].to_i+1 if czsm == '加温'
            sbzt[1]=sbzt[1].to_i-1 if czsm == '减温'
            sbzt[2]=sbzt[2].to_i+1 % 3  if czsm == '模式转换'
            ktzt=sbzt.join(',')
            puts "update  zn_sb set kgzt='#{sb_cz[0]['czsm']}',ktzt='#{ktzt}' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set kgzt='#{sb_cz[0]['czsm']}',ktzt='#{ktzt}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
            puts "insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');"
            $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');")
          when '温湿度'
            ktzt=zt[0]['fhz'].split(',')
            wsd=ktzt[11].to_i(16)
            wsd=wsd.to_s + "," + ktzt[9].to_i(16).to_s
            puts "update  zn_sb set kgzt='#{wsd}',ktzt='#{wsd}' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set kgzt='#{wsd}',ktzt='#{wsd}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
            puts "insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');"
            $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');")
          when '烟感'
            ktzt=zt[0]['fhz'].split(',')
            kgzt = (ktzt[7]=='00') ? '关' : '开'
            puts "update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[7]}' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[7].to_i}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
            puts "insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');"
            $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');")
          when '门磁'
            ktzt=zt[0]['fhz'].split(',')
            kgzt = (ktzt[8]=='00') ? '关' : '开'
            zt=  $conn.exec("select * from zn_sb where id=#{li['sbid']};")
            if zt[0]['ktzt'].to_i==ktzt[8].to_i
              puts "没变化"
            else
              if ktzt[8].to_i==1
                puts "门开了"
                mcinsert= $conn.exec("insert into mc_image(device_id,sbh,zt) values(#{li['sbid']},'#{li['sbh']}',0)  RETURNING id;")                
                ss="camera:10,id:" + mcinsert[0]['id'].to_s
                puts ss
                client.send ss, 0
              else
                puts "门关了"
              end 
              puts "insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');"
              $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');")             
            end
            puts "update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[8].to_i}' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[8].to_i}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
          else
            ktzt=zt[0]['fhz'].split(',')
            kgzt = (ktzt[9]=='00') ? '关' : '开'
            puts "update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[9]}' where id=#{li['sbid']};"
            czzt=$conn.exec("select * from  zn_sb_cz  where id=#{li['sbczid']};")
            zt=  $conn.exec("update  zn_sb set kgzt='#{sb_cz[0]['czsm']}',ktzt='#{ktzt[9]}' where id=#{li['sbid']};")
            zt=  $conn.exec("update  zn_sb set ktzt='#{ktzt[9]}' where sbh='#{li['sbh']}';")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
            puts "insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');"
            $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,sfnx,zt,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', #{li['sfnx']},#{ktzt[9].to_i}, '#{sj}');")
          end
          
        end
        $fhz=''        
        break
      else
        if zt[0]['zt']=='2' #说明设备操作出错了
            puts "insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');"
            $conn.exec("insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');")
            puts "update  zn_sb set czzt='失败' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set czzt='失败' where id=#{li['sbid']};")
            puts "delete from zn_sb_cz_list where id=#{li['id']};"
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
            $fhz=''
            break            
        else
         if j==100
           puts "j=" + j.to_s
           puts "insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');"
           $conn.exec("insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');")
           puts "update  zn_sb set czzt='失败' where id=#{li['sbid']};"
           zt=  $conn.exec("update  zn_sb set czzt='失败' where id=#{li['sbid']};")
           puts "delete from zn_sb_cz_list where id=#{li['id']};"
           $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
           $fhz=''
           j=0
           break
         else
           j=j+1
         end
        end
      end      
     end
    end
    
    
  end
end