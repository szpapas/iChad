ARGV.each do |file|
  puts "processing #{file}..."
  if !file.include?'setPath'
    ss = File.open(file).read
    
    ss = ss.gsub("$:<<'/Library/", "\#$:<<'/Library/").gsub("\#$:<<'/usr/", "\$:<<'/usr/")
    ff = File.open(file,'w')
    ff.write(ss)
    ff.close
  end
end

system("gcc dmdata.c -o /usr/bin/decrypt")
system("gcc jmdata.c -o /usr/bin/encrypt")
system("rm *.c setPath.rb")