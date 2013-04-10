#!/usr/bin/ruby
#统计影像文件缺重卷情况
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
require 'pg'
require 'find'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

dwdm= $conn.exec("select * from d_dwdm ;")
pr_path="./dady"
system("rm #{pr_path}/tj_kj.html")
ff = File.open(pr_path + "/tj_kj.html" ,'w+')
ff.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><table cellpadding=8>')
puts "空卷统计情况（不包含整个目录都是空卷）"
ff.write("<tr><td>" + "空卷统计情况（不包含整个目录都是空卷）"  + "</td></tr>" )
for j in 0..dwdm.count-1
  puts dwdm[j]['dwdm']
  puts '目录号;案卷号'
  ff.write("<tr><td>" + dwdm[j]['dwdm']  + "</td></tr>" )
  mlhdata=$conn.exec("select * from  timage_tj where  dh like '#{dwdm[j]['id']}-%' and zt='空卷' and dh_prefix in (select dh_prefix from q_qzxx where zt='归档' or zt='缺页' or zt='多页')    order by mlm,ajh;")
  for ii in 0..mlhdata.count-1
      
              puts mlhdata[ii]['mlm'].to_s + ';'+ mlhdata[ii]['ajh'].to_s 
              ff.write("<tr><td>" + mlhdata[ii]['mlm'].to_s + ';'+ mlhdata[ii]['ajh'].to_s   + "</td></tr>" )
  end
end
ff.write("</table>"  )
ff.close