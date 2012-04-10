#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

t1 = Time.now

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

datas = $conn.exec("select sum (ajys) as ajys, sum(ml00) as ml00, sum(mlbk) as mlbk, sum(mljn) as mljn, sum(jn00) as jn00, sum(jnjn) as jnjn, sum(smyx) as smyx, sum(a3) as a3, sum(a4) as a4, sum(dt) as dt, sum(jnts) as jnts, dh_prefix from timage_tj where dh_prefix like '4_%' group by dh_prefix order by dh_prefix;")

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
end

puts " Completed in #{Time.now-t1} s" 

$conn.close