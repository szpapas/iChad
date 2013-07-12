#!/usr/bin/ruby

require 'socket'
require 'timeout'
require 'iconv'

def hex_str(ss)
  str = ''
  for k in 0..ss.length-1
    str = str +  sprintf("%02X", ss[k]) + ' '
  end  
  str
end

def set_k(cmd)
  ss="\n\r\0064567890123456789000000000000000000000000000000000000000000000000"
  code = cmd.split(' ')
  for k in 0..code.size-1
     ss[k]=code[k].to_i(16)
  end
  ss
end

def scan_host(host_ip)  #cmd = "80 40"
  client = TCPSocket.open host_ip, 50000
  recv_length = 1024

  ss="D&C00040101"
  
  #puts("#{Time.now.to_f}:#{hex_str(ss)}")
  zz="4426433030303430313031"
  client.send ss, 0

  begin 
    str=""
    timeout(2) do
      while true do
         #ss = client.recv(1024)
         #str= hex_str(ss)
         #str=str  + str1
         #puts str
      end
      #ss = client.recv(1024)
      #str = hex_str(ss)
      #puts str
      
      #Processing data here
      
    end
    
  rescue Timeout::Error
      puts "Timed out!"
  end
  ss = client.recv(2048)
  puts ss
  puts ss.length
  str= hex_str(ss)
  #str="AA AA AA 96 69 05 08 00 00 90 01 00 04 00 18 52 38 6C 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 31 00 30 00 3100 31 00 39 00 36 00 34 00 30 00 37 00 32 00 34 00 5F 6C CF 82 01 77 90 5F DE 5D 02 5E 91 4E 99 9F 3A 53 EF 79 E0 7F B0 65 51 67 31 00 37 00 62 5E 32 00 55 53 43 51 32 00 30 00 32 00 A4 5B 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 36 00 31 00 32 00 31 00 30 00 32 00 31 00 39 00 36 00 34 00 30 00 37 00 32 00 34 00 30 00 36 00 37 00 33 00 90 5F DE 5D 02 5E 6C 51 89 5B 40 5C 91 4E 99 9F 06 52 40 5C 20 00 20 00 20 00 20 00 20 00 32 00 30 00 31 00 31 00 30 00 33 00 33 00 31 00 7F 95 1F 67 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 20 00 57 4C 66 00 7E 00 32 00 00 FF 85 1E 51 51 51 3E 71 0D D5 64 F3 7E E4 E1 EF A8 BA D3 14 1C E4 B6 0B 19 A4 4D B3 69 3E E3 95 06 39 34 18 8C 55 A6 48 61 48 B8 6D BA 5E A5 7B 6E 76 D6 F3 11 69 16 A9 86 05 BD A4 B3 DF 95 87 D8 E6 E0 7D 15 B3 7F 0E E9 DD 03 3D F7 24 0A 16 01 F5 AD 51AE D5 52 51 51 5A 3E 84 B0 7F 93 1D CF 83 EA 8F 92 FB D3 69 0E 1E CE 32 7A 6C D6 88 86 DD A5 BC 92 BF 47 74 9A FA 22 56 53 AD 22 AE 51 3D C5 D0 D6 83 60 77 AC B0 76 82 7F C6 3D 3A 2C 89 AB AF BF D3 54 09 04 CE 86 4C 93 6F AF B1 F0 1E 21 0E CC F0 FC B3 6E 73 AF 81 9D B4 F4 A6 6D 6B 56 BD 33 23 F5 6A 8A F0 6D 78 99 AE 51 30 77 B3 32 54 AE 51 E5 78 A4 41 E1 9F CF BD B7 96 D5 B6 91 65 07 B4 68 67 3B E4 57 55 E6 D1 B3 0C 21 DD E9 6D B4 F8 6D 1D 56 57 1C 0B 92 CC 49 0B 89 60 7E 54 D3 3F B7 E2 54 3E 00 70 08 99 9B 3E C5 27 DA DC 0C CE 7C 65 F2 94 79 55 C5 26 BC 9D ED B0 44 9C 48 1F FC 85 F2 24 D1 83 10 DD B8 FF 90 7B A5 A3 B3 E7 96 B7 DE C7 12 FD BF 40 97 FB 45 4E 0D 21 09 F0 FD 93 31 1B 3D A6 76 21 9F 20 4F BF D1 55 A7 D9 6F 39 32 23 A4 08 07 C7 AD 29 8C 5D D5 E3 51 DB EE 00 C6 88 62 0F 2D 15 A1 D8 3F A9 64 6D A8 4B A6 ED 41 6C BD A7 F6 1A D3 49 90 BD D9 35 98 25 04 BF 89 9F 71 3B DB 5E 2F 22 DE 98 88 29 87 87 E0 F8 E0 1C 22 5A 47 96 4C D5 FE 95 84 9E 4F F3 F0 E3 13 CE 7D DC F6 B2 98 36 04 CD 66 02 5A 58 37 31 5F 8B C2 08 A4 90 F0 12 0A C9 CA 75 98 C5 BB F6 95 BE 23 A0 60 E7 B3 F5 BF B8 CE DA 48 E3 58 57 DA 72 B4 36 33 A5 42 4D 9E 7A 76 91 AE 51 FF E8 8B 41 D2 06 21 D1 0A 49 FD 36 BA FB 22 3E 40 7F C5 97 7F 8D A9 E0 90 9A 30 E8 53 57 97 30 1A 8B 3C AE 51 82 1A 91 48 88 85 F0 42 7F BC F9 38 8A 0B D4 23 45 6E FA F1 C1 21 CE 2D D2 6F A0 F0 83 DA 42 49 51 B2 77 E0 1B 9B C7 DA E2 E0 18 AB 7B C2 83 8E 41 95 27 2C 31 9C 4B AC D2 DA 2C F2 E1 1A 40 1B 69 9A 38 55 D1 EF 37 B3 90 05 48 22 54 B6 CF 7C DF 65 AE 51 D5 72 25 23 D1 FA 4C 59 24 17 FB BC B7 A3 34 BD A4 41 D4 9A 37 8E 0C 8E FE E8 58 AE 51 E2 A2 7A DD 9B 9C 73 B3 8A 15 DD 91 3A 14 FE 07 87 78 E9 8B 6C 07 D8 5C 85 3C 58 16 D2 53 C2 68 C7 75 20 2C 5F 68 26 EF 52 62 F7 DE 97 E9 2B 6E 29 DC 91 75 53 6A FB DA A9 86 8C DF 5D 49 A9 E9 C1 F1 5F 34 75 75 BE C0 86 AD 70 F6 1C E8 19 1C D5 AD 22 04 B6 9A 93 3C 3A 79 DC 07 23 C6 7F EC 73 3E 78 C7 1B 36 41 18 65 D8 6E 86 8C 2A 93 5F 4F BC 23 38 97 99 0E 9A FC 50 8B C4 FC 1B 22 C6 CC B0 8A F3 E1 E7 A3 3B 07 1E 21 00 07 78 B3 C7 4C 83 8D 9D 46 A8 FD 99 14 61 54 31 D3 DC DF 18 1B 3F 5B 67 C2 DD F4 FD CE 7E 81 2E 57 09 64 71 E3 B4 56 E6 33 BD 93 21 35 B6 52 DB CF 6C 5D 0B 4F A2 62 5F 7E 56 97 B9 14 1E D2 ED 50 F8 A1 2F A4 27 93 E9 6F B3 C3 A7 86 4D CD B2 68 D3 BA D3 1F B8 84 21 45 6F E1 03 9D 5E 0A C7 04 BC B4 6F 5A 3E 0B D4 EC 55 E2 57 3C 9C FE A7 48 0E 52 42 D1 43 03 7C CD A7 72 C8 40 C8 F7 17 E5 55 BF E9 DC 3B 8E D6 C2 C1 9D 40 38 B8 69 5B B0 24 9F 77 2E 63 E5 00 F1 96 8F 5C 8C 1E 19 41 F5 B3 2B 26 CD 2C 5B 0C CF BA AD 17 AD 0A 02 FA BC D0 F6 40 38 5A 3E 84 AF 4E 7D A8 AA 92 42 75 07 E6 67 F6 D3 FB 68 43 C4 6F 7D 9D 92 A5 16 85 6A B1 28 6F 17 11 37 69 50 4C 71 2A 86 25 AD 2F 07 D6 37 C5 20 02 C1 C4 E5 54 1D 9F 96 42 1E D7 D5 5E BE 44 BA 58 F4 6E B8 1B FC B9 99 A3"
  puts str
  puts str.length
  if str.length>200
    idx = str.index("AA AA AA 96 69 05 08 00 00 90 ")/3
    if !idx.nil?
      wlf=ss.index("WLf")
      wb_len = ss[idx+10]*256+ss[idx+11]
      tx_len = ss[idx+12]*256+ss[idx+13]
      #wb = ss[idx+14..idx+4+wb_len-1]
      wb=ss[14..269]
      tx=ss[270..1293]
      #wb=ss[1..-1]
      puts wb_len
      puts tx_len
      puts wlf
      wbxx = Iconv.iconv('UTF-8','UTF-16LE', wb).to_s
      puts wbxx
      puts tx
      ff = File.open("./dady/sfz.wlf","w+")
      ff.write(tx)
      ff.close
    
      #tx = ss[idx+wb_len..-1]
    end
  else
    puts "请移动一下身份证。"
  end
  client.close
end


#host_ip = "192.168.114.48"   #六合身份证ip地址
host_ip = "10.5.6.10"
puts "查询  #{host_ip}"


scan_host(host_ip)


