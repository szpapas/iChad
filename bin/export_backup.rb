#!/usr/bin/ruby
if ARGV.count < 1
  puts "Usage: ruby export.rb dh_prefix" 
  puts "       ruby export.rb 9-24-1"
  exit
end  
dh = ARGV[0]
system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS timage_#{dh.gsub('-','_')} ;\"")
system ("sudo -u postgres psql -d JY1017 -c \"select * into timage_#{dh.gsub('-','_')} from timage where dh like '#{dh}-%'; \" ")
system ("sudo -u postgres pg_dump -Fc  -f '/share/timage_#{dh.gsub('-','_')}.backup' -t timage_#{dh.gsub('-','_')} JY1017")
system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS timage_#{dh.gsub('-','_')} \"")
