#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'find'

# ********************************************************************************************
#
#   main fucntions 
#
#    @ARGV[0] --- 文件名及路径   @ARGV[1] --- 档号   @ARGV[2] --- dh_prefix
#   ruby ./MyRails/iChad/dady/bin/import_image_file.rb ./MyRails/iChad/dady/image_1.jpg 1-1-1-1 1-1-1 
#    ruby import_iamge_file.rb   /share/1/1_1/filename.jpg  1_1_1_1 1-1-1  
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

dh_prefix, filename, dh = ARGV[2], ARGV[0], ARGV[1]
ss = dh_prefix.split('-')
qzh,dalb,mlh = ss[0],ss[1],ss[2]

t1 = Time.now
puts "===Import images of  #{dh_prefix} begin at #{t1} ==="


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

def save2timage(filename,dh,dh_prefix)
  fo = File.open(filename).read
  if fo.size == 0
    $stderr.puts(" *** Import Image: #{path}  file size is zero.")
    return 
  end
  puts filename
  meta_tz = 0   
  pixels = 0   
  width =0 
  height=0
  if (filename.include?'jpg') ||  (filename.include?'JPG')  || (filename.upcase.include?'JPEG')
    si = fo.index("\377\300")
    
    if si.nil?
      $stderr.puts(" *** Import Image: #{filename}  corrupt image file.")
      #return
    end
    #width, height = fo[si+5].to_i*256+fo[si+6].to_i,fo[si+7].to_i*256+fo[si+8].to_i
    
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
        wh = getimgsize(filename).split(",")
        width, height = wh[0].to_i, wh[1].to_i
        pixels = width * height
      end  
      if !meta.nil?
        mm = meta.split("\;")
        if mm.size > 5 && meta.size < 100
          meta=mm[0..5].join("\;")[2..-1] 
          meta_tz =mm[2].to_i
        else
          $stderr.puts "Tags error: #{filename}"
          meta, meta_tz = "", 0
        end   
      else
         meta, meta_tz = "", 0
      end 
    end
    
  elsif (filename.include?'TIF') || (filename.include?'tif')  || (filename.upcase.include?'TIFF')
    meta = ""
    wh = getimgsize(filename).split(",")
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
  pp = filename.split("\/")
  file_title = pp[pp.size-1]
  yxmc=pp[pp.size-1]
  yxbh=pp[pp.size-1]
  puts "delete from timage where dh = '#{dh}' and yxbh ='#{yxbh}';"  
  $conn.exec("delete from timage where dh = '#{dh}' and yxbh ='#{yxbh}';")
  #puts "insert file: #{path}  size: #{width}, #{height}  meta: #{meta_tz}   ... "
  puts "insert into timage (width, height,dh, yxmc, yxbh, yxdx, meta, meta_tz, pixel,dh_prefix,sfzs) values ('#{width}', '#{height}','#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx},  '#{meta}', #{meta_tz}, #{pixels}, '#{dh_prefix}',1);"
  $conn.exec("insert into timage (width, height,dh, yxmc, yxbh, yxdx, data, meta, meta_tz, pixel,dh_prefix,sfzs) values ('#{width}', '#{height}','#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' , '#{meta}', #{meta_tz}, #{pixels}, '#{dh_prefix}',1);")
end

#filename.downcase 转成小写
puts filename.upcase
if (filename.upcase.include?'JPG') || (filename.upcase.include?'TIF') || (filename.upcase.include?'TIFF') || (filename.upcase.include?'JPEG') || (filename.upcase.include?'XLS') || (filename.upcase.include?'XLSX') || (filename.upcase.include?'DOC') || (filename.upcase.include?'DOCX') || (filename.upcase.include?'PDF') || (filename.upcase.include?'CEB')
  puts (filename.upcase.include?'JPG')
  save2timage(filename,dh,dh_prefix)
else
  if (filename.upcase.include?'RAR') || (filename.upcase.include?'ZIP')
    file=filename.split('/')
    filen=file[file.length-1].split('.')
    puts filen
    system("rm -rf ./dady/sc/#{filen[0]}")
    puts "rm -rf ./dady/sc/#{filen[0]}"
    system("mkdir -p ./dady/sc/#{filen[0]}")
    if (filename.upcase.include?'RAR')
      system("unrar x #{filename} ./dady/sc/#{filen[0]}  ")
    else
      puts "unzip -o -d ./dady/sc/#{filen[0]}  #{filename} "
      system("unzip -o -d ./dady/sc/#{filen[0]}  #{filename} ")
    end
    path1="./dady/sc/#{filen[0]}"
    puts path1
    Find.find(path1) do |path|
      if FileTest.directory?(path)
        if File.basename(path)[0] == ?.
          #Find.prune       # Don't look any further into this directory.
        else
          next
        end
      else
        puts filename
        puts (filename.upcase.include?'JPEG')
        if (path.upcase.include?'JPG') || (path.upcase.include?'TIF') || (path.upcase.include?'TIFF') || (path.upcase.include?'JPEG') || (path.upcase.include?'DOC') || (path.upcase.include?'XLS') || (path.upcase.include?'XLSX') || (path.upcase.include?'DOCX') || (filename.upcase.include?'PDF') || (filename.upcase.include?'CEB')
          puts path
          save2timage(path,dh,dh_prefix)
        end
      end
    end
  end
end

$conn.close

puts "=== Total time is #{Time.now-t1} seconds"
