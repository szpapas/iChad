#统计数据备份情况
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'find'



$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
  list=$conn.exec("select * from d_dwdm  order by id;") 
  pr_path="./dady"
  system("rm #{pr_path}/tj_back.html")
  ff = File.open(pr_path + "/tj_back.html" ,'w+')
  ff.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><table cellpadding=8>')
  for j in 0..list.count-1
    puts list[j]['dwdm']
    ff.write("<tr><td>" + list[j]['dwdm']  + "</td></tr>" )
    puts "档案类别;目录号;是否有备份;备份文件大小"
    ff.write("<tr><td>档案类别;目录号;是否有备份;备份文件大小"  + "</td></tr>" )
    mlhcf=$conn.exec("select distinct cast(dalb as integer),mlh from archive where qzh='#{list[j]['id']}'  order by mlh;") 
    #mlhcf=$conn.exec("select * from q_qzxx where qzh='#{list[j]['id']}' order by mlm;") 
    for x in 0..mlhcf.count-1
      qajh_data=$conn.exec("select archive.*,d_dalb.lbmc from archive,d_dalb where cast(archive.dalb as integer)=d_dalb.id and qzh='#{list[j]['id']}' and mlh='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}' order by ajh;")      

      if mlhcf[x]['dalb']!='24'
        rsmlh=$conn.exec("select * from qzml_key where qzh='#{list[j]['id']}' and mlm='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}'")
      else
        rsmlh=$conn.exec("select * from qzml_key where qzh='#{list[j]['id']}' and mlm='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}'")
      end
      if rsmlh.count>0
        mlh=rsmlh[0]['id']
        filename='timage_' + list[j]['id'].to_s + '_' + mlhcf[x]['dalb'].to_s + '_' + mlh.to_s + '.backup'
        #puts filename
        sfbf='未'
        filetime=''
        filesize=''
        path1="/share"
        #path1="./dady/sc"
        Find.find(path1) do |path|
          #puts path
          #puts FileTest.directory?(path)
          if FileTest.directory?(path)
            if File.basename(path)[0] == ?.
              #Find.prune       # Don't look any further into this directory.
            else
              next
            end
          else
            if (path.upcase.include?'BACKUP')  
              #puts path  
              #puts path1 + "/" + filename        
              if path1 + "/" + filename==path
                sfbf='已'
                filetime=File::mtime(path).strftime("%Y-%m-%d %H:%M:%S")
                filesize=File.size(path)
                filesize=filesize/1048576
                next
              end
            end
          end
        end
        puts qajh_data[0]['lbmc'].to_s + ";" + mlhcf[x]['mlh'].to_s +  ";" + sfbf + ";" + filesize.to_s + "M;" + filetime.to_s
        ff.write("<tr><td>" + qajh_data[0]['lbmc'].to_s + ";" + mlhcf[x]['mlh'].to_s +  ";" + sfbf + ";"  + filesize.to_s + "M;" + filetime.to_s + "</td></tr>" )
      end
    end   
  end
  ff.write("</table>"  )
  ff.close