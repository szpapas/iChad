#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

while true do 
  user = $conn.exec("select * from q_status where zt='未开始' order by id limit 1;")
  if user.count > 0
    data = user[0]
    dh_prefix, mlh, cmd, fjcs = data['dhp'], data['mlh'],data['cmd'], data['fjcs']
    $conn.exec("BEGIN;")
    uu = $conn.exec("SELECT * FROM q_status WHERE id = #{data['id']} FOR UPDATE;")
    if uu[0]['zt'] == '未开始'
      $conn.exec("update q_status set zt='开始执行' where id=#{data['id']};")
      $conn.exec("COMMIT;")  
      puts "#{cmd}"
      system(cmd)
      $conn.exec("update q_status set zt='完成' where id=#{data['id']};")
    else
      $conn.exec("COMMIT;")  
    end
  else 
    sleep(1)
  end
end  

$conn.close