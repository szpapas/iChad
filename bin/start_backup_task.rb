#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

while true do 
  user = $conn.exec("select * from b_status where zt='准备备份' or zt='准备恢复' order by id limit 1;")
  if user.count > 0
    data = user[0]
    $conn.exec("BEGIN;")
    uu = $conn.exec("SELECT * FROM b_status WHERE id = #{data['id']} FOR UPDATE;")
    if uu[0]['zt'] == '准备备份' ||  uu[0]['zt'] == '准备恢复'
      $conn.exec("update b_status set zt='开始执行' where id=#{data['id']};")
      $conn.exec("COMMIT;")  
      cmd = uu[0]['cmd']
      puts "#{cmd}"
      system(cmd[4..-1])
      $conn.exec("update q_status set zt='执行完成' where id=#{data['id']};")
    else
      $conn.exec("COMMIT;")  
    end
  else
    sleep(60)
  end
  tag = File.open('/tmp/start_or_stop.tagfile').read
  if tag == 'stop'
    break
  end
end  

$conn.close