#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
require 'pg'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

if ARGV.count < 1
  puts "Usage: ruby import_dhp.rb dh_prefix infilename" 
  puts "       ruby import_dhp.rb 9-24-1.130714 "
  exit
end  
dhp, f_name = ARGV[0], ARGV[1]
dhp_u  = dhp.gsub('-','_')

def check_disk_space
  system('df -H | grep debug > ff')
  ss = File.open('ff').read.split(/\s+/)
  system('rm ff')
  "#{ss[3]}"
  "10"
end


def get_table_name(dhp)
  t_name = ''
  dalb = dhp.split('-')[1]
  case dalb.to_i
  when 0  #综合档案 
  when 2  #财务档案
  when 3,36,37,38,39  #土地登记
    t_name = "a_tddj"
  when 4  #地籍管理
  when 10 #用地档案
  when 14 #监查案件
  when 15 #Image
  when 17 #土地规划
  when 18 #图件目录
    t_name = "a_tjml" 
  when 19 #科技信息
  when 20 #Image
    t_name = "a_zp"
  when 21 #地址矿产
  when 24 #文书档案
    t_name = "a_wsda"
  when 25 #电子档案
    t_name = "a_dzda"
  when 26 #基建档案
    t_name = "a_jjda"  
  when 27 #设备档案
    t_name = "a_sbda"
  when 28 #实物档案
    t_name = "a_swda"
  when 29 #资料信息
    t_name = "a_zlxx"
  when 35 #矿业权
    t_name = "a_kyq"
  else
    t_name = ""
  end
  t_name
end


$b_running = true

thr = Thread.new {

  puts "#{Time.now.strftime("%D %T")}: 准备数据库... "
  $conn.exec("update b_status set zt='准备数据库' where dhp = '#{dhp}';")
  system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS timage_#{dhp_u}; \"")

  puts "#{Time.now.strftime("%D %T")}: 删除原来数据库中影像... "
  $conn.exec("update b_status set zt='删除数据库中影像' where dhp = '#{dhp}';")
  system ("sudo -u postgres psql -d JY1017 -c \"delete from timage where dh like'#{dhp}-%';\"")
  
  puts "#{Time.now.strftime("%D %T")}: 恢复到临时表... "
  $conn.exec("update b_status set zt='恢复到临时表' where dhp = '#{dhp}';")
  system ("sudo -u postgres pg_restore -d JY1017 '/share/#{f_name}.timage.backup' ")


  puts "#{Time.now.strftime("%D %T")}: 恢复到影像表... "
  $conn.exec("update b_status set zt='恢复到影像表' where dhp = '#{dhp}';")
  system ("sudo -u postgres psql -d JY1017 -c \"insert into timage select * from timage_#{dhp_u}; \"")

  puts "#{Time.now.strftime("%D %T")}: 删除临时影像表... "
  $conn.exec("update b_status set zt='删除临时影像表' where dhp = '#{dhp}';")
  
  system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS timage_#{dhp_u} \"")
  
  puts "#{Time.now.strftime("%D %T")}: '选择输档数据...' "
  $conn.exec("update b_status set zt='选择输档数据' where dhp = '#{dhp}';")
  
  #Restore Archive/Documents and other table

  t_name = get_table_name(dhp)
  system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS document_#{dhp_u}; \"")
  system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS archive_#{dhp_u}; \"")
  if t_name != ""
    system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS #{t_name}_#{dhp_u}; \"")
  end

  system ("sudo -u postgres pg_restore -d JY1017 '/share/#{f_name}.archive.backup' ")

  system ("sudo -u postgres psql -d JY1017 -c \"delete from archive where dh like'#{dhp}-%';\"")
  system ("sudo -u postgres psql -d JY1017 -c \"insert into archive select * from archive_#{dhp_u}; \"")

  system ("sudo -u postgres psql -d JY1017 -c \"delete from document where dh like'#{dhp}-%';\"")
  system ("sudo -u postgres psql -d JY1017 -c \"insert into document select * from document_#{dhp_u}; \"")

  if t_name != ""
    system ("sudo -u postgres psql -d JY1017 -c \"delete from #{t_name} where dh like'#{dhp}-%';\"")
    system ("sudo -u postgres psql -d JY1017 -c \"insert into #{t_name} select * from #{t_name}_#{dhp_u}; \"")    
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