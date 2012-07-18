#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'

require 'pg'
require 'find'

# ********************************************************************************************
#
#   main fucntions 
#
#    @ARGV[0] --- 
#   
#    ruby import_iamge.rb 1 1 0 /share/1/1_1/ 
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = on")

#空卷，完成的情况
#先从q_status里面取出 dh_prefix
user = $conn.exec("select distinct dhp from q_status;")
for k in 0..user.count-1
  qs = user[k]
  puts ("ruby ./dady/bin/update_qzxx_tj.rb #{qs['dhp']}")
  #system("ruby ./dady/bin/update_qzxx_tj.rb #{qs['dhp']}")
end  

#更新q_status aj_zt 信息
puts ("update q_status set aj_zt=timage_tj.zt from timage_tj where q_status.dh=timage_tj.dh;")
#system ("update q_status set aj_zt=timage_tj.zt where q_status.dh=timage_tj.dh;")

#user = $conn.exec("select q_status.dh, q_status.aj_path, q_status.zt, timage_tj.zt from q_status inner join timage_tj on q_status2.dh = timage_tj.dh  where q_status2.zt= '完成' and timage_tj.zt = '空卷';")
user = $conn.exec("select * from q_status where zt= '完成' and aj_zt = '空卷';")
for k in 0..user.count
  qs = user[k]
  
  if File.exists qs[aj_path].gsub.("\\$","\$")
  
  puts "ruby ./dady/bin/import_image.rb #{qs['dhp']} #{qs['aj_path']} #{qs['ajh']}"
  #system "ruby ./dady/bin/import_image.rb #{qs['dhp']} #{qs['aj_path']} #{qs['ajh']}"
  $conn.exec("update q_status set zt='未开始' where dh='#{qs['dh']}'; ")
end


$conn.close
$stderr.puts "==检查完毕=="
