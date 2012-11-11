#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

user = $conn.exec("select id, dydh, cast (mlh  as integer) , dqjh , qajh , zajh, dyzt, dylb  from p_status where dyzt='未打印' order by mlh;")


$count = user.count

while $count > 0 do 
  
  data = user[0]
  dydh, mlh, qajh, zajh, db = data['dydh'], data['mlh'],data['qajh'], data['zajh'], data['dylb'] 
  dylb = db[0..0].to_i*8+db[1..1].to_i*4+db[2..2].to_i*2+db[3..3].to_i*1
  
  qzh, dalb = dydh.split('-')[0], dydh.split('-')[1]
  
  puts "ruby ./dady/bin/print_wizard.rb #{qzh} #{mlh} #{dalb} #{qajh} #{zajh} #{dylb} 1 "
  system("ruby ./dady/bin/print_wizard.rb #{qzh} #{mlh} #{dalb} #{qajh} #{zajh} #{dylb} 1 ")
  
  user = $conn.exec("select id, dydh, cast (mlh  as integer) , dqjh , qajh , zajh, dyzt, dylb  from p_status where dyzt='未打印' order by mlh;")
  $count = user.count

end  

$conn.close

