# encoding: utf-8

require 'socket'
require 'find'
#require "fastimage"
require 'timeout'
require 'iconv'
#require 'pdf/writer'
#require 'serialport'
#require "prawn"
class DesktopController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!, :except => [:upload_images, :add_new_wsda]
  before_filter :set_current_user

  def index
  end
  
  def search
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
        user = User.find_by_sql("select * from document where ownerid = #{params['query']} order by sxh;")
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
    #User.find_by_sql("BEGIN;")
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
    ydh=params['dh']
    mlh=get_da_mlh(params['qzh'],params['dalb'],params['mlh'])
    case params['dalb']
    when "0"
      ydh=params['dh']
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
      end

    when "2"
      ydh=params['dh']
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zrq='#{params['zrq']}', qrq='#{params['qrq']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_jhcw where  ownerid=#{params['id']};")
                
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_jhcw(jnzs,fjzs,ownerid,pzqh,pzzh,dh) values('#{params['jnzs']}','#{params['fjzs']}','#{archiveid[0]['id']}','#{params['pzqh']}','#{params['pzzh']}','#{dh}') ")                                  
        else
          User.find_by_sql("update a_jhcw set jnzs='#{params['jnzs']}', fjzs='#{params['fjzs']}', pzqh='#{params['pzqh']}', pzzh='#{params['pzzh']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
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

        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['djh']}#{params['qlrmc']}#{params['tdzl']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")


        archiveid=User.find_by_sql("select id from a_tddj where  ownerid=#{params['id']};")
        puts "insert into a_tddj(djh,qlrmc,ownerid,tdzl,tdzh,dh,qsxz,tfh,ydjh) values('#{params['djh']}','#{params['qlrmc']}','#{params['id']}','#{params['tdzl']}','#{params['tdzh']}','#{dh}','#{params['qsxz']}','#{params['tfh']}','#{params['ydjh']}') "
        size=archiveid.size
        if size.to_i==0
          User.find_by_sql("insert into a_tddj(djh,qlrmc,ownerid,tdzl,tdzh,dh,qsxz,tfh,ydjh) values('#{params['djh']}','#{params['qlrmc']}','#{params['id']}','#{params['tdzl']}','#{params['tdzh']}','#{dh}','#{params['qsxz']}','#{params['tfh']}','#{params['ydjh']}') ")                        
        else
          User.find_by_sql("update a_tddj set ydjh='#{params['ydjh']}',tfh='#{params['tfh']}',djh='#{params['djh']}', qlrmc='#{params['qlrmc']}', tdzl='#{params['tdzl']}', tdzh='#{params['tdzh']}', qsxz='#{params['qsxz']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_sx where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_sx(zl,ownerid) values('#{params['zl']}','#{params['id']}') ")                                  
        else
          User.find_by_sql("update a_sx set zl='#{params['zl']}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_tjml where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_tjml(tfh,tgh,ownerid) values('#{params['tfh']}','#{params['tgh']}','#{params['id']}') ")                                  
        else
          User.find_by_sql("update a_tjml set tfh='#{params['tfh']}',tgh='#{params['tgh']}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_dzda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_dzda(tjr,rjhj,czxt,sl,bfs,ztbhdwjgs,yyrjpt,tjdw,wjzt,dzwjm,ztbh,xcbm,xcrq,jsr,jsdw,yjhj,dh,ownerid) values('#{params['tjr']}','#{params['rjhj']}','#{params['czxt']}','#{params['sl']}','#{params['bfs']}','#{params['ztbhdwjgs']}','#{params['yyrjpt']}','#{params['tjdw']}','#{params['wjzt']}','#{params['dzwjm']}','#{params['ztbh']}','#{params['xcbm']}','#{params['xcrq']}','#{params['jsr']}','#{params['jsdw']}','#{params['yjhj']}','#{dh}','#{archiveid[0]['id']}') ")                        
        else                
          User.find_by_sql("update a_dzda set tjr='#{params['tjr']}', rjhj='#{params['rjhj']}', czxt='#{params['czxt']}', sl='#{params['sl']}', dh='#{dh}',bfs='#{params['bfs']}',ztbhdwjgs='#{params['ztbhdwjgs']}', yyrjpt='#{params['yyrjpt']}', tjdw='#{params['tjdw']}', wjzt='#{params['wjzt']}', dzwjm='#{params['dzwjm']}', ztbh='#{params['ztbh']}', xcbm='#{params['xcbm']}',xcrq='#{params['xcrq']}', jsr='#{params['jsr']}', jsdw='#{params['jsdw']}', yjhj='#{params['yjhj']}' where ownerid = #{params['id']};")
        end
        
       if ydh!=dh
         User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
         User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['zcmc']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_sbda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_sbda(zcmc,gzsj,dw,sl,cfdd,sybgdw,sybgr,zcbh,dj,je,dh,ownerid) values('#{params['zcmc']}','#{params['gzsj']}','#{params['dw']}','#{params['sl']}','#{params['cfdd']}','#{params['sybgdw']}','#{params['sybgr']}','#{params['zcbh']}','#{params['dj']}','#{params['je']}','#{dh}','#{archiveid[0]['id']}') ")                                         
        else                
          User.find_by_sql("update a_sbda set zcmc='#{params['zcmc']}', gzsj='#{params['gzsj']}', dw='#{params['dw']}', sl='#{params['sl']}', dh='#{dh}',cfdd='#{params['cfdd']}',sybgdw='#{params['sybgdw']}', sybgr='#{params['sybgr']}', zcbh='#{params['zcbh']}', dj='#{params['dj']}', je='#{params['je']}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set nd='#{params['nd']}',js='#{params['js']}',zny='#{params['zny']}',qny='#{params['qny']}',cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}',mlh='#{params['mlh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['xmmc']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_jjda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_jjda(xmmc,jsdw,dh,jsnd,ownerid) values('#{params['xmmc']}','#{params['jsdw']}','#{dh}','#{params['nd']}','#{archiveid[0]['id']}') ")                                         
        else                
          User.find_by_sql("update a_jjda set xmmc='#{params['xmmc']}', jsdw='#{params['jsdw']}', jsnd='#{params['jsnd']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}',mlh='#{params['mlh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['mc']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_swda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_swda(bh,lb,hjz,sjsj,sjdw,mc,ztxs,dh,ownerid) values('#{params['bh']}','#{params['lb']}','#{params['hjz']}','#{params['sjsj']}','#{params['sjdw']}','#{params['mc']}','#{params['ztxs']}','#{dh}','#{params['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_swda set hjz='#{params['hjz']}',bh='#{params['bh']}', lb='#{params['lb']}', sjsj='#{params['sjsj']}', sjdw='#{params['sjdw']}', mc='#{params['mc']}', ztxs='#{params['ztxs']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
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
        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set nd='#{params['nd']}',cfwz='#{params['cfwz']}',xh='#{params['xh']}',mj='#{params['mj']}',flh='#{params['flh']}',mlh='#{params['mlh']}', bgqx='#{params['bgqx']}' , bz='#{params['bz']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', ajh='#{ajh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_zlxx where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_zlxx(bh,lb,bzdw,dh,ownerid) values('#{params['bh']}','#{params['lb']}','#{params['bzdw']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_zlxx set bh='#{params['bh']}', lb='#{params['lb']}', bzdw='#{params['bzdw']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；件号为'+params['ajh']+'已经存在，请重新输入目录号为或件号。'
      end
    when "30"                                        
      user=User.find_by_sql("select * from archive,a_by_tszlhj where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_tszlhj.djh='#{params['djh']}'  and archive.id=a_by_tszlhj.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "-" + params['dalb'] +"-" + params['djh']
        User.find_by_sql("update archive set cfwz='#{params['cfwz']}',  bz='#{params['bz']}', tm='#{params['mc']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_tszlhj where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_tszlhj(djh,kq,mc,fs,yfdw,cbrq,dj,dh,ownerid) values('#{params['djh']}','#{params['kq']}','#{params['mc']}','#{params['fs']}','#{params['yfdw']}','#{params['cbrq']}','#{params['dj']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_tszlhj set djh='#{params['djh']}', kq='#{params['kq']}', mc='#{params['mc']}', fs='#{params['fs']}', yfdm='#{params['yfdm']}', cbrq='#{params['cbrq']}', dj='#{params['dj']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '登记号为'+params['djh']+'；已经存在，请重新输入登记号。'
      end
    when "31"                                        
      user=User.find_by_sql("select * from archive,a_by_jcszhb where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_jcszhb.zt='#{params['zt']}'  and archive.id=a_by_jcszhb.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "-" + params['dalb'] +"-" + params['zt']
        User.find_by_sql("update archive set  tm='#{params['zt']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_jcszhb where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_jcszhb(zt,qy,tjsj,sm,dh,ownerid) values('#{params['zt']}','#{params['qy']}','#{params['tjsj']}','#{params['sm']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_jcszhb set zt='#{params['zt']}', qy='#{params['qy']}', tjsj='#{params['tjsj']}', sm='#{params['sm']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '专题为'+params['zt']+'；已经存在，请重新输入专题。'
      end      
    when "32"                                        
      user=User.find_by_sql("select * from archive,a_by_zzjgyg where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_zzjgyg.jgmc='#{params['jgmc']}'  and archive.id=a_by_zzjgyg.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "-" + params['dalb'] +"-" + params['jgmc']
        User.find_by_sql("update archive set  tm='#{params['jgmc']}',bz='#{params['bz']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_zzjgyg where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_zzjgyg(jgmc,zzzc,qzny,dh,ownerid) values('#{params['jgmc']}','#{params['zzzc']}','#{params['qzny']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_zzjgyg set jgmc='#{params['jgmc']}', zzzc='#{params['zzzc']}', qzny='#{params['qzny']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '机构名称为'+params['jgmc']+'；已经存在，请重新输入机构名称。'
      end      
    when "33"                                        
      user=User.find_by_sql("select * from archive,a_by_dsj where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_dsj.sy='#{params['sy']}'  and archive.id=a_by_dsj.ownerid and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "-" + params['dalb'] +"-" + params['sy']
        User.find_by_sql("update archive set  tm='#{params['sy']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_dsj where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_dsj(dd,jlr,clly,fsrq,jlrq,sy,yg,rw,dh,ownerid) values('#{params['dd']}','#{params['jlr']}','#{params['clly']}','#{params['fsrq']}','#{params['jlrq']}','#{params['sy']}','#{params['yg']}','#{params['rw']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_dsj set yg='#{params['yg']}', rw='#{params['rw']}',fsrq='#{params['fsrq']}', jlrq='#{params['jlrq']}', sy='#{params['sy']}',dd='#{params['dd']}', jlr='#{params['jlr']}', clly='#{params['clly']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '事由为'+params['jgmc']+'；已经存在，请重新输入事由。'
      end 
    when "34"                                        
      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}'   and archive.id <> #{params['id']};")
      size = user.size
      if size == 0
        dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']
        User.find_by_sql("update archive set  mlh='#{params['mlh']}',tm='#{params['qzgcgjj']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_by_qzsm where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_by_qzsm(qzgczjj,sj,dh,ownerid) values('#{params['qzgczjj']}','#{params['sj']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
        else                
          User.find_by_sql("update a_by_qzsm set qzgczjj='#{params['qzgczjj']}', sj='#{params['sj']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；已经存在，请重新输入目录号。'
      end  
      
    when "35"
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

        dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['kyqr']};#{params['ksmc']};#{params['kswz']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")


        archiveid=User.find_by_sql("select id from a_kyq where  ownerid=#{params['id']};")

        size=archiveid.size
        if size.to_i==0
          User.find_by_sql("insert into a_kyq( xxkz,  yxkz,  kyqr,  ksmc,  ksbh,  ksgm,  xzqdm,  kz,  djlx,  kswz,  kqfw,  mj ,  cl,  sjncl,  clgm,  yxqq,  yxqz,  yxqx,  fzjg,  mjdw,  cldw,  scgm,  scldw,  jjlx,dh,ownerid) values('#{params['xxkz']}','#{params['yxkz']}','#{params['kyqr']}','#{params['ksmc']}','#{params['ksbh']}','#{params['ksgm']}','#{params['xzqdm']}','#{params['kz']}','#{params['djlx']}','#{params['kswz']}','#{params['kqfw']}','#{params['ksmj']}','#{params['cl']}','#{params['sjncl']}','#{params['clgm']}','#{params['yxqq']}','#{params['yxqz']}','#{params['yxqx']}','#{params['fzjg']}','#{params['mjdw']}','#{params['cldw']}','#{params['scgm']}','#{params['scldw']}','#{params['jjlx']}','#{dh}','#{archiveid[0]['id']}') ")                         
        else
          User.find_by_sql("update a_kyq set xxkz='#{params['xxkz']}',yxkz='#{params['yxkz']}',kyqr='#{params['kyqr']}', ksmc='#{params['ksmc']}', ksgm='#{params['ksgm']}', ksbh='#{params['ksbh']}', xzqdm='#{params['xzqdm']}',kz='#{params['kz']}',djlx='#{params['djlx']}',kswz='#{params['kswz']}', kqfw='#{params['kqfw']}', mj='#{params['ksmj']}', cl='#{params['cl']}', sjncl='#{params['sjncl']}',clgm='#{params['clgm']}',yxqq='#{params['yxqq']}',yxqz='#{params['yxqz']}',yxqx='#{params['yxqx']}', fzjg='#{params['fzjg']}', mjdw='#{params['mjdw']}', cldw='#{params['cldw']}', scgm='#{params['scgm']}', scldw='#{params['scldw']}', jjlx='#{params['jjlx']}', dh='#{dh}' where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
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
        mlh=get_doc_mlh(params['qzh'],params['nd'],params['bgqx'],params['jgwth'])
        dh=params['qzh']+ "-" + params['dalb'] + "-" + mlh.to_s + "-" + params['jh']
        User.find_by_sql("update archive set ys='#{params['ys']}', nd='#{params['nd']}', bgqx='#{params['bgqx']}', mj='#{params['mj']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', mlh='#{params['mlh']}', dh='#{dh}' where id = #{params['id']};")
        archiveid=User.find_by_sql("select id from a_wsda where  ownerid=#{params['id']};")
        size=archiveid.size
        if size==0
          User.find_by_sql("insert into a_wsda(ownerid,hh,jh, zwrq, wh, zrr,gb, wz,ztgg,ztlx,ztdw,dagdh,dzwdh,swh,ztsl,qwbs,ztc,zbbm,nd,jgwth,gbjh,xbbm,bgqx) values('#{params['id']}','#{params['hh']}','#{jh}','#{params['zwrq']}','#{params['wh']}','#{params['zrr']}','#{params['gb']}','#{params['wz']}','#{params['ztgg']}','#{params['ztlx']}','#{params['ztdw']}','#{params['dagdh']}','#{params['dzwdh']}','#{params['swh']}','#{params['ztsl']}','#{params['qwbs']}','#{params['ztc']}','#{params['zbbm']}','#{params['nd']}','#{params['jgwth']}','#{params['gbjh']}','#{params['xbbm']}','#{params['bgqx']}') ")                                      
        else
                
          User.find_by_sql("update a_wsda set zwrq='#{params['zwrq']}',hh='#{params['hh']}', jh='#{jh}', dzwdh='#{params['dzwdh']}', wh='#{params['wh']}', zrr='#{params['zrr']}', dh='#{dh}',gb='#{params['gb']}', wz='#{params['wz']}', ztgg='#{params['ztgg']}', ztlx='#{params['ztlx']}', ztdw='#{params['ztdw']}', dagdh='#{params['dagdh']}', swh='#{params['swh']}', ztsl='#{params['ztsl']}', qwbs='#{params['qwbs']}', ztc='#{params['ztc']}', zbbm='#{params['zbbm']}', nd='#{params['nd']}', jgwth='#{params['jgwth']}', gbjh='#{params['gbjh']}', xbbm='#{params['xbbm']}', bgqx='#{params['bgqx']}'  where ownerid = #{params['id']};")
        end
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '年度为'+params['nd']+'；机构问题号为'+params['jgwth']+';保管期限为'+params['bgqx']+';件号为'+params['jh']+'已经存在，请重新输入年度、机构问题号、保管期限或件号。'
      end    
    else
      ydh=params['dh']  
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
        dh=params['qzh']+ "-" + params['dalb'] + "-" + mlh.to_s+ "-" + params['ajh']
        User.find_by_sql("update archive set mlh='#{params['mlh']}',nd='#{params['nd']}', bgqx='#{params['bgqx']}', xh='#{params['xh']}', cfwz='#{params['cfwz']}', bz='#{params['bz']}', flh='#{params['flh']}', tm='#{params['tm']}', ys=#{params['ys']}, dh='#{dh}', zny='#{params['zny']}', qny='#{params['qny']}', js=#{params['js']}, ajh='#{ajh}' where id = #{params['id']};")
        
        if ydh!=dh
          User.find_by_sql("update document set dh='#{dh}' where ownerid = #{params['id']};")
          User.find_by_sql("update timage set dh='#{dh}' where dh = '#{ydh}';")
        end
        txt='success'
      else
        txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
      end
    end
    if txt=='success'
      txt=txt + ":" + dh 
    end
    #User.find_by_sql("COMMIT;")
    render :text => txt
  end
    
 # def split_string(text, length=16)
 #   char_array = text.unpack("U*")
 #   if char_array.size > length
 #     t1 = char_array[0..length-1].pack("U*")
 #     t2 = char_array[length..-1].pack("U*")
 #     return "#{t1}\n#{split_string(t2, length)}"
 #   else
 #     return text
 #   end
 # end
  
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
      system"rm -rf ./dady/img_tmp/#{params['dh']}/"
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
      if (convert_filename.upcase.include?'JPG') || (convert_filename.upcase.include?'TIF') || (convert_filename.upcase.include?'TIFF') || (convert_filename.upcase.include?'JPEG') 
        imagesize=FastImage.size convert_filename
      
        if imagesize[0].to_i > imagesize[1].to_i
          txt = "/assets/#{convert_filename}?2"
        else
          txt = "/assets/#{convert_filename}?1"
        end
      else
        txt = "/assets/#{convert_filename}?2"
      end
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
    txt=""
    if (params['query'].nil?)
      txt = "{results:0,rows:[]}"
    else
      if (params['userid'].nil?)
        user = User.find_by_sql("select count(*) from archive where tm like '%#{params['query']}%' and dh like '#{params['dh']}-%';")[0]
        size = user.count.to_i;
        if size > 0
          txt = "{results:#{size},rows:["
          user = User.find_by_sql("select * from archive where tm like '%#{params['query']}%'  and dh like '#{params['dh']}-%' order by cast (qzh as integer),mlh,ajh limit #{params['limit']};")
          for k in 0..user.size-1
            txt = txt + user[k].to_json + ','
          end
          txt = txt[0..-2] + "]}"
        else
          txt = "{results:0,rows:[]}"
        end
      else
        sqlwhere=get_user_sort(params['userid'])
        if sqlwhere==""
          txt = "{results:0,rows:[]}"
        else
          user = User.find_by_sql("select * from archive where tm like '%#{params['query']}%' and #{sqlwhere}    order by cast (qzh as integer),mlh,ajh limit #{params['limit']};")
        end
        size=user.size
        if size>0
          txt = "{results:#{size},rows:["
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
    sqlwhere=get_user_sort(params['userid'])
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
    
    if !(params['dalb'].nil?)

      if (cx_tj!='')
        cx_tj=cx_tj + " and archive.dalb = '#{params['dalb']}'"
      else
        cx_tj=" archive.dalb = '#{params['dalb']}'"
      end
    end
        
    if !(params['ajtm'].nil?)
      if (cx_tj!='')
        cx_tj=cx_tj + " and archive.tm like '%#{params['ajtm']}%'"
      else
        cx_tj="archive.tm like '%#{params['ajtm']}%'"
      end
    end
    
    if !(params['nd'].nil?)
      if (cx_tj!='')
        cx_tj=cx_tj + " and archive.nd like '%#{params['nd']}%'"
      else
        cx_tj="archive.nd like '%#{params['nd']}%'"
      end
    end
    

    
    jn_cx_tj=''
    if !(params['wh'].nil?)
      params['wh'] = params['wh'].gsub(' ','%')
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
        dj_cx_tj=" tdzl like '%#{params['tdzl']}%'"
      end
    end
    
    if !(params['tdzh'].nil?)
      if (dj_cx_tj!='')
        dj_cx_tj=dj_cx_tj + " and tdzh like '%#{params['tdzh']}%'"
      else
        dj_cx_tj=" tdzh like '%#{params['tdzh']}%'"
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
          jy_select="select archive.* from document,archive,a_tddj WHERE a_tddj.ownerid = archive.id AND document.ownerid = archive.id and #{cx_tj} and #{jn_cx_tj} and #{dj_cx_tj} "
        else
          jy_select="select archive.* from document,archive WHERE document.ownerid = archive.id and #{cx_tj} and #{jn_cx_tj} "
        end
      else
        if (dj_cx_tj!='')
          jy_select="select archive.* from document,archive,a_tddj WHERE a_tddj.ownerid = archive.id AND document.ownerid = archive.id and #{jn_cx_tj} and #{dj_cx_tj} "
        else
          jy_select="select archive.* from document,archive WHERE document.ownerid = archive.id and #{jn_cx_tj} "
        end
      end
    else
      if (cx_tj!='')
        if (dj_cx_tj!='')
          jy_select ="select archive.* from archive,a_tddj where a_tddj.ownerid = archive.id AND #{cx_tj} and #{dj_cx_tj} "
        else
          jy_select ="select * from archive where #{cx_tj} "
        end
      else
        if (dj_cx_tj!='')
          jy_select ="select archive.* from archive,a_tddj where a_tddj.ownerid = archive.id and #{dj_cx_tj} "
        else
          jy_select =''
        end
        
      end
    end
    
    if (jy_select!='')
      rowcount= User.find_by_sql(" #{jy_select} and #{sqlwhere} ")
      user = User.find_by_sql(" #{jy_select} and #{sqlwhere} order by cast (qzh as integer), mlh,ajh limit #{params['limit']} offset #{params['start']} ")
      size = user.size;
      if size > 0
        txt = "{results:#{rowcount.size},rows:["
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
      #User.find_by_sql("BEGIN;")
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
      if params['jyzt']=='4'
        user=User.find_by_sql("insert into jylc(hdsj,jyr, jydw, jylx, zj, lymd, lyxg, jysj, fyys, zcys, jyqx, cdlr, bz, czrid, jyzt, jylist,jytj) values ('#{rq}','#{params['jyr']}', '#{params['jydw']}', '#{jylx}','#{params['zj']}','#{lymd}','#{params['lyxg']}','#{rq}','#{fyys}','#{zcys}','#{lyqx}','#{params['cdlr']}','#{params['bz']}','#{czrid}','#{params['jyzt']}','#{params['jy_aj_list']}','#{jytj}') RETURNING id;")      
      else
        user=User.find_by_sql("insert into jylc(jyr, jydw, jylx, zj, lymd, lyxg, jysj, fyys, zcys, jyqx, cdlr, bz, czrid, jyzt, jylist,jytj) values ('#{params['jyr']}', '#{params['jydw']}', '#{jylx}','#{params['zj']}','#{lymd}','#{params['lyxg']}','#{rq}','#{fyys}','#{zcys}','#{lyqx}','#{params['cdlr']}','#{params['bz']}','#{czrid}','#{params['jyzt']}','#{params['jy_aj_list']}','#{jytj}') RETURNING id;")      
      end
      maxid = user[0]['id']
      if !(params['jy_aj_list']=='')
        #user = User.find_by_sql("select max(id) as id from jylc;")
        ss = params['jy_aj_list'].split(',')
        for k in 0..ss.length-1
          if params['jyzt']=='4'
            User.find_by_sql("insert into jylist(hdsj,jyid, daid,iPhoneList) values ('#{rq}','#{user[0]["id"]}', '#{ss[k]}','0');")
          else
            User.find_by_sql("insert into jylist(jyid, daid,iPhoneList) values ('#{user[0]["id"]}', '#{ss[k]}','1');")
          end
        end
      end
      #User.find_by_sql("COMMIT;")
      render :text => "success"
    
  end
  
  def update_jylc
    #User.find_by_sql("BEGIN;")
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
      #user = User.find_by_sql("select (id) as id from jylc;")
      ss = params['jy_aj_list'].split(',')
      for k in 0..ss.length-1
        User.find_by_sql("insert into jylist(jyid, daid,iPhoneList) values ('#{params['id']}', '#{ss[k]}','1');")
      end
    end
    #User.find_by_sql("COMMIT;")
    render :text => 'success'
  end
  
  def delete_jylc
    user = User.find_by_sql("delete from jylc where id = #{params['id']};")
    render :text => 'success'
  end
  
  def qbhd_jylc
    #User.find_by_sql("BEGIN;")
    rq=Time.now.strftime("%Y-%m-%d")
    user = User.find_by_sql("update jylc set hdsj='#{rq}',jyzt='4' where id = #{params['id']};")
    user =User.find_by_sql("update jylist set hdsj ='#{rq}',iPhoneList=2 where jyid=#{params['id']};")
    #User.find_by_sql("COMMIT;")
    render :text => 'success'
  end
  
  def xjhd_jylc
    #User.find_by_sql("BEGIN;")
    rq=Time.now.strftime("%Y-%m-%d")
    ss = params['ids'].split(',')
    for k in 0..ss.length-1
      User.find_by_sql("update jylist set hdsj ='#{rq}',iPhoneList=2 where daid ='#{ss[k]}' and jyid=#{params['id']};")
    end
    user = User.find_by_sql("select * from jylist where jyid=#{params['id']} and hdsj IS NULL;")

    if user.size==0
      user = User.find_by_sql("update jylc set hdsj='#{rq}',jyzt='4' where id = #{params['id']};")
    end
    #User.find_by_sql("COMMIT;")
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
  
  
  def  get_dalb_print_grid
    dalbid=get_dalb_userid(params['userid'])
    user = User.find_by_sql("select * from d_dalb where id<100 and id in (#{dalbid}) order by id;")

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
     User.find_by_sql("update users set ssqz='#{params['ssqz']}', username='#{params['username']}', sfxsxyisj='#{params['sfxsxyisj']}' where id = #{params['id']};")
     txt='success'
   else
     txt= '用户名称或Email已经存在，请重新输入用户名称或Email。'
   end
   render :text => txt
  end
  
  #新增用户信息
  def insert_user
    #logger.debug  User。id
    user=User.find_by_sql("select * from users where   username='#{params['username']}';")
    size = user.size
    if size == 0
   
      user = User.new
      params['email']=Time.now.strftime("%Y%m%d%H%M%S") + "@infodragon.com"
      user.email=params['email']
      user.username=params['username']
      user.sfxsxyisj=params['sfxsxyisj']
      user.ssqz=params['ssqz']
      user.password_confirmation=params['encrypted_password']
   
      user.password = params['encrypted_password']
      user.save
   
      txt='success'
    else
      txt= '用户名称已经存在，请重新输入用户名称。'
    end
    render :text => txt
  end
  
  #重置用户信息
  def set_user_password
    #logger.debug  User。id
    user=User.find_by_sql("select * from users where id=#{params['userid']};")
    size = user.size
    if size == 1
   
      
      user[0].password_confirmation="123456"
   
      user[0].password = "123456"
      user[0].save
   
      txt='success'
    else
      txt= '此用户不存在，请重新选择用户。'
    end
    render :text => txt
  end
  
  
  def change_password
    if params['password_confirmation'] == params['password']
      User.current.password = params['password']
      User.current.password_confirmation=params['password']
      User.current.save
      render :text => 'Success'
    else
      render :text => 'Falied'
    end
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
    user = User.find_by_sql("SELECT  a.dwdm,a.dwjc,a.id,a.owner_id,a.dj,b.dwdm as ssss FROM  d_dwdm a  left join d_dwdm b on a.owner_id = b.id order by id;")
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
  
  def get_qz_byuserid_grid
    qzid=get_qz_userid(params['userid'])
    user = User.find_by_sql("sELECT * FROM d_dwdm where d_dwdm.id in (#{qzid}) order by id;")
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
    if params['ssss']==""
      params['ssss']=0
    end
    user=User.find_by_sql("select * from d_dwdm where id <> #{params['id']} and dwdm='#{params['dwdm']}';")
    size = user.size
    if size == 0
      User.find_by_sql("update d_dwdm set owner_id='#{params['ssss']}',dj='#{params['dj']}',dwdm='#{params['dwdm']}', dwjc='#{params['dwjc']}' where id = #{params['id']};")
      txt='success'
    else
      txt= '全宗名称已经存在，请重新输入全宗名称。'
    end
    render :text => txt
  end
  
  #新增全宗信息
  def insert_qz
    if params['ssss'].nil? || params['ssss']==""
      params['ssss']=0
    end
    user=User.find_by_sql("select * from d_dwdm where  dwdm='#{params['dwdm']}';")
    size = user.size
    if size == 0
      User.find_by_sql("insert into d_dwdm(dwdm, dwjc,owner_id,dj) values ('#{params['dwdm']}', '#{params['dwjc']}', '#{params['ssss']}', '#{params['dj']}');")
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
  
  #获取用户拥有的全宗号和档案类别
  def get_user_sort(userid)
    jsdj=""
    jsid=""
    ssqz=""
    user= User.find_by_sql("SELECT distinct d_js.jsdj FROM d_js, u_js WHERE u_js.jsid = d_js.id and userid=  '#{userid}' ;")
    user.each do |us|
      logger.debug us['jsdj']
      if jsdj==""
        jsdj="'" + us['jsdj'] + "'"
      else
        jsdj=jsdj + ",'" +us['jsdj']+ "'"
      end
    end
    user= User.find_by_sql("SELECT *  FROM  u_js WHERE  userid=  '#{userid}' ;")
    user.each do |us|            
      if jsid==""
        jsid=us['jsid']
      else
        jsid=jsid + "," +us['jsid']
      end
    end
    if jsdj!="" 
      data = User.find_by_sql("select * from users where id= #{params["userid"]};")
      if data[0]["sfxsxyisj"]=="是"
        if jsdj.include?"地市级"
          jsdj="'地市级','县级','乡镇级'"
        else
          if jsdj.include?"县级"
            jsdj="'县级','乡镇级'"
          else
            jsdj="'乡镇级'"
          end
        end
        dwdm= User.find_by_sql("select * from d_dwdm where (id= #{data[0]["ssqz"]} or owner_id=#{data[0]["ssqz"]}) and dj in (#{jsdj});")
        dwdm.each do |qz|
          if ssqz==""
            ssqz="'" + qz['id'].to_s + "'"
          else
            ssqz=ssqz + ",'" + qz['id'].to_s+ "'"
          end
          xjqz=User.find_by_sql("select * from d_dwdm where  owner_id=#{qz['id']};")
          xjqz.each do |xqz|
            if ssqz==""
              ssqz="'" + xqz['id'].to_s + "'"
            else
              ssqz=ssqz + ",'" + xqz['id'].to_s + "'"
            end
          end
        end        
      else
        ssqz="'" + data[0]["ssqz"].to_s + "'"
      end
    end
    data = User.find_by_sql("select distinct qxdm ,qxmc ,qxid,sx from qx_mlqx,d_dalb where user_id in (#{jsid}) and qxlb=0 and d_dalb.id=qxid  order by sx;")
    dalb=""
    data.each do |dd|
      if dalb==""
        dalb="'"+dd['qxid'].to_s+"'"
      else
        dalb=dalb+",'"+dd['qxid'].to_s+"'"
      end
    end
    txt=""
    if dalb!=""
      txt=" dalb in (#{dalb}) "
    end
    if ssqz!=""
      if txt==""
        txt=" qzh in (#{ssqz})"
      else
        txt=txt + " and qzh in (#{ssqz})"
      end
    end
    return txt
  end
  
  
  def get_dalb_userid(userid)
    jsid=""
    user= User.find_by_sql("SELECT *  FROM  u_js WHERE  userid=  '#{userid}' ;")
    user.each do |us|            
      if jsid==""
        jsid=us['jsid']
      else
        jsid=jsid + "," +us['jsid']
      end
    end
    data = User.find_by_sql("select distinct qxdm ,qxmc ,qxid,sx from qx_mlqx,d_dalb where user_id in (#{jsid}) and qxlb=0 and d_dalb.id=qxid  order by sx;")
    dalb=""
    data.each do |dd|
      if dalb==""
        dalb="'"+dd['qxid'].to_s+"'"
      else
        dalb=dalb+",'"+dd['qxid'].to_s+"'"
      end
    end
    return dalb
  end
  
  def get_qz_userid(userid)
    jsdj=""
    jsid=""
    ssqz=""
    user= User.find_by_sql("SELECT distinct d_js.jsdj FROM d_js, u_js WHERE u_js.jsid = d_js.id and userid=  '#{userid}' ;")
    user.each do |us|
      logger.debug us['jsdj']
      if jsdj==""
        jsdj="'" + us['jsdj'] + "'"
      else
        jsdj=jsdj + ",'" +us['jsdj']+ "'"
      end
    end
    user= User.find_by_sql("SELECT *  FROM  u_js WHERE  userid=  '#{userid}' ;")
    user.each do |us|            
      if jsid==""
        jsid=us['jsid']
      else
        jsid=jsid + "," +us['jsid']
      end
    end
    if jsdj!="" 
      data = User.find_by_sql("select * from users where id= #{params["userid"]};")
      if data[0]["sfxsxyisj"]=="是"
        if jsdj.include?"地市级"
          jsdj="'地市级','县级','乡镇级'"
        else
          if jsdj.include?"县级"
            jsdj="'县级','乡镇级'"
          else
            jsdj="'乡镇级'"
          end
        end
        dwdm= User.find_by_sql("select * from d_dwdm where (id= #{data[0]["ssqz"]} or owner_id=#{data[0]["ssqz"]}) and dj in (#{jsdj});")
        dwdm.each do |qz|
          if ssqz==""
            ssqz="'" + qz['id'].to_s + "'"
          else
            ssqz=ssqz + ",'" + qz['id'].to_s+ "'"
          end
          xjqz=User.find_by_sql("select * from d_dwdm where  owner_id=#{qz['id']};")
          xjqz.each do |xqz|
            if ssqz==""
              ssqz="'" + xqz['id'].to_s + "'"
            else
              ssqz=ssqz + ",'" + xqz['id'].to_s + "'"
            end
          end
        end        
      else
        ssqz=data[0]["ssqz"]
      end
    end
    return ssqz
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
            if pars[1].to_i==24              
              data = User.find_by_sql("select distinct a_wsda.nd,a_wsda.bgqx,a_wsda.jgwth from a_wsda,archive where a_wsda.ownerid=archive.id and archive.qzh='#{pars[0]}' order by a_wsda.nd,a_wsda.bgqx,a_wsda.jgwth;")
              data.each do |dd|
                txt << {:text => "#{dd['nd']}_#{dd['bgqx']}_#{dd['jgwth']}", :id => node+"_#{dd['nd']}_#{dd['bgqx']}_#{dd['jgwth']}", :leaf => true, :cls => "file"}
              end
            else         
              data = User.find_by_sql("select distinct mlh from archive    where qzh='#{pars[0]}' and dalb='#{pars[1]}' order by mlh;")
              data.each do |dd|
                txt << {:text => "目录 #{dd['mlh']}", :id => node+"_#{dd["mlh"]}", :leaf => true, :cls => "file"}
              end
            end
          else
            dwdj=User.find_by_sql("select * from  d_dwdm where id= #{pars[0]};")
            data = User.find_by_sql("select distinct qxdm ,qxmc ,qxid,sx from qx_mlqx,d_dalb where user_id in (#{jsid}) and qxlb=0 and d_dalb.id=qxid and d_dalb.ownerid='#{pars[1]}' order by qxid;")
            
            data.each do |dd|
              
                text=text+"{'text':'#{dd['qxmc']}','id':'#{pars[0]}_#{dd['qxdm']}','leaf':false,'cls':'folder'},"
              
            end
            text=text+"]"
          end
        else
          if pars[1].to_i==24
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
       txt=ss
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
        if ss[1]=='24'
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
          archive_count=User.find_by_sql("select count(*) from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}  ;")
          user = User.find_by_sql("select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   order by nd,bgqx,jgwth,jh limit #{params['limit']} offset #{params['start']};")
          size = user.size;
          if size>0
            txt = "{results:#{archive_count[0]['count']},rows:["
            for k in 0..user.size-1
                txt = txt + user[k].to_json + ','
            end
            txt = txt[0..-2] + "]}"
          else
            txt = "{results:0,rows:[]}"
          end
        else                
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
										user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxs from archive left join a_swda on archive.id=a_swda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh =  '#{ss[2]}'  order by ajh limit #{params['limit']} offset #{params['start']};")
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
                  when "35"
										user = User.find_by_sql("select archive.*,a_kyq.xxkz, a_kyq.yxkz, a_kyq.kyqr, a_kyq.ksmc, a_kyq.ksbh, a_kyq.ksgm, a_kyq.xzqdm, a_kyq.kz, a_kyq.djlx, a_kyq.kswz, a_kyq.kqfw, a_kyq.mj as ksmj, a_kyq.cl, a_kyq.sjncl, a_kyq.clgm, a_kyq.yxqq, a_kyq.yxqz, a_kyq.yxqx, a_kyq.fzjg, a_kyq.mjdw, a_kyq.cldw, a_kyq.scgm, a_kyq.scldw, a_kyq.jjlx from archive left join a_kyq on archive.id=a_kyq.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}'  order by mlh,ajh limit #{params['limit']} offset #{params['start']};")                  
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
									when "19"
									  user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}' order by ajh limit #{params['limit']} offset #{params['start']};")
									else
										user = User.find_by_sql("select * from archive where qzh = '#{ss[0]}' and dalb ='#{ss[1]}' and mlh = '#{ss[2]}' order by ajh limit #{params['limit']} offset #{params['start']};")
										
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
									user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh  from archive left join a_tddj on archive.id=a_tddj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
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
									user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxs from archive left join a_swda on archive.id=a_swda.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "29"
									user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")
                when "30"
									user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdm, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by djh limit #{params['limit']} offset #{params['start']};")
                when "31"
									user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by zt limit #{params['limit']} offset #{params['start']};")
                when "32"
									user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by jgmc limit #{params['limit']} offset #{params['start']};")
                when "33"
									user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by fsrq limit #{params['limit']} offset #{params['start']};")
                when "34"
									user = User.find_by_sql("select archive.*,a_by_qzsm.qzgczjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by sj limit #{params['limit']} offset #{params['start']};")
                when "35"
									user = User.find_by_sql("select archive.*,a_kyq.xxkz, a_kyq.yxkz, a_kyq.kyqr, a_kyq.ksmc, a_kyq.ksbh, a_kyq.ksgm, a_kyq.xzqdm, a_kyq.kz, a_kyq.djlx, a_kyq.kswz, a_kyq.kqfw, a_kyq.mj as ksmj, a_kyq.cl, a_kyq.sjncl, a_kyq.clgm, a_kyq.yxqq, a_kyq.yxqz, a_kyq.yxqx, a_kyq.fzjg, a_kyq.mjdw, a_kyq.cldw, a_kyq.scgm, a_kyq.scldw, a_kyq.jjlx from archive left join a_kyq on archive.id=a_kyq.ownerid where qzh = '#{ss[0]}' and dalb ='#{ss[1]}'   order by mlh,ajh limit #{params['limit']} offset #{params['start']};")                  

                
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

  def get_da_mlh(qzh,dalb,mlh)
    ajh= User.find_by_sql("select id from qzml_key where qzh='#{qzh}' and   dalb='#{dalb}' and mlm='#{mlh}';")
    size=ajh.size
    if size>0
      txt=ajh[0]['id']
    else
      insert=User.find_by_sql("insert into qzml_key(qzh,dalb,mlm) values('#{qzh}','#{dalb}','#{mlh}') RETURNING id")      
      txt=insert[0]['id']
    end
    return txt
  end
	#新增案卷目录
      	def insert_archive
      	  #User.find_by_sql("BEGIN;")
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
      	  mlh=get_da_mlh(params['qzh'],params['dalb'],params['mlh'])
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
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        	    archiveid=User.find_by_sql("insert into archive(mlm,mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,xh,cfwz,mj,dwdm) values('#{mlh}','#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}','#{params['mj']}','#{dw[0]['dwdm']}')  RETURNING id;")
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
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        	    archiveid=User.find_by_sql("insert into archive(mlm,mlh,flh,ajh,tm,nd,bgqx,qrq,zrq,ys,js,bz,qzh,dh,dalb,mj,dwdm) values('#{mlh}','#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qrq']}','#{params['zrq']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['mj']}','#{dw[0]['dwdm']}')  RETURNING id;")
              #archiveid=User.find_by_sql("select id from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")              
              User.find_by_sql("insert into a_jhcw(jnzs,fjzs,ownerid,pzqh,pzzh,dh) values('#{params['jnzs']}','#{params['fjzs']}','#{archiveid[0]['id']}','#{params['pzqh']}','#{params['pzzh']}','#{dh}') ")                        
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
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        	    archiveid=User.find_by_sql("insert into archive(mlm,mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,mj,xh,cfwz,dwdm) values('#{mlh}','#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['qlrmc']};#{params['djh']};#{params['tdzl']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}','#{dw[0]['dwdm']}')  RETURNING id;")              
              User.find_by_sql("insert into a_tddj(djh,qlrmc,ownerid,tdzl,tdzh,dh,qsxz,tfh,ydjh) values('#{params['djh']}','#{params['qlrmc']}','#{archiveid[0]['id']}','#{params['tdzl']}','#{params['tdzh']}','#{dh}','#{params['qsxz']}','#{params['ydjh']}','#{params['ydjh']}') ")  
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
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']      	    
        	    archiveid=User.find_by_sql("insert into archive(mlm,mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,xh,cfwz,mj,dwdm) values('#{mlh}','#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}','#{params['mj']}','#{dw[0]['dwdm']}')  RETURNING id;")                          
              User.find_by_sql("insert into a_sx(zl,ownerid) values('#{params['zl']}','#{archiveid[0]['id']}') ")                        
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
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']      	    
        	    archiveid=User.find_by_sql("insert into archive(mlm,mlh,ajh,tm,nd,bgqx,ys,bz,qzh,dh,dalb,dwdm) values('#{mlh}','#{params['mlh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}') RETURNING id;")                                       
              User.find_by_sql("insert into a_tjml(tfh,tgh,ownerid) values('#{params['tfh']}','#{params['tgh']}','#{archiveid[0]['id']}') ")                        
              txt='success'              
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
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']      	    
        	    archiveid=User.find_by_sql("insert into archive(mlm,flh,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,cfwz,xh) values('#{mlh}','#{params['flh']}','#{params['mlh']}','#{ajh}','#{params['tm']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['cfwz']}','#{params['xh']}')  RETURNING id;")           
              User.find_by_sql("insert into a_dzda(tjr,rjhj,czxt,sl,bfs,ztbhdwjgs,yyrjpt,tjdw,wjzt,dzwjm,ztbh,xcbm,xcrq,jsr,jsdw,yjhj,dh,ownerid) values('#{params['tjr']}','#{params['rjhj']}','#{params['czxt']}','#{params['sl']}','#{params['bfs']}','#{params['ztbhdwjgs']}','#{params['yyrjpt']}','#{params['tjdw']}','#{params['wjzt']}','#{params['dzwjm']}','#{params['ztbh']}','#{params['xcbm']}','#{params['xcrq']}','#{params['jsr']}','#{params['jsdw']}','#{params['yjhj']}','#{dh}','#{archiveid[0]['id']}') ")                        
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
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']      	    
        	    archiveid=User.find_by_sql("insert into archive(mlm,flh,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,mj,xh,cfwz) values('#{mlh}','#{params['flh']}','#{params['mlh']}','#{ajh}','#{params['zcmc']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}')   RETURNING id;")           
              
              User.find_by_sql("insert into a_sbda(zcmc,gzsj,dw,sl,cfdd,sybgdw,sybgr,zcbh,dj,je,dh,ownerid) values('#{params['zcmc']}','#{params['gzsj']}','#{params['dw']}','#{params['sl']}','#{params['cfdd']}','#{params['sybgdw']}','#{params['sybgr']}','#{params['zcbh']}','#{params['dj']}','#{params['je']}','#{dh}','#{archiveid[0]['id']}') ")                        
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
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']      	    
        	    archiveid=User.find_by_sql("insert into archive(mlm,flh,qny,zny,nd,js,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,mj,xh,cfwz) values('#{mlh}','#{params['flh']}','#{params['qny']}','#{params['zny']}','#{params['nd']}','#{params['js']}','#{params['mlh']}','#{ajh}','#{params['zcmc']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}')   RETURNING id;")           
              
              User.find_by_sql("insert into a_jjda(xmmc,jsdw,dh,jsnd,ownerid) values('#{params['xmmc']}','#{params['jsdw']}','#{dh}','#{params['nd']}','#{archiveid[0]['id']}') ")                                                                     
              txt='success'
              
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
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']      	    
        	    archiveid=User.find_by_sql("insert into archive(mlm,flh,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,mj,xh,cfwz) values('#{mlh}','#{params['flh']}','#{params['mlh']}','#{ajh}','#{params['mc']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}')   RETURNING id;")           
              
              User.find_by_sql("insert into a_swda(bh,lb,hjz,sjsj,sjdw,mc,ztxs,dh,ownerid) values('#{params['bh']}','#{params['lb']}','#{params['hjz']}','#{params['sjsj']}','#{params['sjdw']}','#{params['mc']}','#{params['ztxs']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
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
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']      	    
        	    archiveid=User.find_by_sql("insert into archive(mlm,nd,mlh,ajh,tm,bgqx,ys,bz,qzh,dh,dalb,dwdm,mj,xh,cfwz) values('#{mlh}','#{params['nd']}','#{params['mlh']}','#{ajh}','#{params['tm']}','#{params['bgqx']}',#{params['ys']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}')   RETURNING id;")                         
              User.find_by_sql("insert into a_zlxx(bh,lb,bzdw,dh,ownerid) values('#{params['bh']}','#{params['lb']}','#{params['bzdw']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
              txt='success'
            else
              txt= '目录号为'+params['mlh']+'；件号为'+params['ajh']+'已经存在，请重新输入目录号为或件号。'
            end
          when "30"
            user=User.find_by_sql("select * from archive,a_by_tszlhj where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_tszlhj.djh='#{params['djh']}'  and archive.id=a_by_tszlhj.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['djh']  	    
        	    archiveid=User.find_by_sql("insert into archive(tm,bz,qzh,dh,dalb,dwdm,cfwz) values('#{params['mc']}','#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}','#{params['cfwz']}')  RETURNING id;")              
              User.find_by_sql("insert into a_by_tszlhj(djh,kq,mc,fs,yfdm,cbrq,dj,dh,ownerid) values('#{params['djh']}','#{params['kq']}','#{params['mc']}','#{params['fs']}','#{params['yfdm']}','#{params['cbrq']}','#{params['dj']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
              txt='success'           
            else
              txt= '登记号为'+params['djh']+'；已经存在，请重新输入登记号。'
            end 
          when "31"
            user=User.find_by_sql("select * from archive,a_by_jcszhb where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_jcszhb.zt='#{params['zt']}'  and archive.id=a_by_jcszhb.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['zt']  	    
        	    archiveid=User.find_by_sql("insert into archive(tm,qzh,dh,dalb,dwdm) values('#{params['zt']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}') RETURNING id;")                         
              User.find_by_sql("insert into a_by_jcszhb(zt,qy,tjsj,sm,dh,ownerid) values('#{params['zt']}','#{params['qy']}','#{params['tjsj']}','#{params['sm']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
              txt='success'              
            else
              txt= '专题为'+params['zt']+'；已经存在，请重新输入专题。'
            end
          when "32"
            user=User.find_by_sql("select * from archive,a_by_zzjgyg where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_zzjgyg.jgmc='#{params['jgmc']}'  and archive.id=a_by_zzjgyg.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['jgmc']  	    
        	    archiveid=User.find_by_sql("insert into archive(bz,tm,qzh,dh,dalb,dwdm) values('#{params['bz']}','#{params['jgmc']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}')  RETURNING id;")                     
              User.find_by_sql("insert into a_by_zzjgyg(jgmc,zzzc,qzny,dh,ownerid) values('#{params['jgmc']}','#{params['zzzc']}','#{params['qzny']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
              txt='success'              
            else
              txt= '机构名称为'+params['jgmc']+'；已经存在，请重新输入机构名称。'
            end
          when "33"
            user=User.find_by_sql("select * from archive,a_by_dsj where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and a_by_dsj.sy='#{params['sy']}'  and archive.id=a_by_dsj.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['sy']  	    
        	    archiveid=User.find_by_sql("insert into archive(tm,qzh,dh,dalb,dwdm) values('#{params['sy']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}')   RETURNING id;")                       
              User.find_by_sql("insert into a_by_dsj(dd,jlr,clly,fsrq,jlrq,sy,yg,rw,dh,ownerid) values('#{params['dd']}','#{params['jlr']}','#{params['clly']}','#{params['fsrq']}','#{params['jlrq']}','#{params['sy']}','#{params['yg']}','#{params['rw']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
              txt='success'              
            else
              txt= '事由为'+params['sy']+'；已经存在，请重新输入事由。'
            end
          when "34"
            user=User.find_by_sql("select * from archive,a_by_qzsm where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}'  and archive.id=a_by_qzsm.ownerid ;")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + params['mlh']  	    
        	    archiveid=User.find_by_sql("insert into archive(mlh,bz,tm,qzh,dh,dalb,dwdm) values('#{params['mlh']}','#{params['bz']}','#{params['qzgczjj']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{dw[0]['dwdm']}')  RETURNING id;")                         
              User.find_by_sql("insert into a_by_qzsm(qzgczjj,sj,dh,ownerid) values('#{params['qzgczjj']}','#{params['sj']}','#{dh}','#{archiveid[0]['id']}') ")                                                                     
              txt='success'
            else
              txt= '目录号为'+params['mlh']+'；已经存在，请重新输入目录号。'
            end
          when "35"
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
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        	    archiveid=User.find_by_sql("insert into archive(mlm,mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,mj,xh,cfwz,dwdm) values('#{mlh}','#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['kyqr']};#{params['ksmc']};#{params['kswz']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['mj']}','#{params['xh']}','#{params['cfwz']}','#{dw[0]['dwdm']}')  RETURNING id;")              
              User.find_by_sql("insert into a_kyq( xxkz,  yxkz,  kyqr,  ksmc,  ksbh,  ksgm,  xzqdm,  kz,  djlx,  kswz,  kqfw,  mj ,  cl,  sjncl,  clgm,  yxqq,  yxqz,  yxqx,  fzjg,  mjdw,  cldw,  scgm,  scldw,  jjlx,dh,ownerid) values('#{params['xxkz']}','#{params['yxkz']}','#{params['kyqr']}','#{params['ksmc']}','#{params['ksbh']}','#{params['ksgm']}','#{params['xzqdm']}','#{params['kz']}','#{params['djlx']}','#{params['kswz']}','#{params['kqfw']}','#{params['ksmj']}','#{params['cl']}','#{params['sjncl']}','#{params['clgm']}','#{params['yxqq']}','#{params['yxqz']}','#{params['yxqx']}','#{params['fzjg']}','#{params['mjdw']}','#{params['cldw']}','#{params['scgm']}','#{params['scldw']}','#{params['jjlx']}','#{dh}','#{archiveid[0]['id']}') ")  
              txt='success'
            else
              txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
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
              mlh=get_doc_mlh(params['qzh'],params['nd'],params['bgqx'],params['jgwth'])
              dh=params['qzh']+ "-" + params['dalb'] + "-" + mlh.to_s + "-" + params['jh']
              
        	    archiveid=User.find_by_sql("insert into archive(mlm,ys,mlh,flh,tm,nd,bgqx,bz,qzh,dh,dalb,mj,dwdm) values('#{mlh}','#{params['ys']}','#{params['mlh']}','#{params['flh']}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['mj']}','#{dw[0]['dwdm']}') RETURNING id;")              
              User.find_by_sql("insert into a_wsda(ownerid,hh,jh, zwrq, wh, zrr,gb, wz,ztgg,ztlx,ztdw,dagdh,dzwdh,swh,ztsl,qwbs,ztc,zbbm,nd,jgwth,gbjh,xbbm,bgqx) values('#{archiveid[0]['id']}','#{params['hh']}','#{jh}','#{params['zwrq']}','#{params['wh']}','#{params['zrr']}','#{params['gb']}','#{params['wz']}','#{params['ztgg']}','#{params['ztlx']}','#{params['ztdw']}','#{params['dagdh']}','#{params['dzwdh']}','#{params['swh']}','#{params['ztsl']}','#{params['qwbs']}','#{params['ztc']}','#{params['zbbm']}','#{params['nd']}','#{params['jgwth']}','#{params['gbjh']}','#{params['xbbm']}','#{params['bgqx']}') ")                                      
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
    	      user=User.find_by_sql("select * from archive where  qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and mlh='#{params['mlh']}' and ajh='#{ajh}';")
            size = user.size
            if size == 0
              dw=User.find_by_sql("select * from d_dwdm where   id='#{params['qzh']}' ;")
              dh=params['qzh']+ "-" + params['dalb'] +"-" + mlh.to_s+"-" + params['ajh']
        	    archiveid=User.find_by_sql("insert into archive(mlm,mlh,flh,ajh,tm,nd,bgqx,qny,zny,ys,js,bz,qzh,dh,dalb,xh,cfwz,dwdm) values('#{mlh}','#{params['mlh']}','#{params['flh']}','#{ajh}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['qny']}','#{params['zny']}',#{params['ys']},#{params['js']},'#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['xh']}','#{params['cfwz']}','#{dw[0]['dwdm']}')  RETURNING id;")
              txt='success'
            else
              txt= '目录号为'+params['mlh']+'；档案号为'+params['ajh']+'已经存在，请重新输入目录号或案卷号。'
            end
          end
          if txt=='success'
            #getid=User.find_by_sql("select id from archive where   dh='#{dh}' ;")
            txt=txt + ":" + dh + ":" + archiveid[0]['id'].to_s  
            if dw[0]['dwdm']!="无锡"   
              if params['ys']==nil
                params['ys']=0
              end
              ss = dh.split('-')
              dh_pres=ss[0].to_s + "-" + ss[1].to_s + "-" +ss[2].to_s                     
              User.find_by_sql("insert into timage_tj(dh,ajh,ajys,mlm,zt,dh_prefix) values('#{dh}',#{ajh.to_i},#{params['ys']},'#{params['mlh']}','空卷','#{dh_pres}');")
              
              system("ruby ./dady/bin/update_qzxx_tj.rb #{dh_pres}") 
            end
          end
          #User.find_by_sql("COMMIT;")
      	  render :text => txt
      	end

	#删除案卷
	def delete_archive
	  #User.find_by_sql("BEGIN;")
	  dh=User.find_by_sql("select * from archive  where id = #{params['id']};")  
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
    when "35"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_kyq  where ownerid = #{params['id']};")
    when "27"     
      User.find_by_sql("delete from archive  where id = #{params['id']};")
      User.find_by_sql("delete from a_sbda  where ownerid = #{params['id']};")
    else
      User.find_by_sql("delete from archive  where id = #{params['id']};")
    end
	  
    User.find_by_sql("delete from document  where ownerid = #{params['id']};")
    if dh[0]['dwdm']!="无锡"
      if dh.size>0
        User.find_by_sql("delete from timage_tj where dh = '#{dh[0]['dh']}';")
        ss = dh[0]['dh'].split('-')
        dh_pres=ss[0].to_s + "-" + ss[1].to_s + "-" +ss[2].to_s
        system("ruby ./dady/bin/update_qzxx_tj.rb #{dh_pres}") 
      end
    end
    #User.find_by_sql("COMMIT;")
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
    fl = '' if params['filter']=='未统计'
    where_str = where_str + " and zt= '#{fl}' " if !(fl.nil?) && fl !='全部'
    
    dalb = params['dalb']
    where_str = where_str + " and dalb = '#{dalb}' " if !(dalb.nil?) && dalb !=''

    user = User.find_by_sql("select *, (ajys-smyx) as wcz  from q_qzxx #{where_str} order by mlh;")
    
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
      User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dd.dh_prefix}','#{mlh}', 'ruby ./dady/bin/print_wizard.rb #{dd.dh_prefix} #{dd.qajh} #{dd.zajh} 13 1', '', '', '未开始');")
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
    user = User.find_by_sql("select * from q_status order by mlh limit 100;")
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
  
  def update_qzxx_selected
    user = User.find_by_sql("select * from q_qzxx where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh_prefix.split('-')
      qzh, dalb, mlh = ss[0], ss[1], ss[2]
      system("ruby ./dady/bin/update_qzxx_tj.rb #{dd.dh_prefix}")
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
    if params['id'] == 'all' 
      user = User.find_by_sql("select * from timage_tj where dh_prefix='#{params['dh']}' and zt='空卷';")
    else
      user = User.find_by_sql("select * from timage_tj where id in (#{params['id']});")
    end
    for k in 0..user.size-1
      dd = user[k]
      ss = dd.dh.split('-')
      qzh, dalb, mlh, ajh, dh_prefix = ss[0], ss[1], ss[2], ss[3], dd.dh_prefix
      
      qzxx=User.find_by_sql("select * from q_qzxx where dh_prefix='#{dd.dh_prefix}';")[0]
      yxgs=User.find_by_sql("select id, yxmc, yxbh from timage where dh like '#{dh_prefix}-%' limit 1;")
      yxgs = lookup(qzxx.yxwz)
      if yxgs.length > 0
        #yy=yxgs.split('$') 
        #yxmc = "#{yy[0]}\$#{yy[1][0..0]}\$#{ajh.rjust(4,'0')}"
        yxgs=
        yxmc = "#{yxgs[0..-5]}#{ajh.rjust(4,'0')}" 
        path = "#{yxmc}".gsub('$','\$')
        User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dh_prefix}','#{mlh}', 'ruby ./dady/bin/import_tsimage.rb #{dh_prefix} #{path} #{ajh}', '', '', '未开始');")
      end  
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
  
  def balance_selectedmulu_mulu
    user = User.find_by_sql("select * from timage_tj where id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
     User.find_by_sql("update archive set ys=timage_tj.smyx from timage_tj where archive.dh=timage_tj.dh and timage_tj.dh='#{dd.dh}';")
    end  
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
    params['filename']=params['filename'].gsub('(', '\(').gsub(')', '\)').gsub('"', '\"').gsub("'", "\'")
    yxbh=params['filename'].split('.')
    if (yxbh[1].upcase.include?'JPG') || (yxbh[1].upcase.include?'TIF') || (yxbh[1].upcase.include?'TIFF') || (yxbh[1].upcase.include?'JPEG')
      if  yxbh[0].length==4
        if yxbh[0].to_i.to_s.rjust(4,"0")==yxbh[0]
          delimage=User.find_by_sql("select id,yxbh from timage where dh = '#{params['dh']}' and yxbh>='#{params['filename']}' order by yxbh;")
          for k in 0..delimage.size-1
            yxbh2=delimage[k]['yxbh'].split('.')
            if yxbh2[0].to_i.to_s.rjust(4,"0")==yxbh2[0] && yxbh2[0].length==4
              yxbh1=(yxbh[0].to_i+1+k.to_i).to_s.rjust(4,"0") + "." + yxbh2[1]
              User.find_by_sql("update timage set yxbh='#{yxbh1}',yxmc='#{yxbh1}' where id = #{delimage[k]['id']} ;")
            end
          end
        end
      end
    end
    text=system("ruby ./dady/bin/import_image_file.rb ./dady/#{params['filename']} #{params['dh']} #{params['dh']} ")   
    
    render :text =>text
  end

  #判断影像文件是否存在
  def get_image_sfcf
    delimage=User.find_by_sql("select id,yxbh from timage where dh = '#{params['dh']}' and yxbh='#{params['filename']}';")
    if delimage.size>0
      txt="true"
    else
      txt='false'
    end
    render :text =>txt
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
              txt=jrml_print(strwhere)
            when "案卷封面打印"
              txt=fm_print(strwhere,params['print_model'])
            end
          end
        end
      end
      
    end
    render :text =>txt
  end
  
  #卷内目录打印
  def jrml_print(strwhere)
    filenames=""
 		for x in params['qajh'].to_i..params['zajh'].to_i
 		  
 		  ajh=sprintf("%04d", x)
 		  strwhere=" where mlh='#{params['mlh']}' and qzh='#{params['qzh']}' and dalb='#{params['dalb']}' and ajh='#{ajh}' "
 		  user = User.find_by_sql("select  document.* from archive,document #{strwhere} and archive.id=document.ownerid order by sxh ;")
      
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
          intwidth<<283
          intwidth<<386
          intwidth<<667
          intwidth<<898
          intwidth<<1793
          intwidth<<2004
          intwidth<<2194

          printfilename="jrml.jpg"
          for i in 0..intts
            intheight= i*252+800
            convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['sxh'].center 5}'\"     "
            intheight=intheight-90
            if !(user[i+k*10]['rq'].nil?) 
              rq=user[i+k*10]['rq'].split(" ")
              year=rq[0].split("-")
              yr=year[1]+year[2]
           #  intheight1=intheight+ 30
           #  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[0]}'\" "
           #  intheight1=intheight+ 80
           #  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[1].center 6}'\" "
           #  intheight1=intheight+ 130
           #  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[2].center 6}'\" "
              intheight1=intheight+ 60
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[0].center 6}'\" "
              intheight1=intheight+ 110
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{yr.center 6}'\" "
            end
            if !(user[i+k*10]['yh'].nil?)
              if user[i+k*10]['yh'].length>6
                yh=user[i+k*10]['yh'].split("-")
                yh[0]=yh[0] + "-"
                intheight1=intheight+ 60
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight1} '#{yh[0].center 6}'\" "
                intheight1=intheight+ 110
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight1} '#{yh[1].center 6}'\" "
              else
                intheight1=intheight+ 90
                convertstr =convertstr +"-pointsize 50 -draw \"text #{intwidth[5]}, #{intheight1} '#{user[i+k*10]['yh'].center 5}'\""
              end
            end
            
            if !(user[i+k*10]['wh'].nil?)
              tm=split_string(user[i+k*10]['wh'],5)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
            puts tm
            if !(user[i+k*10]['zrz'].nil?)
              tm=split_string(user[i+k*10]['zrz'],4)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
            if !(user[i+k*10]['tm'].nil?)
              puts tm
              #user[i+k*10]['tm']=user[i+k*10]['tm'].gsub('"', '\"')
              tm=split_string(user[i+k*10]['tm'],16)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
            if !(user[i+k*10]['bz'].nil?)
              puts tm
              tm=split_string(user[i+k*10]['bz'],3)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
          end
          rq=Time.now.strftime("%Y%m%d%H%M%S")  
          sj=rand(10000)      
          #strfilename="./dady/tmp1/ajml" + k.to_s + rq.to_s + ".jpg"
          strfilename="./dady/tmp1/ajml" +x.to_s+ k.to_s + rq.to_s + sj.to_s +  ".jpg"
          puts strfilename
          puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
          system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")
          if filenames==""
            filenames="ajml" +x.to_s+ k.to_s + rq.to_s + sj.to_s+ ".jpg"
          else
            filenames=filenames + "," + "ajml" +x.to_s+ k.to_s + rq.to_s + sj.to_s+ ".jpg"
          end
        end
        
      else            
        #txt = "无此条件的数据，请重新输入条件。"
      end
      txt="success:" + filenames
    end
    return txt
  end
  
  
  
  #墙面打印
  def fm_print(strwhere,print_model)
    istddj=""
    case (params['dalb']) 
 		when "0"
 			user = User.find_by_sql("select * from archive #{strwhere} order by ajh ;")
      
 		when "2"
 			user = User.find_by_sql("select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid #{strwhere} order by ajh ;")
      
 		when "3","5","6","7"
 		  istddj="是"
 			user = User.find_by_sql("select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid #{strwhere}  order by ajh ;")
 		when "15"
 		  dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid #{strwhere}  order by ajh ;")
     when "18"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid #{strwhere}  order by ajh ;")
     when "25"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid #{strwhere}  order by ajh ;")
     when "27"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid #{strwhere} order by ajh ;")
     when "26"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid #{strwhere}  order by ajh ;")
     when "28"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxsfrom archive left join a_swda on archive.id=a_swda.ownerid #{strwhere}  order by ajh ;")
     when "29"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid #{strwhere}  order by ajh ;")
     when "30"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid #{strwhere}  order by djh ;")
     when "31"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid #{strwhere}  order by zt ;")
     when "32"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid #{strwhere}  order by jgmc ;")
     when "33"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid #{strwhere}   order by fsrq ;")
     when "34"
       dalb='综  合  类'
 			user = User.find_by_sql("select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid where #{strwhere}   order by sj ;")

 		 when "24"
 		   
 		  #年度_机构问题号_保管期限
 		  
      
      
      puts strwhere
         
       user = User.find_by_sql("select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   order by nd,bgqx,jgwth,jh ;")
 		 else
 			 user = User.find_by_sql("select * from archive  #{strwhere} order by ajh ;")

   	end
   	case (params['dalb']) 
 		when "0"
 		  dalb='综  合  类'
	  when "2"
	    dalb='财  务  类'
    when "3","5","6","7","4","23","36","37","38","39"
      dalb='地 籍 管 理 类'
    when "16","17"
      dalb='国土资源利用规划类'
    when "8","9","10","11","12"
      dalb='建 设 用 地 类'
    when "13","14"
      dalb='监  察  类'
    when "15","20"
      dalb='电子、声像材料类'
    when "21","35"
      dalb='地 质 、 矿 产 类'
    when "19"
      dalb='科 技 信 息 类'
    when "18"
      dalb='图 件 目 录'
    when "22"
      dalb='海  洋  类'
    when "23"
      dalb='测 绘 管 理 类'
    else
      dalb='综  合  类'
	  end
    filenames=""
    intys=0
    intts=0
    intwidth=[]
    dalb_wz=[]
    tm_wz=[]
    bz_wz=[]
    qn_wz=[]
    zn_wz=[]
    qy_wz=[]
    zy_wz=[]
    bgqx_wz=[]
    mj_wz=[]
    js_wz=[]
    ys_wz=[]
    mlh_wz=[]
    flh_wz=[]
    ajh_wz=[]
    djh_wz=[]
    qlrmc_wz=[]
    tdzl_wz=[]
    tdzh_wz=[]
    qsxz_wz=[]
    
    #dalbs = User.find_by_sql("select * from d_dalb where id=  #{params['dalb']}  ;")
    #dalb=dalbs[0]["lbmc"]
    size = user.size;
    if size.to_i>0 
     # if istddj=="是"
     #   print_setup = User.find_by_sql("select * from print_setup where sfdy='是' and dylb='土地登记打印'  ;")
     # else
        print_setup = User.find_by_sql("select * from print_setup where sfdy='是'   and mbmc='#{print_model}';")
     # end
      printsize=print_setup.size;
      for k in 0.. printsize.to_i-1
        case (print_setup[k]['bt'])
        when "档案类别"
          dalb_wz<<print_setup[k]['xx']
          dalb_wz<<print_setup[k]['yy']
          dalb_wz<<print_setup[k]['zt']
          dalb_wz<<print_setup[k]['dx']
        when "案卷标题"
          tm_wz<<print_setup[k]['xx']
          tm_wz<<print_setup[k]['yy']
          tm_wz<<print_setup[k]['zt']
          tm_wz<<print_setup[k]['dx']
          tm_wz<<print_setup[k]['sfkg']
        when "起年"
          qn_wz<<print_setup[k]['xx']
          qn_wz<<print_setup[k]['yy']
          qn_wz<<print_setup[k]['zt']
          qn_wz<<print_setup[k]['dx']
        when "起月"
          qy_wz<<print_setup[k]['xx']
          qy_wz<<print_setup[k]['yy']
          qy_wz<<print_setup[k]['zt']
          qy_wz<<print_setup[k]['dx']
        when "止年"
          zn_wz<<print_setup[k]['xx']
          zn_wz<<print_setup[k]['yy']
          zn_wz<<print_setup[k]['zt']
          zn_wz<<print_setup[k]['dx']
        when "止月"
          zy_wz<<print_setup[k]['xx']
          zy_wz<<print_setup[k]['yy']
          zy_wz<<print_setup[k]['zt']
          zy_wz<<print_setup[k]['dx']
        when "保管期限"
          bgqx_wz<<print_setup[k]['xx']
          bgqx_wz<<print_setup[k]['yy']
          bgqx_wz<<print_setup[k]['zt']
          bgqx_wz<<print_setup[k]['dx']
        when "密级"
          mj_wz<<print_setup[k]['xx']
          mj_wz<<print_setup[k]['yy']
          mj_wz<<print_setup[k]['zt']
          mj_wz<<print_setup[k]['dx']
        when "件数"
          js_wz<<print_setup[k]['xx']
          js_wz<<print_setup[k]['yy']
          js_wz<<print_setup[k]['zt']
          js_wz<<print_setup[k]['dx']
        when "页数"
          ys_wz<<print_setup[k]['xx']
          ys_wz<<print_setup[k]['yy']
          ys_wz<<print_setup[k]['zt']
          ys_wz<<print_setup[k]['dx']
        when "目录号"
          mlh_wz<<print_setup[k]['xx']
          mlh_wz<<print_setup[k]['yy']
          mlh_wz<<print_setup[k]['zt']
          mlh_wz<<print_setup[k]['dx']
        when "分类号"
          flh_wz<<print_setup[k]['xx']
          flh_wz<<print_setup[k]['yy']
          flh_wz<<print_setup[k]['zt']
          flh_wz<<print_setup[k]['dx']
        when "案卷号"
          ajh_wz<<print_setup[k]['xx']
          ajh_wz<<print_setup[k]['yy']
          ajh_wz<<print_setup[k]['zt']
          ajh_wz<<print_setup[k]['dx']
        when "备注"
          bz_wz<<print_setup[k]['xx']
          bz_wz<<print_setup[k]['yy']
          bz_wz<<print_setup[k]['zt']
          bz_wz<<print_setup[k]['dx']
        when "地籍号"
          djh_wz<<print_setup[k]['xx']
          djh_wz<<print_setup[k]['yy']
          
          djh_wz<<print_setup[k]['zt']
          djh_wz<<print_setup[k]['dx']
          djh_wz<<print_setup[k]['sfdybt']
        when "权利人名称"
          qlrmc_wz<<print_setup[k]['xx']
          qlrmc_wz<<print_setup[k]['yy']
          qlrmc_wz<<print_setup[k]['zt']
          qlrmc_wz<<print_setup[k]['dx']
          qlrmc_wz<<print_setup[k]['sfdybt']
        when "土地座落"
          tdzl_wz<<print_setup[k]['xx']
          tdzl_wz<<print_setup[k]['yy']
          tdzl_wz<<print_setup[k]['zt']
          tdzl_wz<<print_setup[k]['dx']
          tdzl_wz<<print_setup[k]['sfdybt']
        when "土地证号"
          tdzh_wz<<print_setup[k]['xx']
          tdzh_wz<<print_setup[k]['yy']
          tdzh_wz<<print_setup[k]['zt']
          tdzh_wz<<print_setup[k]['dx']
          tdzh_wz<<print_setup[k]['sfdybt']
        when "权属性质"
          qsxz_wz<<print_setup[k]['xx']
          qsxz_wz<<print_setup[k]['yy']
          qsxz_wz<<print_setup[k]['zt']
          qsxz_wz<<print_setup[k]['dx']
          qsxz_wz<<print_setup[k]['sfdybt']
        end
      end
      for i in 0..size.to_i-1
        strfilename=""
        convertstr=""
            printfilename="fm.jpg"
            user[i]['ajh']=user[i]['ajh'].to_i.to_s
            puts user[i]['ajh'].to_i.to_s
            if dalb_wz.size.to_i>0
              if dalb_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{dalb_wz[3]} -draw \"text #{dalb_wz[0]},#{dalb_wz[1]} '#{dalb.center 21}'\""
            end
            puts convertstr
            if bz_wz.size.to_i>0
              if bz_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{bz_wz[3]} -draw \"text #{bz_wz[0]},#{bz_wz[1]} '#{user[i]['bz']}'\""
            end
            if qn_wz.size.to_i>0
              if qn_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{qn_wz[3]} -draw \"text #{qn_wz[0]},#{qn_wz[1]} '#{user[i]['qny'][0..3]}'\""
            end
            if qy_wz.size.to_i>0
              if qy_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{qy_wz[3]} -draw \"text #{qy_wz[0]},#{qy_wz[1]} '#{user[i]['qny'][4..-1]}'\""
            end
            if zn_wz.size.to_i>0
              if zn_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{zn_wz[3]} -draw \"text #{zn_wz[0]},#{zn_wz[1]} '#{user[i]['zny'][0..3]}'\""
            end
            if zy_wz.size.to_i>0
              if zy_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{zy_wz[3]} -draw \"text #{zy_wz[0]},#{zy_wz[1]} '#{user[i]['zny'][4..-1]}'\""
            end
            if js_wz.size.to_i>0
              if zy_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{js_wz[3]} -draw \"text #{js_wz[0]},#{js_wz[1]} '#{user[i]['js']}'\""
            end
            if ys_wz.size.to_i>0
              if ys_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{ys_wz[3]} -draw \"text #{ys_wz[0]},#{ys_wz[1]} '#{user[i]['ys']}'\""
            end
            if bgqx_wz.size.to_i>0
              if bgqx_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{bgqx_wz[3]} -draw \"text #{bgqx_wz[0]},#{bgqx_wz[1]} '#{user[i]['bgqx']}'\""
            end
            if mj_wz.size.to_i>0
              if mj_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{mj_wz[3]} -draw \"text #{mj_wz[0]},#{mj_wz[1]} '#{user[i]['mj']}'\""
            end
            if mlh_wz.size.to_i>0
              if mj_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{mlh_wz[3]} -draw \"text #{mlh_wz[0]},#{mlh_wz[1]} '#{user[i]['mlh']}'\""
            end
            if flh_wz.size.to_i>0
              if flh_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{flh_wz[3]} -draw \"text #{flh_wz[0]},#{flh_wz[1]} '#{user[i]['flh']}'\""
            end
            if ajh_wz.size.to_i>0
              if ajh_wz[2]=='宋体'
                convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
              else
                convertstr=convertstr + " -font ./dady/SimHei.ttf"
              end
              convertstr=convertstr +" -pointsize #{ajh_wz[3]} -draw \"text #{ajh_wz[0]},#{ajh_wz[1]} '#{user[i]['ajh']}'\""
            end
            
            puts convertstr
            case (params['dalb']) 
            when "3","5","6","7"
              bt=0
              if djh_wz.size.to_i>0
                if djh_wz[2]=='宋体'
                  convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
                else
                  convertstr=convertstr + " -font ./dady/SimHei.ttf"
                end
                if djh_wz[4]=='是'  
                  bt=djh_wz[0].to_i-600       
                  convertstr=convertstr +" -pointsize #{djh_wz[3]} -draw \"text #{bt},#{djh_wz[1]} '地　籍　号：'\" -pointsize #{djh_wz[3]} -draw \"text #{djh_wz[0]},#{djh_wz[1]} '#{user[i]['djh']}'\""
                else
                  convertstr=convertstr +" -pointsize #{djh_wz[3]} -draw \"text #{djh_wz[0]},#{djh_wz[1]} '#{user[i]['djh']}'\""
                end
              end
              
              if qlrmc_wz.size.to_i>0
                if qlrmc_wz[2]=='宋体'
                  convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
                else
                  convertstr=convertstr + " -font ./dady/SimHei.ttf"
                end
                if qlrmc_wz[4]=='是'  
                  bt=qlrmc_wz[0].to_i-600 
                  convertstr=convertstr +" -pointsize #{qlrmc_wz[3]} -draw \"text #{bt},#{qlrmc_wz[1]} '权利人名称：'\"  "    
                  #convertstr=convertstr +" -pointsize #{qlrmc_wz[3]} -draw \"text #{bt},#{qlrmc_wz[1]} '权利人名称：'\" -pointsize #{qlrmc_wz[3]} -draw \"text #{qlrmc_wz[0]},#{qlrmc_wz[1]} '#{user[i]['qlrmc']}'\""
                #else
                  #convertstr=convertstr +" -pointsize #{qlrmc_wz[3]} -draw \"text #{qlrmc_wz[0]},#{qlrmc_wz[1]} '#{user[i]['qlrmc']}'\""
                end
                czr=0
                dyqr=user[i]['qlrmc'].split('抵押权人')
                if dyqr.length==1
                  dyqr=user[i]['qlrmc'].split('承租人')
                  czr=1
                end
                if dyqr.length>1
                  intheight=qlrmc_wz[1].to_i
                  intheight1=0
                  for x in 0..dyqr.length-1
                    if x==1
                      if czr==1
                        dyqr[x]="承租人"+dyqr[x].to_s
                      else
                        dyqr[x]="抵押权人"+dyqr[x].to_s
                      end
                    end
                    if x==0
                      dyqr[x]=dyqr[x].gsub(';', '').gsub('；', '')
                    end
                    tm=split_string(dyqr[x],14)
                    strtm=tm.split("\n")
                    intheight=intheight+x*qlrmc_wz[3].to_i+x*qlrmc_wz[3].to_i
                    for j in 0..strtm.length-1
                      intheight1=intheight+ j*qlrmc_wz[3].to_i
                      convertstr =convertstr + " -pointsize #{qlrmc_wz[3]}  -draw \"text #{qlrmc_wz[0]}, #{intheight1} '#{strtm[j]}'\" "
                    end
                  end
                  
                  if tdzl_wz.size.to_i>0
                    if tdzl_wz[2]=='宋体'
                      convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
                    else
                      convertstr=convertstr + " -font ./dady/SimHei.ttf"
                    end
                    if tdzl_wz[4]=='是'  
                      bt=tdzl_wz[0].to_i-600     
                      convertstr=convertstr +" -pointsize #{tdzl_wz[3]} -draw \"text #{bt},#{tdzl_wz[1]} '土地　座落：'\" "  
                      #convertstr=convertstr +" -pointsize #{tdzl_wz[3]} -draw \"text #{bt},#{tdzl_wz[1]} '土地　座落：'\" -pointsize #{tdzl_wz[3]} -draw \"text #{tdzl_wz[0]},#{tdzl_wz[1]} '#{user[i]['tdzl']}'\""
                    #else
                      #convertstr=convertstr +" -pointsize #{tdzl_wz[3]} -draw \"text #{tdzl_wz[0]},#{tdzl_wz[1]} '#{user[i]['tdzl']}'\""
                    end
                    tm=split_string(user[i]['tdzl'],14)
                    strtm=tm.split("\n")
                    intheight=tdzl_wz[1].to_i
                    intheight1=0
                    for j in 0..strtm.length-1
                      intheight1=intheight+ j*tdzl_wz[3].to_i
                      convertstr =convertstr + " -pointsize #{qlrmc_wz[3]}  -draw \"text #{tdzl_wz[0]}, #{intheight1} '#{strtm[j]}'\" "
                    end
                  end
                  
                  if tdzh_wz.size.to_i>0
                    if tdzh_wz[2]=='宋体'
                      convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
                    else
                      convertstr=convertstr + " -font ./dady/SimHei.ttf"
                    end
                    if tdzh_wz[4]=='是'  
                      bt=tdzh_wz[0].to_i-600  
                      convertstr=convertstr +" -pointsize #{tdzh_wz[3]} -draw \"text #{bt},#{tdzh_wz[1]} '土地　证号：'\"  "      
                      #convertstr=convertstr +" -pointsize #{tdzh_wz[3]} -draw \"text #{bt},#{tdzh_wz[1]} '土地　证号：'\" -pointsize #{tdzh_wz[3]} -draw \"text #{tdzh_wz[0]},#{tdzh_wz[1]} '#{user[i]['tdzh']}'\""
                    #else
                      #convertstr=convertstr +" -pointsize #{tdzh_wz[3]} -draw \"text #{tdzh_wz[0]},#{tdzh_wz[1]} '#{user[i]['tdzh']}'\""
                    end
                    tm=split_string(user[i]['tdzh'],14)
                    strtm=tm.split("\n")
                    intheight=tdzh_wz[1].to_i
                    intheight1=0
                    for j in 0..strtm.length-1
                      intheight1=intheight+ j*tdzh_wz[3].to_i
                      convertstr =convertstr + " -pointsize #{qlrmc_wz[3]}  -draw \"text #{tdzh_wz[0]}, #{intheight1} '#{strtm[j]}'\" "
                    end
                  end
                  
                else
                  
                  if tdzl_wz.size.to_i>0
                    if tdzl_wz[2]=='宋体'
                      convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
                    else
                      convertstr=convertstr + " -font ./dady/SimHei.ttf"
                    end
                    if tdzl_wz[4]=='是'  
                      bt=tdzl_wz[0].to_i-600     
                      convertstr=convertstr +" -pointsize #{tdzl_wz[3]} -draw \"text #{bt},#{tdzl_wz[1]} '土地　座落：'\" "  
                      #convertstr=convertstr +" -pointsize #{tdzl_wz[3]} -draw \"text #{bt},#{tdzl_wz[1]} '土地　座落：'\" -pointsize #{tdzl_wz[3]} -draw \"text #{tdzl_wz[0]},#{tdzl_wz[1]} '#{user[i]['tdzl']}'\""
                    #else
                      #convertstr=convertstr +" -pointsize #{tdzl_wz[3]} -draw \"text #{tdzl_wz[0]},#{tdzl_wz[1]} '#{user[i]['tdzl']}'\""
                    end
                    tm=split_string(user[i]['tdzl'],14)
                    strtm=tm.split("\n")
                    intheight=tdzl_wz[1].to_i
                    intheight1=0
                    if strtm.length>1
                      intheight=intheight.to_i-tdzl_wz[3].to_i
                    end
                    for j in 0..strtm.length-1
                      intheight1=intheight+ j*tdzl_wz[3].to_i
                      convertstr =convertstr + " -pointsize #{qlrmc_wz[3]}  -draw \"text #{tdzl_wz[0]}, #{intheight1} '#{strtm[j]}'\" "
                    end
                  end
                  
                  if tdzh_wz.size.to_i>0
                    if tdzh_wz[2]=='宋体'
                      convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
                    else
                      convertstr=convertstr + " -font ./dady/SimHei.ttf"
                    end
                    if tdzh_wz[4]=='是'  
                      bt=tdzh_wz[0].to_i-600  
                      convertstr=convertstr +" -pointsize #{tdzh_wz[3]} -draw \"text #{bt},#{tdzh_wz[1]} '土地　证号：'\"  "      
                      #convertstr=convertstr +" -pointsize #{tdzh_wz[3]} -draw \"text #{bt},#{tdzh_wz[1]} '土地　证号：'\" -pointsize #{tdzh_wz[3]} -draw \"text #{tdzh_wz[0]},#{tdzh_wz[1]} '#{user[i]['tdzh']}'\""
                    #else
                      #convertstr=convertstr +" -pointsize #{tdzh_wz[3]} -draw \"text #{tdzh_wz[0]},#{tdzh_wz[1]} '#{user[i]['tdzh']}'\""
                    end
                    tm=split_string(user[i]['tdzh'],14)
                    strtm=tm.split("\n")
                    intheight=tdzh_wz[1].to_i
                    intheight1=0
                    if strtm.length>1
                      intheight=intheight.to_i-tdzh_wz[3].to_i
                    end
                    for j in 0..strtm.length-1
                      intheight1=intheight+ j*tdzh_wz[3].to_i
                      convertstr =convertstr + " -pointsize #{qlrmc_wz[3]}  -draw \"text #{tdzh_wz[0]}, #{intheight1} '#{strtm[j]}'\" "
                    end
                  end
                  
                  tm=split_string(user[i]['qlrmc'],14)
                  strtm=tm.split("\n")
                  intheight=qlrmc_wz[1].to_i
                  intheight1=0
                  if strtm.length>1
                    intheight=intheight.to_i-qlrmc_wz[3].to_i
                  end
                  for j in 0..strtm.length-1
                    intheight1=intheight+ j*qlrmc_wz[3].to_i
                    convertstr =convertstr + " -pointsize #{qlrmc_wz[3]}  -draw \"text #{qlrmc_wz[0]}, #{intheight1} '#{strtm[j]}'\" "
                  end
                end
              end
              
              if qsxz_wz.size.to_i>0
                if qsxz_wz[2]=='宋体'
                  convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
                else
                  convertstr=convertstr + " -font ./dady/SimHei.ttf"
                end
                if qsxz_wz[4]=='是'  
                  bt=qsxz_wz[0].to_i-600       
                  convertstr=convertstr +" -pointsize #{qsxz_wz[3]} -draw \"text #{bt},#{qsxz_wz[1]} '权属　性质：'\" -pointsize #{qsxz_wz[3]} -draw \"text #{qsxz_wz[0]},#{qsxz_wz[1]} '#{user[i]['qsxz']}'\""
                else
                  convertstr=convertstr +" -pointsize #{qsxz_wz[3]} -draw \"text #{qsxz_wz[0]},#{qsxz_wz[1]} '#{user[i]['qsxz']}'\""
                end
              end
              
            else
              
              if tm_wz.size.to_i>0
                if !(user[i]['tm'].nil?)
                  user[i]['tm']=user[i]['tm'].gsub('(', '（').gsub(')', '）')
                  intheight=tm_wz[1].to_i
                  if tm_wz[4]=='是'
                    user[i]['tm']="　　" +user[i]['tm']
                  else
                    user[i]['tm']=user[i]['tm']
                  end
                  tm=split_string(user[i]['tm'],16)
                  strtm=tm.split("\n")
                  intheight1=0
                  if tm_wz[2]=='宋体'
                    convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
                  else
                    convertstr=convertstr + " -font ./dady/SimHei.ttf"
                  end
                  for j in 0..strtm.length-1
                    intheight1=intheight+ j*tm_wz[3].to_i
                    convertstr =convertstr + " -pointsize #{tm_wz[3]}  -draw \"text #{tm_wz[0]}, #{intheight1} '#{strtm[j]}'\" "
                  end
                end
              end
            end
          
          
        rq=Time.now.strftime("%Y%m%d%H%M%S")
        sj=rand(10000)
        strfilename="./dady/tmp1/fm" + i.to_s + rq.to_s + sj.to_s + ".jpg"
        puts strfilename
        puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
        system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")
        
        if filenames==""
          filenames="fm" + i.to_s+ rq.to_s + sj.to_s + ".jpg"
        else
          filenames=filenames + "," + "fm" + i.to_s + rq.to_s + sj.to_s + ".jpg"
        end
      end
      txt="success:" + filenames
    else            
      txt = "无此条件的数据，请重新输入条件。"
    end
    return txt
  end
  
  
  #案卷目录打印
  def ajml_print(strwhere)
    #pdf = PDF::Writer.new
    pdfsize=""
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
 			user = User.find_by_sql("select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxs from archive left join a_swda on archive.id=a_swda.ownerid #{strwhere}  order by ajh ;")
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
            pdfsize=':at =>[-40,780], :width => 580, :height => 890'
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
            pdfsize=':at =>[-40,780], :width => 580, :height => 890'
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
             tm=split_string(user[i+k*10]['tdzh'],5)
             strtm=tm.split("\n")
             intheight1=0
             for j in 0..strtm.length-1
               intheight1=intheight+ j*50
               convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[10]}, #{intheight1} '#{strtm[j]}'\" "
             end
            end
            puts tm
          when "24"
            intwidth<<324
            intwidth<<437
            intwidth<<672
            intwidth<<922
            intwidth<<1800
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
                
                intheight1=intheight+ 50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{year[0].center 6}'\" "
                intheight1=intheight+ 10
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight1} '#{yr.center 6}'\" "
            end
            if !(user[i+k*10]['zrr'].nil?)
              tm=split_string(user[i+k*10]['zrr'],4)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
            puts tm
            if !(user[i+k*10]['wh'].nil?)
              tm=split_string(user[i+k*10]['wh'],5)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
            if !(user[i+k*10]['tm'].nil?)
              puts tm
              tm=split_string(user[i+k*10]['tm'],17)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
            convertstr =convertstr + " -pointsize 50  -draw \"text 318, 507 '年度：'\"  -pointsize 50  -draw \"text 475, 507 '#{user[i+k*10]['nd']}'\""
            convertstr =convertstr + " -pointsize 50  -draw \"text 1059, 507 '保管期限：'\"  -pointsize 50  -draw \"text 1300, 507 '#{user[i+k*10]['bgqx']}'\""
            convertstr =convertstr + " -pointsize 50  -draw \"text 1835, 507 '机构问题号：'\"  -pointsize 50  -draw \"text 2150, 507 '#{user[i+k*10]['jgwth']}'\""
          
          when "28"
            pdfsize=':at =>[-40,780], :width => 580, :height => 890'
            intwidth<<325
            intwidth<<464
            intwidth<<741
            intwidth<<1448
            intwidth<<1870
            intwidth<<2476
            intwidth<<2758
            intwidth<<3038            
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
            convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{user[i+k*10]['ajh'].center 5}'\" -pointsize 50 -draw \"text #{intwidth[1]}, #{intheight} '#{user[i+k*10]['bh'].center 5}'\"   -pointsize 50 -draw \"text #{intwidth[6]}, #{intheight} '#{user[i+k*10]['ztxs']}'\" -pointsize 50 -draw \"text #{intwidth[5]}, #{intheight} '#{sjsj}'\" "
            intheight=intheight-60
            if !(user[i+k*10]['tm'].nil?)
              tm=split_string(user[i+k*10]['tm'],13)
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
            intwidth<<428
            intwidth<<604
            intwidth<<772
            intwidth<<928
            intwidth<<2337
            intwidth<<2497
            intwidth<<2647
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
        rq=Time.now.strftime("%Y%m%d%H%M%S")
        sj=rand(10000)       
        strfilename="./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".jpg"
        fn="./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
        puts strfilename
        puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
        system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")
        if params['dalb']!='24'
          system("convert -rotate 90 #{strfilename} #{fn}")
        end
        if filenames==""
          fns="./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
          filenames="ajml" + k.to_s + rq.to_s + sj.to_s + ".jpg"
        else
          fns=fns + "," + "./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + "1.jpg"
          filenames=filenames + "," + "ajml" + k.to_s + rq.to_s + sj.to_s + ".jpg"
        end
        #puts "pdf.image" + fn
        #pdf.image fn
        #i0 = pdf.image fn, :resize => 1
       # system("convert -rotate 90  MyRails/iChad/dady/tmp1/ajml3201209222045015813.jpg MyRails/iChad/dady/tmp1/ajml3201209222045015813.png")
       # pdf.image 'MyRails/iChad/dady/tmp1/ajml3201209222045015813.png'
       # system("convert -rotate 90  MyRails/iChad/dady/tmp1/ndtj20120806092852.jpg MyRails/iChad/dady/tmp1/ndtj20120806092852.png")
       # pdf.image 'MyRails/iChad/dady/tmp1/ndtj20120806092852.png'
       # pdf.save_as("MyRails/iChad/dady/tmp1/report1.pdf")
      end
      #pdf.save_as("./dady/tmp1/report1.pdf")
      if params['dalb']!='24'
        files=fns.split(',')
        case params['dalb']
        when "2"
          Prawn::Document.generate("./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf") do 
            for x in 0..files.length-1
              #image files[x],:at => [-20,740], :width => 580, :height => 780            
              image files[x], :at =>[-40,780], :width => 580, :height => 890
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
              image files[x], :at =>[-40,820], :width => 580, :height => 930
              if x<files.length-1
                start_new_page
              end
            end
          end
        end

      else
        Prawn::Document.generate("./dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf") do 
          image fn,:at => [-20,740], :width => 580, :height => 780
        end
      end
      txt="success:" + "assets/dady/tmp1/ajml" + k.to_s + rq.to_s + sj.to_s + ".pdf"
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
  
  
  
  
  #更新卷内目录
  def update_document
    if (params['rq']=="")
      params['rq']='null'
    end
    if !(params['sxh']=="")
      if (params['sxh']==params['sxh'].to_i.to_s)
        user=User.find_by_sql("select * from document where  ownerid='#{params['ownerid']}' and sxh=#{params['sxh']} and id<>#{params['id']} ;")
        size = user.size
        if size == 0
          if params['rq']=='null'
            User.find_by_sql("update document set tm='#{params['tm']}', sxh=#{params['sxh']}, yh='#{params['yh']}', wh='#{params['wh']}', zrz='#{params['zrz']}', bz='#{params['bz']}', rq=#{params['rq']}, dh='#{params['dh']}' where id = #{params['id']};")
          else
            User.find_by_sql("update document set tm='#{params['tm']}', sxh=#{params['sxh']}, yh='#{params['yh']}', wh='#{params['wh']}', zrz='#{params['zrz']}', bz='#{params['bz']}', rq='#{params['rq']}', dh='#{params['dh']}' where id = #{params['id']};")
          end
          txt = 'success'
        else
          txt='false:此顺序号已存在，请重新输入。'
        end
      else
        txt='false:顺序号只能是数字，请重新输入。'
      end
    else
      txt='false:顺序号不能为空，请重新输入。'
    end
    render :text => txt
    

    
  end



  #新增卷内目录
  def insert_document
    if (params['rq']=="")
      #params['rq']=Time.now.strftime("%Y-%m-%d")
      params['rq']='null'
    end
    if !(params['sxh']=="")
      if (params['sxh']==params['sxh'].to_i.to_s)
        user=User.find_by_sql("select * from document where  ownerid='#{params['ownerid']}' and sxh=#{params['sxh']} ;")
        size = user.size
        if size == 0
          if params['rq']=='null'
            User.find_by_sql("insert into document(tm,sxh,yh,wh,zrz,bz,rq,dh,ownerid) values('#{params['tm']}',#{params['sxh']},'#{params['yh']}','#{params['wh']}','#{params['zrz']}','#{params['bz']}',#{params['rq']},'#{params['dh']}',#{params['ownerid']}) ")
          else
            User.find_by_sql("insert into document(tm,sxh,yh,wh,zrz,bz,rq,dh,ownerid) values('#{params['tm']}',#{params['sxh']},'#{params['yh']}','#{params['wh']}','#{params['zrz']}','#{params['bz']}','#{params['rq']}','#{params['dh']}',#{params['ownerid']}) ")
          end
          txt = 'success'
        else
          txt='false:此顺序号已存在，请重新输入。'
        end
      else
        txt='false:顺序号只能是数字，请重新输入。'
      end
    else
      txt='false:顺序号不能为空，请重新输入。'
    end
    render :text => txt
  end
  
  #新增卷内目录_模板方式
  def insert_document_model
    if !(params['dh']=="")
      if !(params['ownerid']=="")
        insert_sql=params['save_sql'].split('$')
        size = insert_sql.length
        if size > 0
          for k in 0..size-1
            save_sql=insert_sql[k].split('@')
            if save_sql[3]=='null'
              User.find_by_sql("insert into document(tm,sxh,yh,wh,zrz,rq,dh,ownerid) values('#{save_sql[2]}',#{k+1},'#{save_sql[4]}','#{save_sql[0]}','#{save_sql[1]}',#{save_sql[3]},'#{params['dh']}',#{params['ownerid']}) ")
            else
              User.find_by_sql("insert into document(tm,sxh,yh,wh,zrz,rq,dh,ownerid) values('#{save_sql[2]}',#{k+1},'#{save_sql[4]}','#{save_sql[0]}','#{save_sql[1]}','#{save_sql[3]}','#{params['dh']}',#{params['ownerid']}) ")
            end
          end
          txt = 'success'
        else
          txt='false:请选择一个或多个模板列表侢进行保存。'
        end
      else
        txt='false:请先选择一个案卷再进行卷内目录的输入。'
      end
    else
      txt='false:档号不能为空，请重新输入。'
    end
    render :text => txt
  end

  	#删除卷内目录
  def delete_document
    User.find_by_sql("delete from document  where id = #{params['id']};")
    render :text => 'Success'
  end

  #add by liu 05/25 #输档文件
  #ck_image.rb


  #add by liu 05/25 #输档文件
  
  
  def set_qzml (qzh)
    $qzml_mlh={}
    tsml = User.find_by_sql("select * from qzml_key where qzh='#{qzh}' order by id ;")
    for k in 0..tsml.size - 1 
      dd = tsml[k]
      key = "#{dd['qzh']}-#{dd['dalb']}-#{dd['mlm']}"
      $qzml_mlh[key] = dd['id']
    end
  end
  $qzml_mlh = {}
  
  def get_qzml(qzh, dalb, mlm)
    key = "#{qzh}-#{dalb}-#{mlm}"
    set_qzml(qzh)
    if $qzml_mlh[key].nil?
      user = User.find_by_sql("insert into qzml_key(qzh, dalb, mlm) values('#{qzh}','#{dalb}','#{mlm}')  RETURNING id;")
      mlh = user[0]['id']
    else 
      mlh = $qzml_mlh[key]
    end
    mlh     
  end
  
  def get_dalb(key) 
    hh = {
      "综合档案"=>0,
      "计划财务"=>2,
      "土地登记"=>3,
      "地籍管理档案"=>4,
      "用地档案"=>10,
      "信访档案"=>13,
      "监察案件档案"=>14,
      "声像档案"=>15,
      "土地复垦"=>16,
      "土地规划"=>17,
      "图件目录"=>18,
      "科技信息"=>19,
      "照片档案"=>20,
      "地质矿产档案"=>21,
      "测绘"=>23,
      "永久文档一体化"=>24,
      "短期文档一体化"=>24,
      "长期文档一体化"=>24,
      "定期-10年文档一体化"=>24,
      "定期-30年文档一体化"=>24,
      "其他档案-电子档案目录"=>25,
      "其他档案-基建档案目录"=>26,
      "其他档案-设备档案目录"=>27,
      "其他档案-实物档案目录"=>28,
      "其他档案-资料信息档案"=>29,
      "矿业权"=>35,
      "登记查解封"=>36,
      "登记勘测定界"=>39,
      "登记抵押"=>37,
      "登记抵押注解"=>38
    }
    hh[key]   
  end
  
  def upload_sdwj
    dj = params['dj']
    params['qzh'] = '10' if params['qzh'].nil?
    
    set_qzml(params['qzh'])
    
    
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
          if !/(\w+-\d+)(.*)aj/.match(line).nil?
            ss = /(\w+-\d+)(.*)aj/.match(line)
            mlm,lbmc = ss[1], ss[2]
            dalb = get_dalb(lbmc)
            puts "===== #{params['qzh']}\t#{dalb}\t#{mlm}"
            mlh = get_qzml(params['qzh'], dalb, mlm)
            User.find_by_sql("insert into q_sdwj (wjma, dh, mlh) values ('#{line.chomp!}','#{dj}', #{mlh});")  
            
            
            
            
          elsif !/(\d+)(.*)/.match(line).nil?
            mlh = /(\d+)(.*)/.match(line)[1]
            if line.include?'aj'
              User.find_by_sql("insert into q_sdwj (wjma, dh, mlh) values ('#{line.chomp!}','#{dj}', #{mlh});") 
            end
          else
            #发文，收文
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
      User.find_by_sql("insert into d_dwdm(id, dwdm, dwjc, qzsx) values (#{params['qzh']}, '#{params['dwdm']}', '#{params['dwjc']}', '#{params['qzsx']}');")
      render :text => "Success"
    else
      User.find_by_sql("update d_dwdm set dwdm='#{params['dwdm']}', dwjc='#{params['dwjc']}', qzsx='#{params['qzsx']}' where id =  #{params['qzh']};")
      render :text => "Success"
    end
  end
  
  def set_gxml
    yxwz, gxwz, qzh, password = params['yxwz'], params['gxwz'], params['qzh'], params['passwd']
    
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
      path = "#{gxwz}/#{ss}"
      puts "#{path}" 
      if File.exists?(path) and File.directory?(path) #and ss.to_i > 0 and ss.length < 4
        puts "#{path}" 
        User.find_by_sql("update q_qzxx set yxwz='#{gxwz}/#{ss}' where mlm='#{ss}' and qzh='#{qzh}';")
      end  
    end     
    render :text => 'Success'
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
    user = User.find_by_sql("select q_sdwj.id, d_dwdm.id as qzh, mlh, wjma, dh,dwdm, dwjc from q_sdwj inner join d_dwdm on q_sdwj.dh = d_dwdm.qzsx where  q_sdwj.id in (#{params['id']});")
    for k in 0..user.size-1
      dd = user[k]
      User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dd.dh} #{dd.mlh}','#{dd.mlh}', 'ruby ./dady/bin/import_tsmulu.rb  #{dd.wjma} #{dd.dwdm} #{dd.qzh} #{dd.dh} ', '', '', '未开始');")
    end  
    render :text => 'Success'
  end
  
  def get_yxwz_store
    user = User.find_by_sql("select id, yxwz, dh_prefix as dh, mlh, mlm from q_qzxx order by mlm;")
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
      qzh, dalb, mlh, dh_prefix, mlm = ss[0], ss[1], ss[2], dd.dh_prefix, dd['mlm']
      yxwz=dd.yxwz
      if !yxwz.nil? 
        User.find_by_sql("insert into q_status (dhp, mlh, cmd, fjcs, dqwz, zt) values ('#{dh_prefix}','#{mlm}', 'ruby ./dady/bin/import_tsimage.rb #{dh_prefix} #{yxwz}', '', '', '未开始');")
      end  
    end  
    render :text => 'Success'
  end
  
  
  #获得打印页面设置列表
  def  get_ym_grid
    if (params['dylx'].nil?) 
      user = User.find_by_sql("select * from  print_setup order by id;")
    else
      user = User.find_by_sql("select * from  print_setup where mbid=#{params['dylx']} order by id;")
    end
    size = user.size
    puts size
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
  
  #更新打印页面设置
  def update_ym
    set=""
    case params['bt']
    when "案卷标题"
      set=",sfkg='" + params['sfkg'] + "'"
    when "地籍号","权利人名称","土地座落","土地证号","权属性质"
      set=",sfdybt='" + params['sfdybt'] + "'"
    end
     User.find_by_sql("update print_setup set xx=#{params['xx']},yy=#{params['yy']},dx=#{params['dx']},zt='#{params['zt']}',sfdy='#{params['sfdy']}'  #{set} where id = #{params['id']};")
     txt='success'
   
   render :text => txt
  end
  
  
  
  #获得智能菜单树
  def get_zn_tree    
      text="["
      text=text+"{'text':'楼宇设置','id' :'1','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'楼层设置','id' :'2','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'房间设置','id' :'3','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'设备设置','id' :'4','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'人员设备设置','id' :'6','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'设备状态及操作','id' :'5','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'情景模式名称设置','id' :'8','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'情景模式设备操作设置','id' :'9','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'设备轮巡设置','id' :'10','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'设备能耗统计分析','id' :'11','checked':false,'leaf':true,'cls':'folder'},"
      text=text+"{'text':'设备操作日志','id' :'7','checked':false,'leaf':true,'cls':'folder'}"
      text=text + "]"
      render :text => text   
  end
  
  #获得楼宇设置列表
  def  get_zn_ly_grid
    user = User.find_by_sql("select * from  zn_ly order by id;")

    size = user.size
    puts size
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
  
  
  #新增楼宇信息
  def insert_zn_ly    
    user=User.find_by_sql("select * from zn_ly where  lymc='#{params['lymc']}';")
    size = user.size
    if size == 0
      User.find_by_sql("insert into zn_ly(lymc, lysm) values ('#{params['lymc']}', '#{params['lysm']}');")
      txt='success'
    else
      txt= 'false:楼宇名称已经存在，请重新输入楼宇名称。'
    end
    render :text => txt
  end
  
  
  #更新楼宇信息
  def update_zn_ly
    user=User.find_by_sql("select * from zn_ly where id <> #{params['id']} and lymc='#{params['lymc']}';")
    size = user.size
    if size == 0
      User.find_by_sql("update zn_ly set lymc='#{params['lymc']}', lysm='#{params['lysm']}' where id = #{params['id']};")
      txt='success'
    else
      txt= 'false:楼宇名称已经存在，请重新输入楼宇名称。'
    end
    render :text => txt
  end
  
   #删除楼宇信息
  def delete_zn_ly
    user = User.find_by_sql("delete from zn_ly where id = #{params['id']};")
    render :text => 'success'
  end
  
  #获得楼层设置列表
  def  get_zn_lc_grid
    if (params['param'].nil?) 
    
      user = User.find_by_sql("select zn_lc.*,zn_ly.lymc from  zn_lc left join zn_ly on zn_lc.ssly=zn_ly.id order by id;")

      size = user.size
      puts size
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
      user = User.find_by_sql("select zn_lc.*,zn_ly.lymc from  zn_lc left join zn_ly on zn_lc.ssly=zn_ly.id  where ssly=#{params['param']} order by id;")

      size = user.size
      puts size
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
  
  
  #新增楼层信息
  def insert_zn_lc 
    if !(params['ssly'].nil?)  
      user=User.find_by_sql("select * from zn_lc where  lcmc='#{params['lcmc']}' and ssly=#{params['ssly']};")
      size = user.size
      if size == 0
        User.find_by_sql("insert into zn_lc(lcmc, lcsm,ssly) values ('#{params['lcmc']}', '#{params['lcsm']}',#{params['ssly']});")
        txt='success'
      else
        txt= 'false:此楼宇的楼层名称已经存在，请重新输入楼层名称。'
      end
    else
      txt= 'false:所属楼宇不能为空，请重新选择楼宇名称。'
    end
    render :text => txt
  end
  
  
  #更新楼层信息
  def update_zn_lc
    user=User.find_by_sql("select * from zn_lc where id <> #{params['id']} and lcmc='#{params['lcmc']}' and ssly=#{params['ssly']};")
    size = user.size
    if size == 0
      User.find_by_sql("update zn_lc set lcmc='#{params['lcmc']}', lcsm='#{params['lcsm']}' , ssly=#{params['ssly']} where id = #{params['id']};")
      txt='success'
    else
      txt= 'false:此楼宇的楼层名称已经存在，请重新输入楼层名称。'
    end
    render :text => txt
  end
  
   #删除楼层信息
  def delete_zn_lc
    user = User.find_by_sql("delete from zn_lc where id = #{params['id']};")
    render :text => 'success'
  end
  
  #获得房间设置列表
  def  get_zn_fj_grid
    if !(params['param'].nil?)
      user = User.find_by_sql("select zn_fj.*,zn_ly.lymc,zn_lc.lcmc from  zn_fj,zn_lc,zn_ly where zn_fj.sslc=#{params['param']} and zn_fj.ssly=zn_ly.id and zn_fj.sslc=zn_lc.id order by id;")
    else
      user = User.find_by_sql("select zn_fj.*,zn_ly.lymc,zn_lc.lcmc from  zn_fj,zn_lc,zn_ly where  zn_fj.ssly=zn_ly.id and zn_fj.sslc=zn_lc.id order by id;")
    end
      size = user.size
      puts size
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
  
  
  #新增房间信息
  def insert_zn_fj 
    if !(params['sslc'].nil?)
      if !(params['ssly'].nil?)  
        user=User.find_by_sql("select * from zn_fj where  fjmc='#{params['fjmc']}' and ssly=#{params['ssly']} and sslc=#{params['sslc']};")
        size = user.size
        if size == 0
          User.find_by_sql("insert into zn_fj(fjmc, fjsm,ssly,sslc) values ('#{params['fjmc']}', '#{params['fjsm']}',#{params['ssly']},#{params['sslc']});")
          txt='success'
        else
          txt= 'false:此楼层的房间号已经存在，请重新输入房间号。'
        end
      else
        txt= 'false:所属楼宇不能为空，请重新输入楼宇。'
      end
    else
      txt= 'false:所属楼层不能为空，请重新输入楼层。'
    end
    render :text => txt
  end
  
  
  #更新房间信息
  def update_zn_fj
    user=User.find_by_sql("select * from zn_fj where id <> #{params['id']} and fjmc='#{params['fjmc']}' and ssly=#{params['ssly']} and sslc=#{params['sslc']};")
    size = user.size
    if size == 0
      User.find_by_sql("update zn_fj set fjmc='#{params['fjmc']}', fjsm='#{params['fjsm']}' , ssly=#{params['ssly']}, sslc=#{params['sslc']} where id = #{params['id']};")
      txt='success'
    else
      txt= 'false:此楼层的房间号已经存在，请重新输入房间号。'
    end
    render :text => txt
  end
  
   #删除房间信息
  def delete_zn_fj
    user = User.find_by_sql("delete from zn_fj where id = #{params['id']};")
    render :text => 'success'
  end
  
  
  #获得设备设置列表
  def  get_zn_sb_grid
    if (params['query'].nil?)
      user = User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc from  zn_fj,zn_lc,zn_ly,zn_sb where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id order by id;")

      size = user.size
      
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
      if (params['query']=="")
        txt = "{results:0,rows:[]}"
      else
        query=params['query'].split("|")
        case query.length
        when 1
          user = User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc from  zn_fj,zn_lc,zn_ly,u_sb,zn_sb where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=u_sb.sbid and u_sb.userid =#{params['userid']} and zn_sb.ssly=#{query[0]} order by id;")
        when 2
          user = User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc from  zn_fj,zn_lc,zn_ly,u_sb,zn_sb where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=u_sb.sbid and u_sb.userid =#{params['userid']} and zn_sb.ssly=#{query[0]} and zn_sb.sslc=#{query[1]} order by id;")
        when 3
          user = User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc from  zn_fj,zn_lc,zn_ly,u_sb,zn_sb where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=u_sb.sbid and u_sb.userid =#{params['userid']} and zn_sb.ssly=#{query[0]} and zn_sb.sslc=#{query[1]} and zn_sb.ssfj=#{query[2]} order by id;")
        end
        size = user.size

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
    end      
    render :text => txt
  end
  
  
  #新增设备信息
  def insert_zn_sb 
    if !(params['sslc'].nil?)
      if !(params['ssly'].nil?)  
        if !(params['ssfj'].nil?)
          if !(params['sblx'].nil?)
            user=User.find_by_sql("select * from zn_sb where  sbmc='#{params['sbmc']}' and ssly=#{params['ssly']} and sslc=#{params['sslc']}  and ssfj=#{params['ssfj']};")
            size = user.size
            if size == 0
              if (params['edgl']=='')
                params['edgl']=0
              end
              User.find_by_sql("insert into zn_sb(ktzt,sbmc, sbsm,ssly,sslc,ssfj,sbh,edgl,sblx) values ('20,20,0,0,0','#{params['sbmc']}', '#{params['sbsm']}',#{params['ssly']},#{params['sslc']},#{params['ssfj']},'#{params['sbh']}',#{params['edgl']},#{params['sblx']});")
              txt='success'
            else
              txt= 'false:设备类型不能为空，请重选择设备类型。'
            end
          else
            txt= 'false:此房间的设备名称已经存在，请重新输入设备名称。'
          end
        else
          txt= 'false:所属房间不能为空，请重新输入房间。'
        end
      else
        txt= 'false:所属楼宇不能为空，请重新输入楼宇。'
      end
    else
      txt= 'false:所属楼层不能为空，请重新输入楼层。'
    end
    render :text => txt
  end
  
  
  #更新设备信息
  def update_zn_sb
    user=User.find_by_sql("select * from zn_sb where id <> #{params['id']} and sbmc='#{params['sbmc']}' and ssly=#{params['ssly']} and sslc=#{params['sslc']} and ssfj=#{params['ssfj']};")
    size = user.size
    if size == 0
      User.find_by_sql("update zn_sb set kgls='#{params['kgls']}',ktzt='20,20,0,0,0',sbh='#{params['sbh']}',edgl=#{params['edgl']},sblx=#{params['sblx']}, sbmc='#{params['sbmc']}', sbsm='#{params['sbsm']}' , ssly=#{params['ssly']}, sslc=#{params['sslc']}  ,ssfj=#{params['ssfj']} where id = #{params['id']};")
      txt='success'
    else
      txt= 'false:此房间的设备名称已经存在，请重新输入设备名称。'
    end
    render :text => txt
  end
  
   #删除设备信息
  def delete_zn_sb
    user = User.find_by_sql("delete from zn_sb where id = #{params['id']};")
    render :text => 'success'
  end
  
  
  #控制开关
  def zn_kg_kz
      case params['cz']
    when '开'
      zt='1'
    when '关'
      zt='0'
    when '加温'
      zt='2'
    when '减温'
      zt='3'
    when '模式转换'
      zt='4'
    when '5'
      zt='关'
    else
    end
    sblx=User.find_by_sql("select * from zn_sb where id =#{params['sbid']};")
    $conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
      rq=Time.now.strftime("%Y-%m-%d %H:%M:%S")
      if params['sbh'].nil?   
        params['sbh']=""             
      end
      sbh=params['sbh'].split('.')
      
      if sblx[0]['sblx'].to_i!=3
        user=User.find_by_sql("update zn_sb set czzt='正在操作' where id =#{params['sbid']} ;")
        system("ruby ./dady/bin/zn_sb_cz_lan.rb #{params['sbh']} #{params['cz']} #{params['sbid']} &")
        for i in 0..10
          sleep 1          
          czzt = $conn.exec("select czzt from zn_sb where id =#{params['sbid']};")
          if czzt[0]['czzt']!='正在操作'
            break
          end
        end
        if czzt[0]['czzt']=='成功'
          text='success:'  +params['sbid']
        else
          text='false:设备操作失败。'
        end
      else
	      user=User.find_by_sql("update zn_sb set czzt='正在操作' where id =#{params['sbid']} ;")
          #user = User.find_by_sql("insert into zn_sb_cz_list(sbid,sbh,sbczid,sbczzl,userid) values (#{params['sbid']}, '#{params['sbh']}', #{sbcz[0]['id']},'#{sbcz[0]['czzl']}','#{params['userid']}');")  
          #if $conn.nil?
          puts "ruby ./bin/ktcz_lx.rb #{params['sbid']} #{zt}"
           system ("ruby ./bin/ktcz_lx.rb #{params['sbid']} #{zt}")
          #end
          for i in 0..10
            sleep 1          
            czzt = $conn.exec("select czzt from zn_sb where id =#{params['sbid']};")            
            if czzt[0]['czzt']!='正在操作'
              break
            end
          end
          if czzt[0]['czzt']=='成功'
            text='success:'  +params['sbid']
          else
            text='false:设备操作失败。'
          end
      end
	$conn.close
    render :text => text
  end
  
  
  #获取房间树
  def get_fj_tree
    text = []
    node, style = params["node"], params['style']   
    if node == "root"
      data = User.find_by_sql("select * from zn_ly order by id;")
      data.each do |dd|
        text << {:text => " #{dd['lymc']}", :id => dd["id"], :cls => "folder"}
      end
    else
      pars = node.split('|') || []            
        if pars.length == 1
          data = User.find_by_sql("select * from zn_lc where ssly='#{pars[0]}' order by id;")
          data.each do |dd|
            text << {:text => " #{dd['lcmc']}", :id => node+"|#{dd["id"]}", :cls => "folder"}
          end
        end
        if pars.length == 2          
          data = User.find_by_sql("select * from zn_fj where ssly='#{pars[0]}' and sslc=#{pars[1]} order by id;;")
          data.each do |dd|
              text << {:text => "#{dd['fjmc']}", :id => node+"|#{dd["id"]}", :leaf => true, :cls => "file"}
          end
        end        
    end
    render :text => text.to_json
  end
    
  #获取设备权
  def get_sb_tree
      text="["
      dalb=User.find_by_sql("select * from zn_ly order by id;")
      dalb.each do |lb|
        text=text+"{'text':'#{lb['lymc']}','id':'ly#{lb['id']}','leaf':false,'checked':false,'cls':'folder','children':["        
        dalbml=User.find_by_sql("select * from zn_lc where ssly='#{lb['id']}' order by id;")
        size=dalbml.size
        if size>0 
          dalbml.each do |lbml|
            text=text+"{'text':'#{lbml['lcmc']}','id' :'lc#{lbml['id']}','leaf':false,'checked':false,'cls':'folder','children':["
            dafj=User.find_by_sql("select * from zn_fj where ssly='#{lb['id']}' and sslc=#{lbml['id']} order by id;")
            size=dafj.size
            if size>0
              dafj.each do |fj|
                text=text+"{'text':'#{fj['fjmc']}','id' :'fj#{fj['id']}','leaf':false,'checked':false,'cls':'folder','children':["
                dasb=User.find_by_sql("select * from zn_sb where ssly='#{lb['id']}' and sslc=#{lbml['id']} and ssfj=#{fj['id']} order by id;")
                size=dasb.size
                if size>0
                  dasb.each do |sb|
                    text=text+"{'text':'#{sb['sbmc']}','id' :'#{sb['id']}','leaf':true,'checked':false,'cls':'folder'},"
                  end
                  text=text+"]},"
                else
                  text=text+"]},"
                end                               
              end
              text=text+"]},"
            else
              text=text+"]},"  
            end                                     
          end
          text=text+"]},"
       else         
         text=text+"]},"
       end
     end    
     text=text + "]"
    render :text => text
  end
    
  #获得用户设备
  def get_user_sb
    data = User.find_by_sql("select * from  u_sb where userid = '#{params['id']}' order by id;")
    text=""
    data.each do |dd|
      if text==""
        text="#{dd['sbid']}" 
      else
        text=text+"|#{dd['sbid']}" 
      end
    end
    render :text => text      
  end
  
  #获得用户设备列表
  def get_user_sb_grid
    user = User.find_by_sql("select zn_sb.*,zn_sb.id as sbid from  u_sb,zn_sb where u_sb.sbid=zn_sb.id and  userid = '#{params['id']}' order by id;")
    size = user.size
    puts size
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
  
  #获得设备操作列表
  def get_sb_cz_grid
    if !(params['sbid'].nil?)
      user = User.find_by_sql("select zn_sb_cz.*,zn_sb_cz.id as czid from  zn_sb,zn_sb_lx,zn_sb_cz where zn_sb.sblx=zn_sb_lx.id and zn_sb_lx.id=zn_sb_cz.lxid and zn_sb.id = #{params['sbid']} order by id;")
      size = user.size
      puts size
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
      user = User.find_by_sql("select zn_sb_cz.*,zn_sb_cz.id as czid from  zn_sb_cz   order by id;")
      size = user.size
      puts size
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

  #保存用户设备
  def insert_user_sb
    User.find_by_sql("delete from u_sb where userid = '#{params['userid']}';")
    ss = params['insert_qx'].split('$')
    for k in 0..ss.length-1      
      User.find_by_sql("insert into u_sb(userid, sbid) values ('#{params['userid']}', '#{ss[k]}');")        
    end
    render :text => 'success'
  end
    
  #获取设备操作日志
  def get_cz_rz_grid
    user = User.find_by_sql("select zn_cz_rz.*,zn_sb.sbmc,zn_fj.fjmc,zn_lc.lcmc,zn_ly,lymc from  zn_sb,zn_lc,zn_ly,zn_fj,zn_cz_rz where  zn_sb.id=zn_cz_rz.sbid and zn_sb.ssfj=zn_fj.id and zn_sb.sslc=zn_lc.id and zn_sb.ssly=zn_ly.id order by id;")
    size = user.size
    puts size
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
  
 
 
  #获取设备类型
  def get_zn_sb_lx_grid
    user = User.find_by_sql("select * from  zn_sb_lx order by id;")
    size = user.size
    puts size
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
  
  
  #新增情景模式
  def insert_zn_qjms
    
        if !(params['userid'].nil?)
          user=User.find_by_sql("select * from zn_qjms where  msmc='#{params['msmc']}' and userid=#{params['userid']} ;")
          size = user.size
          if size == 0
            User.find_by_sql("insert into zn_qjms(msmc, userid) values ('#{params['msmc']}', #{params['userid']});")
            txt='success'
          else
            txt= 'false:此用户的情景模式名称已经存在，请重新输入情景模式名称。'
          end
        else
          txt= 'false:所属人员不能为空，请重新输入人员。'
        end

    render :text => txt
  end
  
  
  #更新情景模式
  def update_zn_qjms
    user=User.find_by_sql("select * from zn_qjms where id <> #{params['id']} and msmc='#{params['msmc']}' and userid=#{params['userid']} ;")
    size = user.size
    if size == 0
      User.find_by_sql("update zn_qjms set  msmc='#{params['msmc']}',userid=#{params['userid']} where id = #{params['id']};")
      txt='success'
    else
      txt= 'false:此用户的情景模式名称已经存在，请重新输入情景模式名称。'
    end
    render :text => txt
  end
  
   #删除设情景模式
  def delete_zn_qjms
    user = User.find_by_sql("delete from zn_qjms where id = #{params['id']};")
    render :text => 'success'
  end


  #获得情景模式列表
   def  get_zn_qjms_grid
     if (params['query'].nil?)
       user = User.find_by_sql("select zn_qjms.*,users.username from  zn_qjms,users where  zn_qjms.userid=users.id  order by id;")

       size = user.size

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
       if (params['query']=="")
         txt = "{results:0,rows:[]}"
       else
         query=params['query']

         user = User.find_by_sql("select zn_qjms.*,users.username from  zn_qjms,users where  zn_qjms.userid=users.id and userid=#{query} order by id;")

         size = user.size

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
     end      
     render :text => txt
   end
   
   
   #获得情景模式列表
    def  get_qjms_grid
      
        if (params['query']=="")
          query=params['query']

          user = User.find_by_sql("select zn_qjms.* from  zn_qjms  order by id;")

          size = user.size

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
          query=params['query']

          user = User.find_by_sql("select zn_qjms.*,users.username from  zn_qjms,users where  zn_qjms.userid=users.id and userid=#{query} order by id;")

          size = user.size

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

   #获得情景模式设备操作列表
    def  get_zn_qjms_sb_cz_grid
      if (params['query'].nil?)
        
         txt = "{results:0,rows:[]}"  
        
      else
        if (params['query']=="")
          txt = "{results:0,rows:[]}"
        else
          query=params['query']

          user = User.find_by_sql("select zn_qjms_cz.*,zn_qjms.msmc,zn_sb.sbmc,zn_sb_cz.czsm from  zn_qjms,zn_sb,zn_sb_cz,zn_qjms_cz where  zn_qjms_cz.sbid=zn_sb.id and zn_qjms_cz.qjmsid=zn_qjms.id and zn_qjms_cz.sbczid=zn_sb_cz.id and qjmsid=#{query}  order by id;")

          size = user.size

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
      end      
      render :text => txt
    end


   #获取设备权
   def get_qjms_tree
       text="["
       
       qjms=User.find_by_sql("select * from zn_qjms where userid=#{params['userid']} order by id;")
       size=qjms.size
       if size>0
         qjms.each do |sb|
           text=text+"{'text':'#{sb['msmc']}','id' :'#{sb['id']}','checked':false,'leaf':true,'cls':'folder'},"
         end
         
       else
         text=text+"]},"
       end                               
               
      text=text + "]"
     render :text => text
   end


   #新增情景模式
   def insert_zn_qjms_sb_cz

         if !(params['qjmsid'].nil?)
           user=User.find_by_sql("select * from zn_qjms_cz where  sbid=#{params['sbid']} and qjmsid=#{params['qjmsid']} and sbczid=#{params['sbczid']};")
           size = user.size
           if size == 0
             User.find_by_sql("insert into zn_qjms_cz(sbid, qjmsid,sbczid) values (#{params['sbid']}, #{params['qjmsid']}, #{params['sbczid']});")
             txt='success'
           else
             txt= 'false:此情景模式中已经存在此操作，请重新输入设备操作。'
           end
         else
           txt= 'false:所属情景模式不能为空，请重新输入情景模式。'
         end

     render :text => txt
   end


   #更新情景模式
   def update_zn_qjms_sb_cz
     user=User.find_by_sql("select * from zn_qjms_cz where id <> #{params['id']} and sbid=#{params['sbid']} and qjmsid=#{params['qjmsid']} and sbczid=#{params['sbczid']};")
     size = user.size
     if size == 0
       User.find_by_sql("update zn_qjms_cz set  sbid='#{params['sbid']}',qjmsid=#{params['qjmsid']},sbczid=#{params['sbczid']} where id = #{params['id']};")
       txt='success'
     else
       txt= 'false:此情景模式中已经存在此操作，请重新输入设备操作。'
     end
     render :text => txt
   end

    #删除设情景模式
   def delete_zn_qjms_sb_cz
     user = User.find_by_sql("delete from zn_qjms_cz where id = #{params['id']};")
     render :text => 'success'
   end
   
   
   #删除扫描文件
  def delete_timage
    user = User.find_by_sql("delete from timage where dh = '#{params['dh']}' and yxbh='#{params['yxmc']}';")
    yxbh=params['yxmc'].split('.')
    if  yxbh[0].length==4
      if yxbh[0].to_i.to_s.rjust(4,"0")==yxbh[0]
        delimage=User.find_by_sql("select id,yxbh from timage where dh = '#{params['dh']}' and yxbh>'#{params['yxmc']}' order by yxbh;")
        for k in 0..delimage.size-1
          yxbh2=delimage[k]['yxbh'].split('.')
          if yxbh2[0].to_i.to_s.rjust(4,"0")==yxbh2[0] && yxbh2[0].length==4
            yxbh1=(yxbh[0].to_i+k.to_i).to_s.rjust(4,"0") + "." + yxbh2[1]
            User.find_by_sql("update timage set yxbh='#{yxbh1}',yxmc='#{yxbh1}' where id = #{delimage[k]['id']} ;")
          end
        end
      end
    end
    render :text => 'success'
  end
  
  def delete_all_timage
    user = User.find_by_sql("delete from timage where dh = '#{params['dh']}' ;")
    render :text => 'success'
  end
  
  #保存情景模式的操作过程
  def insert_zn_sb_cz
    if !(params['qjms_id'].nil?)    #保存情景模式里面的设备操作
      user = User.find_by_sql("select *  from zn_qjms_cz where qjmsid = #{params['qjms_id']};")
      size=user.size
      if size==0
        txt= 'false:此情景模式中没有任何设备的操作，请重新输入设备操作。'
      else
        for k in 0..user.size-1
          sb=User.find_by_sql("select *  from zn_sb where id = #{user[k]['sbid']};")
          sb_cz=User.find_by_sql("select *  from zn_sb_cz where id = #{user[k]['sbczid']};")
          us=User.find_by_sql("select *  from zn_qjms where id = #{params['qjms_id']};")
          qjms_cz= User.find_by_sql("insert into zn_sb_cz_list(sbid,sbh,sbczid,sbczzl,userid) values (#{user[k]['sbid']}, '#{sb[0]['sbh']}', #{user[k]['sbczid']},'#{sb_cz[0]['czzl']}',#{us[0]['userid']});")
        end
        txt='success'
      end
    else
      if !(params['sb_id'].nil?)    #保存直接进行的设备操作
      else
      end
    end
    render :text =>txt
  end
  
  
  #获得设备轮巡操作列表
    def  get_sb_nx_grid
      
        if (params['query']=="")
          txt = "{results:0,rows:[]}"
        else
          query=params['query']

          user = User.find_by_sql("select zn_nx.*,zn_sb.sbmc,zn_sb_cz.czsm from  zn_sb,zn_sb_cz,zn_nx where  zn_nx.sbid=zn_sb.id and  zn_nx.czid=zn_sb_cz.id  order by id;")

          size = user.size

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


    #新增轮巡
    def insert_sb_nx

          
            user=User.find_by_sql("select * from zn_nx where  sbid=#{params['sbid']}  and czid=#{params['sbczid']};")
            size = user.size
            if size == 0
              User.find_by_sql("insert into zn_nx(sbid,czid,nxdj) values (#{params['sbid']}, #{params['sbczid']},#{params['nxdj']});")
              txt='success'
            else
              txt= 'false:此情景模式中已经存在此操作，请重新输入设备操作。'
            end
          

      render :text => txt
    end


    #更新轮巡
    def update_sb_nx
      user=User.find_by_sql("select * from zn_nx where id <> #{params['id']} and sbid=#{params['sbid']}  and czid=#{params['sbczid']};")
      size = user.size
      if size == 0
        User.find_by_sql("update zn_nx set  nxdj=#{params['nxdj']},sbid='#{params['sbid']}',czid=#{params['sbczid']} where id = #{params['id']};")
        txt='success'
      else
        txt= 'false:轮巡中已经存在此操作，请重新输入设备操作。'
      end
      render :text => txt
    end

     #删除轮巡
    def delete_sb_nx
      user = User.find_by_sql("delete from zn_nx where id = #{params['id']};")
      render :text => 'success'
    end
    
    
    #统计功率
    def get_sb_gl_tj_grid
      qrqs=params['qrq'].split('-')
      qrq=qrqs[0].to_s + qrqs[1].to_s + qrqs[2].to_s + "000000"
      
      zrqs=params['zrq'].split('-')
      zrq=zrqs[0].to_s + zrqs[1].to_s + zrqs[2].to_s + "235959"
      user=User.find_by_sql("select distinct sbid from zn_cz_rz,zn_sb_cz where zn_cz_rz.czid=zn_sb_cz.id and zn_sb_cz.czsm='读取电流' and zn_cz_rz.sj > '#{qrq}' and zn_cz_rz.sj<'#{zrq}' and zn_cz_rz.userid=0   ;")
      size = user.size
      sb_id=[]
      gl_tj=[]
      zsj_tj=[]
      edgl=[]
      sbs=""
      gls=0
      if size > 0 
        txt = "{results:#{size},rows:["
        for k in 0..user.size-1
           #txt = txt + user[k].to_json + ','
          gl=User.find_by_sql("select zn_cz_rz.*,zn_sb.edgl from zn_sb,zn_cz_rz,zn_sb_cz where zn_cz_rz.sbid=zn_sb.id and zn_cz_rz.czid=zn_sb_cz.id and zn_sb_cz.czsm='读取电流' and zn_cz_rz.sj > '#{qrq}' and zn_cz_rz.sj<'#{zrq}' and zn_cz_rz.userid=0 and zn_cz_rz.sbid=#{user[k]['sbid']} order by sj ;")
          size=gl.size
          if size>0
            gltj=0
            sj=0
            dlz=0
            jgsj=0
            zsj=0
            edgls=0
            for j in 0..gl.size-1
              if gl[j]['dlz']==""
                gl[j]['dlz']=0
              end
              if gl[j]['dlz'].to_f>0
                if dlz.to_f>0
                  jgsj=gl[j]['sj'].to_i-sj.to_i
                  gltj=((gl[j]['dlz'].to_f*220)*jgsj.to_f)/3600+gltj.to_f
                  zsj=jgsj.to_i+zsj.to_i
                end
                dlz=gl[j]['dlz']
                sj=gl[j]['sj']
              else
                dlz=0
                sj=0
              end              
            end
            
          end
          
          
            sb_id<<user[k]['sbid']
            gl_tj<<gltj
            zsj=zsj/3600.to_f
            zsj_tj<<zsj
            if sbs==""
              sbs=user[k]['sbid']
            else
              sbs=sbs + "," + user[k]['sbid']
            end
            puts  gl[0]['edgl']
            puts gl[0]['edgl']==''
            if gl[0]['edgl']==''
              edgl<<0
            else
              edgl<<gl[0]['edgl'].to_f*10
            end
          
        end
        if sbs!=""
          case params['tjzl']
          when "按设备"
            for xx in 0..sb_id.length-1
              sb=User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc from  zn_fj,zn_lc,zn_ly,zn_sb where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=#{sb_id[xx]} order by id;")
              size=sb.size
              if size>0            
                txt=txt + "{'edgl':'#{edgl[xx].to_i}','zsj':'#{zsj_tj[xx]}','sbmc':'#{sb[0]['sbmc']}','id':'#{sb[0]['id']}','fjmc':'#{sb[0]['fjmc']}','lcmc':'#{sb[0]['lcmc']}','lymc':'#{sb[0]['lymc']}','shgl':'#{gl_tj[xx].to_i}'},"
              end
            end
          when "按设备类型"  
            users=User.find_by_sql("select * from zn_sb_lx order by id;")
            for yy in 0..users.size-1
              sssb=User.find_by_sql("select zn_sb.* from zn_sb_lx,zn_sb where zn_sb_lx.id=zn_sb.sblx and zn_sb.id in (#{sbs}) and zn_sb.sblx=#{users[yy]['id']} order by id;")
              
              
              sbid = []
              for k in 0..sb_id.size-1 do 
                sbid << sb_id[k].to_i
              end
              sb_id = sbid  
              
              for zz in 0..sssb.size-1
                puts sssb[zz]['id']
                puts sb_id
                puts sb_id.include?(sssb[zz]['id'])
                puts sbs
                #sb_id=[3,4]
                if sb_id.include?sssb[zz]['id']
                  i=sb_id.index sssb[zz]['id']
                  gls=gls+gl_tj[i].to_f 
                  edgls=edgls+edgl[i].to_f              
                end
              end
              txt=txt + "{'sbmc':'#{users[yy]['lxsm']}','shgl':'#{gls.to_i}','edgl':'#{edgls.to_i}'},"
              gls=0
              edgls=0
            end  
          when "按人员"
            users=User.find_by_sql("select * from users order by id;")
            for yy in 0..users.size-1
              sssb=User.find_by_sql("select u_sb.* from users,u_sb where users.id=u_sb.userid and u_sb.sbid in (#{sbs}) and u_sb.userid=#{users[yy]['id']} order by id;")
              for zz in 0..sssb.size-1
                puts sssb[zz]['sbid']
                puts sb_id
                puts sb_id.include?(sssb[zz]['sbid'])
                puts sbs
                if sb_id.include?sssb[zz]['sbid']
                  i=sb_id.index sssb[zz]['sbid']
                  gls=gls+gl_tj[i].to_f 
                  edgls=edgls+edgl[i].to_f               
                end
              end
              txt=txt + "{'sbmc':'#{users[yy]['username']}','shgl':'#{gls.to_i}','edgl':'#{edgls.to_i}'},"
              gls=0
              edgls=0
            end                                    
     
          else       
          end
        end
        txt = txt + "]}"
      else
        txt = "{results:0,rows:[]}"  
      end
      render :text => txt
    end
    
    #获取功率柱状图
    def get_sb_gl_tj_zz_grid
      #txt="[{'name':'1','data1':'11'},{'name':'2','data1':'12'}]"
      qrqs=params['qrq'].split('-')
      qrq=qrqs[0].to_s + qrqs[1].to_s + qrqs[2].to_s + "000000"
      
      zrqs=params['zrq'].split('-')
      zrq=zrqs[0].to_s + zrqs[1].to_s + zrqs[2].to_s + "235959"
      txt="["
          gl=User.find_by_sql("select zn_cz_rz.* from zn_cz_rz,zn_sb_cz where zn_cz_rz.czid=zn_sb_cz.id and zn_sb_cz.czsm='读取电流' and zn_cz_rz.sj > '#{qrq}' and zn_cz_rz.sj<'#{zrq}' and zn_cz_rz.userid=0 and zn_cz_rz.sbid=#{params['sbid']} order by sj ;")
          size=gl.size
          if size>0
            gltj=0
            sj=0
            dlz=0
            jgsj=0
            zsj=0
            xs=""
            for j in 0..gl.size-1
              puts gl[j]['sj']
              puts xs==gl[j]['sj'][0,10]
              if xs==gl[j]['sj'][0,10]
                if gl[j]['dlz']==""
                  gl[j]['dlz']=0
                end
                if gl[j]['dlz'].to_f>0
                  if dlz.to_f>0
                    jgsj=gl[j]['sj'].to_i-sj.to_i
                    gltj=((gl[j]['dlz'].to_f*220)*jgsj.to_f)/3600+gltj.to_f
                    zsj=jgsj.to_i+zsj.to_i
                  end
                  dlz=gl[j]['dlz']
                  sj=gl[j]['sj']
                else
                  dlz=0
                  sj=0
                end
              else
                if xs!=""
                  txt=txt+ "{'name':'#{xs}','data1':'#{gltj}'},"
                end
                gltj=0
                xs=gl[j]['sj'][0,10]
                if gl[j]['dlz']==""
                  gl[j]['dlz']=0
                end
                if gl[j]['dlz'].to_f>0
                  if dlz.to_f>0
                    jgsj=gl[j]['sj'].to_i-sj.to_i
                    gltj=((gl[j]['dlz'].to_f*220)*jgsj.to_f)/3600+gltj.to_f
                    zsj=jgsj.to_i+zsj.to_i
                  end
                  dlz=gl[j]['dlz']
                  sj=gl[j]['sj']
                else
                  dlz=0
                  sj=0
                end 
              end             
            end
            txt=txt+ "{'name':'#{xs}','data1':'#{gltj}'},"
            txt=txt+ "]"
          else
            txt="[{}]"
          end
          
        
      
      render :text => txt
    end


    def get_sb_gl_dj_zz_grid
      #txt="[{'name':'1','data1':'11'},{'name':'2','data1':'12'}]"
      case params['tjzl']
        when "按设备"
          txt="["
            sb=User.find_by_sql("select distinct sbid from  zn_nh where rq>='#{params['qrq']}' and rq<='#{params['zrq']}';")
            size=sb.size
            for k in 0..size-1
              sbname=User.find_by_sql("select  * from  zn_sb where id = #{sb[k]['sbid']}  ;")
              nh=User.find_by_sql("select sum(ednh) as ednh,sum(sjnh) as sjnh from  zn_nh  where sbid=#{sb[k]['sbid']};")
              gl=((nh[0]['ednh'].to_f-nh[0]['sjnh'].to_f)*0.785).to_i
              txt=txt+ "{'name':'#{sbname[0]['sbmc']}','data1':'#{nh[0]['ednh']}','data2':'#{nh[0]['sjnh']}','data3':'#{gl}'},"
            end
          txt=txt+ "]"  
        when "按房间"
          txt="["
            sb=User.find_by_sql("select * from  zn_fj where id in (7,8,9,10) ;")
            size=sb.size
            for k in 0..size-1
              
              nh=User.find_by_sql("select sum(ednh) as ednh,sum(sjnh) as sjnh from zn_nh,zn_fj,zn_sb where zn_nh.sbid=zn_sb.id and zn_sb.ssfj=zn_fj.id and  zn_fj.id=#{sb[k]['id']} and rq>='#{params['qrq']}' and rq<='#{params['zrq']}';")
              gl=((nh[0]['ednh'].to_f-nh[0]['sjnh'].to_f)*0.785).to_i
              txt=txt+ "{'name':'#{sb[k]['fjmc']}','data1':'#{nh[0]['ednh']}','data2':'#{nh[0]['sjnh']}','data3':'#{gl}'},"
            end
          txt=txt+ "]"
        when "按设备类型"
          txt="["
            sb=User.find_by_sql("select * from  zn_sb_lx where id in (1,2,3) ;")
            size=sb.size
            for k in 0..size-1

              nh=User.find_by_sql("select sum(ednh) as ednh,sum(sjnh) as sjnh from zn_nh,zn_sb_lx,zn_sb where zn_nh.sbid=zn_sb.id and zn_sb.sblx=zn_sb_lx.id and  zn_sb_lx.id=#{sb[k]['id']} and rq>='#{params['qrq']}' and rq<='#{params['zrq']}';")
              gl=((nh[0]['ednh'].to_f-nh[0]['sjnh'].to_f)*0.785).to_i
              txt=txt+ "{'name':'#{sb[k]['lxsm']}','data1':'#{nh[0]['ednh']}','data2':'#{nh[0]['sjnh']}','data3':'#{gl}'},"
            end
          txt=txt+ "]"
        when "按楼层"
          txt="["
            sb=User.find_by_sql("select * from  zn_lc where id in (5) ;")
            size=sb.size
            for k in 0..size-1

              nh=User.find_by_sql("select sum(ednh) as ednh,sum(sjnh) as sjnh from zn_nh,zn_lc,zn_sb where zn_nh.sbid=zn_sb.id and zn_sb.sslc=zn_lc.id and  zn_lc.id=#{sb[k]['id']} and rq>='#{params['qrq']}' and rq<='#{params['zrq']}';")
              gl=((nh[0]['ednh'].to_f-nh[0]['sjnh'].to_f)*0.785).to_i
              txt=txt+ "{'name':'#{sb[k]['lcmc']}','data1':'#{nh[0]['ednh']}','data2':'#{nh[0]['sjnh']}','data3':'#{gl}'},"
            end
          txt=txt+ "]"
      end
      #  name=[]
      #  gl="3,10".split(',')
      #  gl[2]=((gl[1].to_f-gl[0].to_f)*0.785).to_i
      #  name[0]="实耗功"
      #  name[1]="额定功"
      #  name[2]="减少碳排"
      #  txt="["
      #  for k in 0..2
      #      txt=txt+ "{'name':'#{name[k]}','data1':'#{gl[k]}','data2':'#{gl[k]}','data3':'#{gl[k]}'},"
      #  end    
      #  txt=txt+ "]"
        render :text => txt
    end


    #获取设备开关次数
    def get_sb_kg_tj_grid
      qrqs=params['qrq'].split('-')
      qrq=qrqs[0].to_s + qrqs[1].to_s + qrqs[2].to_s + "000000"
      
      zrqs=params['zrq'].split('-')
      zrq=zrqs[0].to_s + zrqs[1].to_s + zrqs[2].to_s + "235959"
      user=User.find_by_sql("select distinct sbid from zn_cz_rz,zn_sb_cz where zn_cz_rz.czid=zn_sb_cz.id and zn_sb_cz.czsm='开' and zn_cz_rz.sj > '#{qrq}' and zn_cz_rz.sj<'#{zrq}'    ;")
      size = user.size

      if size > 0 
        txt = "{results:#{size},rows:["
        for k in 0..user.size-1
           #txt = txt + user[k].to_json + ','
          gl=User.find_by_sql("select zn_cz_rz.* from zn_cz_rz,zn_sb_cz where zn_cz_rz.czid=zn_sb_cz.id and zn_sb_cz.czsm='开' and zn_cz_rz.sj > '#{qrq}' and zn_cz_rz.sj<'#{zrq}'  and zn_cz_rz.sbid=#{user[k]['sbid']} order by sj ;")
          size=gl.size          
          sb=User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc from  zn_fj,zn_lc,zn_ly,zn_sb where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=#{user[k]['sbid']} order by id;")
          size=sb.size
          txt=txt + "{'kgcs':'#{gl.size}','sbmc':'#{sb[0]['sbmc']}','id':'#{sb[0]['id']}','fjmc':'#{sb[0]['fjmc']}','lcmc':'#{sb[0]['lcmc']}','lymc':'#{sb[0]['lymc']}'},"
        end
        txt = txt + "]}"
      else
        txt = "{results:0,rows:[]}"  
      end
      render :text => txt
    end
    
    
    def get_sb_byid
      user = User.find_by_sql("select * from zn_sb where  id  in (#{params['sbid']}) order by id;")
      user = User.find_by_sql("select * from zn_sb  order by id;")
      size = user.size
      if size > 0 
       txt = "{["
       for k in 0..user.size-1
         txt = txt + user[k].to_json + ','
       end
       txt = txt[0..-2] + "]}"
      else
       txt = "{[]}"  
      end
      render :text => txt
    end

    #获取设备操作状态
    def get_sb_zt
      user = User.find_by_sql("select * from zn_sb where  id  in (#{params['sbid']}) and czzt='成功' order by id;")
      sbid=params['sbid'].split(',')
      if user.size==sbid.size
        txt='success'
      else
        sbzt = User.find_by_sql("select * from zn_sb where  id  in (#{params['sbid']})  order by id;")
        txt='false:'
        for k in 0..sbzt.size-1
          txt = txt +'<p>'+ sbzt[k]['sbmc'] +'...' + sbzt[k]['czzt'] + '</p>'
        end
      end
        
      
      render :text => txt
    end
    
    #设定空调当前状态
    def update_ktjz
      if !(params['kg'].nil?) 
        if (params['kg'].to_i.to_s==params['kg']) 
          if !(params['ktms'].nil?) 
            if (params['ktms'].to_i.to_s==params['ktms']) 
              if (params['sw'].to_i.to_s==params['sw']) 
                if (params['kw'].to_i.to_s==params['kw']) 
                  ktzt=params['sw']+','+params['kw']+','+params['ktms']+','+params['kg']+',0'
                  User.find_by_sql("update zn_sb set  ktzt='#{ktzt}' where id = #{params['id']};")
                  txt='success'
                else
                  txt='false:空调温度必须是整形数字，请重新输入。'
                end
              else
                txt='false:室内温度必须是整形数字，请重新输入。'
              end              
            else
              txt='false:空调模式有问题，请重新选择。'
            end
          else
            txt='false:空调模式不能为空，请重新选择。'
          end
        else
          txt='false:开关状态有问题，请重新选择。'
        end
      else
        txt='false:开关状态不能为空，请重新选择。'
      end
      render :text => txt
    end
 
    #获取专项借阅列表
    def get_zxjy
      user = User.find_by_sql("select * from jy_zxjy  order by id;")
      size = user.size
      if size > 0 
       txt = "{results:#{size},rows:["
       for k in 0..user.size-1
         txt = txt + user[k].to_json + ','
       end
       txt = txt[0..-2] + "]}"
      else
       txt = "{results:#{size},rows:[]}"
      end
      render :text => txt
    end
    
    # 插入专项借阅列表
    def insert_zxjy
      if  (params['tm'].nil?) && (params['ajtm'].nil?) && (params['wh'].nil?)
        render :text => "false"
      else
        tm, ajtm, wh = params['tm'], params['ajtm'], params['wh']
        request_id = rand(36**32).to_s(36);
        User.find_by_sql("insert into jy_zxjy (request_id, zt, tm, ajtm, wh) values ('#{request_id}','查找中', '#{tm}', '#{ajtm}', '#{wh}');")
        render :text => "success"        
      end
    end
    
    #获取专项借阅查询列表
    def get_zxjydjlist
      
    end
    
    def get_timage_tree
      text="["
       bh=''
       qjms=User.find_by_sql("select id,dh,yxbh from timage where dh='#{params['dh']}' order by id;")
       size=qjms.size
       if size>0
         qjms.each do |sb|
           
            bh=sb['yxbh'].split('.')
            if sb['yxbh'].include?('ML')
              yxbh='卷内第' +bh[0]+ '页'
            else
              yxbh='正文第' +bh[0]+ '页'
            end
            #yxbh='正文第'　+ bh[0] + '页'
           text=text+"{'text':'#{yxbh}','id' :'#{sb['id']}','checked':false,'leaf':true,'cls':'folder'},"
         end   
       end                               
               
      text=text + "]"
     render :text => text
    end


    def insert_zxjylist
        imageids=params['imageids'].split('$');
        User.find_by_sql("delete from jy_zxjylist;")
        User.find_by_sql("update  jy_zxjy set zt='完成' where id=#{params['zxjyid']};")
        for k in 0..imageids.size-1          
          User.find_by_sql("insert into jy_zxjylist (image_id,zxjyid) values ( #{imageids[k]},#{params['zxjyid']});")
        end
        render :text => "success"        
    end
    
    
    def delete_zxjy

        User.find_by_sql("delete from jy_zxjy;")

        render :text => "success"        
    end
    
    
    #add on 6/26
    def get_archive_where1
      tm, ajtm, wh = params['tm'], params['ajtm'], params['wh']
      request_id = rand(36**32).to_s(36);
      User.find_by_sql("insert into jy_zxjy (request_id, zt, tm, ajtm, wh) values ('#{request_id}','查找中', '#{tm}', '#{ajtm}', '#{wh}');")
      render :text => request_id
    end

    def check_result
      request_id = params['request_id']
      users = User.find_by_sql("select id, zt from jy_zxjy where request_id='#{request_id}';")
      txt=""
      if users[0] == "完成" 
        users = User.find_by_sql("select dh, image_id from  jy_zxjylist where zxjyid=#{users[0].id}")
        txt = users.to_json
      elsif users[0].zt == "未找到"
        txt = "未找到档案,请重新查询."
      elsif users[0].zt == "查找中"
        txt = "查找中"
      end
      render :text => txt;
    end
    


    #获得卷内输档模板树
    def get_jr_model_tree
      
     node, style = params["node"], params['style']
     text="["
     jslb=["题名","责任者","文号"]
     
     if node == "root"
       for k in 0..2       
         text=text+"{'text':'#{jslb[k]}','id' :'#{jslb[k]}-#{k}','leaf':false,'checked':false,'cls':'folder','children':["
         data = User.find_by_sql("select * from  jr_model where lx='#{jslb[k]}' order by id;")
         size=data.size
         if size>0

           data.each do |dd|
             text=text+"{'text':'#{dd['name']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
           end

         end
         text=text + "]}," 
       end
       
     end
     text=text+"]"
     render :text => text
    end

    #add by liujun on July 14
    def get_q_status_tree
      text = []
      node = params["node"]
      
      if node == "root"
        data = User.find_by_sql("select distinct qzh from q_qzxx order by qzh;")
        data.each do |dd|
          text << {:text => "全宗 #{dd['qzh']}", :id => dd["qzh"], :cls => "folder"}
        end
      else 
        pars = node.split('|') || []
        puts params["lb"]
        puts params["lb"]=='1'
        if params["lb"]=='1'
          if pars.count == 1          
            data = User.find_by_sql("select dh_prefix, dalb, mlh, cast(mlm as integer) from q_qzxx where qzh=#{pars[0]} and dalb<>'24'   order by mlm;")
            #data = User.find_by_sql("select dh_prefix, dalb, mlh, mlm from q_qzxx where qzh=#{pars[0]}  order by mlh;")
            data.each do |dd|
              text << {:text => "目录 #{dd['mlm']}", :id => node+"|#{dd["dh_prefix"]}|#{dd["dalb"]}|#{dd['mlh']}", :leaf => true, :cls => "file"}
            end  
            data = User.find_by_sql("select dh_prefix, dalb, mlh, mlm  from q_qzxx where qzh=#{pars[0]} and dalb='24'   order by mlm;")
            #data = User.find_by_sql("select dh_prefix, dalb, mlh, mlm from q_qzxx where qzh=#{pars[0]}  order by mlh;")
            data.each do |dd|
              text << {:text => "目录 #{dd['mlm']}", :id => node+"|#{dd["dh_prefix"]}|#{dd["dalb"]}|#{dd['mlh']}", :leaf => true, :cls => "file"}
            end        
          else        
            if pars[1] == '未统计' 
              data = User.find_by_sql("select dh_prefix, dalb, mlh, mlm from q_qzxx where qzh=#{pars[0]} and (zt='' or zt is null) order by mlm;")
            else
              data = User.find_by_sql("select dh_prefix, dalb, mlh, mlm from q_qzxx where qzh=#{pars[0]} and zt='#{pars[1]}' order by mlm;")
            end

            data.each do |dd|
                text << {:text => "目录 #{dd['mlm']}", :id => node+"|#{dd["dh_prefix"]}|#{dd["dalb"]}|#{dd['mlh']}", :leaf => true, :cls => "file"}
            end                
          end 
        else
          if pars.count == 1          
            data = User.find_by_sql("select zt, count(*) from q_qzxx where qzh=#{pars[0]} group by zt order by zt;")
            data.each do |dd|
              dd['zt'] = "未统计" if dd['zt'].nil? || dd['zt'] == ""
              text << {:text => "#{dd['zt']} (#{dd['count']})", :id => node+"|#{dd["zt"]}" , :cls => "folder"}
            end          
          else        
            if pars[1] == '未统计' 
              data = User.find_by_sql("select dh_prefix, dalb, mlh, mlm from q_qzxx where qzh=#{pars[0]} and (zt='' or zt is null) order by mlm;")
            else
              data = User.find_by_sql("select dh_prefix, dalb, mlh, mlm from q_qzxx where qzh=#{pars[0]} and zt='#{pars[1]}' order by mlm;")
            end

            data.each do |dd|
                text << {:text => "目录 #{dd['mlm']}", :id => node+"|#{dd["dh_prefix"]}|#{dd["dalb"]}|#{dd['mlh']}", :leaf => true, :cls => "file"}
            end                
          end
        end       
      end  
      render :text => text.to_json
      
    end
    
    
    def set_qzxx_selected
      zt = params['zt']
      if zt == '著录' || zt == '归档' 
        user = User.find_by_sql("update q_qzxx set zt='#{zt}' where id in (#{params['id']});")
      end  
      render :text => 'Success'
    end
    
    def get_yx_tree
      dh = params['dh']
      text = []
      node = params["node"]
      if dh!=""
        
        if node == "root"
          system("ruby ./dady/bin/prepare_timage.rb #{params['dh']} &")
        
          data = User.find_by_sql("select id, yxbh, yxmc, tag from timage where dh='#{params['dh']}' order by tag, yxbh;")
        
          data.each do |dd|
          
           # nodeText = ''
           # case dd['tag'].to_i
           # when 0
           #   if dd['yxbh'].include?"ML"
           #     nodeText = '封面'
           #   else 
           #     nodeText = '旧封'
           #   end     
           # when 1
           #   if dd['yxbh'].include?"ML"
           #     nodeText = '卷内' + dd['yxbh'][2..3]
           #   else 
           #     nodeText = '旧卷' + dd['yxbh'][2..3]
           #   end           
           # when 2
             
                if (dd['yxbh'].upcase.include?'JPG') || (dd['yxbh'].upcase.include?'TIF') || (dd['yxbh'].upcase.include?'TIFF') || (dd['yxbh'].upcase.include?'JPEG') 
                  nodeText = '影像' + dd['yxbh'][0..3]
                else
                  nodeText =  dd['yxbh']
                end
           # when 3
           #   if dd['yxbh'].include?"ML"
           #     nodeText = '备考'
           #   else 
           #     nodeText = '旧备'
           #   end              
           # end
            text << {:text => nodeText, :id => "#{dd['id']}|#{dd['yxmc']}|#{dd['tag']}",:checked=>false, :leaf => true, :cls => "file"}
          end
          text=text.to_json
          text="[{'text':'影像文件列表','id' :'root1','leaf':false,'checked':false,'expanded':true,'cls':'folder','children':" + text + "}]"
        end
      end
      
      render :text => text
    end


    #获得卷内输档模板列表
    def  get_jr_modellist_grid
      if (params['query'].nil?)        
         txt = "{results:0,rows:[]}"          
      else
        if (params['query']=="")
          txt = "{results:0,rows:[]}"
        else          
          user = User.find_by_sql("select * from jr_model_list where modelid=#{params['query']} order by id;")
          
          size = user.size

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
      end      
      render :text => txt
    end

    #获得卷内输档模板列表
    def  get_jr_model_tm_grid              
          user = User.find_by_sql("select * from jr_model where lx='题名' order by id;")          
          size = user.size
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

    def  get_jr_model_wh_grid
      user = User.find_by_sql("select * from jr_model where lx='文号' order by id;")          
      size = user.size
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

    def  get_jr_model_zrz_grid
      user = User.find_by_sql("select * from jr_model where lx='责任者' order by id;")          
      size = user.size
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


    def insert_jr_model   
       user=User.find_by_sql("select * from jr_model where  name='#{params['name']}';")
       size = user.size
       if size == 0
         User.find_by_sql("insert into jr_model ( name, lx) values ('#{params['name']}', '#{params['lx']}');")
         txt='success'
       else
         txt= 'false:模板名称已经存在，请重新输入。'
       end
       render :text => txt    
      
    end
    
    def update_jr_model
      user=User.find_by_sql("select * from jr_model where id <> #{params['id']} and name='#{params['name']}';")
      size = user.size
      if size == 0
        User.find_by_sql("update jr_model set name='#{params['name']}' where id='#{params['id']}';")
        txt='success'
      else
        txt= 'false:模板名称已经存在，请重新输入。'
      end
      render :text => txt      
    end
  
    def delete_jr_model
      User.find_by_sql("delete from jr_model  where id='#{params['id']}';")
      render :text => "success"
    end

    def insert_jr_model_list
      user=User.find_by_sql("select * from jr_model_list where  name='#{params['name']}' and modelid='#{params['modelid']}';")
       size = user.size
       if size == 0
         User.find_by_sql("insert into jr_model_list ( name, modelid) values ('#{params['name']}', '#{params['modelid']}');")
         txt='success'
       else
         txt= 'false:模板列表名称已经存在，请重新输入。'
       end
       render :text => txt
    end


    def update_jr_model_list
      user=User.find_by_sql("select * from jr_model_list where id <> #{params['id']} and name='#{params['name']}' and modelid='#{params['modelid']}';")
      size = user.size
      if size == 0
        User.find_by_sql("update jr_model_list set name='#{params['name']}' where id='#{params['id']}';")
        txt='success'
      else
        txt= 'false:模板列表名称已经存在，请重新输入。'
      end
      render :text => txt      
    end
    
    
    def delete_jr_modellist
      User.find_by_sql("delete from jr_model_list  where id='#{params['id']}';")
      render :text => "success"
    end
    
    
    #根据dh 获得最大顺序号
    def get_max_sxh
        ajh= User.find_by_sql("select max(sxh) from document where dh =  '#{params['dh']}';")
        size=ajh.size;
        txt=ajh[0]["max"].to_i+1;         
        render :text => txt
    end
    
    
    #获得文书处理菜单树
    def get_ws_tree
      node=params['node']
      userid=params['userid']
      if node == "root"
        if userid!="" 
          qzid=get_qz_userid(params['userid'])
          data = User.find_by_sql("sELECT * FROM d_dwdm where d_dwdm.id in (#{qzid}) order by id;")
          text="["
          data.each do |dd|
            text=text + "{'text':'#{dd['id']}#{dd['dwdm']}','id' :'#{dd["id"]}','leaf':false,'cls':'folder'},"
          end
          text=text +"]"          
        end
      else
        pars = node.split('_') || []
        if pars.length == 1      
          text="["
          text=text+"{'text':'文书处理录入','id' :'#{pars[0]}_24','leaf':false,'cls':'folder'},"
          text=text+"{'text':'收文登记','id' :'#{pars[0]}_2','leaf':true,'cls':'folder'},"
          text=text+"{'text':'发文登记','id' :'#{pars[0]}_3','leaf':true,'cls':'folder'},"
          text=text+"{'text':'内部资料登记','id' :'#{pars[0]}_4','leaf':true,'cls':'folder'},"
          text=text+"{'text':'文书处理档案管理','id' :'#{pars[0]}_6','leaf':true,'cls':'folder'},"
          text=text+"{'text':'机构问题设置','id' :'#{pars[0]}_5','leaf':true,'cls':'folder'}"
          text=text + "]"
        else
          txt=[]  
          text=""
          data = User.find_by_sql("select distinct a_wsda.nd,a_wsda.bgqx,a_wsda.jgwth from a_wsda,archive where a_wsda.ownerid=archive.id and archive.qzh='#{pars[0]}' order by a_wsda.nd DESC,a_wsda.bgqx,a_wsda.jgwth DESC;")
          data.each do |dd|
            txt << {:text => "#{dd['nd']}_#{dd['bgqx']}_#{dd['jgwth']}", :id => node+"_#{dd['nd']}_#{dd['bgqx']}_#{dd['jgwth']}", :leaf => true, :cls => "file"}
          end
          text=''
        end
      end
      if text=="" 
        render :text => txt.to_json
      else
        render :text => text
      end 
    end
    
    #获取收发文、内部资料列表
    def get_doc_grid
      pars = params['query'].split('_')
      case pars[1]
      when "2"

        count = User.find_by_sql("select count(*) from doc_sw where qzh='#{pars[0]}' ;") 
        user = User.find_by_sql("select * from doc_sw where qzh='#{pars[0]}' order by id limit #{params['limit']} offset #{params['start']};") 
      when "3"
        count = User.find_by_sql("select count(*) from doc_fw where qzh='#{pars[0]}' ;") 
        user = User.find_by_sql("select * from doc_fw where qzh='#{pars[0]}' order by id limit #{params['limit']} offset #{params['start']};")
      when "4"
        count = User.find_by_sql("select count(*) from doc_lb where qzh='#{pars[0]}' ;") 
        user = User.find_by_sql("select * from doc_lb where qzh='#{pars[0]}' order by id limit #{params['limit']} offset #{params['start']};")
      end
      size = user.size
      if size > 0 
       txt = "{results:#{count[0]['count']},rows:["

       for k in 0..user.size-1
         txt = txt + user[k].to_json + ','
       end
       txt = txt[0..-2] + "]}"
      else
       txt = "{results:0,rows:[]}"  
      end   
      render :text => txt
    end


    def update_doc_swdj
      if (params['fs']=="")
        params['fs']=0       
      end
      if (params['ys']=="")
        params['ys']=0       
      end
      if (params['zcfs']=="")
        params['zcfs']=0       
      end
      if (params['qtfs']=="")
        params['qtfs']=0       
      end
      if (params['xhfs']=="")
        params['xhfs']=0       
      end
      strupdatesql="bgqx='#{params['bgqx']}',swbh='#{params['swbh']}',lwjg='#{params['lwjg']}',wh='#{params['wh']}',mj='#{params['mj']}',tm='#{params['tm']}',fs='#{params['fs']}',ys='#{params['ys']}',blqk='#{params['blqk']}',zwdw='#{params['zwdw']}',zcfs='#{params['zcfs']}',szqm='#{params['szqm']}',qtfs='#{params['qtfs']}',xhfs='#{params['xhfs']}',bz='#{params['bz']}',zdnd='#{params['zdnd']}',zrz='#{params['zrz']}',jgwt='#{params['jgwt']}',qzh='#{params['qzh']}'"
      if (params['swrq']!="")
        strupdatesql=strupdatesql + ",swrq='#{params['swrq']}'"
      end
      if (params['zwrq']!="")
        strupdatesql=strupdatesql + ",zwrq='#{params['zwrq']}'"
      end
      if (params['yfrq']!="")
        strupdatesql=strupdatesql + ",yfrq='#{params['yfrq']}'"
      end
      user=User.find_by_sql("select * from doc_sw where  qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}' and swbh='#{params['swbh']}'  and id <> #{params['id']};")
      size = user.size
      if size == 0 
        User.find_by_sql("update  doc_sw set  #{strupdatesql} where id = #{params['id']};")
        txt='success'
      else
        txt= 'false:归档年度为'+params['zdnd']+'；机构问题号为'+params['jgwt']+';保管期限为'+params['bgqx']+';件号为'+params['swbh']+'已经存在，请重新输入年度、机构问题号、保管期限或收文编号。'
      end
      render :text => txt   
    end
        
    def insert_doc_swdj
      if (params['fs']=="")
        params['fs']=0       
      end
      if (params['ys']=="")
        params['ys']=0       
      end
      if (params['zcfs']=="")
        params['zcfs']=0       
      end
      if (params['qtfs']=="")
        params['qtfs']=0       
      end
      if (params['xhfs']=="")
        params['xhfs']=0       
      end

      strfield="bgqx,swbh,lwjg,wh,mj,tm,fs,ys,blqk,zwdw,zcfs,szqm,qtfs,xhfs,bz,zdnd,zrz,jgwt,qzh"
      strvalue="'#{params['bgqx']}','#{params['swbh']}','#{params['lwjg']}','#{params['wh']}','#{params['mj']}','#{params['tm']}','#{params['fs']}','#{params['ys']}','#{params['blqk']}','#{params['zwdw']}','#{params['zcfs']}','#{params['szqm']}','#{params['qtfs']}','#{params['xhfs']}','#{params['bz']}','#{params['zdnd']}','#{params['zrz']}','#{params['jgwt']}','#{params['qzh']}'"
      if (params['swrq']!="")
        strfield=strfield + ",swrq"
        strvalue=strvalue + ",'#{params['swrq']}'"        
      end
      if (params['zwrq']!="")
        strfield=strfield + ",zwrq"
        strvalue=strvalue + ",'#{params['zwrq']}'"        
      end
      if (params['yfrq']!="")
        strfield=strfield + ",yfrq"
        strvalue=strvalue + ",'#{params['yfrq']}'"        
      end
      user=User.find_by_sql("select * from doc_sw where  qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}' and swbh='#{params['swbh']}'  ;")
      size = user.size
      if size == 0 
        doc=User.find_by_sql("insert into  doc_sw (#{strfield}) values (#{strvalue})   RETURNING id;")
        txt='success:' + doc[0]['id'].to_s
      else
        txt= 'false:归档年度为'+params['zdnd']+'；机构问题号为'+params['jgwt']+';保管期限为'+params['bgqx']+';件号为'+params['swbh']+'已经存在，请重新输入年度、机构问题号、保管期限或收文编号。'
      end
      render :text => txt   
    end

    def delete_doc_swdj
      User.find_by_sql("delete from doc_sw  where id='#{params['id']}';")
      render :text => "success"
    end
    
    def get_swbh
      ajh= User.find_by_sql("select max(swbh) from doc_sw where qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}';")
      txt=ajh[0]["max"].to_i+1;
      render :text => txt 
    end

    def get_fwbh
      ajh= User.find_by_sql("select max(fwbh) from doc_fw where qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}';")
      txt=ajh[0]["max"].to_i+1;
      render :text => txt 
    end

    def update_doc_fwdj
      if (params['dyfs']=="")
        params['dyfs']=0       
      end
      if (params['ys']=="")
        params['ys']=0       
      end     
      strupdatesql="bgqx='#{params['bgqx']}',fwbh='#{params['fwbh']}',wh='#{params['wh']}',zrz='#{params['zrz']}',qfr='#{params['qfr']}',zsdw='#{params['zsdw']}',cbdw='#{params['cbdw']}',csdw='#{params['csdw']}',xfdw='#{params['xfdw']}',tm='#{params['tm']}',ztc1='#{params['ztc1']}',ztc2='#{params['ztc2']}',ztc3='#{params['ztc3']}',dyfs='#{params['dyfs']}',ys='#{params['ys']}',mj='#{params['mj']}',bz='#{params['bz']}',zdnd='#{params['zdnd']}',jgwt='#{params['jgwt']}',qzh='#{params['qzh']}'"
      if (params['fwrq']!="")
        strupdatesql=strupdatesql + ",swrq='#{params['fwrq']}'"
      end
      if (params['zwrq']!="")
        strupdatesql=strupdatesql + ",zwrq='#{params['zwrq']}'"
      end
      user=User.find_by_sql("select * from doc_fw where  qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}' and swbh='#{params['fwbh']}'  and id <> #{params['id']};")
      size = user.size
      if size == 0 
        User.find_by_sql("update  doc_fw set  #{strupdatesql} where id = #{params['id']};")
        txt='success'
      else
        txt= 'false:归档年度为'+params['zdnd']+'；机构问题号为'+params['jgwt']+';保管期限为'+params['bgqx']+';件号为'+params['fwbh']+'已经存在，请重新输入年度、机构问题号、保管期限或发文编号。'
      end
      render :text => txt   
    end
        
    def insert_doc_fwdj
      if (params['dyfs']=="")
        params['dyfs']=0       
      end
      if (params['ys']=="")
        params['ys']=0       
      end
      strfield="bgqx,fwbh,wh,zrz,qfr,zsdw,cbdw,csdw,xfdw,tm,ztc1,ztc2,ztc3,dyfs,ys,mj,bz,zdnd,jgwt,qzh"
      strvalue="'#{params['bgqx']}','#{params['fwbh']}','#{params['wh']}','#{params['zrz']}','#{params['qfr']}','#{params['zsdw']}','#{params['cbdw']}','#{params['csdw']}','#{params['xfdw']}','#{params['tm']}','#{params['ztc1']}','#{params['ztc2']}','#{params['ztc3']}','#{params['dyfs']}','#{params['ys']}','#{params['mj']}','#{params['bz']}','#{params['zdnd']}','#{params['jgwt']}','#{params['qzh']}'"
      if (params['fwrq']!="")
        strfield=strfield + ",fwrq"
        strvalue=strvalue + ",'#{params['fwrq']}'"        
      end
      if (params['zwrq']!="")
        strfield=strfield + ",zwrq"
        strvalue=strvalue + ",'#{params['zwrq']}'"        
      end
      
      user=User.find_by_sql("select * from doc_fw where  qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}' and fwbh='#{params['fwbh']}'  ;")
      size = user.size
      if size == 0 
        User.find_by_sql("insert into  doc_fw (#{strfield}) values (#{strvalue}) ;")
        txt='success'
      else
        txt= 'false:归档年度为'+params['zdnd']+'；机构问题号为'+params['jgwt']+';保管期限为'+params['bgqx']+';件号为'+params['fwbh']+'已经存在，请重新输入年度、机构问题号、保管期限或发文编号。'
      end
      render :text => txt   
    end

    def delete_doc_fwdj
      User.find_by_sql("delete from doc_fw  where id='#{params['id']}';")
      render :text => "success"
    end

    def get_lbzl
      ajh= User.find_by_sql("select max(wjbh) from doc_lb where qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}';")
      txt=ajh[0]["max"].to_i+1;
      render :text => txt 
    end

    def update_doc_lbzl
      if (params['ys']=="")
        params['ys']=0       
      end     
      strupdatesql="bgqx='#{params['bgqx']}',wjbh='#{params['wjbh']}',wh='#{params['wh']}',zrz='#{params['zrz']}',tm='#{params['tm']}',ys='#{params['ys']}',mj='#{params['mj']}',bz='#{params['bz']}',zdnd='#{params['zdnd']}',jgwt='#{params['jgwt']}',qzh='#{params['qzh']}'"
      if (params['rq']!="")
        strupdatesql=strupdatesql + ",rq='#{params['rq']}'"
      end
      if (params['zwrq']!="")
        strupdatesql=strupdatesql + ",zwrq='#{params['zwrq']}'"
      end
      user=User.find_by_sql("select * from doc_lb where  qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}' and wjbh='#{params['wjbh']}'  and id <> #{params['id']};")
      size = user.size
      if size == 0 
        User.find_by_sql("update  doc_lb set  #{strupdatesql} where id = #{params['id']};")
        txt='success'
      else
        txt= 'false:归档年度为'+params['zdnd']+'；机构问题号为'+params['jgwt']+';保管期限为'+params['bgqx']+';件号为'+params['wjbh']+'已经存在，请重新输入年度、机构问题号、保管期限或文件编号。'
      end
      render :text => txt   
    end
        
    def insert_doc_lbzl

      if (params['ys']=="")
        params['ys']=0       
      end
      strfield="bgqx,wjbh,wh,zrz,tm,ys,mj,bz,zdnd,jgwt,qzh"
      strvalue="'#{params['bgqx']}','#{params['wjbh']}','#{params['wh']}','#{params['zrz']}','#{params['tm']}','#{params['ys']}','#{params['mj']}','#{params['bz']}','#{params['zdnd']}','#{params['jgwt']}','#{params['qzh']}'"
      if (params['rq']!="")
        strfield=strfield + ",rq"
        strvalue=strvalue + ",'#{params['rq']}'"        
      end
      if (params['zwrq']!="")
        strfield=strfield + ",zwrq"
        strvalue=strvalue + ",'#{params['zwrq']}'"        
      end
      
      user=User.find_by_sql("select * from doc_lb where  qzh='#{params['qzh']}' and  zdnd='#{params['zdnd']}' and bgqx='#{params['bgqx']}' and jgwt='#{params['jgwt']}' and wjbh='#{params['wjbh']}'  ;")
      size = user.size
      if size == 0 
        User.find_by_sql("insert into  doc_lb (#{strfield}) values (#{strvalue}) ;")
        txt='success'
      else
        txt= 'false:归档年度为'+params['zdnd']+'；机构问题号为'+params['jgwt']+';保管期限为'+params['bgqx']+';件号为'+params['wjbh']+'已经存在，请重新输入年度、机构问题号、保管期限或文件编号。'
      end
      render :text => txt   
    end

    def delete_doc_lbzl
      User.find_by_sql("delete from doc_lb  where id='#{params['id']}';")
      render :text => "success"
    end

    def glsk_doc_lbzl
      User.find_by_sql("update  doc_lb set sfyglsk='是'  where id='#{params['id']}';")
      render :text => "success"
    end

    def glsk_doc_sw
      User.find_by_sql("update  doc_sw set sfyglsk='是'  where id='#{params['id']}';")
      render :text => "success"
    end

    def glsk_doc_fw
      User.find_by_sql("update  doc_fw set sfyglsk='是'  where id='#{params['id']}';")
      render :text => "success"
    end

    def get_doc_main
      ajh= User.find_by_sql("select max(jh) from a_wsda,archive where a_wsda.ownerid=archive.id and archive.dalb='24' and archive.qzh='#{params['qzh']}' and  a_wsda.nd='#{params['nd']}' and a_wsda.bgqx='#{params['bgqx']}' and a_wsda.jgwth='#{params['jgwth']}';")
      txt=ajh[0]["max"].to_i+1;
      render :text => txt 
    end

    def get_doc_temp
        pars = params['query']
        User.find_by_sql("delete from doc_temp;")
        user = User.find_by_sql("select * from doc_sw where qzh='#{pars}' and sfyglsk='是' and (sfygd is null or sfygd='')  order by zdnd,bgqx,jgwt,swbh;")
        size = user.size
        bh=0
        if size > 0
          for k in 0..size-1
            bh=bh+1
            strfield="ownerid,bgqx,jgwth,bh,wh,zrz,tm,ys,mj,bz,nd,wjlx"
            strvalue="'#{user[k]['id']}','#{user[k]['bgqx']}','#{user[k]['jgwt']}','#{bh}','#{user[k]['wh']}','#{user[k]['zrz']}','#{user[k]['tm']}','#{user[k]['ys']}','#{user[k]['mj']}','#{user[k]['bz']}','#{user[k]['zdnd']}','收文'"          
            if user[k]['swrq']==nil
            else
              strfield=strfield + ",rq"
              strvalue=strvalue + ",'#{user[k]['swrq']}'"
            end
            if user[k]['ys']==''
              user[k]['ys']=0
            end 
            insert_temp=User.find_by_sql("insert into doc_temp (#{strfield}) values (#{strvalue})")
          end
        end
        user = User.find_by_sql("select * from doc_fw where qzh='#{pars}' and sfyglsk='是' and (sfygd is null or sfygd='')  order by zdnd,bgqx,jgwt,fwbh;")
        size = user.size
        if size > 0
          for k in 0..size-1
            bh=bh+1
            strfield="ownerid,bgqx,jgwth,bh,wh,zrz,tm,ys,mj,bz,nd,wjlx"
            strvalue="'#{user[k]['id']}','#{user[k]['bgqx']}','#{user[k]['jgwt']}','#{bh}','#{user[k]['wh']}','#{user[k]['zrz']}','#{user[k]['tm']}','#{user[k]['ys']}','#{user[k]['mj']}','#{user[k]['bz']}','#{user[k]['zdnd']}','发文'"          
            if user[k]['fwrq']==nil
            else
              strfield=strfield + ",rq"
              strvalue=strvalue + ",'#{user[k]['fwrq']}'"
            end
            if user[k]['ys']==''
              user[k]['ys']=0
            end 
            insert_temp=User.find_by_sql("insert into doc_temp (#{strfield}) values (#{strvalue})")
          end
        end
        user = User.find_by_sql("select * from doc_lb where qzh='#{pars}' and sfyglsk='是' and (sfygd is null or sfygd='')  order by zdnd,bgqx,jgwt,wjbh;")
        size = user.size
        if size > 0
          for k in 0..size-1
            bh=bh+1
            strfield="ownerid,bgqx,jgwth,bh,wh,zrz,tm,ys,mj,bz,nd,wjlx"
            strvalue="'#{user[k]['id']}','#{user[k]['bgqx']}','#{user[k]['jgwt']}','#{bh}','#{user[k]['wh']}','#{user[k]['zrz']}','#{user[k]['tm']}','#{user[k]['ys']}','#{user[k]['mj']}','#{user[k]['bz']}','#{user[k]['zdnd']}','内部资料'"          
            if user[k]['rq']==nil
            else
              strfield=strfield + ",rq"
              strvalue=strvalue + ",'#{user[k]['rq']}'"
            end
            if user[k]['ys']==''
              user[k]['ys']=0
            end 
            insert_temp=User.find_by_sql("insert into doc_temp (#{strfield}) values (#{strvalue})")
          end
        end
        render :text => "success"
    end

    def get_doc_dagl_grid
     
     count= User.find_by_sql("select count(*) from doc_temp  ;")
      user = User.find_by_sql("select * from doc_temp  order by id limit #{params['limit']} offset #{params['start']};")
      size = user.size
      if size > 0 
       txt = "{results:#{count[0]['count']},rows:["
       for k in 0..user.size-1
         txt = txt + user[k].to_json + ','
       end
       txt = txt[0..-2] + "]}"
      else
       txt = "{results:0,rows:[]}"  
      end   
      render :text => txt
    end

    def get_doc_mlh(qzh,nd,bgqx,jgwth)
      ajh= User.find_by_sql("select id from a_wsda_key where qzh='#{qzh}' and  nd='#{nd}' and bgqx='#{bgqx}' and jgwth='#{jgwth}';")
      size=ajh.size
      if size>0
        txt=ajh[0]['id']
      else
        User.find_by_sql("insert into a_wsda_key(qzh,nd,bgqx,jgwth) values('#{qzh}','#{nd}','#{bgqx}','#{jgwth}') ")
        if $conn.nil?
             $conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
        end
        wsml = $conn.exec("select id from a_wsda_key where qzh='#{qzh}' and  nd='#{nd}' and bgqx='#{bgqx}' and jgwth='#{jgwth}';")
        txt=wsml[0]['id']
      end
      return txt
    end
    
    def get_doc_maxjh(qzh,nd,bgqx,jgwth)
      if $conn.nil?
           $conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
      end
      ajh= $conn.exec("select max(jh) from a_wsda,archive where a_wsda.ownerid=archive.id and archive.dalb='24' and archive.qzh='#{qzh}' and  a_wsda.nd='#{nd}' and a_wsda.bgqx='#{bgqx}' and a_wsda.jgwth='#{jgwth}';")
      txt=ajh[0]["max"].to_i+1;
      
      return txt
    end
    
    def doc_gd
      insert_sql=params['save_sql'].split('$')
      size = insert_sql.length     
      if size > 0
        dw=User.find_by_sql("select * from d_dwdm where id='#{params['qzh']}';")
        for k in 0..size-1
          save_sql=insert_sql[k].split('@')          
          mlh=get_doc_mlh(params['qzh'],save_sql[0],save_sql[2],save_sql[1])
          maxjh=get_doc_maxjh(params['qzh'],save_sql[0],save_sql[2],save_sql[1])
          dh=params['qzh'].to_s + "-24-" + mlh.to_s+"-"+maxjh.to_s
          maxjh=maxjh.to_i
          maxjh=maxjh.to_s
          if maxjh.length>3
            maxjh=maxjh
          else
            maxjh=sprintf("%04d",maxjh)
          end
          if save_sql[7]==''
            save_sql[7]='0'
          end
          
          strfield="ys,tm,nd,bgqx,bz,qzh,dh,dalb,mj,dwdm"
          strvalue="'#{save_sql[7]}','#{save_sql[5]}','#{save_sql[0]}','#{save_sql[2]}','#{save_sql[9]}','#{params['qzh']}','#{[dh]}','24','#{save_sql[11]}','#{dw[0]['dwdm']}'"
          User.find_by_sql("insert into archive(#{strfield}) values(#{strvalue}) ")
          archiveid=User.find_by_sql("select id from archive where dh='#{dh}';")
          if archiveid.size>0
            strfield="ownerid,nd,jgwth,bgqx,wh,zrr,dh,jh"
            strvalue="'#{archiveid[0]['id']}','#{save_sql[0]}','#{save_sql[1]}','#{save_sql[2]}','#{save_sql[3]}','#{save_sql[4]}','#{[dh]}','#{maxjh}'"
            if save_sql[6]=='null'
            else
              strfield=strfield+",zwrq"
              strvalue=strvalue+",'#{save_sql[6]}'"
            end
            User.find_by_sql("insert into a_wsda(#{strfield}) values(#{strvalue}) ") 
            case save_sql[8]
            when "收文"
              User.find_by_sql("update doc_sw set sfyglsk='是',sfygd='是' where id=#{save_sql[10]} ")
            when "发文"
              User.find_by_sql("update doc_fw set sfyglsk='是',sfygd='是' where id=#{save_sql[10]} ")
            when "内部资料"
              User.find_by_sql("update doc_lb set sfyglsk='是',sfygd='是' where id=#{save_sql[10]} ")
            end
            txt = 'success'
          else
            txt='保存失败，未找到保存后盘案卷。'
          end          
        end
      end      
      render :text => txt
    end




    def get_sql(dalb)
      case (dalb) 
				when "0"
					user ="select * from archive "				 
				when "2"
					user = "select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid "
					
				when "3","5","6","7"
					user = "select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid "
				when "15"
					user = "select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid "
        when "18"
					user = "select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid "
        when "25"
					user = "select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid "
        when "27"
					user = "select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid "
        when "26"
					user = "select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid "
        when "28"
					user = "select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxs from archive left join a_swda on archive.id=a_swda.ownerid "
        when "29"
					user = "select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid "
        when "30"
					user = "select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid "
        when "31"
					user = "select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid "
        when "32"
					user = "select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid "
        when "33"
					user = "select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid "
        when "34"
					user = "select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid "
        when "35"
					user = "select archive.*,a_kyq.xxkz, a_kyq.yxkz, a_kyq.kyqr, a_kyq.ksmc, a_kyq.ksbh, a_kyq.ksgm, a_kyq.xzqdm, a_kyq.kz, a_kyq.djlx, a_kyq.kswz, a_kyq.kqfw, a_kyq.mj as ksmj, a_kyq.cl, a_kyq.sjncl, a_kyq.clgm, a_kyq.yxqq, a_kyq.yxqz, a_kyq.yxqx, a_kyq.fzjg, a_kyq.mjdw, a_kyq.cldw, a_kyq.scgm, a_kyq.scldw, a_kyq.jjlx from archive left join a_kyq on archive.id=a_kyq.ownerid "
				when "24"
				  
          user = "select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  "
				when "19"
				  user = "select * from archive "
				else
					user = "select * from archive "					
			end
			return user
    end

    def get_archivebyid
      dh=params['dh'].split('-')
      sql=get_sql(dh[1])
      user = User.find_by_sql(" #{sql} where archive.id=#{params['id']};")    
      size = user.size
      if size > 0 
       txt = "["
       for k in 0..user.size-1
         txt = txt + user[k].to_json + ','
       end
       txt = txt[0..-2] + "]"
      else
       txt = "{results:0,rows:[]}"  
      end  
      render :text => txt
    end

    
    
    #add on July 20 by liujun
    #ys, nd, bgqx, mj, bz, flh, tm, mlh, dh, 
    $wsda_mlh={}
    def set_wsda_mlh (qzh)
      $wsda_mlh={}
      wsml = User.find_by_sql("select * from a_wsda_key where qzh='#{qzh}' order by id ;")
      for k in 0..wsml.size - 1 
        ws = wsml[k]
        ws_key = "#{ws['qzh']}-#{ws['nd']}-#{ws['bgqx']}-#{ws['jgwth']}"
        $wsda_mlh[ws_key] = ws['id']
      end
    end

    def get_wsda_mlh(qzh, nd, bgqx, jgwth)
      ws_key = "#{qzh}-#{nd}-#{bgqx}-#{jgwth}"
      if $wsda_mlh[ws_key].nil?
        User.find_by_sql("insert into a_wsda_key(qzh, nd, bgqx, jgwth) values('#{qzh}','#{nd}','#{bgqx}','#{jgwth}');")
        set_wsda_mlh(qzh)
      end 
      $wsda_mlh[ws_key]   
    end
    
    def add_new_wsda
      
      $conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
      
      #qx = ["永久", "长期", "短期", "定期-10年" ,"定期-30年" ]
      params['jgwth'] = '0000' if params['jgwth'].nil?
      params['bgqx'] = "定期-10年" if params['bgqx'].nil?
      params['qzh'] = '9' if params['qzh'].nil?
      params['ys'] = '0' if params['ys'].nil?
      params['jh'] = '0' if params['jh'].nil?
      
      params['zwrq'] =  params['zwrq'].nil? ? "NULL" : "TIMESTAMP '#{params['zwrq']}'"
      
      bgqx, jgwth, nd, qzh, dalb  = params['bgqx'] , params['jgwth'], params['DocumentYear'], '9', '24'
      mlh = get_wsda_mlh(qzh, nd, bgqx, jgwth)
      user = User.find_by_sql("select max(ajh) from archive where qzh='#{qzh}' and dalb='#{dalb}' and mlh='#{mlh}';")
      ajh  = user[0]['max'].to_i+1
      dh ="#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
      ys = params['ys']
      tm = params['Title']  
      mj = params['Secret']
      bz = params['Remark']
      flh = ""

      dw=User.find_by_sql("select * from d_dwdm where id=#{params['qzh']};")
      dwdm = dw[0]['dwdm']
	    
	    User.find_by_sql("insert into archive(ys,mlh,flh,tm,nd,bgqx,bz,qzh,dh,dalb,mj,dwdm) values(#{params['ys']},'#{params['mlh']}','#{params['flh']}','#{params['tm']}','#{params['nd']}','#{params['bgqx']}','#{params['bz']}','#{params['qzh']}','#{dh}','#{params['dalb']}','#{params['mj']}','#{dw[0]['dwdm']}') ")
      archiveid=User.find_by_sql("select id from archive where dh='#{dh}';")
      size=archiveid.size
      if size==0
        txt='保存失败，未找到保存后盘案卷。'
      else
        zwrq = params['CreateTime']
        wh = params['WordNo']
        zrr = params['DocumentPerson']
        User.find_by_sql("insert into a_wsda(ownerid,hh,jh, zwrq, wh, zrr,gb, wz,ztgg,ztlx,ztdw,dagdh,dzwdh,swh,ztsl,qwbs,ztc,zbbm,nd,jgwth,gbjh,xbbm,bgqx) values('#{archiveid[0]['id']}','#{params['hh']}','#{params['jh']}',#{params['zwrq']},'#{params['wh']}','#{params['zrr']}','#{params['gb']}','#{params['wz']}','#{params['ztgg']}','#{params['ztlx']}','#{params['ztdw']}','#{params['dagdh']}','#{params['dzwdh']}','#{params['swh']}','#{params['ztsl']}','#{params['qwbs']}','#{params['ztc']}','#{params['zbbm']}','#{params['nd']}','#{params['jgwth']}','#{params['gbjh']}','#{params['xbbm']}','#{params['bgqx']}') ")                                      
        txt='success'   
      end
      
      #插入附件
      if !params["DocumentContentFileType"].nil?
        #str=params['DocumentContent'].unpack("m")[0]
        str=params['DocumentContent']
        fjmc=params['DocumentContentFileName']
        fjlx=params["DocumentContentFileType"]
        fjdx=str.size
        #edata=PGconn.escape_bytea(fo)
        User.find_by_sql("delete from attach where dh='#{dh}' and fjmc='#{fjmc}';")
        $conn.exec("insert into attach(fjmc, fjlx, fjdx, dh, data, tag) values ('#{fjmc}','#{fjlx}',#{fjdx},'#{dh}', '#{str}', 0);")
      end
      
      for k in 0..19
        if !params["AttachmentFileContent#{k}"].nil?
          #str=params["AttachmentFileContent#{k}"].unpack("m")[0]
          str=params["AttachmentFileContent#{k}"]
          fjmc=params["AttachmentFileName#{k}"]
          fjlx=params["AttachmentFileType#{k}"]
          fjdx=str.size
          edata=PGconn.escape_bytea(str)
          User.find_by_sql("delete from attach where dh='#{dh}' and fjmc='#{fjmc}';")
          $conn.exec("insert into attach(fjmc, fjlx, fjdx, dh, data, tag) values ('#{fjmc}','#{fjlx}',#{fjdx},'#{dh}', '#{str}', 1);")
        end
      end
      
      $conn.close
      
      User.find_by_sql("update attach  set ownerid = archive.id from archive where attach.dh = archive.dh and attach.dh = '#{dh}';")
      user = User.find_by_sql("select id, dh, ajh from archive where dh = '#{dh}';")
      
      render :text => "<script>alert(\"接收已成功！\");top.close();</script>"
    end

    def get_jytj
      if params['query']!=""
        xh=1
        strwhere=""
        if params['jyr']!=""
          strwhere=" and jyr like '%#{params['jyr']}%' "
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
        if params['query']!='4'
          size = user.size
          if size > 0 
            txt = "{results:#{size},rows:["
            for k in 0..user.size-1
              if user[k]['jylist']!=''
                archive = User.find_by_sql("select * from archive where id in (#{user[k]['jylist']});")
                if archive.size>0 then
                  for i in 0..archive.size-1
                    txt=txt + "{'zjlr':'" + user[k]['zj'] + "','jydw':'" + user[k]['jydw'] + "','lymd':'" + user[k]['lymd'] + "','xh':'" + xh.to_s + "','rq':'" + user[k]['jysj'].gsub('00:00:00', '') + "','jyr':'" + user[k]['jyr'] + "','tm':'" + archive[i]['tm'] + "'"
                    if archive[i]['dalb']=='24'
                      doc= User.find_by_sql("select * from a_wsda where ownerid = #{archive[i]['id']};")
                      if doc.size>0 
                        txt=txt + ",'jh':'" + doc[0]['nd'] + "," + doc[0]['bgqx'] + "," + doc[0]['jgwth'] + "," + doc[0]['jh'] + "'"
                      end
                    else
                      txt=txt + ",'jh':'" + archive[i]['mlh'] + "," + archive[i]['flh'] + "," + archive[i]['ajh'] + "'"
                    end
                    if !(user[k]['hdsj'].nil?)
                      txt=txt + ",'ghrq':'" + user[k]['hdsj'].gsub('00:00:00', '') + "'},"
                    else
                      txt=txt + "},"
                    end
                    xh=xh+1
                  end
                end
              end
            end
            txt = txt[0..-2] + "]}"
          else
            txt = "{results:0,rows:[]}"  
          end        
        end
      else
        txt = "{results:0,rows:[]}"
      end
      render :text => txt
    end


    def dajy_print
      if params['query']!=""
        xh=1
        strwhere=""
        if params['jyr']!=""
          strwhere=" and jyr like '%#{params['jyr']}%' "
        end        
        if params['jydw']!=""
          strwhere=strwhere + " and jydw like '%#{params['jydw']}%' "
        end       
        strwhere=" where jysj<='#{params['zrq']}' and jysj>='#{params['qrq']}' " + strwhere
        if params['query']=='4'
          txt=print_dajytjhz(strwhere,params['qrq'],params['zrq'])
        else          
          case params['query']
          when "1"
            strwhere=strwhere + " and (jyzt='2') "
          when "2"
            strwhere=strwhere + " and (jyzt='4') "
          when "3"
            strwhere=strwhere
          end
          txt=print_dajydjb(strwhere,params['query'])
        end
      else
        txt="false"
      end
      render :text => txt
    end
    
    def print_dajydjb(strwhere,zt)
      filenames=""
      intys=0
      intts=0
      intwidth=[]
      user=User.find_by_sql("select *,jylist.daid from jylc,jylist #{strwhere} and jylc.id=jylist.jyid order by jysj;")
      size = user.size;
      if size.to_i>0 
        intys=(size.to_i/6).to_i
        if intys==size.to_i/6.to_f
          intys=intys-1
        end
        for k in 0..intys
          strfilename=""
          convertstr=""
          if k==intys
            intts=size.to_i-intys*6-1
          else
            intts=5
          end
          for i in 0..intts
            intwidth<<289
            intwidth<<397
            intwidth<<634
            intwidth<<1077
            intwidth<<1860
            intwidth<<2202
            intwidth<<2358
            intwidth<<2641
            intwidth<<2887
            if zt=='1'
              printfilename="qdqd.jpg"
            else
              printfilename="jydadjb.jpg"
            end
            intheight= i*289+645
            puts intheight
            convertstr=convertstr + " -font ./dady/STZHONGS.ttf  -pointsize 50 -draw \"text #{intwidth[0]}, #{intheight} '#{i+k*6+1}'\""                                
            if !(user[i+k*6]['lymd'].nil?)                
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{user[i+k*6]['lymd'].center 18}'\" "                            
            end
            intheight=intheight-110
            if !(user[i+k*6]['jysj'].nil?) 
              rq=user[i+k*6]['jysj'].split(" ")
              year=rq[0].split("-")
              yr=year[1]+year[2]           
              intheight1=intheight+ 60
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight1} '#{year[0].center 6}'\" "
              intheight1=intheight+ 110
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight1} '#{yr.center 6}'\" "
            end
            if !(user[i+k*6]['hdsj'].nil?) 
              rq=user[i+k*6]['hdsj'].split(" ")
              year=rq[0].split("-")
              yr=year[1]+year[2]           
              intheight1=intheight+ 60
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight1} '#{year[0].center 6}'\" "
              intheight1=intheight+ 110
              convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight1} '#{yr.center 6}'\" "
            end
            if !(user[i+k*6]['jydw'].nil?)  
              tm=split_string(user[i+k*6]['jydw'],8)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight1} '#{strtm[j]}'\" "
              end                              
            end
            if !(user[i+k*6]['jyr'].nil?)  
              tm=split_string(user[i+k*6]['jyr'],5)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight1} '#{strtm[j]}'\" "
              end                              
            end  
            if zt=='1'
              if !(user[i+k*6]['zj'].nil?)  
                tm=split_string(user[i+k*6]['zj'],6)
                strtm=tm.split("\n")
                intheight1=0
                for j in 0..strtm.length-1
                  intheight1=intheight+ j*50
                  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight1} '#{strtm[j]}'\" "
                end                              
              end 
            else
              if !(user[i+k*6]['bz'].nil?)  
                tm=split_string(user[i+k*6]['bz'],6)
                strtm=tm.split("\n")
                intheight1=0
                for j in 0..strtm.length-1
                  intheight1=intheight+ j*50
                  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[8]}, #{intheight1} '#{strtm[j]}'\" "
                end                              
              end
            end         
            
            archive = User.find_by_sql("select * from archive where id = #{user[i+k*6]['daid']};")
            if archive.size>0 then
              if !(archive[0]['tm'].nil?)
                puts tm
                tm=split_string(archive[0]['tm'],14)
                strtm=tm.split("\n")
                intheight1=0
                for j in 0..strtm.length-1
                  intheight1=intheight+ j*50
                  convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight1} '#{strtm[j]}'\" "
                end                
              end
              jh=""
              if archive[0]['dalb']=='24'
                doc= User.find_by_sql("select * from a_wsda where ownerid = #{archive[0]['id']};")
                if doc.size>0 
                  jh= doc[0]['nd'] + "," + doc[0]['bgqx'] + "," + doc[0]['jgwth'] + "," + doc[0]['jh'] 
                end
              else
                jh= archive[0]['mlh'] + "," + archive[0]['flh'] + "," + archive[0]['ajh'] 
              end
              tm=split_string(jh,3)
              strtm=tm.split("\n")
              intheight1=0
              for j in 0..strtm.length-1
                intheight1=intheight+ j*50
                convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight1} '#{strtm[j]}'\" "
              end
            end
          end
          strfilename="./dady/tmp1/jydjb" + k.to_s + ".jpg"
          puts strfilename
          puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
          system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")
          if filenames==""
            filenames="jydjb" + k.to_s + ".jpg"
          else
            filenames=filenames + "," + "jydjb" + k.to_s + ".jpg"
          end        
        end
        txt="success:" + filenames
      else
        txt="无统计结果。"
      end
      return txt
    end
    
    
    def print_dajytjhz(strwhere,qrq,zrq)
      filenames=""
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
        strfilename=""
        convertstr=""
        printfilename="dajytjjg.jpg"
        convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
        convertstr=convertstr +" -pointsize 80 -draw \"text 815,954 '从#{params['qrq']}至#{params['zrq']}'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 1260,1137 '#{user[0]['jyrc']}'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 1260,1338 '#{jylist[0]['jyjc']}'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 788,2679 '#{user[0]['fyys']}'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 1716,2679 '#{user[0]['zcys']}'\""
        
        convertstr=convertstr +" -pointsize 80 -draw \"text 1496,1535 '#{bsxz_s.to_f*100}%'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 1496,1732 '#{gzkc_s.to_f*100}%'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 1496,1914 '#{xsyj_s.to_f*100}%'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 1496,2102 '#{jjjs_s.to_f*100}%'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 1496,2290 '#{xcjy_s.to_f*100}%'\""
        convertstr=convertstr +" -pointsize 80 -draw \"text 1496,2489 '#{qt_s.to_f*100}%'\""
        rq=Time.now.strftime("%Y%m%d%H%M%S")
        strfilename="./dady/tmp1/dajytjjg"  + rq.to_s + ".jpg"
        puts strfilename
        if filenames==""
          filenames="dajytjjg" + rq.to_s + ".jpg"
        else
          filenames=filenames + "," + "dajytjjg" + rq.to_s + ".jpg"
        end
        puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
        system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")                   
        return "success:" + filenames
      else
        return "false:无统计结果" 
      end
    end
    
    #获得档案统计菜单树
    def get_datj_tree
          text="["
          text=text+"{'text':'年度档案分类统计','id' :'1','leaf':true,'checked':false,'cls':'folder'},"
          text=text+"{'text':'档案利用统计','id' :'2','leaf':true,'checked':false,'cls':'folder'}"          
          text=text + "]"        
        render :text => text 
    end

    #档案年度统计
    def print_dandtj
      dwdm= User.find_by_sql("select d_dwdm.dwdm,users.* from users,d_dwdm where users.ssqz=d_dwdm.id and users.id=#{params['userid']};")
      if dwdm.size>0
        intwidth=[]
        strfilename=""
        convertstr=""
        filenames=""
        bnhj=0
        bnyj=0
        bncq=0
        bndq=0
        hj=0
        yj=0
        cq=0
        dq=0
        printfilename="ndtj.jpg"
        convertstr=convertstr + " -font ./dady/STZHONGS.ttf"
        convertstr=convertstr +" -pointsize 80 -draw \"text 496,229 '#{dwdm[0]['dwdm'].center 100}'\""
        convertstr=convertstr +" -pointsize 50 -draw \"text 1394,327 '#{params['nd']}'\""
        convertstr=convertstr +" -pointsize 50 -draw \"text 874,438 '#{params['nd']}'\""
        convertstr=convertstr +" -pointsize 50 -draw \"text 567,2113 '#{params['nd']}'\""
        dalb= User.find_by_sql("select * from d_dalb where not(lbdm is null) order by sx;")
        intwidth<<1182
        intwidth<<1410
        intwidth<<1632
        intwidth<<1848
        intwidth<<2093
        intwidth<<2303
        intwidth<<2524
        intwidth<<2745
               
        for k in 0..dalb.size-1
          if k==dalb.size-1
            intheight= (k+2)*78+762
          else
            intheight= k*78+762
          end
          if dalb[k]['id'].to_i<100
            if dalb[k]['id'].to_i==2
              datj=User.find_by_sql("select count(*),(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='永久' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='25年' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where dalb='#{dalb[k]['id']}' and (bgqx='15年' or bgqx='5年') and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='#{dalb[k]['id']}' and qzh='#{dwdm[0]['ssqz']}' and nd='#{params['nd']}'");
            else
              datj=User.find_by_sql("select count(*),(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='永久' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='长期' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='短期' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='#{dalb[k]['id']}' and qzh='#{dwdm[0]['ssqz']}' and nd='#{params['nd']}'");
            end
            bnhj=bnhj+datj[0]['count'].to_i
            bnyj=bnyj+datj[0]['yj'].to_i
            bncq=bncq+datj[0]['cq'].to_i
            bndq=bndq+datj[0]['dq'].to_i
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight} '#{datj[0]['count'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight} '#{datj[0]['dq'].center 7}'\" " 
            if dalb[k]['id'].to_i==2
              datj=User.find_by_sql("select count(*),(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='永久' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='25年' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where dalb='#{dalb[k]['id']}' and (bgqx='15年' or bgqx='5年') and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='#{dalb[k]['id']}' and qzh='#{dwdm[0]['ssqz']}' and nd<'#{params['nd']}'");
            else
              datj=User.find_by_sql("select count(*),(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='永久' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='长期' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='短期' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='#{dalb[k]['id']}' and qzh='#{dwdm[0]['ssqz']}' and nd<'#{params['nd']}'");
            end
            hj=hj+datj[0]['count'].to_i
            yj=yj+datj[0]['yj'].to_i
            cq=cq+datj[0]['cq'].to_i
            dq=dq+datj[0]['dq'].to_i
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{datj[0]['count'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{datj[0]['dq'].center 7}'\" "                    
          else
            datj=User.find_by_sql("select count(*),(select count(*) from archive where cast(dalb as integer) in (select id from d_dalb where ownerid='#{dalb[k]['id']}') and bgqx='永久' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where cast(dalb as integer) in (select id from d_dalb where ownerid='#{dalb[k]['id']}') and bgqx='长期' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where cast(dalb as integer) in (select id from d_dalb where ownerid='#{dalb[k]['id']}') and bgqx='短期' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where cast(dalb as integer) in (select id from d_dalb where ownerid='#{dalb[k]['id']}')  and qzh='#{dwdm[0]['ssqz']}' and nd='#{params['nd']}'");
            bnhj=bnhj+datj[0]['count'].to_i
            bnyj=bnyj+datj[0]['yj'].to_i
            bncq=bncq+datj[0]['cq'].to_i
            bndq=bndq+datj[0]['dq'].to_i
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight} '#{datj[0]['count'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight} '#{datj[0]['dq'].center 7}'\" " 
            datj=User.find_by_sql("select count(*),(select count(*) from archive where cast(dalb as integer) in (select id from d_dalb where ownerid='#{dalb[k]['id']}') and bgqx='永久' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where cast(dalb as integer) in (select id from d_dalb where ownerid='#{dalb[k]['id']}') and bgqx='长期' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where cast(dalb as integer) in (select id from d_dalb where ownerid='#{dalb[k]['id']}') and bgqx='短期' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where cast(dalb as integer) in (select id from d_dalb where ownerid='#{dalb[k]['id']}') and qzh='#{dwdm[0]['ssqz']}' and nd<'#{params['nd']}'");
            hj=hj+datj[0]['count'].to_i
            yj=yj+datj[0]['yj'].to_i
            cq=cq+datj[0]['cq'].to_i
            dq=dq+datj[0]['dq'].to_i
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{datj[0]['count'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
            convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{datj[0]['dq'].center 7}'\" "
          end
        end
        intheight= 8*78+762
        datj=User.find_by_sql("select sum(ys),(select sum(ys) from archive where dalb='20' and bgqx='永久' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select sum(ys) from archive where dalb='20' and bgqx='长期' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select sum(ys) from archive where dalb='20' and bgqx='短期' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='20' and qzh='#{dwdm[0]['ssqz']}' and nd='#{params['nd']}'");
        if datj[0]['sum']==nil
          datj[0]['sum']='0'
        end
        if datj[0]['yj']==nil
          datj[0]['yj']='0'
        end
        if datj[0]['cq']==nil
          datj[0]['cq']='0'
        end
        if datj[0]['dq']==nil
          datj[0]['dq']='0'
        end
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight} '#{datj[0]['sum'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight} '#{datj[0]['dq'].center 7}'\" " 
        datj=User.find_by_sql("select sum(ys),(select sum(ys) from archive where dalb='20' and bgqx='永久' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select sum(ys) from archive where dalb='20' and bgqx='长期' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select sum(ys) from archive where dalb='20' and bgqx='短期' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='20' and qzh='#{dwdm[0]['ssqz']}' and nd<'#{params['nd']}'");
        if datj[0]['sum']==nil
          datj[0]['sum']='0'
        end
        if datj[0]['yj']==nil
          datj[0]['yj']='0'
        end
        if datj[0]['cq']==nil
          datj[0]['cq']='0'
        end
        if datj[0]['dq']==nil
          datj[0]['dq']='0'
        end
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{datj[0]['sum'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{datj[0]['dq'].center 7}'\" "
        intheight= 9*78+762
        datj=User.find_by_sql("select sum(ys),(select sum(ys) from archive where dalb='18' and bgqx='永久' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select sum(ys) from archive where dalb='18' and bgqx='长期' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select sum(ys) from archive where dalb='18' and bgqx='短期' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='18' and qzh='#{dwdm[0]['ssqz']}' and nd='#{params['nd']}'");
        if datj[0]['sum']==nil
          datj[0]['sum']='0'
        end
        if datj[0]['yj']==nil
          datj[0]['yj']='0'
        end
        if datj[0]['cq']==nil
          datj[0]['cq']='0'
        end
        if datj[0]['dq']==nil
          datj[0]['dq']='0'
        end
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight} '#{datj[0]['sum'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight} '#{datj[0]['dq'].center 7}'\" " 
        datj=User.find_by_sql("select sum(ys),(select sum(ys) from archive where dalb='18' and bgqx='永久' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select sum(ys) from archive where dalb='18' and bgqx='长期' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select sum(ys) from archive where dalb='18' and bgqx='短期' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='18' and qzh='#{dwdm[0]['ssqz']}' and nd<'#{params['nd']}'");
        if datj[0]['sum']==nil
          datj[0]['sum']='0'
        end
        if datj[0]['yj']==nil
          datj[0]['yj']='0'
        end
        if datj[0]['cq']==nil
          datj[0]['cq']='0'
        end
        if datj[0]['dq']==nil
          datj[0]['dq']='0'
        end
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{datj[0]['sum'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{datj[0]['dq'].center 7}'\" "
        intheight= 11*78+762
        datj=User.find_by_sql("select count(*),(select count(*) from archive where dalb='24' and bgqx='永久' and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where dalb='24' and (bgqx='长期' or bgqx='定期-30年') and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where dalb='24' and (bgqx='短期' or bgqx='定期-10年') and nd='#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='24' and qzh='#{dwdm[0]['ssqz']}' and nd='#{params['nd']}'");
        bnhj=bnhj+datj[0]['count'].to_i
        bnyj=bnyj+datj[0]['yj'].to_i
        bncq=bncq+datj[0]['cq'].to_i
        bndq=bndq+datj[0]['dq'].to_i
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[0]}, #{intheight} '#{datj[0]['count'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[1]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[2]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[3]}, #{intheight} '#{datj[0]['dq'].center 7}'\" " 
        datj=User.find_by_sql("select count(*),(select count(*) from archive where dalb='24' and bgqx='永久' and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where dalb='24' and (bgqx='长期' or bgqx='定期-30年') and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where dalb='24' and (bgqx='短期' or bgqx='定期-10年') and nd<'#{params['nd']}' and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='24' and qzh='#{dwdm[0]['ssqz']}' and nd<'#{params['nd']}'");
        hj=hj+datj[0]['count'].to_i
        yj=yj+datj[0]['yj'].to_i
        cq=cq+datj[0]['cq'].to_i
        dq=dq+datj[0]['dq'].to_i
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{datj[0]['count'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{datj[0]['dq'].center 7}'\" "
        
        dalb= User.find_by_sql("select * from d_dalb where ownerid='106' ;") 
        for k in 0..dalb.size-1
          case dalb[k]['id'].to_s
          when '26'
            intheight= 12*78+762
          when '25'
            intheight= 13*78+762
          when '29'
            intheight= 14*78+762
          when '28'
            intheight= 15*78+762
          when '27'
            intheight= 16*78+762
          end
           
          datj=User.find_by_sql("select count(*),(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='永久'  and qzh='#{dwdm[0]['ssqz']}') as yj,(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='长期'  and qzh='#{dwdm[0]['ssqz']}') as cq,(select count(*) from archive where dalb='#{dalb[k]['id']}' and bgqx='短期'  and qzh='#{dwdm[0]['ssqz']}') as dq from archive where dalb='#{dalb[k]['id']}' and qzh='#{dwdm[0]['ssqz']}' ");
          hj=hj+datj[0]['count'].to_i
          yj=yj+datj[0]['yj'].to_i
          cq=cq+datj[0]['cq'].to_i
          dq=dq+datj[0]['dq'].to_i
          convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[4]}, #{intheight} '#{datj[0]['count'].center 7}'\" " 
          convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[5]}, #{intheight} '#{datj[0]['yj'].center 7}'\" " 
          convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[6]}, #{intheight} '#{datj[0]['cq'].center 7}'\" " 
          convertstr =convertstr + " -pointsize 50  -draw \"text #{intwidth[7]}, #{intheight} '#{datj[0]['dq'].center 7}'\" "
        end
        
        
        convertstr =convertstr + " -pointsize 50  -draw \"text 609, 2236 '#{bnhj.to_s.center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text 1174, 2278 '#{bnyj.to_s.center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text 1344,2278 '#{bncq.to_s.center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text 1512, 2278 '#{bndq.to_s.center 7}'\" " 

        convertstr =convertstr + " -pointsize 50  -draw \"text 1879, 2236 '#{hj.to_s.center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text 2464, 2278 '#{yj.to_s.center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text 2633, 2278 '#{cq.to_s.center 7}'\" " 
        convertstr =convertstr + " -pointsize 50  -draw \"text 2800, 2278 '#{dq.to_s.center 7}'\" "
        rq=Time.now.strftime("%Y%m%d%H%M%S")
        strfilename="./dady/tmp1/ndtj"  + rq.to_s + ".jpg"
        puts strfilename
        if filenames==""
          filenames="ndtj" + rq.to_s + ".jpg"
        else
          filenames=filenames + "," + "ndtj" + rq.to_s + ".jpg"
        end
        puts "convert ./dady/#{printfilename} #{convertstr}  #{strfilename}"
        system("convert ./dady/#{printfilename} #{convertstr}  #{strfilename}")                   
        txt= "success:" + filenames
      else
        txt='登录的用户所属全宗不存在，请先设置用户的所属全宗再进行年度统计。'
      end
      render :text => txt 
    end
   
    def get_cxtj_sd(gjcxtj)
      cx=gjcxtj.split('$')
      txt=''
      if cx[0]=='ajtm'
        cx[0]='tm'
      end
      if cx[0]=='doctm'
        cx[0]='tm'
      end
      if cx[0]=='docwh'
        cx[0]='wh'
      end
      if cx[0]=='doczrz'
        cx[0]='zrz'
      end
      if cx[0]=='nd'
        cx[0]='archive.nd'
      end
      if cx[0]=='docbgqx'
        cx[0]='a_wsda.bgqx'
      end
      if cx[0]=='docnd'
        cx[0]='a_wsda.nd'
      end
      if cx[1]=='like'
        txt=" #{cx[0]} #{cx[1]} '%#{cx[2]}%' "
      else
        txt=" #{cx[0]} #{cx[1]} '#{cx[2]}' "
      end
      return txt
    end
    
    
    def archive_query_sd
      cx_tj=''
      ss=params['dh'].split('_');
      if !(params['mlh'].nil?)   
        cx_tj=get_cxtj_sd(params['mlh'])
      end
      
      if !(params['ajh'].nil?)
        tj=params['ajh'].split('$')
        if tj[2].length<4
          params['ajh']=tj[0].to_s + "$" + tj[1].to_s + "$" + sprintf("%04d", tj[2])
        end
        if (cx_tj!='')
          cx_tj=cx_tj + " and " + get_cxtj_sd(params['ajh'])
        else
          cx_tj= get_cxtj_sd(params['ajh'])
        end
      end
      puts cx_tj
      if !(params['ajtm'].nil?)
        if (cx_tj!='')
          cx_tj=cx_tj + " and " + get_cxtj_sd(params['ajtm'])
        else
          cx_tj= get_cxtj_sd(params['ajtm'])
        end
      end
      if !(params['nd'].nil?)
        if (cx_tj!='')
          cx_tj=cx_tj + " and " + get_cxtj_sd(params['nd'])
        else
          cx_tj= get_cxtj_sd(params['nd'])
        end
      end
      if !(params['bgqx'].nil?)
        if ss[1]=='24'
          params['bgqx']="doc" + params['bgqx']
          if (cx_tj!='')
            cx_tj=cx_tj + " and " + get_cxtj_sd(params['bgqx'])
          else
            cx_tj= get_cxtj_sd(params['bgqx'])
          end
        else
          if (cx_tj!='')
            cx_tj=cx_tj + " and " + get_cxtj_sd(params['bgqx'])
          else
            cx_tj= get_cxtj_sd(params['bgqx'])
          end
        end
      end

      jn_cx_tj=''
      if !(params['wh'].nil?)
        jn_cx_tj=get_cxtj_sd(params['wh'])
      end
      if !(params['zrz'].nil?)
        if (jn_cx_tj!='')
          jn_cx_tj=jn_cx_tj + " and " + get_cxtj_sd(params['zrz'])
        else
          jn_cx_tj=get_cxtj_sd(params['zrz'])
        end
      end
      if !(params['tm'].nil?)
        if (jn_cx_tj!='')
          jn_cx_tj=jn_cx_tj + " and " + get_cxtj_sd(params['tm'])
        else
          jn_cx_tj=get_cxtj_sd(params['tm'])
        end
      end

      dj_cx_tj=''
      if !(params['djh'].nil?)
        dj_cx_tj=get_cxtj_sd(params['djh'])
      end

      if !(params['tdzl'].nil?)
        if (dj_cx_tj!='')
          dj_cx_tj=dj_cx_tj + " and " + get_cxtj_sd(params['tdzl'])
        else
          dj_cx_tj=get_cxtj_sd(params['tdzl'])
        end
      end

      if !(params['qlrmc'].nil?)
        if (dj_cx_tj!='')
          dj_cx_tj=dj_cx_tj + " and " + get_cxtj_sd(params['qlrmc'])
        else
          dj_cx_tj=get_cxtj_sd(params['qlrmc'])
        end
      end
      
      if !(params['tdzh'].nil?)
        if (dj_cx_tj!='')
          dj_cx_tj=dj_cx_tj + " and " + get_cxtj_sd(params['tdzh'])
        else
          dj_cx_tj=get_cxtj_sd(params['tdzh'])
        end
      end
      
      doc_cx_tj=''
      if !(params['doctm'].nil?)
        if (doc_cx_tj!='')
          doc_cx_tj=doc_cx_tj + " and " + get_cxtj_sd(params['doctm'])
        else
          doc_cx_tj=get_cxtj_sd(params['doctm'])
        end
      end
      if !(params['docwh'].nil?)
        if (doc_cx_tj!='')
          doc_cx_tj=doc_cx_tj + " and " + get_cxtj_sd(params['docwh'])
        else
          doc_cx_tj=get_cxtj_sd(params['docwh'])
        end
      end
      if !(params['doczrz'].nil?)
        if (doc_cx_tj!='')
          doc_cx_tj=doc_cx_tj + " and " + get_cxtj_sd(params['doczrz'])
        else
          doc_cx_tj=get_cxtj_sd(params['doczrz'])
        end
      end
      if !(params['jgwth'].nil?)
        if (doc_cx_tj!='')
          doc_cx_tj=doc_cx_tj + " and " + get_cxtj_sd(params['jgwth'])
        else
          doc_cx_tj=get_cxtj_sd(params['jgwth'])
        end
      end

      if !(params['jh'].nil?)
        tj=params['jh'].split('$')
        if tj[2].length<4
          params['jh']=tj[0].to_s + "$" + tj[1].to_s + "$" + sprintf("%04d", tj[2])
        end
        if (cx_tj!='')
          doc_cx_tj=doc_cx_tj + " and " + get_cxtj_sd(params['jh'])
        else
          doc_cx_tj= get_cxtj_sd(params['jh'])
        end
      end
      if !(params['docnd'].nil?)
        if (doc_cx_tj!='')
          doc_cx_tj=doc_cx_tj + " and " + get_cxtj_sd(params['docnd'])
        else
          doc_cx_tj=get_cxtj_sd(params['docnd'])
        end
      end
      
      kyq_cx_tj=""
      if !(params['kyqr'].nil?)
        kyq_cx_tj=get_cxtj_sd(params['kyqr'])
      end

      if !(params['kswz'].nil?)
        if (kyq_cx_tj!='')
          kyq_cx_tj=kyq_cx_tj + " and " + get_cxtj_sd(params['kswz'])
        else
          kyq_cx_tj=get_cxtj_sd(params['kswz'])
        end
      end

      if !(params['ksmc'].nil?)
        if (kyq_cx_tj!='')
          kyq_cx_tj=kyq_cx_tj + " and " + get_cxtj_sd(params['ksmc'])
        else
          kyq_cx_tj=get_cxtj_sd(params['ksmc'])
        end
      end
      
      if !(params['xxkz'].nil?)
        if (kyq_cx_tj!='')
          kyq_cx_tj=kyq_cx_tj + " and " + get_cxtj_sd(params['xxkz'])
        else
          kyq_cx_tj=get_cxtj_sd(params['xxkz'])
        end
      end
      if !(params['ksbh'].nil?)
        if (kyq_cx_tj!='')
          kyq_cx_tj=kyq_cx_tj + " and " + get_cxtj_sd(params['ksbh'])
        else
          kyq_cx_tj=get_cxtj_sd(params['ksbh'])
        end
      end

      jy_select=''
      
      case (ss[1]) 
				when "0"
					jy_select="select * from archive "			 
				when "2"
					jy_select="select archive.*,a_jhcw.pzqh,a_jhcw.pzzh,a_jhcw.jnzs,a_jhcw.fjzs from archive left join a_jhcw on archive.id=a_jhcw.ownerid "				
				when "3","5","6","7"
					jy_select="select archive.*,a_tddj.djh,a_tddj.qlrmc,a_tddj.tdzl,a_tddj.qsxz,a_tddj.tdzh,a_tddj.tfh,a_tddj.ydjh from archive left join a_tddj on archive.id=a_tddj.ownerid "
				when "15"
					jy_select="select archive.*,a_sx.zl from archive left join a_sx on archive.id=a_sx.ownerid "
        when "18"
					jy_select="select archive.*,a_tjml.tfh,a_tjml.tgh from archive left join a_tjml on archive.id=a_tjml.ownerid "
        when "25"
					jy_select="select archive.*,a_dzda.tjr, a_dzda.rjhj, a_dzda.czxt, a_dzda.sl, a_dzda.bfs, a_dzda.ztbhdwjgs, a_dzda.yyrjpt, a_dzda.tjdw, a_dzda.wjzt, a_dzda.dzwjm, a_dzda.ztbh, a_dzda.xcbm, a_dzda.xcrq, a_dzda.jsr, a_dzda.jsdw, a_dzda.yjhj from archive left join a_dzda on archive.id=a_dzda.ownerid "
        when "27"
					jy_select="select archive.*,a_sbda.zcmc, a_sbda.gzsj, a_sbda.dw, a_sbda.sl, a_sbda.cfdd, a_sbda.sybgdw, a_sbda.sybgr, a_sbda.jh, a_sbda.zcbh, a_sbda.dj, a_sbda.je from archive left join a_sbda on archive.id=a_sbda.ownerid "
        when "26"
					jy_select="select archive.*,a_jjda.xmmc, a_jjda.jsdw from archive left join a_jjda on archive.id=a_jjda.ownerid "
        when "28"
					jy_select="select archive.*,a_swda.bh, a_swda.lb, a_swda.hjz, a_swda.sjsj, a_swda.sjdw, a_swda.mc, a_swda.ztxs from archive left join a_swda on archive.id=a_swda.ownerid "
        when "29"
					jy_select="select archive.*,a_zlxx.bh, a_zlxx.lb, a_zlxx.bzdw from archive left join a_zlxx on archive.id=a_zlxx.ownerid "
        when "30"
					jy_select="select archive.*,a_by_tszlhj.djh, a_by_tszlhj.kq, a_by_tszlhj.mc, a_by_tszlhj.fs, a_by_tszlhj.yfdw, a_by_tszlhj.cbrq, a_by_tszlhj.dj from archive left join a_by_tszlhj on archive.id=a_by_tszlhj.ownerid "
        when "31"
					jy_select="select archive.*,a_by_jcszhb.zt, a_by_jcszhb.qy, a_by_jcszhb.tjsj, a_by_jcszhb.sm from archive left join a_by_jcszhb on archive.id=a_by_jcszhb.ownerid "
        when "32"
					jy_select="select archive.*,a_by_zzjgyg.jgmc, a_by_zzjgyg.zzzc, a_by_zzjgyg.qzny from archive left join a_by_zzjgyg on archive.id=a_by_zzjgyg.ownerid "
        when "33"
					jy_select="select archive.*,a_by_dsj.dd, a_by_dsj.jlr, a_by_dsj.clly, a_by_dsj.fsrq, a_by_dsj.jlrq, a_by_dsj.rw, a_by_dsj.sy,a_by_dsj.yg from archive left join a_by_dsj on archive.id=a_by_dsj.ownerid "
        when "34"
					jy_select="select archive.*,a_by_qzsm.qzgcgjj, a_by_qzsm.sj from archive left join a_by_qzsm on archive.id=a_by_qzsm.ownerid "        
				when "35"
					jy_select = "select archive.*,a_kyq.xxkz, a_kyq.yxkz, a_kyq.kyqr, a_kyq.ksmc, a_kyq.ksbh, a_kyq.ksgm, a_kyq.xzqdm, a_kyq.kz, a_kyq.djlx, a_kyq.kswz, a_kyq.kqfw, a_kyq.mj as ksmj, a_kyq.cl, a_kyq.sjncl, a_kyq.clgm, a_kyq.yxqq, a_kyq.yxqz, a_kyq.yxqx, a_kyq.fzjg, a_kyq.mjdw, a_kyq.cldw, a_kyq.scgm, a_kyq.scldw, a_kyq.jjlx from archive left join a_kyq on archive.id=a_kyq.ownerid "
				when "24"
				  #年度_机构问题号_保管期限
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
          jy_select="select archive.dwdm,archive.dh,archive.bz,archive.mlh,archive.flh,archive.id,archive.ys,archive.tm,archive.dalb,archive.qzh,a_wsda.jh,a_wsda.hh, a_wsda.zwrq, a_wsda.wh, a_wsda.zrr, a_wsda.gb, a_wsda.wz, a_wsda.ztgg, a_wsda.ztlx, a_wsda.ztdw, a_wsda.dagdh, a_wsda.dzwdh, a_wsda.swh, a_wsda.ztsl, a_wsda.qwbs, a_wsda.ztc, a_wsda.zbbm, a_wsda.ownerid, a_wsda.nd, a_wsda.jgwth, a_wsda.gbjh, a_wsda.xbbm, a_wsda.bgqx from archive left join a_wsda on archive.id=a_wsda.ownerid  #{strwhere}   "
				when "19"
				  jy_select="select * from archive "
				when "40"
				  jy_select 
			  when "41"
		    when "42"
				else
					jy_select="select * from archive "					
			end
      if ss[1]!='24'
        dh=params['dh'].gsub('_','-')
        case ss.length
        when 1
          jy_select=jy_select + " where archive.qzh = '#{ss[0]}'"
        when 2
          jy_select=jy_select + " where archive.qzh = '#{ss[0]}' and archive.dalb = '#{ss[1]}'"
        when 3
          jy_select=jy_select + " where archive.qzh = '#{ss[0]}' and archive.dalb = '#{ss[1]}'  and archive.mlh = '#{ss[2]}'"
        end
      end
      if jn_cx_tj!=''
        jy_select=jy_select + " and archive.id in (select ownerid from document where #{jn_cx_tj})"
      end
      if dj_cx_tj!=''
        jy_select=jy_select + " and archive.id in (select ownerid from a_tddj where #{dj_cx_tj})"
      end
      
      if kyq_cx_tj!=''
        jy_select=jy_select + " and archive.id in (select ownerid from a_kyq where #{kyq_cx_tj})"
      end
      if doc_cx_tj!=''
        jy_select=jy_select + " and #{doc_cx_tj}"
      end
      if cx_tj!=''
        jy_select=jy_select + " and  #{cx_tj} "
      end
      puts cx_tj
      if ss[1]!='24'
        jy_select=jy_select + " order by mlh,ajh  "
      else
        jy_select=jy_select + " order by nd,bgqx,jgwth,jh "
      end
      if (jy_select!='')
        count=User.find_by_sql(" #{jy_select} ;")
        user = User.find_by_sql(" #{jy_select} limit #{params['limit']} offset #{params['start']} ;")
        size = user.size;
        if size > 0
          txt = "{results:#{count.size},rows:["
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
   
    def get_sb_grid
      if (params['query'].nil?)
        user = User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc,zn_sb_lx.img from  zn_fj,zn_lc,zn_ly,u_sb,zn_sb,zn_sb_lx where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=u_sb.sbid and zn_sb_lx.id=zn_sb.sblx and u_sb.userid =#{params['userid']}  order by id;")

        size = user.size

        if size > 0 
         txt = "["
         for k in 0..user.size-1
           txt = txt + user[k].to_json + ','
         end
         txt = txt[0..-2] + "]"
        else
         txt = "[]"  
        end
      else
        if (params['query']=="")
          txt = "[]"
        else
          query=params['query'].split("|")
          case query.length
          when 1
            user = User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc,zn_sb_lx.img from  zn_fj,zn_lc,zn_ly,u_sb,zn_sb,zn_sb_lx where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=u_sb.sbid and zn_sb_lx.id=zn_sb.sblx and u_sb.userid =#{params['userid']} and zn_sb.ssly=#{query[0]} order by id;")
          when 2
            user = User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc,zn_sb_lx.img from  zn_fj,zn_lc,zn_ly,u_sb,zn_sb,zn_sb_lx where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=u_sb.sbid and zn_sb_lx.id=zn_sb.sblx and u_sb.userid =#{params['userid']} and zn_sb.ssly=#{query[0]} and zn_sb.sslc=#{query[1]} order by id;")
          when 3
            user = User.find_by_sql("select zn_sb.*,zn_fj.fjmc,zn_ly.lymc,zn_lc.lcmc,zn_sb_lx.img from  zn_fj,zn_lc,zn_ly,u_sb,zn_sb,zn_sb_lx where  zn_sb.ssly=zn_ly.id and zn_sb.sslc=zn_lc.id and zn_sb.ssfj=zn_fj.id and zn_sb.id=u_sb.sbid and zn_sb_lx.id=zn_sb.sblx and u_sb.userid =#{params['userid']} and zn_sb.ssly=#{query[0]} and zn_sb.sslc=#{query[1]} and zn_sb.ssfj=#{query[2]} order by id;")
          end
          size = user.size

          if size > 0 
           txt = "["
           for k in 0..user.size-1
             txt = txt + user[k].to_json + ','
           end
           txt = txt[0..-2] + "]"
          else
           txt = "[]"  
          end
        end
      end      
      render :text => txt
    end

    def every_n_seconds(n) 
         loop do 
             before= Time.now 
             yield 
             interval=n-(Time.now-before) 
             sleep(interval) if interval>0 
         end 
    end
    
    def get_qcj_grid
      txt=''
      xh=1
      if  !(params['userid'].nil?)
        dwdm= User.find_by_sql("select d_dwdm.id as dwid ,d_dwdm.dwdm,users.* from users,d_dwdm where users.ssqz=d_dwdm.id and users.id=#{params['userid']};")
        puts dwdm.size>0
        if dwdm.size>0 then
          user = User.find_by_sql("select * from  archive where  qzh ='#{dwdm[0]['dwid']}' and mlh='#{params['query']}'  order by mlh,ajh;")
          size = user.size
          if size>0 then
            txt = "{results:0,rows:["
            #{results:2,rows:[{"id":1,"modelid":"1","name":"er"},{"id":3,"modelid":"1","name":"vhyuubggggg"}]}
            intajh=1
            for k in 0..user.size-1
              strajh=user[k]['ajh']

              if intajh.to_i<strajh.to_i then
                while intajh.to_i!=user[k]['ajh'].to_i do
                  txt=txt + '{"xh":"' + xh.to_s + '","mlh":"' + params['query'].to_s + '","ajh":"' + intajh.to_s + '","sm":"缺卷"},' 
                  xh=xh+1
                  intajh=intajh.to_i+1
                end
                intajh=intajh.to_i+1
              else 
                if intajh.to_i>user[k]['ajh'].to_i then
                  txt=txt + '{"xh":"' + xh.to_s + '","mlh":"' + params['query'].to_s + '","ajh":"' + user[k]['ajh'].to_i.to_s + '","sm":"重卷"},' 
                  xh=xh+1
                  #intajh=intajh.to_i+1
                else
                  intajh=intajh.to_i+1
                end
              end
            end
            txt=txt[0..-2] +']}'
          else
            txt = "{results:0,rows:[]}"
          end
        else
          txt = "{results:0,rows:[]}"
        end        
      else
        txt = "{results:0,rows:[]}"
      end
      render :text => txt
    end

    #获得打印模板树
    def get_print_model_tree
      
     node, style = params["node"], params['style']
     text="["
     jslb=["通用打印","土地登记打印"]     
     if node == "root"
       for k in 0..1      
         text=text+"{'text':'#{jslb[k]}','id' :'#{jslb[k]}-#{k}','leaf':false,'checked':false,'cls':'folder','children':["
         data = User.find_by_sql("select * from  print_mb where dylb='#{jslb[k]}' order by id;")
         size=data.size
         if size>0
           data.each do |dd|
             text=text+"{'text':'#{dd['mbmc']}','id' :'#{dd['id']}','leaf':true,'checked':false,'iconCls':'user'},"
           end
         end
         text=text + "]}," 
       end       
     end
     text=text+"]"
     render :text => text
    end
    
    
    def insert_print_model   
       user=User.find_by_sql("select * from print_mb where  mbmc='#{params['name']}';")
       size = user.size
       if size == 0
         returnid=User.find_by_sql("insert into print_mb ( mbmc,dylb) values ('#{params['name']}', '#{params['lx']}')   RETURNING id;")
         print_fild=User.find_by_sql("select * from print_setup where  mbmc='标准#{params['lx']}模板';")
         if print_fild.size>0
           for k in 0..print_fild.size-1
             User.find_by_sql("insert into print_setup (mbid,xx,yy,bt,zdm,sfdy,zt,dx,sfkg,sfdybt,dylb,mbmc) values (#{returnid[0]['id']},'#{print_fild[k]['xx']}','#{print_fild[k]['yy']}','#{print_fild[k]['bt']}','#{print_fild[k]['zdm']}','#{print_fild[k]['sfdy']}','#{print_fild[k]['zt']}','#{print_fild[k]['dx']}','#{print_fild[k]['sfkg']}','#{print_fild[k]['sfdybt']}','#{print_fild[k]['dylb']}','#{params['name']}');")
            end
         end
         txt='success'
       else
         txt= 'false:模板名称已经存在，请重新输入。'
       end
       render :text => txt    
      
    end
    
    def update_print_model
      user=User.find_by_sql("select * from print_mb where id <> #{params['id']} and mbmc='#{params['name']}';")
      size = user.size
      if size == 0
        User.find_by_sql("update print_mb set mbmc='#{params['name']}' where id='#{params['id']}';")
        User.find_by_sql("update print_setup set mbmc='#{params['name']}' where mbid='#{params['id']}';")
        txt='success'
      else
        txt= 'false:模板名称已经存在，请重新输入。'
      end
      render :text => txt      
    end
  
    def delete_print_model
      User.find_by_sql("delete from print_mb  where id='#{params['id']}';")
      User.find_by_sql("delete from print_setup  where mbid='#{params['id']}';")
      render :text => "success"
    end

    def get_print_print_grid
      user = User.find_by_sql("select * from print_mb where dylb='#{params['param']}' order by id;")
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

    #获得机构问题设置列表
     def  get_doc_jgwt_grid
       user = User.find_by_sql("select * from  doc_jgwt order by id;")
       size = user.size
       puts size
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


     #新增机构问信息
     def insert_doc_jgwt 
       user=User.find_by_sql("select * from doc_jgwt where  jgwth='#{params['jgwth']}' or jgwtmc='#{params['jgwtmc']}';")
       size = user.size
       if size == 0
         User.find_by_sql("insert into doc_jgwt(jgwth, jgwtmc) values ('#{params['jgwth']}', '#{params['jgwtmc']}');")
         txt='success'
       else
         txt= 'false:机构问题名称或机构问题号已经存在，请重新输入。'
       end
       render :text => txt
     end


     #更新机构问题信息
     def update_doc_jgwt
       user=User.find_by_sql("select * from doc_jgwt where id <> #{params['id']} and (jgwth='#{params['jgwth']}' or jgwtmc='#{params['jgwtmc']}');")
       size = user.size
       if size == 0
         User.find_by_sql("update doc_jgwt set jgwth='#{params['jgwth']}', jgwtmc='#{params['jgwtmc']}' where id = #{params['id']};")
         txt='success'
       else
         txt= 'false:机构问题名称或机构问题号已经存在，请重新输入。'
       end
       render :text => txt
     end

      #删除机构问题信息
     def delete_doc_jgwt
       user = User.find_by_sql("delete from doc_jgwt where id = #{params['id']};")
       render :text => 'success'
     end
     
     def get_doc_jgwtmc
        user=User.find_by_sql("select * from doc_jgwt where jgwth='#{params['jgwth']}';")
        size = user.size
        if size == 0
          txt=''
        else
          txt=user[0]['jgwtmc']
        end
        render :text => txt
     end


     def get_cxtj_doc_dagl(gjcxtj)
       cx=gjcxtj.split('$')
       txt=''  
       if cx[0]=='doctm'
         cx[0]='tm'
       end
       if cx[0]=='docwh'
         cx[0]='wh'
       end
       if cx[0]=='doczrz'
         cx[0]='zrz'
       end
       if cx[0]=='docnd'
         cx[0]='zdnd'
       end    
       if cx[1]=='like'
         txt=" #{cx[0]} #{cx[1]} '%#{cx[2]}%' "
       else
         txt=" #{cx[0]} #{cx[1]} '#{cx[2]}' "
       end
       return txt
     end

     def doc_dagl_query
       cx_tj=''
              
       if !(params['docnd'].nil?)
         if (cx_tj!='')
           cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['docnd'])
         else
           cx_tj= get_cxtj_doc_dagl(params['docnd'])
         end
       end
       if !(params['bgqx'].nil?)
         if (cx_tj!='')
           cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['bgqx'])
         else
           cx_tj= get_cxtj_doc_dagl(params['bgqx'])
         end
       end
              
       if !(params['doctm'].nil?)
         if (cx_tj!='')
           cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['doctm'])
         else
           cx_tj=get_cxtj_doc_dagl(params['doctm'])
         end
       end
       if !(params['docwh'].nil?)
         if (cx_tj!='')
           cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['docwh'])
         else
           cx_tj=get_cxtj_doc_dagl(params['docwh'])
         end
       end
       if !(params['doczrz'].nil?)
         if (cx_tj!='')
           cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['doczrz'])
         else
           cx_tj=get_cxtj_doc_dagl(params['doczrz'])
         end
       end
       if !(params['jgwth'].nil?)
         if (cx_tj!='')
           cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['jgwth'])
         else
           cx_tj=get_cxtj_doc_dagl(params['jgwth'])
         end
       end
       if !(params['swbh'].nil?)
          if (cx_tj!='')
            cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['swbh'])
          else
            cx_tj=get_cxtj_doc_dagl(params['swbh'])
          end
        end
        if !(params['fwbh'].nil?)
           if (cx_tj!='')
             cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['fwbh'])
           else
             cx_tj=get_cxtj_doc_dagl(params['fwbh'])
           end
         end
         if !(params['wjbh'].nil?)
            if (cx_tj!='')
              cx_tj=cx_tj + " and " + get_cxtj_doc_dagl(params['wjbh'])
            else
              cx_tj=get_cxtj_doc_dagl(params['wjbh'])
            end
          end


       jy_select=''
       ss=params['dh'].split('_');
       case (ss[1]) 
 				when "2"
 					jy_select="select * from doc_sw "		
 					orderby=" order by swbh"	 
 				when "3"
 					jy_select="select * from doc_fw "	
 					orderby=" order by fwbh"			
 				when "4"
 					jy_select="select * from doc_lb "	
 					orderby=" order by wjbh"				
 			end

       if cx_tj!=''
         jy_select=jy_select + " where qzh='#{ss[0]}' and  #{cx_tj} "
       end
       puts cx_tj

      jy_select=jy_select + orderby

       if (jy_select!='')
         count=User.find_by_sql(" #{jy_select} ;")
         user = User.find_by_sql(" #{jy_select} limit #{params['limit']} offset #{params['start']} ;")
         size = user.size;
         if size > 0
           txt = "{results:#{count.size},rows:["
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


     def hex_str(ss)
       str = ''
       for k in 0..ss.length-1
         str = str +  sprintf("%02X", ss[k]) + ' '
       end  
       str
     end
     #身份证读取
     def get_sfz
       
          #timeout(10) do
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
                wb = ss[idx+14..idx+4+wb_len-1]
                wbxx = Iconv.iconv('UTF-8','UTF-16LE', wb).to_s
                sfz=wbxx.split(" ")
                puts sfz
                txt= "success:" + sfz[0].to_s
              end
            else
              txt= "false:请放入或移动一下身份证。"
            end
            client.close
          #end
          #rescue Timeout::Error
              #txt= "false:请保证身份证读取器正确连接。"
        
        
        render :text => txt
     end
     
     
end
