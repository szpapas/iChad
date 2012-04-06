#!/usr/bin/ruby
# ruby split.rb {filename} {line} 
fname, count = ARGV[0], ARGV[1].to_i
k = 0
File.open(fname).each_line do |line|
  if (k % count) == 0
    puts "creae file #{fname}.#{k/count}..."
    $ff = File.open("#{fname}.#{k/count}", 'w')
  end 
  $ff.puts(line)
  k=k+1
end    
     