#!/usr/bin/ruby
#ruby ./dady/bin/upload_mulu.rb  78地籍管理档案aj.txt    泰州市国土资源局 4 4
#ruby um_qz2.rb ajlist 泰州市国土资源局 
def get_dalb(ifname) 
  key = /(\d+)(.*)(aj|jr)/.match(ifname)[2]
  hh = {
    "信访档案"=>13,
    "图件目录"=>18,
    "土地复垦"=>16,
    "土地登记"=>3,
    "土地规划"=>17,
    "声像档案"=>15,
    "照片档案"=>20,
    "用地档案"=>10,
    "科技信息"=>19,
    "综合档案"=>0,
    "计划财务"=>2,
    "地籍管理档案"=>4,
    "监察案件档案"=>14,
    "其他档案-基建档案目录"=>26,
    "其他档案-实物档案目录"=>28,
    "其他档案-资料信息档案"=>29
  }
  hh[key]   
end

if ARGV.count < 4 
  puts "usages : ruby um_qz2.rb {aj_file} {dwdm} {tz} {qzh}"
  puts "         ruby um_qz2.rb tz_aj 泰州市国土资源局 tz 4 "
  exit
end  


ajlist, dwdm, pp, qzh = ARGV[0], ARGV[1], ARGV[2], ARGV[3]
File.open(ajlist).each_line do |line|
  dalb = get_dalb(line)
  mlh = /(\d+)(.*)/.match(line)[1]
  puts "#{qzh}\t#{dalb}\t#{mlh}\t#{line}"
end