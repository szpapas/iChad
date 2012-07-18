#!/usr/bin/ruby
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
require 'serialport'
require 'pg'
require 'find'
sp = SerialPort.new "/dev/tty.PL2303-000012FD", 9600

# ********************************************************************************************
#
#   main fucntions 
#   用来在后台运行，读取zn_sb_cz_list数据，并根据此表的记录进行设备操作，操作完后做日志记录zn_cz_rz ，并删除zn_sb_cz_list数据
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
tbt=0
def write_sb(li,sp,tbt)
  sbczzl=li['sbczzl']
  sbh=li['sbh']
#  puts sbh
#  puts sbczzl
#sbh="50,8a,00"
#sbczzl="f2,01"    #如果是空调01如果是开的状态就是关，如果是关的状态就是开，f2 设备加减，04减，02增，08模式转换,
#
#sbh="50,8a,ff"
#sbczzl="f1,ff"
#       
#sbh="50,53,ff"
#sbczzl="f3,ff"    #如如果是读电流值
#
#sbh="50,53,00"
#sbczzl="f2,00"    #如如果是读电流值 
 
  czzl=sbczzl.split(',')
  
  #sy="0a,0d,06," +czzl[0] + ","+ sbh + "," +czzl[1]
  



  sy=tbt.to_s(16)+ "," +czzl[0] + ","+ sbh + "," +czzl[1] + ",00,55,55,55,55,55,55,55,55,55,55,55"
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
     fhz=""
     js=0
     fhz1=""
     while true do
       ss = sprintf("%02X", sp.getc)
       puts ss
       if ss.to_i(16)==10
         js=0
         fhz=ss
       else  
         if fhz==""
           fhz= ss
         else
           fhz=fhz + "," + ss
         end
         fhzs=fhz.split(',')
         if fhzs.length==20
           puts "jianting " + fhz 
           #puts fhzs[5].to_i(16)
          if fhzs[6].to_i(16)==255
            list=$conn.exec("select * from zn_sb_cz_list order by id limit 1;")  
            size=list.count
            if size>0
              kt=$conn.exec("select * from zn_sb where id=#{list[0]['sbid']};") 
              if kt[0]['sblx']=='0000'  #空调返回值有问题，都是ff
                puts "jianting " +"update  zn_sb_cz_list set zt=1 id=#{list[0]['id']};"
                zt=  $conn.exec("update  zn_sb_cz_list set zt=1 where id=#{list[0]['id']};") 
              else
                puts "jianting " +"update  zn_sb_cz_list set zt=1 id=#{list[0]['id']};"
                zt=  $conn.exec("update  zn_sb_cz_list set zt=1 where id=#{list[0]['id']};")
              end
            end
          else
            list=$conn.exec("select * from zn_sb_cz_list order by id limit 1;")  
            size=list.count
            if size>0
              
               puts "jianting " +"update  zn_sb_cz_list set zt=1 id=#{list[0]['id']};"               
               zt=  $conn.exec("update  zn_sb_cz_list set fhz='#{fhz}', zt=1 where id=#{list[0]['id']};")                 
            end
          end     
         end
         js=js+1
       end
     end
   }
tbt=50
every_n_seconds(1) do     
  list=$conn.exec("select * from zn_sb_cz_list order by id;")
  for k in 0..list.count-1
    li = list[k]
    
    tbt=tbt+1
    write_sb(li,sp,tbt)
    
    for j in 0..10000
     sleep 0.05
     rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
     sj=Time.now.strftime("%Y%m%d%H%M%S")
     zt=$conn.exec("select * from zn_sb_cz_list where id=#{li['id']};") 
     #puts  li['id'].to_s + "dddddd"
     #puts zt[0]['zt']=='1'
     if zt.count==1
      if zt[0]['zt']=='1'
        if li['userid']==''
           li['userid']=0
        end
        puts "insert into zn_cz_rz(czid, userid, sbid, rq) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}');"
        $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', '#{sj}');")
        $conn.exec("update  zn_sb set czzt='成功' where id=#{li['sbid']};")
        sb_cz=$conn.exec("select zn_sb.* ,zn_sb_lx.lxsm,zn_sb_cz.id as czid,zn_sb_cz.czsm from zn_sb,zn_sb_lx,zn_sb_cz where zn_sb.sblx=zn_sb_lx.id and zn_sb_lx.id=zn_sb_cz.lxid and zn_sb.id=#{li['sbid']} and zn_sb_cz.id=#{li['sbczid']};")
        if sb_cz.count>0
          puts sb_cz[0]['lxsm']
          case sb_cz[0]['lxsm']
          when '空调'
            sbzt=sb_cz[0]['ktzt'].split(',')
            case sb_cz[0]['czsm']
            when '开'
              sbzt[3]=1              
            when '关'
              sbzt[3]=0              
            when '加温'
              sbzt[1]=sbzt[1].to_i+1              
            when '减温'
              sbzt[1]=sbzt[1].to_i-1
            when '模式转换'
              sbzt[2]=sbzt[2].to_i+1
              if sbzt[2]>2
                sbzt[2]=0
              end
            when '读取电流'
              
            else
            end
            ktzt=sbzt.join(',')
            puts "update  zn_sb set kgzt='#{sb_cz[0]['czsm']}',ktzt='#{ktzt}' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set kgzt='#{sb_cz[0]['czsm']}',ktzt='#{ktzt}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
          when '温湿度'
            ktzt=zt[0]['fhz'].split(',')
            wsd=ktzt[11].to_i(16)
            wsd=wsd.to_s + "," + ktzt[9].to_i(16).to_s
            puts "update  zn_sb set kgzt='#{wsd}',ktzt='#{wsd}' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set kgzt='#{wsd}',ktzt='#{wsd}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
          when '烟感'
            ktzt=zt[0]['fhz'].split(',')
            if ktzt[7]=='00'
              kgzt='关'
            else
              kgzt='开'
            end
            puts "update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[7]}' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[7].to_i}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
          when '门磁'
            ktzt=zt[0]['fhz'].split(',')
            if ktzt[8]=='00'
              kgzt='关'
            else
              kgzt='开'
            end
            puts "update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[8]}' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set kgzt='#{kgzt}',ktzt='#{ktzt[8].to_i}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
          else
            czzt=$conn.exec("select * from  zn_sb_cz  where id=#{li['sbczid']};")
            zt=  $conn.exec("update  zn_sb set kgzt='#{czzt[0]['czsm']}' where id=#{li['sbid']};")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
          end
        end
        
        
        break
      else
        #puts zt[0]['zt']
        #puts zt[0]['zt']=='2'
        if zt[0]['zt']=='2' #说明设备操作出错了
          #if j==2
            puts "insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');"
            $conn.exec("insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');")
            puts "update  zn_sb set czzt='失败' where id=#{li['sbid']};"
            zt=  $conn.exec("update  zn_sb set czzt='失败' where id=#{li['sbid']};")
            puts "delete from zn_sb_cz_list where id=#{li['id']};"
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
            break
            
          #else
            #write_sb(li,sp)
          #end
        else
         #if j==10
         #  puts "insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');"
         #  $conn.exec("insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');")
         #  puts "update  zn_sb set czzt='失败' where id=#{li['sbid']};"
         #  zt=  $conn.exec("update  zn_sb set czzt='失败' where id=#{li['sbid']};")
         #  puts "delete from zn_sb_cz_list where id=#{li['id']};"
         #  $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
         #  break
         #end
        end
      end
      
    end
  end
    
    
  end
end