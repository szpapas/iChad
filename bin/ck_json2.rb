#!/usr/bin/ruby
#check_json *.txt
$:<<'/Library/Ruby/Gems/1.8/gems/activesupport-2.3.5/lib/'
require 'active_support'

ARGV.each do |file|
  print "Testing #{file}..."
  outfile = rand(36**8).to_s(36)
  data = File.open("#{file}").read
  begin
    tt = ActiveSupport::JSON.decode(data)
    print "  pass\n"
  rescue StandardError 
    print "  fail\n *** JSON Format Error: unable to convert #{file}\n"
  end
  system ("rm #{outfile}")  
end
