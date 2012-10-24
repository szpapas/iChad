$: << '/Library/Ruby/Gems/1.8/gems/ruby-serialport-0.7.0/lib'
require 'serialport'

#sp = SerialPort.new "com3", 9600
$sp = SerialPort.new "/dev/cu.BOLUTEK-SPPDev-1", 9600
puts "serial opened" 

def set_k(cmd)
  ss="012345"
  code = cmd.split(' ')
  for k in 0..code.size-1
     ss[k]=code[k].to_i(16)
  end
  ss[5] = (ss[0]^ss[1]^ss[2]^ss[3]^ss[4])
  ss
end

def set_send(send_str)
  s_str = send_str.chomp.strip[5..-1]
  code = s_str.split(' ')
  s, ss = '0',''
  for k in 0..code.size-1
    s[0] = code[k].to_i(16)
    ss = ss + s
  end
  
  kk = ss[0]
  for k in 1..ss.length-1
    kk = kk ^ ss[k]
  end
  ss = ss + ' '  
  ss[ss.length-1]=kk
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
    ss = sprintf("%02X ", $sp.getc)
    #k = k+1
    #puts "#{k}: #{ss}"
    str = str + ss
    
    if str.include?"02 AA"
      idx = str.index("02 AA")
      puts "#{Time.now.strftime("%H:%M:%S")}: #{str[0..idx-1]}"
      str = ''
    end
  end  
}

#0A 0D 99 34 F2 50 22 01 00 00 00 00 00 00 00 00 00 00 00 00
while (l = gets) do
  l = l.chomp
  if l == "exit"
    exit
  elsif l == "soft"
    ss=set_k("03 AA 07 04 01")
    puts("#{Time.now.to_f}:#{hex_str(ss)}")

    $sp.write(ss)
  elsif l == "hard"
    ss=set_k("03 AA 07 04 00")
    puts("#{Time.now.to_f}:#{hex_str(ss)}")

    $sp.write(ss)
  elsif l.include? 'send'
    puts l
    ss = set_send(l)
    
    puts("#{Time.now.to_f}:#{hex_str(ss)}")
    $sp.write(ss)
  else 
    #puts("#{Time.now.to_f}:#{hex_str(l.sub("\n", "\r"))}")
    #sp.write(l.sub("\n", "\r")) 
  end    
end

sp.close

