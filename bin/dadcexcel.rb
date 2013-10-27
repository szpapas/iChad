$:<<'/usr/local/lib/ruby/gems/1.8/gems/pg-0.12.2/lib/' << '/usr/local/lib/ruby/gems/1.8/gems/activesupport-3.1.3/lib' << '/usr/local/lib/ruby/gems/1.8/gems/multi_json-1.3.6/lib'
require 'pg'
require 'find'
$conn = PGconn.open(:dbname=>'JY1017', :user=>'postgres', :password=>'brightechs', :host=>'localhost', :port=>'5432')
$conn.exec("set standard_conforming_strings = off")
dalb = ARGV[0]
