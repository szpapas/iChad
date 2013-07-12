#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/' 
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
#require 'serialport'
require 'pg'
require 'find'



$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
  list=$conn.exec("select * from d_dwdm  order by id;") 
  pr_path="./dady"
  system("rm #{pr_path}/qztj.html")
  ff = File.open(pr_path + "/qztj.html" ,'w+')
  ff.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><table cellpadding=8>')
  #list=$conn.exec("select * from d_dwdm  order by id;") 
  #distinct
  for j in 0..list.count-1
    puts list[j]['dwdm']
    ff.write("<tr><td>" + list[j]['dwdm'] +"</td></tr>"  )
    puts "档案类别;目录号;起案卷号;止案卷号;实际卷数;卷内条数;A4;A3;大图(未折算);折合成A4;输档页数;是否虚拟打印;卷标数;盒标数"
    ff.write("<tr><td>档案类别;目录号;起案卷号;止案卷号;实际卷数;卷内条数;A4;A3;大图(未折算);折合成A4;输档页数;是否虚拟打印;卷标数;盒标数</td></tr>")
    mlhcf=$conn.exec("select distinct cast(dalb as integer),mlh from archive where qzh='#{list[j]['id']}'  order by mlh;") 
    #mlhcf=$conn.exec("select * from q_qzxx where qzh='#{list[j]['id']}' order by mlm;") 
    for x in 0..mlhcf.count-1
      if !mlhcf[x]['mlh'].nil?
        #puts mlhcf[x]['mlh'].to_s 
        qajh_data=$conn.exec("select archive.*,d_dalb.lbmc from archive,d_dalb where cast(archive.dalb as integer)=d_dalb.id and qzh='#{list[j]['id']}' and mlh='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}' order by ajh;")      
        sdys=$conn.exec("select sum(ys) from archive where qzh='#{list[j]['id']}' and mlh='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}' ;")   
        jn_data=$conn.exec("select count(*) from document where ownerid in (select id from archive where qzh='#{list[j]['id']}' and mlh='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}');")
        images=$conn.exec("select count(*) from timage where dh in (select dh from archive where qzh='#{list[j]['id']}' and dalb='#{mlhcf[x]['dalb']}' and mlh='#{mlhcf[x]['mlh']}')")
        a34=$conn.exec("select * from q_qzxx where qzh='#{list[j]['id']}' and dalb='#{mlhcf[x]['dalb']}' and mlm='#{mlhcf[x]['mlh']}';") 
        ml00=$conn.exec("select count(*) from timage where yxbh  like 'ML%' and dh in (select dh from archive where qzh='#{list[j]['id']}' and dalb='#{mlhcf[x]['dalb']}' and mlh='#{mlhcf[x]['mlh']}');") 
        jbc=$conn.exec("select count(*) from archive where qzh='#{list[j]['id']}' and mlh='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}' and rfidstr<>'';")  
        #puts "select count(*) from archive where qzh='#{list[j]['id']}' and mlh='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}' and rfidstr<>'';"
        hbc=$conn.exec("select distinct boxrfid  from archive where boxrfid<>'' and  qzh='#{list[j]['id']}' and mlh='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}' and boxrfid<>'';")
        #puts mlhcf[x]['mlm'].to_s + ";" + mlhcf[x]['qajh'].to_s + ";" + mlhcf[x]['zajh'].to_s + ";" + mlhcf[x]['jnts'].to_s + ";" + mlhcf[x]['a4'].to_s+ ";" + mlhcf[x]['a3'].to_s+ ";" + mlhcf[x]['dt'].to_s
       # puts mlhcf[x]['mlh'].to_s
       # puts qajh_data[0]['ajh'].to_s
       # puts qajh_data[qajh_data.count-1]['ajh'].to_s
       # puts qajh_data.count.to_s
       # puts jn_data[0]['count'].to_s
       # puts a34[0]['a4'].to_s 
       # puts images.count.to_s
     
        if ml00[0]['count'].to_i>0
          sfdy='已'
        else
          sfdy='未打印'
        end
        if jbc[0]['count'].to_i>0
          jbcs=jbc[0]['count'].to_s
        else
          jbcs='0'
        end
        if hbc.count>0
          hbcs=hbc.count.to_s
        else
          hbcs='0'
        end
        if a34.count>0  
          zha4=a34[0]['a4'].to_i + a34[0]['a3'].to_i*2
          #puts qajh_data[0]['lbmc'].to_s + ";" + mlhcf[x]['mlh'].to_s + ";" + qajh_data[0]['ajh'].to_s +  ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + qajh_data.count.to_s + ";" + jn_data[0]['count'].to_s + ";" + a34[0]['a4'].to_s + ";" + a34[0]['a3'].to_s + ";" + a34[0]['dt'].to_s + ";" + images[0]['count'].to_s + ";" + sdys[0]['sum'].to_s + ";" + sfdy + ";" + jbcs + ";" + hbcs   
          #ff.write(qajh_data[0]['lbmc'].to_s + ";" + mlhcf[x]['mlh'].to_s + ";" + qajh_data[0]['ajh'].to_s +  ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + qajh_data.count.to_s + ";" + jn_data[0]['count'].to_s + ";" + a34[0]['a4'].to_s + ";" + a34[0]['a3'].to_s + ";" + a34[0]['dt'].to_s + ";" + images[0]['count'].to_s + ";" + sdys[0]['sum'].to_s + ";" + sfdy + ";" + jbcs + ";" + hbcs  + "\n" )
          puts qajh_data[0]['lbmc'].to_s + ";" + mlhcf[x]['mlh'].to_s + ";" + qajh_data[0]['ajh'].to_s +  ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + qajh_data.count.to_s + ";" + jn_data[0]['count'].to_s + ";" + a34[0]['a4'].to_s + ";" + a34[0]['a3'].to_s + ";" + a34[0]['dt'].to_s + ";" + zha4.to_s + ";" + sdys[0]['sum'].to_s + ";" + sfdy + ";" + jbcs + ";" + hbcs   
          ff.write("<tr><td>" + qajh_data[0]['lbmc'].to_s + ";" + mlhcf[x]['mlh'].to_s + ";" + qajh_data[0]['ajh'].to_s +  ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + qajh_data.count.to_s + ";" + jn_data[0]['count'].to_s + ";" + a34[0]['a4'].to_s + ";" + a34[0]['a3'].to_s + ";" + a34[0]['dt'].to_s + ";" + zha4.to_s + ";" + sdys[0]['sum'].to_s + ";" + sfdy + ";" + jbcs + ";" + hbcs  + "</td></tr>" )
        
        else
          puts qajh_data[0]['lbmc'].to_s + ";" + mlhcf[x]['mlh'].to_s + ";" + qajh_data[0]['ajh'].to_s +  ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + qajh_data.count.to_s + ";" + jn_data[0]['count'].to_s + ";0;0;0;" + images[0]['count'].to_s + ";" + sdys[0]['sum'].to_s + ";未打印" + ";" + jbcs + ";" + hbcs
          ff.write("<tr><td>" + qajh_data[0]['lbmc'].to_s + ";" + mlhcf[x]['mlh'].to_s + ";" + qajh_data[0]['ajh'].to_s +  ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + qajh_data.count.to_s + ";" + jn_data[0]['count'].to_s + ";0;0;0;" + images[0]['count'].to_s + ";" + sdys[0]['sum'].to_s + ";未打印" + ";" + jbcs + ";" + hbcs + "</td></tr>" )
        end
      end
    end   
  end
  ff.write("</table>"  )
  
  ff.close