class MapController < ApplicationController

  def get_temp
    
    #render :text=>"{\"sd\":\"45\",\"wd\":\"25.6\"}"
    xzmc = params['xzmc']
    conn = PGconn.open(:dbname=>'WSD', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
    user = conn.exec("select dqwd, dqsd, dqdl from d_wsd where xzmc = '#{xzmc}' ;")[0]
    conn.close
    
    #ss = {"mode" => "1", "result" => user.to_json}
    render :text => user.to_json
    
  end
  
  #search=%@&dalb=%@&offset=%d&qzh=%d
  def search_aj
    user = User.find_by_sql("select * from archive where tm like '%#{params['search']}%' and qzh = '#{params['qzh']}' limit 10;")
    render :text=>user.to_json
  end 
  
  #返回和保存借还档列表
  def get_dalb 
    user = User.find_by_sql "select distinct dalb, dalb || ' ' || d_dalb.lbmc || '(' || count(*) || ')' as dd, d_dalb.lbmc from q_qzxx, d_dalb where qzh=#{params['qzh']} and d_dalb.id = dalb group by dalb, d_dalb.lbmc order by dalb;"
    outstr = ''
    for k in 0..user.size-1
      outstr = outstr + user[k].dd + ','
    end 
    render :text => outstr[0..-2] 
  end

  #获取影像文件列表 http://192.168.113.40:3000/map/get_imageList?dh=12-0-2-106
  def get_imageList
    ss = []

    user= User.find_by_sql("select id, yxbh from timage where dh='#{params['dh']}' and (yxbh like '%ML%' and yxbh not like 'MLBK%') order by yxbh;") 
    for k in 0..user.size-1
      ss << "#{user[k].id} #{user[k].yxbh}"
    end

    user= User.find_by_sql("select id, yxbh from timage where dh='#{params['dh']}' and yxbh not like '%ML%' order by yxbh;") 
    for k in 0..user.size-1
      ss << "#{user[k].id} #{user[k].yxbh}"
    end

    user= User.find_by_sql("select id, yxbh from timage where dh='#{params['dh']}' and yxbh like 'MLBK%' order by yxbh;") 
    for k in 0..user.size-1
      ss << "#{user[k].id} #{user[k].yxbh}"
    end

    text = ss.join(",")
    render :text => text
  end
  
  #通过ID获取影像文件
  def get_timage
    if (params['gid'].nil?)
      txt = ""
    else
      user = User.find_by_sql("select id, dh, yxmc, jm_tag,width,height from timage where id=#{params['gid']};")
      dh,width,height = user[0]['dh'], user[0]['width'], user[0]['height']

      if !File.exists?("./dady/img_tmp/#{dh}/")
        system"mkdir -p ./dady/img_tmp/#{dh}/"        
      end
      
      convert_filename = "./dady/img_tmp/#{dh}/"+user[0]["yxmc"].gsub('$', '-').gsub('TIF','JPG').gsub('tif','JPG')
      local_filename = "./dady/img_tmp/#{dh}/"+user[0]["yxmc"].gsub('$', '-')

      if !File.exists?(local_filename)
        user = User.find_by_sql("select id, dh, yxmc, data, jm_tag from timage where id=#{params['gid']};")
        
        tmpfile = rand(36**10).to_s(36)
        ff = File.open("./tmp/#{tmpfile}",'w')
        ff.write(user[0]["data"])
        ff.close
        puts "./tmp/#{tmpfile} #{local_filename}"
        if (user[0]['jm_tag'].to_i == 1)
          system("decrypt ./tmp/#{tmpfile} #{local_filename}")
        else
          system("scp ./tmp/#{tmpfile} #{local_filename}")
        end 
        system("rm ./tmp/#{tmpfile}")
      end
      
      system("convert '#{local_filename}' '#{convert_filename}'")
      
      if width.to_i > height.to_i
        txt = "/assets/#{convert_filename}?1".gsub('/assets/./dady/img_tmp/', '/timage/')
      else
        txt = "/assets/#{convert_filename}?2".gsub('/assets/./dady/img_tmp/', '/timage/')
      end
    end
    render :text => txt
  end

  def get_jyList
    #intjhd 1代表还回借档列表，2代表还回还档案列表。intzt 1代表显示，2代表结束显示
    if params['zt'] == 2 
        User.find_by_sql("update jylist set iPhoneList=3 where iPhoneList='#{params['jhd']}';") 
        text="success"         
    else
      user= User.find_by_sql("SELECT  archive.boxstr,archive.mlh,archive.ajh,archive.rfidstr,d_dalb.lbmc,archive.tm,jylc.jyr, jylc.jysj  FROM jylist, jylc,archive,d_dalb WHERE jylist.jyid = jylc.id and jylist.daid=archive.id and cast(archive.dalb as integer)=d_dalb.id and jylist.iPhoneList='#{params['jhd']}';")
      #boxstr,目录号,案卷号,标签ID,档案类别,案卷标题,借阅人,借阅时间
      size = user.size;
      if size.to_i > 0
          text = "{\"results\":#{size},\"rows\":["          
          for k in 0..user.size-1
              text = text + user[k].to_json + ','
          end
          text = text[0..-2] + "]}"
      else
          text = "{\"results\":0,\"rows\":[]}"
      end
    end
    render :text => text
  end
  
  
  #add at 05/20 by liujun
  def get_quanz
    qzh=params['qzh']
    user = User.find_by_sql("select * from q_qzxx where qzh = '#{qzh}' order by mlh;")
    render :text => user.to_json
  end
  
  
  def resetShelf
    dh = params['dh']
    User.find_by_sql("update archive set boxstr='' where dh like '#{dh}-%';")
    render :text => "Success"
  end
  
  #返回温湿度记录
  def  WsWsd
    #'intxl 1代表返回指定日期的最后一个小时的温湿度记录，2代表返回指定日期的全部温湿度记录
    if intlx==1
      user= User.find_by_sql("select * from wsd  where rq='#{strrq}' order by sj  DESC;") 
      size = user.size;
      if size.to_i>0
        user= User.find_by_sql("select * from wsd  where rq='#{strrq}' and sj='#{user[0]["sj"]}';")
      end
    else
      user= User.find_by_sql("select * from wsd  where rq='#{strrq}' order by sj;") 
    end
    size = user.size;
    if size.to_i > 0
        text = "{\"results\":#{size},\"rows\":["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{\"results\":0,\"rows\":[]}"
    end
    render :text => text
  end
  
  #上架
  def wsRfidSetup
    # 设置成功 传入参数不能为空 strRfid此标签不存在或此标签不是盒标签 设置失败在保存的时候报错 strrfid传入格式有问题
    rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
    tt=params['strRfid'].split('|')
    for k in 0..tt.size-1
      if tt[k]!=''
        ss=tt[k].split(',')
        if ss.size>=4
          if ss[0]==""
            User.find_by_sql("INSERT INTO bcerr (boxstr,ErrLx,user_id,rq, qajh, zajh) values ('#{ss[1]}', 2,'#{ss[3]}', TIMESTAMP '#{rq}', #{ss[4]}, #{ss[5]});") 

          else  
            User.find_by_sql("UPDATE ARCHIVE set boxstr='#{ss[1]}' where boxrfid= '#{ss[0]}';") 
            if ss[2].to_i == 1
              User.find_by_sql("INSERT INTO bcerr (boxstr,bcid,ErrLx,user_id,rq, qajh, zajh) values ('#{ss[1]}', '#{ss[0]}',1,'#{ss[3]}','#{rq}',#{ss[4]}, #{ss[5]});") 
            else
              User.find_by_sql("INSERT INTO bcerr (boxstr,bcid,ErrLx,user_id,rq, qajh, zajh) values ('#{ss[1]}', '#{ss[0]}',0,'#{ss[3]}','#{rq}',#{ss[4]}, #{ss[5]});") 
            end
          end  
        end
      end
    end
    render :text => "Success" 
  end
  
  def wsPk    
    #errlx 1 -- 正常（棕色）， 2 -- 标签读不出来（红色） 3 -- 未发现案卷 （紫色） 4 -- 异常标签
    if !params['query'].nil?
        rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
        qq = params['query'].split('|')
        for k in 0..qq.size-1
          if qq[k]!=""
            ss=qq[k].split(',')
            if ss[0]!=""                       
              user = User.find_by_sql("INSERT INTO pkerr (rfidstr, archive_id, errlx, dqhbq, gshbq, user_id, rq, cs, sj) values('#{ss[0]}', '#{ss[1]}',#{ss[2]}, '#{ss[3]}','#{ss[4]}', '#{ss[5]}', TIMESTAMP '#{rq}', '#{ss[6]}','#{ss[7]}');")
            end
          end
        end
        User.find_by_sql("update pkerr set dh=archive.dh, ajh=archive.ajh from archive where archive.id = pkerr.archive_id;")
    end
    render :text =>"Success"
  end
  
  #增加全部说明
  def get_qztj
    user = User.find_by_sql("select qzh, count(*) as mls, sum(zajh) as ajs, d_dwdm.dwdm from q_qzxx inner join d_dwdm on q_qzxx.qzh = d_dwdm.id group by qzh, d_dwdm.dwdm;")
    render :text => user.to_json
  end
  
  
  #0524 by Liu JUN
  def report_zt
    dh, zt = params['dh'], params['zt']
    User.find_by_sql("update q_qzxx set zt='#{zt}' where dh_prefix='#{dh}';")
    render :text => 'Success'
  end
  
  
  #Add by Wu 
  #通过RFID获取档案
  def wsRFID(strrfid)
    user=User.find_by_sql("select * from archive  where rfidstr=  '#{strrfid}';") 
    size = user.size;
    if size.to_i > 0
        text = "{\"results\":#{size},\"rows\":["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{\"results\":0,\"rows\":[]}"
    end
    render :text => text
  end
  
  #通过档号获取整目录档案  query 格式  qzh_dalb_mlh(文书处理24的mlh格式为 年度_机构问题号_保管期限 )
  def wsAjToTxt
    dh = params['query']
    ss = params['query'].split('-')

    case (ss[1]) 
  		when "0"
  			user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm = '#{ss[2]}' order by ajh ;")

  		when "2"
  			user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}'  order by ajh ;")

  		when "3","5","6","7"
  			user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm = '#{ss[2]}'  order by ajh ;")
  		when "15"
  			user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}'  order by ajh ;")
      when "18"
  			user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}'  order by ajh ;")
      when "25"
  			user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}'  order by ajh ;")
      when "27"
  			user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}' order by ajh ;")
      when "26"
  			user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}'  order by ajh ;")
      when "28"
  			user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}'  order by ajh ;")
      when "29"
  			user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}'  order by ajh ;")
      when "30"
  			user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by djh ;")
      when "31"
  			user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by zt ;")
      when "32"
  			user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by jgmc ;")
      when "33"
  			user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by fsrq ;")
      when "34"
  			user = User.find_by_sql("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by sj ;")

  		when "24"
        strwhere="where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlm =  '#{ss[2]}'  order by ajh "
        user = User.find_by_sql("select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.mlm,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere} ;")

  		else
  			user = User.find_by_sql("select * from archive where dh like '#{dh}-%' order by ajh ;")

  	end

    render :text => user.to_json
  end
  

  #通过RFID获取档案
  def get_archiveByRfid
    user=User.find_by_sql("select * from archive where rfidstr='#{params['rfidstr']}';") 
    size = user.size;
    if size.to_i > 0
        text = "{\"results\":#{size},\"rows\":["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{\"results\":0,\"rows\":[]}"
    end
    render :text => text
  end
  
  

  
  #通过RFID获取档案
  def wsRFID
    strrfid = params['strrfid']
    user=User.find_by_sql("select * from archive  where rfidstr=  '#{strrfid}';") 
    size = user.size;
    if size.to_i > 0
        text = "{\"results\":#{size},\"rows\":["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{\"results\":0,\"rows\":[]}"
    end
    render :text => text
  end
  

  
  #通过RFID获取档案
  def get_archiveByRfid
    user=User.find_by_sql("select * from archive where rfidstr='#{params['rfidstr']}';") 
    size = user.size;
    if size.to_i > 0
        text = "{\"results\":#{size},\"rows\":["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{\"results\":0,\"rows\":[]}"
    end
    render :text => text
  end

  #通过ID获取影像文件
  def wsImage(gid)
    user= User.find_by_sql("select * from timage  where id=#{gid};") 
    size = user.size;
    if size.to_i > 0
      dh = user[0]['dh']
      if !File.exists?("./dady/img_tmp/#{dh}/")
        system"mkdir -p ./dady/img_tmp/#{dh}/"
      end
      local_filename = "./dady/img_tmp/#{dh}/"+user[0]["yxmc"].gsub('$', '-').gsub('TIF','JPG')
      if !File.exists?(local_filename)
        user = User.find_by_sql("select id, dh, yxmc, data from timage where id='#{gid}';")
        File.open(local_filename, 'w') {|f| f.write(user[0]["data"]) }
      end
      small_filename = "./dady/img_tmp/#{dh}/"+user[0]["yxmc"].gsub('$', '-').gsub('TIF','JPG')
      puts("convert -resize 20% '#{local_filename}' '#{small_filename}'")
      system("convert -resize 20% '#{local_filename}' '#{small_filename}'")
      txt = "/assets/dady/img_tmp/#{dh}/#{user[0]["yxmc"].gsub('$', '-')}".gsub('TIF','JPG')
    else
      txt=""
    end
    render :text => txt
  end
  #获取未写　未绑案卷
  def get_cs_data_wb
    if params['query']==""
      user= User.find_by_sql("select id,dwdm from d_dwdm order by id;") 
    else
      query=params['query'].split('_')
      if query.length==1
        user= User.find_by_sql("select id,lbmc from d_dalb where id<100 order by id ;") 
        
      else
        if query.length==2
          if query[1]=="24"
            user= User.find_by_sql("select distinct a_wsda.nd,a_wsda.bgqx,a_wsda.jgwth from archive left join a_wsda on archive.id=a_wsda.ownerid where qzh='#{query[0]}' and dalb='#{query[1]}' order by a_wsda.nd;")
          else
            user= User.find_by_sql("select distinct mlh from archive    where qzh='#{query[0]}' and dalb='#{query[1]}' order by mlh;") 
          end
        else
          ss = params['query'].split('_')
          strwhere=" where (boxrfid='' or rfidstr='' or boxrfid is null or rfidstr is null) and qzh = '#{ss[0]}'"          
          if ss[1]!=""
            strwhere=strwhere + " and dalb='#{ss[1]}'"
          end
          if ss[2]!=""
            strwhere=strwhere + " and mlh='#{ss[2]}'"
          end
          case (query[1]) 
      			when "0"
      				user = User.find_by_sql("select * from archive  #{strwhere} order by ajh ;")

      			when "2"
      				user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid  #{strwhere} order by ajh ;")

      			when "3","5","6","7"
      				user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}' #{strwhere} order by ajh ;")
      			when "15"
      				user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid  #{strwhere} order by ajh ;")
            when "18"
      				user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid  #{strwhere}  order by ajh ;")
            when "25"
      				user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid  #{strwhere}  order by ajh ;")
            when "27"
      				user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid  #{strwhere} order by ajh ;")
            when "26"
      				user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid   #{strwhere} order by ajh ;")
            when "28"
      				user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid  #{strwhere} order by ajh ;")
            when "29"
      				user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid  #{strwhere} order by ajh ;")
            when "30"
      				user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid  #{strwhere}  order by djh ;")
            when "31"
      				user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid  #{strwhere}  order by zt ;")
            when "32"
      				user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid  #{strwhere}  order by jgmc ;")
            when "33"
      				user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid  #{strwhere}  order by fsrq ;")
            when "34"
      				user = User.find_by_sql("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid  #{strwhere}  order by sj ;")

      			when "24"
      			  #年度_保管期限_机构问题号
      			  case ss.length
      		      when 3
      		        strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}' #{strwhere}"
      	        when 4
      	          strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}' and a_wsda.bgqx='#{ss[3]}' #{strwhere}"
                when 5
                  strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}' and a_wsda.bgqx='#{ss[3]}' and a_wsda.jgwth='#{ss[4]}' #{strwhere}"
                else
                  strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' #{strwhere}"

              end
              user = User.find_by_sql("select rfidstr,boxrfid,boxstr,archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   order by nd,bgqx,jgwth,jh ;")
      			else
      				user = User.find_by_sql("select * from archive  #{strwhere} order by ajh ;")

      		end
        end
      end
    end
    size = user.size;
    if size.to_i > 0
      text = "["          
      for k in 0..user.size-1
        user[k]["tm"]=user[k]["tm"].gsub("\"","") if !user[k]["tm"].nil?
          text = text + user[k].to_json + ','
      end
      text = text[0..-2] + "]"
    else
      text = ""
    end
    render :text => text
  end
  #为CS程序提供数据
  def get_cs_data
    if params['query']==""
      user= User.find_by_sql("select id,dwdm from d_dwdm order by id;") 
    else
      query=params['query'].split('_')
      if query.length==1
        user= User.find_by_sql("select id,lbmc from d_dalb where id<100 order by id ;") 
        
      else
        if query.length==2
          if query[1]!="200"
            if query[1]=="24"
              user= User.find_by_sql("select distinct a_wsda.nd,a_wsda.bgqx,a_wsda.jgwth from archive left join a_wsda on archive.id=a_wsda.ownerid where qzh='#{query[0]}' and dalb='#{query[1]}' order by a_wsda.nd;")
            else
              user= User.find_by_sql("select distinct mlh from archive    where qzh='#{query[0]}' and dalb='#{query[1]}' order by mlh;") 
            end
          else
            user= User.find_by_sql("select  mlh from q_qzxx    where qzh='#{query[0]}'  order by mlm;") 
          end
        else
          ss = params['query'].split('_')
          strwhere=" where qzh = '#{ss[0]}'"
          if ss[1]!=""
            strwhere=strwhere + " and dalb='#{ss[1]}'"
          end
          if ss[2]!=""
            strwhere=strwhere + " and mlh='#{ss[2]}'"
          end
          if ss.length==4
            if ss[3]!=""
              if ss[3].length>3
                strwhere=strwhere + " and ajh='#{ss[3]}'"
              else
                strwhere=strwhere + " and ajh='" + sprintf("%04d", ss[3]) + "'"
              end
            
            end
          end
          if ss.length==5
            if ss[4]!=""              
                strwhere=strwhere + " and ajh>='#{ss[3].rjust(4,"0")}' and ajh<='#{ss[4].rjust(4,"0")}'"                          
            end
          end
          case (query[1]) 
      			when "0"
      				user = User.find_by_sql("select * from archive #{strwhere} order by ajh ;")

      			when "2"
      				user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid #{strwhere}  order by ajh ;")

      			when "3","5","6","7"
      				user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid #{strwhere}  order by ajh ;")
      			when "15"
      				user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid #{strwhere}  order by ajh ;")
            when "18"
      				user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid #{strwhere}  order by ajh ;")
            when "25"
      				user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid #{strwhere}  order by ajh ;")
            when "27"
      				user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid #{strwhere} order by ajh ;")
            when "26"
      				user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid #{strwhere}  order by ajh ;")
            when "28"
      				user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid #{strwhere}  order by ajh ;")
            when "29"
      				user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid #{strwhere}  order by ajh ;")
            when "30"
      				user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid #{strwhere}   order by djh ;")
            when "31"
      				user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid #{strwhere}   order by zt ;")
            when "32"
      				user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid #{strwhere}   order by jgmc ;")
            when "33"
      				user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid #{strwhere}   order by fsrq ;")
            when "34"
      				user = User.find_by_sql("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid #{strwhere}   order by sj ;")

      			when "24"
      			  #年度_保管期限_机构问题号
      			  case ss.length
      		      when 3
      		        strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}'"
      	        when 4
      	          strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}' and a_wsda.bgqx='#{ss[3]}'"
                when 5
                  strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}' and a_wsda.bgqx='#{ss[3]}' and a_wsda.jgwth='#{ss[4]}'"
                else
                  strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}'"

              end
              
              user = User.find_by_sql("select rfidstr,boxrfid,boxstr,archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   order by nd,bgqx,jgwth,jh ;")
      			else
      				user = User.find_by_sql("select * from archive #{strwhere} order by ajh ;")

      		end
        end
      end
    end
    size = user.size;
    if size.to_i > 0
      text = "["          
      for k in 0..user.size-1
        user[k]["tm"]=user[k]["tm"].gsub("\"","") if !user[k]["tm"].nil?
        text = text + user[k].to_json + ','
      end
      text = text[0..-2] + "]"
    else
      text = ""
    end
    render :text => text
  end
  #把标签值写入数据库
  def set_rfid
    if params['query']!=""
      query=params['query'].split('_')
      if query.length==2
        if query[1]!=""
          user = User.find_by_sql("select * from  archive where rfidstr='#{query[1]}' and id <> '#{query[0]}'  ;")
          size=user.size
          if size.to_i>0
            text=(query[1].to_s + "此标签已经存在，id为：" + user[0]['id'].to_s).to_json
          else
            user = User.find_by_sql("update archive set rfidstr='#{query[1]}' where id = '#{query[0]}'  ;")
            text="success"
          end
        else
          text="false"
        end
        
      else
        text="false"
      end 
    else
      text="false" 
    end
    render :text => text
  end
  #卷标签绑定盒
  def set_boxrfid
    if params['query']!="" && params['strrfid']!=""
    
        
        jy_rfid=params['query'].split('_')
        rfid=""
        for k in 0..jy_rfid.size-1
          if rfid==""
            rfid="'" + jy_rfid[k] + "'"
          else
            rfid=rfid +",'" + jy_rfid[k] + "'"
          end
        end
            user = User.find_by_sql("update archive set boxrfid='#{params['strrfid']}' where rfidstr in (#{rfid})  ;")
            
            text="success"
        
      
    else
      text="" 
    end
    render :text => text
  end
  #标签校验提取数据
  def get_rfidjy_data
    if params['jy_box_rfid']!="" && params['jy_rfid']!=""
      jy_rfid=params['jy_rfid'].split('_')
      rfid=""
      for k in 0..jy_rfid.size-1
        if rfid==""
          rfid="'" + jy_rfid[k] + "'"
        else
          rfid=rfid +",'" + jy_rfid[k] + "'"
        end
      end
      user = User.find_by_sql("select * from  archive where  boxrfid='#{params['jy_box_rfid']}' and rfidstr in (#{rfid})  ;")
      size = user.size;
      if size.to_i > 0
        text = "["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]"
      else
        text = ""
      end
    else
      text="" 
    end
    render :text => text
  end
  
  #标签门禁提取数据
  def get_rfidmj_data
    if  params['jy_rfid']!=""
      rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
      jy_rfid=params['jy_rfid'].split('_')
      rfid=""
      for k in 0..jy_rfid.size-1
        if rfid==""
          rfid="'" + jy_rfid[k] + "'"
        else
          rfid=rfid +",'" + jy_rfid[k] + "'"
        end
      end
      user = User.find_by_sql("select * from  archive where  rfidstr in (#{rfid})  ;")
      size = user.size;
      if size.to_i > 0
        text = ""          
        for k in 0..user.size-1
          jylist = User.find_by_sql("select * from jylist where hdsj is null and daid=#{user[k]['id']}  ;")
          sizejy=jylist.size
          if sizejy>0
            sizejy=1
          else
            sizejy=0
          end
          
          if user[k]['dalb']=='24'
            doc=User.find_by_sql("select * from  a_wsda where  ownerid=#{user[k]['id']};")
            size1=doc.size;
            if size1.to_i > 0
              updatemj= User.find_by_sql("INSERT INTO mjerr (tm,dalb,mlh,ajh,sfcl,rq,errLx,daid) values ('#{doc[0]['tm']}',24,'#{doc[0]['nd']}_#{doc[0]['bgqx']}','#{doc[0]['jgwth']}_#{doc[0]['jh']}',0,'#{rq}', #{sizejy},#{user[k]['id']});")
              if text==''
                text=doc[0]['nd']+","+doc[0]['bgqx']+","+doc[0]['jgwth']+","+doc[0]['jh']+","+sizejy.to_s
              else
                text=text + ";"+doc[0]['nd']+","+doc[0]['bgqx']+","+doc[0]['jgwth']+","+doc[0]['jh']+","+sizejy.to_s
              end
            end
          else
            updatemj= User.find_by_sql("INSERT INTO mjerr (tm,dalb,mlh,ajh,sfcl,rq,errLx,daid) values ('#{user[k]['tm']}',#{user[k]['dalb']},'#{user[k]['mlh']}','#{user[k]['ajh']}',0,'#{rq}', #{sizejy},#{user[k]['id']});")
            if text==''
              text=user[k]['mlh']+","+user[k]['ajh']+","+sizejy.to_s
            else
              text=text + ";"+user[k]['mlh']+","+user[k]['ajh']+","+sizejy.to_s
            end
          end
            
        end
        
      else
        text = ""
      end
    else
      text="" 
    end
    render :text => text
  end
  
  
  #获取门禁报警信息   是否处理过（０代表未处理过，１代表处理过）_是否不正常带出(１代表正常借出，0代表非正常带出)
  def get_mjerr_data
    if params['query']!=""
      query=params['query'].split('_')
      if query.size==2
          user=User.find_by_sql("select * from  mjerr where sfcl=#{query[0]} and errlx=#{query[1]} order by rq;")    
          size = user.size;
          if size.to_i > 0
            text = "["          
            for k in 0..user.size-1
              user[k]["clyj"]=user[k]["clyj"].gsub("\"","") if !user[k]["clyj"].nil?
              text = text + user[k].to_json + ','
            end
            text = text[0..-2] + "]"
          else
            text = ""
          end   
      else
        text=""
      end
    else
      text=""
    end
    render :text => text
  end


  #更新门禁报警处理信息
  def update_mjerr
    if params['mjid']!=""
      user=User.find_by_sql("update  mjerr set sfcl=1,clyj='#{params['clyj']}' where id in (#{params['mjid']})  ;")
      text="success"
    else
      text="false"
    end
    render :text => text
  end

  #标签组卷提取数据
  def get_rfidzj_data
    if  params['jy_rfid']!=""
      jy_rfid=params['jy_rfid'].split('_')
      rfid=""
      for k in 0..jy_rfid.size-1
        if rfid==""
          rfid="'" + jy_rfid[k] + "'"
        else
          rfid=rfid +",'" + jy_rfid[k] + "'"
        end
      end
      user = User.find_by_sql("select * from  archive where  rfidstr in (#{rfid})  order by ajh;")
      size = user.size;
      if size.to_i > 0
        text = "["          
        for k in 0..user.size-1
          user[k]["tm"]=user[k]["tm"].gsub("\"","") if !user[k]["tm"].nil?
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]"
      else
        text = ""
      end
    else
      text="" 
    end
    render :text => text
  end

  def get_bkError
    dh = params['dh']
    if !(params['bindStr'] == "")
      bindstr = params['bindStr'][0..-2]
      user = User.find_by_sql("update bcerr set zt=1 where id in (#{bindstr});") 
    end    
    user = User.find_by_sql("select * from bcerr where zt=0 and errlx > 0;")
    render :text => user.to_json
  end


  def get_pkError
    dh = params['dh']
    if !(params['bindStr'] == "")
      bindstr = params['bindStr'][0..-2]
      ss = bindstr.split("|")
      for k in 0..ss.size-1
        tt = ss[k].split('-')
        user = User.find_by_sql("update pkerr set zt=1, errlx=#{tt[1]} where id = #{tt[0]};") 
      end  
    end    
    user = User.find_by_sql("select * from pkerr where zt=0 and errlx > 1 and dh like '#{dh}-%';")
    render :text => user.to_json
  end

  def yhdl
    username=params['username']
    password=params['password']
    users = User.find_by_sql("select * from users where username='#{username}' ;")
    txt='failed'
    if users.size > 0
      user = users[0]
      if user.valid_password?password
        txt = 'Success'
      end
    end
    render :text => txt
  end
  
  def get_device_list
    username = params['username']
    dd = User.find_by_sql("select id from users where username='#{username}';")

    txt = ""
    if dd.size > 0
      user = User.find_by_sql("select zn_sb.id, sbmc, ssly || '-' || sslc || '-' || ssfj  as dh, sblx, sbmc, kgzt from zn_sb inner join u_sb on zn_sb.id=u_sb.sbid where userid = #{dd[0]['id']} order by zn_sb.id;")
      txt = user.to_json
    end
    render :text => txt   
  end  

  def check_device_zt
    device_id = params['device_id']
    txt = ""
    user = User.find_by_sql("select kgzt,ktzt from zn_sb where id = #{device_id};")
    txt = user.to_json
    render :text => txt   
  end
  
  def get_mc_imageList
    user = User.find_by_sql("select yxmc from mc_image where device_id = #{params['device_id']} and yxmc is not null order by created_at desc limit 10;")
    jpg = []
    for k in 0..user.size-1
      jpg  << user[k]['yxmc']
    end  
    render :text => jpg.join(" ")
  end

  def set_device_zt  #{"device_id"=>"2", "username"=>"admin", "zt"=>"1"}
    system ("ruby ./bin/ktcz_lx.rb #{params['device_id']} #{params['zt']}")
    render :text => 'Success'
  end
  
  def set_device_hw   #{"device_id"=>"2", "username"=>"admin", "zt"=>"1"}
      $conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
      User.find_by_sql("update zn_sb set czzt='正在操作' where id =#{params['device_id']} ;")
      system ("ruby ./bin/ktcz_hw.rb #{params['device_id']} #{params['zt']}")
      for i in 0..10
        sleep 1          
        czzt = $conn.exec("select czzt from zn_sb where id =#{params['device_id']};")            
        if czzt[0]['czzt']!='正在操作'
          break
        end
      end
      if czzt[0]['czzt']=='成功'
        text='success:'  +params['device_id']
      else
        text='false:设备操作失败。'
      end
      $conn.close
      render :text => 'Success'
  end
   
    
  














  def get_archive_where
    tm, ajtm, wh = params['tm'], params['ajtm'], params['wh']
    request_id = rand(36**32).to_s(36);
    User.find_by_sql("insert into jy_zxjy (request_id, zt, tm, ajtm, wh) values ('#{request_id}','查找中', '#{tm}', '#{ajtm}', '#{wh}');")
    render :text => request_id
  end

  def get_document_where
    archive_id = params['archive_id']
    user = User.find_by_sql("select * from docuemnt where ownerid = #{archive_id};")
    render :text => user.to_json
  end


  def get_timage_from_db(gid)
    user = User.find_by_sql("select id, dh, yxmc from timage where id=#{gid};")
    dh = user[0]['dh']
    if !File.exists?("./dady/img_tmp/#{dh}/")
      system"mkdir -p ./dady/img_tmp/#{dh}/"
    end
    user[0]["yxmc"]=user[0]["yxmc"].gsub('tif','JPG')
    local_filename = "./dady/img_tmp/#{dh}/"+user[0]["yxmc"].gsub('$', '-').gsub('TIF','JPG')
    if !File.exists?(local_filename)
      user = User.find_by_sql("select id, dh, yxmc, data,jm_tag from timage where id=#{gid};")
      tmpfile = rand(36**10).to_s(36)
      ff = File.open("./tmp/#{tmpfile}",'w')
      ff.write(user[0]["data"])
      ff.close
      #puts "./tmp/#{tmpfile} #{local_filename}"
      if (user[0]['jm_tag'].to_i == 1)
        system("decrypt ./tmp/#{tmpfile} #{local_filename}")
      else
        system("scp ./tmp/#{tmpfile} #{local_filename}")
      end      
      system("rm ./tmp/#{tmpfile}")
    end
    txt = "/assets/#{local_filename}".gsub('/./','/').gsub('/assets/dady/img_tmp/','/timage/')
  end

  def check_result
    request_id = params['request_id']
    users = User.find_by_sql("select id, zt from jy_zxjy where request_id='#{request_id}';")
    txt=""
    if users[0].zt == "完成" 
      users = User.find_by_sql("select dh, image_id from  jy_zxjylist where zxjyid=#{users[0].id}")
      ss = []
      for k in 0..users.size-1
       pp = {"image_path"=>get_timage_from_db(users[k].image_id), "image_id"=>users[k].image_id}
       ss << pp 
      end
      txt = ss.to_json
    elsif users[0].zt == "未找到"
      txt = "未找到档案,请重新查询."
    elsif users[0].zt == "查找中"
      txt = "查找中"
    end
    render :text => txt;
  end


  def set_nh
    users = User.find_by_sql("select* from zn_nh ;")
    for k in 0..users.size-1
      sjnh=users[k]['ednh'].to_i*(1-(rand(40).to_s.to_f/100).to_f)
      update=User.find_by_sql("update zn_nh set sjnh='#{sjnh}' where id=#{users[k]['id']} ;")
    end
  end

  #add on July 1
  def get_nh_day_list
    user = User.find_by_sql("select dh, rmmc, sbid, sbmc, ednh, sjnh, rq from zn_nh inner join zn_sb on zn_nh.sbid = zn_sb.id order by sbmc, rq;")
    render :text => user.to_json
  end  

  def get_nh_dev_list
    user = User.find_by_sql("select dh, sbid, sbmc, sum(ednh) as ednh, sum(sjnh) as sjnh from zn_nh inner join zn_sb on zn_nh.sbid = zn_sb.id group by dh, sbid, sbmc order by sbmc;")
    render :text => user.to_json
  end

  def get_nh_rm_list
    user = User.find_by_sql("select dh, rmmc, sum(ednh) as ednh,  sum(sjnh) as sjnh from zn_nh inner join zn_sb on zn_nh.sbid = zn_sb.id group by dh, rmmc order by rmmc;")
    render :text => user.to_json
  end


  def upload_file
    file=params['file']
    puts file.name
      params.each do |k,v|
        logger.debug("K: #{k} ,V: #{v}")
        if k.include?("recording") || k.include?("sign") || k.include?("txt")
         logger.debug("#{v.original_filename}")
         logger.debug("#{v.tempfile.path}")
         logger.debug("#{v.content_type}")
         ff = File.new("./dady/#{v.original_filename}","w+")
         ff.write(v.tempfile.read)
         ff.close
         User.find_by_sql("delete from jy_zxjylist_htts;")
         if  k.include?("sign")
           if !params['jyid'].nil?
             jyid=params['jyid']
             User.find_by_sql("delete from qz_image where jyid=#{params['jyid']};")
             fo = File.open(filename).read
             edata=PGconn.escape_bytea(fo)
             $conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
             $conn.exec("set standard_conforming_strings = off")
             $conn.exec("insert into qz_image (jyid, data) values ( #{params['jyid']}, E'#{edata}');")
           end
         end
         break
        end

      end
      render :text => "{success:true}"
  end


  def get_jyxz
    render :text => "借阅须知:"
  end

  def get_gy
    render :text => "关于:"
  end


  #add on July 13
  def upload_ws
    params.each do |k,v|
      logger.debug("K: #{k} ,V: #{v}")
     #if k.include?("recording")
     #  logger.debug("#{v.original_filename}")
     #  logger.debug("#{v.tempfile.path}")
     #  logger.debug("#{v.content_type}")
     #  ff = File.new("./dady/#{v.original_filename}","w+")
     #  ff.write(v.tempfile.read)
     #  ff.close
     #  break
     #end
    end
    render :text => "{success:true}"
  end

  def set_t_tddj
    qrq = params['qrq'].nil?  ? 'NULL'  : "TIMESTAMP '#{params[qrq]}'" 
    zrq = params['zrq'].nil?  ? 'NULL'  : "TIMESTAMP '#{params[zrq]}'" 
    ys = '1' if params['ys'].nil?
    js = '1' if params['js'].nil?

    insert_str = "insert into t_tddj (ajh, bgqx, cjfr, djh, dwdm, dyqrmc, dyrmc, flh, js, ys, mj, mlh, nd, qlrmc, qsxz, qzh, tdzh, tdzl, tfh, tm, txqrrmc, txqz, xmmc, ydjh, ywrmc, qrq, zrq) values ('#{parms['ajh']}', '#{parms['bgqx']}', '#{parms['cjfr']}', '#{parms['djh']}', '#{parms['dwdm']}', '#{parms['dyqrmc']}', '#{parms['dyrmc']}', '#{parms['flh']}', #{js}, #{ys}, '#{parms['mj']}', '#{parms['mlh']}', '#{parms['nd']}', '#{parms['qlrmc']}', '#{parms['qsxz']}', '#{parms['qzh']}', '#{parms['tdzh']}', '#{parms['tdzl']}', '#{parms['tfh']}', '#{parms['tm']}', '#{parms['txqrrmc']}', '#{parms['txqz']}', '#{parms['xmmc']}', '#{parms['ydjh']}', '#{parms['ywrmc']}', #{qrq}, #{zrq} ) returning id;"

    User.find_by_sql("delete from t_tddj where spbh = 'params['spbh]';" )
    User.find_by_sql(insert_str)
    #rendre :text => "<script>alert(\"接收已成功！\");top.close();</script>"
    rendre :text => "success"
  end

  def set_t_yxsj
  	str=params["data"]
    yxdx=str.size
    edata=PGconn.escape_bytea(str)
  	insert_str = "insert into t_yxsj (spbh, yxmc, yxbh, yxdx, data) values ('#{params['spbh']}', '#{params['yxmc']}', '#{params['yxbh']}', #{yxdx}, '#{edata}')"
  	User.find_by_sql(insert_str)
    render :text => "success"
  end

  def get_t_yxsj_list
    user = User.find_by_sql("select id, spbh, yxmc, yxbh, yxdx from t_yxsj")
    render :text => user.to_json
  end

  def get_t_yxsj_image
    user = User.find_by_sql("select id, data from t_yxsj where id = #{params['id']};")
    render :text => user[0]['data']
  end

  def get_mc_imageList
    user = User.find_by_sql("select yxmc from mc_image where device_id = #{params['device_id']} and yxmc is not null order by created_at desc limit 10;")
    jpg = []
    for k in 0..user.size-1
      jpg  << user[k]['yxmc']
    end  
    render :text => jpg.join(" ")
  end

  def get_image_list
    where_str = "where dh = '#{params['dh']}'"
    users = User.find_by_sql("select id, yxmc, yxbh, tag from timage #{where_str} order by tag, yxbh limit 10;")
    ss,txt = [],''
    for k in 0..users.size-1
      image_id = users[k].id
      image_path = get_timage_from_db(image_id)
      ss <<  {"image_path"=>image_path, "image_id"=>image_id} 
    end
    render :text => ss.to_json;
  end  

  def get_image_by_id
    id = params['gid']
    render :text => get_timage_from_db(id)
  end  

  def get_sfz_oo
     host_ip = "192.168.114.48"
     client = TCPSocket.open host_ip, 50000
     recv_length = 1024
     ss="D&C00040101"
     client.send ss, 0
     sleep 2
     ss = client.recv(1024)
     str= hex_str(ss)
     puts str
     if str.length>200
       idx = str.index("AA AA AA 96 69 05 08 00 00 90 ")/3
       if !idx.nil?
         wb_len = ss[idx+10]*256+ss[idx+11]
         tx_len = ss[idx+12]*256+ss[idx+13]

         wb   = ss[idx+14..idx+4+wb_len-1]
         name = wb[0..29]
         dz   = wb[52..121]
         sfzh = wb[122..157]
         name = Iconv.iconv('UTF-8','UTF-16LE', name).to_s
         dz   = Iconv.iconv('UTF-8','UTF-16LE', dz).to_s
         sfzh = Iconv.iconv('UTF-8','UTF-16LE', sfzh).to_s

         txt= "success:" + name.strip + "|" + sfzh.strip + "|" + dz.strip
       end
     else
       txt= "fail:请放入或移动一下身份证。"
     end
     client.close
     render :text => txt
  end

  #map/query_leader?username=#{username}&password=#{password}
  def query_leader
    username, password = params['username'], params['password']
    txt = ''
    if username == "张飞"
      txt = 'true'
    else
      txt = 'false'
    end
    #txt = 'true'
    render :text => txt  
  end

  def get_sfz
    sleep(1)
    name = '刘永'
    sfzh = '612102196407240673'
    dz   = '江苏省徐州市云龙区积翠新村17幢2单元202室'
    txt= "success:" + name.strip + "|" + sfzh.strip + "|" + dz.strip
    render :text => txt
  end

  #map/fti_search?username={}&search={}&dalb={}&offset={}&limit={}
  def fti_search
    search = params['search']
    txt = ''
    if params['dalb'].nil?
      user = User.find_by_sql"select dalb, lbmc, count(*) from archive inner join d_dalb on cast(archive.dalb as integer) = d_dalb.id where tm like '%#{search}%' group by dalb, lbmc;"
      txt = user.to_json
    else
      offset = params['offset'] || 0
      limit  = params['limit']  || 25

      user = User.find_by_sql("select count(*) from archive where tm like '%#{search}%' and dalb = '#{params['dalb']}';")[0]
      size = user.count.to_i;
      if size > 0
        txt = "{\"results\":#{size},\"rows\":["
        user = User.find_by_sql("select * from archive where tm like '%#{search}%'  and dalb = '#{params['dalb']}' order by mlh,ajh offset #{offset} limit #{limit};")
        for k in 0..user.size-1
          txt = txt + user[k].to_json + ','
        end
        txt = txt[0..-2] + "]}"
      else
        txt = "{\"results\":0,\"rows\":[]}"
      end
    end

    render :text => txt 
  end  

  #map/dd_search?ajbh=#{}&tm={}&wh={}&djh={}&tdzl={}&qlrmc={}&dalb={}&offset={}
  def dd_search
    cond = []
    cond << "tm like    '%#{params['tm']}%'" if !params['tm'].nil?
    cond << "a_tddj.djh like   '%#{params['djh']}%'" if !params['djh'].nil?
    cond << "a_tddj.tdzl like  '%#{params['tdzl']}%'" if !params['tdzl'].nil?
    cond << "a_tddj.qlrmc like '%#{params['qlrmc']}%'" if !params['qlrmc'].nil?

    conds = cond.join(" and ")

    txt = ''
    offset = params['offset'] || 0
    limit  = params['limit']  || 25

    user = User.find_by_sql("select count(*) from document inner join a_tddj on document.ownerid = a_tddj.ownerid where #{conds};")[0]
    size = user.count.to_i;
    if size > 0
      txt = "{\"results\":#{size},\"rows\":["
      user = User.find_by_sql("select document.*, a_tddj.djh, a_tddj.qlrmc, a_tddj.qsxz,a_tddj.ydjh,a_tddj.tdzh,a_tddj.tfh,a_tddj.cjfr,a_tddj.dyrmc,a_tddj.dyqrmc,a_tddj.txqz,a_tddj.ywrmc,a_tddj.txqrrmc,a_tddj.xmmc,a_tddj.tdzl from document inner join a_tddj on document.ownerid = a_tddj.ownerid where #{conds} order by dh,sxh offset #{offset} limit #{limit};")
      for k in 0..user.size-1
        txt = txt + user[k].to_json + ','
      end
      txt = txt[0..-2] + "]}"
    else
      txt = "{\"results\":0,\"rows\":[]}"
    end

    render :text => txt 
  end  

  def get_jytj
    if params['query']!=""
      xh=1
      strwhere=""
      if params['jyr']!=""
        strwhere=" and jyr = '#{params['jyr']}' "
      end        
      if params['jydw']!=""
        strwhere=strwhere + " and jydw like '%#{params['jydw']}%' "
      end        
      strwhere=" where jysj<='#{params['zrq']}' and jysj>='#{params['qrq']}' " + strwhere
      case params['query']
      when "1"
        user = User.find_by_sql("select * from jylc  #{strwhere} and (jyzt='2') order by jysj;")
      when "2"
        user = User.find_by_sql("select * from jylc #{strwhere} and (jyzt='4') order by jysj;")
      when "3"
        user = User.find_by_sql("select * from jylc #{strwhere} order by jysj;")
      when "4"
        user = User.find_by_sql("select count(*) as jyrc,sum(fyys) as fyys,sum(zcys) as zcys from jylc #{strwhere} ;")
        if user[0]['jyrc'].to_i>0
          txt = "{results:1,rows:["
          txt=txt + "{'jyrc':'" + user[0]['jyrc'] + "','fyys':'" + user[0]['fyys'] + "','zcys':'" + user[0]['zcys'] + "'"
          jylist=User.find_by_sql("select count(*) as jyjc from jylc,jylist #{strwhere} and jylc.id=jylist.jyid;")
          txt=txt + ",'jyjc':'" + jylist[0]['jyjc'] + "'"
          bsxz = User.find_by_sql("select count(*) as count from jylc #{strwhere} and lymd='编史修志' ;")
          bsxz_s=(bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3]
          txt=txt + ",'bsxz':'" + (bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3] + "'"
          bsxz = User.find_by_sql("select count(*) as count from jylc #{strwhere} and lymd='工作考查' ;")
          gzkc_s=(bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3]
          txt=txt + ",'gzkc':'" + (bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3] + "'"
          bsxz = User.find_by_sql("select count(*) as count from jylc #{strwhere} and lymd='学术研究' ;")
          xsyj_s=(bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3]
          txt=txt + ",'xsyj':'" + (bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3] + "'"
          bsxz = User.find_by_sql("select count(*) as count from jylc #{strwhere} and lymd='经济建设' ;")
          jjjs_s=(bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3]
          txt=txt + ",'jjjs':'" + (bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3] + "'"
          bsxz = User.find_by_sql("select count(*) as count from jylc #{strwhere} and lymd='宣传教育' ;")
          xcjy_s=(bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3]
          txt=txt + ",'xcjy':'" + (bsxz[0]['count'].to_f/user[0]['jyrc'].to_f).to_s[0..3] + "'"
          qt_s=(1-(bsxz_s.to_f+gzkc_s.to_f+xsyj_s.to_f+jjjs_s.to_f+xcjy_s.to_f)).to_s[0..3]
          txt=txt + ",'qrq':'" + params['qrq'] + "'"
          txt=txt + ",'zrq':'" + params['zrq'] + "'"
          txt=txt + ",'qt':'" + qt_s + "'}]}"
          puts txt
        else
          txt = "{results:0,rows:[]}"  
        end                
      end
    else
      txt = "{results:0,rows:[]}"
    end
    render :text => txt
  end

  #获取温湿度
  def get_wsd
    #'intxl 1代表返回指定日期的最后一个小时的温湿度记录，2代表返回指定日期的全部温湿度记录
    intlx=params['intlx']
    strrq=params['strrq']
    if intlx.to_i==1
      user = User.find_by_sql("select sbmc,ktzt as wsd from zn_sb where id in (39,40);")
      txt ="[{\"jyrc\":\"#{users[0]['jyrc']}\",\"jyjc\":\"#{users[0]['jyjc']}\",\"jtjyrc\":\"#{users[0]['jtjyrc']}\",\"jtjyjc\":\"#{users[0]['jtjyjc']}\",\"ajs\":\"#{archive[0]['ajs']}\"}]"
      render :text => txt
    else
      if !params['strrq'].nil?
        user = User.find_by_sql("select xzmc as sbmc,dqwd || ',' || dqsd as wsd from d_wsd_his  where created_at>='#{strrq} 00:00:00' and created_at<='#{strrq} 23:59:59' and cmd in ('20 42','30 43');")
        render :text => user.to_json
      else
        user = User.find_by_sql("select sbmc,ktzt as wsd from zn_sb where id in (39,40);")
        wsd1=user[0]['wsd'].split(',')
        #wsd2=user[1]['wsd'].split(',')
        mc1="关"
        mc2="关"
        sjnh='12385'
        jsnh='246'
        txt ="[{\"wd1\":\"#{wsd1[0]}\",\"sd1\":\"#{wsd1[1]}\",\"wd2\":\"#{wsd2[0]}\",\"sd2\":\"#{wsd2[1]}\",\"mc1\":\"#{mc1}\",\"mc2\":\"#{mc2}\",\"sjnh\":\"#{sjnh}\",\"jsnh\":\"#{jsnh}\"}]"
        
        render :text => txt
      end
    end
  end

  #获取各类档案实体卷数
  def get_stajs
    users = User.find_by_sql("select distinct qzh,lbmc,d_dalb.id,count(*) as js from archive ,d_dalb where qzh='9' and cast(archive.dalb as integer)=d_dalb.id group by qzh,lbmc,d_dalb.id order by qzh,d_dalb.id")
    txt = users.to_json
    render :text =>txt
  end

  #获取各类档案影像文件数
  def get_yxxs
    users = User.find_by_sql("select distinct qzh,lbmc,d_dalb.id,count(*) as js from archive ,d_dalb where qzh='6' and cast(archive.dalb as integer)=d_dalb.id group by qzh,lbmc,d_dalb.id order by qzh,d_dalb.id")
    #txt = users.to_json
    txt="["
    for i in 0..users.size-1
      dalbcd=users[i]['id'].to_s.length
      yxxs=User.find_by_sql("select count(*) as ys from timage where substring(dh from 3 for #{dalbcd})=cast(#{users[i]['id']} as character(2))")
      txt=txt.to_s + "{\"lbmc\":\"#{users[i]['lbmc']}\",\"ys\":\"#{yxxs[0]['ys']}\"},"
    end
    txt=txt.to_s + "]"
    render :text =>txt
  end

  #获取档案借阅情况
  def get_dajytj
    if !params['zrq'].nil?
      strwhere=" where jysj<='#{params['zrq']} 23:59:59' and jysj>='#{params['qrq']} 00:00:00' " 
      users = User.find_by_sql("select count(*) as jyjc,jysj from jylc,jylist #{strwhere} and jylc.id=jylist.jyid group by jysj;")
      txt = users.to_json
    else   
      rq=Time.now.strftime("%Y-%m-%d") 
      strwhere=" where jysj<='#{rq} 23:59:59' and jysj>='#{rq} 00:00:00' " 
      users = User.find_by_sql("select count(*) as jyrc,(select count(*) from jylist) as jyjc,(select count(*) from jylc #{strwhere}) as jtjyrc, (select count(*) from jylist,jylc #{strwhere} and  jylc.id=jylist.jyid) as jtjyjc from jylc ;")
      archive=User.find_by_sql("select count(*) as ajs from archive where rq<='#{rq} 23:59:59' and rq>='#{rq} 00:00:00'")        
      txt ="[{\"jyrc\":\"#{users[0]['jyrc']}\",\"jyjc\":\"#{users[0]['jyjc']}\",\"jtjyrc\":\"#{users[0]['jtjyrc']}\",\"jtjyjc\":\"#{users[0]['jtjyjc']}\",\"ajs\":\"#{archive[0]['ajs']}\"}]"
    end

    render :text =>txt
  end



  #获取名类档案借阅情况
  def get_dajytj_dalb
    strwhere=" where jysj<='#{params['zrq']} 23:59:59' and jysj>='#{params['qrq']} 00:00:00' " 
    users = User.find_by_sql("select lbmc,count(*) as jyjc,jysj from jylc,jylist,d_dalb,archive #{strwhere} and jylc.id=jylist.jyid and cast(archive.dalb as integer)=d_dalb.id and jylist.daid=archive.id group by jysj,lbmc;")
    txt = users.to_json
    render :text =>txt
  end

  #获取档案馆设备情况
  def get_dagsb     
    txt="["     
    txt=txt.to_s + "{\"温湿度计\":\"2\",\"空调\":\"6\"},"
    txt=txt.to_s + "]"
    render :text =>txt
  end

  #获取档案借阅人职业统计
  def get_dagsb      
    txt="["      
    txt=txt.to_s + "{\"国土系统\":\"40\",\"政府部门\":\"21\",\"事业单位\":\"9\",\"律师\":\"30\",\"法院\":\"8\",\"市民\":\"25\",\"其它\":\"6\"}"
    txt=txt.to_s + "]"
    render :text =>txt
  end


  #获取各类档案电子标签数
  def get_bqs
    users = User.find_by_sql("select distinct qzh,lbmc,d_dalb.id,count(*) as js from archive ,d_dalb where qzh='6' and cast(archive.dalb as integer)=d_dalb.id group by qzh,lbmc,d_dalb.id order by qzh,d_dalb.id")
    #txt = users.to_json
    txt="["
    for j in 0..users.size-1

      jbq=User.find_by_sql("select count(*) as jbq from archive where qzh='#{users[j]['qzh']}' and dalb='#{users[j]['id']}' and rfidstr<>'';")  
      hbq=User.find_by_sql("select distinct boxrfid as hbq  from archive where boxrfid<>'' and  qzh='#{users[j]['qzh']}' and dalb='#{users[j]['id']}' ;")        
      txt=txt.to_s + "{\"lbmc\":\"#{users[j]['lbmc']}\",\"jbq\":\"#{jbq[0]['jbq']}\",\"hbq\":\"#{hbq.size}\"},"
    end
    txt=txt.to_s + "]"
    render :text =>txt
  end


  def upload_file_qz
    params.each do |k,v|
      logger.debug("K: #{k} ,V: #{v}")
      if k.include?("file")
       logger.debug("#{v.original_filename}")
       logger.debug("#{v.tempfile.path}")
       logger.debug("#{v.content_type}")
       ff = File.new("./dady/#{v.original_filename}","w+")
       #User.find_by_sql("delete from jy_zxjylist_htts;")
       ff.write(v.tempfile.read)
       ff.close
       break
      end
    end
    render :text => "{success:true}"
  end


  #获取档案员在后台推送到前台的数据
  def check_cxlist
    users = User.find_by_sql("select dh, image_id,zxjyid from  jy_zxjylist_htts")
    ss = []
    for k in 0..users.size-1
     pp = {"image_path"=>get_timage_from_db(users[k].image_id), "image_id"=>users[k].image_id,"id"=>users[k].zxjyid}
     ss << pp 
    end
    txt = ss.to_json
    render :text => txt;
  end



end
