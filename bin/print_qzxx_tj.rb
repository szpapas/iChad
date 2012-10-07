#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')


def update_qzxx(dh_cond)
  $stderr.puts"更新 q_qzxx #{dh_cond}..."
  
  datas = $conn.exec("select sum (ajys) as ajys, sum(ml00) as ml00, sum(mlbk) as mlbk, sum(mljn) as mljn, sum(jn00) as jn00, sum(jnjn) as jnjn, sum(smyx) as smyx, sum(a3) as a3, sum(a4) as a4, sum(dt) as dt, sum(jnts) as jnts, sum(jnbk) as jnbk, dh_prefix from timage_tj where dh_prefix like '#{dh_cond}' group by dh_prefix order by dh_prefix;")

  for k in 0..datas.count - 1 
    data = datas[k]
    dh_prefix = data['dh_prefix']
    dd = $conn.exec("select id from q_qzxx where dh_prefix='#{data['dh_prefix']}';")
    if dd.count > 0
      $conn.exec("update q_qzxx set ajys=#{data['ajys']}, ml00=#{data['ml00']}, mlbk=#{data['mlbk']}, mljn=#{data['mljn']}, jn00=#{data['jn00']}, jnjn=#{data['jnjn']}, jnbk=#{data['jnbk']}, smyx=#{data['smyx']}, a3=#{data['a3']}, a4=#{data['a4']}, dt=#{data['dt']}, jnts=#{data['jnts']} where id=#{dd[0]['id']};")
    else
      dh_prefx = data['dh_prefix']
      ss=/(\d+)-(\d+)-(\d+)/.match(dh_prefix)
      qzh,dalb,mlh = ss[1],ss[2],ss[3]
      puts "insert into q_qzxx(ajys, ml00, mlbk, mljn, jn00, jnjn, jnbk, smyx, a3, a4, dt, jnts, qzh, dalb, mlh, dh_prefix) values (#{data['ajys']},#{data['ml00']}, #{data['mlbk']}, #{data['mljn']}, #{data['jn00']}, #{data['jnjn']}, #{data['jnbk']}, #{data['smyx']}, #{data['a3']}, #{data['a4']}, #{data['dt']}, #{data['jnts']}, #{qzh}, #{dalb}, #{mlh}, '#{dh_prefix}' );"
      $conn.exec("insert into q_qzxx(ajys, ml00, mlbk, mljn, jn00, jnjn, jnbk, smyx, a3, a4, dt, jnts, qzh, dalb, mlh, dh_prefix) values (#{data['ajys']},#{data['ml00']}, #{data['mlbk']}, #{data['mljn']}, #{data['jn00']}, #{data['jnjn']}, #{data['jnbk']}, #{data['smyx']}, #{data['a3']}, #{data['a4']}, #{data['dt']}, #{data['jnts']}, #{qzh}, #{dalb}, #{mlh}, '#{dh_prefix}' );")  
    end
    qzjh = $conn.exec("select min(ajh), max(ajh) from archive where dh like '#{dh_prefix}_%';")
    $conn.exec("update q_qzxx set qajh=#{qzjh[0]['min'].to_i}, zajh=#{qzjh[0]['max'].to_i} where dh_prefix='#{dh_prefix}';") 
    
    $conn.exec("update q_qzxx set zt=''   where dh_prefix='#{dh_prefix}';")
    $conn.exec("update q_qzxx set zt='空卷' where  smyx = 0 and dh_prefix='#{dh_prefix}';")
    $conn.exec("update q_qzxx set zt='缺页' where  smyx > 0  and smyx < ajys and dh_prefix='#{dh_prefix}';")
    $conn.exec("update q_qzxx set zt='多页' where  smyx > 0  and smyx > ajys and dh_prefix='#{dh_prefix}';")
    $conn.exec("update q_qzxx set zt='归档' where  smyx > 0  and smyx = ajys and dh_prefix='#{dh_prefix}';")
    

  end
end

def print_qzxx(dh_prefix)
  $stderr.puts" output 目录统计 #{dh_prefix}..."
  
  pr_path="/share/tjsj"
  if !File.exists?(pr_path)
    system("mkdir -p #{pr_path}")
  end
  
  dh = dh_prefix
  ss = dh.split('-')
  qzh, dalb, mlh = ss[0], ss[1], ss[2]
  
  user = $conn.exec("select dh, mlh, mlm from archive where dh like '#{dh}-%' limit 1; ")
  mlh = user[0]['mlh']
  puts mlh  
  
  dd = $conn.exec("select * from q_qzxx where dh_prefix='#{dh_prefix}';")[0]
  
  dtbl = dd['dtbl'].to_f
  ajs = dd['zajh'].to_i - dd['qajh'].to_i + 1

  #ml = dd['ml00'].to_i + dd['mlbk'].to_i + dd['mljn'].to_i + dd['jn00'].to_i + dd['jnbk'].to_i + dd['jnjn'].to_i
  
  a3, a4, dt =  dd['a3'].to_i, dd['a4'].to_i, dd['dt'].to_i
  zys = (a3 * 2 + a4 + dt * dtbl).to_s.to_i 
  
  
  convert_str =  "convert ./dady/timage_t2.png -font ./dady/STZHONGS.ttf  -pointsize 24 -draw \"text 600, 620 '#{mlh}' \" -draw \"text 290, 685 '#{dd['qajh']} ~ #{dd['zajh']}' \"  -draw \"text 500, 685 '#{ajs}' \"  -draw \"text 880, 685 '#{dd['zt']}' \"  -draw \"text 500, 750 '#{a3+a4+dt}' \"  -draw \"text 830, 750 '#{a3}' \" -draw \"text 250, 810 '#{a4}' \"  -draw \"text 485, 810 '#{dt}' \"  -draw \"text 845, 810 '#{zys}' \"  /share/tjsj/tj_#{dh_prefix}_01.jpg  "
  system convert_str
  
  #convert_str =  "convert ./dady/timage_t3.png -font ./dady/STZHONGS.ttf  -pointsize 24 -draw \"text 610, 560 '#{mlh}' \" -draw \"text 290, 620 '#{dd['qajh']} ~ #{dd['zajh']}' \"  -draw \"text 590, 620 '#{ajs}' \" /share/tjsj/tj_#{dh_prefix}_02.jpg  "
  #system convert_str
    
end  

dh = ARGV[0]
update_qzxx(dh)
print_qzxx(dh)


$conn.close
#puts "***** End At #{Time.now}====\n"