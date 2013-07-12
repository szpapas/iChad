$:<<'/usr/local/lib/ruby/gems/1.8/gems/ruby-oci8-2.0.4/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'

require 'pg'
require 'oci8'

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
#del_tmp=$conn.exec("delete from d_tddj_tmp;")
conn1 = OCI8.new("tddj_cs", "gtis","orcl_10.5.6.16")
a =[]
#spbh='常国用(2011)第01567号'
tmpid=ARGV[1]
spbh=ARGV[0]
spbh=spbh.gsub('_','(').gsub('-',')')
#执行查询操作
cursor = conn1.exec("select DJH,RF1_DWMC,ZL,TDZH,SPBH,QSXZ from  ZD_QSSP where SPBH='#{spbh}'") { |r| a<<r; puts r.join}
if a.count>0
  #insert_tmp=$conn.exec("insert into d_tddj_tmp (djh,zl,qlr,qsxz) values ('#{a[0][0]}','#{a[0][2]}','#{a[0][1]}','#{a[0][5]}');")
  insert_tmp=$conn.exec("update d_tddj_tmp set djh='#{a[0][0]}',zl='#{a[0][2]}',qlr='#{a[0][1]}',qsxz='#{a[0][5]}' where id=#{tmpid};")
  puts "update d_tddj_tmp set djh='#{a[0][0]}',zl='#{a[0][2]}',qlr='#{a[0][1]}',qsxz='#{a[0][5]}' where id=#{tmpid};"
end
puts a[0][0]
#b=a.split(',')

#puts cursor[0][0]
#puts cursor[0][1]
#puts cursor[1][1]
#puts r.join('')  #主要是输出样式的问题 可以使用  puts r.to_s
