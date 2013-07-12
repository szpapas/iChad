$:<< '/usr/local/lib/ruby/gems/1.8/gems/ruby-serialport-0.7.0/lib'
require 'serialport'
sp = SerialPort.new "/dev/tty.usbserial-AE019CZH", 9600

 def every_n_seconds(n) 
      loop do 
          before= Time.now 
          yield 
          interval=n-(Time.now-before) 
          sleep(interval) if interval>0 
      end 
 end
 ss=''
 ss1=''
# Thread.new {   
#    while true do
#      ss = sprintf("%02X", sp.getc) 
#      #puts ss
#    end
#  }
 every_n_seconds(0.1) do
    ss = sprintf("%02X", sp.getc)
    if ss!=''
      ss1=ss1 + "," + ss
    end
    ss2=ss1.split(',')
    if ss2.length==10
      puts ss1
      ss1=""
    end
 end
 
