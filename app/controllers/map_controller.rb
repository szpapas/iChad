class MapController < ApplicationController
  
  def get_temp
    render :text=>"{\"sd\":\"45\",\"wd\":\"25.6\"}"
  end
  
  #search=%@&dalb=%@&offset=%d&qzh=%d
  def search_aj
    user = User.find_by_sql("select * from archive where tm like '%#{params['search']}%' limit 10;")
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

  #获取影像文件列表
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
    user= User.find_by_sql("select * from timage  where where id=#{param['id']};") 
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
          text = "{results:#{size},rows:["          
          for k in 0..user.size-1
              text = text + user[k].to_json + ','
          end
          text = text[0..-2] + "]}"
      else
          text = "{results:0,rows:[]}"
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
        text = "{results:#{size},rows:["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{results:0,rows:[]}"
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
        text = "{results:#{size},rows:["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{results:0,rows:[]}"
    end
    render :text => text
  end
  

  #通过档号获取整目录档案  query 格式  qzh_dalb_mlh(文书处理24的mlh格式为 年度_机构问题号_保管期限 )
  def wsAjToTxt
    dh = params['query']
    ss = params['query'].split('-')
    
    case (ss[1]) 
			when "0"
				user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}' order by ajh ;")
			 
			when "2"
				user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
				
			when "3","5","6","7"
				user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}'  order by ajh ;")
			when "15"
				user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
      when "18"
				user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
      when "25"
				user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
      when "27"
				user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' order by ajh ;")
      when "26"
				user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
      when "28"
				user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
      when "29"
				user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
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
			  #年度_机构问题号_保管期限
			  case ss.length
		      when 3
		        strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}'"
	        when 4
	          strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}' and a_wsda.jgwth='#{ss[3]}'"
          when 5
            strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and a_wsda.nd='#{ss[2]}' and a_wsda.jgwth='#{ss[3]}' and a_wsda.bgqx='#{ss[4]}'"
          else
            strwhere="where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}'"
				    
        end
        user = User.find_by_sql("select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   order by nd,bgqx,jgwth,jh ;")
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
        text = "{results:#{size},rows:["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{results:0,rows:[]}"
    end
    render :text => text
  end
  
  

  
  #通过RFID获取档案
  def wsRFID
    strrfid = params['strrfid']
    user=User.find_by_sql("select * from archive  where rfidstr=  '#{strrfid}';") 
    size = user.size;
    if size.to_i > 0
        text = "{results:#{size},rows:["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{results:0,rows:[]}"
    end
    render :text => text
  end
  

  
  #通过RFID获取档案
  def get_archiveByRfid
    user=User.find_by_sql("select * from archive where rfidstr='#{params['rfidstr']}';") 
    size = user.size;
    if size.to_i > 0
        text = "{results:#{size},rows:["          
        for k in 0..user.size-1
            text = text + user[k].to_json + ','
        end
        text = text[0..-2] + "]}"
    else
        text = "{results:0,rows:[]}"
    end
    render :text => text
  end

  #通过ID获取影像文件
  def wsImage(gid)
    user= User.find_by_sql("select * from timage  where where id=#{gid};") 
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
          strwhere=" and (boxrfid='' or rfidstr='' or boxrfid is null or rfidstr is null)"
          case (query[1]) 
      			when "0"
      				user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}' #{strwhere} order by ajh ;")

      			when "2"
      				user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' #{strwhere} order by ajh ;")

      			when "3","5","6","7"
      				user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}' #{strwhere} order by ajh ;")
      			when "15"
      				user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' #{strwhere} order by ajh ;")
            when "18"
      				user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' #{strwhere}  order by ajh ;")
            when "25"
      				user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' #{strwhere}  order by ajh ;")
            when "27"
      				user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' #{strwhere} order by ajh ;")
            when "26"
      				user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  #{strwhere} order by ajh ;")
            when "28"
      				user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' #{strwhere} order by ajh ;")
            when "29"
      				user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' #{strwhere} order by ajh ;")
            when "30"
      				user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' #{strwhere}  order by djh ;")
            when "31"
      				user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' #{strwhere}  order by zt ;")
            when "32"
      				user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' #{strwhere}  order by jgmc ;")
            when "33"
      				user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' #{strwhere}  order by fsrq ;")
            when "34"
      				user = User.find_by_sql("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' #{strwhere}  order by sj ;")

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
      				user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{data[0]['mlh']}' #{strwhere} order by ajh ;")

      		end
        end
      end
    end
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
          if query[1]=="24"
            user= User.find_by_sql("select distinct a_wsda.nd,a_wsda.bgqx,a_wsda.jgwth from archive left join a_wsda on archive.id=a_wsda.ownerid where qzh='#{query[0]}' and dalb='#{query[1]}' order by a_wsda.nd;")
          else
            user= User.find_by_sql("select distinct mlh from archive    where qzh='#{query[0]}' and dalb='#{query[1]}' order by mlh;") 
          end
        else
          ss = params['query'].split('_')
          case (query[1]) 
      			when "0"
      				user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}' order by ajh ;")

      			when "2"
      				user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")

      			when "3","5","6","7"
      				user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}'  order by ajh ;")
      			when "15"
      				user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
            when "18"
      				user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
            when "25"
      				user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
            when "27"
      				user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' order by ajh ;")
            when "26"
      				user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
            when "28"
      				user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
            when "29"
      				user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh ;")
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
      				user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{data[0]['mlh']}' order by ajh ;")

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
      text="false" 
    end
    render :text => text
  end
  #标签组卷提取数据
  def get_rfidzj_data
    if  params['jy_rfid']!=""
      jy_rfid=params['jy_rfid'].split(',')
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
      text="false" 
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
      user = User.find_by_sql("update pkerr set zt=1 where id in (#{bindstr});") 
    end    
    user = User.find_by_sql("select * from pkerr where zt=0 and errlx > 0 and dh like '#{dh}-%';")
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
end
