#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

if ARGV.count < 1
  puts "Usage: ruby export.rb dh_prefix" 
  puts "       ruby export.rb 9-24-1"
  exit
end  
dh = ARGV[0]
ss=dh.split('-')

dd = $conn.exec("select * from qzml_key where id='#{ss[2]}' and qzh='#{ss[0]}' and dalb='#{ss[1]}';")

  
  if ss[1]=='24'
    system ("sudo -u postgres psql -d JY1017 -c \"select * into timage_#{dh.gsub('-','_')} from timage where dh like '#{dh}-%'; \" ")
  else
    if dd.count>0
      #puts "timage_#{ss[0]}-#{ss[1]}-#{dd[0]['mlm']}"
      system("rm /share/timage_#{ss[0]}_#{ss[1]}_#{dd[0]['mlm']}.backup")
      system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS timage_#{ss[0]}_#{ss[1]}_#{dd[0]['mlm']} ;\"")
      puts "select * into timage_#{ss[0]}_#{ss[1]}_#{dd[0]['mlm']} from timage where dh in (select dh from archive where qzh='#{ss[0]}' and dalb='#{ss[1]}' and mlh='#{dd[0]['mlm']}')"
      system ("sudo -u postgres psql -d JY1017 -c \"select * into timage_#{ss[0]}_#{ss[1]}_#{dd[0]['mlm']} from timage where dh in (select dh from archive where qzh='#{ss[0]}' and dalb='#{ss[1]}' and mlh='#{dd[0]['mlm']}'); \" ")
      system ("sudo -u postgres pg_dump -Fc  -f '/share/timage_#{ss[0]}_#{ss[1]}_#{dd[0]['mlm']}.backup' -t timage_#{ss[0]}_#{ss[1]}_#{dd[0]['mlm']} JY1017")
      system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS timage_#{ss[0]}_#{ss[1]}_#{dd[0]['mlm']} \"")
    end
  end

