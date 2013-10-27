#!/usr/bin/ruby
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/' << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.3.6/lib'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.3.6/lib'
#这个是服务器上的文件夹
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-3.1.3/lib' << '/usr/local/lib/ruby/gems/1.8/gems/multi_json-1.3.6/lib'
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'  << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.0.4/lib'
require 'pg'
require 'active_support'

#*********************************************************************************************
#
#
#
#   2012-12-25 wny修改 在导入输档数据时，删除一个案卷再导一个案卷，而不是先删除整个目录号再导入。
#
#
#
#*********************************************************************************************

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = on")

#2综合档案aj.txt
def get_dalb(key)
  #key = /(\d+)(.*)(aj|jr)/.match(ifname)[2]
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

#============qzml_mlh===============
def set_qzml (qzh)
  $qzml_mlh={}
  tsml = $conn.exec("select * from qzml_key where qzh='#{qzh}' order by id ;")
  for k in 0..tsml.count - 1 
    dd = tsml[k]
    key = "#{dd['qzh']}-#{dd['dalb']}-#{dd['mlm']}"
    $qzml_mlh[key] = dd['id']
  end
end

def get_qzml(qzh, dalb, mlm)
  key = "#{qzh}-#{dalb}-#{mlm}"
  if $qzml_mlh[key].nil?
    $conn.exec("insert into qzml_key(qzh, dalb, mlm) values('#{qzh}','#{dalb}','#{mlm}');")
    set_qzml(qzh)
  end 
  $qzml_mlh[key]   
end

#============wsda_mlh===============

def set_wsda_mlh (qzh)
  $wsda_mlh={}
  wsml = $conn.exec("select * from a_wsda_key where qzh='#{qzh}' order by id ;")
  for k in 0..wsml.count - 1 
    ws = wsml[k]
    ws_key = "#{ws['qzh']}-#{ws['nd']}-#{ws['bgqx']}-#{ws['jgwth']}"
    $wsda_mlh[ws_key] = ws['id']
  end
end

def get_ws_mlh(qzh, nd, bgqx, jgwth)
  ws_key = "#{qzh}-#{nd}-#{bgqx}-#{jgwth}"
  if $wsda_mlh[ws_key].nil?
    $conn.exec("insert into a_wsda_key(qzh, nd, bgqx, jgwth) values('#{qzh}','#{nd}','#{bgqx}','#{jgwth}');")
    set_wsda_mlh(qzh)
  end 
  $wsda_mlh[ws_key]   
end

def get_mlm(ifname)
  ss=/(.*)(文档一体化.*)/.match(ifname)
  ss[1]
end

#======

def decode_file (infile, outfile, path)
  newfile = rand(36**8).to_s(36)
  #puts "iconv -t UTF-8 -f GB18030  #{path}/#{infile} > #{path}/#{newfile}"
  system("iconv -t UTF-8 -f GB18030  #{path}/#{infile} > #{path}/#{newfile}")
  ss = File.open("#{path}/#{newfile}").read
  x= ActiveSupport::JSON.encode(ss).gsub(/\\n/, '').gsub("'","\"").gsub(/\\r/,'')
  ff = File.open("#{path}/#{outfile}","w+")
  ff.write(x[1..-2])
  ff.close
  system("rm #{path}/#{newfile}")
end

def update_owner
  #puts "== *** #{Time.now.strftime("%Y-%m-%d %H:%M:%S")} Begin of update owener "
  $conn.exec("update a_dzda set ownerid=archive.id from archive where archive.dh=a_dzda.dh and a_dzda.ownerid is null;")
  $conn.exec("update a_jhcw set ownerid=archive.id from archive where archive.dh=a_jhcw.dh and a_jhcw.ownerid is null;")
  $conn.exec("update a_jjda set ownerid=archive.id from archive where archive.dh=a_jjda.dh and a_jjda.ownerid is null;")
  $conn.exec("update a_sbda set ownerid=archive.id from archive where archive.dh=a_sbda.dh and a_sbda.ownerid is null;")
  $conn.exec("update a_swda set ownerid=archive.id from archive where archive.dh=a_swda.dh and a_swda.ownerid is null;")
  $conn.exec("update a_tddj set ownerid=archive.id from archive where archive.dh=a_tddj.dh and a_tddj.ownerid is null;")
  $conn.exec("update a_tjda set ownerid=archive.id from archive where archive.dh=a_tjda.dh and a_tjda.ownerid is null;")
  $conn.exec("update a_wsda set ownerid=archive.id from archive where archive.dh=a_wsda.dh and a_wsda.ownerid is null;")
  $conn.exec("update a_kyq  set ownerid=archive.id from archive where archive.dh=a_kyq.dh and a_kyq.ownerid is null;")
  $conn.exec("update document set ownerid=archive.id from archive where document.dh=archive.dh and document.ownerid is null;")
  #puts "== $$$ #{Time.now.strftime("%Y-%m-%d %H:%M:%S")} end of update owener "
end 

def set_documents(tt, dwdm, qzh, dalb, mlh)
    for k in 0..tt.size-1    
        user = tt[k]['Table']
        mlm  = user['目录号'] 
        tm      = user['题名'] 
        ajh     = user['案卷号'].rjust(4,"0")
        if dalb!=20
          sxh     = user['顺序号']
        else
          #sxh     = user['照片号']
          if user['照片号']==''
            sxh=0
          else
            sxh     = user['照片号']
          end
        end
        yh      = user['页号']
        wh      = user['文号']
        zrz     = user['责任者']
        rq      = user['日期']
        bz      = user['备注']
        flh= user['分类号']
      
        if dalb.to_i==27
          rsmlh=$conn.exec("select * FROM qzml_key where mlm='#{mlm}' and qzh='#{qzh}' and dalb='#{dalb}' and nd='#{flh}';")
          if rsmlh.count>0
            mlh=rsmlh[0]['id']
          else
            insertmlh=$conn.exec("INSERT INTO qzml_key(mlm,qzh,nd,dalb) VALUES ('#{mlm}','#{qzh}','#{flh}','#{dalb}') returning id;")
            mlh=insertmlh[0]['id']
          end
        end
    
        dh = "#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
        if rq.nil?
          rq=""
        end
        if rq.length==0
          rq = 'null' 
        elsif rq.length==4
          rq = "TIMESTAMP '#{rq}0101'"
        elsif rq.length==6
          rq = "TIMESTAMP '#{rq}01'"
        else    
          rq = "TIMESTAMP '#{rq}'"
        end
        tm=tm.gsub(' ','')   
        $conn.exec(" DELETE FROM document where dh='#{dh}' and sxh='#{sxh}';")   
        insert_str =  " INSERT INTO document(dh,tm,sxh,yh,wh,zrz,rq,bz) VALUES ('#{dh}','#{tm}','#{sxh}','#{yh}','#{wh}','#{zrz}',#{rq},'#{bz}')  RETURNING id;"
        puts insert_str
        document=$conn.exec(insert_str)
      if dalb==20
        user = tt[k]['Table']
        puts user
        rq=user['拍摄日期']
        if rq.nil?
          rq=""
        else
          rq  =  user['拍摄日期']
        end
        zph   =  user['照片号']
        psz   =  user['拍摄者']
        cfwz  =  user['存放位置']
        sy    =  user['事由']
        dd    =  user['地点']
        rw    =  user['人物']
        bj    =  user['背景']
      
        dh = "#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
        if rq.length==0
          psrq = 'null' 
        elsif rq.length==4
          psrq = "TIMESTAMP '#{rq}0101'"
        elsif rq.length==6
          psrq = "TIMESTAMP '#{rq}01'"
        else    
          psrq = "TIMESTAMP '#{rq}'"
        end
        $conn.exec(" DELETE FROM a_zp where dh='#{dh}' and zph='#{zph}';")
        insert_str =  " INSERT INTO a_zp (dh, psrq, zph,  psz, cfwz, sy, dd, rw, bj,ownerid) values ('#{dh}',   #{psrq}, '#{zph}',  '#{psz}', '#{cfwz}', '#{sy}', '#{dd}', '#{rw}', '#{bj}',#{document[0]['id']});"
      
        puts insert_str
        #$conn.exec(" DELETE FROM a_zp where dh='#{dh}';")
        $conn.exec(insert_str)
      end
    
      case dalb
      when 0  #综合档案 
      when 2  #财务档案
      when 3  #土地登记
      when 4  #地籍管理
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

def set_archive(tt, dwdm, qzh, dalb, mlh, mlm)
  for k in 0..tt.size-1 
    user = tt[k]['Table']
    qrq=''
    zrq=''
    ajh     = user['案卷号']
    tm      = user['案卷标题']
    flh     = user['分类号']
    nd      = user['年度']
    zny     = user['止年月']
    qny     = user['起年月']
    js      = user['件数'].to_i
    ys      = user['页数'].to_i
    bgqx    = user['保管期限']
    mj      = user['密级']
    xh      = user['箱号']
    cfwz    = user['存放位置']
    bz      = user['备注']
    boxstr  = user['boxstr']
    rfidstr = user['标签ID']
    boxrfid = user['盒标签']
    qrq     = user['起日期']
    zrq     = user['止日期']
    jgwth   = user['机构问题号']

    
    tm  = user['案卷题名'] if tm.nil?
    tm  = user['题名'] if tm.nil?
    tm  = user['图名'] if tm.nil?
    tm  = user['名称'] if tm.nil?
    tm  = user['标题'] if tm.nil?
    ajh = user['件号'] if ajh.nil?
    ajh = user['序号'] if ajh.nil?
    nd  = user['出版年度'] if nd.nil?
    if dalb==25
      ajh     = user['顺序号']
    end
    if dalb==26
      nd     = user['建设年代']
    end
    ajh = ajh.rjust(4,"0")
    
    js = 1 if js == 0
    
    if dalb==24
      ajh = user['件号'].rjust(4,"0")
      dh = "#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
    else  
      dh = "#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
    end
    
    if nd.nil? || nd==''
      $stderr.puts "错误： 年度为空了： #{dh}, 档案类别： #{dalb}, 目录号：#{mlh}, 案卷号： #{ajh} 起日期:#{qrq}"
      $stderr.puts 
      nd=''
    end 
    if qrq.nil?
      qrq=''
    end
    if zrq.nil?
      zrq=''
    end 
    if qrq.nil? || qrq==''
      qrq = 'null' 
    elsif qrq.length==4
      qrq = "TIMESTAMP '#{qrq}0101'"
    elsif qrq.length==6
      qrq = "TIMESTAMP '#{qrq}01'"
    else    
      qrq = "TIMESTAMP '#{qrq}'"
    end
    if zrq.nil? || zrq==''
      zrq = 'null' 
    elsif zrq.length==4
      zrq = "TIMESTAMP '#{zrq}0101'"
    elsif zrq.length==6
      zrq = "TIMESTAMP '#{zrq}01'"
    else    
      zrq = "TIMESTAMP '#{zrq}'"
    end
   # if qrq.nil?
   #   if qny.nil? || qny == ''
   #     qrq = "#{nd}-01-01"
   #     zrq = "#{nd}-12-31"
   #     qny = "#{nd}01"
   #     zny = "#{nd}12"
   #   else
   #     qyy,qmm = qny[0..3], qny[4..5]
   #     if qmm.to_i == 0
   #       qmm = '01'
   #       qny = qyy+'01'
   #     end
   #     if qmm.to_i>12
   #       qmm = '12'
   #       qny = qyy+'12'
   #     end
   #     qrq = "#{qyy}-#{qmm}-01"
   #
   #     zyy = zny[0..3]
   #     zmm = zny[4..5]
   #     if zmm.to_i ==0
   #       zmm = '01'
   #       zny = zyy + '01'
   #     end  
   #     if zmm.to_i>=12
   #       t1 = Time.mktime(zyy, 12, 31)
   #       zny = zyy+'12'
   #     else
   #       t1 = Time.mktime(zyy, (zmm.to_i+1).to_s)-86400
   #     end
   #     zrq = t1.strftime("%Y-%m-%d")
   #   end
   # else
   #   if qrq.size == 6 
   #     qyy,qmm,qdd = qrq[0..3], qrq[4..5],qrq[6..7]
   #     zyy,zmm,zdd = zrq[0..3], zrq[4..5],zrq[6..7]
   #
   #     qrq = "#{qyy}-#{qmm}-#{qdd}"
   #     zrq = "#{zyy}-#{zmm}-#{zdd}"
   #
   #     qny = "#{qyy}#{qmm}"
   #     zny = "#{zyy}#{zmm}"
   #   end
   #
   # end
    #$conn.exec(" DELETE FROM archive where dh='#{dh}';")
    if dalb.to_i!=2 && dalb.to_i!=27 &&  dalb.to_i!=29
      rid=$conn.exec("select * FROM archive where dh='#{dh}';")
      if rid.count>0
        if rfidstr==''
          update_str="update archive set mlm='#{mlh}', mlh='#{mlm}',nd='#{nd}', bgqx='#{bgqx}', xh='#{xh}', cfwz='#{cfwz}', bz='#{bz}', flh='#{flh}', tm='#{tm}', ys=#{ys}, dh='#{dh}', zny='#{zny}', qny='#{qny}', js=#{js}, ajh='#{ajh}' where id = #{rid[0]['id']};"
          $conn.exec(update_str)
        else
          update_str="update archive set boxstr='#{boxstr}',rfidstr='#{rfidstr}',boxrfid='#{boxrfid}',mlm='#{mlh}', mlh='#{mlm}',nd='#{nd}', bgqx='#{bgqx}', xh='#{xh}', cfwz='#{cfwz}', bz='#{bz}', flh='#{flh}', tm='#{tm}', ys=#{ys}, dh='#{dh}', zny='#{zny}', qny='#{qny}', js=#{js}, ajh='#{ajh}' where id = #{rid[0]['id']};"
          $conn.exec(update_str)
        end
        puts update_str
        ownerid = rid[0]['id']
      else
        insert_str = " INSERT INTO archive(dh,dwdm,qzh,mlh,mlm,ajh,tm,flh,nd,zny,qny,js,ys,bgqx,mj,xh,cfwz,bz,boxstr,rfidstr,boxrfid,qrq,zrq,dalb,dyzt)  VALUES ('#{dh}','#{dwdm}','#{qzh}','#{mlm}','#{mlh}','#{ajh}','#{tm}','#{flh}','#{nd}','#{zny}','#{qny}',#{js},#{ys},'#{bgqx}','#{mj}','#{xh}','#{cfwz}','#{bz}','#{boxstr}','#{rfidstr}','#{boxrfid}', #{qrq}, #{zrq}, '#{dalb}','0') returning id;"
        rid1 = $conn.exec(insert_str)
        ownerid = rid1[0]['id']
        puts insert_str
      end 
    end     

    
    
    #puts insert_str
    
    
    case dalb
    when 0  #综合档案 
    when 2  #财务档案
      
      sfxls=$conn.exec("select * FROM s_setup where dwid=#{qzh} and cwsfxls='是';")
      if sfxls.count>0
        rsmlh=$conn.exec("select * FROM qzml_key where mlm='#{mlm}' and qzh='#{qzh}' and dalb='#{dalb}' and nd='#{nd}';")
        if rsmlh.count>0
          mlh=rsmlh[0]['id']
        else
          insertmlh=$conn.exec("INSERT INTO qzml_key(mlm,qzh,nd,dalb) VALUES ('#{mlm}','#{qzh}','#{nd}','#{dalb}') returning id;")
          mlh=insertmlh[0]['id']
        end
      end
      dh = "#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
      rid=$conn.exec("select * FROM archive where dh='#{dh}';")
      if rid.count>0
        if rfidstr==''
          update_str="update archive set mlm='#{mlh}', mlh='#{mlm}',nd='#{nd}', bgqx='#{bgqx}', xh='#{xh}', cfwz='#{cfwz}', bz='#{bz}', flh='#{flh}', tm='#{tm}', ys=#{ys}, dh='#{dh}', zny='#{zny}', qny='#{qny}', js=#{js}, ajh='#{ajh}' where id = #{rid[0]['id']};"
          $conn.exec(update_str)
        else
          update_str="update archive set boxstr='#{boxstr}',rfidstr='#{rfidstr}',boxrfid='#{boxrfid}',mlm='#{mlh}', mlh='#{mlm}',nd='#{nd}', bgqx='#{bgqx}', xh='#{xh}', cfwz='#{cfwz}', bz='#{bz}', flh='#{flh}', tm='#{tm}', ys=#{ys}, dh='#{dh}', zny='#{zny}', qny='#{qny}', js=#{js}, ajh='#{ajh}' where id = #{rid[0]['id']};"
          $conn.exec(update_str)
        end
        puts update_str
        ownerid = rid[0]['id']
      else
        insert_str = " INSERT INTO archive(dh,dwdm,qzh,mlh,mlm,ajh,tm,flh,nd,zny,qny,js,ys,bgqx,mj,xh,cfwz,bz,boxstr,rfidstr,boxrfid,qrq,zrq,dalb,dyzt)  VALUES ('#{dh}','#{dwdm}','#{qzh}','#{mlm}','#{mlh}','#{ajh}','#{tm}','#{flh}','#{nd}','#{zny}','#{qny}',#{js},#{ys},'#{bgqx}','#{mj}','#{xh}','#{cfwz}','#{bz}','#{boxstr}','#{rfidstr}','#{boxrfid}', #{qrq}, #{zrq}, '#{dalb}','0') returning id;"
        rid1 = $conn.exec(insert_str)
        ownerid = rid1[0]['id']
        puts insert_str
      end
      jnzs  = user['卷内张数']
      pzqh  = user['凭证起号']
      pzzh  = user['凭证止号']
      fjzs  = user['附件编号']
      insert_str =  " INSERT INTO a_jhcw(ownerid,dh,jnzs,pzqh,pzzh,fjzs)  VALUES (#{ownerid},'#{dh}','#{jnzs}','#{pzqh}','#{pzzh}','#{fjzs}');"
      #puts insert_str
      $conn.exec(" DELETE FROM a_jhcw where dh='#{dh}';")
      $conn.exec(insert_str)
      
    when 3,36,37,38,39  #土地登记
      djh   = user['地籍号']
      xmmc  = ''
      txqz=''
      dyrmc=''
      dyqrmc=''
      txqrrmc=''
      cjfr=''
      case dalb
        when 3
          qlrmc = user['权利人名称'].gsub("\\",'').gsub("、", " ")
          tdzl  = user['土地座落'].gsub("\\","~")
          qsxz  = user['权属性质']
          ydjh  = user['原地籍号']
          tdzh  = user['土地证号']
        when 36
          qlrmc = user['权利人名称'].gsub("\\",'').gsub("、", " ")  + ';' + user['查解封人'].gsub("\\",'').gsub("、", " ")
          tdzl  = user['土地座落'].gsub("\\","~")
          qsxz  = user['权属性质']
          ydjh  = user['原地籍号']
          tdzh  = user['土地证号']
          cjfr = user['查解封人']
        when 37  
          qlrmc = user['抵押权人名称'].gsub("\\",'').gsub("、", " ") + ';' + user['抵押人名称'].gsub("\\",'').gsub("、", " ")
          tdzl  = user['土地座落'].gsub("\\","~")
          qsxz  = user['权属性质']
          ydjh  = user['原地籍号']
          tdzh  = user['土地证号'] 
          txqz =  user['他项权证号'] 
          dyrmc = user['抵押人名称'].gsub("\\",'').gsub("、", " ")
          dyqrmc = user['抵押权人名称'].gsub("\\",'').gsub("、", " ")
        when 38
          qlrmc = user['义务人名称'].gsub("\\",'').gsub("、", " ")  + ';' + user['他项权人名称'].gsub("\\",'').gsub("、", " ")
          tdzl  = user['土地座落'].gsub("\\","~")
          qsxz  = user['权属性质']
          ydjh  = user['原地籍号']
          tdzh  = user['土地证号'] 
          txqz =  user['他项权证号'] 
          txqrrmc = user['他项权人名称'].gsub("\\",'').gsub("、", " ")          
        when 39
          qlrmc = user['用地单位'].gsub("\\",'').gsub("、", " ") + ';' + user['项目名称'].gsub("\\",'').gsub("、", " ")
          tdzl  = user['项目座落'].gsub("\\","~")
          qsxz  = user['权属性质']
          ydjh  = user['原地籍号']
          tdzh  = user['土地证号']
          xmmc  = user['项目名称']
      end
      

      insert_str = " INSERT INTO a_tddj(cjfr,txqrrmc,dyrmc,dyqrmc,txqz,xmmc,tdzh,ownerid,dh,djh,qlrmc,tdzl,qsxz,ydjh)  VALUES ('#{cjfr}','#{txqrrmc}','#{dyrmc}','#{dyqrmc}','#{txqz}','#{xmmc}','#{tdzh}',#{ownerid},'#{dh}','#{djh}','#{qlrmc}','#{tdzl}','#{qsxz}','#{ydjh}');"
      puts insert_str
      $conn.exec(" DELETE FROM a_tddj where dh='#{dh}';")
      $conn.exec(insert_str)
      
      update_str = " UPDATE archive set tm = '#{djh} ' ||'#{qlrmc} ' || '#{tdzl}' where dh='#{dh}'; "
      #puts update_str
      $conn.exec(update_str)
      
    when 4  #地籍管理
    when 10 #用地档案
    when 14 #监查案件
    when 15 #Image
    when 17 #土地规划
    when 18 #图件目录

      sxh  =  user['序号']
      tfh  =  user['图幅号']
      tgh  =  user['图柜号']
      insert_str =  " INSERT INTO a_tjml (dh, tfh, tgh, ownerid ) values ('#{dh}','#{tfh}', '#{tgh}', '#{ownerid}');"
      
      $conn.exec(" DELETE FROM a_tjml where dh='#{dh}';")
      $conn.exec(insert_str)

    when 19 #科技信息
    when 20 #照片档案
      
    when 21 #地址矿产
    when 24 #文书档案

      jh    = user['件号'].rjust(4,"0")
      rq    = user['制文日期'] 
      wh    = user['文号']
      zrr   = user['责任者'] 
      gb    = user['稿本']
      wz    = user['文种']
      ztgg  = user['载体规格']
      ztlx  = user['载体类型']
      ztdw  = user['载体单位']
      dagdh = user['档案馆代号']
      dzwdh = user['电子文档号']
      swh   = user['缩微号']
      ztsl  = user['载体数量']
      qwbs  = user['全文标识']
      ztc   = user['主题词']
      zbbm  = user['主办部门'] 
      nd    = user['年度']
      bgqx  = user['保管期限']
      jgwth = user['机构问题号']
      
      if rq.length==0
        zwrq = 'null' 
      elsif rq.length==4
        zwrq = "TIMESTAMP '#{rq}0101'"
      elsif rq.length==6
        zwrq = "TIMESTAMP '#{rq}01'"
      else    
        zwrq = "TIMESTAMP '#{rq}'"
      end
      if ztsl==""
        ztsl=0
      end
      insert_str =  " INSERT INTO a_wsda (ownerid,jh, zwrq, wh, zrr, gb, wz, ztgg, ztlx, ztdw, dagdh, dzwdh, swh, ztsl, qwbs, ztc, zbbm, dh, nd, bgqx, jgwth) values (#{ownerid},'#{jh}', #{zwrq}, '#{wh}', '#{zrr}', '#{gb}', '#{wz}', '#{ztgg}', '#{ztlx}', '#{ztdw}', '#{dagdh}', '#{dzwdh}', '#{swh}', '#{ztsl}', '#{qwbs}','#{ztc}','#{zbbm}','#{dh}', '#{nd}', '#{bgqx}', '#{jgwth}');"
      puts insert_str
      $conn.exec("DELETE from a_wsda where dh like '#{dh}';")
      $conn.exec(insert_str)
    when 25 #电子档案

      tjr         = user['提交人']
      rjhj        = user['软件环境']
      czxt        = user['操作系统']
      sl          = user['数量']
      bfs         = user['备份数']
      ztbhdwjgs   = user['载体包含的文件格式']
      yyrjpt      = user['应用软件平台']
      tjdw        = user['提交单位']
      wjzt        = user['文件载体']
      dzwjm       = user['电子文件名']
      ztbh        = user['载体编号']
      xcbm        = user['形成部门']
      rq          = user['形成日期']
      jsr         = user['接收人']
      jsdw        = user['接收单位'] 
      yjhj        = user['硬件环境']
      
      if rq.length==0
        xcrq = 'null' 
      elsif rq.length==4
        xcrq = "TIMESTAMP '#{rq}0101'"
      elsif rq.length==6
        xcrq = "TIMESTAMP '#{rq}01'"
      else
        begin
           Date.parse(rq)
        rescue
           rq = rq[0..5]+'01'
        end
        xcrq = "TIMESTAMP '#{rq}'"
      end
      insert_str =  "INSERT INTO a_dzda (dh, ownerid, tjr,rjhj,czxt,sl,bfs,ztbhdwjgs,yyrjpt,tjdw,wjzt,dzwjm,ztbh,xcbm,xcrq,jsr,jsdw,yjhj) values ('#{dh}', '#{ownerid}', '#{tjr}', '#{rjhj}', '#{czxt}', '#{sl}', '#{bfs}', '#{ztbhdwjgs}', '#{yyrjpt}', '#{tjdw}', '#{wjzt}', '#{dzwjm}', '#{ztbh}', '#{xcbm}', #{xcrq}, '#{jsr}', '#{jsdw}', '#{yjhj}');"

      #puts insert_str
      $conn.exec("DELETE from a_dzda where dh like '#{dh}';")
      $conn.exec(insert_str)
      
    when 26 #基建档案
      
      jsnd = user['建设年代']
      xmmc = user['项目名称']
      jsdw = user['建设单位']
      
      insert_str =  "INSERT INTO a_jjda (dh, ownerid, jsnd, xmmc, jsdw) values ('#{dh}', '#{ownerid}', '#{jsnd}', '#{xmmc}', '#{jsdw}');"

      #puts insert_str
      $conn.exec("DELETE from a_jjda where dh like '#{dh}';")
      $conn.exec(insert_str)
      
    when 27 #设备档案
      
      rsmlh=$conn.exec("select * FROM qzml_key where mlm='#{mlm}' and qzh='#{qzh}' and dalb='#{dalb}' and nd='#{flh}';")
      if rsmlh.count>0
        mlh=rsmlh[0]['id']
      else
        insertmlh=$conn.exec("INSERT INTO qzml_key(mlm,qzh,nd,dalb) VALUES ('#{mlm}','#{qzh}','#{flh}','#{dalb}') returning id;")
        mlh=insertmlh[0]['id']
      end
      dh = "#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
      rid=$conn.exec("select * FROM archive where dh='#{dh}';")
      if rid.count>0
        if rfidstr==''
          update_str="update archive set mlm='#{mlh}', mlh='#{mlm}',nd='#{nd}', bgqx='#{bgqx}', xh='#{xh}', cfwz='#{cfwz}', bz='#{bz}', flh='#{flh}', tm='#{tm}', ys=#{ys}, dh='#{dh}', zny='#{zny}', qny='#{qny}', js=#{js}, ajh='#{ajh}' where id = #{rid[0]['id']};"
          $conn.exec(update_str)
        else
          update_str="update archive set boxstr='#{boxstr}',rfidstr='#{rfidstr}',boxrfid='#{boxrfid}',mlm='#{mlh}', mlh='#{mlm}',nd='#{nd}', bgqx='#{bgqx}', xh='#{xh}', cfwz='#{cfwz}', bz='#{bz}', flh='#{flh}', tm='#{tm}', ys=#{ys}, dh='#{dh}', zny='#{zny}', qny='#{qny}', js=#{js}, ajh='#{ajh}' where id = #{rid[0]['id']};"
          $conn.exec(update_str)
        end
        puts update_str
        ownerid = rid[0]['id']
      else
        insert_str = " INSERT INTO archive(dh,dwdm,qzh,mlh,mlm,ajh,tm,flh,nd,zny,qny,js,ys,bgqx,mj,xh,cfwz,bz,boxstr,rfidstr,boxrfid,qrq,zrq,dalb,dyzt)  VALUES ('#{dh}','#{dwdm}','#{qzh}','#{mlm}','#{mlh}','#{ajh}','#{tm}','#{flh}','#{nd}','#{zny}','#{qny}',#{js},#{ys},'#{bgqx}','#{mj}','#{xh}','#{cfwz}','#{bz}','#{boxstr}','#{rfidstr}','#{boxrfid}', #{qrq}, #{zrq}, '#{dalb}','0') returning id;"
        rid1 = $conn.exec(insert_str)
        ownerid = rid1[0]['id']
        puts insert_str
      end
      zcmc   = user['资产名称']
      rq     = user['购置时间']
      dw     = user['单位']
      sl     = user['数量'].to_i
      cfdd   = user['存放地点']
      sybgdw = user['使用保管单位']
      sybgr  = user['使用保管人']
      jh     = user['件号']
      zcbh   = user['资产编号']
      dj     = user['单价']
      je     = user['金额']
      
      if rq.length==0
        gzsj = 'null' 
      elsif rq.length==4
        gzsj = "TIMESTAMP '#{rq}0101'"
      elsif rq.length==6
        gzsj = "TIMESTAMP '#{rq}01'"
      else
        begin
           Date.parse(rq)
        rescue
           rq = rq[0..5]+'01'
        end
        gzsj = "TIMESTAMP '#{rq}'"
      end
      
      insert_str = "INSERT INTO a_sbda (dh,ownerid,zcmc,gzsj,dw,sl,cfdd,sybgdw,sybgr,jh,zcbh,dj,je) values ('#{dh}','#{ownerid}','#{zcmc}',#{gzsj},'#{dw}','#{sl}','#{cfdd}','#{sybgdw}','#{sybgr}','#{jh}','#{zcbh}','#{dj}','#{je}');"

      #puts insert_str
      $conn.exec("DELETE from a_sbda where dh like '#{dh}';")
      $conn.exec(insert_str)
      
    when 28 #实物档案
      jh   = user['件号']
      bh   = user['编号']
      lb   = user['类别']
      hjz  = user['获奖者']
      rq   = user['授奖时间']
      sjdw = user['授奖单位']
      mc   = user['名称']
      ztxs = user['载体形式']
      
      if rq.length==0
        sjsj = 'null' 
      elsif rq.length==4
        sjsj = "TIMESTAMP '#{rq}0101'"
      elsif rq.length==6
        sjsj = "TIMESTAMP '#{rq}01'"
      else
        begin
           Date.parse(rq)
        rescue
           rq = rq[0..5]+'01'
        end
        sjsj = "TIMESTAMP '#{rq}'"
      end
      
      insert_str = "INSERT INTO a_swda (dh,ownerid, jh,bh,lb,hjz,sjsj,sjdw,mc,ztxs) values ('#{dh}','#{ownerid}', '#{jh}','#{bh}','#{lb}','#{hjz}',#{sjsj},'#{sjdw}','#{mc}','#{ztxs}');"

      #puts insert_str
      $conn.exec("DELETE from a_swda where dh like '#{dh}';")
      $conn.exec(insert_str) 
      when 29 #资料信息
        bh   = user['编号']
        lb   = user['类别']
        bzdw  = user['编制单位']
        
        dh = "#{qzh}-#{dalb}-#{mlh}-#{bh}"
        rid=$conn.exec("select * FROM archive where dh='#{dh}';")
        if rid.count>0
          if rfidstr==''
            update_str="update archive set mlm='#{mlh}', mlh='#{mlm}',nd='#{nd}', bgqx='#{bgqx}', xh='#{xh}', cfwz='#{cfwz}', bz='#{bz}', flh='#{flh}', tm='#{tm}', ys=#{ys}, dh='#{dh}', zny='#{zny}', qny='#{qny}', js=#{js}, ajh='#{ajh}' where id = #{rid[0]['id']};"
            $conn.exec(update_str)
          else
            update_str="update archive set boxstr='#{boxstr}',rfidstr='#{rfidstr}',boxrfid='#{boxrfid}',mlm='#{mlh}', mlh='#{mlm}',nd='#{nd}', bgqx='#{bgqx}', xh='#{xh}', cfwz='#{cfwz}', bz='#{bz}', flh='#{flh}', tm='#{tm}', ys=#{ys}, dh='#{dh}', zny='#{zny}', qny='#{qny}', js=#{js}, ajh='#{ajh}' where id = #{rid[0]['id']};"
            $conn.exec(update_str)
          end
          puts update_str
          ownerid = rid[0]['id']
        else
          insert_str = " INSERT INTO archive(dh,dwdm,qzh,mlh,mlm,ajh,tm,flh,nd,zny,qny,js,ys,bgqx,mj,xh,cfwz,bz,boxstr,rfidstr,boxrfid,qrq,zrq,dalb,dyzt)  VALUES ('#{dh}','#{dwdm}','#{qzh}','#{mlm}','#{mlh}','#{ajh}','#{tm}','#{flh}','#{nd}','#{zny}','#{qny}',#{js},#{ys},'#{bgqx}','#{mj}','#{xh}','#{cfwz}','#{bz}','#{boxstr}','#{rfidstr}','#{boxrfid}', #{qrq}, #{zrq}, '#{dalb}','0') returning id;"
          rid1 = $conn.exec(insert_str)
          ownerid = rid1[0]['id']
          puts insert_str
        end

        insert_str = "INSERT INTO a_zlxx (dh,ownerid, bh,lb,bzdm) values ('#{dh}','#{ownerid}', '#{bh}','#{lb}','#{bzdw}');"

        #puts insert_str
        $conn.exec("DELETE from a_zlxx where dh like '#{dh}';")
        $conn.exec(insert_str)     
    when 35 #矿业权
      
       xxkz  = user['现许可证号']
       yxkz  = user['原许可证号']
       kyqr  = user['矿业权人名称']
       ksmc  = user['矿山名称']
       ksbh  = user['矿山编号']
       ksgm  = user['矿山规模']
       xzqdm = user['行政区代码']
       kz    = user['矿种']
       djlx  = user['登记类型']
       kswz  = user['矿山位置']
       kqfw  = user['矿区范围'].gsub(/X|Y|：|:/, '').gsub(/，/, ' ')
       mj    = user['面积']
       cl    = user['储量']
       sjncl = user['实际年产量']
       clgm  = user['储量规模']
       yxqq  = user['有效期起']
       yxqz  = user['有效期止']
       yxqx  = user['有效期限']
       fzjg  = user['发证机关']
       mjdw  = user['面积单位']
       cldw  = user['储量单位']
       scgm  = user['生产规模']
       scldw = user['生产量单位']
       jjlx  = user['经济类型']
      
      insert_str =  " INSERT INTO a_kyq (ownerid,xxkz,yxkz,kyqr,ksmc,ksbh,ksgm,xzqdm,kz,djlx,kswz,kqfw,mj,cl,sjncl,clgm,yxqq,yxqz,yxqx,fzjg,mjdw,cldw,scgm,scldw,jjlx,dh) values (#{ownerid},'#{xxkz}','#{yxkz}','#{kyqr}','#{ksmc}','#{ksbh}','#{ksgm}','#{xzqdm}','#{kz}','#{djlx}','#{kswz}','#{kqfw}','#{mj}','#{cl}','#{sjncl}','#{clgm}','#{yxqq}','#{yxqz}','#{yxqx}','#{fzjg}','#{mjdw}','#{cldw}','#{scgm}','#{scldw}','#{jjlx}', '#{dh}');"
      #puts insert_str
      $conn.exec("DELETE from a_kyq where dh like '#{dh}';")
      $conn.exec(insert_str)
      update_str = " UPDATE archive set tm = '#{kyqr} ' ||'#{ksmc} ' || '#{kswz}' where dh='#{dh}'; "
      #puts update_str
      $conn.exec(update_str)
    else
      #puts "#{dalb}"  
    end
  end
end

# ********************************************************************************************
#
#   main fucntions 
#
#    @qzh ---
#    @mlh ---
#
#*********************************************************************************************
#ruby ./dady/bin/upload_mulu.rb  10用地档案jr.txt 泰州市国土资源局 4 17 &

if ARGV.count < 4
  $stderr.puts "usages : ruby ./dady/bin/upload_mulu.rb {aj_file} {dwdm} {qzh} {path}"
  $stderr.puts "         ruby ./dady/bin/upload_mulu.rb 10用地档案aj.txt 泰州市国土资源局 4 tz"
  exit
end

ifname, dwdm, qzh, pp = ARGV[0], ARGV[1], ARGV[2], ARGV[3]
statusid=[]
statusid<<0
statusid<<0
if !ARGV[4].nil?
  statusid=ARGV[4].split('-')
end

#puts "#{ifname}\t#{dwdm}\t#{qzh}\t#{pp}"

$qzml_mlh = {}
$wsda_mlh = {}

set_qzml(qzh)
set_wsda_mlh(qzh)

if ifname.include?('文档一体化')
  dalb = 24
  mlm = get_mlm(ifname)

  ss = /(\d+)(长期|永久|短期|定期-10年|定期-30年)(.*)(文档一体化.*)/.match(ifname)
  nd, bgqx, jgwth = ss[1], ss[2], ss[3]
  mlh = get_ws_mlh(qzh, nd, bgqx, jgwth)
  
else
  #mlh = /(\d+)(.*)/.match(ifname)[1]   ss[1], ss[2] = C-1 土地登记
  if !/(\w+-\d+)(.*)aj/.match(ifname).nil?
    mm = /(\w+-\d+)(.*)aj/.match(ifname)
    dalb = get_dalb(mm[2])
    mlm, mlh = mm[1], get_qzml(qzh, dalb, mm[1])
  elsif 
    !/(\d+\w+)(.*)aj/.match(ifname).nil?
      mm = /(\d+\w+)(.*)aj/.match(ifname)
      dalb = get_dalb(mm[2])
      mlm, mlh = mm[1], get_qzml(qzh, dalb, mm[1])
  elsif 
    !/(\d+-\w+)(.*)aj/.match(ifname).nil?
      mm = /(\d+-\w+)(.*)aj/.match(ifname)
      dalb = get_dalb(mm[2])
      mlm, mlh = mm[1], get_qzml(qzh, dalb, mm[1])
  elsif !/(\d+)(.*)aj/.match(ifname).nil?
    mm = /(\d+)(.*)aj/.match(ifname)
    dalb = get_dalb(mm[2])
    mlm, mlh = mm[1], get_qzml(qzh, dalb, mm[1])
      
  else
    puts "error: **** Unknow File  #{ifname} to process *****"
    exit
  end  
end

path = "./dady/tmp1/#{pp}"

if ifname.include?('aj')
  begin
    dh = "#{qzh}-#{dalb}-#{mlh}-%"
  
    $stderr.puts "processing #{ifname}, #{dh} ..."
  
    #delete any document connected to dh
    #puts "delete from archive where dh like '#{dh}'; "
    #$conn.exec("delete from archive where dh like '#{dh}'; ")
  
    outfile = rand(36**8).to_s(36)
    #puts "#{ifname}\t#{outfile}\t#{path}"
    decode_file("#{ifname}", "#{outfile}", path)
    data = File.open("#{path}/#{outfile}").read.gsub("\000","")
    #puts ActiveSupport::JSON.decode(data)
    set_archive(ActiveSupport::JSON.decode(data), dwdm, qzh, dalb.to_i, mlh, mlm)
    system ("rm #{path}/#{outfile}")
  
    if dalb != 24 && dalb!=25   && dalb!=28  && dalb!=29 && dalb!=18
      #puts "delete from document where dh like '#{dh}'; "
      #$conn.exec("delete from document where dh like '#{dh}'; ")
  
      outfile = rand(36**8).to_s(36)
      decode_file("#{ifname.gsub('aj','jr')}", "#{outfile}", path)
      data = File.open("#{path}/#{outfile}").read
      #puts ActiveSupport::JSON.decode(data)
      set_documents(ActiveSupport::JSON.decode(data), dwdm, qzh, dalb.to_i, mlh)
      system ("rm #{path}/#{outfile}")
    end

    update_owner

    #生成q_qzxx
    dh_prefix = "#{qzh}-#{dalb}-#{mlh}"
    $conn.exec("delete from q_qzxx where dh_prefix='#{dh_prefix}';")
    $conn.exec("insert into q_qzxx(qzh, dalb, mlh, mlm, dh_prefix, json) values (#{qzh}, #{dalb}, #{mlh}, '#{mlm}','#{dh_prefix}', '#{ifname}' );") 
    qzjh = $conn.exec("select min(ajh), max(ajh), sum(ys) as ys from archive where dh like '#{dh_prefix}-%';")
    $conn.exec("update q_qzxx set qajh=#{qzjh[0]['min'].to_i}, zajh=#{qzjh[0]['max'].to_i} where dh_prefix='#{dh_prefix}';")
    $conn.exec("update q_qzxx set ajys=(select sum(ys) from archive where dh like '#{dh_prefix}-%') where dh_prefix='#{dh_prefix}';")
    
    #生成timage_tj
    #$conn.exec("delete from timage_tj where dh like '#{dh_prefix}-%';")
    archives = $conn.exec("select distinct dh, ajh, ys from archive where dh like '#{qzh}-#{dalb}-#{mlh}-%' order by ajh;")
    puts "generating timage_tj files ..."
    for k in 0..archives.count-1
      ar = archives[k]
      $conn.exec("delete from timage_tj where dh = '#{ar['dh']}';")
      $conn.exec("insert into timage_tj(dh, dh_prefix, ajh, ajys, mlm) values ('#{ar['dh']}', '#{dh_prefix}', '#{ar['ajh']}', #{ar['ys']}, '#{mlm}');")
    end
    #update q_qzxx set ajys=(select sum(ys) from archive where archive.dh like q_qzxx.dh_prefix||'_%');
  rescue Exception => e
    puts ""
    puts e.backtrace
    puts ""
    puts e.message

    err=e.backtrace.to_s.gsub("'",'').gsub('"','') + e.message.to_s.gsub("'",'').gsub('"','')
    $conn.exec("update q_status set zt='出错',err='#{err}' where id=#{statusid[1]};")
  end
end 

$conn.close
