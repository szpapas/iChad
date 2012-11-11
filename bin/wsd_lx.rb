#!/usr/bin/ruby
$:<<'/Library/Ruby/Gems/1.8/gems/pg-0.12.2/lib/'
$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' 

require 'socket'
require 'timeout'
require 'pg'


client = TCPSocket.open ARGV[0], 50000

recv_length = 1024

$sxh = ARGV[1].to_i

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


ss=set_k("F7 #{ARGV[2]} 40 00 00")
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
    $conn = PGconn.open(:dbname=>'WSD', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
    $conn.exec "update d_wsd set dqwd='#{wd}', dqsd='#{sd}', dqdl='#{dl}', updated_at = TIMESTAMP '#{timeStr}' where cmd='#{ARGV[2]}';"
    $conn.close
  end
rescue Timeout::Error
    puts "Timed out!"
end

client.close
