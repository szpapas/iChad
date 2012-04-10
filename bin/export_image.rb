#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

# ********************************************************************************************
#
#   main fucntions 
#
#    @ARGV[0] --- archive_id 
#   
#
#*********************************************************************************************
t1 = Time.now

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

ss = ARGV[0].split('_')
qzh, dalb, mlh = ss[0], ss[1], ss[2]

dh = "#{qzh}_#{dalb}_#{mlh}_%"
option = ARGV[1]

if option.to_i == 1
  imgs = $conn.exec("select id from timage where dh like '#{dh}' and yxbh like 'ML%' order by id;")
elsif option.to_i == 2        
  imgs = $conn.exec("select id from timage where dh like '#{dh}' and yxbh similar to '[ML|JN]%' order by id;")
else                          
  imgs = $conn.exec("select id from timage where dh like '#{dh}' order by id;")
end

  
savePath = ARGV[2].nil? ? './dady/export' : ARGV[2] 
outPath = "#{savePath}/#{qzh}/#{mlh}"

puts "check path #{outPath}..."
if !File.exists?(outPath)
  puts "create path #{outPath}..."
  system "mkdir -p #{outPath}"
end 

for k in 0..imgs.count - 1 do
  dd = imgs[k]
  user = $conn.exec("select * from timage where id='#{dd['id']}';")
  prefix = user[0]["yxmc"][0..-10]
  if !File.exists?("#{outPath}/#{prefix}")
    puts "create path #{outPath}/#{prefix}..."
    system "mkdir -p '#{outPath}/#{prefix}'"
  end

  ss=PGconn.unescape_bytea(ss = user[0]["data"]) 
  local_filename = "#{outPath}/#{prefix}/"+user[0]["yxmc"]
  puts "save to #{local_filename} ..."
  File.open(local_filename, 'w') {|f| f.write(ss) }
end

puts " Completed in #{Time.now-t1} s" 
puts "***==export finished: #{outPath}"

$conn.close