#!/usr/bin/ruby
#2综合档案aj.txt
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

if ARGV.count < 3 
  puts "usages : ruby ii_qz2.rb {aj_file} {qzh}  {image_path}"
  puts "         ruby ii_qz2.rb ks_aj 4 /share/tz"
  exit
end  
  

ajlist, qzh, path = ARGV[0], ARGV[1], ARGV[2]
File.open(ajlist).each_line do |line|
  mlh = /(\d+)(.*)/.match(line)[1]
  dalb = get_dalb(line)
  puts "ruby ./dady/bin/import_image.rb #{qzh} #{mlh} #{dalb} #{path}/#{mlh}/"
end