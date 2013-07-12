#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/' 
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
#$:<<'/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib/'
#require 'serialport'
require 'pg'
require 'find'



$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
  list=$conn.exec("select distinct mlh ,dalb,lbmc,count(*)  as sl from  archive,d_dalb where d_dalb.id=cast(archive.dalb as integer) and dh in (select dh from timage where sfzs=1) and mlh<>'' and dalb<>'24' group by mlh,dalb,lbmc order by dalb;") 
  puts "档案类别;目录号;案卷数;扫描文件数;扫描页数与输档页数不符的案卷数"
  puts list.count
  for j in 0..list.count-1
    bf=$conn.exec("select ajh,ys,(select count(*) from timage where dh=a.dh and not (yxmc like 'ML%')) as smys from archive a where mlh='#{list[j]['mlh']}' and dalb='#{list[j]['dalb']}' and dh in (select dh from timage where sfzs=1) and (select count(*) from timage where dh=a.dh and not (yxmc like 'ML%'))<>ys order by ajh;") 
    mlhcf=$conn.exec("select count(*) as sl from timage where sfzs=1 and dh in (select dh from archive where mlh='#{list[j]['mlh']}' and dalb='#{list[j]['dalb']}');") 
    puts list[j]['mlh'].to_s + ";" + list[j]['lbmc'].to_s + ";" + list[j]['sl'].to_s +  ";" + mlhcf[0]['sl'].to_s + ";" + bf.count.to_s
  end
