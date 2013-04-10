#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
#这个是服务器上的文件夹
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-3.1.3/lib' << '/usr/local/lib/ruby/gems/1.8/gems/multi_json-1.3.6/lib'
require 'pg'
require 'find'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

#*****************************************
#   导出影像文件
#******************************************

user1=$conn.exec("select dh,id,yxmc from timage where  yxbh  like 'ML%' ;") 
dh,width,height = user1[0]['dh'], user1[0]['width'], user1[0]['height']

if !File.exists?("./dady/img_tmp/dc/")
  system"mkdir -p ./dady/img_tmp/dc/"        
end



for j in 0..user1.count-1
  
    user = $conn.exec("select id, dh, yxmc, data, jm_tag from timage where id=#{user1[j]["id"]};")
    
    convert_filename = "./dady/img_tmp/dc/"+user[0]["yxmc"].gsub('$', '\$').gsub('TIF','JPG').gsub('tif','JPG')
    local_filename = "./dady/img_tmp/dc/"+user[0]["yxmc"].gsub('$', '\$')
    tmpfile = rand(36**10).to_s(36)
    #ff = File.open("./tmp/#{tmpfile}",'w')
    #ff.write(user[0]["data"])
    #ff.close
  
    ss=PGconn.unescape_bytea(ss = user[0]["data"]) 
    File.open("./tmp/#{tmpfile}", 'w') {|f| f.write(ss) }
  
  
    puts "./tmp/#{tmpfile} #{local_filename}"
    if (user[0]['jm_tag'].to_i == 1)
      system("decrypt ./tmp/#{tmpfile} #{local_filename}")
    else
      system("scp ./tmp/#{tmpfile} #{local_filename}")
    end 
    system("rm ./tmp/#{tmpfile}")
  

    #system("convert '#{local_filename}' '#{convert_filename}'")
    
  
end






