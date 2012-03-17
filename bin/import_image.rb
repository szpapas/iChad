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

qzh, mlh, dalb, path = ARGV[0], ARGV[1], ARGV[2], ARGV[3]

#/assets/dady/#{mlh}\$#{flh}\$#{ajh}\$ML01.jpg   => dh, yxmc, yxbh, yxdx, data
def save2timage(id, yxbh, path, dh, yx_prefix)
  #user=$conn.exec("select mlh,flh,ajh,dh from archive where id=#{id};")
  
  #yxdx=File.open(path).read.size
  #edata=PGconn.escape_bytea(File.open(path).read) 
  fo = File.open(path).read
  
  if yxbh.include?'jpg'  
    si = fo.index("\377\300")
    width, height = fo[si+5].to_i*256+fo[si+6].to_i,fo[si+7].to_i*256+fo[si+8].to_i
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
      meta_tz = meta.split("\;")[2].to_i 
    end
  
  elsif yxbh.include?'TIF'
    meta = ""
    width, height = fo[31].to_i*256+fo[30].to_i,fo[43].to_i*256+fo[40].to_i
    pixels = width * height
    if pixels > 6000000
     meta_tz = 2
    elsif pixels > 4000000
     meta_tz = 1
    else
     meta_tz = 0    
    end
  end
  
  yxdx = fo.size
  edata=PGconn.escape_bytea(fo)
      
  #yxmc="#{mlh}\$#{flh}\$#{ajh}\$#{yxbh}"
  yxmc="#{yx_prefix}\$#{yxbh}"
  #puts "insert file: #{path}..."
  puts "insert file: #{path}  size: #{width}, #{height} ..."
  $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data, meta, meta_tz, pixel) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' , '#{meta}', #{meta_tz}, #{pixels});")
  
  #count = $conn.exec("select count(*) from timage where dh='#{dh}' and yxbh='#{yxbh}';")[0]['count']
  #
  #if count.to_i > 0 
  #  $conn.exec("update timage set yxdx = #{yxdx}, data= E'#{edata}' where dh='#{dh}' and yxbh='#{yxbh}';")
  #else
  #  $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' );")
  #end
end


$dh, $archive_id = '', 0
Find.find(path) do |path|
  #puts path
  if FileTest.directory?(path)
    if File.basename(path)[0] == ?.
      #Find.prune       # Don't look any further into this directory.
    else
      next
    end
  else
    if (path.include?'jpg') || (path.include?'TIF')
      pp = path.split("\/")
      file_title = pp[pp.size-1]
      ss = pp[pp.size-1].split("$")
      mlh,flh,ajh,sxh = ss[0],ss[1],ss[2],ss[3].gsub("ML","JN")
      
      dh = "#{qzh}_#{dalb}_#{mlh}_#{ajh.to_i}"
      
      if dh != $dh
        $dh = dh
        puts "select id from archive where dh = '#{dh}'"
        data = $conn.exec("select id from archive where dh = '#{dh}';")
      
        if data.count > 0 
          $archive_id = data[0]['id']
          yxqz = "#{mlh}\$#{flh}\$#{ajh}"  #ying xiang qian zui
          save2timage($archive_id, sxh, path, $dh, yxqz)
        else
          puts "Error: save2timage 0, #{sxh}, #{path}, #{dh}, #{yxqz}"
        end
            
      else
        yxqz = "#{mlh}\$#{flh}\$#{ajh}"  #ying xiang qian zui
        save2timage($archive_id, sxh, path, $dh, yxqz)
      end 
      
      #if data.count > 0
      #  puts "insert file: #{path}..."
      #  yxqz = "#{mlh}\$#{flh}\$#{ajh}"  #ying xiang qian zui
      #  archive_id = data[0]['id']
      #  #puts ("save2timage(#{archive_id}, #{sxh}, #{path}, #{dh}, #{yxqz})")
      #  save2timage(archive_id, sxh, path, dh, yxqz)
      #else   
      #  puts "Error: save2timage 0, #{sxh}, #{path}, #{dh}, #{yxqz}"
      #end
      
    end

  end
end

#save2timage(archive_id, "ML00.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$ML00.jpg", dh, yxqz)

