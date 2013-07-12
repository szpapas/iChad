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
  #list=$conn.exec("select * from d_dwdm  order by id;") 
  #distinct
  for j in 0..list.count-1
    puts list[j]['dwdm']
    mlhcf=$conn.exec("select distinct mlh,dalb,qzh from archive where dalb<>'3' and dalb<>'2' and dalb<>'24' and qzh='#{list[j]['id']}'  order by mlh;") 
    for x in 0..mlhcf.count-1
      if !mlhcf[x]['mlh'].nil?
        mlm=$conn.exec("select * from qzml_key where qzh='#{mlhcf[x]['qzh']}' and mlm='#{mlhcf[x]['mlh']}' and dalb='#{mlhcf[x]['dalb']}'")
        puts "nohup ruby bin/export_backup.rb #{mlhcf[x]['qzh']}-#{mlhcf[x]['dalb']}-#{mlm[0]['id']} &"
               
      end
    end   
  end