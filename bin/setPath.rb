ARGV.each do |file|
  puts "processing #{file}..."
  ss = File.open(file).read
  ss = ss.gsub("#$:<<'/Library/", "\##$:<<'/Library/").gsub("\$:<<'/usr/", "$:<<'/usr/")
  ff = File.open(file,'w')
  ff.write(ss)
  ff.close
end