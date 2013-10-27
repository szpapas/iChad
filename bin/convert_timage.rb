#!/usr/bin/ruby
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
require 'pg'

# split images to mulitple table, each table 10000 size.

$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')

BLOCK_SIZE = 10000   #100M per block

#yd_index must exists

def convert_timage_table
  #add md5 to timage 
  #$conn.exec "ALTER TABLE timage DROP COLUMN v_hash;"
  $conn.exec "ALTER TABLE timage ADD COLUMN v_hash character(32);"
  $conn.exec "ALTER TABLE timage ADD COLUMN yd_id integer;"
  $conn.exec "CREATE INDEX timage_v_hash_idx ON timage USING btree(v_hash);"
  $conn.exec "update timage set v_hash = md5(data);"
  
  #$conn.exec("select distinct v_hash into v_hash from timage;")
  $conn.exec "DROP TABLE IF EXISTS yd_index;"
  $conn.exec "CREATE TABLE yd_index (id integer, v_hash character varying(32), ref_count integer);"
  $conn.exec "insert into yd_index(v_hash) select distinct v_hash from timage;"
  $conn.exec "CREATE INDEX yd_index_v_hash_index ON yd_index USING btree(v_hash);"
  
  info = $conn.exec("select count(*) from yd_index")[0]
  total_image = info['count'].to_i
  
  for kk in 0..total_image/BLOCK_SIZE
    $conn.exec "CREATE TABLE yd_#{kk}(id serial NOT NULL,v_hash character varying(32),data bytea,CONSTRAINT yd_#{kk}_pkey PRIMARY KEY (id));"
    $conn.exec "insert into yd_#{kk}(v_hash, data) select distinct v_hash, data from timage where v_hash in (select v_hash from yd_index order by v_hash offset #{BLOCK_SIZE*kk} limit #{BLOCK_SIZE});"
    $conn.exec "update yd_index set id = #{BLOCK_SIZE*kk}+yd.id from yd_#{kk} as yd where yd.v_hash = yd_index.v_hash;"
  end
  
  $conn.exec "update timage set yd_id = yd_index.id from yd_index where yd_index.v_hash = timage.v_hash;"
  
end 

puts "#{Time.now.strftime('%D %T')}: 开始转换."
convert_timage_table
puts "#{Time.now.strftime('%D %T')}: 转换结束."

$conn.close  

