#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'

#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
#require 'serialport'
require 'pg'
require 'find'


dh='10-24-11,10-24-13,3,4'
dhprefix=dh.split(',')
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
   
  for j in 0..dhprefix.length-1
    update="select * from a_wsda where dh like '#{dhprefix[j]}-%' order by jh;"
    puts update
    mlhcf=$conn.exec(update) 
    if mlhcf.count>0
      update="update q_qzxx set qajh=#{mlhcf[0]['jh'].to_i},zajh=#{mlhcf[mlhcf.count-1]['jh'].to_i} where dh_prefix='#{dhprefix[j]}';"
      puts update
      $conn.exec(update)
    end
  end
 

