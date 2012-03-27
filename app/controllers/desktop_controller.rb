# encoding: utf-8
require 'socket'
class DesktopController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!, :except => [:upload_images]
  before_filter :set_current_user
  
  def index
  end
  
  def get_user
    render :text => User.current.to_json
  end
  
  def get_mulu
    user = User.find_by_sql("select * from mulu order by id;")
    size = user.size;
    if size > 0
      txt = "{results:#{size},rows:["
      for k in 0..user.size-1
        txt = txt + user[k].to_json + ','
      end
      txt = txt[0..-2] + "]}"
    else
      txt = "{results:0,rows:[]}"
    end
    render :text => txt
  end
  
  def get_tree
    text = []
    node, style = params["node"], params['style']
   
    if node == "root"
      data = User.find_by_sql("select distinct qzh, dwjc from archive inner join d_dwdm on d_dwdm.id=cast(qzh as integer) order by qzh;")
      data.each do |dd|
        text << {:text => "#{dd['qzh']} #{dd['dwjc']}", :id => dd["qzh"], :cls => "folder"}
      end
    else
      pars = node.split('|') || []
      
      if style.to_i == 1
        data = User.find_by_sql("select distinct cast(mlh as integer), dalb from archive where qzh='#{pars[0]}' order by mlh;")
        data.each do |dd|
            text << {:text => "目录 #{dd['mlh']}", :id => node+"|#{dd["dalb"]}|#{dd["mlh"]}", :leaf => true, :cls => "file"}
        end
      else
        if pars.length == 1
          data = User.find_by_sql("select distinct cast(dalb as integer), lbmc from archive inner join d_dalb on cast(dalb as integer)=d_dalb.id where qzh='#{pars[0]}' order by dalb;")
          data.each do |dd|
            text << {:text => "#{dd['dalb']} #{dd['lbmc']}", :id => node+"|#{dd["dalb"]}", :cls => "folder"}
          end
        end
        if pars.length == 2
          data = User.find_by_sql("select distinct cast(mlh as integer) from archive where qzh='#{pars[0]}' and dalb='#{pars[1]}' order by mlh;")
          data.each do |dd|
              text << {:text => "目录 #{dd['mlh']}", :id => node+"|#{dd["mlh"]}", :leaf => true, :cls => "file"}
          end
        end
      end
    end

    render :text => text.to_json
  end
    
  def get_archive
    if (params['query'].nil?)
      txt = "{results:0,rows:[]}"
    else
      ss = params['query'].split('|')
      
        user = User.find_by_sql("select count(*) from archive where qzh = '#{ss[0]}' and dalb = '#{ss[1]}' and mlh = '#{ss[2]}';")
        size = user[0].count;
  
        if size.to_i > 0
            txt = "{results:#{size},rows:["
            user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb = '#{ss[1]}' and mlh = '#{ss[2]}' order by ajh limit #{params['limit']} offset #{params['start']};")
            size = user.size;
            for k in 0..user.size-1
                txt = txt + user[k].to_json + ','
            end
            txt = txt[0..-2] + "]}"
        else
            txt = "{results:0,rows:[]}"
        end
      
    end
    render :text => txt
  end
    
  def get_document
    if (params['query'].nil?)
        txt = "{results:0,rows:[]}"
      else
        user = User.find_by_sql("select * from document where ownerid = #{params['query']};")
        size = user.size;
        if size > 0
          txt = "{results:#{size},rows:["
          for k in 0..user.size-1
            txt = txt + user[k].to_json + ','
          end
          txt = txt[0..-2] + "]}"
        else
          txt = "{results:0,rows:[]}"
        end
    end
    render :text => txt
  end
    
  #Parameters: {"nd"=>"1990", "bgqx"=>"长\346\234\237", "bz"=>"1234", "flh"=>"A1", "tm"=>"乡镇土地管理所一九九0年土地管理工作总\347\273\223", "ys"=>"116", "dh"=>"1_2_2_0", "zny"=>"199012", "qny"=>"199006", "js"=>"19", "ajh"=>"0002"}
  def update_flow
    User.find_by_sql("update archive set nd='#{params['nd']}', bgqx='#{params['bgqx']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{params['dh']}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{params['ajh']}' where id = #{params['id']};")
    render :text => 'Success'
  end
    
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
      text = "监 察 类"
    when 15
      text = "声 像 类"
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
   
  #/assets/dady/#{mlh}\$#{flh}\$#{ajh}\$ML01.jpg => dh, yxmc, yxbh, yxdx, data
  def save2timage(id, yxbh, path)
    if $conn.nil?
      $conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
    end
    
    user=User.find_by_sql("select mlh,flh,ajh,dh from archive where id=#{id};")
    
    yxdx=File.open(path).read.size
    edata=PGconn.escape_bytea(File.open(path).read)
    yxmc="#{user[0].mlh}\$#{user[0].flh}\$#{user[0].ajh}\$#{yxbh}"
    
    count = User.find_by_sql("select count(*) from timage where dh='#{user[0].dh}' and yxbh='#{yxbh}';")[0].count

    if count.to_i > 0
      #logger.debug "update timage set yxdx = #{yxdx}' where dh='#{user[0].dh}' and yxbh='#{yxbh}';"
      $conn.exec("update timage set yxdx = #{yxdx}, data= E'#{edata}' where dh='#{user[0].dh}' and yxbh='#{yxbh}';")
    else
      #logger.debug "insert into timage (dh, yxmc, yxbh, yxdx) values ('#{user[0].dh}', '#{yxmc}', '#{yxbh}', #{yxdx} );"
      $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data) values ('#{user[0].dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' );")
      #User.find_by_sql("insert into timage (dh, yxmc, yxbh, yxdx, data) values ('#{user[0].dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' );")
    end
  end
 
  # print cover
  def generate_fm
    user = User.find_by_sql("select * from archive where id = #{params['id']};")
    
    if user.size > 0
      data = user[0]
      fl_str = flstr(data.dalb.to_i)
      titles=split_string(data.tm).gsub(" ", "\n")
      
      tt = titles.split("\n")
      image_t = "image_1"
      tt_str = ""
      if tt.size > 1
        for kk in 0..tt.size-1 do
          pos2 = 1600-150*(1-kk)
          tt_str = tt_str + " -draw \"text 500, #{pos2} '#{tt[kk]}'\""
        end
      else
        tt_str = tt_str + " -draw \"text 500, 1450 '#{data.tm}'\""
      end

      dd1, dd2 = data.qny, data.zny
      convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/STZHONGS.ttf -pointsize 180 -draw \"text 550, 550 '#{data.dwdm}'\" -pointsize 160 -draw \"text 800, 970 '#{fl_str}'\" -font ./dady/SimHei.ttf -pointsize 96 #{tt_str} -pointsize 70 -draw \"text 300, 2675 '自 #{dd1[0..3]} 年 #{dd1[4..5]} 月 至 #{dd2[0..3]} 年 #{dd2[4..5]} 月'\" -draw \"text 1950, 2675 '#{data.bgqx}'\" -draw \"text 300, 2900 ' 本卷共 #{data.js} 件 #{data.ys} 页'\" -pointsize 96 -draw \"text 1950, 2675 '#{data.mj}'\" -pointsize 50 -draw \"text 1750, 3225 '#{data.mlh}'\" -draw \"text 1950, 3225 '#{data.flh}'\" -draw \"text 2150, 3225 '#{data.ajh.to_i}'\" ./dady/#{data.mlh}\\$#{data.flh}\\$#{data.ajh}\\$ML00.jpg"
      #logger.debug convert_str
      system convert_str
      save2timage(params['id'], "ML00.jpg", "./dady/#{data.mlh}\$#{data.flh}\$#{data.ajh}\$ML00.jpg")

      render :text => "assets/dady/#{data.mlh}\$#{data.flh}\$#{data.ajh}\$ML00.jpg"
    else
      render :text => ''
    end
      
  end
  
  def generate_jn
    pos_yy = 700
    image_t = "image_2"
    
    user = User.find_by_sql("select mlh,flh,ajh from archive where id=#{params['id']};")
    mlh,flh,ajh = user[0].mlh, user[0].flh, user[0].ajh
    
    user = User.find_by_sql("select * from document where ownerid = #{params['id']} order by id;")
    
    for k in 0..user.size-1
      $out_str = "-draw \"text 200, 250 'A #{ajh}'\" -draw \"text 200, 300 'M #{mlh}'\" " if (user[k].sxh.to_i % 10) == 1
      $pos_y = pos_yy + ((user[k].sxh.to_i - 1) % 10) * 260


      wh_str = ""
      titles=split_string(user[k].wh, 7)
      $tt = titles.split("\n")
      if $tt.size > 1
        for kk in 0..$tt.size-1 do
          pos2 = $pos_y-60*(1-kk)
          wh_str = wh_str + " -draw \"text 330, #{pos2} '#{$tt[kk]}'\""
        end
      else
        wh_str = wh_str + " -draw \"text 330, #{$pos_y} '#{user[k].wh}'\""
      end

      zrz_str = ""
      titles=split_string(user[k].zrz, 4)
      $tt = titles.split("\n")
      if $tt.size > 1
        for kk in 0..$tt.size-1 do
          pos2 = $pos_y-60*(1-kk)
          zrz_str = zrz_str + " -draw \"text 600, #{pos2} '#{$tt[kk]}'\""
        end
      else
        zrz_str = zrz_str + " -draw \"text 600, #{$pos_y} '#{user[k].zrz}'\""
      end

      tt_str = ""
      titles=split_string(user[k].tm)
      $tt = titles.split("\n")
      if $tt.size > 1
        for kk in 0..$tt.size-1 do
          pos2 = $pos_y-60*(1-kk)
          tt_str = tt_str + " -draw \"text 850, #{pos2} '#{$tt[kk]}'\""
        end
      else
        tt_str = tt_str + " -draw \"text 850, #{$pos_y} '#{user[k].tm}'\""
      end
      
      if user[k].yh.include?('-') || user[k].sxh.to_i % 10 == 0
        
        page = ((user[k].sxh.to_i - 1) / 10) + 1
        index_pos = (user[k].yh.include?('-')) ? 1950 : 2000
        $out_str = $out_str + " -draw \"text 240, #{$pos_y} '#{user[k].sxh}'\" #{wh_str} #{tt_str} #{zrz_str} -draw \"text 1710, #{$pos_y} '#{user[k].rq.split(/\s+/)[0].gsub('-','.')}'\" -draw \"text #{index_pos}, #{$pos_y} '#{user[k].yh}'\""
        
        convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/SimHei.ttf -pointsize 48 #{$out_str} ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML0#{page}.jpg"
        
        #logger.debug(convert_str)
        system convert_str

        #sleep 0.5
        save2timage(params['id'], "ML0#{page}.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$ML0#{page}.jpg")
        
      else
        $out_str = $out_str + " -draw \"text 240, #{$pos_y} '#{user[k].sxh}'\" #{wh_str} #{tt_str} #{zrz_str} -draw \"text 1710, #{$pos_y} '#{user[k].rq.split(/\s+/)[0].gsub('-','.')}'\" -draw \"text 2000, #{$pos_y} '#{user[k].yh}'\""
      end

    end
    
    logger.debug("/assets/dady/#{mlh}\$#{flh}\$#{ajh}\$ML01.jpg")
    render :text => "/assets/dady/#{mlh}\$#{flh}\$#{ajh}\$ML01.jpg"
  end

  def generate_sm
    image_t = "image_b"

    user = User.find_by_sql("select dh, mlh,flh,ajh,js,ys from archive where id=#{params['id']};")
    mlh,flh,ajh,js,ys = user[0].mlh, user[0].flh, user[0].ajh,user[0].js, user[0].ys.to_i

    for k in 0..ys-1
      page = (k+1).to_s.rjust(4,"0")
      convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/SimHei.ttf -pointsize 150 -draw \"text 600, 600 '#{user[0].dh}:#{page}' \" ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$#{page}.jpg "
      logger.debug(convert_str)
      system convert_str
      #sleep 0.1
      save2timage(params['id'], "#{page}.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$#{page}.jpg")
    end
    
    render :text => "/assets/dady/#{mlh}\$#{flh}\$#{ajh}\$0001.jpg"
  end

  def generate_bk
    image_t = "image_3"
    user = User.find_by_sql("select mlh,flh,ajh,qny from archive where id=#{params['id']};")
    
    mlh,flh,ajh = user[0].mlh, user[0].flh, user[0].ajh

    year, month = user[0].qny[0..3].succ, user[0].qny[4..5]
    #year_str = "#{year}年#{month}月"

    convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/TextMate.ttf -pointsize 46 -draw \"text 1200, 1940 '#{year}年#{month}月'\" ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$MLBK.jpg "
    logger.debug(convert_str)
    system convert_str

    #sleep 0.5
    save2timage(params['id'], "MLBK.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$MLBK.jpg")

    render :text => "/assets/dady/#{mlh}\$#{flh}\$#{ajh}\$MLBK.jpg"

  end
  
  #对单个目录进行生成，缺省不生成扫描的页面。
  def generate_sg(archiveid, sm=false)
    user = User.find_by_sql("select * from archive where id=#{archiveid};")

    data = user[0]
    mlh,flh,ajh,js,ys = user[0].mlh, user[0].flh, user[0].ajh,user[0].js, user[0].ys.to_i
    
    # generate fm
    if data.dalb.to_i == 3

      fl_str = flstr(data.dalb.to_i)
      image_t = "image_d"

      tddj = User.find_by_sql("select * from a_tddj where dh='#{data.dh}';")
      #titles=split_string(tddj[0].tdzl).gsub(" ", "\n")
      ss = tddj[0]['tdzl'].split(/ \s+/)
      for k in 0..tm.size-1 do
        ss[k] = split_string(ss[k])
      end
      titles=ss.join("\n")
      
      
      tt = titles.split("\n")
      
      tt_str = ""
      if tt.size > 1
        for kk in 0..$tt.size-1 do
          pos2 = 2000-100*(1-kk)
          tt_str = tt_str + " -draw \"text 1000, #{pos2} '#{$tt[kk]}'\""
        end
      else
        tt_str = tt_str + " -draw \"text 1000, 1950 '#{tddj[0].tdzl}'\""
      end
      
      tt_str = "-draw \"text 1000, 1450 '#{tddj[0].djh}'\" -draw \"text 1000, 1700 '#{tddj[0].qlrmc}'\" #{tt_str} "
      
      dd1, dd2 = data.qny, data.zny
      convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/STZHONGS.ttf -pointsize 180 -draw \"text 550, 550 '#{data.dwdm}'\" -pointsize 160 -draw \"text 800, 970 '#{fl_str}'\" -font ./dady/SimHei.ttf -pointsize 80 #{tt_str} -pointsize 70 -draw \"text 300, 2675 '自 #{dd1[0..3]} 年 #{dd1[4..5]} 月 至 #{dd2[0..3]} 年 #{dd2[4..5]} 月'\" -draw \"text 1950, 2675 '#{data.bgqx}'\" -draw \"text 300, 2900 ' 本卷共 #{data.js} 件 #{data.ys} 页'\" -pointsize 96 -draw \"text 1950, 2675 '#{data.mj}'\" -pointsize 50 -draw \"text 1750, 3225 '#{data.mlh}'\" -draw \"text 1950, 3225 '#{data.flh}'\" -draw \"text 2150, 3225 '#{data.ajh.to_i}'\" ./dady/#{data.mlh}\\$#{data.flh}\\$#{data.ajh}\\$ML00.jpg"
      system convert_str
      save2timage(archiveid, "ML00.jpg", "./dady/#{data.mlh}\$#{data.flh}\$#{data.ajh}\$ML00.jpg")
      logger.debug("1. ====generate ML ===")
      system("rm ./dady/#{data.mlh}\\$#{data.flh}\\$#{data.ajh}\\$ML00.jpg")
      
    
    else
      fl_str = flstr(data.dalb.to_i)
      #titles=split_string(data.tm).gsub(" ", "\n")
    
      ss = data.tm.split(/ \s+/)
      for k in 0..tm.size-1 do
        ss[k] = split_string(ss[k])
      end
      titles=ss.join("\n")
    
    
      tt = titles.split("\n")
      image_t = "image_1"
      tt_str = ""
      if tt.size > 1
        for kk in 0..tt.size-1 do
          pos2 = 1600-150*(1-kk)
          tt_str = tt_str + " -draw \"text 500, #{pos2} '#{tt[kk]}'\""
        end
      else
        tt_str = tt_str + " -draw \"text 500, 1450 '#{data.tm}'\""
      end

      dd1, dd2 = data.qny, data.zny
      convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/STZHONGS.ttf -pointsize 180 -draw \"text 550, 550 '#{data.dwdm}'\" -pointsize 160 -draw \"text 800, 970 '#{fl_str}'\" -font ./dady/SimHei.ttf -pointsize 96 #{tt_str} -pointsize 70 -draw \"text 300, 2675 '自 #{dd1[0..3]} 年 #{dd1[4..5]} 月 至 #{dd2[0..3]} 年 #{dd2[4..5]} 月'\" -draw \"text 1950, 2675 '#{data.bgqx}'\" -draw \"text 300, 2900 ' 本卷共 #{data.js} 件 #{data.ys} 页'\" -pointsize 96 -draw \"text 1950, 2675 '#{data.mj}'\" -pointsize 50 -draw \"text 1750, 3225 '#{data.mlh}'\" -draw \"text 1950, 3225 '#{data.flh}'\" -draw \"text 2150, 3225 '#{data.ajh.to_i}'\" ./dady/#{data.mlh}\\$#{data.flh}\\$#{data.ajh}\\$ML00.jpg"
      system convert_str
      logger.debug convert_str
      save2timage(archiveid, "ML00.jpg", "./dady/#{data.mlh}\$#{data.flh}\$#{data.ajh}\$ML00.jpg")
      logger.debug("1. ====generate ML ===")
      system("rm ./dady/#{data.mlh}\\$#{data.flh}\\$#{data.ajh}\\$ML00.jpg")
      
    end
    
    # generate bk
    image_t = "image_3"
    year, month = data.qny[0..3].succ, data.qny[4..5]
    convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/TextMate.ttf -pointsize 46 -draw \"text 1200, 1940 '#{year}年#{month}月'\" ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$MLBK.jpg "
    logger.debug("2 ====generate BK ===")
    system convert_str
    save2timage(archiveid, "MLBK.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$MLBK.jpg")
    system("rm ./dady/#{data.mlh}\\$#{data.flh}\\$#{data.ajh}\\$MLBK.jpg")
    
    #generate sm
    if sm
      image_t = "image_b"
      mlh,flh,ajh,js,ys = data.mlh, data.flh, data.ajh,data.js, data.ys.to_i
      for k in 0..ys-1
        page = (k+1).to_s.rjust(4,"0")
        convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/SimHei.ttf -pointsize 150 -draw \"text 600, 600 '#{data.dh}:#{page}' \" ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$#{page}.jpg "
        #logger.debug(convert_str)
        logger.debug("3 ====generate SM ===")
        system convert_str
        save2timage(archiveid, "#{page}.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$#{page}.jpg")
        system ("rm ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$#{page}.jpg")
      end
    end
    
    # generate jn
    pos_yy = 700
    image_t = "image_2"

    mlh,flh,ajh = data.mlh, data.flh, data.ajh
    user = User.find_by_sql("select * from document where ownerid = #{archiveid} order by sxh;")

    for k in 0..user.size-1
      $out_str = "-draw \"text 200, 250 'A #{ajh}'\" -draw \"text 200, 300 'M #{mlh}'\" " if (user[k].sxh.to_i % 10) == 1
      $pos_y = pos_yy + ((user[k].sxh.to_i - 1) % 10) * 260

      wh_str = ""
      titles=split_string(user[k].wh, 7)
      $tt = titles.split("\n")
      if $tt.size > 1
        for kk in 0..$tt.size-1 do
          pos2 = $pos_y-60*(1-kk)
          wh_str = wh_str + " -draw \"text 330, #{pos2} '#{$tt[kk]}'\""
        end
      else
        wh_str = wh_str + " -draw \"text 330, #{$pos_y} '#{user[k].wh}'\""
      end

      zrz_str = ""
      titles=split_string(user[k].zrz, 4)
      $tt = titles.split("\n")
      if $tt.size > 1
        for kk in 0..$tt.size-1 do
         pos2 = $pos_y-60*(1-kk)
         zrz_str = zrz_str + " -draw \"text 600, #{pos2} '#{$tt[kk]}'\""
        end
      else
        zrz_str = zrz_str + " -draw \"text 600, #{$pos_y} '#{user[k].zrz}'\""
      end

      tt_str = ""
      titles=split_string(user[k].tm,20)
      $tt = titles.split("\n")
      if $tt.size > 1
        for kk in 0..$tt.size-1 do
          pos2 = $pos_y-60*(1-kk)
          tt_str = tt_str + " -draw \"text 850, #{pos2} '#{$tt[kk]}'\""
        end
      else
        tt_str = tt_str + " -draw \"text 850, #{$pos_y} '#{user[k].tm}'\""
      end

      if user[k].yh.include?('-') || user[k].sxh.to_i % 10 == 0
        page = ((user[k].sxh.to_i - 1) / 10) + 1
        index_pos = (user[k].yh.include?('-')) ? 1950 : 2000
        $out_str = $out_str + " -draw \"text 240, #{$pos_y} '#{user[k].sxh}'\" #{wh_str} #{tt_str} #{zrz_str} -draw \"text 1690, #{$pos_y} '#{user[k].rq.split(/\s+/)[0].gsub('-','.')}'\" -draw \"text #{index_pos}, #{$pos_y} '#{user[k].yh}'\""

        convert_str = "convert ./dady/#{image_t}.jpg -font ./dady/SimHei.ttf -pointsize 44 #{$out_str} ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML0#{page}.jpg"

       logger.debug("4 ====generate JN ===")
       logger.debug(convert_str)

       system convert_str
       save2timage(archiveid, "ML0#{page}.jpg", "./dady/#{mlh}\$#{flh}\$#{ajh}\$ML0#{page}.jpg")
       system("rm ./dady/#{mlh}\\$#{flh}\\$#{ajh}\\$ML0#{page}.jpg")
       
      else
        $out_str = $out_str + " -draw \"text 240, #{$pos_y} '#{user[k].sxh}'\" #{wh_str} #{tt_str} #{zrz_str} -draw \"text 1690, #{$pos_y} '#{user[k].rq.split(/\s+/)[0].gsub('-','.')}'\" -draw \"text 2000, #{$pos_y} '#{user[k].yh}'\""
      end

    end
  
    if sm
      User.find_by_sql("update archive set dyzt = '15' where id = #{archiveid};")
    else
      User.find_by_sql("update archive set dyzt = '13' where id = #{archiveid};")
    end
        
  end
    
  def generate_all
    #生成一个案卷：
    archiveid = params['id']
    generate_sg(archiveid, false)
    
    #生成一个目录
    #user = User.find_by_sql("select qzh, mlh, dalb from archive where id = #{archive};")
    #qzh, mlh, dalb = user[0].qzh, user[0].mlh, user[0].dalb
    #
    #user = User.find_by_sql("select id from archive where qzh='#{qzh}' and mlh='#{mlh}' and dalb='#{dalb}';" )
    #for k in 0..user.size-1 do
    # generate_sg(user[k].id, false)
    #end
    
    #生成一个分类
    
    render :text => 'Success'
  end
  
  def get_timage
    if (params['dh'].nil?)
      txt = "{results:0,rows:[]}"
    else
      if params['type'].to_i == 0
        user = User.find_by_sql("select count(*) from timage where dh = '#{params['dh']}';")
        size = user[0].count;

        if size.to_i > 0
            txt = "{results:#{size},rows:["
            count = User.find_by_sql("select count(*) from timage where dh = '#{params['dh']}' and yxbh like '%ML%';")[0].count.to_i
            user = User.find_by_sql("select id, dh, yxmc, yxdx, yxbh from timage where dh = '#{params['dh']}' order by yxbh;")
            size = user.size;
            for k in size-count..size-1
                txt = txt + user[k].to_json + ','
            end
            for k in 0..size-count-1
                txt = txt + user[k].to_json + ','
            end
            txt = txt[0..-2] + "]}"
        else
            txt = "{results:0,rows:[]}"
        end
      else 
        ss = params['dh'].split("_")
        dh = "#{ss[0]}_#{ss[1]}_#{ss[2]}"
        puts "select id, dh, yxmc, yxdx, yxbh from timage_tjtx where dh = '#{dh}';"
        user =  User.find_by_sql("select id, dh, yxmc, yxdx, yxbh  from timage_tjtx where dh = '#{dh}';")
        if user.size > 0 
          txt = "{results:#{user.size},rows:["
          for k in 0..user.size-1
              txt = txt + user[k].to_json + ','
          end
          txt = txt[0..-2] + "]}"
        else
          txt = "{results:0,rows:[]}"
        end
      end
    end
    render :text => txt
  end
  
  def get_timage_from_db
    type = params['type'].to_i
    if (params['gid'].nil?)
      txt = ""
    else
      if type == 0
        user = User.find_by_sql("select id, yxmc, data from timage where id='#{params['gid']}';")
      else
        user = User.find_by_sql("select id, yxmc, data from timage_tjtx where id='#{params['gid']}';")
      end

      ss = user[0]["data"] #already escaped
      tt = user[0]["yxmc"].gsub('$', '_')
      local_filename = './dady/img_tmp/'+user[0]["yxmc"].gsub('$', '_').gsub('TIF','JPG')
      small_filename = './dady/img_tmp/'+user[0]["yxmc"].gsub('$', '-').gsub('TIF','JPG')
      File.open(local_filename, 'w') {|f| f.write(ss) }
      system("convert -resize 40% -quality 75 #{local_filename} #{small_filename}")
      #system("rm #{local_filename}")
      txt = "/assets/dady/img_tmp/#{user[0]["yxmc"].gsub('$', '_')}".gsub('TIF','JPG')
    end
    render :text => txt
  end
  
  def get_d_dalb
    user = User.find_by_sql("select count(*) from d_dalb;")
    size = user[0].count;
    if size.to_i > 0
        txt = "{results:#{size},rows:["
        user = User.find_by_sql("select id, id || ' ' || lbmc as lbmc from d_dalb order by id;")
        size = user.size;
        for k in 0..size-1
            txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
    else
        txt = "{results:0,rows:[]}"
    end
    render :text => txt
  end
  
  def get_d_dwdm
    user = User.find_by_sql("select count(*) from d_dwdm;")
    size = user[0].count;
    if size.to_i > 0
        txt = "{results:#{size},rows:["
        user = User.find_by_sql("select id, id || ' ' || dwdm as dwdm from d_dwdm order by id;")
        size = user.size;
        for k in 0..size-1
            txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
    else
        txt = "{results:0,rows:[]}"
    end
    render :text => txt
  end
  
  def get_d_dwdm_n
    user = User.find_by_sql("select count(*) from d_dwdm;")
    size = user[0].count;
    if size.to_i > 0
        txt = "{rows:["
        user = User.find_by_sql("select id, id || ' ' || dwdm as dwdm from d_dwdm order by id;")
        size = user.size;
        for k in 0..size-1
            txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
    else
        txt = "{rows:[]}"
    end
    render :text => txt
  end

  def upload_file
    params.each do |k,v|
      logger.debug("K: #{k} ,V: #{v}")
      if k.include?("ext")
        logger.debug("#{v.original_filename}")
        logger.debug("#{v.tempfile.path}")
        logger.debug("#{v.content_type}")
        ff = File.new("./dady/#{v.original_filename}","w+")
        ff.write(v.tempfile.read)
        ff.close
        break
      end
    end
    render :text => "{success:true}"
  end
  
  #import archive and document from text file
  def decode_file (f)
    system("iconv -t UTF-8 -f GB18030 #{f} > newfile")
    ss = File.open("newfile").read
    x= ActiveSupport::JSON.encode(ss).gsub(/\\n/, '').gsub("'","\"").gsub(/\\r/,'')
    ff = File.open("./dady/decoded","w+")
    ff.write(x[1..-2])
    ff.close
    system("rm newfile")
  end
  
  def update_owner
    User.find_by_sql("update a_dzda set ownerid=archive.id from archive where archive.dh=a_dzda.dh;")
    User.find_by_sql("update a_jhcw set ownerid=archive.id from archive where archive.dh=a_jhcw.dh;")
    User.find_by_sql("update a_jjda set ownerid=archive.id from archive where archive.dh=a_jjda.dh;")
    User.find_by_sql("update a_sbda set ownerid=archive.id from archive where archive.dh=a_sbda.dh;")
    User.find_by_sql("update a_swda set ownerid=archive.id from archive where archive.dh=a_swda.dh;")
    User.find_by_sql("update a_tddj set ownerid=archive.id from archive where archive.dh=a_tddj.dh;")
    User.find_by_sql("update a_tjda set ownerid=archive.id from archive where archive.dh=a_tjda.dh;")
    User.find_by_sql("update a_wsda set ownerid=archive.id from archive where archive.dh=a_wsda.dh;")
    User.find_by_sql("update document set ownerid=archive.id from archive where document.dh=archive.dh;")
  end
  
  #jumpLoader
  def upload_images
    params.each do |k,v|
      logger.debug("K: #{k} ,V: #{v}")
    end
    render :text => "success"
  end
  
  #查询卷内目录
  def get_archive_where
    if (params['query'].nil?)
      txt = "{results:0,rows:[]}"
    else
      user = User.find_by_sql("select count(*) from archive where tm like '%#{params['query']}%';")[0]
      size = user.count.to_i;
      if size > 0
        txt = "{results:#{size},rows:["
        user = User.find_by_sql("select * from archive where tm like '%#{params['query']}%' limit #{params['limit']};")
        for k in 0..user.size-1
          txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
      else
        txt = "{results:0,rows:[]}"
      end
    end
    render :text => txt
  end

  #查询卷内目录
  def get_document_where
    if (params['query'].nil?)
      txt = "{results:0,rows:[]}"
    else
      user = User.find_by_sql("select * from document where tm like '%#{params['query']}%' limit #{params['limit']};")
      size = user.size;
      if size > 0
        txt = "{results:#{size},rows:["
        for k in 0..user.size-1
          txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
      else
        txt = "{results:0,rows:[]}"
      end
    end
    render :text => txt
  end

  def set_documents(tt, qzh, dalb)
    for k in 0..tt.size-1
      user = tt[k]['Table']
      #dalb = user['档案类别'].to_i

      tm = user['题名']
      mlh = user['目录号']
      ajh = user['案卷号'].rjust(4,"0")
      sxh = user['顺序号']
      yh = user['页号']
      wh = user['文号']
      zrz = user['责任者']
      rq = user['日期']
      bz = user['备注']
      dh = "#{qzh}_#{mlh}_#{ajh.to_i}_#{dalb}"

      if rq.length==0
        rq = 'null'
      elsif rq.length==4
        rq = "TIMESTAMP '#{rq}0101'"
      elsif rq.length==6
        rq = "TIMESTAMP '#{rq}01'"
      else
        rq = "TIMESTAMP '#{rq}'"
      end

      insert_str = " INSERT INTO document(dh,tm,sxh,yh,wh,zrz,rq,bz) VALUES ('#{dh}','#{tm}','#{sxh}','#{yh}','#{wh}','#{zrz}',#{rq},'#{bz}');"
      logger.debug insert_str
      User.find_by_sql(insert_str)
      
      case dalb
      when 0 #综合档案
      when 2 #财务档案
      when 3 #土地登记
      when 4 #地籍管理
      when 10 #用地档案
      when 14 #监查案件
      when 15 #Image
      when 17 #土地规划
      when 19 #科技信息
      when 20 #Image
      when 21 #地址矿产
      when 24 #文书档案
      else
        #puts "#{dalb}"
      end

    end

  end

  def set_archive(tt, dwdm, qzh, dalb)
    for k in 0..tt.size-1
      user = tt[k]['Table']
      #dalb = user['档案类别'].to_i

      mlh = user['目录号']
      ajh = user['案卷号'].rjust(4,"0")
      tm = user['案卷标题']
      flh = user['分类号']
      nd = user['年度']
      zny = user['止年月']
      qny = user['起年月']
      js = user['件数'].to_i
      ys = user['页数'].to_i
      bgqx = user['保管期限']
      mj = user['密级']
      xh = user['箱号']
      cfwz = user['存放位置']
      bz = user['备注']
      boxstr = user['boxstr']
      rfidstr = user['标签ID']
      boxrfid = user['盒标签']
      qrq = user['起日期']
      zrq = user['止日期']

      tm = user['案卷题名'] if tm.nil?
      dh = "#{qzh}_#{dalb}_#{mlh}_#{ajh.to_i}"

      if qrq.nil?
        if qny == ''
          logger.debug('=======qny is null=====')
          qrq = "#{nd}-01-01"
          zrq = "#{nd}-12-31"
          qny = "#{nd}01"
          zny = "#{nd}12"
        else
          qyy,qmm = qny[0..3], qny[4..5]
          if qmm.to_i == 0
            qmm = '01'
            qny = qyy+'01'
          end
          if qmm.to_i>12
            qmm = '12'
            qny = qyy+'12'
          end
          qrq = "#{qyy}-#{qmm}-01"

          zyy = zny[0..3]
          zmm = zny[4..5]
          if zmm.to_i ==0
            zmm = '01'
            zny = zyy + '01'
          end
          if zmm.to_i>=12
            t1 = Time.mktime(zyy, 12, 31)
            zny = zyy+'12'
          else
            t1 = Time.mktime(zyy, (zmm.to_i+1).to_s)-86400
          end
          zrq = t1.strftime("%Y-%m-%d")
        end
      else
        if qrq.size == 6
          qyy,qmm,qdd = qrq[0..3], qrq[4..5],qrq[6..7]
          zyy,zmm,zdd = zrq[0..3], zrq[4..5],zrq[6..7]

          qrq = "#{qyy}-#{qmm}-#{qdd}"
          zrq = "#{zyy}-#{zmm}-#{zdd}"

          qny = "#{qyy}#{qmm}"
          zny = "#{zyy}#{zmm}"
        end

      end

      insert_str = " INSERT INTO archive(dh,dwdm,qzh,mlh,ajh,tm,flh,nd,zny,qny,js,ys,bgqx,mj,xh,cfwz,bz,boxstr,rfidstr,boxrfid,qrq,zrq,dalb) VALUES ('#{dh}','#{dwdm}','#{qzh}','#{mlh}','#{ajh}','#{tm}','#{flh}','#{nd}','#{zny}','#{qny}',#{js},#{ys},'#{bgqx}','#{mj}','#{xh}','#{cfwz}','#{bz}','#{boxstr}','#{rfidstr}','#{boxrfid}', TIMESTAMP '#{qrq}', TIMESTAMP '#{zrq}', '#{dalb}');"
      
      logger.debug insert_str
      User.find_by_sql(insert_str)
      
      case dalb
      when 0 #综合档案
      when 2 #财务档案
        jnzs = user['卷内张数']
        pzqh = user['凭证起号']
        pzzh = user['凭证止号']
        fjzs = user['附件编号']

        insert_str = " INSERT INTO a_jhcw(dh,jnzs,pzqh,pzzh,fjzs) VALUES ('#{dh}','#{jnzs}','#{pzqh}','#{pzzh}','#{fjzs}');"
        logger.debug insert_str
        User.find_by_sql(insert_str)
        
      when 3 #土地登记
        djh = user['地籍号']
        qlrmc = user['权利人名称']
        tdzl = user['土地座落']
        qsxz = user['权属性质']
        ydjh = user['原地籍号']

        insert_str = " INSERT INTO a_tddj(dh,djh,qlrmc,tdzl,qsxz,ydjh) VALUES ('#{dh}','#{djh}','#{qlrmc}','#{tdzl}','#{qsxz}','#{ydjh}');"
        logger.debug insert_str
        User.find_by_sql(insert_str)
        
      when 4 #地籍管理
      when 10 #用地档案
      when 14 #监查案件
      when 15 #Image
      when 17 #土地规划
      when 19 #科技信息
      when 20 #Image
      when 21 #地址矿产
      when 24 #文书档案
      else
        #puts "#{dalb}"
      end
    end
  end
  
  #quh, dwdm, dwjc
  def add_qzh
    user = User.find_by_sql("select count (*) from d_dwdm where id = #{params['qzh']};")[0]
    if user.count.to_i == 0
      User.find_by_sql("insert into d_dwdm(id, dwdm, dwjc) values (#{params['qzh']}, '#{params['dwdm']}', '#{params['dwjc']}');")
      render :text => "{success:true}"
    else
      render :text => "{success:false}"
    end
  end

  def delete_qzh
    user = User.find_by_sql("delete from d_dwdm where id = #{params['qzh']};")
    render :text => 'Success'
  end

  def check_mlh
    user = User.find_by_sql("select id from archive where qzh='#{params['qzh']}' and mlh='#{params['mlh']}' limit 1;")
    render :text => user.to_json
  end
  
  def get_print_status
    qzh, mlh, dalb = params['qzh'], params['mlh'], params['dalb']
    dydh = "#{qzh}_#{dalb}_#{mlh}"
    user = User.find_by_sql("select * from p_status where dydh = '#{dydh}';")
    if user.size > 0
      data = user[0];
      render :text => "#{data.dqjh}|#{data.qajh}|#{data.zajh}|#{data.dyzt}"
    else
      render :text => "1|1|100|打印完成"
    end
  end
  
  def print_wizard
    qzh, mlh, dalb, qajh, zajh = params['qzh'], params['mlh'], params['dalb'], params['qajh'], params['zajh']
    
    dylb = 0
    dylb += 8 if !params['dylb-1'].nil?
    dylb += 4 if !params['dylb-2'].nil?
    dylb += 2 if !params['dylb-3'].nil?
    dylb += 1 if !params['dylb-4'].nil?

    logger.debug "ruby ./dady/bin/print_wizard.rb #{qzh} #{mlh} #{dalb} #{qajh} #{zajh} #{dylb} 1 &"

    dydh = "#{qzh}_#{dalb}_#{mlh}"
    User.find_by_sql("delete from p_status where dydh='#{dydh}';")
    User.find_by_sql("insert into p_status (dydh, mlh, dqjh, qajh, zajh, dyzt) values ('#{dydh}', '#{mlh}', '#{qajh}', '#{qajh}', '#{zajh}', '正在准备打印' );")

    system("ruby ./dady/bin/print_wizard.rb #{qzh} #{mlh} #{dalb} #{qajh} #{zajh} #{dylb} 1 &")
    render :text => "Success"

    
    #dydh = "#{qzh}_#{mlh}_#{dalb}"
    #user = User.find_by_sql("select * from p_status where dydh = '#{dydh}';")
    #if user.size > 0
    # data = user[0];
    # render :text => "#{data.dqjh}|#{data.qajh}|#{data.zajh}|#{data.dyzt}"
    #else
    # logger.debug "ruby ./dady/bin/print_wizard.rb #{qzh} #{mlh} #{dalb} #{qajh} #{zajh} #{dylb} 1 &"
    # system("ruby ./dady/bin/print_wizard.rb #{qzh} #{mlh} #{dalb} #{qajh} #{zajh} #{dylb} 1 &")
    # render :text => "Success"
    #end
  
  end

  def export_image
    user = User.find_by_sql("select qzh, mlh, dalb from archive where id = #{params['id']}");
    
    data = user[0]
    dh = "#{data.qzh}_#{data.dalb}_#{data.mlh}_%"
    imgs = User.find_by_sql("select id, dh from timage where dh like '#{dh}' order by id;")
    
    outPath = "./dady/#{data.mlh}"
    if File.exists?(outPath)
      system "rm -rf #{outPath}"
    end
    system "mkdir -p #{outPath}"
    
    
    for k in 0..imgs.size - 1 do
      dd = imgs[k]
      user = User.find_by_sql("select * from timage where id='#{dd.id}';")
      ss = user[0]["data"] #already escaped
      #tt = user[0]["yxmc"].gsub('$', '_')
      #local_filename = "#{outPath}/"+user[0]["yxmc"].gsub('$', '_')
      local_filename = "#{outPath}/"+user[0]["yxmc"]
      File.open(local_filename, 'w') {|f| f.write(ss) }
    end
    
    logger.debug "zip #{outPath}.zip #{outPath}/*"
    system "zip -0 #{outPath}.zip #{outPath}/*"
    render :text => "/assets/dady/#{data.mlh}.zip"
    
  end
  
  def long_wait
      system("ruby ./dady/bin/export_image.rb 27 &")
      render :text => 'Success'
  end
  
  #************************************************************************************************
  #
  # get_upload_info
  # input : archive_id
  # output: {dwdm:'溧水县国土资源局', mlh:'1', total_pics:'5279', save_path:'/share/溧水县国土资源局/目录1'}
  #
  #************************************************************************************************
  def get_upload_info
    dd = User.find_by_sql("select qzh, dwdm, dalb, mlh from archive where id = #{params['id']};")[0]
    user = User.find_by_sql("select sum(ys) as zys from archive where qzh = '#{dd.qzh}' and dalb = '#{dd.dalb}' and mlh = '#{dd.mlh}';")
    totalSize = user[0].zys;
    
    if !File.exists?("/share/#{dd.dwdm}/目录#{dd.mlh}")
      puts "mkdir -p '/share/#{dd.dwdm}/目录#{dd.mlh}'"
      system ("mkdir -p '/share/#{dd.dwdm}/目录#{dd.mlh}'")
    end
    
    ip = IPSocket.getaddress(Socket.gethostname)
    render :text => "[{dwdm:'#{dd.dwdm}', mlh:'#{dd.mlh}', total_pics:'#{totalSize}', save_path:'/share/#{dd.dwdm}/目录#{dd.mlh}', map_ip:'#{ip}'}]"
  end
  
  #************************************************************************************************
  #
  # get_upload_status
  # input: yxwz /share/溧水县国土资源局/目录1
  # ztps 5279
  #
  #************************************************************************************************
  def get_upload_status
    copyedFile = Dir["#{params['yxwz']}/*"].size
    render :text => "#{copyedFile}|#{params['ztps']}"
  end
  
  #************************************************************************************************
  #
  # upload_files
  # input: qzh 4
  # dalb 10
  #
  #************************************************************************************************
  def upload_files
    params.each do |k,v|
      logger.debug("K: #{k} ,V: #{v}")
    end
    
    ff = params['ajb'].original_filename
    
    mlh = ''
    ff.each_byte do |b|
      if b < 127
        mlh = mlh + b.chr
      else
        break
      end
    end
    
    qzh = params['qzh']
    dalb = params['dalb']
    
    dh = "#{qzh}_#{dalb}_#{mlh}_%"
    
    #delete any document connected to dh
    User.find_by_sql("delete from archive where dh like '#{dh}'; ")
    User.find_by_sql("delete from document where dh like '#{dh}'; ")

    user = User.find_by_sql("select * from d_dwdm where id=#{qzh};")[0]
    dwdm = user.dwdm # find by sql query

    v = params['jnb']
    ff = File.new("./dady/tmp/#{v.original_filename}","w+")
    ff.write(v.tempfile.read)
    ff.close

    v = params['ajb']
    ff = File.new("./dady/tmp/#{v.original_filename}","w+")
    ff.write(v.tempfile.read)
    ff.close
    
    logger.debug "ruby ./dady/bin/upload_mulu.rb #{v.original_filename} #{dwdm} #{qzh} #{dalb} &"
    system ("ruby ./dady/bin/upload_mulu.rb #{v.original_filename} #{dwdm} #{qzh} #{dalb} &")
    
    render :text => "{success:true}"
  end
  
  
  #************************************************************************************************
  #
  # get_mulu_status
  # input: yxwz /share/溧水县国土资源局/目录1
  # ztps 5279
  #
  #************************************************************************************************
  def get_mulu_status
    
    render :text => ""
  end
  
  
  #查询借阅流程
  def get_jydjlc_jyzt
    if (params['query'].nil?)
      txt = "{results:0,rows:[]}"
    else
      jyzt=params['query']
      if (jyzt=='')
        txt = "{results:0,rows:[]}"
      else
        user = User.find_by_sql("select count(*) from jylc where jyzt = #{params['query']};")[0]
        size = user.count.to_i;
        if size > 0
          txt = "{results:#{size},rows:["
          user = User.find_by_sql("select * from jylc where jyzt = #{params['query']};")
          for k in 0..user.size-1
            txt = txt + user[k].to_json + ','
          end
          txt = txt[0..-2] + "]}"
        else
          txt = "{results:0,rows:[]}"
        end
      end
    end
    render :text => txt
  end

  #查询借阅流程
  def get_jydjlist
    if (params['id'].nil?)
      txt = "{results:0,rows:[]}"
    else
      ids=params['jyzt']
      if (ids=='')
        txt = "{results:0,rows:[]}"
      else
        if (ids=='2')
          user = User.find_by_sql("select count(*) from archive where id in (select daid from jylist where jyid=#{params['id']} and hdsj IS NULL);")[0]
          size = user.count.to_i;
          
          if size > 0
            txt = "{results:#{size},rows:["
            user = User.find_by_sql("select * from archive where id in (select daid from jylist where jyid=#{params['id']} and hdsj IS NULL);")
            for k in 0..user.size-1
              txt = txt + user[k].to_json + ','
            end
            txt = txt[0..-2] + "]}"
          else
            txt = "{results:0,rows:[]}"
          end
        else
          user = User.find_by_sql("select count(*) from archive where id in (select daid from jylist where jyid=#{params['id']} );")[0]
          size = user.count.to_i;
          if size > 0
            txt = "{results:#{size},rows:["
            user = User.find_by_sql("select * from archive where id in (select daid from jylist where jyid=#{params['id']} );")
            for k in 0..user.size-1
              txt = txt + user[k].to_json + ','
            end
            txt = txt[0..-2] + "]}"
          else
            txt = "{results:0,rows:[]}"
          end
        end
      end
    end
    render :text => txt
  end

  #quh, dwdm, dwjc
  def add_qzh
    user = User.find_by_sql("select count (*) from d_dwdm where id = #{params['qzh']};")[0]
    if user.count.to_i == 0
      User.find_by_sql("insert into d_dwdm(id, dwdm, dwjc) values (#{params['qzh']}, '#{params['dwdm']}', '#{params['dwjc']}');")
      render :text => "{success:true}"
    else
      render :text => "{success:false}"
    end
  end

  def delete_qzh
    user = User.find_by_sql("delete from d_dwdm where id = #{params['qzh']};")
    render :text => 'Success'
  end

  def check_mlh
    user = User.find_by_sql("select id from archive where qzh='#{params['qzh']}' and mlh='#{params['mlh']}' limit 1;")
    render :text => user.to_json
  end
  
  def archive_query_jygl
    cx_tj=''
    
    if !(params['mlh'].nil?)
      cx_tj="archive.mlh='#{params['mlh']}'"
    end
    
    if !(params['ajh'].nil?)

      if (cx_tj!='')
        cx_tj=cx_tj + " and archive.ajh='#{params['ajh']}'"
      else
        cx_tj=" archive.ajh='#{params['ajh']}'"
      end
    end
    
    if !(params['ajtm'].nil?)
      if (cx_tj!='')
        cx_tj=cx_tj + " and archive.tm like '%#{params['ajtm']}%'"
      else
        cx_tj="archive.tm like '%#{params['ajtm']}%'"
      end
    end
    
    jn_cx_tj=''
    if !(params['wh'].nil?)
      jn_cx_tj="wh like '%#{params['wh']}%'"
    end
    if !(params['zrz'].nil?)

      if (jn_cx_tj!='')
        jn_cx_tj=jn_cx_tj + " and zrz like '%#{params['zrz']}%'"
      else
        jn_cx_tj=" zrz like '%#{params['zrz']}%'"
      end
    end
    
    if !(params['tm'].nil?)
      if (jn_cx_tj!='')
        jn_cx_tj=jn_cx_tj + " and document.tm like '%#{params['tm']}%'"
      else
        jn_cx_tj="document.tm like '%#{params['tm']}%'"
      end
    end
    
    dj_cx_tj=''
    if !(params['djh'].nil?)
      dj_cx_tj="djh like '%#{params['djh']}%'"
    end
    
    if !(params['tdzl'].nil?)
      if (dj_cx_tj!='')
        dj_cx_tj=dj_cx_tj + " and tdzl like '%#{params['tdzl']}%'"
      else
        dj_cx_tj=" zrz like '%#{params['tdzl']}%'"
      end
    end
    
    if !(params['qlr'].nil?)
      if (dj_cx_tj!='')
        dj_cx_tj=dj_cx_tj + " and qlrmc like '%#{params['qlr']}%'"
      else
        dj_cx_tj="qlrmc like '%#{params['qlr']}%'"
      end
    end

    jy_select=''
    if (jn_cx_tj!='')
      if (cx_tj!='')
        if (dj_cx_tj!='')
          jy_select="select * from document,archive,a_tddj WHERE a_tddj.ownerid = archive.id AND document.ownerid = archive.id and #{cx_tj} and #{jn_cx_tj} and #{dj_cx_tj}"
        else
          jy_select="select * from document,archive WHERE document.ownerid = archive.id and #{cx_tj} and #{jn_cx_tj} "
        end
      else
        if (dj_cx_tj!='')
          jy_select="select * from document,archive,a_tddj WHERE a_tddj.ownerid = archive.id AND document.ownerid = archive.id and #{jn_cx_tj} and #{dj_cx_tj}"
        else
          jy_select="select * from document,archive WHERE document.ownerid = archive.id and #{jn_cx_tj}"
        end
      end
    else
      if (cx_tj!='')
        if (dj_cx_tj!='')
          jy_select ="select * from archive,a_tddj where a_tddj.ownerid = archive.id AND #{cx_tj} and #{dj_cx_tj}"
        else
          jy_select ="select * from archive where #{cx_tj} "
        end
      else
        if (dj_cx_tj!='')
          jy_select ="select * from archive,a_tddj where a_tddj.ownerid = archive.id and #{dj_cx_tj}"
        else
          jy_select =''
        end
        
      end
    end
    
    if (jy_select!='')
      user = User.find_by_sql(" #{jy_select}")
      size = user.size;
      if size > 0
        txt = "{results:#{size},rows:["
        for k in 0..user.size-1
            txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
      else
        txt = "{results:0,rows:[]}"
      end
    else
      txt = "{results:0,rows:[]}"
    end
    render:text=>txt
  end
  
  def insert_jylc
      if !(params['jylx'].nil?)
        jylx=params['jylx']
      end
      if !(params['jytj'].nil?)
        jytj=params['jytj']
      end
      if !(params['lymd'].nil?)
        lymd=params['lymd']
      end
      if !(params['jyqx'].nil?)
        lyqx=params['jyqx']
      else
        lyqx=0
      end
      if (params['fyys']=='')
        fyys=0
      else
        fyys=params['fyys']
      end
      if (params['czrid']=='')
        czrid=0
      else
        czrid=params['czrid']
      end
      if (params['zcys']=='')
        zcys=0
      else
        zcys=params['zcys']
      end
      rq=Time.now.strftime("%Y-%m-%d")
      User.find_by_sql("insert into jylc(jyr, jydw, jylx, zj, lymd, lyxg, jysj, fyys, zcys, jyqx, cdlr, bz, czrid, jyzt, jylist,jytj) values ('#{params['jyr']}', '#{params['jydw']}', '#{jylx}','#{params['zj']}','#{lymd}','#{params['lyxg']}','#{rq}','#{fyys}','#{zcys}','#{lyqx}','#{params['cdlr']}','#{params['bz']}','#{czrid}','#{params['jyzt']}','#{params['jy_aj_list']}','#{jytj}');")
      if !(params['jy_aj_list']=='')
        user = User.find_by_sql("select max(id) as id from jylc;")
        ss = params['jy_aj_list'].split(',')
        for k in 0..ss.length-1
          User.find_by_sql("insert into jylist(jyid, daid) values ('#{user[0]["id"]}', '#{ss[k]}');")
        end
      end
      render :text => "success"
    
  end
  
  def update_jylc
    if !(params['jylx'].nil?)
      jylx=params['jylx']
    end
    if !(params['jytj'].nil?)
      jytj=params['jytj']
    end
    if !(params['lymd'].nil?)
      lymd=params['lymd']
    end
    if !(params['lyqx'].nil?)
      lyqx=params['lyqx']
    else
      lyqx=0
    end
    if (params['fyys']=='')
      fyys=0
    else
      fyys=params['fyys']
    end
    if (params['czrid']=='')
      czrid=0
    else
      czrid=params['czrid']
    end
    if (params['zcys']=='')
      zcys=0
    else
      zcys=params['zcys']
    end
    rq=Time.now.strftime("%Y-%m-%d")
    User.find_by_sql("update jylc set bz='#{params['bz']}', cdlr='#{params['cdlr']}', czrid='#{czrid}', fyys='#{fyys}', jylist='#{params['jy_aj_list']}', jydw='#{params['jydw']}', jylx='#{jylx}', jyqx='#{lyqx}', jyr='#{params['jyr']}', jytj='#{jytj}', jyzt='#{params['jyzt']}', lymd='#{lymd}', lyxg='#{params['lyxg']}', zcys='#{zcys}', zj='#{params['zj']}' where id = #{params['id']};")
    if !(params['jy_aj_list']=='')
      user = User.find_by_sql("select max(id) as id from jylc;")
      ss = params['jy_aj_list'].split(',')
      for k in 0..ss.length-1
        User.find_by_sql("insert into jylist(jyid, daid) values ('#{user[0]["id"]}', '#{ss[k]}');")
      end
    end
    render :text => 'success'
  end
  
  def delete_jylc
    user = User.find_by_sql("delete from jylc where id = #{params['id']};")
    render :text => 'success'
  end
  
  def qbhd_jylc
    rq=Time.now.strftime("%Y-%m-%d")
    user = User.find_by_sql("update jylc set hdsj='#{rq}',jyzt='4' where id = #{params['id']};")
    render :text => 'success'
  end
  
  def xjhd_jylc
    rq=Time.now.strftime("%Y-%m-%d")
    ss = params['ids'].split(',')
    for k in 0..ss.length-1
      User.find_by_sql("update jylist set hdsj ='#{rq}' where daid ='#{ss[k]}' and jyid=#{params['id']};")
    end
    user = User.find_by_sql("select * from jylist where jyid=#{params['id']} and hdsj IS NULL;")

    if user.size==0
      user = User.find_by_sql("update jylc set hdsj='#{rq}',jyzt='4' where id = #{params['id']};")
    end
    #user = User.find_by_sql("update jylc set hdsj='#{rq}',jyzt='4' where id = #{params['id']};")
    render :text => 'success'
  end
  
  def get_p_setting
    if params['mbmc'].nil?
      txt = "{results:0,rows:[]}"
    else
      mbmc = params['mbmc']
      user = User.find_by_sql("select * from p_setting where mbmc='#{mbmc}';")
      size = user.size;
      if size > 0
        txt = "{results:#{size},rows:["
        for k in 0..user.size-1
          txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
      else
        txt = "{results:0,rows:[]}"
      end
    end
    render :text => txt
  end

  def get_p_template
    user = User.find_by_sql("select distinct mbmc from p_setting order by mbmc;")
    size = user.size
    if size > 0
        txt = "{results:#{size},rows:["
        for k in 0..size-1
            txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
    else
        txt = "{results:0,rows:[]}"
    end
    render :text => txt
  end

  def get_mulu_store
    if params['dh'].nil?
      txt = "{results:0,rows:[]}"
    else
      dh = params['dh'].gsub('|','_')
      user = User.find_by_sql("select * from timage_tj where dh like '#{dh}%' order by id;")
      size = user.size;
      if size > 0
        txt = "{results:#{size},rows:["
        for k in 0..user.size-1
            txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
      else
        txt = "{results:0,rows:[]}"
      end
    end
    render :text => txt
  end

  def cal_image(path)
    k = 0
    Find.find(path) do |path|
      if path.include?'jpg'
        k = k+1
      end
    end
    k
  end

  def prepare_upload_info
    ss = id.split('|')
    user = User.find_by_sql("select id, dwdm from d_dwdm whre id='#{ss[0]}';")
    dwdm = user[0].dwdm
    if ss.size == 3
      qzh, dalb, mlh = ss[0], ss[1], ss[2]
      path = "/share/#{dwdm}/目录#{mlh}"

      tpsl = Dir["#{path}/*.jpg"].size
      user = User.find_by_sql("select count(*) as count from timage where dh like '#{qzh}_#{dalb}_#{mlh}_%';")
      txt = "{results:1,rows:["
      txt = txt + "{mlh:'#{mlh}', tpsl:'#{tpsl}', drtp:'#{user[0].count}'}]}"

    elsif 
      ss.size == 2
    end
    dd = User.find_by_sql("select qzh, dwdm, dalb, mlh from archive where id = #{params['id']};")[0]
    user = User.find_by_sql("select sum(ys) as zys from archive where qzh = '#{dd.qzh}' and dalb = '#{dd.dalb}' and mlh = '#{dd.mlh}';")
    render :text => 'Success'
  end

  def get_dyzt_store
    user = User.find_by_sql("select id, dydh, cast (mlh as integer), dqjh, qajh, zajh, dyzt, dylb from p_status order by mlh;")
    size = user.size;
    if size > 0
        txt = "{results:#{size},rows:["
        for k in 0..user.size-1
            txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
    else
        txt = "{results:0,rows:[]}"
    end
    render :text => txt
  end

  #qzh=4&mlh=1&dalb=0&qajh=1&zajh=337&dylb-1=on&dylb-2=on&dylb-4=on
  def get_next_mulu
    qzh, mlh, dalb = params['qzh'], params['mlh'].to_i+1, params['dalb']
    user = User.find_by_sql("select min(ajh), max(ajh), dalb from archive where qzh = '#{qzh}' and mlh = '#{mlh}' group by dalb;")
    data = user[0]
    txt = "({mlh:'#{mlh}', qajh:'#{data.min.to_i}', zajh:'#{data.max.to_i}', dalb:'#{data.dalb}'})"
    render :text => txt
  end

  def get_prev_mulu
    render :text => 'Success'
  end

  #qzh=4&mlh=52&dalb=3&qajh=1&zajh=999&dylb-1=on&dylb-2=on&dylb-4=on
  def add_print_task
    qzh, mlh, dalb, qajh, zajh = params['qzh'], params['mlh'], params['dalb'], params['qajh'], params['zajh']

    dylb = 0
    dylb += 8 if !params['dylb-1'].nil?
    dylb += 4 if !params['dylb-2'].nil?
    dylb += 2 if !params['dylb-3'].nil?
    dylb += 1 if !params['dylb-4'].nil?
  
    dydh = "#{qzh}_#{dalb}_#{mlh}"
    User.find_by_sql("delete from p_status where dydh='#{dydh}';")
    User.find_by_sql("insert into p_status (dydh, mlh, dqjh, qajh, zajh, dyzt, dylb) values ('#{dydh}', '#{mlh}', '#{qajh}', '#{qajh}', '#{zajh}', '未打印', '#{sprintf("%02b", dylb)}');")
  
    render :text => 'Success'
  end

  #qzh=4&mlh=52&dalb=3&qajh=1&zajh=999&dylb-1=on&dylb-2=on&dylb-4=on
  def add_print_task_all
    qzh, mlh, dalb, qajh, zajh = params['qzh'], params['mlh'], params['dalb'], params['qajh'], params['zajh']
    dylb = 0
    dylb += 8 if !params['dylb-1'].nil?
    dylb += 4 if !params['dylb-2'].nil?
    dylb += 2 if !params['dylb-3'].nil?
    dylb += 1 if !params['dylb-4'].nil?
  
    if (dalb=='*')
      users = User.find_by_sql("select distinct mlh, dalb from archive where qzh='#{qzh}' order by mlh;")

      for k in 0..users.size-1
        mlh, dalb = users[k].mlh, users[k].dalb
        dydh = "#{qzh}_#{dalb}_#{mlh}"
        User.find_by_sql("delete from p_status where dydh='#{dydh}';")
      
        if zajh.to_i == -1
          user = User.find_by_sql("select min(ajh), max(ajh), dalb from archive where qzh = '#{qzh}' and mlh = '#{mlh}' group by dalb;")
          data =user[0]
          User.find_by_sql("insert into p_status (dydh, mlh, dqjh, qajh, zajh, dyzt, dylb) values ('#{dydh}', '#{mlh}', '0', '#{data['min']}', '#{data['max']}', '未打印', '#{sprintf("%02b", dylb)}');")
        else  
          User.find_by_sql("insert into p_status (dydh, mlh, dqjh, qajh, zajh, dyzt, dylb) values ('#{dydh}', '#{mlh}', '0', '1', '5', '未打印', '#{sprintf("%02b", dylb)}');")
        end
      end
    else
      users = User.find_by_sql("select distinct mlh from archive where qzh='#{qzh}' and dalb='#{dalb}' order by mlh;")
      for k in 0..users.size-1
        mlh = users[k].mlh
        dydh = "#{qzh}_#{dalb}_#{mlh}"
        User.find_by_sql("delete from p_status where dydh='#{dydh}';")
    
        user = User.find_by_sql("select min(ajh), max(ajh), dalb from archive where qzh = '#{qzh}' and mlh = '#{mlh}' group by dalb;")
        data =user[0]
        User.find_by_sql("insert into p_status (dydh, mlh, dqjh, qajh, zajh, dyzt, dylb) values ('#{dydh}', '#{mlh}', '0', '#{data['min']}', '#{data['max']}', '未打印', '#{sprintf("%02b", dylb)}');")
      end
    end
    render :text => 'Success'
  end

  def delete_print_task
    User.find_by_sql("delete from p_status where id in (#{params['id']});")
    render :text => 'Success'
  end

  def delete_all_print_task
    User.find_by_sql("delete from p_status where dyzt = '打印完成';")
    render :text => 'Success'
  end


  def start_print_task
    system 'ruby ./dady/bin/call_print_wizard.rb &'
    render :text => 'Success'
  end

  def update_timage_tj
    dh = params['dh']
    ss = dh.split('_')
    qzh, dalb, mlh = ss[0], ss[1], ss[2]
    system("ruby ./dady/bin/update_timage_tj.rb #{qzh} #{dalb} #{mlh} &")
    render :text => 'Success'
  end

  def print_timage_tj
    dh = params['dh']
    ss = dh.split('_')
    qzh, dalb, mlh = ss[0], ss[1], ss[2]
    system("ruby ./dady/bin/print_mulu_tj.rb #{qzh} #{dalb} #{mlh}")
    render :text => 'Success'
  end
  
  
  def get_timage_tj_from_db
    if (params['gid'].nil?)
      txt = ""
    else
      if type.to_i = 0
        user = User.find_by_sql("select id, yxmc, data from timage_tjtx where id='#{params['gid']}';")
      else
        user = User.find_by_sql("select id, yxmc, data from timage_tjtx where id='#{params['gid']}';")
      end  
      ss = user[0]["data"] #already escaped
      tt = user[0]["yxmc"]
      local_filename = './dady/img_tmp/'+user[0]["yxmc"]
      small_filename = './dady/img_tmp/'+user[0]["yxmc"]
      File.open(local_filename, 'w') {|f| f.write(ss) }
      system("convert -resize 20% -quality 75 #{local_filename} #{small_filename}")
      txt = "/assets/dady/img_tmp/#{user[0]['yxmc']}"
    end
    render :text => txt    
  end
  
    
  #获得用户目录权限树
  def get_ml_qx_tree
    node, style = params["node"], params['style']
      if node == "root"
        data = User.find_by_sql("select * from  d_dwdm order by id;")
        text="["
        data.each do |dd|
          text=text+"{'text':'#{dd['dwdm']}','id' :'#{dd['id']}','leaf':false,'checked':false,'cls':'folder','children':["

          dalb=User.find_by_sql("select * from  d_dw_lb where dwid= #{dd['id']} order by id;")
          dalb.each do |lb|
            text=text+"{'text':'#{lb['lbmc']}','id' :'#{dd['id']}_#{lb['lbid']}','leaf':false,'checked':false,'cls':'folder','children':["
            dalbml=User.find_by_sql("select * from  d_dw_lb_ml where d_dw_lbid= #{lb['id']} order by id;")
            dalbml.each do |lbml|
              text=text+"{'text':'#{lbml['mlhjc']}','id' :'#{dd['id']}_#{lb['lbid']}_#{lbml['id']}','leaf':false,'checked':false,'cls':'folder','children':["
              text=text+"{'text':'查询','id' :'#{dd['id']}_#{lb['lbid']}_#{lbml['id']}_q','leaf':true,'checked':false,'iconCls':'accordion'},"
              text=text+"{'text':'打印','id' :'#{dd['id']}_#{lb['lbid']}_#{lbml['id']}_p','leaf':true,'checked':false,'iconCls':'print'},"
              text=text+"{'text':'新增','id' :'#{dd['id']}_#{lb['lbid']}_#{lbml['id']}_a','leaf':true,'checked':false,'iconCls':'add'},"
              text=text+"{'text':'修改','id' :'#{dd['id']}_#{lb['lbid']}_#{lbml['id']}_m','leaf':true,'checked':false,'iconCls':'option'},"
              text=text+"{'text':'删除','id' :'#{dd['id']}_#{lb['lbid']}_#{lbml['id']}_d','leaf':true,'checked':false,'iconCls':'delete'},"
              text=text+"]},"
           end
           text=text+"]},"
         end
         text=text+"]},"
        end
        text=text + "]"
        render :text => text
     end
  end

  #获得用户菜单树
  def get_cd_qx_tree
    node, style = params["node"], params['style']
    if node == "root"
    data = User.find_by_sql("select * from  d_cd order by id;")
    text="["
    data.each do |dd|
      text=text+"{'text':'#{dd['cdmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'cls':'folder'},"
    end
    text=text + "]"
    render :text => text
    end
  end

  #获得用户列表
  def  get_user_grid
    user = User.find_by_sql("select * from  users order by id;")

    size = user.size;
    if size > 0 
     txt = "{results:#{size},rows:["
     for k in 0..user.size-1
       txt = txt + user[k].to_json + ','
     end
     txt = txt[0..-2] + "]}"
    else
     txt = "{results:0,rows:[]}"  
    end  
    render :text => txt
  end
  
  #获得用户树
  def get_user_tree
    node, style = params["node"], params['style']
    if node == "root"
      data = User.find_by_sql("select * from  users order by id;")
      text="["
      data.each do |dd|
      text=text+"{'text':'#{dd['email']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
    end
      text=text + "]"
      render :text => text
    end
  end
 
  #获得档案类别树
  def get_lb_tree
    node, style = params["node"], params['style']
    if node == "root"
      data = User.find_by_sql("select * from  d_dalb order by id;")
      text="[{'text':'档案类别','id' :'root1','leaf':false,'checked':false,'expanded':true,'cls':'folder','children':["
      data.each do |dd|
          text=text+"{'text':'#{dd['lbmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
      end
      text=text + "]}]"
      render :text => text
    end
  end
 	
 	#获得全宗档案类别树
  def get_qz_lb_tree
    if !(params['id'].nil?)
      if (params['id']=='')
        data = User.find_by_sql("select * from  d_dw_lb  order by id;")
        text="["
        data.each do |dd|
          text=text+"{'text':'#{dd['lbmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
        end
        text=text + "]"
        render :text => text         
      else
        data = User.find_by_sql("select * from  d_dw_lb where dwid = #{params['id']} order by id;")
        text="["
        data.each do |dd|
          text=text+"{'text':'#{dd['lbmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
        end
        text=text + "]"
        render :text => text
      end
    end
  end
  
  #获得全宗档案类别目录树
  def get_qz_lb_ml_tree
    if !(params['id'].nil?)
      if (params['id']=='')
         data = User.find_by_sql("select * from  d_dw_lb_ml  order by id;")
         text="["
         data.each do |dd|
           text=text+"{'text':'#{dd['mlhjc']}_#{dd['mlh']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
        end
        text=text + "]"
        render :text => text         
      else
        data = User.find_by_sql("select * from  d_dw_lb_ml where d_dw_lbid = #{params['id']} order by id;")
        text="["
        data.each do |dd|
          text=text+"{'text':'#{dd['mlhjc']}_#{dd['mlh']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
        end
        text=text + "]"
        render :text => text
       end
    end
  end
 
  #获得全宗档案类别
  def get_qz_lb
    data = User.find_by_sql("select * from  d_dw_lb where dwid = #{params['id']} order by id;")
    text=""
    data.each do |dd|
      if text==""
        text="#{dd['lbid']}" 
      else
        text=text+"|#{dd['lbid']}" 
      end
    end
    render :text => text      
  end
 
  #保存用户目录菜单权限
  def insert_qz_lb
    User.find_by_sql("delete from d_dw_lb where dwid = #{params['qzid']};")
    ss = params['insert_qx'].split('$')
    for k in 0..ss.length-1
      qx=ss[k].split(';')       
      if qx[0]=="root1"  
      else
        User.find_by_sql("insert into d_dw_lb(dwid, lbid, lbmc) values ('#{params['qzid']}', '#{qx[0]}','#{qx[1]}');")
      end
    end
    render :text => 'success'
  end

  #保存全宗档案类别目录
  def insert_qz_lb_ml
    user=User.find_by_sql("select *  from d_dw_lb_ml where d_dw_lbid = #{params['d_dw_lbid']}  and (mlhjc='#{params['mlhjc']}' or mlh='#{params['mlh']}');")
    size = user.size;
    if size == 0
      User.find_by_sql("insert into d_dw_lb_ml(d_dw_lbid, mlhjc, mlh) values ('#{params['d_dw_lbid']}', '#{params['mlhjc']}','#{params['mlh']}');")
      render :text => 'success'
    else
      render :text => '同一全宗档案类别下的目录号说明或目录号不能有重复，请重新输入目录号说明和目录。'
    end
  end
 
  #初使化全宗档案类别目录，根据archive表中的信息初使化全宗档案类别目录
  def ini_qz_lb_ml
    User.find_by_sql("delete from d_dw_lb_ml;")
    User.find_by_sql("delete from qx_mlqx;")
   user=User.find_by_sql("select distinct qzh,dalb, mlh from archive order by qzh,dalb, mlh;")
   size = user.size;
   if size > 0
     user.each do |dd|
      data=User.find_by_sql("select * from d_dw_lb where dwid='#{dd['qzh']}' and lbid='#{dd['dalb']}';")
      size1 = data.size;
      if size1 > 0
        User.find_by_sql("insert into d_dw_lb_ml(d_dw_lbid, mlhjc, mlh) values ('#{data[0]['id']}', '目录号#{dd['mlh']}','#{dd['mlh']}');")
      end
     end
     render :text => 'success'
   else
     render :text => 'archive表中无数据。'
   end
  end
 
  #获得用户权限
  def get_user_qx
    data = User.find_by_sql("select * from  qx_mlqx where user_id = #{params['userid']} order by id;")
    text=""
    data.each do |dd|
      if text==""
        text="#{dd['qxdm']}" + ";" +"#{dd['qxlb']}"
      else
        text=text+"|#{dd['qxdm']}" + ";" +"#{dd['qxlb']}"
      end
    end
    render :text => text      
  end
 
  #保存用户目录菜单权限
  def insert_user_qx
   User.find_by_sql("delete from qx_mlqx where user_id = #{params['userid']};")
   ss = params['insert_qx'].split('$')
   for k in 0..ss.length-1
     qx=ss[k].split(';')
     ids=qx[0].split('_')
     if qx[2]=="0"
       if ids.length==4
         id=ids[ids.length-2]
         User.find_by_sql("insert into qx_mlqx(qxdm, qxmc, user_id,qxid,qxlb,qx) values ('#{qx[0]}', '#{qx[1]}',#{params['userid']},'#{id}',#{ids.length-1},'#{ids[ids.length-1]}');")
       else
         id=ids[ids.length-1]
         User.find_by_sql("insert into qx_mlqx(qxdm, qxmc, user_id,qxid,qxlb) values ('#{qx[0]}', '#{qx[1]}',#{params['userid']},'#{id}',#{ids.length-1});")
       end
     else
       User.find_by_sql("insert into qx_mlqx(qxdm, qxmc, user_id,qxid,qxlb) values ('#{qx[0]}', '#{qx[1]}',#{params['userid']},'#{qx[0]}',4);")
     end
   end
    render :text => 'success'
  end

  #更新用户信息
  def update_user
   user=User.find_by_sql("select * from users where id <> #{params['id']} and email='#{params['email']}';")
   size = user.size
   if size == 0
     User.find_by_sql("update users set email='#{params['email']}', encrypted_password='#{params['encrypted_password']}' where id = #{params['id']};")
     txt='success'
   else
     txt= '用户名称已经存在，请重新输入用户名称。'
   end
   render :text => txt
  end
  
  #新增用户信息
  def insert_user
    user=User.find_by_sql("select * from users where  email='#{params['email']}';")
    size = user.size
    if size == 0
      User.find_by_sql("insert into users(email, encrypted_password) values ('#{params['email']}', '#{params['encrypted_password']}');")
      txt='success'
    else
      txt= '用户名称已经存在，请重新输入用户名称。'
    end
    render :text => txt
  end
  
  #删除用户信息
  def delete_user
    user=User.find_by_sql("delete from users where  id=#{params['id']};")

    
    render :text => 'success'
  end
  
  #删除档案类别目录信息
  def delete_qz_lb_ml
    user=User.find_by_sql("SELECT  d_dw_lb.dwid,d_dw_lb_ml.mlh,d_dw_lb.lbid FROM  d_dw_lb_ml, d_dw_lb WHERE  d_dw_lb.id = d_dw_lb_ml.d_dw_lbid and d_dw_lb_ml.id=#{params['id']};")   
    size = user.size;
    txt="";
    if size > 0 
      data=User.find_by_sql("select count(*) from archive where mlh='#{user[0]['mlh']}' and qzh='#{user[0]['dwid']}' and dalb='#{user[0]['lbid']}'")
      size1 = data[0]['count'];

      if size1.to_i > 0
        txt= '此目录号里面有数据。无法删除。'
      else
        User.find_by_sql("delete from d_dw_lb_ml where  id=#{params['id']};")
        txt= 'success'
      end
      
    else
      txt= '此目录号信息有问题。不能删除。'
    end
    render :text =>txt
  end
  
  #删除全宗信息
  def delete_qz
    user=User.find_by_sql("delete from d_dwdm where  id=#{params['id']};")
    render :text => 'success'
  end

  #获得全宗列表
  def get_qz_grid
    user = User.find_by_sql("select * from  d_dwdm order by id;")
    size = user.size;
    if size > 0 
     txt = "{results:#{size},rows:["
     for k in 0..user.size-1
       txt = txt + user[k].to_json + ','
     end
     txt = txt[0..-2] + "]}"
    else
     txt = "{results:0,rows:[]}"  
    end  
    render :text => txt
  end
  
  #更新全宗信息
  def update_qz
    user=User.find_by_sql("select * from d_dwdm where id <> #{params['id']} and dwdm='#{params['dwdm']}';")
    size = user.size
    if size == 0
      User.find_by_sql("update d_dwdm set dwdm='#{params['dwdm']}', dwjc='#{params['dwjc']}' where id = #{params['id']};")
      txt='success'
    else
      txt= '全宗名称已经存在，请重新输入全宗名称。'
    end
    render :text => txt
  end
  
  #新增全宗信息
  def insert_qz
    user=User.find_by_sql("select * from d_dwdm where  dwdm='#{params['dwdm']}';")
    size = user.size
    if size == 0
      User.find_by_sql("insert into d_dwdm(dwdm, dwjc) values ('#{params['dwdm']}', '#{params['dwjc']}');")
      txt='success'
    else
      txt= '全宗名称已经存在，请重新输入全宗名称。'
    end
    render :text => txt
  end
  
  def check_jylist
    jyid=""
    if !(params['jy_aj_list']=='')
      user = User.find_by_sql("select daid,jyid from jylist where  hdsj IS NULL and daid in (#{params['jy_aj_list']});")
      jyid=user[0]["jyid"]
      size = user.size;
      if size > 0
        txt = ""
        for k in 0..user.size-1
          if !(txt=='')
            txt = txt +"," + user[k]["daid"] 
          else
            txt =  user[k]["daid"] 
          end
        end
        user = User.find_by_sql("select dh from archive where  id in (#{txt});")
        txt=""
        for k in 0..user.size-1
          if !(txt=='')
            txt = txt +"," + user[k]["dh"] 
          else
            txt =  user[k]["dh"] 
          end
        end
        user = User.find_by_sql("select jyr from jylc where  id = #{jyid};")
        render :text => "档号为：" + txt+ "已被" +user[0]["jyr"] + "借走，请重新借阅。"
      else
        render :text => "success"
      end
    else
      render :text => "检查失败。"
    end
  end
  
  def export
    headers['Content-Type'] = "application/vnd.ms-excel"
    headers['Content-Disposition'] = 'attachment; filename="report.xls"'
    headers['Cache-Control'] = ''
    @users = User.find(:all)
  end
  
  #通过用户id来获得此用户可查看的目录tree
  def get_treeforuserid
    text = "[]"
    node, style = params["node"], params['style']
   

      if node == "root"
        data = User.find_by_sql("select * from  qx_mlqx where user_id=  #{params["userid"]} and qxlb=0 order by id;")
        text="["
        data.each do |dd|
          text=text+"{'text':'#{dd['qxmc']}','id' :'#{dd['qxdm']}','leaf':false,'cls':'folder','children':["
    
          dalb=User.find_by_sql("select * from d_dalb where sx<100 order by sx;")
          dalb.each do |lb|
            text=text+"{'text':'#{lb['lbdm']}#{lb['lbmc']}','id':'#{dd['qxdm']}_#{lb['id']}','leaf':false,'cls':'folder','children':["
            
            dalbml=User.find_by_sql("select * from  d_dalb where ownerid=  #{lb['id']} order by id;")
            dalbml.each do |lbml|
              text=text+"{'text':'#{lbml['lbmc']}','id' :'#{dd['qxdm']}_#{lbml['id']}','leaf':true,'cls':'folder'},"                  
           end
           text=text+"]},"
         end
         text=text+"]},"
        end
        text=text + "]"      
  #     data = User.find_by_sql("select * from  qx_mlqx where user_id=  #{params["userid"]} and qxlb=0 order by id;")
  #     text="["
  #     data.each do |dd|
  #       text=text+"{'text':'#{dd['qxmc']}','id' :'#{dd['qxdm']}','leaf':false,'cls':'folder','children':["
  #
  #       dalb=User.find_by_sql("select * from  qx_mlqx where user_id=  #{params["userid"]} and qxlb=1 and qxdm like '#{dd['qxdm']}_%' order by id;")
  #       dalb.each do |lb|
  #         text=text+"{'text':'#{lb['qxmc']}','id' :'#{lb['qxdm']}','leaf':false,'cls':'folder','children':["
  #         dalbml=User.find_by_sql("select * from  qx_mlqx where user_id=  #{params["userid"]} and qxlb=2 and qxdm like '#{lb['qxdm']}_%' order by id;")
  #         dalbml.each do |lbml|
  #           text=text+"{'text':'#{lbml['qxmc']}','id' :'#{lbml['qxdm']}','leaf':true,'cls':'folder'},"
  #           
  #
  #        end
  #        text=text+"]},"
  #      end
  #      text=text+"]},"
  #     end
  #     text=text + "]"
        
     end

    render :text => text
  end
# #根据dw_lbid 获得档案类别
#
# def get_dalb
#   ss = params['dalb'].split('_')
#      txt=""
#      dalb = User.find_by_sql("select * from d_dw_lb where id =  '#{ss[1]}';")
#      size = dalb.size;
#      if size>0
#        txt=dalb[0]['lbid']
#      else
#        txt="0"
#      end
#      render :text => txt
# end
  #根据dw_lbid 获得档案目录号
 
  def get_mlh
    ss = params['dalb']
       txt=""
       dalb = User.find_by_sql("select * from d_dw_lb_ml where id =  '#{ss}';")
       size = dalb.size;
       if size>0
         txt=dalb[0]['mlh']
       else
         txt="0"
       end
       render :text => txt
  end
  #根据dw_lbid 获得最大案卷号
 
  def get_max_ajh
    ss = params['dalb'].split('_')
       txt=""
       if params['qx']==true
         dalb = User.find_by_sql("select * from d_dw_lb_ml where id =  '#{ss[2]}';")
         size = dalb.size;
         if size>0
           #txt=dalb[0]['mlh']
           ajh= User.find_by_sql("select max(ajh) from archive where mlh ='#{dalb[0]['mlh']}' and qzh='#{ss[0]}' and dalb='#{ss[1]}';")
           size=ajh.size;
           txt=ajh[0]["max"].to_i+1;
         else
           txt="0"
         end
       else
          ajh= User.find_by_sql("select max(ajh) from archive where mlh ='#{ss[2]}' and qzh='#{ss[0]}' and dalb='#{ss[1]}';")
          size=ajh.size;
          txt=ajh[0]["max"].to_i+1;
       end
       render :text => txt
  end
  #通过权限代码来获得archive
  def get_archive_qxdm
    if (params['query'].nil?)
      txt = "{results:0,rows:[]}"
    else
      ss = params['query'].split('_')
      if ss.length==3
        data=User.find_by_sql("select * from d_dw_lb_ml where id = '#{ss[2]}';")
        size = data.size;
      
        if size>0
          
            user = User.find_by_sql("select count(*) from archive where qzh = '#{ss[0]}' and dalb = '#{ss[1]}' and mlh = '#{data[0]['mlh']}';")
            size = user[0].count;
  
            if size.to_i > 0
                txt = "{results:#{size},rows:["
                case (ss[1]) 
									when "0"
										user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{data[0]['mlh']}' order by ajh limit #{params['limit']} offset #{params['start']};")
									 
									when "2"
										user = User.find_by_sql("select archive.*,a_jhcw.* from archive,a_jhcw where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{data[0]['mlh']}' and archive.id=a_jhcw.ownerid order by ajh limit #{params['limit']} offset #{params['start']};")
										
									when "3"
										user = User.find_by_sql("select archive.*,a_tddj.* from archive,a_tddj where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{data[0]['mlh']}' and archive.id=a_tddj.ownerid order by ajh limit #{params['limit']} offset #{params['start']};")
									when "24"
										user = User.find_by_sql("select archive.tm,archive.dalb,archive.qzh,a_wsda.* from archive,a_wsda where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{data[0]['mlh']}' and archive.id=a_wsda.ownerid order by ajh limit #{params['limit']} offset #{params['start']};")
                  
									else
										user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{data[0]['mlh']}' order by ajh limit #{params['limit']} offset #{params['start']};")
										
								end
                
                size = user.size;
                for k in 0..user.size-1
                    txt = txt + user[k].to_json + ','
                end
                txt = txt[0..-2] + "]}"
            else
                txt = "{results:0,rows:[]}"
            end
          
        else
          txt = "{results:0,rows:[]}"
        end
      else
        
          user = User.find_by_sql("select count(*) from archive where qzh = '#{ss[0]}' and dalb = '#{ss[1]}' ;")
          size = user[0].count;

          if size.to_i > 0
              txt = "{results:#{size},rows:["
              case (ss[1]) 
								when "0"
									user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'  order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
									
								when "2"
									user = User.find_by_sql("select archive.*,a_jhcw.* from archive,a_jhcw where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'  order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
									
								when "3" 
									user = User.find_by_sql("select archive.*,a_tddj.* from archive,a_tddj where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'  and archive.id=a_tddj.ownerid order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
								when "24"
									user = User.find_by_sql("select archive.tm,archive.dalb,archive.qzh,a_wsda.* from archive,a_wsda where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}'  and archive.id=a_wsda.ownerid order by ajh limit #{params['limit']} offset #{params['start']};")
									
								else
									user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'  order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
									
							  end
              
              size = user.size;
              for k in 0..user.size-1
                  txt = txt + user[k].to_json + ','
              end
              txt = txt[0..-2] + "]}"
          else
              txt = "{results:0,rows:[]}"
          end
        
      end
    end
    render :text => txt
  end
  #新增案卷目录
    	def insert_archive
    	  case params['dalb']
  	    when "0"
  	      dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']
    	    User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,xh,cfwz) values('#{params['mlh']}','#{params['flh']}','#{params['ajh']}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}') ")
        when "2"
          User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb) values('#{params['mlh']}','#{params['flh']}','#{params['ajh']}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{params['dh']}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}') ")
        when "3"
          User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb) values('#{params['mlh']}','#{params['flh']}','#{params['ajh']}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{params['dh']}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}') ")
        when "24"
          User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb) values('#{params['mlh']}','#{params['flh']}','#{params['ajh']}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{params['dh']}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}') ")
        else
          dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']
          User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb) values('#{params['mlh']}','#{params['flh']}','#{params['ajh']}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}') ")
        end
    	  render :text => 'success'
    	end

  def scan_aj
    qz_path = params['qz_path']
    if !qz_path.nil?
      system("./dady/bin/scan_aj.rb ./dady/tmp1/#{qz_path}")
    end
    render :text => 'Success'
  end  
  
  def get_qzgl_store
    user = User.find_by_sql("select * from q_qzxx where qzh=#{params['qzh']} order by mlh;")
    size = user.size;
    if size > 0
        txt = "{results:#{size},rows:["
        for k in 0..user.size-1
            txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
    else
        txt = "{results:0,rows:[]}"
    end
    render :text => txt  
  end 
  
  def print_selected_qztj

    User.find_by_sql("delete from p_status where id in (#{params['id']});")
    
    qzh, mlh, dalb, qajh, zajh = params['qzh'], params['mlh'], params['dalb'], params['qajh'], params['zajh']
    dydh = "#{qzh}_#{dalb}_#{mlh}"
    User.find_by_sql("delete from p_status where dydh='#{dydh}';")
    User.find_by_sql("insert into p_status (dydh, mlh, dqjh, qajh, zajh, dyzt, dylb) values ('#{dydh}', '#{mlh}', '#{qajh}', '#{qajh}', '#{zajh}', '未打印', '#{sprintf("%02b", dylb)}');")
    render :text => 'Success'
    
  end
  
  def import_selected_aj
  
  end
  
  def import_selected_image
    
  end
  
  def export_selected_image
    
  end
  
        
end