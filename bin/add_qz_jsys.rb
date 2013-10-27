#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/' 
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
#require 'serialport'
require 'pg'
require 'find'



$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
  list=$conn.exec("select distinct szdw from add_mlh;") 
  pr_path="./dady"
  system("rm #{pr_path}/add_qztj.xls")
  ff = File.open(pr_path + "/add_qztj.xls" ,'w+')
  ff.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><table cellpadding=8>')
  for j in 0..list.count-1
    list1=$conn.exec("select * from d_dwdm where id=#{list[j]['szdw']};") 
    puts list1[0]['dwdm']
    ff.write('<tr><th style="text-align: center" colspan="15"><font size = 5>' + list1[0]['dwdm'] + '</font></th></tr>'  )
    puts "档案类别;目录号;起案卷号;止案卷号;实际卷数;卷内条数;A4;A3;大图(未折算);折合成A4;输档页数;是否虚拟打印;卷标数;盒标数;错误描述"
    ff.write("<tr><font size = 5><td>档案类别</td><td>目录号</td><td>起案卷号</td><td>止案卷号</td><td>实际卷数</td><td>卷内条数</td><td>A4</td><td>A3</td><td>大图(未折算)</td><td>折合成A4</td><td>输档页数</td><td>是否虚拟打印</td><td>卷标数</td><td>盒标数</td><td>错误描述</td></font></tr>")
    mlhcf=$conn.exec("select * from add_mlh where szdw='#{list[j]['szdw']}'  order by mlh;") 
    #mlhcf=$conn.exec("select * from q_qzxx where qzh='#{list[j]['id']}' order by mlm;") 
    for x in 0..mlhcf.count-1
      if !mlhcf[x]['mlh'].nil?
        #puts mlhcf[x]['mlh'].to_s 
        if mlhcf[x]['qajh'].length>3
          qajh=mlhcf[x]['qajh']
        else
          qajh=sprintf("%04d", mlhcf[x]['qajh'])
        end
        if mlhcf[x]['zajh'].length>3
          zajh=mlhcf[x]['zajh']
        else
          zajh=sprintf("%04d", mlhcf[x]['zajh'])
        end
        puts "select archive.*,d_dalb.lbmc from archive,d_dalb where cast(archive.dalb as integer)=d_dalb.id and qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}' order by ajh;"
        qajh_data=$conn.exec("select archive.*,d_dalb.lbmc from archive,d_dalb where cast(archive.dalb as integer)=d_dalb.id and qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}' order by ajh;")      
        sdys=$conn.exec("select sum(ys) from archive where qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}' ;")   
        jn_data=$conn.exec("select count(*) from document where ownerid in (select id from archive where qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}');")
        images=$conn.exec("select count(*) from timage where dh in (select dh from archive where qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}')")
        a34=$conn.exec("select sum(ajys) as ajys,sum(a3) as a3,sum(a4) as a4,sum(dt) as dt,sum(smyx) as smyx from timage_tj where  dh in (select dh from archive where qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}');") 
        puts  "select sum(ajys) as ajys,sum(a3) as a3,sum(a4) as a4,sum(dt) as dt,sum(smyx) as smyx from timage_tj where  dh in (select dh from archive where qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}');"
        ml00=$conn.exec("select count(*) from timage where yxbh  like 'ML%' and dh in (select dh from archive where qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}');") 
        jbc=$conn.exec("select count(*) from archive where qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}' and rfidstr<>'';")  
        #puts "select count(*) from archive where qzh='#{list[j]['id']}' and mlh='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}' and rfidstr<>'';"
        hbc=$conn.exec("select distinct boxrfid  from archive where boxrfid<>'' and  qzh='#{mlhcf[x]['szdw']}' and mlh='#{mlhcf[x]['mlh']}' and ajh>='#{qajh}' and ajh<='#{zajh}' and boxrfid<>'';")
        
     
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
        if qajh_data.count>0
          lbmc=qajh_data[0]['lbmc'].to_s
        else
          lbmc='档案类别有问题'
        end
        strstyle=''
        strErr=''
        if qajh_data.count>0
          if qajh_data.count.to_i!=qajh_data[qajh_data.count-1]['ajh'].to_i
            strstyle='style="background-color:red"'
            strErr="有缺重卷。"
          else
            strstyle=''
            strErr=''
          end
          if sdys[0]['sum'].to_i==0
            strstyle='style="background-color:red"'
            strErr=strErr + ",输档案页数为0。"
          end
          if a34.count>0
            if a34[0]['ajys'].to_s!=a34[0]['smyx'].to_s
              if strstyle==''
                strstyle='style="background-color:red"'
              end
              strErr=strErr + "，扫描文件与实际输档页数不符。"
            end
            zha4=a34[0]['a4'].to_i + a34[0]['a3'].to_i*2          
            puts lbmc + ";" + mlhcf[x]['mlh'].to_s + ";" + qajh_data[0]['ajh'].to_s +  ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + qajh_data.count.to_s + ";" + jn_data[0]['count'].to_s + ";" + a34[0]['a4'].to_s + ";" + a34[0]['a3'].to_s + ";" + a34[0]['dt'].to_s + ";" + zha4.to_s + ";" + sdys[0]['sum'].to_s + ";" + sfdy + ";" + jbcs + ";" + hbcs  + ";" + strErr  
            ff.write("<tr #{strstyle}><td>" + lbmc + "</td><td>" + mlhcf[x]['mlh'].to_s + "</td><td>" + qajh_data[0]['ajh'].to_s +  "</td><td>" + qajh_data[qajh_data.count-1]['ajh'].to_s + "</td><td>" + qajh_data.count.to_s + "</td><td>" + jn_data[0]['count'].to_s + "</td><td>" + a34[0]['a4'].to_s + "</td><td>" + a34[0]['a3'].to_s + "</td><td>" + a34[0]['dt'].to_s + "</td><td>" + zha4.to_s + "</td><td>" + sdys[0]['sum'].to_s + "</td><td>" + sfdy + "</td><td>" + jbcs + "</td><td>" + hbcs  + "</td><td>" + strErr  + "</td></tr>" )       
          else 
            strstyle='style="background-color:blue"'              
            strErr=strErr + "，在档案统计中无此目录号的记录，请重新统计后再生成全宗表。"
            puts lbmc + ";" + mlhcf[x]['mlh'].to_s + ";" + qajh_data[0]['ajh'].to_s +  ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + qajh_data.count.to_s + ";" + jn_data[0]['count'].to_s + ";0;0;0;" + images[0]['count'].to_s + ";" + sdys[0]['sum'].to_s + ";未打印" + ";" + jbcs + ";" + hbcs + ";" + strErr 
            ff.write("<tr #{strstyle}><td>" +lbmc + "</td><td>" + mlhcf[x]['mlh'].to_s + "</td><td>" + qajh_data[0]['ajh'].to_s +  "</td><td>" + qajh_data[qajh_data.count-1]['ajh'].to_s + "</td><td>" + qajh_data.count.to_s + "</td><td>" + jn_data[0]['count'].to_s + "</td><td>0</td><td>0</td><td>0</td><td>" + images[0]['count'].to_s + "</td><td>" + sdys[0]['sum'].to_s + "</td><td>未打印" + "</td><td>" + jbcs + "</td><td>" + hbcs  + "</td><td>" + strErr  +  "</td></tr>" )
          end
        end
      end
    end   
  end
  ff.write("</table>"  )
  
  ff.close