class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, :registerable,
    :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :id, :username
  
  def self.current
    Thread.current[:user]
  end

  def self.current=(user)
    Thread.current[:user] = user
  end
  
  def email_required?
    false
  end
  
  protected
  def self.find_for_database_authentication(conditions)
    puts conditions.to_json
    login = conditions.delete(:login)
    where(conditions).where(["username = :login OR email = :login",{:login => login}]).first
  end
    
end
