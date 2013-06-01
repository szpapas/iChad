BASE_DIR="/usr/local/lib/ruby/gems/1.8/gems"
$: << '/usr/local/lib/ruby/gems/1.8/gems/prawn-0.12.0'
$:<< '/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib'

require 'prawn'
require 'pg'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
czid, dalb ,qzh,mlh,qajh,zajh,nd,jgwth,bgqx ,czlistid= ARGV[0], ARGV[1], ARGV[2],ARGV[3], ARGV[4], ARGV[5],ARGV[6], ARGV[7], ARGV[8], ARGV[9]
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

if zajh.length==4
  zajh=zajh
else
  zajh=sprintf("%04d",zajh)
end
if qajh.length==4
  qajh=qajh
else
  qajh=sprintf("%04d", qajh)
end
strwhere=" where mlh='#{mlh}' and qzh='#{qzh}' and dalb='#{dalb}' and ajh>='#{qajh}' and ajh<='#{zajh}'"
if (nd.nil? || nd=="")
else
  strwhere =strwhere + " and nd='#{nd}'"
end
if (bgqx.nil? || bgqx=="")
else
  strwhere =strwhere + " and bgqx='#{bgqx}'"
end
if dalb=="24"
  strwhere="where archive.qzh = '#{qzh}' and dalb ='#{dalb}' and a_wsda.nd='#{nd}' and a_wsda.jgwth='#{jgwth}' and a_wsda.bgqx='#{bgqx}' and a_wsda.jh>='#{qajh}' and a_wsda.jh<='#{zajh}'"
end

pdfsize=""
qksmwz=[]
case (dalb) 
 when "24"
  #年度_机构问题号_保管期限 		             
   user = $conn.exec("select ljr,ljsj,jcr,qksm,archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive , a_wsda,d_bkb    #{strwhere} and archive.id=a_wsda.ownerid and archive.id=d_bkb.ownerid        order by nd,bgqx,jgwth,jh ;")
 else
	 user = $conn.exec("select ljr,ljsj,jcr,qksm,archive.* from archive,d_bkb  #{strwhere} and d_bkb.ownerid=archive.id order by ajh ;")
end

filenames=""
intys=0
intts=0
intwidth=[]
size = user.count;
if size.to_i>0   
  for i in 0..size-1
    strfilename=""
    convertstr=""
    printfilename="bkb.jpg"
    user[i]['ajh']=user[i]['ajh'].to_i.to_s
    puts user[i]['ajh'].to_i.to_s            
   # if ajh_wz.size.to_i>0
   #   if ajh_wz[2]=='宋体'
   #     convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
   #   else
   #     convertstr=convertstr + " -font ./dady/SimHei.ttf"
   #   end
   #   convertstr=convertstr +" -pointsize #{ajh_wz[3]} -draw \"text #{ajh_wz[0]},#{ajh_wz[1]} '#{user[i]['ajh']}'\""
   # end 
   if !(user[i]['ljsj'].nil?)
       #rq=user[i]['ljsj'].strftime("%Y%m%d%H%M%S")
       rq=user[i]['ljsj'].split(" ")
       rq1=rq[0].split('-')
       rq2=rq1[0].to_s + rq1[1].to_s + rq1[2].to_s
   else
     rq2=''
   end
     puts rq
    convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 80 -draw \"text 1721, 2629 '#{user[i]['ljr']}'\" -pointsize 80 -draw \"text 1721, 2791 '#{user[i]['jcr']}'\"    -pointsize 80  -draw \"text 1721, 2929 '#{rq2}'\"     "       
    puts convertstr
    qksm='      ' + user[i]['qksm']
    tm=split_string(qksm,25)
    qksmwz<<238
    qksmwz<<897
    strtm=tm.split("\n")
    intheight=qksmwz[1].to_i
    intheight1=0
    for j in 0..strtm.length-1
      intheight1=intheight+ j*80
      convertstr =convertstr + " -pointsize 80  -draw \"text #{qksmwz[0]}, #{intheight1} '#{strtm[j]}'\" "
    end                         
    rq=Time.now.strftime("%Y%m%d%H%M%S")
    sj=rand(10000)
    strfilename="./dady/tmp1/bkb" + i.to_s + rq.to_s + sj.to_s + ".jpg"
    puts strfilename
    puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
    system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")
    
    if filenames==""
      filenames="bkb" + i.to_s+ rq.to_s + sj.to_s + ".jpg"
    else
      filenames=filenames + "," + "bkb" + i.to_s + rq.to_s + sj.to_s + ".jpg"
    end
  end
  #pdf.save_as("./dady/tmp1/report1.pdf")
  if filenames!=""        
      files=filenames.split(',')        
      Prawn::Document.generate("./dady/tmp1/bkb" + i.to_s + rq.to_s + sj.to_s + ".pdf",:page_size   => "A4",
       :page_layout => :portrait) do 
        for x in 0..files.length-1            
          image "./dady/tmp1/" + files[x], :at => [-40,800], :width => 600, :height => 800
          if x<files.length-1
            start_new_page(:size => "A4", :layout => :portrait)
          end
        end
      end
  end
  txt="success:" +"/assets/dady/tmp1/bkb" + i.to_s + rq.to_s + sj.to_s + ".pdf"
else            
  txt = "false:无此条件的数据，请重新输入条件。"
end
czlist = $conn.exec("update d_cz_list set czzt=1,fhz='#{txt}' where id=#{czid};")