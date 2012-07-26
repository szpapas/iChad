#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.11.0/lib/' << '/Library/Ruby/Gems/1.8/gems/activesupport-2.3.5/lib/'
#$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib'
#$:<<'/usr/share/devicemgr/backend/vendor/gems/pg-0.9.0/lib/'  << '/Library/Ruby/Gems/1.8/gems/activesupport-2.3.5/lib'

require 'pg'
require 'active_support'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = on")

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

def set_sfw(tt, qzh, sfw_tbl)
  if sfw_tbl=='doc_fw'
    for k in 0..tt.size-1 
      user = tt[k]['Table']
      fwrq = user['发文日期']
      bgqx = user['保管期限']
      fwbh = user['发文编号']
      wh   = user['文号']
      zrz  = user['责任者']
      qfr  = user['签发人']
      zsdw = user['主送单位']
      cbdw = user['抄报单位']
      csdw = user['抄送单位']
      xfdw = user['下发单位']
      tm   = user['题名']
      ztc1 = user['主题词1']
      ztc2 = user['主题词2']
      ztc3 = user['主题词3']
      dyfs = user['打印份数']
      ys   = user['页数']
      mj   = user['密级']
      bz   = user['备注']
      sfyglsk = user['是否已归临时库']
      mlh  = user['目录号']
      ajh  = user['案卷号']
      jgwt = user['机构问题号']
      zdnd = user['归档年度']
      zwrq = user['制文日期']
      sfygd = user['是否已归档']
      
      ys = '1'   if ys.to_i==0
      fwbh = '0' if fwbh.to_i==0
      dyfs = '0' if dyfs.to_i==0
      
      zwrq = zwrq[0..3]+'0'+zqrq[4..6] if zwrq.size==7
      fwrq = fwrq[0..3]+'0'+fwrq[4..6] if fwrq.size==7      
        
      zwrq = (zwrq.nil? || zwrq=="") ? 'NULL' : "TIMESTAMP '#{zwrq}'" 
      fwrq = (fwrq.nil? || fwrq=="") ? 'NULL' : "TIMESTAMP '#{fwrq}'" 

      
      insert_str = " INSERT INTO doc_fw(ajh,bgqx,bz,cbdw,csdw,dyfs,fwbh,fwrq,jgwt,mj,mlh,qfr,qzh,sfyglsk,tm,wh,xfdw,ys,zdnd,zrz,zsdw,ztc1,ztc2,ztc3,zwrq,sfygd)  VALUES ('#{ajh}','#{bgqx}','#{bz}','#{cbdw}','#{csdw}',#{dyfs},#{fwbh},#{fwrq},'#{jgwt}','#{mj}','#{mlh}','#{qfr}','#{qzh}','#{sfyglsk}','#{tm}','#{wh}','#{xfdw}',#{ys},'#{zdnd}','#{zrz}','#{zsdw}','#{ztc1}','#{ztc2}','#{ztc3}',#{zwrq},'#{sfygd}');"
      puts insert_str
      
      #$conn.exec(insert_str)
    end
    
  else
    for k in 0..tt.size-1 
      user = tt[k]['Table']
      
      swrq = user['收文日期']
      bgqx = user['保管期限']
      yfrq = user['印发日期']
      swbh = user['收文编号']
      lwjg = user['来文机关']
      wh  = user['文号']	 
      mj  = user['密级']	 
      tm  = user['题名']	 
      fs  = user['份数']	 
      ys  = user['页数']	 
      blqk = user['办理情况']
      zwdw = user['转往单位']
      zcfs = user['转出份数']
      szqm = user['收者签名']
      qtfs = user['清退份数']
      xhfs = user['销毁份数']
      bz  = user['备注']	 
      mlh = user['目录号']	
      ajh = user['案卷号']	
      sfyglsk = user['是否已归临时库']
      jgwt = user['机构问题号']
      zdnd = user['归档年度']	
      zwrq  = user['制文日期']
      zrz = user['责任者']
      sfygd = user['是否已归档']	

      ys   = '1' if ys.to_i==0
      swbh = '0' if swbh.to_i==0
      fs   = '0' if fs.to_i==0
      zcfs = '0' if zcfs.to_i==0
      qtfs = '0' if qtfs.to_i==0
      xhfs = '0' if xhfs.to_i==0


      swrq = swrq[0..3]+'0'+swrq[4..6] if swrq.size==7
      zwrq = zwrq[0..3]+'0'+zwrq[4..6] if zwrq.size==7
      yfrq = yfrq[0..3]+'0'+yfrq[4..6] if yfrq.size==7
      
      swrq = (swrq.nil? || swrq=="") ? 'NULL' : "TIMESTAMP '#{swrq}'" 
      zwrq = (zwrq.nil? || zwrq=="") ? 'NULL' : "TIMESTAMP '#{zwrq}'" 
      yfrq = (yfrq.nil? || yfrq=="") ? 'NULL' : "TIMESTAMP '#{yfrq}'"
      
      

       
      insert_str = " INSERT INTO doc_sw(bgqx,blqk,bz,fs,jgwt,lwjg,mj,qtfs,qzh,sfyglsk,swbh,swrq,szqm,tm,wh,xhfs,yfrq,ys,zcfs,zdnd,zrz,zwdw,zwrq,sfygd)  VALUES ('#{bgqx}','#{blqk}','#{bz}',#{fs},'#{jgwt}','#{lwjg}','#{mj}',#{qtfs},'#{qzh}','#{sfyglsk}',#{swbh},#{swrq},'#{szqm}','#{tm}','#{wh}',#{xhfs},#{yfrq},#{ys},#{zcfs},'#{zdnd}','#{zrz}','#{zwdw}',#{zwrq}, '#{sfygd}');"
      puts insert_str
      
      #$conn.exec(insert_str)
    end
  end    
end

if ARGV.count < 4 
  $stderr.puts "usages : ruby ./dady/bin/upload_sfw.rb {aj_file} {dwdm} {qzh} {path}"
  $stderr.puts "         ruby ./dady/bin/upload_sfw.rb 发文登记aj.txt 无锡市国土资源局 9 wx"
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
  $stderr.puts "usages : ruby ./dady/bin/upload_sfw.rb {aj_file} {dwdm} {qzh} {path}"
  $stderr.puts "         ruby ./dady/bin/upload_sfw.rb 发文登记aj.txt 无锡市国土资源局 9 wx"
  exit
end

ifname, dwdm, qzh, pp = ARGV[0], ARGV[1], ARGV[2], ARGV[3]
ss = /(发文|收文)(.*)(aj.*)/.match(ifname)

#qzh, nd, bgqx, jgwth
sfw = ss[1]
path = "./dady/tmp1/#{pp}"

$stderr.puts "processing #{ifname} ..."

sfw_tbl = (ss[1]=="发文")?  'doc_fw' : 'doc_sw'
$conn.exec("delete from #{sfw_tbl} where qzh='#{qzh}';")

outfile = rand(36**8).to_s(36)
decode_file("#{ifname}", "#{outfile}", path)
data = File.open("#{path}/#{outfile}").read.gsub("\000","")
set_sfw(ActiveSupport::JSON.decode(data), qzh, sfw_tbl)
system ("rm -rf #{path}/#{outfile}")


$conn.close