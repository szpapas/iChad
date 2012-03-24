$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')


def save2timage(yxbh, path, dh, yx_prefix)
  yxdx=File.open(path).read.size
  edata=PGconn.escape_bytea(File.open(path).read) 
  yxmc="#{yx_prefix}_#{yxbh}.jpg"
  $conn.exec("delete from timage_tjtx where dh='#{dh}' and yxbh='#{yxbh}';")
  $conn.exec("insert into timage_tjtx (dh, yxmc, yxbh, yxdx, data) values ('#{dh}', '#{yxmc}', '#{yxbh}.jpg', #{yxdx}, E'#{edata}' );")
end


# ********************************************************************************************
#
#   main fucntions 
#
#    @qzh ---
#    @dalb ---
#    @mlh ---
#    
#
#*********************************************************************************************

qzh, dalb, mlh = ARGV[0], ARGV[1], ARGV[2] 

dh = "#{qzh}_#{dalb}_#{mlh}"
#puts  "=====Started At #{Time.now}===="

dateStr = Time.now.strftime("%Y 年 %m 月 %d 日")

user = $conn.exec("select id, dwdm from d_dwdm where id = #{qzh};")
dwdm = user[0]['dwdm']

convert_str =  "convert ./dady/timage_tj.png -font ./dady/SimHei.ttf  -pointsize 44 -draw \"text 465, 208 '#{dwdm} 目录 #{mlh} 统计表'\"  -font ./dady/STZHONGS.ttf  -pointsize 26 -draw \"text 690, 260 '#{dateStr}'\" " 

user = $conn.exec("select * from timage_tj where dh like '#{dh}_%' order by ajh;")

#xj, tj, xj_2, tj_2 = [], [], [], []
for k in 0..user.count-1 do
  dd = user[k]
  ajh, ajys, jnts, ml00, mljn, smyx, mlbk, jn00, jnjn, jnbk, a3, a4, dt, zt = dd['ajh'], dd['ajys'], dd['jnts'], dd['ml00'], dd['mljn'], dd['smyx'], dd['mlbk'], dd['jn00'], dd['jnjn'], dd['jnbk'], dd['a3'], dd['a4'], dd['dt'], dd['zt']
  
  if k == 0 
    tj =[ajh, ajys, jnts, ml00, mljn, smyx, mlbk, jn00, jnjn, jnbk, a3, a4, dt]
    for kk in 0..tj.size-1
      tj[kk] = tj[kk].to_i
    end
  else
    tj_2 =[ajh, ajys, jnts, ml00, mljn, smyx, mlbk, jn00, jnjn, jnbk, a3, a4, dt]
    for kk in 0..tj_2.size-1
      tj[kk] = tj[kk] + tj_2[kk].to_i
    end
  end   
    
  if (k % 50) == 0
    xj = [ajh, ajys, jnts, ml00, mljn, smyx, mlbk, jn00, jnjn, jnbk, a3, a4, dt]
    for kk in 0..xj.size-1
      xj[kk] = xj[kk].to_i
    end
  else 
    xj_2 =[ajh, ajys, jnts, ml00, mljn, smyx, mlbk, jn00, jnjn, jnbk, a3, a4, dt]
    for kk in 0..xj_2.size-1
      xj[kk] = xj[kk] + xj_2[kk].to_i
    end
  end    
  
  y_pos = 395 + 34.2*(k % 50)
  
  os = ajh.rjust(6," ") + ajys.rjust(6," ") + jnts.rjust(6," ") + ml00.rjust(6," ")  +  mljn.rjust(6," ") + smyx.rjust(6," ") + mlbk.rjust(6," ") + jn00.rjust(6," ")  + jnjn.rjust(6," ") + jnbk.rjust(6," ") + a3.rjust(6," ") + a4.rjust(6," ") + dt.rjust(6," ")
  
  if zt != '' 
    convert_str =  convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill red -draw \"text 110, #{y_pos} '#{os}' \" -font ./dady/STZHONGS.ttf -draw \"text 1250, #{y_pos-2}  #{zt} \" "
  else 
    convert_str =  convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill black -draw \"text 110, #{y_pos} '#{os}' \" -font ./dady/STZHONGS.ttf -draw \"text 1250, #{y_pos-2}  #{zt} \" "
  end 
  
  if ((k % 50) == 49)
    puts "enter here : #{k}..."
    for kk in 0..xj.size-1 
      xj[kk] = xj[kk].to_s
    end
    
    xj[0] = "小计"
    os = xj[0].rjust(10," ") + xj[1].rjust(6," ") + xj[2].rjust(6," ") + xj[3].rjust(6," ")  +  xj[4].rjust(6," ") + xj[5].rjust(6," ") + xj[6].rjust(6," ") + xj[7].rjust(6," ")  + xj[7].rjust(6," ") + xj[8].rjust(6," ") + xj[9].rjust(6," ") + xj[10].rjust(6," ") + xj[11].rjust(6," ")
    convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill black -draw \"text 110, #{y_pos+34.2} '#{os}' \"  " 
    convert_str = convert_str + " /share/timage_#{qzh}_#{dalb}_#{mlh}_#{k/50}.jpg"
    puts "generate file  for #{k+1} : timage_#{dh}_#{k/50}.jpg"
    system convert_str
    puts " save to file  /share/timage_#{dh}_#{k/50}.jpg"
    save2timage("#{k/50}", "/share/timage_#{dh}_#{k/50}.jpg", dh, "timage_#{dh}")

    #new begining page
    convert_str =  "convert ./dady/timage_tj.png -font ./dady/SimHei.ttf  -pointsize 44 -fill black -draw \"text 465, 208 '#{dwdm} 目录 #{mlh} 统计表'\"  -font ./dady/STZHONGS.ttf  -pointsize 26 -draw \"text 690, 260 '#{dateStr}'\" " 
  end 
  
end

if ( (k % 50) > 0 && k > 1 )
  for kk in 0..xj.size-1 
    xj[kk] = xj[kk].to_s
  end
  xj[0] = '小计'
  os = xj[1].rjust(6," ") + xj[2].rjust(6," ") + xj[3].rjust(6," ")  +  xj[4].rjust(6," ") + xj[5].rjust(6," ") + xj[6].rjust(6," ") + xj[7].rjust(6," ")   + xj[8].rjust(6," ") + xj[9].rjust(6," ") + xj[10].rjust(6," ") + xj[11].rjust(6," ") +  xj[12].rjust(6," ")
  convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill blue -draw \"text 194, #{y_pos+34.2} '#{os}' \" -font ./dady/SimHei.ttf  -pointsize 24 -draw  \"text 150, #{y_pos+34.2} '#{xj[0]}' \" "

  for kk in 0..tj.size-1 
    tj[kk] = tj[kk].to_s
  end
  
  tj[0] = '合计'
  os = tj[1].rjust(6," ") + tj[2].rjust(6," ") + tj[3].rjust(6," ")  +  tj[4].rjust(6," ") + tj[5].rjust(6," ") + tj[6].rjust(6," ") + tj[7].rjust(6," ")   + xj[8].rjust(6," ") + xj[9].rjust(6," ") + xj[10].rjust(6," ") + xj[11].rjust(6," ") + tj[12].rjust(6," ")
  convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill blue -draw \"text 194, 2140 '#{os}' \" -font ./dady/SimHei.ttf  -pointsize 24 -draw  \"text 150, 2140 '#{tj[0]}' \" "
  
  convert_str = convert_str + " /share/timage_#{dh}_#{k/50}.jpg"
  system convert_str
  
  puts " save to file  /share/timage_#{dh}_#{k/50}.jpg"
  save2timage("#{k/50}", "/share/timage_#{dh}_#{k/50}.jpg", dh, "timage_#{dh}")
end   

$conn.close
#puts "***** End At #{Time.now}====\n"