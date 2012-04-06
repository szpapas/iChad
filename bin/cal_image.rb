#!/usr/bin/ruby
require 'find'

# ********************************************************************************************
#
#   main fucntions 
#
#    @ARGV[0] --- 
#   
#    ruby cal_image.rb 1 1 0 /share/1/1_1/ 
#*********************************************************************************************
t1 = Time.now

path, qzh, dalb = ARGV[0], ARGV[1], ARGV[2]

Find.find(path) do |path|
  #puts path
  if FileTest.directory?(path)
    if File.basename(path)[0] == ?.
      #Find.prune       # Don't look any further into this directory.
    else
      next
    end
  else
    if path.include?'jpg'
      pp = path.split("\/")
      file_title = pp[pp.size-1]
      ss = pp[pp.size-1].split("$")
      mlh,flh,ajh,sxh = ss[0],ss[1],ss[2],ss[3].gsub("ML","JN")
      
      fo = File.open(path).read(2000)
      
      #meta = fo[0..100].split("\377\333")[0].split("\'")[1]
      
      si = fo.index("\377\300")
      height, width = fo[si+5].to_i*256+fo[si+6].to_i,fo[si+7].to_i*256+fo[si+8].to_i
      
      yxqz = "#{qzh}_#{dalb}_#{mlh}" 
      puts "update timage set pixel=#{height*width} where dh='#{yxqz}_#{ajh.to_i}' and yxbh='#{sxh}'; "

      #puts "porcess #{path}, #{mlh}, #{flh}, #{ajh}, #{height}, #{width}, meta : #{meta}"
     
      
    elsif path.include?'TIF'
      
      pp = path.split("\/")
      file_title = pp[pp.size-1]
      ss = pp[pp.size-1].split("$")
      mlh,flh,ajh,sxh = ss[0],ss[1],ss[2],ss[3].gsub("ML","JN")
      
      fo = File.open(path).read(2000)
      
      #meta = fo[0..100].split("\377\333")[0].split("\'")[1]
      #mata = ""
      
      #si = fo.index("\377\300")
      height, width = fo[31].to_i*256+fo[30].to_i,fo[43].to_i*256+fo[40].to_i
      
      #puts "porcess #{path}, #{mlh}, #{flh}, #{ajh}, #{height}, #{width}, meta : #{meta}, pixes : #{height*width}"
      yxqz = "#{qzh}_#{dalb}_#{mlh}" 
      puts "update timage set pixel=#{height*width} where dh='#{yxqz}_#{ajh.to_i}' and yxbh='#{sxh}'; "
    
    end
    
  end
end

#save2timage(archive_id, "ML00.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$ML00.jpg", dh, yxqz)

