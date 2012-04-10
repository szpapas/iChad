#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

def print_qzxx(dh_prefix)
  $stderr.puts" output 目录统计 #{dh_prefix}..."
  
  pr_path="/share/tjsj"
  if !File.exists?(pr_path)
    system("mkdir -p #{pr_path}")
  end
  
  dh = dh_prefix
  ss = dh.split('-')
  qzh, dalb, mlh = ss[0], ss[1], ss[2]
  
  dd = $conn.exec("select * from q_qzxx where dh_prefix='#{dh_prefix}';")[0]
  
  ajs = dd['zajh'].to_i - dd['qajh'].to_i + 1
  a3, a4, dt =  dd['a3'].to_i, dd['a4'].to_i, dd['dt'].to_i
  
  
  convert_str =  "convert ./dady/timage_t2.png -font ./dady/TextMate.ttf  -pointsize 24 -draw \"text 600, 620 '#{dd['mlh']}' \" -draw \"text 810, 620 '#{dd['qajh']} ~ #{dd['zajh']}' \"  -draw \"text 290, 685 '#{ajs}' \"   -draw \"text 500, 750 '#{a3+a4}' \"  -draw \"text 830, 750 '#{a3}' \" -draw \"text 290, 810 '#{a4}' \"   -draw \"text 730, 810 '#{dt}' \"  /share/tjsj/tj_#{dh_prefix}_01.jpg  "
  system convert_str
  
  convert_str =  "convert ./dady/timage_t3.png -font ./dady/TextMate.ttf  -pointsize 24 -draw \"text 610, 560 '#{dd['mlh']}' \" -draw \"text 810, 560 '#{dd['qajh']} ~ #{dd['zajh']}' \"  -draw \"text 300, 620 '#{ajs}' \" /share/tjsj/tj_#{dh_prefix}_02.jpg  "
  system convert_str
    
    
end  

dh = ARGV[0]
print_qzxx(dh)


$conn.close
#puts "***** End At #{Time.now}====\n"