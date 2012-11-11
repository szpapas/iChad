require 'serialport'

sp = SerialPort.new "com3", 9600
#sp = SerialPort.new "/dev/tty.PL2303-00002006", 9600
puts "serial opened" 

$sxh = 50
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

outstr = ""
Thread.new {
  while true do
    ss = sprintf("%02X ", sp.getc)
    if ss == "0A " 
      puts "New Frame:"
      k = 0
    end
    k = k+1
    puts "#{k}: #{ss}"
  end
}

#0A 0D 99 34 F2 50 22 01 00 00 00 00 00 00 00 00 00 00 00 00
while (l = gets) do
  l = l.chomp
  if l == "exit"
    exit
  elsif l == "open"
    ss=set_k("F2 50 22 01 00")
    puts("#{Time.now.to_f}:#{hex_str(ss)}")

    sp.write(ss)
  elsif l == "close"
    ss=set_k("F2 50 22 00 00")
    puts("#{Time.now.to_f}:#{hex_str(ss)}")

    sp.write(ss)
  else 
    puts("#{Time.now.to_f}:#{hex_str(l.sub("\n", "\r"))}")
    sp.write(l.sub("\n", "\r"))  
  end    
end

sp.close

