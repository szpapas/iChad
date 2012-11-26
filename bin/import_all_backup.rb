#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

users = $conn.exec("select distinct dh_prefix, qzh, mlh, mlm,dalb from q_qzxx order by qzh, dalb,mlh, mlm;")

for k in 0..users.count-1 do
  data = users[k]
  backup_file = "/share/timage_#{data['dh_prefix'].gsub('-','_')}.backup" 
  puts "processing #{data['dh_prefix']} #{data['mlm']} ...."
  system "ruby ./bin/import_backup.rb #{backup_file} #{data['dh_prefix']}" if File.exists?(backup_file)
end   

$conn.close