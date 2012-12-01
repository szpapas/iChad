#!/usr/bin/ruby
if ARGV.count < 1
  puts "Usage: ruby import_backup.rb #{backup_file} #{dh_prefix} #{new_db} " 
  puts "       ruby import_backup.rb /share/timage_10_28_139.backup 10-28-139 JY1111"
  exit
end

if File.exist?(ARGV[0])
  if ARGV.count == 3
    dbname = ARGV[2]
  else
    dbname = "JY1017"
  end
  dh = ARGV[1]
  system ("sudo -u postgres psql -d #{dbname} -c \"drop table IF EXISTS timage_#{dh.gsub('-','_')} \"")
  system ("sudo -u postgres pg_restore -d #{dbname} '/share/timage_#{dh.gsub('-','_')}.backup' ")
  system ("sudo -u postgres psql  -d #{dbname} -c \"select count(*) from timage_#{dh.gsub('-','_')};\" ")
else
  puts "#{ARGV[0]} 找不到，请确认文件存在。"
end



