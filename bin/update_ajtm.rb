#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/' << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.3.6/lib'
#这个是服务器上的文件夹
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.3.6/lib'
$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'  << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.0.4/lib'
require 'pg'
require 'active_support'



$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = on")
def decode_file (infile, outfile, path)
  newfile = rand(36**8).to_s(36)
  #puts "iconv -t UTF-8 -f GB18030  #{path}/#{infile} > #{path}/#{newfile}"
  system("iconv -t UTF-8 -f GB18030  #{path}/#{infile} > #{path}/#{newfile}")
  ss = File.open("#{path}/#{newfile}").read
  x= ActiveSupport::JSON.encode(ss).gsub(/\\n/, '').gsub("'","\"").gsub(/\\r/,'')
  ff = File.open("#{path}/#{outfile}","w+")
  ff.write(x[1..-2])
  ff.close
  system("rm #{path}/#{newfile}")
end
ifname="15aj.txt"
path="./dady"
newfile = rand(36**8).to_s(36)
puts "iconv -t UTF-8 -f GB18030  #{path}/#{ifname} > #{path}/#{newfile}"
system("iconv -t UTF-8 -f GB18030   #{path}/#{ifname} > #{path}/#{newfile}")
data = File.open("#{path}/#{newfile}").read
data2=data.split(' ')
for k in 0.. data2.length-1
  #puts data2[k]
  data3=data2[k].split(';')
  puts "update archive set tm= tm || '#{data3[3]}' where dalb='4' and mlh='15' and ajh='#{data3[2].rjust(4,"0")}';"
  $conn.exec("update archive set tm= tm || '#{data3[3]}' where dalb='4' and mlh='15' and ajh='#{data3[2].rjust(4,"0")}';")
end
#File.open("#{path}/#{newfile}").each_line do |line|

    #data = line.gsub("\000","")
    #puts data
   # begin
   #   tt = ActiveSupport::JSON.decode(data)
   #   print "  pass\n"
   # rescue StandardError 
   #   print "  fail\n *** JSON Format Error: unable to convert #{line} \n"
   # end
 
#end

#outfile = rand(36**8).to_s(36)
#puts "#{ifname}\t#{outfile}\t#{path}"
#decode_file("#{ifname}", "#{outfile}", path)
#data = File.open("#{path}/#{outfile}").read.gsub("\000","")
#data = File.open("#{path}/#{outfile}").read
#data2=data.split(' ')
#data1[0]=ActiveSupport::JSON.decode(data1[0])
#puts data1[0]
#data3=data2[0].split(';')
#data1=ActiveSupport::JSON.decode(data)
#puts data1
#xx=ActiveSupport::JSON.encode(data1[0]).gsub(/\\n/, '').gsub("'","\"").gsub(/\\r/,'')
#puts xx[1..-2]
#$conn.exec("update a_wsda set gb='#{data1[0]}' where id=5837")
#puts data1.length
#puts ActiveSupport::JSON.decode(data)
#tt =ActiveSupport::JSON.decode(data)
#  for i in 0..tt.size-1 
#    puts tt[i]['Table']['题名']
#  
#    wsdoc=$conn.exec("select * from a_wsda where zwrq is null and nd='#{tt[i]['Table']['年度']}' and bgqx='#{tt[i]['Table']['保管期限']}' and jgwth='#{tt[i]['Table']['机构问题号']}' and jh='#{tt[i]['Table']['件号'].rjust(4,"0")}';") 
#    if wsdoc.count.to_i==1
#      puts "select * from a_wsda where zwrq is null and nd='#{tt[i]['Table']['年度']}' and bgqx='#{tt[i]['Table']['保管期限']}' and jgwth='#{tt[i]['Table']['机构问题号']}' and jh='#{tt[i]['Table']['件号'].rjust(4,"0")}';"
#      if tt[i]['Table']['日期']!=''
#        zwrq = "TIMESTAMP '#{tt[i]['Table']['日期']}'"    
#        $conn.exec("update a_wsda set zwrq=#{zwrq} where id=#{wsdoc[0]['id']}")
#      end
#    end
#  end