#!/usr/bin/ruby
#check_json *.txt
$:<<'/Library/Ruby/Gems/1.8/gems/activesupport-2.3.5/lib/'
require 'active_support'

ARGV.each do |file|
  print "Testing #{file}..."
  
  newfile = rand(36**8).to_s(36)
  puts "iconv -t UTF-8 -f GB18030  #{file} > #{newfile}"
  system("iconv -t UTF-8 -f GB18030   #{file} > #{newfile}")
  
  File.open("#{newfile}").each_line do |line|
    if line.include?"Table"
      data = '['+line.gsub("\000","").chomp![0..-2]+']'
      begin
        tt = ActiveSupport::JSON.decode(data)
        print "  pass\n"
      rescue StandardError 
        print "  fail\n *** JSON Format Error: unable to convert #{line} \n"
      end
    end  
  end  
  
  #data = File.open("#{file}").read
  #
  #begin
  #  tt = ActiveSupport::JSON.decode(data)
  #  print "  pass\n"
  #rescue StandardError 
  #  print "  fail\n *** JSON Format Error: unable to convert #{file}\n"
  #end
end
