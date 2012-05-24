#!/usr/bin/ruby
#ruby ./dady/bin/upload_mulu.rb  78地籍管理档案aj.txt    泰州市国土资源局 4 4
#ruby um_qz2.rb ajlist 泰州市国土资源局 
if ARGV.count < 4 
  puts "usages : ruby um_qz2.rb {aj_file} {dwdm} {tz} {qzh}"
  puts "         ruby um_qz2.rb tz_aj 泰州市国土资源局 tz 4 "
  exit
end  

ajlist, dwdm, pp, qzh = ARGV[0], ARGV[1], ARGV[2], ARGV[3]
File.open(ajlist).each_line do |line|
  puts "ruby ./dady/bin/upload_mulu.rb #{line.chomp} #{dwdm} #{qzh} #{pp}"
end