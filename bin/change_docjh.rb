#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'
#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
#require 'serialport'
require 'pg'
require 'find'



$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
#先把timage表和archive表根据dh关联赶来，把qzh,mlh,ajh,dalb,timage.id等字段重新插入到image_temp新表中，以便后面修改dh时，再根据image_temp中的信息提取出timage.id来修改，这样可以避免因为mlh和mlm相同，但实际不同导致dh重复的现象
$conn.exec("select * from archive  where dalb='24' ;") 
  list=$conn.exec("select * from archive  where dalb='24' ;")  
  for j in 0..list.count-1
    if !list[j]['ajh'].nil?
      ajh=list[j]['ajh'].rjust(4,"0")
      puts "update archive set ajh='#{ajh}' where id=#{list[j]['id']};"
      $conn.exec("update archive set ajh='#{ajh}' where id=#{list[j]['id']};")
      $conn.exec("update  a_wsda set jh='#{ajh}' where ownerid=#{list[j]['id']};")
    end 
    
  end