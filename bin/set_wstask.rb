#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/' << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.3.6/lib'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib'

require 'pg'
require 'active_support'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = on")

#============wsda_mlh===============

def set_wsda_mlh (qzh)
  $wsda_mlh={}
  wsml = $conn.exec("select * from a_wsda_key where qzh='#{qzh}' order by id ;")
  for k in 0..wsml.count - 1 
    ws = wsml[k]
    ws_key = "#{ws['qzh']}-#{ws['nd']}-#{ws['bgqx']}-#{ws['jgwth']}"
    $wsda_mlh[ws_key] = ws['id']
  end
end

def get_ws_mlh(qzh, nd, bgqx, jgwth)
  ws_key = "#{qzh}-#{nd}-#{bgqx}-#{jgwth}"
  if $wsda_mlh[ws_key].nil?
    $conn.exec("insert into a_wsda_key(qzh, nd, bgqx, jgwth) values('#{qzh}','#{nd}','#{bgqx}','#{jgwth}');")
    set_wsda_mlh(qzh)
  end 
  $wsda_mlh[ws_key]   
end

def get_mlm(ifname)
  ss=/(.*)(文档一体化.*)/.match(ifname)
  ss[1]
end

#======


# ********************************************************************************************
#
#   main fucntions 
#
#    @qzh ---
#    @mlh ---
#
#*********************************************************************************************
#ruby ./dady/bin/upload_mulu.rb  10用地档案jr.txt 泰州市国土资源局 4 17 &

if ARGV.count < 2 
  $stderr.puts "usages : ruby ./dady/bin/set_wstask {wspath.txt} {qzh}"
  exit
end

qzh = ARGV[1]

$wsda_mlh = {}
set_wsda_mlh(qzh)



File.open(ARGV[0]).each_line do |line|
  wspath = line.chomp!
  bgqx, nd, ajh, jgwth = wspath.split("\$")
  mlh = get_ws_mlh(qzh, nd, bgqx, jgwth.to_i.to_s.rjust(3,"0"))
  dh_prefix = "#{qzh}-24-#{mlh}"
  puts "ruby ./dady/bin/import_tsimage.rb #{dh_prefix} /media/usb/together/tongshan/文书/#{ws_path.gsub('$','\$')}  #{ajh.to_i}"
end 

$conn.close
