#!/usr/bin/ruby
#system("ruby ./dady/bin/upload_mulu.rb json_file, dwdm, qzh, dalb) ")
#档案类别	目录号	起案卷号	止案卷号	实际卷数	总页数	档案类别qrs
qzh, dwdm=ARGV[1], ARGV[2]
File.open(ARGV[0]).each_line do |line|
  ss = line.chomp!.split(/\t/)
  filename = "#{ss[1]}#{ss[0]}aj.txt"
  puts "ruby ~/dady/bin/upload_mulu.rb #{filename} #{dwdm} #{qzh} #{ss[6]} "
end