$:<<'/Library/Ruby/Gems/1.8/gems/activesupport-2.3.5/lib/'
require "open-uri"  
require 'thread'
require 'active_support'

class LoginController < ApplicationController
  def sso
    token = params['Token']
    uri = "http://192.168.10.6/Sys/Flex/XMLService.ashx?events=GetOperatorInfo&SessionID=#{token}&resulttype=Json"  
    html_response = nil  
    open(uri) do |http|  
      html_response = http.read  
    end 
    puts html_response 
    tt = ActiveSupport::JSON.decode(html_response)
    if tt['Status'][0]["ErrorCode"].to_i != 0 #登陆成功
      sign_in(:user, User.find(1))
      redirect_to "http://127.0.0.1:3000/" # or user_root_url
    else #继续登陆
      #redirect_to "http://127.0.0.1:3000/users/sign_in"  
      redirect_to "http://192.168.10.6"  
    end
  end
    
end
