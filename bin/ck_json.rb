#!/usr/bin/ruby
#check_json *.txt
#$:<<'/Library/Ruby/Gems/1.8/gems/activesupport-2.3.5/lib/'
$:<<'/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.0.4/lib'
require 'thread'
require 'active_support'

def decode_file (infile, outfile)
  newfile = rand(36**8).to_s(36)
  # puts "iconv -t UTF-8 -f GB18030 #{infile} > #{newfile}"
  system("iconv -t UTF-8 -f GB18030 #{infile} > #{newfile}")
  ss = File.open(newfile).read
  x= ActiveSupport::JSON.encode(ss).gsub(/\\n/, '').gsub("'","\"").gsub(/\\r/,'')
  ff = File.open("#{outfile}","w+")
  ff.write(x[1..-2])
  ff.close
  system("rm #{newfile}")
end


ARGV.each do |file|
  print "Testing #{file}..."
  outfile = rand(36**8).to_s(36)
  decode_file(file, outfile)
  data = File.open("#{outfile}").read
  begin
    tt = ActiveSupport::JSON.decode(data)
    print "  pass\n"
  rescue StandardError 
    print "  fail\n *** JSON Format Error: unable to convert #{file}\n"
  end
  system ("rm #{outfile}")  
end
