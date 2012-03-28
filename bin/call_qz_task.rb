$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

user = $conn.exec("select * from q_status where zt='未开始' order by id;")
$count = user.count

while $count > 0 do 
  data = user[0]
  dh_prefix, mlh, cmd, fjcs = data['dhp'], data['mlh'],data['cmd'], data['fjcs']
  
  $conn.exec("update q_status set zt='开始执行' where id=#{data['id']};")
  puts "#{cmd}"
  system(cmd)
  
  user = $conn.exec("select * from q_status where dyzt='未开始' order by id;")
  $count = user.count
  
end  

$conn.close