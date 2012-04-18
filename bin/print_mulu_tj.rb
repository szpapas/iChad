#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

def save2timage(yxbh, path, dh, yx_prefix)
  yxdx=File.open(path).read.size
  edata=PGconn.escape_bytea(File.open(path).read) 
  yxmc="#{yx_prefix}_#{yxbh}"
  $conn.exec("delete from timage_tjtx where dh='#{dh}' and yxbh='#{yxbh}';")
  $conn.exec("insert into timage_tjtx (dh, yxmc, yxbh, yxdx, data) values ('#{dh}', '#{yxmc}', '#{yxbh}.jpg', #{yxdx}, E'#{edata}' );")
end

def update_timage(dh_prefix)
  $stderr.puts"更新 #{dh_prefix} ..."
  puts "update ML00..."
  $conn.exec"update timage_tj set smyx = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh similar to '[0..9]%') where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update MLBK..." 
  $conn.exec"update timage_tj set mlbk = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'MLBK%') where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update MLJN..."  
  $conn.exec"update timage_tj set mljn = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'ML%') - (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh similar to 'ML[BK|00].*') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JN00..."
  $conn.exec"update timage_tj set jn00 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'JN00%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JNBK..."  
  $conn.exec"update timage_tj set jnbk = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh like 'JNBK%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update JNJN..."  
  $conn.exec"update timage_tj set jnjn = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh SIMILAR TO 'JN[0123456789][123456789]%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update SMYX..."  
  $conn.exec"update timage_tj set smyx = (select count(*) from timage where timage.dh=timage_tj.dh and timage.yxbh SIMILAR TO '[0..9]%') where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update meta A4"
  $conn.exec"update timage_tj set A4 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz=0) where timage_tj.dh_prefix='#{dh_prefix}';"
  
  puts "update meta A3"
  $conn.exec"update timage_tj set A3 = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz=1) where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update meta 大图"
  $conn.exec"update timage_tj set DT = (select count(*) from timage where timage.dh=timage_tj.dh and timage.meta_tz=2) where timage_tj.dh_prefix='#{dh_prefix}';"

  puts "update 状态"

  $conn.exec("update timage_tj set zt=''   where dh_prefix='#{dh_prefix}';")
  $conn.exec("update timage_tj set zt='空卷' where  smyx = 0 and dh_prefix='#{dh_prefix}';")
  $conn.exec("update timage_tj set zt='缺页' where  smyx > 0  and smyx < ajys and dh_prefix='#{dh_prefix}';")
  $conn.exec("update timage_tj set zt='多页' where  smyx > 0  and smyx > ajys and dh_prefix='#{dh_prefix}';")
  
  $conn.exec("update timage_tj set jnts = (select count(*) from document  where document.dh=timage_tj.dh) where timage_tj.dh_prefix='#{dh_prefix}';")
  
end

def print_timage(dh_prefix)
  dh = dh_prefix
  ss = dh.split('-')
  qzh, dalb, mlh = ss[0], ss[1], ss[2]

  dateStr = Time.now.strftime("%Y 年 %m 月 %d 日")

  user = $conn.exec("select id, dwdm from d_dwdm where id = #{qzh};")
  dwdm = user[0]['dwdm']

  convert_str =  "convert ./dady/timage_tj.png -font ./dady/SimHei.ttf  -pointsize 44 -draw \"text 465, 208 '#{dwdm} 目录 #{mlh} 统计表'\"  -font ./dady/STZHONGS.ttf  -pointsize 26 -draw \"text 690, 260 '#{dateStr}'\" " 

  puts "select * from timage_tj where dh like '#{dh}-%' order by ajh;"
  user = $conn.exec("select * from timage_tj where dh like '#{dh}-%' order by ajh;")

  if user.count == 0 
    exit 1
  end
  
  pr_path="/share/tjsj"
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
        convert_str = convert_str + " /share/tjsj/timage_#{dh}_#{sxh}.png"
        puts "generate file  for #{k+1} : timage_#{dh}_#{sxh}.png"
        system convert_str

        puts " save to file  /share/tjsj/timage_#{dh}_#{sxh}.png"
        save2timage("#{sxh}.png", "/share/tjsj/timage_#{dh}_#{sxh}.png", dh, "timage_#{dh}")

      else
        convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill blue -draw \"text 110, #{y_pos+34.2} '#{os}' \"  " 
        convert_str = convert_str + " /share/tjsj/timage_#{dh}_#{sxh}.jpg"

        puts "generate file  for #{k+1} : timage_#{dh}_#{sxh}.jpg"
        
        system convert_str

        puts " save to file  /share/tjsj/timage_#{dh}_#{sxh}.jpg"
        save2timage("#{sxh}.jpg", "/share/tjsj/timage_#{dh}_#{sxh}.jpg", dh, "timage_#{dh}")

      end

      #new begining page
      convert_str =  "convert ./dady/timage_tj.png -font ./dady/SimHei.ttf  -pointsize 44 -fill black -draw \"text 465, 208 '#{dwdm} 目录 #{mlh} 统计表'\"  -font ./dady/STZHONGS.ttf  -pointsize 26 -draw \"text 690, 260 '#{dateStr}'\" " 
    end 
  
  end

  if ( (k % 50) > 0 && k > 1 )
    
    sxh = (k/50+1).to_s.rjust(2,'0')
    
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
      convert_str = convert_str + " /share/tjsj/timage_#{dh}_#{sxh}.png"
      system convert_str

      puts " save to file  /share/tjsj/timage_#{dh}_#{sxh}.png"
      save2timage("#{sxh}.png", "/share/tjsj/timage_#{dh}_#{sxh}.png", dh, "timage_#{dh}")
    else
      convert_str = convert_str + " -font ./dady/TextMate.ttf  -pointsize 23.5 -fill blue -draw \"text 194, 2140 '#{os}' \" -font ./dady/SimHei.ttf  -pointsize 24 -draw  \"text 150, 2140 '#{tj[0]}' \" "
      convert_str = convert_str + " /share/tjsj/timage_#{dh}_#{sxh}.jpg"
      system convert_str

      puts " save to file  /share/tjsj/timage_#{dh}_#{sxh}.jpg"
      save2timage("#{sxh}.jpg", "/share/tjsj/timage_#{dh}_#{sxh}.jpg", dh, "timage_#{dh}")
    end
    

  end   
end

def print_qly(qzh, dalb, mlh)
  datas = $conn.exec("select id, dh, dh_prefix zt timage_tj where zt='空卷' and dh = '#{qzh}-#{dalb}-#{mlh}';")
  puts "=== 空卷: #{qzh}-#{dalb}-#{mlh}..." if datas.count > 0
  for k in 0..datas.count-1
    data = datas[k]
    dh = data['dh']
    
    "select  timage_tj.dh, timage.yxmc from timage_tj inner join timage on timage_tj.dh=timage.dh where timage_tj.dh='4_10_10_61' limit 1;"
    puts "ruby ./dady/bin/import_image.rb #{qzh} #{mlh} #{dalb} /mnt/data1/TZ/#{mlh}/18\$E\$0041/ 41"
  end
  
  $conn.exec("update timage_tj set zt='缺页' where  smyx > 0  and smyx < ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
  $conn.exec("update timage_tj set zt='多页' where  smyx > 0  and smyx > ajys and dh like '#{qzh}_#{dalb}_#{mlh}_%';")
end  

def print_qzxx(dh_prefix)
  $stderr.puts" output 目录统计 #{dh_prefix}..."
  
  dh = dh_prefix
  ss = dh.split('_')
  qzh, dalb, mlh = ss[0], ss[1], ss[2]
  
  dd = $conn.exec("select * from q_qzxx where dh_prefix=#{dh_prefix};")[0]
  
  ajs = dd['zajh'].to_i - dd['qajh'].to_i + 1
  a3, a4, dt =  dd['a3'].to_i, dd['a4'].to_i, dd['dt'].to_i
  
  
  convert_str =  "convert ./dady/timage_tj2.png -font ./dady/TextMate.ttf  -pointsize 24 -draw \"text 580, 590 '#{dd['mlh']}' \" -draw \"text 810, 590 '#{dd['qajh']} ~ #{dd['qajh']}' \"  -draw \"text 290, 670 '#{ajs}' \"   -draw \"text 500, 730 '#{a3+a4}' \" -draw \"text 830, 730 '#{a3}' \"  -draw \"text 290, 800 '#{a4}' \"   -draw \"text 730, 800 '#{dt}' \"  /share/tjsj/tj_#{dh_prefix}.jpg  "
  
  system convert_str
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

dh = ARGV[0]

update_timage(dh)
print_timage(dh)

$conn.close
#puts "***** End At #{Time.now}====\n"