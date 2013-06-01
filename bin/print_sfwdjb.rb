BASE_DIR="/usr/local/lib/ruby/gems/1.8/gems"
$: << '/usr/local/lib/ruby/gems/1.8/gems/prawn-0.12.0'
$:<< '/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib'

require 'prawn'
require 'pg'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
czid, dalb = ARGV[0], ARGV[1]
#list=$conn.exec("select * from d_cz_list where id=#{czid};")
#if list.count>0
#  strwhere=list[0]['strwhere']
#end

def split_string(text, length=16)
  
  char_array = text.unpack("U*")
  intl=0
  t1=""
  for k in 0..char_array.length-1
    if intl>=length*3-4
      t1=t1 + char_array[k..k].pack("U*") +"\n"
      intl=0
    else
      t1=t1+ char_array[k..k].pack("U*")
      if char_array[k]<255
        intl=intl+2
      else
        intl=intl+3
      end
    end
  end
  t=t1.split("\n")
  puts  t1
  puts t
  t1=""
  for i in 0..t.length-1
    t[i]=t[i].gsub('"', '\"')
    t[i]=t[i].gsub("'", "\'")
    puts t[i].to_s
    if t1==""
      t1=t[i].to_s
    else
      t1=t1.to_s + "\n" + t[i].to_s
    end
  end
  return t1    
end
cxtj=$conn.exec(" select * from  d_cz_list where id=#{czid};")
strwhere=cxtj[0]['strwhere'].gsub("#","'")
user = $conn.exec(" #{strwhere}  ;")
filenames=""
intys=0
intts=0
intwidth=[]
size = user.count;
if size.to_i>0 
  intys=(size.to_i/10).to_i
  if intys==size.to_i/10.to_f
    intys=intys-1
  end
  #pdf.save_as("./dady/tmp1/report1.pdf")
  for k in 0..intys
    strfilename=""
    convertstr=""
    if k==intys
      intts=size.to_i-intys*10-1
    else
      intts=9
    end

    for i in 0..intts
      puts dalb
      case dalb.to_i
        when 2
          pdfsize=':at =>[-40,780], :width => 580, :height => 890'
          intwidth<<185
          intwidth<<398
          intwidth<<565
          intwidth<<897
          intwidth<<1175
          intwidth<<2187
          intwidth<<2376
          intwidth<<2539
          intwidth<<2833
          intwidth<<3108
          intwidth<<3110
          printfilename="ajml_swdjb.jpg"
          intheight= i*177+589
          puts intheight
          user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s
          convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[5]}, #{intheight} '#{user[i+k*10]['mj'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['fs'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['swbh'].center 5}'\" "
          if !(user[i+k*10]['swrq'].nil?) 
            rq=user[i+k*10]['swrq'].split(" ")
            year=rq[0].split("-")
            yr=year[1]+year[2]
            intheight1=intheight- 30
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight1} '#{year[0].center 6}'\" "
            intheight1=intheight+ 20
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight1} '#{yr.center 6}'\" "
          end
          intheight=intheight-60
          if !(user[i+k*10]['wh'].nil?)
            tm=split_string(user[i+k*10]['wh'],6)
            strtm=tm.split("\n")
            intheight1=0
            for j in 0..2
              intheight1=intheight+ j*50
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight1} '#{strtm[j]}'\" "
            end
          end
          if !(user[i+k*10]['lwjg'].nil?)
            tm=split_string(user[i+k*10]['lwjg'],5)
            strtm=tm.split("\n")
            intheight1=0
            for j in 0..2
              intheight1=intheight+ j*50
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
            end
          end
          if !(user[i+k*10]['tm'].nil?)
            puts tm
            tm=split_string(user[i+k*10]['tm'],19)
            strtm=tm.split("\n")
            intheight1=0
            for j in 0..2
              intheight1=intheight+ j*50
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{strtm[j]}'\" "
            end
          end
          if !(user[i+k*10]['blqk'].nil?)
            puts tm
            tm=split_string(user[i+k*10]['blqk'],5)
            strtm=tm.split("\n")
            intheight1=0
            for j in 0..2
              intheight1=intheight+ j*50
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight1} '#{strtm[j]}'\" "
            end
          end
          if !(user[i+k*10]['szqm'].nil?)
           tm=split_string(user[i+k*10]['szqm'],5)
           strtm=tm.split("\n")
           intheight1=0
           for j in 0..2
             intheight1=intheight+ j*50
             convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight1} '#{strtm[j]}'\" "
           end
          end
          if !(user[i+k*10]['bz'].nil?)
           tm=split_string(user[i+k*10]['bz'],5)
           strtm=tm.split("\n")
           intheight1=0
           for j in 0..2
             intheight1=intheight+ j*50
             convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[9]}, #{intheight1} '#{strtm[j]}'\" "
           end
          end
        else
          pdfsize=':at =>[-40,780], :width => 580, :height => 890'
          intwidth<<185
          intwidth<<398
          intwidth<<565
          intwidth<<897
          intwidth<<1175
          intwidth<<2071
          intwidth<<2225
          intwidth<<2365
          intwidth<<2610
          intwidth<<2855
          intwidth<<3098
          intwidth<<3110
          printfilename="ajml_fwdjb.jpg"
          intheight= i*177+589
          puts intheight
          user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s
          convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[5]}, #{intheight} '#{user[i+k*10]['mj'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['dyfs'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['fwbh'].center 5}'\" "
          if !(user[i+k*10]['fwrq'].nil?) 
            rq=user[i+k*10]['fwrq'].split(" ")
            year=rq[0].split("-")
            yr=year[1]+year[2]
            intheight1=intheight- 30
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight1} '#{year[0].center 6}'\" "
            intheight1=intheight+ 20
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight1} '#{yr.center 6}'\" "
          end
          intheight=intheight-60
          if !(user[i+k*10]['wh'].nil?)
            tm=split_string(user[i+k*10]['wh'],6)
            strtm=tm.split("\n")
            intheight1=0
            for j in 0..2
              intheight1=intheight+ j*50
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight1} '#{strtm[j]}'\" "
            end
          end
          if !(user[i+k*10]['zrz'].nil?)
            tm=split_string(user[i+k*10]['zrz'],5)
            strtm=tm.split("\n")
            intheight1=0
            for j in 0..2
              intheight1=intheight+ j*50
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
            end
          end
          if !(user[i+k*10]['tm'].nil?)
            puts tm
            tm=split_string(user[i+k*10]['tm'],16)
            strtm=tm.split("\n")
            intheight1=0
            for j in 0..2
              intheight1=intheight+ j*50
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{strtm[j]}'\" "
            end
          end
          if !(user[i+k*10]['zsdw'].nil?)
            puts tm
            tm=split_string(user[i+k*10]['zsdw'],5)
            strtm=tm.split("\n")
            intheight1=0
            for j in 0..2
              intheight1=intheight+ j*50
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight1} '#{strtm[j]}'\" "
            end
          end
          if !(user[i+k*10]['cbdw'].nil?)
           tm=split_string(user[i+k*10]['cbdw'],5)
           strtm=tm.split("\n")
           intheight1=0
           for j in 0..2
             intheight1=intheight+ j*50
             convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight1} '#{strtm[j]}'\" "
           end
          end
          if !(user[i+k*10]['xfdw'].nil?)
           tm=split_string(user[i+k*10]['xfdw'],5)
           strtm=tm.split("\n")
           intheight1=0
           for j in 0..2
             intheight1=intheight+ j*50
             convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[9]}, #{intheight1} '#{strtm[j]}'\" "
           end
          end
          if !(user[i+k*10]['bz'].nil?)
           tm=split_string(user[i+k*10]['bz'],5)
           strtm=tm.split("\n")
           intheight1=0
           for j in 0..2
             intheight1=intheight+ j*50
             convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[10]}, #{intheight1} '#{strtm[j]}'\" "
           end
          end 
      end                
    end
    rq=Time.now.strftime("%Y%m%d%H%M%S")
    sj=rand(10000)       
    strfilename="./dady/tmp1/sfbdjb" + k.to_s + rq.to_s + sj.to_s + ".jpg"
    fn="./dady/tmp1/sfbdjb" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
    puts strfilename
    puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
    system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")
    system("convert -rotate 90 #{strfilename} #{fn}")

    if filenames==""
      fns="./dady/tmp1/sfbdjb" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
      filenames="sfbdjb" + k.to_s + rq.to_s + sj.to_s + ".jpg"
    else
      fns=fns + "," + "./dady/tmp1/sfbdjb" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
      filenames=filenames + "," + "sfbdjb" + k.to_s + rq.to_s + sj.to_s + ".jpg"
    end
  end

  files=fns.split(',')
  case dalb.to_i
    when 2
      Prawn::Document.generate("./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf") do 
        for x in 0..files.length-1
          #image files[x],:at => [-20,740], :width => 580, :height => 780            
          #image files[x], :at =>[-40,780], :width => 580, :height => 890
          image files[x], :at => [-40,750], :width => 600, :height => 800
          if x<files.length-1
            start_new_page
          end
        end
      end
    when 3
      Prawn::Document.generate("./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf") do  
        for x in 0..files.length-1
          #image files[x],:at => [-20,740], :width => 580, :height => 780            
          #image files[x], :at =>[-40,780], :width => 580, :height => 890
          image files[x], :at => [-40,750], :width => 600, :height => 800
          if x<files.length-1
            start_new_page
          end
        end
      end             
  end            
  txt="success:" + "assets/dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf"          
else
  txt = "没有数据，请重新查询后再打印"
end


czlist = $conn.exec("update d_cz_list set czzt=1,fhz='#{txt}' where id=#{czid};")