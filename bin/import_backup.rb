#!/usr/bin/ruby
if ARGV.count < 1
  puts "Usage: ruby import.rb #{backup_file} #{dh_prefix} #{new_db} " 
  puts "       ruby import.rb timage_20_3_26.backup JYNEW 10-3-26"
  exit
end

if File.exist?(ARGV[0])
  if ARGV.count == 3
    dbname = ARGV[2]
  else
    dbname = "JY1017"
  end
  dh = ARGV[1]
  system ("psql -U postgres -d #{new_db} -c \"drop table IF EXISTS timage_#{dh.gsub('-','_')} \"")
  system ("pg_restore -U postgres -Fc  -f '/share/timage_#{dh.gsub('-','_')}.backup' -t timage_#{dh.gsub('-','_')} JY1017")
else
  puts "#{ARGV[0]} 找不到，请确认文件存在。"
end


system ("psql -U postgres -d #{new_db} -c \"drop table IF EXISTS timage_#{dh.gsub('-','_')} \"")
system ("psql -U postgres -d JY1017 -c \"select * into timage_#{dh.gsub('-','_')} from timage where dh like '#{dh}-%'; \" ")
system ("pg_dump -U postgres -Fc  -f '/share/timage_#{dh.gsub('-','_')}.backup' -t timage_#{dh.gsub('-','_')} JY1017")
system ("psql -U postgres -d JY1017 -c \"drop table IF EXISTS timage_#{dh.gsub('-','_')} \"")

