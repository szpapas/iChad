#!/usr/bin/ruby
#system("ruby ./dady/bin/print_wizard.rb #{qzh} #{mlh} #{dalb} #{qajh} #{zajh} #{dylb} 1 &")
File.open(ARGV[0]).each_line do |line|
  ss = line.chomp!.split(/\t/)
  puts "ruby ./dady/bin/print_wizard.rb 4 #{ss[1]} #{ss[6]} #{ss[2]} #{ss[3]} 13 1 &"
end 
