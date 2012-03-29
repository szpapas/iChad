$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

# ********************************************************************************************
#
#   main fucntions 
#
#    @ARGV[0] --- 
#   
#    ruby update_timage_tj.rb qzh mlh
#
#*********************************************************************************************

qzh, dalb, mlh = ARGV[0], ARGV[1], ARGV[2]

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

def update_timage(qzh, dalb, mlh)
  $conn.exec("delete from timage_tj where dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  archives = $conn.exec("select distinct dh,ajh, ys from archive where dh like '#{qzh}_#{dalb}_#{mlh}_%' order by ajh;")
  
  puts "prepare basic info for qz:#{qzh}, mlh:#{mlh}..."
  for k in 0..archives.count-1
    ar = archives[k]
    $conn.exec("insert into timage_tj(dh, ajh, ajys) values ('#{ar['dh']}','#{ar['ajh']}', #{ar['ys']});")
  end
  
  puts "update ML00..."
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh like 'ML00%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set ml00=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end   
  
  puts "update MLBK..."  
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh like 'MLBK%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set mlbk=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end   
  
  puts "update MLJN..."  
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh SIMILAR TO 'ML[0123456789][123456789]%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set mljn=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update JN00..."
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh like 'JN00%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set jn00=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end   
  
  puts "update JNBK..."  
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh like 'JNBK%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set jnbk=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end   
  
  puts "update JNJN..."  
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh SIMILAR TO 'JN[0123456789][123456789]%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set jnjn=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update SMYX..."  
  puts "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh SIMILAR TO '[0..9]%' group by dh;"
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}%' and  yxbh SIMILAR TO '[0..9]%' group by dh;"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set smyx=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  #"update timage_tj set smyx = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh similar to '[0..9]%') where timage_tj.dh like '4_0_1_%';"

  puts "update meta A4"
  
  puts "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  meta_tz = 0 group by dh;"
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}%' and  meta_tz = 0  group by dh;"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set A4=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update meta A3"
  puts "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  meta_tz = 1 group by dh;"
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}%' and  meta_tz = 1  group by dh;"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set A3=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update meta 大图"
  puts "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  meta_tz = 2 group by dh;"
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}%' and  meta_tz = 2  group by dh;"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set DT=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update 状态"
  
  $conn.exec("update timage_tj set zt='空卷'  where  smyx = 0 and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  $conn.exec("update timage_tj set zt='缺页' where  smyx > 0  and smyx < ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  $conn.exec("update timage_tj set zt='多页' where  smyx > 0  and smyx > ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  #$conn.exec("update timage_tj set zt='漏页' where  smyx > 0  and smyx > ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  
  $conn.exec("update timage_tj set jnts = (select count(*) from document  where document.dh=timage_tj.dh) where timage_tj.dh like '#{qzh}_#{dalb}_#{mlh}_%' ;")
  
end 

update_timage(qzh, dalb, mlh)
