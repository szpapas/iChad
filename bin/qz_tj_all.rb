#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/' 
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'find'


#全部重新统计
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
  list=$conn.exec("select * from d_dwdm  order by id;") 
  for j in 0..list.count-1
    mlhcf=$conn.exec("select * from q_qzxx where qzh='#{list[j]['id']}' order by mlm;") 
    for x in 0..mlhcf.count-1      
        system("ruby ./dady/bin/update_qzxx_tj.rb #{mlhcf[x]['dh_prefix']} ")
        #puts mlhcf[x]['mlm'].to_s + ";" + qajh_data[0]['ajh'].to_s + ";" + qajh_data[qajh_data.count-1]['ajh'].to_s + ";" + jn_data[0]['count'].to_s + ";" + mlhcf[x]['a4'].to_s+ ";" + mlhcf[x]['a3'].to_s+ ";" + mlhcf[x]['dt'].to_s

    end
    
  end