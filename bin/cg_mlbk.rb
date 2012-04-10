#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

qzh, dalb, mlh = ARGV[0], ARGV[1], ARGV[2] 
dh = "#{qzh}-#{dalb}-#{mlh}"

user = $conn.exec("select dh from timage_tj where zt='多页' and dh like '#{dh}-%' order by ajh")

for k in 0..user.count-1 do 
  data = $conn.exec("select id, dh,  yxmc, yxbh, yxdx from timage where dh = '#{user[k]['dh']}' and yxbh like '0%' order by yxbh desc limit 1;")[0]
  yxbh='JNBK'+'.'+data['yxbh'].split(".")[1]
  yxmc=data['yxmc'][0..-9]+yxbh
  puts "--change timage #{data['yxmc']} to #{yxmc}"
  puts "update timage set yxbh='#{yxbh}' , yxmc='#{yxmc}' where id = #{data['id']};"
  $conn.exec("update timage set yxbh='#{yxbh}' , yxmc='#{yxmc}' where id = #{data['id']}")
end

#