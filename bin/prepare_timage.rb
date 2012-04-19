#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

dh = ARGV[0]
images = $conn.exec("select id, dh, yxmc, yxdx, yxbh from timage where dh = '#{dh}' order by yxbh;")

if !File.exists?("./dady/img_tmp/#{dh}/")
  system"mkdir -p ./dady/img_tmp/#{dh}/"
end  

for k in 0..images.count-1
  im = images[k]
  local_filename = "./dady/img_tmp/#{dh}/"+im["yxmc"].gsub('$', '_').gsub('TIF','JPG')
  if !File.exists?(local_filename)
    user = $conn.exec("select id, yxmc, data from timage where id='#{im['id']}';")
    ss = user[0]["data"] #already escaped
    ss=PGconn.unescape_bytea(ss) 
    local_filename = "./dady/img_tmp/#{dh}/"+user[0]["yxmc"].gsub('$', '_').gsub('TIF','JPG')
    File.open(local_filename, 'w') {|f| f.write(ss) }
  end
end

$conn.close  