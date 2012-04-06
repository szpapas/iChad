#!/usr/bin/ruby
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

dh = ARGV[0]

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

def update_timage(dh_prefix)
  
  ss = dh_prefix.split('_')
  qzh, dalb, mlh = ss[0], ss[1], ss[2]
  
  puts "update basic info for qz:#{qzh}, mlh:#{mlh}..."
  $conn.exec("update timage_tj set ajys=archive.ys from archive where timage_tj.dh=archive.dh and timage_tj.dh_prefix='#{dh_prefix}';")
  
  $stderr.puts"更新 #{dh_prefix} ..."
  puts "update ML00..."
  $conn.exec"update timage_tj set smyx = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh similar to '[0..9]%') where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update MLBK..." 
  $conn.exec"update timage_tj set mlbk = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'MLBK%') where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update MLJN..."  
  $conn.exec"update timage_tj set mljn = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'ML%') - (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh similar to 'ML[BK|00].*') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JN00..."
  $conn.exec"update timage_tj set jn00 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'JN00%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JNBK..."  
  $conn.exec"update timage_tj set jnbk = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'JNBK%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JNJN..."  
  $conn.exec"update timage_tj set jnjn = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh SIMILAR TO 'JN[0123456789][123456789]%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update SMYX..."  
  $conn.exec"update timage_tj set smyx = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh SIMILAR TO '[0..9]%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update meta A4"
  $conn.exec"update timage_tj set A4 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz<=1) where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update meta A3"
  $conn.exec"update timage_tj set A3 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz=2) where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update meta 大图"
  #$conn.exec"update timage_tj set DT = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz=2) where timage_tj.dh_prefix='#{dh_prefix}';"
  
  $conn.exec"update timage_tj set DT = A4+A3*2 where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update 状态"

  $conn.exec("update timage_tj set zt=''   where dh_prefix='#{dh_prefix}';")
  $conn.exec("update timage_tj set zt='空卷' where  smyx = 0 and dh_prefix='#{dh_prefix}';")
  $conn.exec("update timage_tj set zt='缺页' where  smyx > 0  and smyx < ajys and dh_prefix='#{dh_prefix}';")
  $conn.exec("update timage_tj set zt='多页' where  smyx > 0  and smyx > ajys and dh_prefix='#{dh_prefix}';")
  
  $conn.exec("update timage_tj set jnts = (select count(*) from document  where document.dh=timage_tj.dh) where timage_tj.dh_prefix='#{dh_prefix}';")
  
end 

def update_qzxx(dh_cond)
  $stderr.puts"更新 q_qzxx #{dh_cond}..."
  
  datas = $conn.exec("select sum (ajys) as ajys, sum(ml00) as ml00, sum(mlbk) as mlbk, sum(mljn) as mljn, sum(jn00) as jn00, sum(jnjn) as jnjn, sum(smyx) as smyx, sum(a3) as a3, sum(a4) as a4, sum(dt) as dt, sum(jnts) as jnts, dh_prefix from timage_tj where dh_prefix like '#{dh_cond}' group by dh_prefix order by dh_prefix;")

  for k in 0..datas.count - 1 
    data = datas[k]
    dh_prefix = data['dh_prefix']
    dd = $conn.exec("select id from q_qzxx where dh_prefix='#{data['dh_prefix']}';")
    if dd.count > 0
      $conn.exec("update q_qzxx set ajys=#{data['ajys']}, ml00=#{data['ml00']}, mlbk=#{data['mlbk']}, mljn=#{data['mljn']}, jn00=#{data['jn00']}, jnjn=#{data['jnjn']}, smyx=#{data['smyx']}, a3=#{data['a3']}, a4=#{data['a4']}, dt=#{data['dt']}, jnts=#{data['jnts']} where id=#{dd[0]['id']};")
    else
      dh_prefx = data['dh_prefix']
      ss=/(\d+)_(\d+)_(\d+)/.match(dh_prefix)
      qzh,dalb,mlh = ss[1],ss[2],ss[3]
      $conn.exec("insert into q_qzxx(ajys, ml00, mlbk, mljn, jn00, jnjn, smyx, a3, a4, dt, jnts, qzh, dalb, mlh, dh_prefix) values (#{data['ajys']},#{data['ml00']}, #{data['mlbk']}, #{data['mljn']}, #{data['jn00']}, #{data['jnjn']}, #{data['smyx']}, #{data['a3']}, #{data['a4']}, #{data['dt']}, #{data['jnts']}, #{qzh}, #{dalb}, #{mlh}, '#{dh_prefix}' );")  
    end
    qzjh = $conn.exec("select min(ajh), max(ajh) from archive where dh like '#{dh_prefix}_%';")
    $conn.exec("update q_qzxx set qajh=#{qzjh[0]['min'].to_i}, zajh=#{qzjh[0]['max'].to_i} where dh_prefix='#{dh_prefix}';") 
    
    $conn.exec("update q_qzxx set zt=''   where dh_prefix='#{dh_prefix}';")
    $conn.exec("update q_qzxx set zt='空卷' where  smyx = 0 and dh_prefix='#{dh_prefix}';")
    $conn.exec("update q_qzxx set zt='缺页' where  smyx > 0  and smyx < ajys and dh_prefix='#{dh_prefix}';")
    $conn.exec("update q_qzxx set zt='多页' where  smyx > 0  and smyx > ajys and dh_prefix='#{dh_prefix}';")
     
  end
end

update_timage(dh)
update_qzxx(dh)

$conn