$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-3.1.3/lib' << '/usr/local/lib/ruby/gems/1.8/gems/multi_json-1.3.6/lib'
#$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'  << '/Library/Ruby/Gems/1.8/gems/activesupport-3.1.3/lib/' << '/Library/Ruby/Gems/1.8/gems/multi_json-1.0.4/lib'
require 'pg'
require 'active_support'
require 'find'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'192.168.10.194', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")

def save2timage(filename,dh,dh_prefix)
  fo = File.open(filename).read
  if fo.size == 0
    $stderr.puts(" *** Import Image: #{path}  file size is zero.")
    return 
  end
  puts filename
  meta_tz = 0   
  pixels = 0   
  width =0 
  height=0
  czr='1'
  czrname='admin'
  yxdx = fo.size
  edata=PGconn.escape_bytea(fo)
  pp = filename.split("\/")
  file_title = pp[pp.size-1]
  yxmc=pp[pp.size-1].gsub('Microsoft Word - ','').gsub(' ','').gsub('(','').gsub(')','').gsub("'","").gsub("Sheet1","").gsub("Sheet2","")
  yxbh=pp[pp.size-1].gsub('Microsoft Word - ','').gsub(' ','').gsub('(','').gsub(')','').gsub("'","").gsub("Sheet1","").gsub("Sheet2","")
  rq=Time.now.strftime("%Y-%m-%d %H:%M:%S") 
  #cf=$conn.exec("select count(*) from timage where dh='#{dh}' and yxbh='#{yxbh}'")
#  if cf.count==0 
    $conn.exec("insert into timage (rq,czr,czrname,width, height,dh, yxmc, yxbh, yxdx, data, meta_tz, pixel,dh_prefix,sfzs) values ('#{rq}','#{czr}', '#{czrname}','#{width}', '#{height}','#{dh}', '#{yxmc}', '#{yxbh}', #{yxdx}, E'#{edata}' , #{meta_tz}, #{pixels}, '#{dh_prefix}',1);")
  
  

  
end
#save2timage("/share/doc1/第202号附件11.pdf" , 1,2)

  path1="/share/doc/"
  Find.find(path1) do |path|
    if FileTest.directory?(path)
      if File.basename(path)[0] == ?.
        #Find.prune       # Don't look any further into this directory.
      else
        next
      end
    else
      if (path.upcase.include?'PDF') 
        #path=path.gsub('Microsoft Word - ','').gsub(' ','').gsub('(','').gsub(')','').gsub("'","").gsub("Sheet1","").gsub("Sheet2","")
        puts path
        dh=path.gsub('Microsoft Word - ','').gsub(' ','').gsub('(','').gsub(')','').gsub("'","").gsub("Sheet1","").gsub("Sheet2","").split('$')
        puts dh[0]
        puts dh[1]
        dh2= dh[0].split('/')
        puts dh2[dh2.count-1]
        dh1=dh2[dh2.count-1].split('-')
        puts dh1[0].to_s + "-" + dh1[1].to_s + "-" + dh1[2].to_s
        path2=path.gsub(' ','\ ').gsub('$','\$')
        puts 'scp ' + path2 + " /share/doc1/" + dh[1]
        system('scp ' + path2 + " /share/doc1/" + dh[1])
        save2timage("/share/doc1/" + dh[1],dh2[dh2.count-1],dh1[0].to_s + "-" + dh1[1].to_s + "-" + dh1[2].to_s)
      end
    end
  end