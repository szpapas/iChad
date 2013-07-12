#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' 

require 'socket'
require 'timeout'
require 'pg'

$conn = PGconn.open(:dbname=>'WSD', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn1 = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
def set_k(cmd)
  ss="\n\r\00645678901234567890"
  $sxh = ($sxh+1) % 128
  $sxh = $sxh+1 if $sxh==10 || $sxh == 13
  code = cmd.split(' ')
  for k in 0..code.size-1
     ss[k+4]=code[k].to_i(16)
  end
  ss[3] = $sxh
  for k in 9..19
    ss[k]=0
  end
  ss[2] = (ss[3]+ss[4]+ss[5]+ss[6]+ss[7]+ss[8]) % 256
  ss
end

def hex_str(ss)
  str = ''
  for k in 0..ss.length-1
    str = str +  sprintf("%02X", ss[k]) + ' '
  end  
  str
end


$sxh = 33

def scan_host(host_ip, cmd, xzmc)  #cmd = "80 40"
  client = TCPSocket.open host_ip, 50000
  recv_length = 1024

  ss=set_k("F7 #{cmd} 00 00")
  puts("#{Time.now.to_f}:#{hex_str(ss)}")
  client.send ss, 0

  begin 
    timeout(5) do
      ss = client.recv(1024)
      str = hex_str(ss)
      puts str
      #0A 0D 8C 38 F7 80 40 0C 4D 29 00 1B 00 00 00 00 00 00 00 00 
      dl, sd, wd = (ss[8]+300)/100.0, ss[9], ss[11]
      puts "#{dl}\t#{wd}\t#{sd}"
      timeStr = Time.now.strftime('%Y-%m-%d %H:%M:%S')
      $conn.exec "update d_wsd set dqwd='#{wd}', dqsd='#{sd}', dqdl='#{dl}', updated_at = TIMESTAMP '#{timeStr}' where cmd='#{cmd}';"
      $conn.exec "insert into d_wsd_his(cmd, dqwd, dqsd, dqdl, created_at, ip_addr, xzmc) values ('#{cmd}','#{wd}','#{sd}','#{dl}', TIMESTAMP '#{timeStr}','#{host_ip}', '#{xzmc}');"
      if cmd=='70 40'
        $conn1.exec "update zn_sb set kgzt='#{wd},#{sd}', ktzt='#{wd},#{sd}' where id=20;"
        puts "update zn_sb set kgzt='#{wd},#{sd}', ktzt='#{wd},#{sd}' where id=20;"
      end
    end
  rescue Timeout::Error
      puts "Timed out!"
  end
  client.close
end

datas = $conn.exec "select id, xzmc, ip_addr, cmd from d_wsd where yx=1 order by id;"

for k in 0..datas.count-1
   data = datas[k]
   host_ip = data['ip_addr']
   cmd = data['cmd']
   puts "查询  #{data['xzmc']} #{host_ip}"
   scan_host(host_ip, cmd, data['xzmc'])
end

$conn.close



