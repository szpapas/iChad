#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'find'

# ********************************************************************************************
#
#   main fucntions 
#
#    @ARGV[0] --- 
#   
#    ruby import_iamge.rb 11-10-3 /share/1/1_1/ 15 
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

def get_tag(yxbh)
  tag = 2
  if !/(ML00|JN00)\..*/.match(yxbh).nil?
    tag = 0
  elsif !/(ML\d+|JN\d+)\..*/.match(yxbh).nil?
    tag = 1
  elsif !/(MLBK|JNBK)\..*/.match(yxbh).nil?
    tag = 3 
  end
  tag
end  

def save2timage(yxbh, path, dh, yx_prefix)
  fo = File.open(path).read
  #puts "yxdx: #{fo.size}"
  
  if fo.size == 0
    $stderr.puts(" *** Import Image: #{path}  file size is zero.")
    return 
  end
  
  if  fo[128..167] == "                                        "
     fo = fo[168..-1]
  end
  
  infile = rand(36**6).to_s(36)
  outfile = rand(36**6).to_s(36)
  ff=File.open(infile, 'wb')
  ff.write(fo)
  ff.close
  
  if (yxbh.include?'jpg') ||  (yxbh.include?'JPG')  

    si = fo.index("\377\300")
    if si.nil?
      $stderr.puts(" *** Import Image: #{path}  corrupt image file.")
      return
    end
    metas = /(sm\w+:\s+\w+;\d*;\d*;\d*;\d*;\d*)/.match(fo)
    
    if metas.nil?
      $stderr.puts "Tags error: #{path}"
      meta, meta_tz = "", 0
    else
      meta = metas[1]
      mm = meta.split("\;")
      meta_tz =mm[2].to_i
    end 

    wh = getimgsize(infile).split(",")
    width, height = wh[0].to_i, wh[1].to_i
    pixels = width * height
    
  elsif (yxbh.include?'TIF') || (yxbh.include?'tif') 
    meta = ""
    puts "getimgsize #{infile}"

    wh = getimgsize(infile).split(",")  #decrypted file
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
  
  system("encrypt #{infile} #{outfile}")
  fo = File.open(outfile).read

  yxdx = fo.size
  edata=PGconn.escape_bytea(fo)
  yxmc="#{yx_prefix}\$#{yxbh}"
  #puts "insert file: #{path}  size: #{width}, #{height}  meta: #{meta}   ... "
  
  tag = get_tag(yxbh)
  #puts "insert into timage (dh, yxmc, yxbh, yxdx, data, meta, meta_tz, pixel, width, height, tag, jm_tag) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{meta}', #{meta_tz}, #{pixels}, #{width}, #{height}, #{tag}, 1);"
  $conn.exec("delete from timage where dh='#{dh}' and yxbh='#{yxbh}';")
  $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data, meta, meta_tz, pixel, width, height, tag, jm_tag) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' , E'#{meta}', #{meta_tz}, #{pixels}, #{width}, #{height}, #{tag}, 1);")
  
  system("rm #{infile} #{outfile}")
  
end


def set_qzml (qzh)
  $qzml_mlh={}
  tsml = $conn.exec("select * from qzml_key where qzh='#{qzh}' order by id ;")
  for k in 0..tsml.count - 1 
    dd = tsml[k]
    key = "#{dd['qzh']}-#{dd['dalb']}-#{dd['mlm']}"
    $qzml_mlh[key] = dd['id']
  end
end

def get_qzml(qzh, dalb, mlm)
  key = "#{qzh}-#{dalb}-#{mlm}"
  if $qzml_mlh[key].nil?
    $conn.exec("insert into qzml_key(qzh, dalb, mlm) values('#{qzh}','#{dalb}','#{mlm}');")
    set_qzml(qzh)
  end 
  $qzml_mlh[key]   
end

$qzml_mlh = {}
set_qzml (qzh)


$dh, $archive_id = '', 0
Find.find(path) do |path|
  if FileTest.directory?(path)
    if File.basename(path)[0] == ?.
    else
      next
    end
  else
    #/Volumes/新加卷/C-82/C-82$C$0017/C-82$C$0017$MLBK.jpg
    if (path.include?'jpg') || (path.include?'TIF') || (path.include?'tif') || (path.include?'JPG')
      #./ws2010/长期$2010$0003$001/0002.jpg
      puts path
     if !/(长期|永久|短期|定期-10年|定期-30年)\$(\d+)\$(\d+)\$(\d+)/.match(path).nil?
        mm = /(\d+).(jpg|tif)$/i.match(path)
        sxh = "#{mm[1]}.#{mm[2]}"
        
        ss = /(长期|永久|短期|定期-10年|定期-30年)\$(\d+)\$(\d+)\$(\d+)/.match(path)
        nd, bgqx, ajh, jgwth = ss[2], ss[1], ss[3], ss[4]
  
        $dh = "#{dh_prefix}-#{ajh.to_i}"
        yxqz = "#{bgqx}\$#{nd}\$#{ajh.rjust(4, '0')}\$#{jgwth}"  
        
        puts "save2timage (#{sxh}, #{path}, #{$dh}, #{yxqz})" 
        save2timage(sxh, path, $dh, yxqz)

      elsif !/(\w+-\d+|\d+)\$(\w+)\$(\d+)\$(.*)\.(\w+)/.match(path).nil?
        pp = path.split("\/")
        ss = pp[pp.size-1].split("$")

        mlm,flh,ajh,sxh = ss[0], ss[1],ss[2],ss[3].gsub("ML","JN")
        mlh = get_qzml(qzh, dalb, mlm) 

        #C-82$C$0017$MLBK.jpg
        sp = pp[pp.size-2].split("$")
        if (ss[2] != sp[2]) 
          $stderr.puts(" *** Import Image: #{path} Wrong file on different 目录.")
          ajh = sp[2]
          dh = "#{dh_prefix}-#{ajh.to_i}"
          if dh != $dh
            $dh = dh
            $stderr.puts "processing #{dh}... "
          end
          yxqz = "#{mlm}\$#{flh}\$#{ajh}"  #ying xiang qian zui
          save2timage(sxh, path, $dh, yxqz)
        else
          dh = "#{dh_prefix}-#{ajh.to_i}"
          if dh != $dh
            $dh = dh
            $stderr.puts "processing #{dh}... "
          end
          yxqz = "#{mlm}\$#{flh}\$#{ajh}"  #ying xiang qian zui
          save2timage(sxh, path, $dh, yxqz)
        end
      elsif !/(\w+-\d+|\d+)\$(\w+)\$(\d+)\/(.*)/.match(path).nil?  #for format like  /mnt/lvm1/jm2012/89/89$C$0355/00000001.TIF
        
        ss = /(\w+-\d+|\d+)\$(\w+)\$(\d+)\/(.*)/.match(path)
        mlm,flh,ajh,sxh = ss[1], ss[2],ss[3],ss[4][4..-1]
        mlh = get_qzml(qzh, dalb, mlm) 
        
        dh = "#{dh_prefix}-#{ajh.to_i}"
        if dh != $dh
          $dh = dh
          $stderr.puts "processing #{dh}... "
        end
        yxqz = "#{mlm}\$#{flh}\$#{ajh}"  #ying xiang qian zui
        save2timage(sxh, path, $dh, yxqz)
        
      else
        $stderr.puts(" *** Import Image: #{path} Format error.")
      end
        
    end
  end
end

$conn.exec("update timage set dh_prefix = split_part(dh, '-', 1) || '-' || split_part(dh, '-', 2)  ||  '-' || split_part(dh, '-', 3) where dh_prefix is null;")
$conn.close

system("ruby ./dady/bin/update_qzxx_tj.rb #{dh_prefix}")

puts "=== Total time is #{Time.now-t1} seconds"
