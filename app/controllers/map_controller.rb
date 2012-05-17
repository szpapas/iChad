class MapController < ApplicationController
  
  def get_temp
    render :text=>"{\"sd\":\"45\",\"wd\":\"25.6\"}"
  end
  
  #search=%@&dalb=%@&offset=%d&qzh=%d
  def search_aj
    user = User.find_by_sql("select * from archive where tm like '%#{params['search']}%' limit 10;")
    render :text=>user.to_json
  end 
  
  def jylist
    
    render :text=>""
  end 
  

end
