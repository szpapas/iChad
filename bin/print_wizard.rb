#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

#qzh, mlh, dalb, qajh, zajh, dylb = params['qzh'], params['mlh'], params['dalb'], params['qajh'], params['zajh'], params['dylb']

# ********************************************************************************************
#
#   split_string (archive_id, print_option = 0x1101)
#   flstr  (dalb)
#   save2timage(yxbh, path, dh, yx_prefix)
#   
#*********************************************************************************************

#Print Helper funtion
def bk_name(dalb)
  if dalb.to_i == 0 
    ['杨建', '王宏喜']
  elsif dalb.to_i == 14
    ['王鹏','朱兵']
  else
    ['张宁','庞佑林']  
  end       
end


# ********************************************************************************************
#
#   split_string (archive_id, print_option = 0x1101)
#   flstr  (dalb)
#   
#*********************************************************************************************

#Print Helper funtion
def split_string(text, length=16)
  char_array = text.unpack("U*")
  if char_array.size > length
    t1 = char_array[0..length-1].pack("U*")
    t2 = char_array[length..-1].pack("U*")
    return "#{t1}\n#{split_string(t2, length)}"
  else 
    return text
  end    
end

def flstr(dalb)
  case dalb
  when 0
    text = "综 合 档 案 类"
  when 2
    text = "计 划 财 务 类"
  when 3
    text = "土 地 登 记 类"
  when 4
    text = "地 籍 管 理 类"
  when 10
    text = "建 设 用 地 类"
  when 14
    text = "监  察  类"
  when 15
    text = "声  像  类"
  when 17
    text = "土地利用规划类"
  when 19
    text = "科技信息类"
  when 21
    text = "地 质 矿 产 类"
  when 24
    text = "文 书 档 案 类"  
  end
  text         
end
 
#/assets/dady/#{mlh}\$#{flh}\$#{ajh}\$ML01.jpg   => dh, yxmc, yxbh, yxdx, data
def save2timage(yxbh, path, dh, yx_prefix)
  #user=$conn.exec("select mlh,flh,ajh,dh from archive where id=#{id};")
  fo = File.open(path).read
  yxdx=fo.size
  edata=PGconn.escape_bytea(fo) 

  yxmc="#{yx_prefix}\$#{yxbh}"
  
  $conn.exec("delete from timage where dh='#{dh}' and yxbh='#{yxbh}';")
  $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data) values ('#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' );")
    
end


# ********************************************************************************************
#
#   generate_single_archive (archive_id, print_option = 0x1101)
#
#   @id  --- archive id   
#   @print_option --- 打印类别, 1111 封面， 备考， 内页， 卷内
#
#   
#*********************************************************************************************

#对单个目录进行生成，缺省不生成扫描的页面。
def generate_single_archive(archive_id, print_option=0b1101)
  user = $conn.exec("select * from archive where id=#{archive_id};")
  data = user[0]
  mlh,flh,ajh,js,ys,dh= data['mlh'], data['flh'][0..0], data['ajh'], data['js'], data['ys'].to_i,data['dh']
  yxqz = "#{mlh}\$#{flh}\$#{ajh}"

  #如果已经打印过就不需要打印了，除非标记重新打印。 0b1001
  dyzt=data['dyzt'].to_i 
  
  # generate fm  
  if (print_option & 0b1000) > 0 && (dyzt & 0b1000) == 0
    if data['dalb'].to_i == 3

      fl_str = flstr(data['dalb'].to_i)
      image_t = "image_d"
      
      puts "select * from a_tddj where dh='#{data['dh']}';"
      tddj = $conn.exec("select * from a_tddj where dh='#{data['dh']}';")

      #titles=split_string(tddj[0]['tdzl']).gsub("  ","\n") 

      ss = tddj[0]['tdzl'].split(/  \s*/)
      for k in 0..ss.size-1 do 
        ss[k] = split_string(ss[k]).gsub("\"", "\\\"")
      end
      titles=ss.join("\n") 
      
    
      $tt = titles.split("\n")
      tt_str = ""
      if $tt.size > 1 
        for kk in 0..$tt.size-1 do 
          pos2 = 2000-100*(1-kk)
          tt_str = tt_str + " -draw  \"text 1000, #{pos2} '#{$tt[kk]}'\""
        end
      else
        tt_str = tt_str + " -draw  \"text 1000, 1950 '#{tddj[0]['tdzl']}'\"" 
      end
    
      tt_str =  "-draw  \"text 1000, 1450 '#{tddj[0]['djh']}'\"  -draw \"text 1000, 1700 '#{tddj[0]['qlrmc']}'\"  #{tt_str} "
    
      dd1, dd2 = data['qny'], data['zny']    
      convert_str =  "convert ./dady/#{image_t}.jpg -font ./dady/STZHONGS.ttf  -pointsize 180 -draw \"text 550, 550 '#{data['dwdm']}'\" -pointsize 160 -draw \"text 800, 970 '#{fl_str}'\"  -font ./dady/SimHei.ttf  -pointsize 80 #{tt_str} -pointsize 70  -draw \"text 300, 2675 '自 #{dd1[0..3]} 年 #{dd1[4..5]} 月 至 #{dd2[0..3]} 年 #{dd2[4..5]} 月'\"  -draw \"text 1950, 2675 '#{data['bgqx']}'\"    -draw \"text 300, 2900 '    本卷共  #{data['js']}  件  #{data['ys']}  页'\"  -pointsize 96 -draw \"text 1950, 2675 '#{data['mj']}'\"   -pointsize 50 -draw \"text 1750, 3225 '#{mlh}'\"  -draw \"text 1950, 3225 '#{flh}'\"  -draw \"text 2150, 3225 '#{ajh.to_i}'\"  ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML00.jpg" 
      
      system convert_str
      save2timage("ML00.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$ML00.jpg", dh, yxqz)
      puts ("1 ====generate ML ===")
      system("rm ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML00.jpg")
  
    else 
      fl_str = flstr(data['dalb'].to_i)
      
      ss = data['tm'].split(/  \s*/)
      for k in 0..ss.size-1 do 
        ss[k] = split_string(ss[k]).gsub("\"", "\\\"")
      end
      titles=ss.join("\n") 
  
      tt = titles.split("\n")
      image_t = "image_1"
      tt_str = ""
      if tt.size > 1 
        for kk in 0..tt.size-1 do 
          pos2 = 1600-150*(1-kk)
          tt_str = tt_str + " -draw  \"text 500, #{pos2} '#{tt[kk]}'\""
        end
      else
        tt_str = tt_str + " -draw  \"text 500, 1450 '#{data['tm']}'\""  
      end

      dd1, dd2 = data['qny'], data['zny']    
      convert_str =  "convert ./dady/#{image_t}.jpg -font ./dady/STZHONGS.ttf  -pointsize 180 -draw \"text 550, 550 '#{data['dwdm']}'\" -pointsize 160 -draw \"text 800, 970 '#{fl_str}'\"  -font ./dady/SimHei.ttf  -pointsize 96 #{tt_str}  -pointsize 70  -draw \"text 300, 2675 '自 #{dd1[0..3]} 年 #{dd1[4..5]} 月 至 #{dd2[0..3]} 年 #{dd2[4..5]} 月'\"  -draw \"text 1950, 2675 '#{data['bgqx']}'\"    -draw \"text 300, 2900 '    本卷共  #{data['js']}  件  #{data['ys']}  页'\"  -pointsize 96 -draw \"text 1950, 2675 '#{data['mj']}'\"   -pointsize 50 -draw \"text 1750, 3225 '#{mlh}'\"  -draw \"text 1950, 3225 '#{flh}'\"  -draw \"text 2150, 3225 '#{ajh.to_i}'\"  ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML00.jpg" 
      system convert_str
      save2timage("ML00.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$ML00.jpg", dh, yxqz)
      puts ("1. ====generate ML ===")
      system("rm ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML00.jpg")
    end
  end

  # generate bk
  if (print_option & 0b0001) > 0 && (dyzt & 0b0001) == 0
    
    ss = bk_name(data['dalb'])

    image_t = "image_3"
    year, month = data['qny'][0..3].succ, data['qny'][4..5]
    convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/TextMate.ttf -pointsize 46 -draw \"text 1200, 1770 '#{ss[0]}'\" -draw \"text 1200, 1850 '#{ss[1]}'\"  -draw \"text 1200, 1940 '#{year}年#{month}月'\" ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$MLBK.jpg " 
    puts ("2 ====generate BK ===")
    system convert_str
    save2timage("MLBK.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$MLBK.jpg", dh, yxqz)
    system("rm ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$MLBK.jpg")
  end
  
  #generate sm
  if (print_option & 0b0010) > 0 && (dyzt & 0b0010) == 0
    image_t = "image_b"
    for k in 0..ys-1
      page = (k+1).to_s.rjust(4,"0")
      convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/SimHei.ttf -pointsize 150  -draw \"text 600, 600 '#{data['dh']}:#{page}' \" ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$#{page}.jpg " 
      #puts (convert_str)
      puts ("3 ====generate SM ===")
      system convert_str
      save2timage("#{page}.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$#{page}.jpg", dh, yxqz)
      system ("rm ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$#{page}.jpg")
    end
  end
  
  # generate jn
  if (print_option & 0b0100) > 0 && (dyzt & 0b0100) == 0
  
    pos_yy = 700
    image_t = "image_2"

    docs = $conn.exec("select * from document where ownerid = #{archive_id} order by sxh;")

    for k in 0..docs.count-1
      $out_str = "-draw \"text 200, 250 'A  #{ajh}'\"   -draw \"text 200, 300 'M  #{mlh}'\" " if (docs[k]['sxh'].to_i % 10) == 1 
      $pos_y = pos_yy + ((docs[k]['sxh'].to_i - 1) % 10) * 260

      wh_str = ""
      titles=split_string(docs[k]['wh'], 7) 
      $tt = titles.split("\n")
      if $tt.size > 1 
        for kk in 0..$tt.size-1 do 
          pos2 = $pos_y-60*(1-kk)
          wh_str = wh_str + " -draw \"text 330, #{pos2} '#{$tt[kk]}'\""
        end
      else
        wh_str = wh_str + " -draw  \"text 330, #{$pos_y} '#{docs[k]['wh']}'\""
      end

      zrz_str = ""
      titles=split_string(docs[k]['zrz'], 4) 
      $tt = titles.split("\n")
      if $tt.size > 1 
        for kk in 0..$tt.size-1 do 
         pos2 = $pos_y-60*(1-kk)
         zrz_str = zrz_str + " -draw \"text 600, #{pos2} '#{$tt[kk]}'\""
        end
      else
        zrz_str = zrz_str + " -draw  \"text 600, #{$pos_y} '#{docs[k]['zrz']}'\""
      end

      tt_str = ""
      titles=split_string(docs[k]['tm']) 
      $tt = titles.split("\n")
      if $tt.size > 1 
        for kk in 0..$tt.size-1 do 
          pos2 = $pos_y-60*(1-kk)
          tt_str = tt_str + " -draw \"text 850, #{pos2} '#{$tt[kk]}'\""
        end
      else
        tt_str = tt_str + " -draw  \"text 850, #{$pos_y} '#{docs[k]['tm']}'\""
      end
      
      if docs[k]['rq'].nil?
        rq_str=''
      else  
        rq_str=docs[k]['rq'].split(/\s+/)[0].gsub('-','.')
      end
      
      if docs[k]['yh'].include?('-')  || docs[k]['sxh'].to_i % 10 == 0
        page = ((docs[k]['sxh'].to_i - 1) / 10) + 1 
        index_pos = (docs[k]['yh'].include?('-')) ? 1950 : 2000
        $out_str = $out_str + "  -draw \"text 240, #{$pos_y} '#{docs[k]['sxh']}'\"  #{wh_str} #{tt_str} #{zrz_str} -draw  \"text 1710, #{$pos_y} '#{rq_str}'\"  -draw  \"text #{index_pos}, #{$pos_y} '#{docs[k]['yh']}'\"" 
        page=page.rjust(2,'0')
        convert_str =  "convert ./dady/#{image_t}.jpg -font  ./dady/SimHei.ttf -pointsize 48 #{$out_str}  ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML#{page}.jpg" 

       #puts (convert_str)
       puts ("4 ====generate JN ===")
       system convert_str
       save2timage("ML0#{page}.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$ML#{page}.jpg", dh, yxqz)
       system("rm ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML#{page}.jpg")
     
      else   
        $out_str = $out_str + "  -draw \"text 240, #{$pos_y} '#{docs[k]['sxh']}'\"  #{wh_str} #{tt_str} #{zrz_str} -draw  \"text 1710, #{$pos_y} '#{rq_str}'\"  -draw  \"text 2000, #{$pos_y} '#{docs[k]['yh']}'\"" 
      end

    end
  end  

  
  new_zt = (dyzt | print_option).to_s
  puts "update archive set dyzt = '#{new_zt}' where id = #{archive_id};"
  $conn.exec("update archive set dyzt = '#{new_zt}' where id = #{archive_id};")
      
end
  


# ********************************************************************************************
#
#   main fucntions 
#
#    @qzh ---
#    @mlh ---
#    @dalb ---
#    @qajh ---
#    @zajh ---
#    @dylb --- 打印类别, 0--普通白纸打印， 1-用土地登记类的， 2-财务类 等等
#
#*********************************************************************************************
dydh, qajh, zajh, dylb = ARGV[0], ARGV[1],  ARGV[2], ARGV[3]
#qzh, mlh, dalb, qajh, zajh, dylb = ARGV[0], ARGV[1], ARGV[2], ARGV[3], ARGV[4], ARGV[5] 
#dydh = "#{qzh}-#{dalb}-#{mlh}"

ss=dydh.split('-')
qzh, dalb, mlh = ss[0], ss[1], ss[2]

puts  "=====Started At #{Time.now}===="

if( defined? ARGV[6]) && (ARGV[6].to_i == 1)
   $conn.exec("update archive set dyzt = '0' where dh like '#{qzh}_#{dalb}_#{mlh}_%' and cast (ajh as integer) >= #{qajh} and cast (ajh as integer) <= #{zajh}; ")
end   

# select id, ajh from archive then process each aj using generatea_sg (id, print_option) 
puts "select id, ajh from archive where qzh='#{qzh}' and dalb='#{dalb}' and mlh='#{mlh}' and  ajh >= '#{qajh.rjust(4,'0')}' and ajh <= '#{zajh.rjust(4,'0')}' order by ajh;"
user = $conn.exec("select id, ajh from archive where qzh='#{qzh}' and dalb='#{dalb}' and mlh='#{mlh}' and  ajh >= '#{qajh.rjust(4,'0')}' and ajh <= '#{zajh.rjust(4,'0')}' order by ajh;" )

for k in 0..user.count-1 do
  $conn.exec("update q_status set dqwz='#{user[k]['ajh'].to_i}' where dhp='#{dydh}';")
  puts "generating  #{user[k]['id']}  #{user[k]['ajh']}... type #{sprintf("%04b", dylb.to_i)}"
  generate_single_archive(user[k]['id'], dylb.to_i)
end

$conn.close

puts "***** End At #{Time.now}====\n"







