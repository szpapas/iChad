#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'

require 'pg'
require 'find'

# ********************************************************************************************
#
#   main fucntions 
#
#    @ARGV[0] --- 
#   
#    ruby import_iamge.rb 1 1 0 /share/1/1_1/ 
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

dh_prefix, path, ajh = ARGV[0], ARGV[1], ARGV[2]
ss = dh_prefix.split('-')
qzh,dalb,mlh = ss[0],ss[1],ss[2]
puts "===ajh  of  #{ajh}  ==="
t1 = Time.now
puts "===Import images of  #{dh_prefix} begin at #{t1} ==="


if !ajh.nil?
  puts "delete from timage where dh like '#{dh_prefix}-#{ajh}' and yxbh not like 'ML%';"  
  $conn.exec("delete from timage where dh like '#{dh_prefix}-#{ajh}' and yxbh not like 'ML%';")
else 
  puts "delete from timage where dh like '#{dh_prefix}-%' and yxbh not like 'ML%';"  
  $conn.exec("delete from timage where dh like '#{dh_prefix}-%' and yxbh not like 'ML%';")
end

#/assets/dady/#{mlh}\$#{flh}\$#{ajh}\$ML01.jpg   => dh, yxmc, yxbh, yxdx, data

def getimgsize(fname)
  outfile = rand(36**6).to_s(36)
  rt=system "gdalinfo '#{fname}' | grep 'Lower Right' > #{outfile}"
  if rt
    ss = File.open(outfile).read.split(/\(|\)/)[1]
    system "rm #{outfile}"
  else
    $stderr.puts(" *** Import Image: #{fname}  file is corrupt.")
    ss = "0, 0"
  end    
  ss
end


def save2timage(yxbh, path, dh, yx_prefix)
  fo = File.open(path).read
  if  fo[128..167] == "                                        "
     fo = fo[168..-1]
  end
  
  infile = rand(36**6).to_s(36)
  outfile = rand(36**6).to_s(36)
  File.open(infile, 'w').write(fo)
  puts "./dady/bin/encrypt #{infile} #{outfile}"
  system("./dady/bin/encrypt #{infile} #{outfile}")
  
  fo = File.open(outfile).read
  
  if fo.size == 0
    $stderr.puts(" *** Import Image: #{path}  file size is zero.")
    return 
  end
  
  if (yxbh.include?'jpg') ||  (yxbh.include?'JPG')  

    si = fo.index("\377\300")
    
    if si.nil?
      $stderr.puts(" *** Import Image: #{path}  corrupt image file.")
      return
    end
    width, height = fo[si+5].to_i*256+fo[si+6].to_i,fo[si+7].to_i*256+fo[si+8].to_i
    
    fb,fe=fo.index("\377\376"), fo.index("\377\333")
    meta=''
    
    if fb.nil? || fe.nil?
      meta, meta_tz = "", 0
      pixels = width * height
      if pixels > 6000000
        meta_tz = 2
      elsif pixels > 4000000
        meta_tz = 1
      else
        meta_tz = 0    
      end
    else
      meta = fo[fb..fe-1]
      meta = meta.split("\377\376")[-1]
      pixels = width * height
      if pixels > 1000000000
        wh = getimgsize(path).split(",")
        width, height = wh[0].to_i, wh[1].to_i
        pixels = width * height
      end  
      mm = meta.split("\;")
      if mm.size > 5 && meta.size < 100
        meta=mm[0..5].join("\;")[2..-1] 
        meta_tz =mm[2].to_i
      else
        $stderr.puts "Tags error: #{path}"
        meta, meta_tz = "", 0
      end     
    end
    
  elsif (yxbh.include?'TIF') || (yxbh.include?'tif') 
    meta = ""
    wh = getimgsize(path).split(",")
    width, height = wh[0].to_i, wh[1].to_i
    pixels = width * height
    
    if width > 10000
      meta_tz = 0 
    else
      if pixels > 6000000
        meta_tz = 2
      elsif pixels > 4000000
        meta_tz = 1
      else
        meta_tz = 0    
      end
    end  
  end
  
  yxdx = fo.size
  edata=PGconn.escape_bytea(fo)
  yxmc="#{yx_prefix}\$#{yxbh}"
  #puts "insert file: #{path}  size: #{width}, #{height}  meta: #{meta_tz}   ... "
  $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data, meta, meta_tz, pixel, width, height) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' , '#{meta}', #{meta_tz}, #{pixels}, #{width}), #{height};")
end


$dh, $archive_id = '', 0
Find.find(path) do |path|
  if FileTest.directory?(path)
    if File.basename(path)[0] == ?.
      #Find.prune       # Don't look any further into this directory.
    else
      next
    end
  else
    if (path.include?'jpg') || (path.include?'TIF') || (path.include?'tif') || (path.include?'JPG')
      
      if /(\d+)\$\w+\$(\d+)\$(....)\.\w+/.match(path).nil?
        $stderr.puts(" *** Import Image: #{path} Format error.")
        next
      end
      
      pp = path.split("\/")
      file_title = pp[pp.size-1]
      ss = pp[pp.size-1].split("$")
      mlh,flh,ajh,sxh = ss[0],ss[1],ss[2],ss[3].gsub("ML","JN")
      
      dh = "#{dh_prefix}-#{ajh.to_i}"
      if dh != $dh
        $dh = dh
        puts "processing #{dh}... "
      end
      
      #$stderr.puts("Import Image: #{path} ... ")
      yxqz = "#{mlh}\$#{flh}\$#{ajh}"  #ying xiang qian zui
      save2timage(sxh, path, $dh, yxqz)
    end
  end
end

$conn.exec("update timage set yxmc=split_part(yxmc,'ml',1) || 'JN'|| split_part(yxmc,'ml', '2'), yxbh= split_part(yxbh,'ml',1) || 'JN'|| split_part(yxbh,'ml', '2')  where yxbh like '%ml0%';")
$conn.exec("update timage set meta_tz = 0 where yxbh like 'JN%' and dh like '#{qzh}-#{dalb}-#{mlh}-%';")
$conn.exec("update timage set dh_prefix = split_part(dh, '-', 1) || '-' || split_part(dh, '-', 2)  ||  '-' || split_part(dh, '-', 3) where dh_prefix is null;")
$conn.close

puts "=== Total time is #{Time.now-t1} seconds"
