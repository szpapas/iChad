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
#    ruby import_iamge.rb 1 1 0 /share/1/1_1/ 
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

dh_prefix, path, ajh = ARGV[0], ARGV[1], ARGV[2]
ss = dh_prefix.split('-')
qzh,dalb,mlh = ss[0],ss[1],ss[2]

t1 = Time.now
puts "===Import images of  #{dh_prefix} begin at #{t1} ==="

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
  #puts "insert file: #{path}  size: #{width}, #{height}  meta: #{meta_tz}   ... "
  
  tag = get_tag(yxbh)

  $conn.exec("delete from timage where dh='#{dh}' and yxbh='#{yxbh}';")
  $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data, meta, meta_tz, pixel, width, height, tag) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' , E'#{meta}', #{meta_tz}, #{pixels}, #{width}, #{height}, #{tag});")
  
  system("rm #{infile} #{outfile}")
  
end

def get_mlh(qx, nd, jg)
  qq = ["永久", "长期", "短期", "定期-10年" ,"定期-30年" ]
  mlh = 8000+(nd-2000)*50 + jg*5 + qq.index(qx)
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
      #./ws2010/长期$2010$0003$001/0002.jpg
      
      if !/(.*)\/(.*)\$(.*)\$(.*)\$(.*)\/(.*)/.match(path).nil?
        ss = /(.*)\/(.*)\$(.*)\$(.*)\$(.*)\/(.*)/.match(path)
        #1.	./ws2010
        #2.	长期
        #3.	2010
        #4.	0003
        #5.	001
        #6.	0002.jpg

        qq = ["永久", "长期", "短期", "定期-10年" ,"定期-30年" ]
        mlh = 8000+(ss[3].to_i-2000)*50 + ss[5].to_i*5 + qq.index(ss[2])
        dh  = "#{qzh}-#{dalb}-#{mlh}-#{ss[4].to_i}-#{ss[5].to_i}"

        if dh != $dh
          $dh = dh
          $stderr.puts "processing #{dh}... "
        end
        yxqz = "#{ss[3]}\$#{ss[4]}\$#{ss[5]}" 
        sxh = ss[6]
        
        save2timage(sxh, path, $dh, yxqz)
        next
      end
      
      if /(\d+)\$\w+\$(\d+)\$(....)\.\w+/.match(path).nil?
        $stderr.puts(" *** Import Image: #{path} Format error.")
        next
      end
      
      pp = path.split("\/")
      #file_title = pp[pp.size-1]
      ss = pp[pp.size-1].split("$")
      mlh,flh,ajh,sxh = ss[0],ss[1],ss[2],ss[3].gsub("ML","JN")
      
      #/mnt/lh/jm1/13/13$F$0172/  13$F$0171$MLBK.jpg
      #/mnt/wx/n/393/393$C$1924/393$C$1934$0006.jpg
      sp = pp[pp.size-2].split("$")
      if (ss[2] != sp[2]) 
        $stderr.puts(" *** Import Image: #{path} Wrong file on different 目录.")
        ajh = sp[2]
        dh = "#{dh_prefix}-#{ajh.to_i}"
        if dh != $dh
          $dh = dh
          $stderr.puts "processing #{dh}... "
        end
        #$stderr.puts("Import Image: #{path} ... ")
        yxqz = "#{mlh}\$#{flh}\$#{ajh}"  #ying xiang qian zui
        save2timage(sxh, path, $dh, yxqz)
      else
        dh = "#{dh_prefix}-#{ajh.to_i}"
        if dh != $dh
          $dh = dh
          $stderr.puts "processing #{dh}... "
        end
        #$stderr.puts("Import Image: #{path} ... ")
        yxqz = "#{mlh}\$#{flh}\$#{ajh}"  #ying xiang qian zui
        save2timage(sxh, path, $dh, yxqz)
      end  
    end
  end
end

$conn.exec("update timage set dh_prefix = split_part(dh, '-', 1) || '-' || split_part(dh, '-', 2)  ||  '-' || split_part(dh, '-', 3) where dh_prefix is null;")
$conn.close

system("ruby ./dady/bin/update_qzxx_tj.rb #{dh_prefix}")

puts "=== Total time is #{Time.now-t1} seconds"
