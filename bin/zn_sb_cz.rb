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

def write_sb(li,sp)
  sbczzl=li['sbczzl']
  sbh=li['sbh']
  puts sbh
  puts sbczzl
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
  sy="0a,0d,06," +czzl[0] + ","+ sbh + "," +czzl[1]
  kzzl = sy.split(',') 
  yy=0
  puts sy
  for k in 3..7
    yy=kzzl[k].to_i(16)+yy
  end
  xx=(yy%256).to_s(16)
  sy=sy + "," +xx
  kzzl = sy.split(',') 
  ss="012345678"
  for k in 0..kzzl.length-1
    ss[k]=kzzl[k].to_i(16)
  end
  puts sy  
  sp.write(ss)
end

every_n_seconds(1) do     
  list=$conn.exec("select * from zn_sb_cz_list order by id;")
  for k in 0..list.count-1
    li = list[k]
    write_sb(li,sp)
    
    for j in 0..2
     sleep 2
     rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
     sj=Time.now.strftime("%Y%m%d%H%M%S")
     zt=$conn.exec("select * from zn_sb_cz_list where id=#{li['id']};") 
     puts  li['id'].to_s + "dddddd"
     puts zt[0]['zt']=='1'
     if zt.count==1
      if zt[0]['zt']=='1'
        if li['userid']==''
           li['userid']=0
        end
        puts "insert into zn_cz_rz(czid, userid, sbid, rq) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}');"
        $conn.exec("insert into zn_cz_rz(czid, userid, sbid, rq,sj) values ('#{li['sbczid']}', '#{li['userid']}', #{li['sbid']}, '#{rq}', '#{sj}');")
        $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
        
        break
      else
        if zt[0]['zt']=2  #说明设备操作出错了
          if j==2
            puts "insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');"
            $conn.exec("insert into zn_sb_cz_err(sbczid,  sbid, rq) values ('#{li['sbczid']}', #{li['sbid']}, '#{rq}');")
            $conn.exec("delete from zn_sb_cz_list where id=#{li['id']};")
          else
            write_sb(li,sp)
          end
        end
      end
    end
  end
    
    
  end
end