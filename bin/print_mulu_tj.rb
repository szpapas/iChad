$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

def save2timage(yxbh, path, dh, yx_prefix)
  yxdx=File.open(path).read.size
  edata=PGconn.escape_bytea(File.open(path).read) 
  yxmc="#{yx_prefix}_#{yxbh}"
  $conn.exec("delete from timage_tjtx where dh='#{dh}' and yxbh='#{yxbh}';")
  $conn.exec("insert into timage_tjtx (dh, yxmc, yxbh, yxdx, data) values ('#{dh}', '#{yxmc}', '#{yxbh}.jpg', #{yxdx}, E'#{edata}' );")
end

def update_timage(qzh, dalb, mlh)
  $conn.exec("delete from timage_tj where dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  archives = $conn.exec("select distinct dh,ajh, ys from archive where dh like '#{qzh}_#{dalb}_#{mlh}_%' order by ajh;")
  
  puts "prepare basic info for qz:#{qzh}, mlh:#{mlh}..."
  for k in 0..archives.count-1
    ar = archives[k]
    dh_prefix = ar['dh'].split('_')[0..2].join('_')
    $conn.exec("insert into timage_tj(dh, ajh, ajys, dh_prefix) values ('#{ar['dh']}','#{ar['ajh']}', #{ar['ys']}, '#{dh_prefix}');")
  end
  
  puts "update ML00..."
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh like 'ML00%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set ml00=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end   
  
  puts "update MLBK..."  
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh like 'MLBK%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set mlbk=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end   
  
  puts "update MLJN..."  
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh SIMILAR TO 'ML[0123456789][123456789]%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set mljn=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update JN00..."
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh like 'JN00%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set jn00=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end   
  
  puts "update JNBK..."  
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh like 'JNBK%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set jnbk=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end   
  
  puts "update JNJN..."  
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh SIMILAR TO 'JN[0123456789][123456789]%' group by dh"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set jnjn=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update SMYX..."  
  puts "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  yxbh SIMILAR TO '[0..9]%' group by dh;"
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}%' and  yxbh SIMILAR TO '[0..9]%' group by dh;"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set smyx=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end

  puts "update meta A4"
  
  puts "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  meta_tz = 0 group by dh;"
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}%' and  meta_tz = 0  group by dh;"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set A4=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update meta A3"
  puts "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  meta_tz = 1 group by dh;"
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}%' and  meta_tz = 1  group by dh;"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set A3=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update meta 大图"
  puts "select dh, count(*) from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%' and  meta_tz = 2 group by dh;"
  cc = $conn.exec "select dh, count(*) from timage where dh like '#{qzh}%' and  meta_tz = 2  group by dh;"
  for k in 0..cc.count-1 
    $conn.exec("update timage_tj set DT=#{cc[k]['count']} where dh='#{cc[k]['dh']}';")
  end
  
  puts "update 状态"
  
  $conn.exec("update timage_tj set zt='空卷'  where  smyx = 0 and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  $conn.exec("update timage_tj set zt='缺页' where  smyx > 0  and smyx < ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  $conn.exec("update timage_tj set zt='多页' where  smyx > 0  and smyx > ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  #$conn.exec("update timage_tj set zt='漏页' where  smyx > 0  and smyx > ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  
  $conn.exec("update timage_tj set jnts = (select count(*) from document  where document.dh=timage_tj.dh) where timage_tj.dh like '#{qzh}_#{dalb}_#{mlh}_%' ;")
  
end 

def print_timage(qzh, dalb, mlh)
  dh = "#{qzh}_#{dalb}_#{mlh}"

  dateStr = Time.now.strftime("%Y 年 %m 月 %d 日")

  user = $conn.exec("select id, dwdm from d_dwdm where id = #{qzh};")
  dwdm = user[0]['dwdm']

  convert_str =  "convert ./dady/timage_tj.png -font ./dady/SimHei.ttf  -pointsize 44 -draw \"text 465, 208 '#{dwdm} 目录 #{mlh} 统计表'\"  -font ./dady/STZHONGS.ttf  -pointsize 26 -draw \"text 690, 260 '#{dateStr}'\" " 

  puts "select * from timage_tj where dh like '#{dh}_%' order by ajh;"
  user = $conn.exec("select * from timage_tj where dh like '#{dh}_%' order by ajh;")

  if user.count == 0 
    exit 1
  end
  
  pr_path="/share/tjsj/#{mlh}"
  if !File.exists?(pr_path)
    system("mkdir -p #{pr_path}")
  end  
    
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
  
    os = ajh.rjust(6," ") + ajys.rjust(6," ") + jnts.rjust(6," ") + ml00.rjust(6," ")  +  mljn.rjust(6," ") + smyx.rjust(6," ") + mlbk.rjust(6," ") + jn00.rjust(6," ")  + jnjn.rjust(6," ") + jnbk.rjust(6," ") + a4.rjust(6," ") + a3.rjust(6," ") + dt.rjust(6," ") 

  
    if !zt.nil?
      if zt=='多页'  
        convert_str =  convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill red -draw \"text 110, #{y_pos} '#{os}' \" -font ./dady/STZHONGS.ttf -draw \"text 1250, #{y_pos-2}  '#{zt}' \" "
      elsif zt=='缺页'
        convert_str =  convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill blue -draw \"text 110, #{y_pos} '#{os}' \" -font ./dady/STZHONGS.ttf -draw \"text 1250, #{y_pos-2}  '#{zt}' \" "
      else
        convert_str =  convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill purple -draw \"text 110, #{y_pos} '#{os}' \" -font ./dady/STZHONGS.ttf -draw \"text 1250, #{y_pos-2}  '#{zt}' \" "
      end    
    else 
      convert_str =  convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill black -draw \"text 110, #{y_pos} '#{os}' \" "
    end 
  
    if ((k % 50) == 49)
      for kk in 0..xj.size-1 
        xj[kk] = xj[kk].to_s
      end
    
      xj[0] = "小计"
      os = xj[0].rjust(10," ") + xj[1].rjust(6," ") + xj[2].rjust(6," ") + xj[3].rjust(6," ")  +  xj[4].rjust(6," ") + xj[5].rjust(6," ") + xj[6].rjust(6," ") + xj[7].rjust(6," ") + xj[8].rjust(6," ")  + xj[9].rjust(6," ") + xj[11].rjust(6," ") + xj[10].rjust(6," ") + xj[12].rjust(6," ")
      
      sxh = (k/50+1).to_s.rjust(2,'0')
      
      if xj[1] != xj[5]
        convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill red -draw \"text 110, #{y_pos+34.2} '#{os}' \"  " 
        convert_str = convert_str + " /share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.png"
        puts "generate file  for #{k+1} : timage_#{dh}_#{sxh}.png"
        system convert_str

        puts " save to file  /share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.png"
        save2timage("#{sxh}.png", "/share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.png", dh, "timage_#{dh}")

      else
        convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill blue -draw \"text 110, #{y_pos+34.2} '#{os}' \"  " 
        convert_str = convert_str + " /share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.jpg"

        puts "generate file  for #{k+1} : timage_#{dh}_#{sxh}.jpg"
        
        system convert_str

        puts " save to file  /share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.jpg"
        save2timage("#{sxh}.jpg", "/share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.jpg", dh, "timage_#{dh}")

      end
      

      #new begining page
      convert_str =  "convert ./dady/timage_tj.png -font ./dady/SimHei.ttf  -pointsize 44 -fill black -draw \"text 465, 208 '#{dwdm} 目录 #{mlh} 统计表'\"  -font ./dady/STZHONGS.ttf  -pointsize 26 -draw \"text 690, 260 '#{dateStr}'\" " 
    end 
  
  end

  if ( (k % 50) > 0 && k > 1 )
    for kk in 0..xj.size-1 
      xj[kk] = xj[kk].to_s
    end
    xj[0] = '小计'
    os = xj[1].rjust(6," ") + xj[2].rjust(6," ") + xj[3].rjust(6," ")  +  xj[4].rjust(6," ") + xj[5].rjust(6," ") + xj[6].rjust(6," ") + xj[7].rjust(6," ")   + xj[8].rjust(6," ") + xj[9].rjust(6," ") + xj[11].rjust(6," ") + xj[10].rjust(6," ") +  xj[12].rjust(6," ")
    
    if xj[1] != xj[5]
      convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill red -draw \"text 194, #{y_pos+34.2} '#{os}' \" -font ./dady/SimHei.ttf  -pointsize 24 -draw  \"text 150, #{y_pos+34.2} '#{xj[0]}' \" "
    else
      convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill blue -draw \"text 194, #{y_pos+34.2} '#{os}' \" -font ./dady/SimHei.ttf  -pointsize 24 -draw  \"text 150, #{y_pos+34.2} '#{xj[0]}' \" "
    end
  
    for kk in 0..tj.size-1 
      tj[kk] = tj[kk].to_s
    end
  
    tj[0] = '合计'
    os = tj[1].rjust(7," ") + tj[2].rjust(6," ") + tj[3].rjust(6," ")  +  tj[4].rjust(6," ") + tj[5].rjust(6," ") + tj[6].rjust(6," ") + tj[7].rjust(6," ")   + tj[8].rjust(6," ") + tj[9].rjust(6," ") + tj[11].rjust(6," ") + tj[10].rjust(6," ") + tj[12].rjust(6," ")
 
    if tj[1] != tj[5]
      convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill red -draw \"text 194, 2140 '#{os}' \" -font ./dady/SimHei.ttf  -pointsize 24 -draw  \"text 150, 2140 '#{tj[0]}' \" "
      convert_str = convert_str + " /share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.png"
      system convert_str

      puts " save to file  /share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.png"
      save2timage("#{sxh}.png", "/share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.png", dh, "timage_#{dh}")
    else
      convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill blue -draw \"text 194, 2140 '#{os}' \" -font ./dady/SimHei.ttf  -pointsize 24 -draw  \"text 150, 2140 '#{tj[0]}' \" "
      convert_str = convert_str + " /share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.jpg"
      system convert_str

      puts " save to file  /share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.jpg"
      save2timage("#{sxh}.jpg", "/share/tjsj/#{mlh}/timage_#{dh}_#{sxh}.jpg", dh, "timage_#{dh}")
    end
    

  end   
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

update_timage(qzh, dalb, mlh)
print_timage(qzh, dalb, mlh)

$conn.close
#puts "***** End At #{Time.now}====\n"