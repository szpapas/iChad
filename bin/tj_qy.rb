#!/usr/bin/ruby
#统计影像文件缺重页情况
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'find'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
pr_path="/share/tj_qcy"
if !File.exists?(pr_path)
  system("mkdir -p #{pr_path}")
end
dh_prefix=""
filename=""
list=$conn.exec("select * from timage_tj where ((zt='缺页' and  ajys-smyx>1) or (zt='多页' and smyx-ajys>1)) and (not dh_prefix like '9-24-%')  order by dh ;") 
ff = File.open(pr_path + "/wx_qcy.txt" ,'w+')
for j in 0..list.count-1
  #if dh_prefix!=list[j]['dh_prefix']
    #filename=list[j]['dh_prefix'] + ".txt"  
    #puts dh_prefix
    #puts filename
    #if dh_prefix!="" 
      #ff.close
    #end
    #dh_prefix=list[j]['dh_prefix']
    
    #ff = File.open( filename,'w+')
  #end  
  
  tjimage=$conn.exec("select yxbh,dh from timage where dh='#{list[j]['dh']}' order by yxbh;")
  intAjh=1
      
    for xx in 0..tjimage.count-1
      yxbh=tjimage[xx]['yxbh'].split('.')  
      if yxbh[0].to_i.to_s.rjust(4,"0")==yxbh[0]
        strAjh = yxbh[0].to_i                  
        if intAjh<strAjh
          puts "intAjh:" + intAjh.to_s + ";strAjh:" + strAjh.to_s          
          while intAjh!=strAjh
            puts intAjh
            ff.write(tjimage[xx]["dh"].to_s + ";" + intAjh.to_s + ";缺页"  + "\n" )
            intAjh=intAjh +1
          end
          intAjh=intAjh +1
        else 
          if intAjh>strAjh
            ff.write(tjimage[xx]["dh"].to_s + ";" + strAjh.to_s + ";重页"  + "\n" )
            #intAjh=intAjh +1
          else 
            if intAjh==strAjh
              intAjh=intAjh +1
            end
          end
        end
      end
    end
    
        #   i=0
        #   j=1
        #   while i!=j
        #     i=j
        #     puts "1"
        #   end       
  
end
ff.close
