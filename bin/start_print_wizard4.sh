#!/bin/sh
#if [`ps -ef|grep ruby|awk '{print $9}'|grep print_wizard.rb|wc -l` -lt 4 ]; then
#  echo `ps -ef|grep ruby|awk '{print $9}'|grep print_wizard.rb|wc -l`
  `ruby ./dady/bin/call_print_wizard.rb &`
#else
#  echo "your pint thread is more than 4"
#fi