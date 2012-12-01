$:<<'/Library/Ruby/Gems/1.8/gems/activesupport-2.3.5/lib/'
require "open-uri"  
require 'thread'
require 'active_support'
require 'uri'
class LoginController < ApplicationController
  #def sso
  #  token = params['Token']
  #  #token = "oIBOR8t7s%2bZGLbh4M%2fwjlhsk2fhQnltChArl5MbKzn3FtaK2dn7ShW3e7pqfEJ3srXRqRgn7AM%2frzNrgOOyyfA%3d%3d"
  #  uri = "http://192.168.10.6/Sys/Flex/XMLService.ashx?events=GetOperatorInfo&SessionID=#{token}&resulttype=Json"
  #  html_response = nil  
  #  open(uri) do |http|  
  #    html_response = http.read  
  #  end 
  #  puts html_response 
  #  tt = ActiveSupport::JSON.decode(html_response)
  #  if tt['Status'][0]["ErrorCode"].to_i == 0 #登陆成功
  #    user = User.find_by_logonname("#{tt['Table'][0]['logonname']}")
  #    #user = User.find_by_logonname("chenl")
  #    sign_in_and_redirect(:user, user)
  #    #redirect_to "http://127.0.0.1:3000/" # or user_root_url
  #  else #继续登陆
  #    #redirect_to "http://127.0.0.1:3000/users/sign_in"  
  #    redirect_to "http://192.168.10.6"  
  #  end
  #end
  def url_encode(str)  
    return str.gsub!(/[^/w$&/-+.,//:;=?@]/) { |x| x = format("%%%x", x[0])}  
  end
  def sso
    token = params['Token']
    #token = "oIBOR8t7s%2bZGLbh4M%2fwjlhsk2fhQnltChArl5MbKzn3FtaK2dn7ShW3e7pqfEJ3srXRqRgn7AM%2frzNrgOOyyfA%3d%3d"
    token=token.gsub('+','%2b').gsub('=','%3d')
    uri = "http://192.168.10.6/Sys/Flex/XMLService.ashx?events=GetOperatorInfo&SessionID=#{token}&resulttype=Json"
    #uri=URI.escape(uri)
    puts uri
    
    html_response = nil  
    open(uri) do |http|  
      html_response = http.read  
    end 
    puts html_response 
    tt = ActiveSupport::JSON.decode(html_response)
    if tt['Status'][0]["ErrorCode"].to_i == 0 #登陆成功
      
      user = User.find_by_logonname("#{tt['Status'][0]["LogonName"]}")
      #user = User.find_by_logonname("chenl")
      sign_in_and_redirect(:user, user)
      #redirect_to "http://127.0.0.1:3000/" # or user_root_url
    else #继续登陆
      redirect_to "http://192.168.10.193:3000/users/sign_in"  
    end
  end
    
end
