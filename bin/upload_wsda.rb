#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/' << '/Library/Ruby/Gems/1.8/gems/activesupport-2.3.5/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib'

require 'pg'
require 'active_support'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = on")


$wsda_mlh = {}

def set_wsda_mlh (qzh)
  $wsda_mlh={}
  wsml = $conn.exec("select * from a_wsda_key where qzh='#{qzh}' order by id ;")
  for k in 0..wsml.count - 1 
    ws = wsml[k]
    ws_key = "#{ws['qzh']}-#{ws['nd']}-#{ws['bgqx']}-#{ws['jgwth']}"
    $wsda_mlh[ws_key] = ws['id']
  end
end

def get_mlh(qzh, nd, bgqx, jgwth)
  ws_key = "#{qzh}-#{nd}-#{bgqx}-#{jgwth}"
  if $wsda_mlh[ws_key].nil?
    $conn.exec("insert into a_wsda_key(qzh, nd, bgqx, jgwth) values('#{qzh}','#{nd}','#{bgqx}','#{jgwth}');")
    set_wsda_mlh(qzh)
  end 
  $wsda_mlh[ws_key]   
end

def get_mlm(ifname)
  ss=/(.*)(文档一体化.*)/.match(ifname)
  mlh=ss[1]
end

def decode_file (infile, outfile, path)
  newfile = rand(36**8).to_s(36)
  system("iconv -t UTF-8 -f GB18030  #{path}/#{infile} > #{path}/#{newfile}")
  ss = File.open("#{path}/#{newfile}").read
  x= ActiveSupport::JSON.encode(ss).gsub(/\\n/, '').gsub("'","\"").gsub(/\\r/,'')
  ff = File.open("#{path}/#{outfile}","w+")
  ff.write(x[1..-2])
  ff.close
  system("rm #{path}/#{newfile}")
end

def set_archive(tt, dwdm, qzh, dalb, mlh)
  for k in 0..tt.size-1 
    user = tt[k]['Table']
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
    ajh = user['件号'] if ajh.nil?
    ajh = user['序号'] if ajh.nil?
    ajh = ajh.rjust(4,"0")
    
    js = 1 if js == 0
    
    if dalb==24
      ajh = user['件号']
      dh = "#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
    else  
      dh = "#{qzh}-#{dalb}-#{mlh}-#{ajh.to_i}"
    end
    
    if nd.nil? || nd==''
      $stderr.puts "错误： 年度为空了： #{dh}, 档案类别： #{dalb}, 目录号：#{mlh}, 案卷号： #{ajh}"
      $stderr.puts 
      nd='1900'
    end  
    
    if qrq.nil?
      if qny.nil? || qny == ''
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

    insert_str = " INSERT INTO archive(dh,dwdm,qzh,mlh,ajh,tm,flh,nd,zny,qny,js,ys,bgqx,mj,xh,cfwz,bz,boxstr,rfidstr,boxrfid,qrq,zrq,dalb,dyzt)  VALUES ('#{dh}','#{dwdm}','#{qzh}','#{mlh}','#{ajh}','#{tm}','#{flh}','#{nd}','#{zny}','#{qny}',#{js},#{ys},'#{bgqx}','#{mj}','#{xh}','#{cfwz}','#{bz}','#{boxstr}','#{rfidstr}','#{boxrfid}', TIMESTAMP '#{qrq}', TIMESTAMP '#{zrq}', '#{dalb}','0');"
    #puts insert_str
    $conn.exec(insert_str)
    
    case dalb
    when 0  #综合档案 
    when 2  #财务档案
      jnzs  = user['卷内张数']
      pzqh  = user['凭证起号']
      pzzh  = user['凭证止号']
      fjzs  = user['附件编号']
      insert_str =  "INSERT INTO a_jhcw(dh,jnzs,pzqh,pzzh,fjzs)  VALUES ('#{dh}','#{jnzs}','#{pzqh}','#{pzzh}','#{fjzs}');"
      #puts insert_str
      $conn.exec(" DELETE FROM a_jhcw where dh='#{dh}';")
      $conn.exec(insert_str)
      
    when 3  #土地登记
      djh   = user['地籍号']
      qlrmc = user['权利人名称'].gsub("\\",'').gsub("、", " ")
      tdzl  = user['土地座落'].gsub("\\","~")
      qsxz  = user['权属性质']
      ydjh  = user['原地籍号']

      insert_str = " INSERT INTO a_tddj(dh,djh,qlrmc,tdzl,qsxz,ydjh)  VALUES ('#{dh}','#{djh}','#{qlrmc}','#{tdzl}','#{qsxz}','#{ydjh}');"
      #puts insert_str
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
      insert_str =  " INSERT INTO a_tjda (sxh, tfh, tgh ) values ('#{sxh}', '#{tfh}', '#{tgh}');"
      #puts insert_str
      $conn.exec("DELETE from a_wsda where dh like '#{dh}';")
      $conn.exec(insert_str)

    when 19 #科技信息
    when 20 #照片档案
    when 21 #地址矿产
    when 24 #文书档案

      jh    = user['件号']
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
      
      insert_str =  " INSERT INTO a_wsda (jh, zwrq, wh, zrr, gb, wz, ztgg, ztlx, ztdw, dagdh, dzwdh, swh, ztsl, qwbs, ztc, zbbm, dh, nd, bgqx, jgwth) values ('#{jh}', #{zwrq}, '#{wh}', '#{zrr}', '#{gb}', '#{wz}', '#{ztgg}', '#{ztlx}', '#{ztdw}', '#{dagdh}', '#{dzwdh}', '#{swh}', '#{ztsl}', '#{qwbs}','#{ztc}','#{zbbm}','#{dh}', '#{nd}', '#{bgqx}', '#{jgwth}');"
      #puts insert_str
      $conn.exec("DELETE from a_wsda where dh like '#{dh}';")
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
      
      insert_str =  " INSERT INTO a_kyq (xxkz,yxkz,kyqr,ksmc,ksbh,ksgm,xzqdm,kz,djlx,kswz,kqfw,mj,cl,sjncl,clgm,yxqq,yxqz,yxqx,fzjg,mjdw,cldw,scgm,scldw,jjlx,dh) values ('#{xxkz}','#{yxkz}','#{kyqr}','#{ksmc}','#{ksbh}','#{ksgm}','#{xzqdm}','#{kz}','#{djlx}','#{kswz}','#{kqfw}','#{mj}','#{cl}','#{sjncl}','#{clgm}','#{yxqq}','#{yxqz}','#{yxqx}','#{fzjg}','#{mjdw}','#{cldw}','#{scgm}','#{scldw}','#{jjlx}', '#{dh}');"
      #puts insert_str
      $conn.exec("DELETE from a_kyq where dh like '#{dh}';")
      $conn.exec(insert_str)
      
    else
      #puts "#{dalb}"  
    end
  end
end

if ARGV.count < 4 
  $stderr.puts "usages : ruby ./dady/bin/upload_wsda.rb {aj_file} {dwdm} {qzh} {path}"
  $stderr.puts "         ruby ./dady/bin/upload_wsda.rb 2004短期0000文档一体化aj.txt 无锡市国土资源局 9 wx"
  exit
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
  $stderr.puts "usages : ruby ./dady/bin/upload_wsda.rb {aj_file} {dwdm} {qzh} {path}"
  $stderr.puts "         ruby ./dady/bin/upload_wsda.rb 无锡市国土资源局 9 wx"
  exit
end

ifname, dwdm, qzh, pp = ARGV[0], ARGV[1], ARGV[2], ARGV[3]
ss = /(\d+)(长期|永久|短期|定期-10年|定期-30年)(.*)(文档一体化.*)/.match(ifname)

#qzh, nd, bgqx, jgwth
nd, bgqx, jgwth = ss[1], ss[2], ss[3]
mlh = get_mlh(qzh, nd, bgqx, jgwth)  
dalb = "24"

path = "./dady/tmp1/#{pp}"

dh = "#{qzh}-#{dalb}-#{mlh}-%"
$stderr.puts "processing #{ifname}, #{dh} ..."
$conn.exec("delete from archive where dh like '#{dh}'; ")

outfile = rand(36**8).to_s(36)
decode_file("#{ifname}", "#{outfile}", path)
data = File.open("#{path}/#{outfile}").read.gsub("\000","")
set_archive(ActiveSupport::JSON.decode(data), dwdm, qzh, dalb.to_i, mlh)
system ("rm -rf #{path}/#{outfile}")

$conn.exec("update a_wsda set ownerid=archive.id from archive where archive.dh=a_wsda.dh and a_wsda.ownerid is null;")

mlm = get_mlm(ifname)
     
#生成q_qzxx
dh_prefix = "#{qzh}-#{dalb}-#{mlh}"
$conn.exec("delete from q_qzxx where dh_prefix='#{dh_prefix}';")
$conn.exec("insert into q_qzxx(qzh, dalb, mlh, mlm, dh_prefix, json) values (#{qzh}, #{dalb}, #{mlh}, '#{mlm}','#{dh_prefix}', '#{ifname}' );") 
qzjh = $conn.exec("select min(ajh), max(ajh), sum(ys) as ys from archive where dh like '#{dh_prefix}-%';")
$conn.exec("update q_qzxx set qajh=#{qzjh[0]['min'].to_i}, zajh=#{qzjh[0]['max'].to_i} where dh_prefix='#{dh_prefix}';")
$conn.exec("update q_qzxx set ajys=(select sum(ys) from archive where dh like '#{dh_prefix}-%') where dh_prefix='#{dh_prefix}';")
  
#生成timage_tj
$conn.exec("delete from timage_tj where dh like '#{dh_prefix}-%';")
archives = $conn.exec("select distinct dh, ajh, ys from archive where dh like '#{qzh}-#{dalb}-#{mlh}-%' order by ajh;")
puts "generating timage_tj files ..."
for k in 0..archives.count-1
  ar = archives[k]
  $conn.exec("insert into timage_tj(dh, dh_prefix, ajh, ajys) values ('#{ar['dh']}', '#{dh_prefix}', '#{ar['ajh']}', #{ar['ys']});")
end

$conn.close