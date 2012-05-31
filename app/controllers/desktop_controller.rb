# encoding: utf-8
require 'socket'
require 'find'
class DesktopController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!, :except => [:upload_images]
  before_filter :set_current_user
  
  def index
  end
  
  def get_user    
    render :text => User.current.to_json
  end
  
  def check_key
    
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
        data = User.find_by_sql("select distinct cast(archive.mlh as integer), archive.dalb, mlm from archive inner join q_qzxx on cast (archive.mlh as integer) = q_qzxx.mlh  where archive.qzh='#{pars[0]}' order by mlh;")
        data.each do |dd|
            text << {:text => "目录 #{dd['mlm']}", :id => node+"|#{dd["dalb"]}|#{dd["mlh"]}", :leaf => true, :cls => "file"}
        end
      else
        if pars.length == 1
          data = User.find_by_sql("select distinct cast(dalb as integer), lbmc from archive inner join d_dalb on cast(dalb as integer)=d_dalb.id where qzh='#{pars[0]}' order by dalb;")
          data.each do |dd|
            text << {:text => "#{dd['dalb']} #{dd['lbmc']}", :id => node+"|#{dd["dalb"]}", :cls => "folder"}
          end
        end
        if pars.length == 2
          #data = User.find_by_sql("select distinct cast(mlh as integer) from archive where qzh='#{pars[0]}' and dalb='#{pars[1]}' order by mlh;")
          data = User.find_by_sql("select distinct cast(archive.mlh as integer), archive.dalb, mlm from archive inner join q_qzxx on cast (archive.mlh as integer) = q_qzxx.mlh  where archive.qzh='#{pars[0]}' and archive.dalb='#{pars[1]}' order by mlh;")
          data.each do |dd|
              text << {:text => "目录 #{dd['mlm']}", :id => node+"|#{dd["mlh"]}", :leaf => true, :cls => "file"}
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

  def update_flow
    if (params['ztsl']=='')
      params['ztsl']=0        
    end
    if (params['sl']=='')
      params['sl']=0        
    end
    if (params['js']=='')
      params['js']=0        
    end
    if (params['ys']=='')
      params['ys']=0        
    end
    if (params['qrq']=='')
      params['qrq']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['sjsj']=='')
      params['sjsj']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['gzsj']=='')
      params['gzsj']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['zrq']=='')
      params['zrq']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['zwrq']=='')
      params['zwrq']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['xcrq']=='')
      params['xcrq']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['cbrq']=='')
      params['cbrq']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['fsrq']=='')
      params['fsrq']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['jlrq']=='')
      params['jlrq']=Time.now.strftime("%Y-%m-%d")
    end
    if (params['sj']=='')
      params['sj']=Time.now.strftime("%Y-%m-%d")
    end
    txt=""
    case params['dalb']
    when "0"
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
      end

    when "2"
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zrq='#{params['zrq']}', qrq='#{params['qrq']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_jhcw where  ownerid=#{params['id']};")
                
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_jhcw(jnzs,fjzs,ownerid,pzqh,pzzh,dh) values('#{params['jnzs']}','#{params['fjzs']}','#{archiveid[0]['id']}','#{params['pzqh']}','#{params['pzzh']}','#{dh}') ")                                  
        else
          User.find_by_sql("update a_jhcw set jnzs='#{params['jnzs']}', fjzs='#{params['fjzs']}', pzqh='#{params['pzqh']}', pzzh='#{params['pzzh']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
      end      
      
    when "3","5","6","7"
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0

        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['zny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")


        archiveid=User.find_by_sql("select id from a_tddj where  ownerid=#{params['id']};")
        
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_tddj(djh,qlrmc,ownerid,tdzl,tdzh,dh,qsxz,tfh,ydjh) values('#{params['djh']}','#{params['qlrmc']}','#{archiveid[0]['id']}','#{params['tdzl']}','#{params['tdzh']}','#{dh}','#{params['qsxz']}','#{params['tfh']}','#{params['ydjh']}') ")                        
        else
          User.find_by_sql("update a_tddj set ydjh='#{params['ydjh']}',tfh='#{params['tfh']}',djh='#{params['djh']}', qlrmc='#{params['qlrmc']}', tdzl='#{params['tdzl']}', tdzh='#{params['tdzh']}', qsxz='#{params['qsxz']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
      end 
    when "15"
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_sx where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_sx(zl,ownerid) values('#{params['zl']}','#{params['id']}') ")                                  
        else
          User.find_by_sql("update a_sx set zl='#{params['zl']}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
      end  
    when "18"
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_tjml where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_tjml(tfh,tgh,ownerid) values('#{params['tfh']}','#{params['tgh']}','#{params['id']}') ")                                  
        else
          User.find_by_sql("update a_tjml set tfh='#{params['tfh']}',tgh='#{params['tgh']}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；序号为'+params['ajh']+'已经存在，请重新输入目录号或序号。'
      end 
    when "25"                                  
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}',mlh='#{params['mlh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_dzda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_dzda(tjr,rjhj,czxt,sl,bfs,ztbhdwjgs,yyrjpt,tjdw,wjzt,dzwjm,ztbh,xcbm,xcrq,jsr,jsdw,yjhj,dh,ownerid) values('#{params['tjr']}','#{params['rjhj']}','#{params['czxt']}','#{params['sl']}','#{params['bfs']}','#{params['ztbhdwjgs']}','#{params['yyrjpt']}','#{params['tjdw']}','#{params['wjzt']}','#{params['dzwjm']}','#{params['ztbh']}','#{params['xcbm']}','#{params['xcrq']}','#{params['jsr']}','#{params['jsdw']}','#{params['yjhj']}','#{dh}','#{archiveid[0]['id']}') ")                        
        else                
          User.find_by_sql("update a_dzda set tjr='#{params['tjr']}', rjhj='#{params['rjhj']}', czxt='#{params['czxt']}', sl='#{params['sl']}', dh='#{dh}',bfs='#{params['bfs']}',ztbhdwjgs='#{params['ztbhdwjgs']}', yyrjpt='#{params['yyrjpt']}', tjdw='#{params['tjdw']}', wjzt='#{params['wjzt']}', dzwjm='#{params['dzwjm']}', ztbh='#{params['ztbh']}', xcbm='#{params['xcbm']}',xcrq='#{params['xcrq']}', jsr='#{params['jsr']}', jsdw='#{params['jsdw']}', yjhj='#{params['yjhj']}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '档号为'+params['mlh']+'；顺序号为'+params['ajh']+'已经存在，请重新输入档号为或顺序号。'
      end      
    when "27"                                  
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}',mlh='#{params['mlh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['zcmc']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_sbda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_sbda(zcmc,gzsj,dw,sl,cfdd,sybgdw,sybgr,zcbh,dj,je,dh,ownerid) values('#{params['zcmc']}','#{params['gzsj']}','#{params['dw']}','#{params['sl']}','#{params['cfdd']}','#{params['sybgdw']}','#{params['sybgr']}','#{params['zcbh']}','#{params['dj']}','#{params['je']}','#{dh}','#{archiveid[0]['id']}') ")                                         
        else                
          User.find_by_sql("update a_sbda set zcmc='#{params['zcmc']}', gzsj='#{params['gzsj']}', dw='#{params['dw']}', sl='#{params['sl']}', dh='#{dh}',cfdd='#{params['cfdd']}',sybgdw='#{params['sybgdw']}', sybgr='#{params['sybgr']}', zcbh='#{params['zcbh']}', dj='#{params['dj']}', je='#{params['je']}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；件号为'+params['ajh']+'已经存在，请重新输入目录号为或件号。'
      end      
    when "26"                                  
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set nd='#{params['nd']}',js='#{params['js']}',znr='#{params['znr']}',qnr='#{params['qnr']}',cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}',mlh='#{params['mlh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['xmmc']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_jjda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_jjda(xmmc,jsdw,dh,jsnd,ownerid) values('#{params['xmmc']}','#{params['jsdw']}','#{dh}','#{params['nd']}','#{archiveid[0]['id']}') ")                                         
        else                
          User.find_by_sql("update a_jjda set xmmc='#{params['xmmc']}', jsdw='#{params['jsdw']}', jsnd='#{params['jsnd']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；案卷号号为'+params['ajh']+'已经存在，请重新输入目录号为或案卷号号。'
      end 
    when "28"                                  
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}',mlh='#{params['mlh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['mc']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_swda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_swda(bh,lb,hjz,sjsj,sjdw,mc,ztxs,dh,ownerid) values('#{params['bh']}','#{params['lb']}','#{params['hjz']}','#{params['sjsj']}','#{params['sjdw']}','#{params['mc']}','#{params['ztxs']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_swda set bh='#{params['bh']}', lb='#{params['lb']}', sjsj='#{params['sjsj']}', sjdw='#{params['sjdw']}', mc='#{params['mc']}', ztxs='#{params['ztxs']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；件号为'+params['ajh']+'已经存在，请重新输入目录号为或件号。'
      end                       
    when "29"                                  
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set nd='#{params['nd']}',cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}',mlh='#{params['mlh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_zlxx where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_zlxx(bh,lb,bzdw,dh,ownerid) values('#{params['bh']}','#{params['lb']}','#{params['bzdw']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_zlxx set bh='#{params['bh']}', lb='#{params['lb']}', bzdw='#{params['bzdw']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；件号为'+params['ajh']+'已经存在，请重新输入目录号为或件号。'
      end
    when "30"                                        
      user=User.find_by_sql("select * from archive,a_by_tszlhj where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_tszlhj.djh='#{params['djh']}'  and archive.id=a_by_tszlhj.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['djh']
        User.find_by_sql("update archive set cfwz='#{params['cfwz']}',  bz='#{params['bz']}', tm='#{params['mc']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_tszlhj where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_tszlhj(djh,kq,mc,fs,yfdw,cbrq,dj,dh,ownerid) values('#{params['djh']}','#{params['kq']}','#{params['mc']}','#{params['fs']}','#{params['yfdw']}','#{params['cbrq']}','#{params['dj']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_tszlhj set djh='#{params['djh']}', kq='#{params['kq']}', mc='#{params['mc']}', fs='#{params['fs']}', yfdw='#{params['yfdw']}', cbrq='#{params['cbrq']}', dj='#{params['dj']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '登记号为'+params['djh']+'；已经存在，请重新输入登记号。'
      end
    when "31"                                        
      user=User.find_by_sql("select * from archive,a_by_jcszhb where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_jcszhb.zt='#{params['zt']}'  and archive.id=a_by_jcszhb.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['zt']
        User.find_by_sql("update archive set  tm='#{params['zt']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_jcszhb where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_jcszhb(zt,qy,tjsj,sm,dh,ownerid) values('#{params['zt']}','#{params['qy']}','#{params['tjsj']}','#{params['sm']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_jcszhb set zt='#{params['zt']}', qy='#{params['qy']}', tjsj='#{params['tjsj']}', sm='#{params['sm']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '专题为'+params['zt']+'；已经存在，请重新输入专题。'
      end      
    when "32"                                        
      user=User.find_by_sql("select * from archive,a_by_zzjgyg where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_zzjgyg.jgmc='#{params['jgmc']}'  and archive.id=a_by_zzjgyg.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['jgmc']
        User.find_by_sql("update archive set  tm='#{params['jgmc']}',bz='#{params['bz']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_zzjgyg where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_zzjgyg(jgmc,zzzc,qzny,dh,ownerid) values('#{params['jgmc']}','#{params['zzzc']}','#{params['qzny']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_zzjgyg set jgmc='#{params['jgmc']}', zzzc='#{params['zzzc']}', qzny='#{params['qzny']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '机构名称为'+params['jgmc']+'；已经存在，请重新输入机构名称。'
      end      
    when "33"                                        
      user=User.find_by_sql("select * from archive,a_by_dsj where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_dsj.sy='#{params['sy']}'  and archive.id=a_by_dsj.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['sy']
        User.find_by_sql("update archive set  tm='#{params['sy']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_dsj where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_dsj(dd,jlr,clly,fsrq,jlrq,sy,yg,rw,dh,ownerid) values('#{params['dd']}','#{params['jlr']}','#{params['clly']}','#{params['fsrq']}','#{params['jlrq']}','#{params['sy']}','#{params['yg']}','#{params['rw']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_dsj set yg='#{params['yg']}', rw='#{params['rw']}',fsrq='#{params['fsrq']}', jlrq='#{params['jlrq']}', sy='#{params['sy']}',dd='#{params['dd']}', jlr='#{params['jlr']}', clly='#{params['clly']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '事由为'+params['jgmc']+'；已经存在，请重新输入事由。'
      end 
    when "34"                                        
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}'   and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']
        User.find_by_sql("update archive set  mlh='#{params['mlh']}',tm='#{params['qzgcgjj']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_qzsm where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_qzsm(qzgcgjj,sj,dh,ownerid) values('#{params['qzgcgjj']}','#{params['sj']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_dsj set qzgcgjj='#{params['qzgcgjj']}', sj='#{params['sj']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；已经存在，请重新输入目录号。'
      end           
    when "24"                                  
      params['jh']=params['jh'].to_i
      params['jh']=params['jh'].to_s
      if params['jh'].length>3
        jh=params['jh']
      else
        jh=sprintf("%04d", params['jh'])
      end
      user=User.find_by_sql("select * from archive,a_wsda where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_wsda.nd='#{params['nd']}' and a_wsda.bgqx='#{params['bgqx']}' and a_wsda.jgwth='#{params['jgwth']}' and a_wsda.jh='#{jh}' and archive.id=a_wsda.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['nd']+"_" + params['bgqx']+"_" + params['jgwth']+"_" + params['jh']
        User.find_by_sql("update archive set ys='#{params['ys']}', nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', mlh='#{params['mlh']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_tjml where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_wsda(ownerid,hh,jh, zwrq, wh, zrr,gb, wz,ztgg,ztlx,ztdw,dagdh,dzwdh,swh,ztsl,qwbs,ztc,zbbm,nd,jgwth,gbjh,xbbm,bgqx) values('#{params['id']}','#{params['hh']}','#{jh}','#{params['zwrq']}','#{params['wh']}','#{params['zrr']}','#{params['gb']}','#{params['wz']}','#{params['ztgg']}','#{params['ztlx']}','#{params['ztdw']}','#{params['dagdh']}','#{params['dzwdh']}','#{params['swh']}','#{params['ztsl']}','#{params['qwbs']}','#{params['ztc']}','#{params['zbbm']}','#{params['nd']}','#{params['jgwth']}','#{params['gbjh']}','#{params['xbbm']}','#{params['bgqx']}') ")                                      
        else
                
          User.find_by_sql("update a_wsda set hh='#{params['hh']}', jh='#{jh}', dzwdh='#{params['dzwdh']}', wh='#{params['wh']}', zrr='#{params['zrr']}', dh='#{dh}',gb='#{params['gb']}', wz='#{params['wz']}', ztgg='#{params['ztgg']}', ztlx='#{params['ztlx']}', ztdw='#{params['ztdw']}', dagdh='#{params['dagdh']}', swh='#{params['swh']}', ztsl='#{params['ztsl']}', qwbs='#{params['qwbs']}', ztc='#{params['ztc']}', zbbm='#{params['zbbm']}', nd='#{params['nd']}', jgwth='#{params['jgwth']}', gbjh='#{params['gbjh']}', xbbm='#{params['xbbm']}', bgqx='#{params['bgqx']}'  where ownerid = #{params['id']};")
        end
        txt='success'
      else
        txt= '年度为'+params['nd']+'；机构问题号为'+params['jgwth']+';保管期限为'+params['bgqx']+';件号为'+params['jh']+'已经存在，请重新输入年度、机构问题号、保管期限或件号。'
      end    
    else     
      params['ajh']=params['ajh'].to_i
      params['ajh']=params['ajh'].to_s 
      if params['ajh'].length>3
        ajh=params['ajh']
      else
        ajh=sprintf("%04d", params['ajh'])
      end
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}' and id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "_" + params['dalb'] +"_" + params['mlh']+"_" + params['ajh']
        User.find_by_sql("update archive set nd='#{params['nd']}', bgqx='#{params['bgqx']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
      end
    end
    render :text => txt
  end
    
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
   
  def save2timage(id, yxbh, path)
    if $conn.nil?
      $conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
    end
    
    user=User.find_by_sql("select mlh,flh,ajh,dh from archive where id=#{id};")
    
    yxdx=File.open(path).read.size
    edata=PGconn.escape_bytea(File.open(path).read)
    yxmc="#{user[0].mlh}\$#{user[0].flh[0..0]}\$#{user[0].ajh}\$#{yxbh}"
    
    count = User.find_by_sql("select count(*) from timage where dh='#{user[0].dh}' and yxbh='#{yxbh}';")[0].count

    if count.to_i > 0
      $conn.exec("update timage set yxdx = #{yxdx}, data= E'#{edata}' where dh='#{user[0].dh}' and yxbh='#{yxbh}';")
    else
      $conn.exec("insert into timage (dh, yxmc, yxbh, yxdx, data) values ('#{user[0].dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' );")
    end
  end
 
  def get_timage
    if (params['dh'].nil?)
      txt = "{results:0,rows:[]}"
    else
      if params['type'].to_i == 0

        system("ruby ./dady/bin/prepare_timage.rb #{params['dh']} &")
        
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
        ss = params['dh'].split("-")
        dh = "#{ss[0]}-#{ss[1]}-#{ss[2]}"
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
      user = User.find_by_sql("select id, dh, yxmc from timage where id='#{params['gid']}';")
      dh = user[0]['dh']
      if !File.exists?("./dady/img_tmp/#{dh}/")
        system"mkdir -p ./dady/img_tmp/#{dh}/"
      end
      local_filename = "./dady/img_tmp/#{dh}/"+user[0]["yxmc"].gsub('$', '-').gsub('TIF','JPG')
      if !File.exists?(local_filename)
        user = User.find_by_sql("select id, dh, yxmc, data from timage where id='#{params['gid']}';")
        File.open(local_filename, 'w') {|f| f.write(user[0]["data"]) }
      end
      small_filename = "./dady/img_tmp/#{dh}/"+user[0]["yxmc"].gsub('$', '-').gsub('TIF','JPG')
      puts("convert -resize 20% '#{local_filename}' '#{small_filename}'")
      system("convert -resize 20% '#{local_filename}' '#{small_filename}'")
      txt = "/assets/dady/img_tmp/#{dh}/#{user[0]["yxmc"].gsub('$', '-')}".gsub('TIF','JPG')
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
    dydh = "#{qzh}-#{dalb}-#{mlh}"
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

    dydh = "#{qzh}-#{dalb}-#{mlh}"
    User.find_by_sql("delete from p_status where dydh='#{dydh}';")
    User.find_by_sql("insert into p_status (dydh, mlh, dqjh, qajh, zajh, dyzt) values ('#{dydh}', '#{mlh}', '#{qajh}', '#{qajh}', '#{zajh}', '正在准备打印' );")

    system("ruby ./dady/bin/print_wizard.rb #{qzh} #{mlh} #{dalb} #{qajh} #{zajh} #{dylb} 1 &")
    render :text => "Success"
  end

  def export_image
    user = User.find_by_sql("select qzh, mlh, dalb from archive where id = #{params['id']}");
    
    data = user[0]
    dh = "#{data.qzh}-#{data.dalb}-#{data.mlh}-%"
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
      local_filename = "#{outPath}/"+user[0]["yxmc"]
      File.open(local_filename, 'w') {|f| f.write(ss) }
    end
    
    logger.debug "zip #{outPath}.zip #{outPath}/*"
    system "zip -0 #{outPath}.zip #{outPath}/*"
    render :text => "/assets/dady/#{data.mlh}.zip"
    
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
    
    dh = "#{qzh}-#{dalb}-#{mlh}-%"
    
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
  
  #查询借阅流程
  def get_jydjlc_jyzt
    useridwhere=""
    if (params['jyzt'].nil?)
      txt = "{results:0,rows:[]}"
    else
      jyzt=params['jyzt']
      if (jyzt=='')
        txt = "{results:0,rows:[]}"
      else
        case jyzt
          when '1'
            js_id=""
            user= User.find_by_sql("select jsid from u_js where userid=  '#{params["userid"]}' order by id;")
            user.each do |us|
              logger.debug us['jsid']
              if js_id==""
                js_id=us['jsid']
              else
                js_id=js_id + "," +us['jsid']
              end
            end
            sort=User.find_by_sql("select * from qx_mlqx where user_id in (#{js_id}) and qxlb=4 and qxid=9;")
            size = sort.size;
            if size > 0
              useridwhere=""
            else
              useridwhere=" and czrid=" + params['userid']
            end
          else
            useridwhere=" and czrid=" + params['userid']
        end
        user = User.find_by_sql("select count(*) from jylc where jyzt = #{params['jyzt']}  #{useridwhere};")[0]
        size = user.count.to_i;
        if size > 0
          txt = "{results:#{size},rows:["
          user = User.find_by_sql("select * from jylc where jyzt = #{params['jyzt']}  #{useridwhere};")
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
        cx_tj=cx_tj + " and archive.ajh like '%#{params['ajh']}%'"
      else
        cx_tj=" archive.ajh like '%#{params['ajh']}%'"
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
          User.find_by_sql("insert into jylist(jyid, daid,iPhoneList) values ('#{user[0]["id"]}', '#{ss[k]}','1');")
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
      #user = User.find_by_sql("select max(id) as id from jylc;")
      ss = params['jy_aj_list'].split(',')
      for k in 0..ss.length-1
        User.find_by_sql("insert into jylist(jyid, daid,iPhoneList) values ('#{params['id']}', '#{ss[k]}','1');")
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
    user =User.find_by_sql("update jylist set hdsj ='#{rq}',iPhoneList=2 where jyid=#{params['id']};")
    render :text => 'success'
  end
  
  def xjhd_jylc
    rq=Time.now.strftime("%Y-%m-%d")
    ss = params['ids'].split(',')
    for k in 0..ss.length-1
      User.find_by_sql("update jylist set hdsj ='#{rq}',iPhoneList=2 where daid ='#{ss[k]}' and jyid=#{params['id']};")
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

  def get_mulu_store_1
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
  
  def get_mulu_store
    if params['dh'].nil?
      txt = "{results:0,rows:[]}"
    else
      dh = params['dh']
      fl = params['filter']
     
      if fl.nil? || fl=='全部'
        user = User.find_by_sql("select count(*) from timage_tj where dh_prefix='#{dh}';")
      else
        user = User.find_by_sql("select count(*) from timage_tj where dh_prefix='#{dh}' and zt='#{fl}';")
      end    
      size = user[0].count;
      if size.to_i > 0
          txt = "{results:#{size},rows:["
          if  fl.nil? || fl=='全部'
            user = User.find_by_sql("select * from timage_tj where dh_prefix='#{dh}' order by ajh limit #{params['limit']} offset #{params['start']};")
          else 
            user = User.find_by_sql("select * from timage_tj where dh_prefix='#{dh}' and zt='#{fl}' order by ajh limit #{params['limit']} offset #{params['start']};")
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
    render :text => txt
  end

  def prepare_upload_info
    ss = id.split('|')
    user = User.find_by_sql("select id, dwdm from d_dwdm whre id='#{ss[0]}';")
    dwdm = user[0].dwdm
    if ss.size == 3
      qzh, dalb, mlh = ss[0], ss[1], ss[2]
      path = "/share/#{dwdm}/目录#{mlh}"

      tpsl = Dir["#{path}/*.jpg"].size
      user = User.find_by_sql("select count(*) as count from timage where dh like '#{qzh}-#{dalb}-#{mlh}-%';")
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

  def add_print_task
    qzh, mlh, dalb, qajh, zajh = params['qzh'], params['mlh'], params['dalb'], params['qajh'], params['zajh']

    dylb = 0
    dylb += 8 if !params['dylb-1'].nil?
    dylb += 4 if !params['dylb-2'].nil?
    dylb += 2 if !params['dylb-3'].nil?
    dylb += 1 if !params['dylb-4'].nil?
  
    dydh = "#{qzh}-#{dalb}-#{mlh}"
    User.find_by_sql("delete from p_status where dydh='#{dydh}';")
    User.find_by_sql("insert into p_status (dydh, mlh, dqjh, qajh, zajh, dyzt, dylb) values ('#{dydh}', '#{mlh}', '#{qajh}', '#{qajh}', '#{zajh}', '未打印', '#{sprintf("%02b", dylb)}');")
  
    render :text => 'Success'
  end

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
        dydh = "#{qzh}-#{dalb}-#{mlh}"
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
        dydh = "#{qzh}-#{dalb}-#{mlh}"
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
    system("ruby ./dady/bin/update_timage_tj.rb #{dh} &")
    render :text => 'Success'
  end

  def print_timage_tj
    dh = params['dh']
    system("ruby ./dady/bin/print_mulu_tj.rb #{dh}")
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
        data = User.find_by_sql("select * from  d_dwdm  order by id;")
        text="["
        data.each do |dd|
          text=text+"{'text':'#{dd['dwdm']}','id' :'#{dd['id']}','leaf':false,'checked':false,'cls':'folder','children':["

          dalb=User.find_by_sql("select d_dw_lb.id, d_dw_lb.dwid, d_dw_lb.lbid, d_dw_lb.lbmc from  d_dw_lb,d_dalb where d_dw_lb.lbid = d_dalb.id and d_dalb.sx<100 and dwid=#{dd['id']} order by d_dalb.sx;")
          dalb.each do |lb|
            text=text+"{'text':'#{lb['lbmc']}','id' :'#{dd['id']}_#{lb['lbid']}','leaf':false,'checked':false,'cls':'folder','children':["
            if lb['lbid'].to_i>99
            
              dalbrj=User.find_by_sql("select d_dw_lb.id, d_dw_lb.dwid, d_dw_lb.lbid, d_dw_lb.lbmc from  d_dw_lb,d_dalb where d_dw_lb.lbid = d_dalb.id  and d_dalb.ownerid=#{lb['lbid']} and dwid=#{dd['id']};")
              dalbrj.each do |dalbrj|
              
                text=text+"{'text':'#{dalbrj['lbmc']}','id' :'#{dd['id']}_#{dalbrj['lbid']}','leaf':false,'checked':false,'cls':'folder','children':["
                dalbml=User.find_by_sql("select * from  d_dw_lb_ml where d_dw_lbid= #{dalbrj['id']} order by id;")
                dalbml.each do |lbml|
                  text=text+"{'text':'#{lbml['mlhjc']}','id' :'#{dd['id']}_#{dalbrj['lbid']}_#{lbml['id']}','leaf':false,'checked':false,'cls':'folder','children':["
                  text=text+"{'text':'查询','id' :'#{dd['id']}_#{dalbrj['lbid']}_#{lbml['id']}_q','leaf':true,'checked':false,'iconCls':'accordion'},"
                  text=text+"{'text':'打印','id' :'#{dd['id']}_#{dalbrj['lbid']}_#{lbml['id']}_p','leaf':true,'checked':false,'iconCls':'print'},"
                  text=text+"{'text':'新增','id' :'#{dd['id']}_#{dalbrj['lbid']}_#{lbml['id']}_a','leaf':true,'checked':false,'iconCls':'add'},"
                  text=text+"{'text':'修改','id' :'#{dd['id']}_#{dalbrj['lbid']}_#{lbml['id']}_m','leaf':true,'checked':false,'iconCls':'option'},"
                  text=text+"{'text':'删除','id' :'#{dd['id']}_#{dalbrj['lbid']}_#{lbml['id']}_d','leaf':true,'checked':false,'iconCls':'delete'},"
                  text=text+"]},"
                end
                text=text+"]},"
              end
            else
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
            end
            text=text+"]},"
           
         end
         text=text+"]},"
        end
        text=text + "]"
        render :text => text
     end
  #  dalb=User.find_by_sql("select * from d_dalb where sx<100 order by sx;")
  #  dalb.each do |lb|
  #    text=text+"{'text':'#{lb['lbdm']}#{lb['lbmc']}','id':'#{lb['id']}','leaf':false,'checked':false,'cls':'folder','children':["
  #    
  #    dalbml=User.find_by_sql("select * from  d_dalb where ownerid=  #{lb['id']} order by id;")
  #    dalbml.each do |lbml|
  #      text=text+"{'text':'#{lbml['lbmc']}','id' :'#{lbml['id']}','leaf':true,'checked':false,'cls':'folder'},"                  
  #    end
  #   text=text+"]},"
  # end
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
    user = User.find_by_sql("select users.*,d_dwdm.dwdm from users left join d_dwdm on users.ssqz=d_dwdm.id order by users.id;")

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
  #获取档案类别列表
  def  get_dalb_grid
    user = User.find_by_sql("select * from d_dalb where id<100 order by id;")

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
      #data = User.find_by_sql("select * from  d_dalb order by id;")
      text="[{'text':'档案类别','id' :'root1','leaf':false,'checked':false,'expanded':true,'cls':'folder','children':["
      dalb=User.find_by_sql("select * from d_dalb where sx<100 order by sx;")
      dalb.each do |lb|
        text=text+"{'text':'#{lb['lbdm']}#{lb['lbmc']}','id':'#{lb['id']}','leaf':false,'checked':false,'cls':'folder','children':["
        
        dalbml=User.find_by_sql("select * from  d_dalb where ownerid=  #{lb['id']} order by id;")
        dalbml.each do |lbml|
          text=text+"{'text':'#{lbml['lbmc']}','id' :'#{lbml['id']}','leaf':true,'checked':false,'cls':'folder'},"                  
        end
       text=text+"]},"
     end
    # data.each do |dd|
    #     text=text+"{'text':'#{dd['lbmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
    # end
      text=text + "]}]"
      render :text => text
    end
  end
  #获得档案类别树
  def get_lb_qx_tree
    node, style = params["node"], params['style']
    if node == "root"
      #data = User.find_by_sql("select * from  d_dalb order by id;")
      text="[{'text':'档案类别','id' :'root1','leaf':false,'checked':false,'expanded':true,'cls':'folder','children':["
      dalb=User.find_by_sql("select * from d_dalb where sx<100 order by sx;")
      dalb.each do |lb|
        text=text+"{'text':'#{lb['lbdm']}#{lb['lbmc']}','id':'#{lb['id']}','leaf':false,'checked':false,'cls':'folder','children':["        
        dalbml=User.find_by_sql("select * from  d_dalb where ownerid=  #{lb['id']} order by id;")
        size=dalbml.size
        if size>0 
          dalbml.each do |lbml|
            text=text+"{'text':'#{lbml['lbmc']}','id' :'#{lbml['id']}','leaf':false,'checked':false,'cls':'folder','children':["
            text=text+"{'text':'查询','id' :'#{lbml['id']}_q','leaf':true,'checked':false,'iconCls':'accordion'},"
            text=text+"{'text':'打印','id' :'#{lbml['id']}_p','leaf':true,'checked':false,'iconCls':'print'},"
            text=text+"{'text':'新增','id' :'#{lbml['id']}_a','leaf':true,'checked':false,'iconCls':'add'},"
            text=text+"{'text':'修改','id' :'#{lbml['id']}_m','leaf':true,'checked':false,'iconCls':'option'},"
            text=text+"{'text':'删除','id' :'#{lbml['id']}_d','leaf':true,'checked':false,'iconCls':'delete'},"
            text=text+"{'text':'影像文件查看','id' :'#{lbml['id']}_i','leaf':true,'checked':false,'cls':'folder'},"
            text=text+"]},"                 
          end
          text=text+"]},"
       else
         text=text+"{'text':'查询','id' :'#{lb['id']}_q','leaf':true,'checked':false,'iconCls':'accordion'},"
         text=text+"{'text':'打印','id' :'#{lb['id']}_p','leaf':true,'checked':false,'iconCls':'print'},"
         text=text+"{'text':'新增','id' :'#{lb['id']}_a','leaf':true,'checked':false,'iconCls':'add'},"
         text=text+"{'text':'修改','id' :'#{lb['id']}_m','leaf':true,'checked':false,'iconCls':'option'},"
         text=text+"{'text':'删除','id' :'#{lb['id']}_d','leaf':true,'checked':false,'iconCls':'delete'},"
         text=text+"{'text':'影像文件查看','id' :'#{lb['id']}_i','leaf':true,'checked':false,'cls':'folder'},"
         text=text+"]},"
       end
     end
    # data.each do |dd|
    #     text=text+"{'text':'#{dd['lbmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
    # end
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
        data = User.find_by_sql("select d_dw_lb.id, d_dw_lb.dwid, d_dw_lb.lbid, d_dw_lb.lbmc,d_dalb.ownerid from  d_dw_lb,d_dalb where d_dw_lb.lbid = d_dalb.id and d_dalb.sx<100 and dwid = #{params['id']} order by d_dalb.sx;")
        text="["
        
        data.each do |dd|
          
          if dd['lbid'].to_i>99  
            text=text+"{'text':'#{dd['lbmc']}','id' :'#{dd['id']}','checked':false,'cls':'folder','children':["        
            dalbrj=User.find_by_sql("select d_dw_lb.id, d_dw_lb.dwid, d_dw_lb.lbid, d_dw_lb.lbmc from  d_dw_lb,d_dalb where d_dw_lb.lbid = d_dalb.id  and d_dalb.ownerid=#{dd['lbid']} and dwid=#{params['id']};")
            dalbrj.each do |dalbrj|            
              text=text+"{'text':'#{dalbrj['lbmc']}','id' :'#{dalbrj['id']}','leaf':true,'checked':false,'cls':'folder'},"
            end
            text=text+"]},"
          else
             text=text+"{'text':'#{dd['lbmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'cls':'folder'}," 
          end
          
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
     if qx[0]!="root1"
       ids=qx[0].split('_')
       if qx[2]=="0"
         if ids.length==2
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
   end
    render :text => 'success'
  end

  #更新用户信息
  def update_user
   user=User.find_by_sql("select * from users where id <> #{params['id']} and (email='#{params['email']}' or username='#{params['username']}');")
   size = user.size
   if size == 0
     User.find_by_sql("update users set ssqz='#{params['dwdm']}',email='#{params['email']}', username='#{params['username']}', sfxsxyisj='#{params['sfxsxyisj']}' where id = #{params['id']};")
     txt='success'
   else
     txt= '用户名称或Email已经存在，请重新输入用户名称或Email。'
   end
   render :text => txt
  end
  
  #新增用户信息
  def insert_user
    #logger.debug  User。id
    user=User.find_by_sql("select * from users where  email='#{params['email']}' or username='#{params['username']}';")
    size = user.size
    if size == 0
   
      user = User.new
   
      user.email=params['email']
      user.username=params['username']
      user.sfxsxyisj=params['sfxsxyisj']
      user.ssqz=params['dwdm']
      user.password_confirmation=params['encrypted_password']
   
      user.password = params['encrypted_password']
      user.save
   
      txt='success'
    else
      txt= '用户名称或Email已经存在，请重新输入用户名称或Email。'
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
    user = User.find_by_sql("SELECT  a.dwdm,a.dwjc,a.id,a.owner_id,a.dj,b.dwdm as ssqz FROM  d_dwdm a  left join d_dwdm b on a.owner_id = b.id order by id;")
    #user = User.find_by_sql("SELECT  * from d_dwdm order by id;")
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
    logger.debug txt
    render :text => txt
    
  end
  
  #更新全宗信息
  def update_qz
    if params['ssqz']==""
      params['ssqz']=0
    end
    user=User.find_by_sql("select * from d_dwdm where id <> #{params['id']} and dwdm='#{params['dwdm']}';")
    size = user.size
    if size == 0
      User.find_by_sql("update d_dwdm set owner_id='#{params['ssqz']}',dj='#{params['dj']}',dwdm='#{params['dwdm']}', dwjc='#{params['dwjc']}' where id = #{params['id']};")
      txt='success'
    else
      txt= '全宗名称已经存在，请重新输入全宗名称。'
    end
    render :text => txt
  end
  
  #新增全宗信息
  def insert_qz
    if params['ssqz']==""
      params['ssqz']=0
    end
    user=User.find_by_sql("select * from d_dwdm where  dwdm='#{params['dwdm']}';")
    size = user.size
    if size == 0
      User.find_by_sql("insert into d_dwdm(dwdm, dwjc,owner_id,dj) values ('#{params['dwdm']}', '#{params['dwjc']}', '#{params['ssqz']}', '#{params['dj']}');")
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
      
      size = user.size;
      if size > 0
        jyid=user[0]["jyid"]
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
    userid=""
    jsid=""
    ssqz=""
    node, style = params["node"], params['style']
    user= User.find_by_sql("SELECT distinct d_js.jsdj FROM d_js, u_js WHERE u_js.jsid = d_js.id and userid=  '#{params["userid"]}' ;")
    user.each do |us|
      logger.debug us['jsdj']
      if userid==""
        userid="'" + us['jsdj'] + "'"
      else
        userid=userid + ",'" +us['jsdj']+ "'"
      end
    end
    if userid!="" 
      data = User.find_by_sql("select * from users where id= #{params["userid"]};")
      if data[0]["sfxsxyisj"]=="是"
        if userid.include?"地市级"
          userid="'地市级','县级','乡镇级'"
        else
          if userid.include?"县级"
            userid="'县级','乡镇级'"
          else
            userid="'乡镇级'"
          end
        end
        dwdm= User.find_by_sql("select * from d_dwdm where id= #{data[0]["ssqz"]} or owner_id=#{data[0]["ssqz"]};")
        dwdm.each do |qz|
          if ssqz==""
            ssqz=qz['id'].to_s 
          else
            ssqz=ssqz + "," +qz['id'].to_s
          end
          xjqz=User.find_by_sql("select * from d_dwdm where  owner_id=#{qz['id']};")
          xjqz.each do |xqz|
            if ssqz==""
              ssqz=xqz['id'].to_s 
            else
              ssqz=ssqz + "," +xqz['id'].to_s
            end
          end
        end
        
      else
        ssqz=data[0]["ssqz"]
      end
           
    end
      if node == "root"
        if userid!="" 
          data = User.find_by_sql("select * from  d_dwdm where dj in (#{userid}) and id in (#{ssqz})  order by id;")
          text="["
          data.each do |dd|
            text=text + "{'text':'#{dd['id']}#{dd['dwdm']}','id' :'#{dd["id"]}','leaf':false,'cls':'folder'},"
          end
          text=text +"]"          
        end
      else
        pars = node.split('_') || []
        user= User.find_by_sql("SELECT *  FROM  u_js WHERE  userid=  '#{params["userid"]}' ;")
        user.each do |us|            
          if jsid==""
            jsid=us['jsid']
          else
            jsid=jsid + "," +us['jsid']
          end
        end
        text="["
        if pars.length == 1
          dwdj=User.find_by_sql("select * from  d_dwdm where id= #{pars[0]};")
          data = User.find_by_sql("select distinct qxdm ,qxmc ,qxid,sx from qx_mlqx,d_dalb where user_id in (#{jsid}) and qxlb=0 and d_dalb.id=qxid  order by sx;")
          data.each do |dd|
            if dd['sx'].to_i>0 
              text=text+"{'text':'#{dd['qxmc']}','id':'#{pars[0]}_#{dd['qxdm']}','leaf':false,'cls':'folder'},"
            else
            end
            
          end
          text=text+"]"
        end
        if pars.length == 2
          if pars[1].to_i<99 
            txt=[]  
            text=""         
            data = User.find_by_sql("select distinct mlh from archive    where qzh='#{pars[0]}' and dalb='#{pars[1]}' order by mlh;")
            data.each do |dd|
              txt << {:text => "目录 #{dd['mlh']}", :id => node+"_#{dd["mlh"]}", :leaf => true, :cls => "file"}
            end
            
          else
            dwdj=User.find_by_sql("select * from  d_dwdm where id= #{pars[0]};")
            data = User.find_by_sql("select distinct qxdm ,qxmc ,qxid,sx from qx_mlqx,d_dalb where user_id in (#{jsid}) and qxlb=0 and d_dalb.id=qxid and d_dalb.ownerid='#{pars[1]}' order by qxid;")
            
            data.each do |dd|
              
                text=text+"{'text':'#{dd['qxmc']}','id':'#{pars[0]}_#{dd['qxdm']}','leaf':false,'cls':'folder'},"
              
            end
            text=text+"]"
          end
        end
      end
    if text=="" 
      render :text => txt.to_json
    else
      render :text => text
    end
  end

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
      if ss.length>2
                  
            user = User.find_by_sql("select count(*) from archive where qzh = '#{ss[0]}' and dalb = '#{ss[1]}' and mlh = '#{ss[2]}';")
            size = user[0].count;
  
            if size.to_i > 0
                txt = "{results:#{size},rows:["
                case (ss[1]) 
									when "0"
										user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}' order by ajh limit #{params['limit']} offset #{params['start']};")
									 
									when "2"
										user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
										
									when "3","5","6","7"
										user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
									when "15"
										user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
                  when "18"
										user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
                  when "25"
										user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
                  when "27"
										user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}' order by ajh limit #{params['limit']} offset #{params['start']};")
                  when "26"
										user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
                  when "28"
										user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
                  when "29"
										user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
                  when "30"
										user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by djh limit #{params['limit']} offset #{params['start']};")
                  when "31"
  									user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by zt limit #{params['limit']} offset #{params['start']};")
                  when "32"
  									user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by jgmc limit #{params['limit']} offset #{params['start']};")
                  when "33"
  									user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by fsrq limit #{params['limit']} offset #{params['start']};")
                  when "34"
  									user = User.find_by_sql("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by sj limit #{params['limit']} offset #{params['start']};")
                  
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
                    user = User.find_by_sql("select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   order by nd,bgqx,jgwth,jh limit #{params['limit']} offset #{params['start']};")
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
        
          user = User.find_by_sql("select count(*) from archive where qzh = '#{ss[0]}' and dalb = '#{ss[1]}' ;")
          size = user[0].count;

          if size.to_i > 0
              txt = "{results:#{size},rows:["
              case (ss[1]) 
								when "0"
									user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'  order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
									
								when "2"
									user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from  archive left join a_jhcw on archive.id=a_jhcw.ownerid  where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'  order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
									
								when "3" ,"5","6","7"
									user = User.find_by_sql("select archive.*,a_tddj.* from archive left join a_tddj on archive.id=a_tddj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
								when "15"
									user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid  where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'  order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "18"
									user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "25"
									user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "27"
									user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "26"
									user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "28"
									user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "29"
									user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "30"
									user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by djh limit #{params['limit']} offset #{params['start']};")
                when "31"
									user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by zt limit #{params['limit']} offset #{params['start']};")
                when "32"
									user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by jgmc limit #{params['limit']} offset #{params['start']};")
                when "33"
									user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by fsrq limit #{params['limit']} offset #{params['start']};")
                when "34"
									user = User.find_by_sql("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by sj limit #{params['limit']} offset #{params['start']};")

                
								when "24"
									user = User.find_by_sql("select archive.dh, archive.bz,archive.mlh,archive.flh,archive.ys,archive.mj,archive.id,archive.tm,archive.dalb,archive.qzh,a_wsda.jh, a_wsda.hh,a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from  archive left join a_wsda on archive.id=a_wsda.ownerid  where archive.qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by nd,bgqx,jgwth,jh limit #{params['limit']} offset #{params['start']};")
									
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
      	  if (params['ztsl']=='')
            params['ztsl']=0        
          end
          if (params['sl']=='')
            params['sl']=0        
          end
          if (params['js']=='')
            params['js']=0        
          end
          if (params['ys']=='')
            params['ys']=0        
          end
          if (params['gzsj']=='')
            params['gzsj']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['sjsj']=='')
            params['sjsj']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['qrq']=='')
            params['qrq']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['zrq']=='')
            params['zrq']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['zwrq']=='')
            params['zwrq']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['xcrq']=='')
            params['xcrq']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['cbrq']=='')
            params['cbrq']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['fsrq']=='')
            params['fsrq']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['jlrq']=='')
            params['jlrq']=Time.now.strftime("%Y-%m-%d")
          end
          if (params['sj']=='')
            params['sj']=Time.now.strftime("%Y-%m-%d")
          end
      	  txt=""
      	  case params['dalb']
    	    when "0"
    	      params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
    	      if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']
        	    User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,xh,cfwz,mj,dwdm) values('#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}','#{params['mj']}','#{dw[0]['dwdm']}') ")
              txt='success'
            else
              txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
            end

          when "2"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']
        	    User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qrq,zrq,ys,js,bz,qzh,dh,dalb,mj,dwdm) values('#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qrq']}','#{params['zrq']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['mj']}','#{dw[0]['dwdm']}') ")
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_jhcw(jnzs,fjzs,ownerid,pzqh,pzzh,dh) values('#{params['jnzs']}','#{params['fjzs']}','#{archiveid[0]['id']}','#{params['pzqh']}','#{params['pzzh']}','#{dh}') ")                        
                txt='success'
              end
            else
              txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
            end
          when "3","5","6","7"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']
        	    User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,mj,xh,cfwz,dwdm) values('#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['qlrmc']};#{params['djh']};#{params['tdzl']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}','#{dw[0]['dwdm']}') ")
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_tddj(djh,qlrmc,ownerid,tdzl,tdzh,dh,qsxz,tfh,ydjh) values('#{params['djh']}','#{params['qlrmc']}','#{archiveid[0]['id']}','#{params['tdzl']}','#{params['tdzh']}','#{dh}','#{params['qsxz']}','#{params['ydjh']}') ")                        

                txt='success'
              end
            else
              txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
            end
          when "15"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']      	    
        	    User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,xh,cfwz,mj,dwdm) values('#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}','#{params['mj']}','#{dw[0]['dwdm']}') ")           
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_sx(zl,ownerid) values('#{params['zl']}','#{archiveid[0]['id']}') ")                        
                txt='success'
              end
            else
              txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
            end    
          when "18"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']      	    
        	    User.find_by_sql("insert into archive(mlh,ajh,tm,nd,bgqx,ys,bz,qzh,dh,dalb,dwdm) values('#{params['mlh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}') ")           
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_tjml(tfh,tgh,ownerid) values('#{params['tfh']}','#{params['tgh']}','#{archiveid[0]['id']}') ")                        
                txt='success'
              end
            else
              txt= '目录号为'+params['mlh']+'；序号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
            end      
          when "25"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']      	    
        	    User.find_by_sql("insert into archive(flh,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,cfwz,xh) values('#{params['flh']}','#{params['mlh']}','#{ajh}','#{params['tm']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['cfwz']}','#{params['xh']}') ")           
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_dzda(tjr,rjhj,czxt,sl,bfs,ztbhdwjgs,yyrjpt,tjdw,wjzt,dzwjm,ztbh,xcbm,xcrq,jsr,jsdw,yjhj,dh,ownerid) values('#{params['tjr']}','#{params['rjhj']}','#{params['czxt']}','#{params['sl']}','#{params['bfs']}','#{params['ztbhdwjgs']}','#{params['yyrjpt']}','#{params['tjdw']}','#{params['wjzt']}','#{params['dzwjm']}','#{params['ztbh']}','#{params['xcbm']}','#{params['xcrq']}','#{params['jsr']}','#{params['jsdw']}','#{params['yjhj']}','#{dh}','#{archiveid[0]['id']}') ")                        
                txt='success'
              end
            else
              txt= '档号为'+params['mlh']+'；顺序号为'+params['ajh']+'已经存在，请重新输入档号为或顺序号。'
            end
          when "27"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']      	    
        	    User.find_by_sql("insert into archive(flh,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,mj,xh,cfwz) values('#{params['flh']}','#{ajh}','#{params['zcmc']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}') ")           
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_sbda(zcmc,gzsj,dw,sl,cfdd,sybgdw,sybgr,zcbh,dj,je,dh,ownerid) values('#{params['zcmc']}','#{params['gzsj']}','#{params['dw']}','#{params['sl']}','#{params['cfdd']}','#{params['sybgdw']}','#{params['sybgr']}','#{params['zcbh']}','#{params['dj']}','#{params['je']}','#{dh}','#{archiveid[0]['id']}') ")                        
                txt='success'
              end
            else
              txt= '目录号为'+params['mlh']+'；件号为'+params['ajh']+'已经存在，请重新输入目录号为或件号。'
            end
          when "26"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']      	    
        	    User.find_by_sql("insert into archive(flh,qny,zny,nd,js,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,mj,xh,cfwz) values('#{params['flh']}','#{params['qny']}','#{params['zny']}','#{params['nd']}','#{params['js']}','#{params['mlh']}','#{ajh}','#{params['zcmc']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}') ")           
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_jjda(xmmc,jsdw,dh,jsnd,ownerid) values('#{params['xmmc']}','#{params['jsdw']}','#{dh}','#{params['nd']}','#{archiveid[0]['id']}') ")                                                                     
                txt='success'
              end
            else
              txt= '目录号为'+params['mlh']+'；案卷号为'+params['ajh']+'已经存在，请重新输入目录号为或案卷号号。'
            end
          when "28"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']      	    
        	    User.find_by_sql("insert into archive(flh,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,mj,xh,cfwz) values('#{params['flh']}','#{params['mlh']}','#{ajh}','#{params['mc']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}') ")           
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_swda(bh,lb,hjz,sjsj,sjdw,mc,ztxs,dh,ownerid) values('#{params['bh']}','#{params['lb']}','#{params['hjz']}','#{params['sjsj']}','#{params['sjdw']}','#{params['mc']}','#{params['ztxs']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
                txt='success'
              end
            else
              txt= '目录号为'+params['mlh']+'；件号为'+params['ajh']+'已经存在，请重新输入目录号为或件号。'
            end
          when "29"
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']      	    
        	    User.find_by_sql("insert into archive(nd,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,mj,xh,cfwz) values('#{params['nd']}','#{params['mlh']}','#{ajh}','#{params['tm']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}') ")           
              archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_zlxx(bh,lb,bzdw,dh,ownerid) values('#{params['bh']}','#{params['lb']}','#{params['bzdw']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
                txt='success'
              end
            else
              txt= '目录号为'+params['mlh']+'；件号为'+params['ajh']+'已经存在，请重新输入目录号为或件号。'
            end
          when "30"
            user=User.find_by_sql("select * from archive,a_by_tszlhj where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_tszlhj.djh='#{params['djh']}'  and archive.id=a_by_tszlhj.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['djh']  	    
        	    User.find_by_sql("insert into archive(tm,bz,qzh,dh,dalb,dwdm,cfwz) values('#{params['mc']}','#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['cfwz']}') ")           
              archiveid=User.find_by_sql("select id from archive where dh='#{dh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_by_tszlhj(djh,kq,mc,fs,yfdm,cbrq,dj,dh,ownerid) values('#{params['djh']}','#{params['kq']}','#{params['mc']}','#{params['fs']}','#{params['yfdm']}','#{params['cbrq']}','#{params['dj']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
                txt='success'    
              end        
            else
              txt= '登记号为'+params['djh']+'；已经存在，请重新输入登记号。'
            end 
          when "31"
            user=User.find_by_sql("select * from archive,a_by_jcszhb where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_jcszhb.zt='#{params['zt']}'  and archive.id=a_by_jcszhb.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['zt']  	    
        	    User.find_by_sql("insert into archive(tm,qzh,dh,dalb,dwdm) values('#{params['zt']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}') ")           
              archiveid=User.find_by_sql("select id from archive where dh='#{dh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_by_jcszhb(zt,qy,tjsj,sm,dh,ownerid) values('#{params['zt']}','#{params['qy']}','#{params['tjsj']}','#{params['sm']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
                txt='success'
              end

            else
              txt= '专题为'+params['zt']+'；已经存在，请重新输入专题。'
            end
          when "32"
            user=User.find_by_sql("select * from archive,a_by_zzjgyg where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_zzjgyg.jgmc='#{params['jgmc']}'  and archive.id=a_by_zzjgyg.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['jgmc']  	    
        	    User.find_by_sql("insert into archive(bz,tm,qzh,dh,dalb,dwdm) values('#{params['bz']}','#{params['jgmc']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}') ")           
              archiveid=User.find_by_sql("select id from archive where dh='#{dh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_by_zzjgyg(jgmc,zzzc,qzny,dh,ownerid) values('#{params['jgmc']}','#{params['zzzc']}','#{params['qzny']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
                txt='success'
              end

            else
              txt= '机构名称为'+params['jgmc']+'；已经存在，请重新输入机构名称。'
            end
          when "33"
            user=User.find_by_sql("select * from archive,a_by_dsj where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_dsj.sy='#{params['sy']}'  and archive.id=a_by_dsj.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['sy']  	    
        	    User.find_by_sql("insert into archive(tm,qzh,dh,dalb,dwdm) values('#{params['sy']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}') ")           
              archiveid=User.find_by_sql("select id from archive where dh='#{dh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_by_dsj(dd,jlr,clly,fsrq,jlrq,sy,yg,rw,dh,ownerid) values('#{params['dd']}','#{params['jlr']}','#{params['clly']}','#{params['fsrq']}','#{params['jlrq']}','#{params['sy']}','#{params['yg']}','#{params['rw']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
                txt='success'
              end

            else
              txt= '事由为'+params['sy']+'；已经存在，请重新输入事由。'
            end
          when "34"
            user=User.find_by_sql("select * from archive,a_by_qzsm where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}'  and archive.id=a_by_qzsm.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']  	    
        	    User.find_by_sql("insert into archive(mlh,bz,tm,qzh,dh,dalb,dwdm) values('#{params['mlh']}','#{params['bz']}','#{params['qzgczjj']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}') ")           
              archiveid=User.find_by_sql("select id from archive where dh='#{dh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_by_qzsm(qzgczjj,sj,dh,ownerid) values('#{params['qzgczjj']}','#{params['sj']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
                txt='success'
              end

            else
              txt= '目录号为'+params['mlh']+'；已经存在，请重新输入目录号。'
            end
         when "24"
            params['jh']=params['jh'].to_i
            params['jh']=params['jh'].to_s
            if params['jh'].length>3
              jh=params['jh']
            else
              jh=sprintf("%04d", params['jh'])
            end
    	      user=User.find_by_sql("select * from archive,a_wsda where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_wsda.nd='#{params['nd']}' and a_wsda.bgqx='#{params['bgqx']}' and a_wsda.jgwth='#{params['jgwth']}' and a_wsda.jh='#{jh}' and archive.id=a_wsda.ownerid;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['nd']+"-" + params['bgqx']+"-" + params['jgwth']+"-" + params['jh']
        	    User.find_by_sql("insert into archive(ys,mlh,flh,tm,nd,bgqx,bz,qzh,dh,dalb,mj,dwdm) values('#{params['ys']}','#{params['mlh']}','#{params['flh']}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['mj']}','#{dw[0]['dwdm']}') ")
              archiveid=User.find_by_sql("select id from archive where dh='#{dh}';")
              size=archiveid.size
              if size==0
                txt='保存失败，未找到保存后盘案卷。'
              else
                User.find_by_sql("insert into a_wsda(ownerid,hh,jh, zwrq, wh, zrr,gb, wz,ztgg,ztlx,ztdw,dagdh,dzwdh,swh,ztsl,qwbs,ztc,zbbm,nd,jgwth,gbjh,xbbm,bgqx) values('#{archiveid[0]['id']}','#{params['hh']}','#{jh}','#{params['zwrq']}','#{params['wh']}','#{params['zrr']}','#{params['gb']}','#{params['wz']}','#{params['ztgg']}','#{params['ztlx']}','#{params['ztdw']}','#{params['dagdh']}','#{params['dzwdh']}','#{params['swh']}','#{params['ztsl']}','#{params['qwbs']}','#{params['ztc']}','#{params['zbbm']}','#{params['nd']}','#{params['jgwth']}','#{params['gbjh']}','#{params['xbbm']}','#{params['bgqx']}') ")                                      
                txt='success'   
              end         
            else
              txt= '年度为'+params['nd']+'；机构问题号为'+params['jgwth']+';保管期限为'+params['bgqx']+';件号为'+params['jh']+'已经存在，请重新输入年度、机构问题号、保管期限或件号。'
            end        
          else
            params['ajh']=params['ajh'].to_i
            params['ajh']=params['ajh'].to_s
            if params['ajh'].length>3
              ajh=params['ajh']
            else
              ajh=sprintf("%04d", params['ajh'])
            end
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']+"-" + params['ajh']
        	    User.find_by_sql("insert into archive(mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,xh,cfwz,dwdm) values('#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}','#{dw[0]['dwdm']}') ")
              txt='success'
            else
              txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
            end
          end
      	  render :text => txt
      	end

	#删除案卷
	def delete_archive
    case params['dalb']
    when "0"
      User.find_by_sql("delete from archive  where id = #{params['id']};")     
    when "2"
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_jhcw  where ownerid = #{params['id']};")
    when "3","5","6","7"
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_tddj  where ownerid = #{params['id']};")
    when "15"
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_sx  where ownerid = #{params['id']};")
    when "18"
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_tjml where ownerid = #{params['id']};")
    when "24"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_wsda  where ownerid = #{params['id']};")
    when "25"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_dzda  where ownerid = #{params['id']};")
    when "28"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_swda  where ownerid = #{params['id']};")
    when "26"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_jjda  where ownerid = #{params['id']};")
    when "29"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_zlxx  where ownerid = #{params['id']};")
    when "30"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_by_tszlhj  where ownerid = #{params['id']};")
    when "31"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_by_jcszhb  where ownerid = #{params['id']};")
    when "32"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_by_zzjgyg  where ownerid = #{params['id']};")
    when "33"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_by_dsj  where ownerid = #{params['id']};")
    when "34"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_by_qzsm  where ownerid = #{params['id']};")
    when "27"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_sbda  where ownerid = #{params['id']};")
    else
      User.find_by_sql("delete from archive  where id = #{params['id']};")
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
    where_str = "where qzh=#{params['qzh']} "

    fl = params['filter']
    where_str = where_str + " and zt= '#{fl}' " if !(fl.nil?) && fl !='全部'
    
    dalb = params['dalb']
    where_str = where_str + " and dalb = '#{dalb}' " if !(dalb.nil?) && dalb !=''

    user = User.find_by_sql("select * from q_qzxx #{where_str} order by mlh;")
    
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
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh = ss[0], ss[1], ss[2]
      User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dd.dh_prefix}','#{mlh}', 'ruby ./dady/bin/print_mulu_tj.rb #{dd.dh_prefix} ', '', '', '未开始');")
    end  
    render :text => 'Success'
  end
  
  #
  def print_selected_mljn
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh = ss[0], ss[1], ss[2]
      User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dd.dh_prefix}','#{mlh}', 'ruby ./dady/bin/print_wizard.rb #{dd.dh_prefix} #{dd.qajh} #{dd.zajh} 13', '', '', '未开始');")
    end  
    render :text => 'Success'
  end
  

  
  def import_selected_image
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh, dh_prefix = ss[0], ss[1], ss[2], dd.dh_prefix
      yxwz=dd.yxwz
      if !yxwz.nil? 
        User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dh_prefix}','#{mlh}', 'ruby ./dady/bin/import_image.rb #{dh_prefix} #{yxwz}', '', '', '未开始');")
      end  
    end  
    render :text => 'Success'
  end
  
  def export_selected_image
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh, dh_prefix = ss[0], ss[1], ss[2], dd.dh_prefix

      User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dh_prefix}','#{mlh}', 'ruby ./dady/bin/export_image.rb #{dh_prefix} 2 /share/export', '', '', '未开始');")
    end  
    render :text => 'Success'
  end
  
  def get_qzzt_store
    user = User.find_by_sql("select * from q_status order by mlh;")
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
  
  def delete_qzzt_task
    User.find_by_sql("delete from q_status where id in (#{params['id']});")
    render :text => 'Success'
  end

  def delete_all_qzzt_task
    User.find_by_sql("delete from q_status where zt = '完成';")
    render :text => 'Success'
  end

  def start_qzzt_task
    system 'ruby ./dady/bin/call_qz_task.rb &'
    render :text => 'Success'
  end
  
  def update_qzxx
    qzh = params['qzh']
    system("ruby ./dady/bin/update_qzxx.rb #{qzh} > ./log/update_qzxx &")
    render :text => 'Success'
  end
  
  def update_qzxx_selected
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh = ss[0], ss[1], ss[2]
      system("ruby ./dady/bin/update_timage_tj2.rb #{dd.dh_prefix}")
    end  
    render :text => 'Success'
  end
  
  def save_mulu_info
    id, mlh, lijr, jmcr, yxwz = params['id'], params['mlh'],params['lijr'], params['jmcr'],params['yxwz']
    User.find_by_sql("update q_qzxx set yxwz='#{yxwz}', lijr='#{lijr}', jmcr='#{jmcr}' where id=#{id} ;")
    render :text => 'Success'
  end
  
  def lookup(yxwz)
    line=''
    Find.find(yxwz) do |path|
      if path.include?'jpg'
        puts "processing #{path}"
        line = path.split('/')[0..-2].join('/')
        break
      end  
    end
    line
  end
  
  def import_selected_timage_aj
    user = User.find_by_sql("select * from timage_tj where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh.split('-')
      qzh, dalb, mlh, ajh, dh_prefix = ss[0], ss[1], ss[2], ss[3], dd.dh_prefix
      
      qzxx=User.find_by_sql("select * from q_qzxx where dh_prefix='#{dd.dh_prefix}';")[0]
      yxgs=User.find_by_sql("select id, yxmc, yxbh from timage where dh like '#{dh_prefix}-%' limit 1;")
      
      #if yxgs.size > 0
      #  yy=yxgs[0].yxmc.split('$') 
      #  yxmc = "#{yy[0]}\$#{yy[1][0..0]}\$#{ajh.rjust(4,'0')}"
      #  path = "#{qzxx.yxwz}/#{yxmc}".gsub('$','\$')
      #  User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dh_prefix}','#{mlh}', 'ruby ./dady/bin/import_image.rb #{dh_prefix} #{path} #{ajh}', '', '', '未开始');")
      #else
        yxgs = lookup(qzxx.yxwz)
        if yxgs.length > 0
          #yy=yxgs.split('$') 
          #yxmc = "#{yy[0]}\$#{yy[1][0..0]}\$#{ajh.rjust(4,'0')}"
          yxgs=
          yxmc = "#{yxgs[0..-5]}#{ajh.rjust(4,'0')}" 
          path = "#{yxmc}".gsub('$','\$')
          User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dh_prefix}','#{mlh}', 'ruby ./dady/bin/import_image.rb #{dh_prefix} #{path} #{ajh}', '', '', '未开始');")
        end  
      #end
    end  
    render :text => 'Success'
  end
  
  def print_selected_qzxx
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh = ss[0], ss[1], ss[2]
      User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dd.dh_prefix}','#{mlh}', 'ruby ./dady/bin/print_qzxx_tj.rb #{dd.dh_prefix} ', '', '', '未开始');")
    end  
    render :text => 'Success'
  end
  
  def save_archive_info
    ys, dh =  params['ajys'], params['dh']
    User.find_by_sql("update archive set ys=#{ys} where dh='#{dh}';") if !ys.nil?
    #User.find_by_sql("update timage_tj set ajys=#{ys} where dh='#{dh}';") if !ys.nil?
    dd = dh.split('_')
    dh_prefix=dd[0..2].join("-") 
    system("ruby ./dady/bin/update_timage_tj2.rb #{dh_prefix}")
    render :text => 'Success'
  end
  
  #获得角色树
  def get_js_tree
   node, style = params["node"], params['style']
   text="["
   jslb=["地市级","县级","乡镇级"]
   if node == "root"
     for k in 0..2       
       text=text+"{'text':'#{jslb[k]}','id' :'#{jslb[k]}-#{k}','leaf':false,'checked':false,'cls':'folder','children':["
       data = User.find_by_sql("select * from  d_js where jsdj='#{jslb[k]}' order by id;")
       size=data.size
       if size>0
         
         data.each do |dd|
           text=text+"{'text':'#{dd['jsmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
         end
               
       end
       text=text + "]}," 
     end
     text=text+"]"
     render :text => text
   end
  end
  
  #获得角色列表
  def  get_js_grid
    user = User.find_by_sql("select * from  d_js order by id;")

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
  
  #更新角色信息
  def update_js
   user=User.find_by_sql("select * from d_js where id <> #{params['id']} and jsmc='#{params['jsmc']}';")
   size = user.size
   if size == 0
     User.find_by_sql("update d_js set jsmc='#{params['jsmc']}',jsdj='#{params['jsdj']}' where id = #{params['id']};")
     txt='success'
   else
     txt= '角色名称已经存在，请重新输入角色名称。'
   end
   render :text => txt
  end

  #新增角色信息
  def insert_js
    user=User.find_by_sql("select * from d_js where  jsmc='#{params['jsmc']}';")
    size = user.size
    if size == 0
      User.find_by_sql("insert into d_js(jsmc,jsdj) values ('#{params['jsmc']}','#{params['jsdj']}');")
      txt='success'
    else
      txt= '角色名称已经存在，请重新输入角色名称。'
    end
    render :text => txt
  end

  #删除角色信息
  def delete_js
    user=User.find_by_sql("delete from d_js where  id=#{params['id']};")


    render :text => 'success'
  end

  #获得用户角色
  def get_user_js
    data = User.find_by_sql("select * from  u_js where userid = '#{params['id']}' order by id;")
    text=""
    data.each do |dd|
      if text==""
        text="#{dd['jsid']}" 
      else
        text=text+"|#{dd['jsid']}" 
      end
    end
    render :text => text      
  end

  #保存用户角色
  def insert_user_js
    User.find_by_sql("delete from u_js where userid = '#{params['userid']}';")
    ss = params['insert_qx'].split('$')
    for k in 0..ss.length-1
      qx=ss[k].split(';')       
      if qx[0]=="root1"  
      else
        js=qx[0].split('-')
        if js.length==1 
          User.find_by_sql("insert into u_js(userid, jsid) values ('#{params['userid']}', '#{qx[0]}');")
        end
      end
    end
    render :text => 'success'
  end
    
  #取登录的用户IDid
  def get_userid    
    render :text => User.current.id
  end
  
  def balance_mulu
    dh = params['dh']  #'6_0_1'
    User.find_by_sql("update archive set ys=timage_tj.smyx from timage_tj where archive.dh=timage_tj.dh and timage_tj.dh_prefix='#{dh}';")
    system("ruby ./dady/bin/update_timage_tj2.rb #{dh}")
    render :text => 'Success'
  end

  #获取用户是否有此权限
  def get_sort
    js_id=""
    user= User.find_by_sql("select jsid from u_js where userid=  '#{params["userid"]}' order by id;")
    user.each do |us|
      logger.debug us['jsid']
      if js_id==""
        js_id=us['jsid']
      else
        js_id=js_id + "," +us['jsid']
      end
    end
    user=User.find_by_sql("select * from qx_mlqx where user_id in (#{js_id}) and qxlb=4 and qxid='#{params["qxid"]}';")
    size = user.size
    if size == 0
      txt='false'
    else
      txt= 'success'
    end
    render :text => txt
  end
  
  #获得sys菜单树
  def get_sys_cd_tree
    node, style = params["node"], params['style']
    if node == "root"
      js_id=""
      user= User.find_by_sql("select jsid from u_js where userid=  '#{params["userid"]}' order by id;")
      user.each do |us|
        logger.debug us['jsid']
        if js_id==""
          js_id=us['jsid']
        else
          js_id=js_id + "," +us['jsid']
        end
      end
      data=User.find_by_sql("SELECT qx_mlqx.qxid, d_cd.cdmc FROM d_cd, qx_mlqx WHERE qx_mlqx.qxid = d_cd.id and d_cd.sfcd='1' and qx_mlqx.qxlb=4 and qx_mlqx.user_id in (#{js_id});")
      #data = User.find_by_sql("select * from  d_cd where sfcd='1' order by id;")
      text="["
      data.each do |dd|
        text=text+"{'text':'#{dd['cdmc']}','id' :'#{dd['qxid']}','checked':false,'leaf':true,'cls':'folder'},"
      end
      text=text + "]"
      render :text => text
    end
  end
  def save_image_db
    #system("ruby ./dady/bin/prepare_timage.rb #{params['dh']} &")
    system("ruby ./dady/bin/import_image_file.rb ./dady/#{params['filename']} #{params['dh']} #{params['dh']} ")    
    render :text =>"success"
  end
  #档案打印
  def print_da
    if (params['dylb'].nil?) || (params['qzh'].nil?) || (params['dalb'].nil?)
      txt="请选择打印类别、单位名称、档案类别。"
    else
      if (params['qajh']=="") || (params['zajh']=="")        
        txt="起止案卷号不能为空。请输入。"
      else
        if !(params['qajh'].to_i.to_s==params['qajh']) || !(params['zajh'].to_i.to_s==params['zajh'])  
          txt="起止案卷号必须是数字。请输入。"
        else
          if !(params['dalb']=='24') && (params['mlh']=='')
            txt="目录号不能为空。请输入。"
          else
            if params['zajh'].length==4
              params['zajh']=params['zajh']
            else
              params['zajh']=sprintf("%04d", params['zajh'])
            end
            if params['qajh'].length==4
              params['qajh']=params['qajh']
            else
              params['qajh']=sprintf("%04d", params['qajh'])
            end
            strwhere=" where mlh='#{params['mlh']}' and qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and ajh>='#{params['qajh']}' and ajh<='#{params['zajh']}'"
            if params['nd']!=""
              strwhere =strwhere + " and nd='#{params['nd']}'"
            end
            if (params['bgqx'].nil?)
            else
              strwhere =strwhere + " and bgqx='#{params['bgqx']}'"
            end
            if params['dalb']=="24"
              strwhere="where archive.qzh = '#{params['qzh']}' and dalb ='#{params['dalb']}' and a_wsda.nd='#{params['nd']}' and a_wsda.jgwth='#{params['jgwth']}' and a_wsda.bgqx='#{params['bgqx']}' and a_wsda.jh>='#{params['qajh']}' and a_wsda.jh<='#{params['zajh']}'"
            end
            case params['dylb']
            when "案卷目录打印"
              txt=ajml_print(strwhere)
            when "卷内目录打印"
              
            when "案卷封面打印"
            end
          end
        end
      end
      
    end
    render :text =>txt
  end
  def ajml_print(strwhere)
    case (params['dalb']) 
 		when "0"
 			user = User.find_by_sql("select * from archive #{strwhere} order by ajh ;")

 		when "2"
 			user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid #{strwhere} order by ajh ;")

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
 			user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid #{strwhere}  order by djh ;")
     when "31"
 			user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid #{strwhere}  order by zt ;")
     when "32"
 			user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid #{strwhere}  order by jgmc ;")
     when "33"
 			user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid #{strwhere}   order by fsrq ;")
     when "34"
 			user = User.find_by_sql("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid where #{strwhere}   order by sj ;")

 		 when "24"
 		  #年度_机构问题号_保管期限
 		  
      
      
      puts strwhere
         
       user = User.find_by_sql("select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   order by nd,bgqx,jgwth,jh ;")
 		 else
 			 user = User.find_by_sql("select * from archive  #{strwhere} order by ajh ;")

   	end
    filenames=""
    intys=0
    intts=0
    intwidth=[]
    size = user.size;
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
          case (params['dalb'])
          when "2"
            intwidth<<537
            intwidth<<692
            intwidth<<871
            intwidth<<1020
            intwidth<<1964
            intwidth<<2190
            intwidth<<2331
            intwidth<<2445
            intwidth<<2652
            intwidth<<2853
            intwidth<<2993
            printfilename="ajml_cw.jpg"
            intheight= i*157+703
            puts intheight
            user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s

            convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"    -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"   -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{user[i+k*10]['jnzs'].center 4}'\" -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['fjzs'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{user[i+k*10]['pzqh'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight} '#{user[i+k*10]['pzzh'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[9]}, #{intheight} '#{user[i+k*10]['bgqx'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[10]}, #{intheight} '#{user[i+k*10]['bz'].center 4}'\""
            intheight1=0
            intheight1=intheight-45  
            qrq  =Time.mktime(user[i+k*10]['qrq']).strftime("%Y%m%d")
            zrq=Time.mktime(user[i+k*10]['zrq']).strftime("%Y%m%d")        
            convertstr =convertstr + " -pointsize 40  -draw \"text #{intwidth[4]}, #{intheight1} '#{qrq}'\" "
            intheight1=0
            intheight1=intheight+40
            convertstr =convertstr + " -pointsize 40  -draw \"text #{intwidth[4]}, #{intheight1} '#{zrq}'\" "
            intheight=intheight-50
            if !(user[i+k*10]['tm'].nil?)
              tm=split_string(user[i+k*10]['tm'],8)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
          when "3"
            intwidth<<335
            intwidth<<528
            intwidth<<718
            intwidth<<882
            intwidth<<1308
            intwidth<<1881
            intwidth<<2415
            intwidth<<2580
            intwidth<<2752
            intwidth<<2882
            intwidth<<3064
            printfilename="ajml_tddj.jpg"
            intheight= i*160+684
            puts intheight
            user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s

            convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"    -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"   -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['nd']}'\" -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{user[i+k*10]['ys'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight} '#{user[i+k*10]['bgqx'].center 4}'\""
            intheight=intheight-60
            if !(user[i+k*10]['djh'].nil?)
              tm=split_string(user[i+k*10]['djh'],8)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
            puts tm
            if !(user[i+k*10]['qlrmc'].nil?)
              tm=split_string(user[i+k*10]['qlrmc'],11)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
            if !(user[i+k*10]['tdzl'].nil?)
              puts tm
              tm=split_string(user[i+k*10]['tdzl'],10)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
           puts tm
           if !(user[i+k*10]['tdzh'].nil?)
             tm=split_string(user[i+k*10]['tdzh'],6)
             strtm=tm.split("\n")
             intheight1=0
             for j in 0..strtm.length-1
               intheight1=intheight+ j*50
               convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight1} '#{strtm[j]}'\" "
             end
            end
            puts tm
          else
            intwidth<<428
            intwidth<<604
            intwidth<<772
            intwidth<<928
            intwidth<<2337
            intwidth<<2497
            intwidth<<2627
            printfilename="ajml.jpg"
            intheight= i*173+564
            puts intheight
            user[i+k*10]['ajh']=user[i+k*10]['ajh'].to_i.to_s

            convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['mlh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['flh'].center 5}'\"    -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\"   -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{user[i+k*10]['nd']}'\" -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{user[i+k*10]['ys'].center 4}'\"  -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['bgqx'].center 4}'\""
            intheight=intheight-40
            if !(user[i+k*10]['tm'].nil?)
              tm=split_string(user[i+k*10]['tm'],27)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
          end
          
        end
        strfilename="./dady/ajml" + k.to_s + ".jpg"
        puts strfilename
        puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
        system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")
        if filenames==""
          filenames="ajml" + k.to_s + ".jpg"
        else
          filenames=filenames + "," + "ajml" + k.to_s + ".jpg"
        end
      end
      txt="success:" + filenames
    else            
      txt = "无此条件的数据，请重新输入条件。"
    end
    return txt
  end
  def split_string(text, length=16)
    char_array = text.unpack("U*")
    intl=0
    t1=""
    for k in 0..char_array.length-1
      if intl>=length*2-3
        t1=t1 + char_array[k..k].pack("U*") +"\n"
        intl=0
      else
        t1=t1+ char_array[k..k].pack("U*")
        if char_array[k]<255
          intl=intl+1
        else
          intl=intl+2
        end
      end
    end
    return t1    
  end
  #更新卷内目录
  def update_document

    User.find_by_sql("update document set tm='#{params['tm']}', sxh=#{params['sxh']}, yh='#{params['yh']}', wh='#{params['wh']}', zrz='#{params['zrz']}', bz='#{params['bz']}', rq='#{params['rq']}', dh='#{params['dh']}' where id = #{params['id']};")

    render :text => 'Success'
  end



  #新增卷内目录
  def insert_document
    User.find_by_sql("insert into document(tm,sxh,yh,wh,zrz,bz,rq,dh,ownerid) values('#{params['tm']}',#{params['sxh']},'#{params['yh']}','#{params['wh']}','#{params['zrz']}','#{params['bz']}','#{params['rq']}','#{params['dh']}',#{params['ownerid']}) ")
    render :text => 'Success'
  end

  	#删除卷内目录
  def delete_document
    User.find_by_sql("delete from document  where id = #{params['id']};")
    render :text => 'Success'
  end

  #add by liu 05/25 #输档文件
  #ck_image.rb
  def upload_sdwj
    dj = params['dj']
    system "mkdir -p ./dady/tmp1/#{dj}/"  if !File.exists?("./dady/tmp1/#{dj}/")      
    params.each do |k,v|
      logger.debug("K: #{k} ,V: #{v}")

      if k.include?("sdwj")
        logger.debug("#{v.original_filename}")
        if v.original_filename.include?'.txt'
          ff = File.new("./dady/tmp1/#{dj}/#{v.original_filename}","w+")
          ff.write(v.tempfile.read)
          ff.close
        elsif v.original_filename.include?'.zip'
          ff = File.new("./dady/tmp1/#{v.original_filename}","w+")
          ff.write(v.tempfile.read)
          ff.close
          system("unzip -oj ./dady/tmp1/#{v.original_filename} -d ./dady/tmp1/#{dj}/")
          system("rm ./dady/tmp1/#{v.original_filename}")
        end
        
        system ("ls ./dady/tmp1/#{dj}/ | grep txt > sdfiles")

        User.find_by_sql("delete from q_sdwj where dh='#{dj}';")
        File.open('sdfiles').each_line do |line|
          mlh = /(\d+)(.*)/.match(line)[1]
          if line.include?'aj'
            User.find_by_sql("insert into q_sdwj (wjma, dh, mlh) values ('#{line.chomp!}','#{dj}', #{mlh});") 
            jrfile = line.gsub('aj','jr').chomp
            if File.exists?("./dady/tmp1/#{dj}/#{jrfile}")
              User.find_by_sql("update q_sdwj set wjmb='#{jrfile}' where mlh=#{mlh} and dh='#{dj}';")
            end
          end  
        end
             
        break
      end
    end
    render :text => "{success:true}"
  end

  def check_qzh
    qzh = params['qzh']
    user = User.find_by_sql("select * from d_dwdm where id=#{qzh};")
    render :text => user.to_json
  end

  def add_qzh2
    user = User.find_by_sql("select count (*) from d_dwdm where id = #{params['qzh']};")[0]
    if user.count.to_i == 0
      User.find_by_sql("insert into d_dwdm(id, dwdm, dwjc, qzdj) values (#{params['qzh']}, '#{params['dwdm']}', '#{params['dwjc']}', '#{params['qzdj']}');")
      render :text => "Success"
    else
      User.find_by_sql("update d_dwdm set dwdm='#{params['dwdm']}', dwjc='#{params['dwjc']}', qzdj='#{params['qzdj']}' where id =  #{params['qzh']};")
      render :text => "Success"
    end
  end
  
  def set_gxml
    yxwz, gxwz, qzh = params['yxwz'], params['gxwz'], params['qzh']
    password = '512940q'
    
    if !File.exists?(gxwz)
      system"mkdir -p #{gxwz}"
    end
    system "df | grep #{gxwz} |wc|  awk '{print $1}' > gggg"
    system "umount #{gxwz}" if File.open('gggg').read.chomp.to_i > 0
    system "mount -t cifs -o username=Administrator,password=#{password},iocharset=utf8 #{yxwz} #{gxwz}"
    system "rm gggg"
    
    system "ls #{gxwz} > gxwz"
    File.open('gxwz').each_line do |line|
      ss = line.chomp!
      puts "#{gxwz}/#{ss}"
      User.find_by_sql("update q_qzxx set yxwz='#{gxwz}/#{ss}' where mlh='#{ss}' and qzh='#{qzh}';")
    end     
    render :text => 'success'
  end
  
  def delete_sdwj
    params['id'].split(",").each do |dd|
      user = User.find_by_sql("select * from q_sdwj where id=#{dd};")
      system "rm -rf ./dady/tmp1/#{user[0].dh}/#{user[0].wjma};"
      system "rm -rf ./dady/tmp1/#{user[0].dh}/#{user[0].wjmb};"
    end
    User.find_by_sql("delete from q_sdwj where id in (#{params['id']});")  
    render :text => 'Success'
  end  
  
  def get_sdwj_store
    user = User.find_by_sql("select * from q_sdwj order by mlh;")
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
  
  def import_selected_aj
    user = User.find_by_sql("select q_sdwj.id, d_dwdm.id as qzh, mlh, wjma, dh,dwdm, dwjc from q_sdwj inner join d_dwdm on q_sdwj.dh = d_dwdm.qzdj where  q_sdwj.id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dd.dh} #{dd.mlh}','#{dd.mlh}', 'ruby ./dady/bin/upload_mulu.rb  #{dd.wjma} #{dd.dwdm} #{dd.qzh} #{dd.dh} ', '', '', '未开始');")
    end  
    render :text => 'Success'
  end
  
  def import_selected_aj2
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh = ss[0], ss[1], ss[2]

      if !user[0].json.nil?
        json=dd.json
        User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dd.dh_prefix}','#{mlh}', 'ruby ./dady/bin/upload_mulu.rb  #{json} 泰州市国土资源局 #{qzh} tz ', '', '', '未开始');")
      else 
        render :text => 'JSON is Empty'
      end    
    end  
    render :text => 'Success'
  end
  
  def get_yxwz_store
    user = User.find_by_sql("select id, yxwz, dh_prefix as dh, mlh from q_qzxx order by mlh;")
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
  
  def delete_yxwz
    #user = User.find_by_sql("select distinct yxwz from q_qzxx where id in (#{params['id']});")
    User.find_by_sql("update q_qzxx set yxwz='' where id in (#{params['id']});")  
    render :text => 'Success'
  end
  
  
  def import_selected_image
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh, dh_prefix = ss[0], ss[1], ss[2], dd.dh_prefix
      yxwz=dd.yxwz
      if !yxwz.nil? 
        User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dh_prefix}','#{mlh}', 'ruby ./dady/bin/import_image.rb #{dh_prefix} #{yxwz}', '', '', '未开始');")
      end  
    end  
    render :text => 'Success'
  end
  
end
