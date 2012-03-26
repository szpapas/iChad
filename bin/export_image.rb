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
option = ARGV[1]


if option.to_i == 0
  imgs = $conn.exec("select id, dh from timage where dh like '#{dh}' order by id;")
elsif option.to_i == 1
  imgs = $conn.exec("select id, dh from timage where dh like '#{dh}' and yxmc like '[ML|JN]%' order by id;")
else
  
end

  
dh = "#{qzh}_#{dalb}_#{mlh}_%"
savePath = ARGV[2].nil? ? './dady/export' : ARGV[2] 
outPath = "#{savePath}/#{qzh}/#{mlh}"

if File.exists?(outPath)
  system "rm -rf #{outPath}"
end 
system "mkdir -p #{outPath}"


for k in 0..imgs.count - 1 do
  dd = imgs[k]
  user = $conn.exec("select * from timage where id='#{dd['id']}';")
  ss=PGconn.unescape_bytea(ss = user[0]["data"]) 
  local_filename = "#{outPath}/"+user[0]["yxmc"]
  File.open(local_filename, 'w') {|f| f.write(ss) }
end

if !ARGV[3].nil?
  system "rm -rf #{outPath}.zip"
  puts "zip #{outPath}.zip #{outPath}/*"
  system "zip #{outPath}.zip #{outPath}/*"
end

puts " Completed in #{Time.now-t1} s" 
puts "***==export finished: #{outPath}.zip"

$conn.close