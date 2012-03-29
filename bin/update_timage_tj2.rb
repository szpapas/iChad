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
  
  dh_prefix="#{qzh}_#{dalb}_#{mlh}"

  puts "update ML00..."
  $conn.exec"update timage_tj set smyx = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh similar to '[0..9]%') where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update MLBK..." 
  $conn.exec"update timage_tj set mlbk = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'MLBK%') where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update MLJN..."  
  $conn.exec"update timage_tj set mljn = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'ML%')-2 where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JN00..."
  $conn.exec"update timage_tj set jn00 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'JN00%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JNBK..."  
  $conn.exec"update timage_tj set jnbk = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'JNBK%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JNJN..."  
  $conn.exec"update timage_tj set jnjn = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh SIMILAR TO 'JN[0123456789][123456789]%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update SMYX..."  
  $conn.exec"update timage_tj set smyx = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh SIMILAR TO similar to '[0..9]%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update meta A4"
  $conn.exec"update timage_tj set A4 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz=0) where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update meta A3"
  $conn.exec"update timage_tj set A3 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz=1) where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update meta 大图"
  $conn.exec"update timage_tj set DT = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz=2) where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update 状态"
  
  $conn.exec("update timage_tj set zt='空卷'  where  smyx = 0 and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  $conn.exec("update timage_tj set zt='缺页' where  smyx > 0  and smyx < ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  $conn.exec("update timage_tj set zt='多页' where  smyx > 0  and smyx > ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  #$conn.exec("update timage_tj set zt='漏页' where  smyx > 0  and smyx > ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  
  $conn.exec("update timage_tj set jnts = (select count(*) from document  where document.dh=timage_tj.dh) where timage_tj.dh_prefix='#{dh_prefix}';")
  
end 

update_timage(qzh, dalb, mlh)
