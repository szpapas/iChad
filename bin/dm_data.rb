fr = File.open(ARGV[0])
fo = File.open(ARGV[1],'w')
while !fr.eof?
  bb = fr.read(8)
  if bb.size==8
    fo.write((255-bb[7]).chr)
    fo.write((255-bb[0]).chr)
    fo.write((255-bb[4]).chr)
    fo.write((255-bb[3]).chr)
    fo.write((255-bb[6]).chr)
    fo.write((255-bb[1]).chr)
    fo.write((255-bb[5]).chr)
    fo.write((255-bb[2]).chr)
  else
    fo.write bb
  end
end
fr.close
fo.close