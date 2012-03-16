#***************************************************************
#   ruby  import_image.rb {qzh} {mlh} {dalb} /share/TZ/92/ 
#   ARGV[0] --- qz_file  tz_qzb
#   ARGV[1] --- qzh      4
#   ARGV[2] --- path     /share/TZ
#***************************************************************
qz_file, qzh, path = ARGV[0], ARGV[1], ARGV[2]
File.open(qz_file).each_line do |line|
  ss = line.chomp!.split(/\t/)
  mlh, dalb = ss[1], ss[6]
  puts "ruby ./dady/bin/import_image.rb #{qzh} #{mlh} #{dalb} #{path}/#{mlh}/"
end