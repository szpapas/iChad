#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

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
t1 = Time.now

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

dh_prefix, path, ajh = ARGV[0], ARGV[1], ARGV[2]
ss = dh_prefix.split('_')
qzh,dalb,mlh = ss[0],ss[1],ss[2]

if !ajh.nil?
  puts "delete from timage where dh like '#{dh_prefix}_#{ajh}' and yxbh not like 'ML%';"  
  $conn.exec("delete from timage where dh like '#{dh_prefix}_#{ajh}' and yxbh not like 'ML%';")
else 
  puts "delete from timage where dh like '#{dh_prefix}_%' and yxbh not like 'ML%';"  
  $conn.exec("delete from timage where dh like '#{dh_prefix}_%' and yxbh not like 'ML%';")
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

def save2timage(id, yxbh, path, dh, yx_prefix)
  fo = File.open(path).read
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
    
    #wh = getimgsize(path).split(",")
    #width, height = wh[0].to_i, wh[1].to_i
    
    meta = fo[0..100].split("\377\333")[0].split("\'")[1]
  
    if meta.nil?
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
      mm = meta.split("\;")
      pixels = width * height
      if mm.size > 5 
        meta = meta.split("\;")[0..5].join("\;")
        meta_tz = meta.split("\;")[2].to_i
      else
        puts "Tags error: #{meta}"
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
  puts "insert file: #{path}  size: #{width}, #{height}  meta: #{meta_tz}   ... "
  #puts "insert into timage (dh, yxmc, yxbh, yxdx, meta, meta_tz, pixel) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx},  '#{meta}', #{meta_tz}, #{pixels});"
  $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data, meta, meta_tz, pixel) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' , '#{meta}', #{meta_tz}, #{pixels});")
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
      
      dh = "#{dh_prefix}_#{ajh.to_i}"
      
      if dh != $dh
        $dh = dh
        puts "select id from archive where dh = '#{dh}'"
        data = $conn.exec("select id from archive where dh = '#{dh}';")
      
        if data.count > 0 
          $archive_id = data[0]['id']
          yxqz = "#{mlh}\$#{flh}\$#{ajh}"  #ying xiang qian zui
          save2timage($archive_id, sxh, path, $dh, yxqz)
        else
          puts " *** Error: save2timage 0, #{sxh}, #{path}, #{dh}, #{yxqz}"
        end
            
      else
        yxqz = "#{mlh}\$#{flh}\$#{ajh}"  #ying xiang qian zui
        save2timage($archive_id, sxh, path, $dh, yxqz)
      end 
      
    end

  end
end

$conn.exec("update timage set yxmc=split_part(yxmc,'ml',1) || 'JN'|| split_part(yxmc,'ml', '2'), yxbh= split_part(yxbh,'ml',1) || 'JN'|| split_part(yxbh,'ml', '2')  where yxbh like '%ml0%';")
$conn.exec("update timage set meta_tz = 0 where yxbh like 'JN%' and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
$conn.exec("update timage set dh_prefix = split_part(dh, '_', 1) || '_' || split_part(dh, '_', 2)  ||  '_' || split_part(dh, '_', 3) where dh_prefix is null;")
$conn.close

#save2timage(archive_id, "ML00.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$ML00.jpg", dh, yxqz)

