#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
require 'pg'

# split images to mulitple table, each table 10000 size.
#
#
BLOCK_SIZE = 10000 

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

if ARGV.count < 1
  puts "Usage: ruby export_dhp.rb dh_prefix outfilename" 
  puts "       ruby export_dhp.rb 9-3-3 9-24-1.130714 "
  exit
end  
dhp, f_name = ARGV[0], ARGV[1]
dhp_u  = dhp.gsub('-','_')

def check_disk_space
  system(' df --total | grep total > ff')
  ss = File.open('ff').read.split(/\s+/)
  system('rm ff')
  "#{ss[3]}"
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

def setStatus4(prompt, cur_pos, total_image, dhp)
  puts "===>#{prompt}, #{cur_pos}, #{total_image}, #{dhp}"
  percent = sprintf("%0.2f%",cur_pos*100.0/(total_image.to_f/BLOCK_SIZE))
  puts "#{Time.now.strftime("%D %T")}: #{prompt} #{percent}"
  $conn.exec("update b_status set zt='#{prompt} #{percent}' where dhp = '#{dhp}';")
end

def setStatus2(prompt, dhp)
  puts "#{Time.now.strftime("%D %T")}: #{prompt}"
  $conn.exec("update b_status set zt='#{prompt}' where dhp = '#{dhp}';")
end  

thr = Thread.new {
  #define table for archive
  tables = []

  #output images information
  ff = File.open("/share/#{f_name}.info.txt", 'w+')
  
  #select info from q_qzxx
  qzxx = $conn.exec("select dh_prefix, mlm, qajh, zajh, ajys, jnts, smyx, zt from q_qzxx where dh_prefix = '#{dhp}';")[0]
  ff.puts("dh_prefix, mlm, qajh, zajh, ajys, jnts, smyx, zt")
  ff.puts("#{qzxx['dh_prefix']}, #{qzxx['mlm']}, #{qzxx['qajh']}, #{qzxx['zajh']}, #{qzxx['ajys']}, #{qzxx['jnts']}, #{qzxx['smyx']}, #{qzxx['zt']}")
  
  #q_qzxx
  tables << "q_qzxx_#{dhp_u}" 
  $conn.exec("drop table IF EXISTS q_qzxx_#{dhp_u};")
  exec_str = "select * into q_qzxx_#{dhp_u} from q_qzxx where dh_prefix = '#{dhp}';"
  system ("sudo -u postgres psql -d JY1017 -c \" #{exec_str} \" ")
  
  #begin dump images
  info = $conn.exec("select count(*), sum(yxdx) from timage where dh like '#{dhp}-%';")[0]
  ff.puts("图像总数:#{info['count']},图像大小:#{info['sum']}")

  total_image = info['count'].to_i

  for kk in 0..total_image/BLOCK_SIZE
    if BLOCK_SIZE*kk < total_image
      setStatus4('选择影像数据',kk*BLOCK_SIZE, total_image, dhp)
      tables << "timage_#{dhp_u}_#{kk}" 
      $conn.exec("drop table IF EXISTS timage_#{dhp_u}_#{kk};")
      $conn.exec("select * into timage_#{dhp_u}_#{kk} from timage where dh like '#{dhp}-%' offset #{BLOCK_SIZE*kk} order by id limit #{BLOCK_SIZE};") 
      info = $conn.exec("select count(*), sum(yxdx) from timage_#{dhp_u}_#{kk};")[0]
      ff.puts("timage_#{dhp_u}_#{kk}:图像数量:#{info['count']},图像大小:#{info['sum']}")
    end    
  end
  
  
  #Archive tables 
  #==== Archive, Document and others ===
  setStatus2('选择输档数据...', dhp)
  
  tables << "archive_#{dhp_u}" 
  $conn.exec("drop table IF EXISTS archive_#{dhp_u};")
  exec_str = "select * into archive_#{dhp_u} from archive where dh like '#{dhp}-%';"
  system ("sudo -u postgres psql -d JY1017 -c \" #{exec_str} \" ")
  info = $conn.exec("select count(*), sum(js) as js, sum(ys) as ys from archive_#{dhp_u};")[0] 
  ff.puts("archive_#{dhp_u}:档案总数:#{info['count']},总件数:#{info['js']},总页数:#{info['ys']}")

  setStatus2('备份输档数据...', dhp)

  tables << "document_#{dhp_u}" 
  $conn.exec("drop table IF EXISTS document_#{dhp_u};")
  exec_str = "select * into document_#{dhp_u} from document where dh like '#{dhp}-%';"
  system ("sudo -u postgres psql -d JY1017 -c \" #{exec_str} \" ")
  info = $conn.exec("select count(*) from document_#{dhp_u};")[0] 
  ff.puts("document_#{dhp_u}:档案总数:#{info['count']}")
  

  t_name = get_table_name(dhp)
  if t_name != ""
    
    tables << "#{t_name}_#{dhp_u}" 
    setStatus2("备份#{t_name}数据...", dhp)
    $conn.exec("drop table IF EXISTS #{t_name}_#{dhp_u};")
    exec_str = exec_str = "select * into #{t_name}_#{dhp_u} from #{t_name} where dh like '#{dhp}-%';"
    system ("sudo -u postgres psql -d JY1017 -c \" #{exec_str} \" ")
    info = $conn.exec("select count(*) from #{t_name}_#{dhp_u};")[0] 
    ff.puts("#{t_name}_#{dhp_u}:档案总数:#{info['count']}")
    
  end
  
  ff.puts "tables:#{tables.join('|')}"
  
  setStatus2('输出影像到文件...', dhp)
  table_str = ''
  tables.each do |table|
    table_str = table_str +"-t #{table} "
  end
  
  puts "sudo -u postgres pg_dump -Fc  -f '/share/#{f_name}.archive.backup' #{table_str} JY1017"
  system("sudo -u postgres pg_dump -Fc  -f '/share/#{f_name}.archive.backup' #{table_str} JY1017")
  
  
  setStatus2('删除临时表...', dhp)
  tables.each do |table|
    system ("sudo -u postgres psql -d JY1017 -c \"drop table IF EXISTS #{table} \"")
  end

  #update b_status files
  puts "#{Time.now.strftime("%D %T")}: File dump to /share/#{f_name}.archive.backup, All work done "
  f_size = File.stat("/share/#{f_name}.archive.backup").size
  $conn.exec("update b_status set zt='导出完成', f_size = #{f_size} where dhp = '#{dhp}';")
  ff.close
  
  $b_running = false
}

count = 0 
while $b_running do
  sleep(1)
  count = (count + 1) % 60
  if count == 0  && File.exist?("/share/#{f_name}.archive.backup")
    f_size = File.stat("/share/#{f_name}.archive.backup").size
    $conn.exec("update b_status set f_size = #{f_size} where dhp = '#{dhp}';")

    ss = check_disk_space
    
    if ss.to_i < 5000000
      puts "low disk space exit..."
      $conn.exec("update b_status set zt='硬盘空间不足...' where dhp = '#{dhp}';")
      ff.close
      thr.exit
      $b_running = false
    end
  end  
end

puts "#{Time.now.strftime('%D %T')}: 备份结束."

$conn.close  

