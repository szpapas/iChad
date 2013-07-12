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
system("rm #{pr_path}/tj_qcj.html")
ff = File.open(pr_path + "/tj_qcj.html" ,'w+')
ff.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><table cellpadding=8>')
for j in 0..dwdm.count-1
  puts dwdm[j]['dwdm']
  ff.write("<tr><td>" + dwdm[j]['dwdm']  + "</td></tr>" )
  mlhdata=$conn.exec("select distinct mlh,dalb from  archive where  qzh ='#{dwdm[j]['id']}' and dalb<>'24'   order by dalb,mlh;")
  for ii in 0..mlhdata.count-1
    xh=1
    if !mlhdata[ii]['mlh'].nil?
      #puts mlhdata[ii]['mlh']
      #puts "select * from  archive where  qzh ='#{dwdm[j]['id']}' and dalb='#{mlhdata[ii]['dalb']}' and mlh='#{mlhdata[ii]['mlh']}'  order by mlh,ajh;"
      user = $conn.exec("select * from  archive where  qzh ='#{dwdm[j]['id']}' and mlh='#{mlhdata[ii]['mlh']}' and dalb='#{mlhdata[ii]['dalb']}'  order by mlh,ajh;")
      size = user.count
      if size>0 then
        intajh=1
        for k in 0..size-1
          strajh=user[k]['ajh']
          if intajh.to_i<strajh.to_i then
            while intajh.to_i!=user[k]['ajh'].to_i do
              #txt=txt + '{"xh":"' + xh.to_s + '","mlh":"' + params['query'].to_s + '","ajh":"' + intajh.to_s + '","sm":"缺卷"},' 
              puts '目录号：'+ mlhdata[ii]['mlh'].to_s + ',案卷号：'+ intajh.to_s + '缺卷'
              ff.write("<tr><td>" + '目录号：'+ mlhdata[ii]['mlh'].to_s + ',案卷号：'+ intajh.to_s + '缺卷'  + "</td></tr>" )
              xh=xh+1
              intajh=intajh.to_i+1
            end
            intajh=intajh.to_i+1
          else 
            if intajh.to_i>user[k]['ajh'].to_i then
              puts '目录号：'+ mlhdata[ii]['mlh'].to_s + ',案卷号：'+ user[k]['ajh'].to_i.to_s + '缺卷'
              ff.write("<tr><td>" + '目录号：'+ mlhdata[ii]['mlh'].to_s + ',案卷号：'+ user[k]['ajh'].to_i.to_s + '缺卷'  + "</td></tr>" )
              #txt=txt + '{"xh":"' + xh.to_s + '","mlh":"' + params['query'].to_s + '","ajh":"' + user[k]['ajh'].to_i.to_s + '","sm":"重卷"},' 
              xh=xh+1
              #intajh=intajh.to_i+1
            else
              intajh=intajh.to_i+1
            end
          end
        end
      end
    end
  end
end
ff.write("</table>"  )
ff.close