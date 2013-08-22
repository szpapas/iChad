#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'

def check_disk_space
  system('df | grep debug > ff')
  ss = File.open('ff').read.split(/\s+/)
  system('rm ff')
  "#{ss[3]}"
  "10"
end

def setStatus4(prompt, cur_pos, total, dhp)
  percent = sprintf("%0.2f%",cur_pos*100.0/(total/BLOCK_SIZE))
  puts "#{Time.now.strftime("%D %T")}: #{prompt} #{percent}"
  $conn.exec("update b_status set zt='#{prompt} #{percent}' where dhp = '#{dhp}';")
end

def setStatus2(prompt, dhp)
  puts "#{Time.now.strftime("%D %T")}: #{prompt}"
  $conn.exec("update b_status set zt='#{prompt}' where dhp = '#{dhp}';")
end  

fields = {}
fields["a_by_dsj"] = "dd,jlr,clly,fsrq,jlrq,rw,sy,yg,ownerid,dh"
fields["a_by_jcszhb"] = "zt,qy,tjsj,sm,ownerid,dh"
fields["a_by_qzsm"] = "qzgczjj,sj,ownerid,dh"
fields["a_by_tszlhj"] = "djh,kq,mc,fs,yfdm,cbrq,dj,ownerid,dh"
fields["a_by_zzjgyg"] = "jgmc,zzzc,qzny,ownerid,dh"
fields["a_dzda"] = "tjr,rjhj,czxt,sl,bfs,ztbhdwjgs,yyrjpt,tjdw,wjzt,dzwjm,ztbh,xcbm,xcrq,jsr,jsdw,yjhj,ownerid,dh"
fields["a_jhcw"] = "jnzs,fjzs,pzqh,ownerid,dh,pzzh"
fields["a_jjda"] = "jsnd,ownerid,dh,xmmc,jsdw"
fields["a_kyq"] = "xxkz,yxkz,kyqr,ksmc,ksbh,ksgm,xzqdm,kz,djlx,kswz,kqfw,mj,cl,sjncl,clgm,yxqq,yxqz,yxqx,fzjg,mjdw,cldw,scgm,scldw,jjlx,ownerid,dh"
fields["a_sbda"] = "zcmc,gzsj,dw,sl,cfdd,sybgdw,sybgr,jh,zcbh,dj,ownerid,dh,je"
fields["a_swda"] = "jh,bh,lb,hjz,sjsj,sjdw,ownerid,dh,mc,ztxs"
fields["a_sx"] = "zl,ownerid"
fields["a_tddj"] = "djh,qlrmc,qsxz,ydjh,ownerid,dh,tdzh,tfh,cjfr,dyrmc,dyqrmc,txqz,ywrmc,txqrrmc,xmmc,tdzl"
fields["a_tjda"] = "sxh,tfh,tgh,tmc,ownerid,dh"
fields["a_tjml"] = "tfh,tgh,ownerid,dh"
fields["a_wsda"] = "jh,zwrq,wh,zrr,gb,wz,ztgg,ztlx,ztdw,dagdh,dzwdh,swh,qwbs,ztc,zbbm,ownerid,dh,ztsl,hh,nd,bgqx,jgwth,gbjh,xbbm"
fields["a_zlxx"] = "bh,lb,bzdw,ownerid,dh"
fields["a_zp"] = "psrq,zph,dh,psz,cfwz,ownerid,sy,dd,rw,bj"
fields["archive"] = "dh,dwdm,qzh,mlh,ajh,tm,flh,nd,zrq,qrq,js,ys,bgqx,mj,xh,cfwz,bz,boxstr,rfidstr,boxrfid,qny,zny,dalb,dyzt,mlm"
fields["document"] = "tm,sxh,yh,wh,zrz,rq,bz,dh,ownerid"
fields["timage"] = "dh,yxmc,yxbh,yxdx,data,meta,meta_tz,pixel,dh_prefix,height,width,sfzs,tag,jm_tag,md5,v_hash"


#check arguments parameters
if ARGV.count < 1
  puts "Usage: ruby import_dhp_temp.rb dh_prefix.timestamp" 
  puts "       ruby import_dhp_temp.rb 9-24-1.130714 "
  exit
end  

#check info file
f_name = ARGV[0]
if !File.exists?("/share/#{f_name}.info.txt") || !File.exists?("/share/#{f_name}.archive.backup")
  puts "Error: Files do not exists"
  exit
end  

#check tables
tables = []
ff = File.open("/share/#{f_name}.info.txt").each_line do |line|
  if line.include?"tables"
    tables = line.chomp!.split(":")[1].split('|')
  end
end

if tables.size == 0
  puts "Error: Tables do not exists"
  exit
end  


$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$b_running = true

dhp    = f_name.split('.')[0]
dhp_u  = dhp.gsub('-','_')


thr = Thread.new {

  #drop temp tables if exists
  
  tables.each do |table|
    system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS #{table}; \"")
  end
  
  #restore all files
  system ("sudo -u postgres pg_restore -d JY1017 '/share/#{f_name}.archive.backup' ")

  #delete original files and insert new files
  
  bDeleted = false
  tables.each do |table|
     t_name = table.gsub("_#{dhp_u}",'')
     setStatus2("恢复#{t_name}", dhp)
      
     #delete files   
     if t_name.include?'timage' 
       if bDeleted == false
         system "sudo -u postgres psql -d JY1017 -c \"delete from timage where dh like'#{dhp}-%';\""
         bDeleted = true
       end   
     else
       system "sudo -u postgres psql -d JY1017 -c \"delete from #{t_name} where dh like'#{dhp}-%';\""   
     end
     
     #restore tables
     if t_name.include?'timage'
       system "sudo -u postgres psql -d JY1017 -c \"insert into timage (#{fields['timage']}) select #{fields['timage']} from #{table}; \"" 
     else    
       system "sudo -u postgres psql -d JY1017 -c \"insert into #{t_name} (#{fields[t_name]}) select #{fields[t_name]} from #{table}; \"" 
     end         
  end  
  
  tables.each do |table|
    system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS #{table}; \"")
  end

  puts "#{Time.now.strftime("%D %T")}:All work done "
  $conn.exec("update b_status set zt='恢复完成' where dhp = '#{dhp}';")
  
  $b_running = false
}

count = 0 
while $b_running do
  sleep(10)
  count = (count + 1) % 60
  if count == 0   
    ss = check_disk_space
    #if diskspace less than 5G
    if ss.to_i < 5
      puts "low disk space exit..."
      $conn.exec("update b_status set zt='硬盘空间不足...' where dhp = '#{dhp}';")
      thr.exit
      $b_running = false
    end
  end  
end

puts "#{Time.now.strftime('%D %T')}: 恢复结束."

$conn.close