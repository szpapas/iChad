#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'find'

# ********************************************************************************************
#
#   main fucntions 
#
#    @ARGV[0] --- 文件名及路径  
#   ruby ./MyRails/iChad/dady/bin/program_updata.rb updata.zip
#     
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

filename= ARGV[0]



#filename.downcase 转成小写
puts filename.upcase

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
        puts path
        filenamehz=path.split('.')
        puts filenamehz[filenamehz.length-1]
        filename1=path.split('/')
        puts filename1[filename1.length-1]
        case (filenamehz[filenamehz.length-1].upcase) 
          when "JPG"            
            system(" scp #{path} ./dady/")
          when "JS"
            system(" scp #{path} ./app/assets/javascripts/desktop/")  
          when "RB"
            if filename1[filename1.length-1]=='desktop_controller.rb' || filename1[filename1.length-1]=='map_controller.rb'
              system(" scp #{path} ./app/controllers/")  
            else
              system(" scp #{path} ./bin/")
            end
        end
      end
    end

  end


$conn.close


