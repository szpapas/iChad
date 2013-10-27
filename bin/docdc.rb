$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-3.1.3/lib' << '/usr/local/lib/ruby/gems/1.8/gems/multi_json-1.3.6/lib'
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'  << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.0.4/lib'
require 'pg'
require 'active_support'
require 'find'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = on")

def get_timage_from_db(gid,nd,bgqx,jgwth,jh)
    user = User.find_by_sql("select id, dh, yxmc, jm_tag,width,height from timage where id=#{gid};")
    dh,width,height = user[0]['dh'], user[0]['width'], user[0]['height']
    if !File.exists?("/share/docdc/#{nd}#{bgqx}#{jgwth}#{jh}/")
      system"mkdir -p /share/docdc/#{nd}#{bgqx}#{jgwth}#{jh}/"        
    end    
    convert_filename = "/share/docdc/#{nd}#{bgqx}#{jgwth}#{jh}/"+user[0]["yxmc"].gsub('$', '-').gsub('TIF','JPG').gsub('tif','JPG')
    local_filename = "/share/docdc/#{nd}#{bgqx}#{jgwth}#{jh}/"+user[0]["yxmc"].gsub('$', '-')

    if !File.exists?(local_filename)
      user = $conn.exec("select id, dh, yxmc, data, jm_tag from timage where id=#{gid};")
      
      tmpfile = rand(36**10).to_s(36)
      ff = File.open("./tmp/#{tmpfile}",'w')
      ff.write(user[0]["data"])
      ff.close
      #puts "./tmp/#{tmpfile} #{local_filename}"
      if (user[0]['jm_tag'].to_i == 1)
        system("decrypt ./tmp/#{tmpfile} #{local_filename}")
      else
        system("scp ./tmp/#{tmpfile} #{local_filename}")
      end 
      system("rm ./tmp/#{tmpfile}")
    end
    
    system("convert '#{local_filename}' '#{convert_filename}'")

end

#doc=$conn.exec("select a_wsda.*,archive.tm,archive.ys from a_wsda,archive where archive.id=a_wsda.ownerid and a_wsda.nd>='2004' and a_wsda.nd<='2005' and (a_wsda.bgqx='永久' or a_wsda.bgqx='长期') order by nd,bgqx,jgwth,jh;")
doc=$conn.exec("select * from archive where dalb='0' and qzh='9' and nd>='1999' and nd<='2003' and (bgqx='永久' or bgqx='长期') and mlh<>'59' order by mlh,ajh;")
if !File.exists?("/share/docdc/")
	system"mkdir -p /share/docdc/"        
end
xls='<table　border="1" cellpadding="0" bordercolorlight="#999999" bordercolordark="#FFFFFF"　cellspacing="0" align="center">'
xls=xls + '<tr><td>目录号</td><td>案卷号</td><td>案卷标题</td><td>年度</td><td>保管期限</td><td>件数</td><td>页数</td><td>备注</td>'
for k in 0..doc.count - 1
  xls=xls + "<tr><td>#{doc[k]['mlh']}</td><td>#{doc[k]['ajh']}</td><td>#{doc[k]['tm'].to_s}</td><td>#{doc[k]['nd'].to_s}</td><td>#{doc[k]['bgqx']}</td><td>#{doc[k]['js']}</td><td>#{doc[k]['ys']}</td><td>#{doc[k]['bz']}</td>"
  image=$conn.exec("select id from timage where dh ='#{doc[k]['dh']}'")
  for x in 0..image.count-1
    if !File.exists?("/share/docdc/#{doc[k]['mlh']}-#{doc[k]['ajh']}/")
      system"mkdir -p /share/docdc/#{doc[k]['mlh']}-#{doc[k]['ajh']}/"        
    end
    	docfile = $conn.exec("select id, dh, yxmc, data, jm_tag from timage where id=#{image[x]['id']};")
    	local_filename ="/share/docdc/#{doc[k]['mlh']}-#{doc[k]['ajh']}/"  + docfile[0]["yxmc"]
      ff = File.open("#{local_filename}",'w')
      ff.write(PGconn.unescape_bytea( docfile[0]["data"]))
      ff.close
  end
end
xls=xls + "</table>"

ff = File.open("/share/docdc/doc1999-2003.xls" ,'w+')
ff.write(xls)
ff.close

