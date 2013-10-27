#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/' << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.3.6/lib'
#这个是服务器上的文件夹
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' 
#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'  << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.0.4/lib'
require 'pg'



$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = on")
tszl=$conn.exec("select * from a_by_tszlhj;") 
for i in 0..tszl.count-1
    djh=tszl[i]['djh'].split('-')
    if djh.length>1
      if djh[1].length<4
        djh[1]=djh[1].to_i
        djh1=djh[0] + "-" + sprintf("%04d", djh[1])  
      else
        djh1=tszl[i]['djh']
      end
      #puts djh1
      #$conn.exec("update a_by_tszlhj set djh=#{djh1} where id=#{tszl[0]['id']};")
      puts "--" + tszl[i]['djh']
      puts "update a_by_tszlhj set djh='#{djh1}' where id=#{tszl[i]['id']};"
    end
end