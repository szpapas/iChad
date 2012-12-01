#!/usr/bin/ruby
tmpfile = rand(36**10).to_s(36)
system("ps ax | grep zn_sb_cz_nx_lan | grep -v grep > /tmp/#{tmpfile}")
ss = File.open("/tmp/#{tmpfile}").read
aa = ss.split("\n")
if aa.size == 0
  system("cd /home/liujun/iChad && ruby ./bin/zn_sb_cz_nx_lan.rb >/dev/null 2>&1 &")
elsif aa.size > 1
  pids = ""
  for k in 0..aa.size-1 
    pids = pids + " #{aa[k].split(/\s+/)[0]}"
  end
  system("kill -9 #{pids} ")
  system("cd /home/liujun/iChad && ruby ./bin/zn_sb_cz_nx_lan.rb >/dev/null 2>&1 &")
end  
system("rm -rf /tmp/#{tmpfile}")
