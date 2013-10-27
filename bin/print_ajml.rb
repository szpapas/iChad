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

puts strwhere
pdfsize=""
case (dalb) 
when "0"
	user = $conn.exec("select * from archive #{strwhere} order by ajh ;")
when "2"
	user = $conn.exec("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid #{strwhere} order by ajh ;")
when "3","5","6","7"
	user =$conn.exec("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid #{strwhere}  order by ajh ;")
when "15"
	user =$conn.exec("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid #{strwhere}  order by ajh ;")
 when "18"
	user = $conn.exec("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid #{strwhere}  order by ajh ;")
 when "25"
	user = $conn.exec("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid #{strwhere}  order by ajh ;")
 when "27"
	user = $conn.exec("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid #{strwhere} order by ajh ;")
 when "26"
	user = $conn.exec("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid #{strwhere}  order by ajh ;")
 when "28"
	user = $conn.exec("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxs from archive left join a_swda on archive.id=a_swda.ownerid #{strwhere}  order by ajh ;")
 when "29"
	user = $conn.exec("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdm from archive left join a_zlxx on archive.id=a_zlxx.ownerid #{strwhere}  order by ajh ;")
 when "30"
	user = $conn.exec("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid #{strwhere}  order by djh ;")
 when "31"
	user = $conn.exec("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid #{strwhere}  order by zt ;")
 when "32"
	user = $conn.exec("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid #{strwhere}  order by jgmc ;")
 when "33"
	user = $conn.exec("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid #{strwhere}   order by fsrq ;")
 when "34"
	user = $conn.exec("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid where #{strwhere}   order by sj ;")
 when "35"
	user = $conn.exec("select archive.*,a_kyq.* from archive left join a_kyq on archive.id=a_kyq.ownerid  #{strwhere}   order by ajh ;")

 when "24"
  #年度_机构问题号_保管期限  
   user = $conn.exec("select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   order by nd,bgqx,jgwth,jh ;")
 else
	 user = $conn.exec("select * from archive  #{strwhere} order by ajh ;")
end
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
  for k in 0..intys
    strfilename=""
    convertstr=""
    if k==intys
      intts=size.to_i-intys*10-1
    else
      intts=9
    end
    
    for i in 0..intts
      case (dalb)
      when "2"
        pdfsize=':at =>[-40,780], :width => 580, :height => 890'
        intwidth<<182
        intwidth<<347
        intwidth<<522
        intwidth<<665
        intwidth<<1696
        intwidth<<2001
        intwidth<<2154
        intwidth<<2301
        intwidth<<2626
        intwidth<<2940
        intwidth<<3081
        printfilename="ajml_cw.jpg"
        intheight= i*174+565
        puts intheight
        user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s
        if user[i+k*10]['flh']==''
          user[i+k*10]['flh']=' '
        end
        if user[i+k*10]['jnzs']==''
          user[i+k*10]['jnzs']=' '
        end
        if user[i+k*10]['fjzs']==''
          user[i+k*10]['fjzs']=' '
        end
        if user[i+k*10]['pzqh']==''
          user[i+k*10]['pzqh']=' '
        end
        if user[i+k*10]['pzzh']==''
          user[i+k*10]['pzzh']=' '
        end
        if user[i+k*10]['bgqx']==''
          user[i+k*10]['bgqx']=' '
        end
        user[i+k*10]['flh']=' ' if user[i+k*10]['flh'].nil?
        user[i+k*10]['jnzs']=' ' if user[i+k*10]['jnzs'].nil?
        user[i+k*10]['fjzs']=' ' if user[i+k*10]['fjzs'].nil?
        user[i+k*10]['pzqh']=' ' if user[i+k*10]['pzqh'].nil?
        user[i+k*10]['pzzh']=' ' if user[i+k*10]['pzzh'].nil?
        user[i+k*10]['bgqx']=' ' if user[i+k*10]['bgqx'].nil?
        if !(user[i+k*10]['pzqh'].nil?)
          pzqh=user[i+k*10]['pzqh']
        else
          pzqh=" "
        end
        if !(user[i+k*10]['flh'].nil?)
          flh=user[i+k*10]['flh']
        else
          flh=" "
        end
        if !(user[i+k*10]['jnzs'].nil?)
          jnzs=user[i+k*10]['jnzs']
        else
          jnzs=" "
        end
        if !(user[i+k*10]['fjzs'].nil?)
          fjzs=user[i+k*10]['fjzs']
        else
          fjzs=" "
        end
        if !(user[i+k*10]['pzzh'].nil?)
          pzzh=user[i+k*10]['pzzh']
        else
          pzzh=" "
        end
        if !(user[i+k*10]['bgqx'].nil?)
          bgqx=user[i+k*10]['bgqx']
        else
          bgqx=" "
        end
        
        convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{flh.center 5}'\"    -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"   -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{jnzs.center 4}'\" -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{fjzs.center 4}'\"  -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{pzqh.center 4}'\"  -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight} '#{pzzh.center 4}'\"  -pointsize 50  -draw \"text #{intwidth[9]}, #{intheight} '#{bgqx.center 4}'\"  "
        intheight1=0
        intheight1=intheight-40  
        if !(user[i+k*10]['qrq'].nil?)
          sj=user[i+k*10]['qrq'].split(' ')
          sj1=sj[0].split('-')
          qrq  =Time.mktime(sj1[0],sj1[1],sj1[2]).strftime("%Y%m%d")
        else
          qrq=''
        end
        if !(user[i+k*10]['zrq'].nil?)
          sj=user[i+k*10]['zrq'].split(' ')
          sj1=sj[0].split('-')
          zrq  =Time.mktime(sj1[0],sj1[1],sj1[2]).strftime("%Y%m%d")
        else
          zrq=''
        end       
        convertstr =convertstr + " -pointsize 40  -draw \"text #{intwidth[4]}, #{intheight1} '#{qrq}'\" "
        intheight1=0
        intheight1=intheight+45
        convertstr =convertstr + " -pointsize 40  -draw \"text #{intwidth[4]}, #{intheight1} '#{zrq}'\" "
        intheight=intheight-50
        if !(user[i+k*10]['tm'].nil?)
          tm=split_string(user[i+k*10]['tm'],19)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
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
      when "3"
        pdfsize=':at =>[-40,780], :width => 580, :height => 890'
        intwidth<<205
        intwidth<<398
        intwidth<<588
        intwidth<<745
        intwidth<<1175
        intwidth<<1930
        intwidth<<2470
        intwidth<<2640
        intwidth<<2795
        intwidth<<2927
        intwidth<<3110
        printfilename="ajml_tddj.jpg"
        #intheight= i*160+684
        intheight= i*177+589
        puts intheight
        user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s

        convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"    -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"   -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['nd']}'\" -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{user[i+k*10]['ys'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight} '#{user[i+k*10]['bgqx'].center 4}'\""
        intheight=intheight-60
        if !(user[i+k*10]['djh'].nil?)
          tm=split_string(user[i+k*10]['djh'],8)
          strtm=tm.split("\n")
          intheight1=0
          #for j in 0..strtm.length-1
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        puts tm
        if !(user[i+k*10]['qlrmc'].nil?)
          tm=split_string(user[i+k*10]['qlrmc'],15)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        if !(user[i+k*10]['tdzl'].nil?)
          puts tm
          tm=split_string(user[i+k*10]['tdzl'],10)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        if !(user[i+k*10]['bz'].nil?)
          puts tm
          tm=split_string(user[i+k*10]['bz'],3)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[9]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
       puts tm
       if !(user[i+k*10]['tdzh'].nil?)
         tm=split_string(user[i+k*10]['tdzh'],5)
         strtm=tm.split("\n")
         intheight1=0
         for j in 0..2
           intheight1=intheight+ j*50
           convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[10]}, #{intheight1} '#{strtm[j]}'\" "
         end
        end
        puts tm
      when "26"
        pdfsize=':at =>[-40,780], :width => 580, :height => 890'
        intwidth<<340
        intwidth<<539
        intwidth<<725
        intwidth<<887
        intwidth<<1505
        intwidth<<2428
        intwidth<<2604
        intwidth<<2751
        intwidth<<2885
        intwidth<<2927
        intwidth<<3110
        printfilename="ajml_jjda.jpg"
        #intheight= i*160+684
        intheight= i*160+688
        puts intheight
        user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s

        convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"    -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"   -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{user[i+k*10]['nd']}'\" -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['ys'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{user[i+k*10]['bgqx'].center 4}'\""
        intheight=intheight-60
        if !(user[i+k*10]['jsdw'].nil?)
          tm=split_string(user[i+k*10]['jsdw'],12)
          strtm=tm.split("\n")
          intheight1=0
          #for j in 0..strtm.length-1
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        puts tm
        if !(user[i+k*10]['xmmc'].nil?)
          tm=split_string(user[i+k*10]['xmmc'],18)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        if !(user[i+k*10]['bz'].nil?)
          puts tm
          tm=split_string(user[i+k*10]['bz'],9)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        puts tm
      when "35"
        pdfsize=':at =>[-40,780], :width => 580, :height => 890'
        intwidth<<205
        intwidth<<398
        intwidth<<588
        intwidth<<745
        intwidth<<908
        intwidth<<1239
        intwidth<<1694
        intwidth<<2455
        intwidth<<2895
        intwidth<<3055
        intwidth<<3207
        printfilename="ajml_kyq.jpg"
        #intheight= i*160+684
        intheight= i*177+589
        puts intheight
        user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s

        convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"    -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"   -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight} '#{user[i+k*10]['nd']}'\" -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight} '#{user[i+k*10]['ys'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[9]}, #{intheight} '#{user[i+k*10]['bgqx'].center 4}'\""
        intheight=intheight-60
        if !(user[i+k*10]['xxkz'].nil?)
          tm=split_string(user[i+k*10]['xxkz'],7)
          strtm=tm.split("\n")
          intheight1=0
          #for j in 0..strtm.length-1
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        puts tm
        if !(user[i+k*10]['kyqr'].nil?)
          tm=split_string(user[i+k*10]['kyqr'],9)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        if !(user[i+k*10]['kswz'].nil?)
          puts tm
          tm=split_string(user[i+k*10]['kswz'],15)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        if !(user[i+k*10]['ksmc'].nil?)
           tm=split_string(user[i+k*10]['ksmc'],8)
           strtm=tm.split("\n")
           intheight1=0
           for j in 0..2
             intheight1=intheight+ j*50
             convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight1} '#{strtm[j]}'\" "
           end
          end
        if !(user[i+k*10]['bz'].nil?)
          puts tm
          tm=split_string(user[i+k*10]['bz'],3)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[10]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
       puts tm
       
      when "24"
        intwidth<<304
        intwidth<<437
        intwidth<<672
        intwidth<<922
        intwidth<<1780
        intwidth<<1946
        intwidth<<2081
        
        printfilename="doc.jpg"
        intheight= i*251+830
        puts intheight
        user[i+k*10]['jh']=user[i+k*10]['jh'].to_i.to_s

        convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['jh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[5]}, #{intheight} '#{user[i+k*10]['ys'].center 5}'\"    "
        intheight=intheight-90
        if !(user[i+k*10]['zwrq'].nil?) 
            rq=user[i+k*10]['zwrq'].split(" ")
            year=rq[0].split("-")
            yr=year[1] + year[2]
         #  intheight1=intheight+ 30
         #  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[0]}'\" "
         #  intheight1=intheight+ 80
         #  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[1].center 6}'\" "
         #  intheight1=intheight+ 130
         #  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[2].center 6}'\" "
            
            intheight1=intheight+ 30
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[0].center 6}'\" "
            intheight1=intheight+ 90
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{yr.center 6}'\" "
        end
        if !(user[i+k*10]['zrr'].nil?)
          tm=split_string(user[i+k*10]['zrr'],4)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..4
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        puts tm
        if !(user[i+k*10]['wh'].nil?)
          tm=split_string(user[i+k*10]['wh'],4)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..4
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        if !(user[i+k*10]['tm'].nil?)
          puts tm
          tm=split_string(user[i+k*10]['tm'],17)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..4
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        convertstr =convertstr + " -pointsize 50  -draw \"text 318, 507 '年度：'\"  -pointsize 50  -draw \"text 475, 507 '#{user[i+k*10]['nd']}'\""
        convertstr =convertstr + " -pointsize 50  -draw \"text 1059, 507 '保管期限：'\"  -pointsize 50  -draw \"text 1300, 507 '#{user[i+k*10]['bgqx']}'\""
        convertstr =convertstr + " -pointsize 50  -draw \"text 1805, 507 '机构问题号：'\"  -pointsize 50  -draw \"text 2120, 507 '#{user[i+k*10]['jgwth']}'\""
      
      when "28"
        pdfsize=':at =>[-40,780], :width => 580, :height => 890'
        intwidth<<439
        intwidth<<639
        intwidth<<836
        intwidth<<1532
        intwidth<<1961
        intwidth<<2559
        intwidth<<2838
        intwidth<<3121
        intwidth<<255
              
        printfilename="ajml_sw.jpg"
        intheight= i*155+724
        puts intheight
        user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s
        if !(user[i+k*10]['sjsj'].nil?)
          sj=user[i+k*10]['sjsj'].split(' ')
          sj1=sj[0].split('-')
          sjsj  =Time.mktime(sj1[0],sj1[1],sj1[2]).strftime("%Y%m%d")
        else
          sjsj=''
        end
        #convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[8]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\"  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"  -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['bh'].center 5}'\"   -pointsize 50 -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['ztxs']}'\" -pointsize 50 -draw \"text #{intwidth[5]}, #{intheight} '#{sjsj}'\" "
        convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[8]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\"  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"  -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"    -pointsize 50 -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['ztxs']}'\" -pointsize 50 -draw \"text #{intwidth[5]}, #{intheight} '#{sjsj}'\" "
        intheight=intheight-60
        if !(user[i+k*10]['mc'].nil?)
          tm=split_string(user[i+k*10]['mc'],13)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..strtm.length-1
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        puts tm
        if !(user[i+k*10]['hjz'].nil?)
          tm=split_string(user[i+k*10]['hjz'],8)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..strtm.length-1
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        if !(user[i+k*10]['sjdw'].nil?)
          puts tm
          tm=split_string(user[i+k*10]['sjdw'],11)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..strtm.length-1
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
       puts tm
       
        if !(user[i+k*10]['bz'].nil?)
           tm=split_string(user[i+k*10]['bz'],5)
           strtm=tm.split("\n")
           intheight1=0
           for j in 0..strtm.length-1
             intheight1=intheight+ j*50
             convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight1} '#{strtm[j]}'\" "
           end
          end
        puts tm
      else
        pdfsize=':at =>[-40,780], :width => 580, :height => 890'
        intwidth<<248
        intwidth<<454
        intwidth<<662
        intwidth<<818
        intwidth<<2547
        intwidth<<2737
        intwidth<<2917
        intwidth<<3068
        printfilename="ajml.jpg"
        intheight= i*165+619
        puts intheight
        user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s

        convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"    -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"   -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{user[i+k*10]['nd']}'\" -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{user[i+k*10]['ys'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['bgqx'].center 4}'\""
        intheight=intheight-40
        puts convertstr
        if !(user[i+k*10]['tm'].nil?)
          tm=split_string(user[i+k*10]['tm'],34)
          strtm=tm.split("\n")
          intheight1=0
          for j in 0..2
            intheight1=intheight+ j*50
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
          end
        end
        if !(user[i+k*10]['bz'].nil?)
           tm=split_string(user[i+k*10]['bz'],6)
           strtm=tm.split("\n")
           intheight1=0
           for j in 0..2
             intheight1=intheight+ j*50
             convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight1} '#{strtm[j]}'\" "
           end
         end
      end
      
    end
    rq=Time.now.strftime("%Y%m%d%H%M%S")
    sj=rand(10000)       
    strfilename="./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".jpg"
    fn="./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
    puts strfilename
    puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
    system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")
    if dalb!='24'
      system("convert -rotate 90 #{strfilename} #{fn}")
    else
      system("mv #{strfilename} #{fn}")
    end
    if filenames==""
      fns="./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
      filenames="ajml" + k.to_s + rq.to_s + sj.to_s + ".jpg"
    else
      fns=fns + "," + "./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
      filenames=filenames + "," + "ajml" + k.to_s + rq.to_s + sj.to_s + ".jpg"
    end    
  end
  #pdf.save_as("./dady/tmp1/report1.pdf")
  if dalb!='24'
    files=fns.split(',')
    case dalb
    when "2"
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
    when "3"
      Prawn::Document.generate("./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf") do 
        for x in 0..files.length-1
          #image files[x],:at => [-20,740], :width => 580, :height => 780            
          image files[x], :at => [-40,770], :width => 600, :height => 800
          if x<files.length-1
            start_new_page
          end
        end
      end
    when "28"
      Prawn::Document.generate("./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf") do 
        for x in 0..files.length-1
          #image files[x],:at => [-20,740], :width => 580, :height => 780            
          image files[x], :at => [-20,740], :width => 580, :height => 780
          if x<files.length-1
            start_new_page
          end
        end
      end
    else
      Prawn::Document.generate("./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf") do 
        for x in 0..files.length-1
          #image files[x],:at => [-20,740], :width => 580, :height => 780            
          image files[x], :at => [-40,770], :width => 600, :height => 800
          if x<files.length-1
            start_new_page
          end
        end
      end
    end

  else
    files=fns.split(',')
    Prawn::Document.generate("./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf") do 
      for x in 0..files.length-1
        #image files[x],:at => [-20,740], :width => 580, :height => 780            
        image files[x], :at => [-40,770], :width => 600, :height => 800
        if x<files.length-1
          start_new_page
        end
      end
      #image fn,:at => [-20,740], :width => 580, :height => 780
    end
  end
  txt="success:" + "assets/dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf"
else            
  txt = "false:无此条件的数据，请重新输入条件。"
end
czlist = $conn.exec("update d_cz_list set czzt=1,fhz='#{txt}' where id=#{czid};")