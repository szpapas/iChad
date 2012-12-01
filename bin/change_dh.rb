#!/usr/bin/ruby
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
#require 'serialport'
require 'pg'
require 'find'



$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
#先把timage表和archive表根据dh关联赶来，把qzh,mlh,ajh,dalb,timage.id等字段重新插入到image_temp新表中，以便后面修改dh时，再根据image_temp中的信息提取出timage.id来修改，这样可以避免因为mlh和mlm相同，但实际不同导致dh重复的现象
$conn.exec("select timage.id,timage.dh,mlh,ajh,dalb,qzh,yxbh,bz as newdh into image_temp from timage,archive  where timage.dh=archive.dh ;") 
  list=$conn.exec("select distinct cast(mlh as integer),qzh,dalb from archive where mlh<>'' and dalb<>'24' order by mlh  DESC,qzh,dalb;") 
  for j in 0..list.count-1
    mlhcf=$conn.exec("select * from qzml_key where mlm='#{list[j]['mlh']}' and qzh='#{list[j]['qzh']}' and dalb='#{list[j]['dalb']}';") 
    if mlhcf.count==0
      mlh=$conn.exec("select * from qzml_key where id='#{list[j]['mlh']}';") 
      if mlh.count>0
        max=$conn.exec("select max(id) from qzml_key;")
        maxid= max[0]['max'].to_i+1
        update="insert into qzml_key(id,qzh, dalb, mlm) values(#{maxid},'#{list[j]['qzh']}','#{list[j]['dalb']}','#{list[j]['mlh']}');"
      else
        update="insert into qzml_key(qzh, dalb, mlm,id) values('#{list[j]['qzh']}','#{list[j]['dalb']}','#{list[j]['mlh']}',#{list[j]['mlh']});"
      end
      puts update
      $conn.exec(update)
      mlhcf=$conn.exec("select * from qzml_key where mlm='#{list[j]['mlh']}' and qzh='#{list[j]['qzh']}' and dalb='#{list[j]['dalb']}';") 
    end
    if mlhcf[0]['id'].to_s!=mlhcf[0]['mlm'].to_s
      update="update archive set dh=qzh || '-' || dalb  || '-' || #{mlhcf[0]['id']} || '-'|| cast(ajh as integer) where mlh='#{list[j]['mlh']}' and qzh='#{list[j]['qzh']}' and dalb='#{list[j]['dalb']}'"
      puts update
      $conn.exec(update)
      #puts "select * from image_temp where mlh='#{list[j]['mlh']}' and qzh='#{list[j]['qzh']}' and dalb='#{list[j]['dalb']}';"
      image_temp=$conn.exec("select distinct mlh,qzh,dalb,ajh from image_temp where mlh='#{list[j]['mlh']}' and qzh='#{list[j]['qzh']}' and dalb='#{list[j]['dalb']}';")
      for i in 0..image_temp.count-1
        ajh=image_temp[i]['ajh'].to_i
        
        update="update timage set dh=#{list[j]['qzh']} || '-' || #{list[j]['dalb']}  || '-' || #{mlhcf[0]['id']} || '-'|| #{ajh},dh_prefix=#{list[j]['qzh']} || '-' || #{list[j]['dalb']}  || '-' || #{mlhcf[0]['id']} where id in (select id from image_temp where mlh='#{list[j]['mlh']}' and qzh='#{list[j]['qzh']}' and dalb='#{list[j]['dalb']}' and ajh='#{image_temp[i]['ajh']}');"        
        puts update
        $conn.exec(update)
        update="update image_temp set newdh=#{list[j]['qzh']} || '-' || #{list[j]['dalb']}  || '-' || #{mlhcf[0]['id']} || '-'|| #{ajh} where id in (select id from image_temp where mlh='#{list[j]['mlh']}' and qzh='#{list[j]['qzh']}' and dalb='#{list[j]['dalb']}' and ajh='#{image_temp[i]['ajh']}');"
        puts update
        $conn.exec(update)
      end
      system("ruby ./dady/bin/update_qzxx_tj.rb #{list[j]['qzh']}-#{list[j]['dalb']}-#{mlhcf[0]['id']}") 
    else
      puts list[j]['qzh'].to_s + "-" + list[j]['dalb'].to_s + "-" + list[j]['mlh'].to_s + "   no change"
    end
  end