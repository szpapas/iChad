require 'socket'
def every_n_seconds(n) 
     loop do 
         before= Time.now 
         yield 
         interval=n-(Time.now-before) 
         sleep(interval) if interval>0 
     end 
end
def hex_str(ss)
  str = ''
  for k in 0..ss.length-1
    str = str +  sprintf("%02X", ss[k]) + ' '
  end  
  str
end
every_n_seconds(5) do
  client = TCPSocket.open '10.5.6.24',50008
  ss = client.recv(1024)
  #str= hex_str(ss)
  #puts 'ss:' + ss
  str=ss.split('A2 00')
  if str.length>1
    sss=str[1]
    puts sss[0..11]
  end  
  client.close
end

every_n_seconds(1) do
  puts 'sssss'
end