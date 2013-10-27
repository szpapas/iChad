/* xxxx

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */


Ext.define('MyDesktop.YunDangAn', {
  extend: 'Ext.ux.desktop.Module',

  requires: [
    '*',
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.window.MessageBox'
  ],
  id:'yundangan',

  init : function(){
    this.launcher = {
      text: '云档案',
      iconCls:'systemman',
      handler : this.createWindow,
      scope: this
    }
  },
  createWindow : function(){
    var desktop = this.app.getDesktop();
    var win = desktop.getWindow('yundangan');
	var yun_jyqq_add_change="";
    var insert_dw="";
	Ext.regModel('yun_timage_model', {
	    fields: [
	      {name: 'id',     type: 'integer'},
	      {name: 'dh',     type: 'string'},
	      {name: 'yxmc',     type: 'string'},
	      {name: 'yxdx',     type: 'string'},
	      {name: 'yxbh',     type: 'string'}
	    ]
	});

	var yun_timage_store =  Ext.create('Ext.data.Store', {
	    model : 'yun_timage_model',
	    proxy: {
	      type: 'ajax',
	      url : '/desktop/yun_get_timage',
	      extraParams: {id:"",type:"0"},
	      reader: {
	        type: 'json',
	        root: 'rows',
	        totalProperty: 'results'
	      }
	    }
	});
	var yun_jydj_jyzt='';
	var scale1 = 1;
	var scaleMultiplier1 = 0.8;
	var translatePos1 =  { x: 0,y: 0};
	var imageObj1 = new Image();
	
    var canvas_string =
	    '<div id="wrapper1" oncontextmenu="return false">'
	    +' <canvas id="myCanvas1" width="900" height="1200">'
	    +' </canvas>'
	    +'</div>';
    
	var drawarchive = function(scale, translatePos, imageObj){

	 var canvas = document.getElementById("myCanvas1");
	 var context = canvas.getContext("2d");
     scale=1
	 // clear canvas
	
	 context.clearRect(0, 0, canvas.width, canvas.height);
	 context.save();

	 //context.translate(translatePos.x, translatePos.y);
	 //context.scale(scale, scale);

	 imageObj.onload = function(){
	   //imgW = imageObj.width;
		imgW =Ext.getCmp('imagelist').width;
		
		imgH=imgW*(imageObj.height/imageObj.width);
	   //imgH = imageObj.height;
	   context.drawImage(imageObj, translatePos.x , translatePos.y , imgW * scale, imgH * scale );
	 };

	 //imgW = imageObj.width;
	 //imgH = imageObj.height;
		imgW =Ext.getCmp('imagelist').width;
		
		imgH=imgW*(imageObj.height/imageObj.width);
	 context.drawImage(imageObj, translatePos.x , translatePos.y , imgW * scale, imgH * scale );

	 context.restore();
	}

	var set_imagearchive = function(photoURL) {
	 var canvas = document.getElementById("myCanvas1");
	 var context = canvas.getContext("2d");
	 var startDragOffset = {};
	 var mouseDown = false;

	 //scale = 1.0;
	 translatePos1 =  { x: 0,y: 0};
	 imageObj1.src = photoURL;


	 // add event listeners to handle screen drag
	 canvas.addEventListener("mousedown", function(evt){
	   mouseDown = true;
	   startDragOffset.x = evt.clientX - translatePos1.x;
	   startDragOffset.y = evt.clientY - translatePos1.y;
	 });

	 canvas.addEventListener("mouseup", function(evt){
	   mouseDown = false;
	 });

	 canvas.addEventListener("mouseover", function(evt){
	   mouseDown = false;
	 });

	 canvas.addEventListener("mouseout", function(evt){
	   mouseDown = false;
	 });

	 canvas.addEventListener("mousemove", function(evt){
	   if (mouseDown) {
	     translatePos1.x = evt.clientX - startDragOffset.x;
	     translatePos1.y = evt.clientY - startDragOffset.y;
	     drawarchive(scale, translatePos1, imageObj1);
	   }
	 });
	 // add event listeners to handle screen drag
	 

	 drawarchive(scale, translatePos1,imageObj1);
	};

	var myuploadform= new Ext.FormPanel({
      id : 'my_upload_form',
      fileUpload: true,
      width: 300,
      height : 100,
      autoHeight: true,
      bodyStyle: 'padding: 5px 5px 5px 5px;',
      labelWidth: 0,
      defaults: {
        anchor: '95%',
        allowBlank: false,
        msgTarget: 'side'
      },
      layout : 'absolute',
      items:[{
        xtype: 'label',
        text: '增加影像或附件文件：文件名不能包含空格和单引号。',
        x: 10,
        y: 10,
        width: 100
      },
      {
        xtype: 'fileuploadfield',
        id: 'filedata',
        x: 10,
        y: 45,
        emptyText: '选择一个文件...',
        buttonText: '浏览'
      }],
      buttons: [
      {
        text: '上传',
        handler: function(){
          if (Ext.getCmp('js_jyqq_jyid').value==''){
            msg('提示', '请先查询出要借阅的档案再进行上传.');
          } 
          else
          {
			myForm = Ext.getCmp('my_upload_form').getForm();
			filename=myForm._fields.items[0].lastValue.split('\\');
            file=filename[filename.length-1];
			if(myForm.isValid())
            {
                form_action=1;
                myForm.submit({
                  url: '/desktop/upload_file',
                  waitMsg: '文件上传中...',
                  success: function(form, action){
                    var isSuc = action.result.success; 		                    
                    if (isSuc) {
                      new Ajax.Request("/desktop/yun_save_image_db", { 
                        method: "POST",
						parameters: eval("({filename:'" + file + "',id:'" + Ext.getCmp('js_jyqq_jyid').value +"',czr:'" + currentUser.id +"',czrname:'" + currentUser.username +"'})"),
                        //parameters: eval("({filename:'" + file + "',dh:'" + dh +"'})"),
                        onComplete:  function(request) {
                          if (request.responseText=='true'){
                            yun_timage_store.proxy.extraParams = {id:Ext.getCmp('js_jyqq_jyid').value, type:'0'};
			        		yun_timage_store.load();
                            Ext.getCmp('timage_combo').lastQuery = null;
                            msg('成功', '文件上传成功.');                       
                          }else{
                            alert("文件上传失败，请重新上传。" + request.responseText);
                          }
                        }
                      }); //save_image_db
                    } else { 
                      msg('失败', '文件上传失败.');
                    }
                  }, 
                  failure: function(){
                    msg('失败', '文件上传失败.');
                  }
                });
            }
          } //else
        } //handler
      }] //buttonsj
    });
    
	function getNodes(node,tf) {
      //遍历所有子节点
      if (node.childNodes.size() == 0) return;
      node.eachChild(function(n){
        //Ext.getCmp('user_ml_qx_tree_panel').store.getNodeById("1_1_1").data.checked
        n.data.checked=tf;
        n.updateInfo({checked:tf});
        getNodes(n,tf);
      });
    };

    function get_parentNode(node){
      if (node.data.parentId=="root"){
      }else
      {
        node.parentNode.data.checked=true;
        node.parentNode.updateInfo({checked:true});
        get_parentNode(node.parentNode);
      }
    };

	function get_dw_NodesChecked(node) {
      //获取用户目录权限树
      if (node.childNodes.size() == 0) return;
      node.eachChild(function(n){
        if (n.data.checked==true){
			if (n.data.id!='root1'){
          		if (insert_dw==""){
		            insert_dw=  n.data.text 
		         }else{
		            insert_dw=insert_dw+ "," + n.data.text
		         }
			}
        };
          
        get_dw_NodesChecked(n);
      });
    };
    
	
    var danwei_disp = function(record,add_new){
      var win = Ext.getCmp('danwei_disp_win');
      
      //qz_store.load();
      if (win==null) {
        win = new Ext.Window({
          id : 'danwei_disp_win',
          title: '修改单位设置',
          //closeAction: 'hide',
          width: 370,
          height: 200,
          //minHeight: 200,
          layout: 'fit',
          modal: true,
          plain: true,
          //items:user_setup_grid,          
          items: [{
            width: 370,
            height: 140,
            xtype:'form',
            layout: 'absolute',
            id : 'danwei_disp_form',
            items: [
              {
                xtype: 'label',
                text: '单位名称：',
                x: 10,
                y: 10,
                width: 100
              },
              {
                xtype: 'label',
                text: '档案服务器IP地址：',
                x: 10,
                y: 40,
                width: 100
              },              
              {
                xtype: 'textfield',
                hidden : true,
                name : 'id' ,
                id:'danwei_id'                    
              },
              
              {
                xtype: 'textfield',
                x: 130,
                y: 10,
                width: 200,
                name: 'dwdm',
                id:'qz_dwdm'
              },
              {
                xtype: 'textfield',
                x: 130,
                y: 40,
                width: 200,
                name: 'dwjc',
                id:'qz_dwjc'
              }              
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'option',
                id:'button_danwei_add',
                text:'修改',
                handler: function() {
                  var pars=this.up('panel').getForm().getValues();
                  if(pars['dwdm']!=''){
                    if(pars['dwjc']!=''){
                      if(add_new==false){
                        new Ajax.Request("/desktop/update_qz", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success') {
                              
                              Ext.getCmp('qz_disp_win').close();
                              
                              Ext.getCmp('qz_setup_grid').store.url='/desktop/get_qz_grid';
                              Ext.getCmp('qz_setup_grid').store.load();
                            }else{
                              alert("修改失败。");
                            }
                          
                          }
                        });
                      }else{
                        new Ajax.Request("/desktop/insert_qz", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              
                              Ext.getCmp('qz_disp_win').close();
                              Ext.getCmp('qz_setup_grid').store.url='/desktop/get_qz_grid';
                              Ext.getCmp('qz_setup_grid').store.load();
                            }else{
                              alert("新增失败。");
                            }
                          }
                        });
                      }
                    }else{
                      alert("单位简称不能为空。");
                    }
                  }else{
                    alert("单位名称不能为空。");
                  }
                }
              },
              {
                xtype: 'button',
                iconCls: 'exit',
                text:'退出',
                handler: function() {
                  //this.up('window').hide();
                  Ext.getCmp('danwei_disp_win').close();
                }
              }]
          }]
          
        });
      }
      if(add_new==false){
      //设置数据
        Ext.getCmp('danwei_disp_form').getForm().setValues(record.data);
        
      }else{
        Ext.getCmp('danwei_disp_win').title="新增单位服务设置";
        Ext.getCmp('button_danwei_add').text="新增";
        Ext.getCmp('button_danwei_add').iconCls="add";
      }

      win.show();
    };

    var danwei_setup = function(){
      var win = Ext.getCmp('danwei_setup_win');

      Ext.regModel('danwei_setup_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'dwmc',    type: 'string'},
          {name: 'ip',    type: 'string'}
        ]
      });

      var danwei_setup_store = Ext.create('Ext.data.Store', {
        id:'danwei_setup_store',
        model : 'danwei_setup_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_danwei_grid',
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var danwei_setup_grid = new Ext.grid.GridPanel({
        id : 'danwei_setup_grid',
        store: danwei_setup_store,        
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '单位名称',  width : 150, sortable : true, dataIndex: 'dwmc'},
          { text : '档案服务器IP地址',  width : 150, sortable : true, dataIndex: 'ip'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("id");
                
                //DispAj(r,false);
              }
            }
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      if (win==null) {
        win = new Ext.Window({
          id : 'danwei_setup_win',
          title: '云查询单位设置',
          //closeAction: 'hide',
          width: 570,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:danwei_setup_grid,          
          tbar:[{
            xtype: 'button',
            iconCls: 'add',
            text:'新增',
            handler: function() {
              //this.up('window').hide();              
              danwei_disp("record",true);
            }
          },
          {
            xtype: 'button',
            iconCls: 'option',
            text:'修改',
            handler: function() {
              //this.up('window').hide();
              
              var grid = Ext.getCmp('qz_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==1){
                var record = records[0];
                qz_disp(record,false);
              }else{
                alert("请选择一个用户进行修改。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'delete',
            text:'删除',
            handler: function() {
              var grid = Ext.getCmp('qz_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==0){
                alert("请选择一个用户进行修改。");
                
              }else{
                var record = records[0];
                var pars="id="+record.data.id;
                Ext.Msg.confirm("提示信息","是否要删除全宗名称为：！"+record.data.dwdm+"的全宗？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_qz", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              Ext.getCmp('qz_setup_grid').store.url='/desktop/get_qz_grid';
                              Ext.getCmp('qz_setup_grid').store.load();
                            }else{
                              alert("删除失败。");
                            }
                          }
                        });
                      }else{
                        //alert('O,no');
                      }

                  }); 
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('qz_setup_win').close();
            }
          }]
          
        });
      }
      

      win.show();
    };  

    var yun_qx_disp = function(record,add_new){
      var win = Ext.getCmp('yun_qx_disp_win');
      
      //qz_store.load();
      if (win==null) {
        win = new Ext.Window({
          id : 'yun_qx_disp_win',
          title: '本单位云查询权限设置',
          //closeAction: 'hide',
          width: 370,
          height: 70,
          //minHeight: 200,
          layout: 'fit',
          modal: true,
          plain: true,
          //items:user_setup_grid,          
          items: [{
            width: 370,
            height: 70,
            xtype:'form',
            layout: 'absolute',
            id : 'yun_qx_disp_form',
            items: [
              {
                xtype: 'label',
                text: '云查询权限：',
                x: 10,
                y: 10,
                width: 100
              },                           
              {
                xtype: 'textfield',
                x: 130,
                y: 10,
                width: 200,
                name: 'dwdm',
                id:'qz_dwdm'
              }             
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'save',
                id:'button_yun_qx_add',
                text:'保存',
                handler: function() {
                  var pars=this.up('panel').getForm().getValues();
                  
				}
              },
              {
                xtype: 'button',
                iconCls: 'exit',
                text:'退出',
                handler: function() {
                  //this.up('window').hide();
                  Ext.getCmp('yun_qx_disp_win').close();
                }
              }]
          }]
          
        });
      }

      Ext.getCmp('yun_qx_disp_form').getForm().setValues(record.data);              
      win.show();
    };

    var yun_qx_setup = function(){
      var win = Ext.getCmp('yun_qx_setup_win');

      Ext.regModel('yun_qx_setup_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'dwmc',    type: 'string'},
          {name: 'qx',    type: 'string'}
        ]
      });

      var yun_qx_setup_store = Ext.create('Ext.data.Store', {
        id:'yun_qx_setup_store',
        model : 'yun_qx_setup_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_yun_qx_grid',
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var yun_qx_setup_grid = new Ext.grid.GridPanel({
        id : 'yun_qx_setup_grid',
        store: yun_qx_setup_store,        
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '单位名称',  width : 150, sortable : true, dataIndex: 'dwmc'},
          { text : '云查询权限',  width : 150, sortable : true, dataIndex: 'qx'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("id");
                
                //DispAj(r,false);
              }
            }
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      if (win==null) {
        win = new Ext.Window({
          id : 'yun_qx_setup_win',
          title: '所有局云查询权限显示及本局云查询权限设置',
          //closeAction: 'hide',
          width: 570,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:yun_qx_setup_grid,          
          tbar:[{
            xtype: 'button',
            iconCls: 'option',
            text:'本局云查询权限设置',
            handler: function() {
              //this.up('window').hide();              
              yun_qx_disp("record",true);
            }
          },          
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('yun_qx_setup_win').close();
            }
          }]
          
        });
      }
      

      win.show();
    };  


	var yun_jyqq = function(recordad){
		Ext.regModel('jydj_jyqq_model', {
			fields: [
				{name: 'id',		type: 'integer'},
				{name: 'jyid',		type: 'integer'},
				{name: 'dwdm',		type: 'string'},
				{name: 'dh',		type: 'string'},
				{name: 'qzh',		type: 'string'},
				{name: 'mlh',		type: 'string'},
				{name: 'ajh',		type: 'string'},
				{name: 'tm',		type: 'string'},
				{name: 'flh',		type: 'string'},
				{name: 'nd',		type: 'string'},
				{name: 'qrq',		type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'zrq',		type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'js',		type: 'string'},
				{name: 'ys',		type: 'string'},
				{name: 'bgqx',		type: 'string'},
				{name: 'mj',		type: 'string'},
				{name: 'xh',		type: 'string'},
				{name: 'cfwz',		type: 'string'},
				{name: 'bz',		type: 'string'},
				{name: 'boxstr',	type: 'string'},
				{name: 'boxrfid',	type: 'string'},
				{name: 'rfidstr',	type: 'string'},
				{name: 'qny',		type: 'string'},
				{name: 'zny',		type: 'string'},
				{name: 'dalb',		type: 'string'},
				{name: 'ip',		type: 'string'},
				{name: 'daszdw',		type: 'string'},
				{name: 'daszfwq',		type: 'string'}

			]
		});
		var jydj_jyqq_store = Ext.create('Ext.data.Store', {
			id:'jydj_jyqq_store',
			model : 'jydj_jyqq_model',
			proxy: {
				type: 'ajax',
				url : '/desktop/get_jydjlist',
				extraParams: {query:''},
				reader: {
					type: 'json',
					root: 'rows',
					totalProperty: 'results'
				}
			}
			//sortInfo:{field: 'level4', direction: "ASC"},
			//baseParams: {start:0, limit:25, query:""}
		});
		var jydj_jyqq_grid = new Ext.grid.GridPanel({
			id : 'jydj_jyqq_grid',
			store: jydj_jyqq_store,
			title:'查询结果列表',
			columns: [
				//{ text : 'file_name', flex : 1,	sortable : true, dataIndex: 'level4'},
				//{ text : 'file_size',	 width : 75, sortable : true, dataIndex: 'file_size'}
				{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
				{ text : 'dalb',	width : 0, sortable : true, dataIndex: 'dalb'},				
				{ text : '单位名称',  width : 100, sortable : true, dataIndex: 'dwdm'},
				{ text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
				{ text : '分类号',	 width : 75, sortable : true, dataIndex: 'flh'},
				{ text : '案卷号',	 width : 75, sortable : true, dataIndex: 'ajh'},
				{ text : '案卷标题',  width : 300, sortable : true, dataIndex: 'tm'},
				{ text : 'ip',	width : 0, sortable : true, dataIndex: 'ip'},
				{ text : 'jyid',	width : 0, sortable : true, dataIndex: 'jyid'},
			   // { text : '件数',	width : 75, sortable : true, dataIndex: 'js'},
			   // { text : '页数',	width : 75, sortable : true, dataIndex: 'ys'},
			   // { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
			   // { text : '起日期',	 width : 0, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
			   // { text : '止日期',	 width : 0, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
			   // { text : '起年月',	 width : 75, sortable : true, dataIndex: 'qny'},
			   // { text : '止年月',	 width : 75, sortable : true, dataIndex: 'zny'},
			   // { text : '档号',	width : 75, sortable : true, dataIndex: 'dh'},
			   // { text : '地籍号',	 width : 75, sortable : true, dataIndex: 'djh'},
			   // { text : '备注',	flex : 1, sortable : true, dataIndex: 'bz'},
				{ text : '档案所在服务器',	flex : 1, sortable : true, dataIndex: 'daszdw'}
				],
				selType:'checkboxmodel',
				multiSelect:true,
			viewConfig: {
				stripeRows:true
			}
		});
		var yun_dw_tree_store = Ext.create('Ext.data.TreeStore', {
	          autoLoad: true,
	          proxy: {
	              type: 'ajax',
	              url: 'desktop/get_yun_dw_tree',
	              extraParams: {style:"0"},
	              actionMethods: 'POST'
	          }
	    }); 
	    var yun_dw_tree_panel = Ext.create('Ext.tree.Panel', {
	        id : 'yun_dw_tree_panel',
	        store: yun_dw_tree_store,
	        rootVisible:false,
	        useArrows: true,
	        //singleExpand: true,
	        width: 200,
	        listeners:{
	          checkchange:function(node,checked,option){          
	            if (checked){             
	              getNodes(node,true);
	              get_parentNode(node);           
	            }else{
	              getNodes(node,false);
	            }           
	          }
	        }     
	    });
		
		
		var yun_js_jyqq_form= new Ext.FormPanel({
				id : 'yun_js_jyqq_form',
				fileUpload: true,
				width: 200,
				height : 100,
				autoHeight: true,
				bodyStyle: 'padding: 5px 5px 5px 5px;',
				labelWidth: 0,
				defaults: {
					anchor: '100%',
					allowBlank: false,
					msgTarget: 'side'
				},
				layout : 'absolute',

				items: [{
					width: 370,
					height: 100,
					xtype:'form',
					border:false,
					layout: 'absolute',
					//id : 'daglaj_form',
					items: [		
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_mlh',
										name:'mlh',
					                    width: 140,
					                    fieldLabel: '',
					                    x: 65,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_ajh',
										name:'ajh',
					                    width: 145,
					                    fieldLabel: '',
					                    x: 270,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_ajtm',
										name:'ajtm',
					                    width: 165,
					                    fieldLabel: '',
					                    x: 495,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_wh',
										name:'wh',
					                    width: 140,
					                    fieldLabel: '',
					                    x: 65,
					                    y: 30
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_zrz',
										name:'zrz',
					                    width: 145,
					                    fieldLabel: '',
					                    x: 270,
					                    y: 30
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_tm',
										name:'tm',
					                    width: 165,
					                    fieldLabel: '',
					                    x: 495,
					                    y: 30
					                },					                
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 65,
					                    text: '目录号：',
					                    x: 15,
					                    y: 5
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    text: '文      号：',
					                    x: 15,
					                    y: 30
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 65,
					                    text: '案卷号：',
					                    x: 210,
					                    y: 5
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 55,
					                    text: '责任者：',
					                    x: 210,
					                    y: 30
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 65,
					                    text: '案卷标题：',
					                    x: 425,
					                    y: 5
					                },
					                {
					                    xtype: 'label',
					                    height: 25,
					                    width: 50,
					                    text: '题名：',
					                    x: 425,
					                    y: 30
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_djh',

					                    width: 140,
					                    fieldLabel: '',
										name:'djh',
					                    x: 65,
					                    y: 55
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_tdzl',
										name:'tdzl',
					                    width: 145,
					                    fieldLabel: '',
					                    x: 270,
					                    y: 55
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'js_jyqq_qlr',
										name:'qlr',
					                    width: 165,
					                    fieldLabel: '',
					                    x: 495,
					                    y: 55
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    text: '地籍号：',
					                    x: 15,
					                    y: 55
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 60,
					                    text: '土地座落：',
					                    x: 210,
					                    y: 55
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    text: '权利人名称：',
					                    x: 425,
					                    y: 55
					                },
									{
					                    xtype: 'button',
					                    height: 70,
					                    id: 'js_jyqq_ss',
					                    width: 75,
					                    text: '查询',
					                    x: 670,
					                    y: 5,
										handler: function() {
											var pars=this.up('panel').getForm().getValues();
											var cx_tj;
											var cdlr;
											cx_tj='';
											if(pars['djh']!=''){
												cx_tj='{"djh":"' + pars['djh'] + '"';
												cdlr="地籍号："+ pars['djh'];
											};
											if(pars['qlr']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ',"qlr":"' + pars['qlr']+ '"';
													cdlr=cdlr + ",权利人名称："+ pars['qlr'];
												}else{
													cx_tj='{"qlr":"' + pars['qlr']+'"';
													cdlr="权利人名称："+ pars['qlr'];
												}
											};
											if(pars['tdzl']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ',"tdzl":"' + pars['tdzl']+ '"';
													cdlr=cdlr + ",土地座落："+ pars['tdzl'];
												}else{
													cx_tj='{"tdzl":"' + pars['tdzl']+ '"';
													cdlr="土地座落："+ pars['tdzl'];
												}
											};
											if(pars['zrz']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ',"zrz":"' + pars['rzr']+ '"';
													cdlr=cdlr + ",责任者："+ pars['rzr'];
												}else{
													cx_tj='{"rzr":"' + pars['zrz']+ '"';
													cdlr="责任者："+ pars['rzr'];
												}
											};
											if(pars['wh']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ',"wh":"' + pars['wh']+ '"';
													cdlr=cdlr + ",文号："+ pars['wh'];
												}else{
													cx_tj='{"wh":"' + pars['wh']+ '"';
													cdlr="文号："+ pars['wh'];
												}
											};
											if(pars['tm']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ',"tm":"' + pars['tm']+ '"';
													cdlr=cdlr + ",题名："+ pars['tm'];
												}else{
													cx_tj='{"tm":"' + pars['tm']+ '"';
													cdlr="题名："+ pars['tm']+ "";
												}
											};
											if(pars['ajtm']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ',"ajtm":"' + pars['ajtm']+ '"';
													cdlr=cdlr + ",案卷标题："+ pars['ajtm'];
												}else{
													cx_tj='{"ajtm":"' + pars['ajtm']+ '"';
													cdlr='案卷标题："'+ pars['ajtm']+ '"';
												}
											};
											if(pars['mlh']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ',"mlh":"' + pars['mlh']+ '"';
													cdlr=cdlr +",目录号："+ pars['mlh'];
												}else{
													cx_tj='{"mlh":"' + pars['mlh']+ '"';
													cdlr="目录号："+ pars['mlh'];
												}
											};
											if(pars['ajh']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ',"ajh":"' + pars['ajh']+ '"';
													cdlr=cdlr+ ",案卷号："+ pars['ajh'];
												}else{
													cx_tj='{"ajh":"' + pars['ajh']+ '"';
													cdlr="案卷号："+ pars['ajh'];
												}
											};
											if (cx_tj!=''){
												cx_tj= cx_tj + "}";
												Ext.getCmp('js_jyqq_jytj').setValue(cx_tj);
												Ext.getCmp('jydj_jyqq_cdlr').setValue(cdlr);
												new Ajax.Request("/desktop/yun_insert_jylc", { 
													method: "POST",
													parameters: Ext.getCmp('jydj_jyqq_form').getValues(),
													onComplete:	 function(request) {
														fhz=request.responseText.split(":");
														if (fhz[0]=='success'){
															Ext.getCmp('js_jyqq_jyid').setValue(fhz[1]);
															var grid = Ext.getCmp('jydj_jyqq_grid');
															grid.store.proxy.url="/desktop/get_yun_jylistbyjyid";
															jydj_jyqq_store.proxy.extraParams=eval("({jyid:" + fhz[1] +",userid:" + currentUser.id + ",jyzt:0})");
															jydj_jyqq_store.load();
															//yun_cz_msg(fhz[1])
														}else{
															alert(request.responseText);
														}
													}
												});
												
											};

										}

					                }
					            ]}]
		});
		var jydj_jyqq_form= new Ext.FormPanel({
						id : 'jydj_jyqq_form',
						fileUpload: true,
						width: 200,
						height : 180,
						autoHeight: true,
						bodyStyle: 'padding: 5px 5px 5px 5px;',
						labelWidth: 0,
						defaults: {
							anchor: '100%',
							allowBlank: false,
							msgTarget: 'side'
						},
						layout : 'absolute',
						tbar:[							  
							{	
								xtype:'button',text:'借阅申请',tooltip:'借阅申请',id:'jyqq_sq',iconCls:'tyqq',
								handler: function() {																
									var grid = Ext.getCmp('jydj_jyqq_grid');
									var data=grid.getSelectionModel().getSelection();
									//alert(data.length);
									if (data.length==0){
										alert("您最少要选择一条案卷进行处理。");
									}else{
										var ids=[];
										Ext.Array.each(data,function(record){
											ids.push(record.get("id"));
										});
										Ext.getCmp('js_jyqq_ids').setValue(ids);
										new Ajax.Request("/desktop/yun_update_jylc", { 
											method: "POST",
											parameters: Ext.getCmp('jydj_jyqq_form').getValues(),
											onComplete:	 function(request) {
												if (request.responseText=='success'){
													alert("申请成功。");
													Ext.getCmp('yun_jyqq_win').close();
													var grid = Ext.getCmp('yun_jydjlc_grid');
													grid.store.proxy.url="/desktop/get_yun_jydjlc_jyzt";
													yun_jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + yun_jydj_jyzt + "})");
													yun_jydjlc_store.load();
												}else{
													alert(request.responseText);
												}
											}
										});										
									}									
								}
							},
							{	
								xtype:'button',text:'退出',tooltip:'退出',id:'jyqq_tc',iconCls:'exit',
									handler: function() {
											Ext.getCmp('yun_jyqq_win').close();
									}
							}
						],
						items: [{
							width: 370,
							height: 180,
							xtype:'form',
							border:false,
							layout: 'absolute',
							//id : 'jydj_form',
							items: [		{
												xtype:'textfield',
												width:300,
												hidden:true,
												name:'id',
												id:'js_jyqq_id',

											},
											{
												xtype:'textfield',
												width:300,
												hidden:true,
												name:'ids',
												id:'js_jyqq_ids',

											},
											{
												xtype:'textfield',
												width:300,
												hidden:true,
												name:'jyid',
												id:'js_jyqq_jyid',

											},
											{
												xtype:'textfield',
												width:300,
												hidden:true,
												name:'jytj',
												id:'js_jyqq_jytj',

											},
											{
												xtype:'textfield',
												width:300,
												hidden:true,
												name:'bjydw',
												id:'js_jyqq_bjydw',

											},	
											{
												xtype: 'textfield',
												hidden : true,
												name : 'jyzt' ,
												id:'jydj_jyqq_jyzt'										
											},
											{
												xtype: 'textfield',
												hidden : true,
												name : 'czrid' ,
												id:'jydj_jyqq_czrid'										
											},
											{
												xtype: 'textfield',
												hidden : true,
												name : 'jy_aj_list' ,
												id:'jydj_jyqq_jy_aj_list'										
											},
							                {
							                    xtype: 'textfield',
							                    name: 'jyr',
							                    fieldLabel: '',
												id:'jydj_jyqq_jyr',
							                    x: 75,
							                    y: 5
							                },
							                {
							                    xtype: 'textfield',
							                    name: 'jydw',
												id:'jydj_jyqq_jydw',
							                    width: 255,
							                    fieldLabel: '',
							                    x: 295,
							                    y: 5
							                },
							                {
							                    xtype: 'textfield',
							                    name: 'fyys',
												id:'jydj_jyqq_fyys',
							                    fieldLabel: '',
							                    x: 75,
							                    y: 105
							                },
							                {
							                    xtype: 'textfield',
							                    name: 'zj',
												id:'jydj_jyqq_zj',
							                    width: 255,
							                    fieldLabel: '',
							                    x: 295,
							                    y: 30
							                },
							                {
							                    xtype: 'combobox',
							                    name: 'jylx',
							                    store: jydj_jylx_store,
												emptyText:'请选择',
												mode: 'remote',
												minChars : 2,
												valueField:'text',
												displayField:'text',
												triggerAction:'all',
							                    x: 75,
							                    y: 30
							                },
							                {
							                    xtype: 'combobox',
							                    name: 'lymd',
							                    store: jydj_lymd_store,
												emptyText:'请选择',
												mode: 'remote',
												minChars : 2,
												valueField:'text',
												displayField:'text',
												triggerAction:'all',
							                    x: 75,
							                    y: 55
							                },
							                {
							                    xtype: 'textfield',
							                    name: 'cdlr',
												id:'jydj_jyqq_cdlr',
							                    width: 255,
							                    fieldLabel: '',
							                    x: 295,
							                    y: 80
							                },
							                {
							                    xtype: 'textfield',
							                    name: 'lyxg',
							                    width: 255,
							                    fieldLabel: '',
							                    x: 295,
							                    y: 55
							                },
							                {
							                    xtype: 'label',
							                    height: 20,
							                    width: 55,
							                    text: '借阅人：',
							                    x: 15,
							                    y: 5
							                },
							                {
							                    xtype: 'label',
							                    height: 20,
							                    width: 65,
							                    text: '借阅单位：',
							                    x: 230,
							                    y: 5
							                },
							                {
							                    xtype: 'combobox',
							                    name: 'jyqx',
							                    store: jydj_jyqx_store,
												emptyText:'请选择',
												mode: 'remote',
												minChars : 2,
												valueField:'value',
												displayField:'text',
												triggerAction:'all',
							                    x: 75,
							                    y: 80
							                },
							                {
							                    xtype: 'label',
							                    height: 25,
							                    width: 65,
							                    text: '借阅类型：',
							                    x: 15,
							                    y: 30
							                },
							                {
							                    xtype: 'label',
							                    height: 20,
							                    width: 65,
							                    text: '利用目的：',
							                    x: 15,
							                    y: 55
							                },
							                {
							                    xtype: 'label',
							                    height: 20,
							                    width: 70,
							                    text: '借阅期限：',
							                    x: 15,
							                    y: 80
							                },
							                {
							                    xtype: 'label',
							                    height: 25,
							                    width: 60,
							                    text: '证件：',
							                    x: 230,
							                    y: 30
							                },
							                {
							                    xtype: 'label',
							                    height: 25,
							                    width: 60,
							                    text: '查档内容：',
							                    x: 230,
							                    y: 80
							                },
							                {
							                    xtype: 'label',
							                    height: 25,
							                    width: 65,
							                    text: '利用效果：',
							                    x: 230,
							                    y: 55
							                },
							                {
							                    xtype: 'label',
							                    height: 25,
							                    width: 65,
							                    text: '复印页数：',
							                    x: 15,
							                    y: 105
							                },
							                {
							                    xtype: 'label',
							                    height: 20,
							                    width: 65,
							                    text: '摘抄页数：',
							                    x: 230,
							                    y: 105
							                },
							                {
							                    xtype: 'label',
							                    height: 20,
							                    width: 55,
							                    text: '备注：',
							                    x: 355,
							                    y: 110
							                },
							                {
							                    xtype: 'textfield',
							                    name: 'zcys',
							                    fieldLabel: '',
												width: 50,
							                    x: 295,
							                    y: 105
							                },
							                {
							                    xtype: 'textfield',
							                    name: 'bz',
							                    width: 150,
							                    fieldLabel: '',
							                    x: 400,
							                    y: 105
							                }
							            ]}],

		});
		var win = Ext.getCmp('yun_jyqq_win');
			
		if (win==undefined) {
			win = new Ext.Window({
				id : 'yun_jyqq_win',
				title: '云查询_借阅请求',
				iconCls:'jyqq',
				layout: 'border',
				modal: true,
				width:1100,
	            height:520,
				items:[
					{
						region: 'center',
						layout: 'border',
						split:true,
						width:550,
						items:[
				    		{
								region: 'north',
								height: 100,
								layout: 'fit',
								items: yun_js_jyqq_form
							},
							{
								region: 'center',
								height: 100,
								layout: 'fit',
								items: jydj_jyqq_grid
							},
							{
								region: 'south',
								layout: 'fit',
								height: 180,
								items:[
									{
										//region: 'center',
										layout: 'fit',
										split:true,
										items: jydj_jyqq_form
									}
								   // ,
								   // {
								   // 	region: 'east',
								   // 	layout: 'fit',
								   // 	split:true,
								   // 	items: yun_dw_tree_panel
								   // }
						
								]
							}]
					},
					{
							  title: '附件列表',
				              collapsible: true,
				              region:'east',
				              split:true,
				              width: 300,
							  id:'imagelist',
				              layout:'fit',
				              tbar:myuploadform,
							bbar:[
							  {
				                xtype: 'combo',
				                x: 130,
				                y: 190,
				                width: 100,
				                name: 'yxbh',
				                id: 'timage_combo',
				                store: yun_timage_store,
				                emptyText:'请选择',
				                mode: 'local',
				                minChars : 2,
				                valueField:'id',
				                displayField:'yxbh',
				                triggerAction:'all',
				                listeners:{
				                  select:function(combo, record, index) {
				                  	var pars={gid:record[0].data.id, type:timage_store.proxy.extraParams.type,userid:currentUser.id};
								      new Ajax.Request("/desktop/yun_get_timage_gid", {
								        method: "POST",
								        parameters: pars,
								        onComplete:  function(request) {
								          path = request.responseText;
								          if (path != '') { 
											//set_image("/assets/dady/fm.jpg");
											set_imagearchive("/assets/dady/fm.jpg");
											if (path.toUpperCase().include('JPG') || path.toUpperCase().include('TIF') || path.toUpperCase().include('JPEG') || path.toUpperCase().include('TIFF')) { 
												ifx=path.split('?');
												imagefx=ifx[1];
									            imageObj1.src = path;
									            drawarchive(scale, translatePos1,imageObj1);
											}else{				
												//location.href= path;
												window.open(path,'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
												imageObj1.src = '';
									            drawchive(scale, translatePos1,imageObj1);
											}
								          }
								        }
								      });
				                  }
				                }
				              },
				              {
				                text: '上一个',
				                handler: function(){
				                  combo = Ext.getCmp('timage_combo');
				                  var currentImage = combo.getStore().getById(combo.getValue());
				                  var currentStoreIndex = combo.getStore().indexOf(currentImage);
				                  var nextStoreValue = combo.getStore().getAt(currentStoreIndex - 1).get('id');
				                  combo.setValue(nextStoreValue);
				                  var pars={gid:nextStoreValue, type:timage_store.proxy.extraParams.type,userid:currentUser.id};
								  new Ajax.Request("/desktop/get_timage_from_db", {
							        method: "POST",
							        parameters: pars,
							        onComplete:  function(request) {
							          path = request.responseText;
							          if (path != '') { 
										//set_image("/assets/dady/fm.jpg");
										set_imagearchive("/assets/dady/fm.jpg");
										if (path.toUpperCase().include('JPG') || path.toUpperCase().include('TIF') || path.toUpperCase().include('JPEG') || path.toUpperCase().include('TIFF')) { 
											ifx=path.split('?');
											imagefx=ifx[1];
								            imageObj1.src = path;
								            drawarchive(scale, translatePos1,imageObj1);
										}else{				
											//location.href= path;
											window.open(path,'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
											imageObj1.src = '';
								            drawchive(scale, translatePos1,imageObj1);
										}
							          }
							        }
							      });



								}
				              },
				              {
				                text: '下一个',
				                handler: function(){
				                  combo = Ext.getCmp('timage_combo');
				                  var currentImage = combo.getStore().getById(combo.getValue());
				                  var currentStoreIndex = combo.getStore().indexOf(currentImage);
				                  var nextStoreValue = combo.getStore().getAt(currentStoreIndex + 1).get('id');
				                  combo.setValue(nextStoreValue);
				                  var pars={gid:nextStoreValue, type:timage_store.proxy.extraParams.type,userid:currentUser.id};
				                  new Ajax.Request("/desktop/get_timage_from_db", {
							        method: "POST",
							        parameters: pars,
							        onComplete:  function(request) {
							          path = request.responseText;
							          if (path != '') { 
										//set_image("/assets/dady/fm.jpg");
										set_imagearchive("/assets/dady/fm.jpg");
										if (path.toUpperCase().include('JPG') || path.toUpperCase().include('TIF') || path.toUpperCase().include('JPEG') || path.toUpperCase().include('TIFF')) { 
											ifx=path.split('?');
											imagefx=ifx[1];
								            imageObj1.src = path;
								            drawarchive(scale, translatePos1,imageObj1);
										}else{				
											//location.href= path;
											window.open(path,'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
											imageObj1.src = '';
								            drawchive(scale, translatePos1,imageObj1);
										}
							          }
							        }
							      });     
				                }
				              },
				              {
				                text: '打印图像',
				                handler : function() {
									combo = Ext.getCmp('timage_combo').displayTplData[0].yxmc;
									if(combo!=''){
										new Ajax.Request("/desktop/get_users_sort_forqxdm", { 
									        method: "POST",
									        parameters: eval("({userid:" + currentUser.id + ",qxdm:'ip',qxlb:1,dh:'" + dh + "'})"),
									        onComplete:  function(request) {
									        	if (request.responseText=='success'){
					                  				LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM'));                        
									                  //LODOP.ADD_PRINT_BARCODE(0,0,200,100,"Code39","*123ABC4567890*");
									                  //image_path = Ext.getCmp('preview_img').getEl().dom.src.replace(/-/ig, "_");
									                  //image_path = Ext.getCmp('preview_img').getEl().dom.src;
													  image_path = window.location.href + "/assets/dady/img_tmp/" + dh + "/" + combo;
									                  LODOP.PRINT_INIT(image_path);
									                  LODOP.SET_PRINT_PAGESIZE(imagefx,0,0,"A4");
									                  LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
									                  LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
									                  LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
									                  LODOP.PREVIEW();
									                  //LODOP.PRINT();
												}else{
										            alert('您无此类档案的打印影像文件的权限。');
										          }
										        }
										});
									}
				                }
				              },
				              {
				                  text: '删除图像',
				                  handler : function() {
				                  if (dh!=''){
				                    combo = Ext.getCmp('timage_combo').displayTplData[0].yxbh;
				                    if (combo!=''){
				                      Ext.Msg.confirm("提示信息","是否要删除："+combo+" 图像？",function callback(id){
				                        if(id=="yes"){
				                          var pars="{yxmc:'"+combo+"',dh:'"+dh + "'}";						  
				                          new Ajax.Request("/desktop/delete_timage", {
				                              method: "POST",
				                              //parameters: {yxmc:combo,dh:dh},
											  parameters: eval("({yxmc:'" + combo + "',dh:'" + dh +"',userid:" + currentUser.id + "})"),
				                              onComplete:  function(request) {
				                                var path = request.responseText;
												if (path == 'notsort'){
													alert("您无删除此类档案影像文件的权限。")
												}else{
				                                	if (path == 'success') { 
					                                  timage_store.proxy.extraParams = {dh:dh, type:'0'};
					                                  timage_store.load();
					                                  Ext.getCmp('timage_combo').lastQuery = null;
					                                  //Ext.getCmp('preview_img').getEl().dom.src = '';
													  set_imagearchive("/assets/dady/fm.jpg");
					                                }
												}
				                              }
				                          });
				                        }
				                      });
				                    }
				                  }
				                  }   // handler
				              },
				              {
				                  text: '删除整卷图像',
				                  handler : function() {
				                  if (dh!=''){
									combo = Ext.getCmp('timage_combo').displayTplData[0].yxbh;
				                      Ext.Msg.confirm("提示信息","是否要整卷删除图像？",function callback(id){
				                        if(id=="yes"){
				                          var pars="{dh:'"+dh + "'}";
				                          new Ajax.Request("/desktop/delete_all_timage", {
				                              method: "POST",
				                              //parameters: {dh:dh},
											  parameters: eval("({yxmc:'" + combo + "',dh:'" + dh +"',userid:" + currentUser.id + "})"),
				                              onComplete:  function(request) {
				                                var path = request.responseText;
												if (path == 'notsort'){
													alert("您无删除此类档案影像文件的权限。")
												}else{
				                                	if (path == 'success') { 
					                                  timage_store.proxy.extraParams = {dh:dh, type:'0'};
					                                  timage_store.load();
					                                  Ext.getCmp('timage_combo').lastQuery = null;
					                                  Ext.getCmp('preview_img').getEl().dom.src = '';
					                                }
												}
				                              }
				                          });
				                        }
				                      });                    
				                  }
				                  }   // handler
				              }],     //bbar
				
				              items:[			   
								{
									xtype: 'panel', //或者xtype: 'component',
									layout:'fit',
						        	html:canvas_string
								}
				        	  ]	
					}
				]			
			})
				//closeAction: 'hide',				
		}

	    Ext.getCmp('jydj_jyqq_czrid').setValue(currentUser.id);
		Ext.getCmp('jydj_jyqq_jyr').setValue(currentUser.username);
		win.show();
	};	

	var yun_clqq = function(recordad){
		Ext.regModel('jydj_clqq_model', {
			fields: [
				{name: 'id',		type: 'integer'},
				{name: 'dwdm',		type: 'string'},
				{name: 'dh',		type: 'string'},
				{name: 'qzh',		type: 'string'},
				{name: 'mlh',		type: 'string'},
				{name: 'ajh',		type: 'string'},
				{name: 'tm',		type: 'string'},
				{name: 'flh',		type: 'string'},
				{name: 'nd',		type: 'string'},
				{name: 'qrq',		type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'zrq',		type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'js',		type: 'string'},
				{name: 'ys',		type: 'string'},
				{name: 'bgqx',		type: 'string'},
				{name: 'mj',		type: 'string'},
				{name: 'xh',		type: 'string'},
				{name: 'cfwz',		type: 'string'},
				{name: 'bz',		type: 'string'},
				{name: 'boxstr',	type: 'string'},
				{name: 'boxrfid',	type: 'string'},
				{name: 'rfidstr',	type: 'string'},
				{name: 'qny',		type: 'string'},
				{name: 'zny',		type: 'string'},
				{name: 'dalb',		type: 'string'}

			]
		});
		var jydj_clqq_store = Ext.create('Ext.data.Store', {
			id:'jydj_clqq_store',
			model : 'jydj_clqq_model',
			proxy: {
				type: 'ajax',
				url : '/desktop/get_jydjlist',
				extraParams: {query:''},
				reader: {
					type: 'json',
					root: 'rows',
					totalProperty: 'results'
				}
			}
			//sortInfo:{field: 'level4', direction: "ASC"},
			//baseParams: {start:0, limit:25, query:""}
		});
		var jydj_clqq_grid = new Ext.grid.GridPanel({
			id : 'jydj_clqq_grid',
			store: jydj_clqq_store,
			title:'查询结果列表',

			columns: [
				//{ text : 'file_name', flex : 1,	sortable : true, dataIndex: 'level4'},
				//{ text : 'file_size',	 width : 75, sortable : true, dataIndex: 'file_size'}
				{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
				{ text : 'dalb',	width : 0, sortable : true, dataIndex: 'dalb'},

				{ text : '单位代码',  width : 0, sortable : true, dataIndex: 'dwdm'},
				{ text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},

				{ text : '分类号',	 width : 75, sortable : true, dataIndex: 'flh'},
				{ text : '案卷号',	 width : 75, sortable : true, dataIndex: 'ajh'},
				{ text : '案卷标题',  width : 175, sortable : true, dataIndex: 'tm'},

				{ text : '年度',	width : 75, sortable : true, dataIndex: 'nd'},
				{ text : '件数',	width : 75, sortable : true, dataIndex: 'js'},
				{ text : '页数',	width : 75, sortable : true, dataIndex: 'ys'},
				{ text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
				{ text : '起日期',	 width : 0, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
				{ text : '止日期',	 width : 0, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
				{ text : '起年月',	 width : 75, sortable : true, dataIndex: 'qny'},
				{ text : '止年月',	 width : 75, sortable : true, dataIndex: 'zny'},
				{ text : '档号',	width : 75, sortable : true, dataIndex: 'dh'},
				{ text : '地籍号',	 width : 75, sortable : true, dataIndex: 'djh'},
				{ text : '备注',	flex : 1, sortable : true, dataIndex: 'bz'}

				],
				selType:'checkboxmodel',
				multiSelect:true,
				listeners:{
					itemdblclick:{
						fn:function(v,r,i,n,e,b){
							var tt=r.get("zrq");
							//showContactForm();
							switch (r.data.dalb) { 
			                  case "0": 
			                    DispAj_zh(r,'3',r.data.dh);
			                    break; 
			                  case "2": 
			                    DispAj_cw(r,'3',r.data.dh);
			                    break; 
			                  case "3": 
			                    DispAj_tddj(r,'3',r.data.dh);
			                    break; 
			                  case "24": 
			                    DispAj_wsda(r,'3',r.data.dh);
			                    break;				                 								　　
					          case "15": 
								DispAj_sx(r,'3',r.data.dh);						              
					            break;						          
					          case "5": 
								DispAj_tddj(r,'3',r.data.dh);	
					            break;
					          case "6":
								DispAj_tddj(r,'3',r.data.dh);	 						              
					            break;
					          case "7": 
								DispAj_tddj(r,'3',r.data.dh);							              
					              break;						            
					          case "25":
								DispAj_qtda_dzda(r,'3',r.data.dh);							              
					            break;
					          case "26":
								DispAj_qtda_jjda(r,'3',r.data.dh);
					            break;
					          case "27":
								DispAj_qtda_sbda(r,'3',r.data.dh);
					            break;        
					         　case "28":
								DispAj_qtda_swda(r,'3',r.data.dh);
					            break;
					         　case "29":
								DispAj_qtda_zlxx(r,'3',r.data.dh);
					            break;
					          case "30":
								DispAj_by_tszlhj(r,'3',r.data.dh);
					            break;
					          case "31":
								DispAj_by_tszlhj(r,'3',r.data.dh);
					            break;
					          case "32":
								DispAj_by_zzjgyg(r,'3',r.data.dh);
					            break;
					          case "33":
								DispAj_by_dsj(r,'3',r.data.dh);
					            break;
					          case "34":
								DispAj_by_qzsm(r,'3',r.data.dh);
					            break;
					          case "18":
								DispAj_tjml(r,'3',r.data.dh);
					            break;
					          default:
					            DispAj_zh(r,'3',r.data.dh);
					            break;
			                }

						}
					}
				},
			//width : 800,
			//height : 300,
			viewConfig: {
				stripeRows:true
			}
		});
		var jydj_clqq_form= new Ext.FormPanel({
				id : 'jydj_clqq_form',
				fileUpload: true,
				width: 850,
				height : 180,
				autoHeight: true,
				bodyStyle: 'padding: 5px 5px 5px 5px;',
				labelWidth: 0,
				defaults: {
					anchor: '100%',
					allowBlank: false,
					msgTarget: 'side'
				},
				layout : 'absolute',
				tbar:[							  
					{	
						xtype:'button',text:'同意',tooltip:'同意',id:'clqq_ty',iconCls:'tyqq',
						handler: function() {
							var grid = Ext.getCmp('jydj_clqq_grid');
							var data=grid.getSelectionModel().getSelection();
							//alert(data.length);
							if (data.length==0){
								alert("您最少要选择一条案卷进行处理。");
							}else{
								var ids=[];
								Ext.Array.each(data,function(record){
									ids.push(record.get("id"));
								});
								Ext.getCmp('jydj_clqq_jyzt').setValue('2');
								Ext.getCmp('jydj_clqq_jy_aj_list').setValue(ids);

								new Ajax.Request("/desktop/yun_clqq_jylc", { 
									method: "POST",
									parameters: Ext.getCmp('jydj_clqq_form').getValues(),
									onComplete:	 function(request) {
										if (request.responseText=='success'){
											alert("借阅申请处理成功。");
											Ext.getCmp('yun_clqq_win').close();
											var grid = Ext.getCmp('yun_jydjlc_grid');
											grid.store.proxy.url="/desktop/get_yun_jydjlc_jyzt";
											yun_jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + yun_jydj_jyzt + "})");
											yun_jydjlc_store.load();
										}else{
											alert("借阅申请处理失败，请重新处理。");
										}
									}
								});


							}
						}
					},
					{	
						xtype:'button',text:'退出',tooltip:'退出',id:'clqq_tc',iconCls:'exit',
						handler: function() {
							Ext.getCmp('yun_clqq_win').close();
						}
					}
				],
				items: [{
					width: 850,
					height: 180,
					xtype:'form',
					border:false,
					layout: 'absolute',
					//id : 'jydj_form',
					items: [		
									{
										xtype: 'textfield',
										hidden : true,
										name : 'id' ,
										id:'jydj_clqq_id'										
									},{
										xtype: 'textfield',
										hidden : true,
										name : 'jytj' ,
										id:'jydj_clqq_jytj'										
									},{
										xtype: 'textfield',
										hidden : true,
										name : 'jyzt' ,
										id:'jydj_clqq_jyzt'										
									},
									{
										xtype: 'textfield',
										hidden : true,
										name : 'czrname' ,
										id:'jydj_clqq_czrname'										
									},
									{
										xtype: 'textfield',
										hidden : true,
										name : 'czrid' ,
										id:'jydj_clqq_czrid'										
									},
									{
										xtype: 'textfield',
										hidden : true,
										name : 'jy_aj_list' ,
										id:'jydj_clqq_jy_aj_list'										
									},
					                {
					                    xtype: 'textfield',
					                    name: 'jyr',
										readOnly:true,
					                    fieldLabel: '',
					                    x: 75,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    name: 'jydw',
										readOnly:true,
					                    width: 465,
					                    fieldLabel: '',
					                    x: 295,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    name: 'fyys',
					                    fieldLabel: '',
					                    x: 75,
					                    y: 105
					                },
					                {
					                    xtype: 'textfield',
					                    name: 'zj',
					                    width: 465,
					                    fieldLabel: '',
					                    x: 295,
					                    y: 30
					                },
					                {
					                    xtype: 'combobox',
					                    name: 'jylx',
					                    store: jydj_jylx_store,
										emptyText:'请选择',
										mode: 'remote',
										minChars : 2,
										valueField:'text',
										displayField:'text',
										triggerAction:'all',
					                    x: 75,
					                    y: 30
					                },
					                {
					                    xtype: 'combobox',
					                    name: 'lymd',
					                    store: jydj_lymd_store,
										emptyText:'请选择',
										mode: 'remote',
										minChars : 2,
										valueField:'text',
										displayField:'text',
										triggerAction:'all',
					                    x: 75,
					                    y: 55
					                },
					                {
					                    xtype: 'textfield',
					                    name: 'cdlr',
										id:'jydj_clqq_cdlr',
					                    width: 465,
					                    fieldLabel: '',
					                    x: 295,
					                    y: 80
					                },
					                {
					                    xtype: 'textfield',
					                    name: 'lyxg',
					                    width: 465,
					                    fieldLabel: '',
					                    x: 295,
					                    y: 55
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 55,
					                    text: '借阅人：',
					                    x: 15,
					                    y: 5
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 65,
					                    text: '借阅单位：',
					                    x: 230,
					                    y: 5
					                },
					                {
					                    xtype: 'combobox',
					                    name: 'jyqx',
					                    store: jydj_jyqx_store,
										emptyText:'请选择',
										mode: 'remote',
										minChars : 2,
										valueField:'value',
										displayField:'text',
										triggerAction:'all',
					                    x: 75,
					                    y: 80
					                },
					                {
					                    xtype: 'label',
					                    height: 25,
					                    width: 65,
					                    text: '借阅类型：',
					                    x: 15,
					                    y: 30
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 65,
					                    text: '利用目的：',
					                    x: 15,
					                    y: 55
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 70,
					                    text: '借阅期限：',
					                    x: 15,
					                    y: 80
					                },
					                {
					                    xtype: 'label',
					                    height: 25,
					                    width: 60,
					                    text: '证件：',
					                    x: 230,
					                    y: 30
					                },
					                {
					                    xtype: 'label',
					                    height: 25,
					                    width: 60,
					                    text: '查档内容：',
					                    x: 230,
					                    y: 80
					                },
					                {
					                    xtype: 'label',
					                    height: 25,
					                    width: 65,
					                    text: '利用效果：',
					                    x: 230,
					                    y: 55
					                },
					                {
					                    xtype: 'label',
					                    height: 25,
					                    width: 65,
					                    text: '复印页数：',
					                    x: 15,
					                    y: 105
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 65,
					                    text: '摘抄页数：',
					                    x: 230,
					                    y: 105
					                },
					                {
					                    xtype: 'label',
					                    height: 20,
					                    width: 55,
					                    text: '备注：',
					                    x: 455,
					                    y: 110
					                },
					                {
					                    xtype: 'textfield',
					                    name: 'zcys',
					                    fieldLabel: '',
					                    x: 295,
					                    y: 105
					                },
					                {
					                    xtype: 'textfield',
					                    name: 'bz',
					                    width: 260,
					                    fieldLabel: '',
					                    x: 500,
					                    y: 105
					                }
					            ]}],

		});
		var win = Ext.getCmp('yun_clqq_win');
		if (win==null) {
			win = new Ext.Window({
				id : 'yun_clqq_win',
				title: '云查询_审批请求',
				modal: true,
				iconCls:'clqq',
				layout: 'border',
				width:1100,
	            height:520,
				items:[	
					{
						region: 'center',
						layout: 'border',
						split:true,
						width:550,
						items:[				
							{
								region:'center',
								//height: 100,
								layout: 'fit',
								items:jydj_clqq_grid
							},{
								region: 'south',
								//iconCls:'icon-grid',						
								layout: 'fit',
								height: 180,						
								items:jydj_clqq_form
							}]	
					},
					{
						title: '附件列表',
			              collapsible: true,
			              region:'east',
			              split:true,
			              width: 300,
						  id:'imagelist',
			              layout:'fit',
			              
						  bbar:[
						  	  {
				                xtype: 'combo',
				                x: 130,
				                y: 190,
				                width: 100,
				                name: 'yxbh',
				                id: 'timage_combo',
				                store: yun_timage_store,
				                emptyText:'请选择',
				                mode: 'local',
				                minChars : 2,
				                valueField:'id',
				                displayField:'yxbh',
				                triggerAction:'all',
				                listeners:{
				                  select:function(combo, record, index) {
				                  	var pars={gid:record[0].data.id, type:timage_store.proxy.extraParams.type,userid:currentUser.id};
								      new Ajax.Request("/desktop/yun_get_timage_gid", {
								        method: "POST",
								        parameters: pars,
								        onComplete:  function(request) {
								          path = request.responseText;
								          if (path != '') { 
											//set_image("/assets/dady/fm.jpg");
											set_imagearchive("/assets/dady/fm.jpg");
											if (path.toUpperCase().include('JPG') || path.toUpperCase().include('TIF') || path.toUpperCase().include('JPEG') || path.toUpperCase().include('TIFF')) { 
												ifx=path.split('?');
												imagefx=ifx[1];
									            imageObj1.src = path;
									            drawarchive(scale, translatePos1,imageObj1);
											}else{				
												//location.href= path;
												window.open(path,'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
												imageObj1.src = '';
									            drawchive(scale, translatePos1,imageObj1);
											}
								          }
								        }
								      });
				                  }
				                }
				              },
			              
				              {
				                text: '打印图像',
				                handler : function() {
									combo = Ext.getCmp('timage_combo').displayTplData[0].yxmc;
									if(combo!=''){
										new Ajax.Request("/desktop/get_users_sort_forqxdm", { 
									        method: "POST",
									        parameters: eval("({userid:" + currentUser.id + ",qxdm:'ip',qxlb:1,dh:'" + dh + "'})"),
									        onComplete:  function(request) {
									        	if (request.responseText=='success'){
					                  				LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM'));                        
									                  //LODOP.ADD_PRINT_BARCODE(0,0,200,100,"Code39","*123ABC4567890*");
									                  //image_path = Ext.getCmp('preview_img').getEl().dom.src.replace(/-/ig, "_");
									                  //image_path = Ext.getCmp('preview_img').getEl().dom.src;
													  image_path = window.location.href + "/assets/dady/img_tmp/" + dh + "/" + combo;
									                  LODOP.PRINT_INIT(image_path);
									                  LODOP.SET_PRINT_PAGESIZE(imagefx,0,0,"A4");
									                  LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
									                  LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
									                  LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
									                  LODOP.PREVIEW();
									                  //LODOP.PRINT();
												}else{
										            alert('您无此类档案的打印影像文件的权限。');
										          }
										        }
										});
									}
				                }
				              }
			              
			              ],     //bbar
			
			              items:[			   
							{
								xtype: 'panel', //或者xtype: 'component',
								layout:'fit',
					        	html:canvas_string
							}
			        	  ]	
					}
				]							
			})		
		}
		Ext.getCmp('jydj_clqq_form').getForm().setValues(recordad.data);
		//Ext.getCmp('clqq_query_text').setValue(recordad.data.jytj);
		Ext.getCmp('jydj_clqq_jytj').setValue(recordad.data.jytj);
		Ext.getCmp('jydj_clqq_id').setValue(recordad.data.id);		
		Ext.getCmp('jydj_clqq_czrid').setValue(currentUser.id);
		Ext.getCmp('jydj_clqq_czrname').setValue(currentUser.username);

		var grid = Ext.getCmp('jydj_clqq_grid');
		grid.store.proxy.url="/desktop/get_yun_jylistbyjyid";
		grid.store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:1,jyid:" + recordad.data.id + "})");										
		grid.store.load();
		yun_timage_store.proxy.extraParams = {id:Ext.getCmp('jydj_clqq_id').value, type:'0'};
		yun_timage_store.load();
		win.show();
	};	



	var yun_jytj = function(){
		var win = Ext.getCmp('jytj_win');
		var tjlb='';
		Ext.regModel('com_document_model', {
			fields: [
					{name: 'xh',		type: 'integer'},
					{name: 'jydw',		type: 'string'},
					{name: 'tm',		type: 'string'},
					{name: 'lymd',		type: 'string'},
					{name: 'jh',		type: 'string'},
					{name: 'jyr',		type: 'string'},
					{name: 'rq',		type: 'string'},
					{name: 'ghrq',		type: 'string'},
					{name: 'zjlr',		type: 'string'}
			]
		});

		var com_document_store = Ext.create('Ext.data.Store', {
			model : 'com_document_model',
			proxy: {
				type: 'ajax',
				url : '/desktop/get_jytj',
				extraParams: {query:""},
				reader: {
					type: 'json',
					root: 'rows',
					totalProperty: 'results'
				}
			}
		});

		var documentGrid = new Ext.grid.GridPanel({
			id : 'jytj_grid',
			store: com_document_store,		
			columns: [
				{ text : '序号',	width : 20, sortable : true, dataIndex: 'xh'},
				{ text : '日期',	width : 75, sortable : true, dataIndex: 'rq'},
				{ text : '借阅单位',	width : 175, sortable : true, dataIndex: 'jydw'},
				{ text : '案卷标题',	 width : 175, sortable : true, dataIndex: 'tm'},
				{ text : '利用目的',	width : 105, sortable : true, dataIndex: 'lymd'},
				{ text : '卷号',	 width : 75, sortable : true, dataIndex: 'jh'},
				{ text : '借阅人',	width : 175, sortable : true, dataIndex: 'jyr'},
				{ text : '归还日期',	width : 75, sortable : true, dataIndex: 'ghrq'},
				{ text : '证件内容',	width : 75, sortable : true, dataIndex: 'zjlr'}
				],
			viewConfig: {
				stripeRows:true
			}
		});
		Ext.regModel('tj_model', {
			fields: [
					{name: 'qrq',		type: 'string'},
					{name: 'zrq',		type: 'string'},
					{name: 'jyrc',		type: 'string'},
					{name: 'jyjc',		type: 'string'},
					{name: 'bsxz',		type: 'string'},
					{name: 'gzkc',		type: 'string'},
					{name: 'xsyj',		type: 'string'},
					{name: 'jjjs',		type: 'string'},
					{name: 'xcjy',		type: 'string'},
					{name: 'qt',		type: 'string'},
					{name: 'fyys',		type: 'string'},
					{name: 'zcys',		type: 'string'}
			]
		});

		var tj_store = Ext.create('Ext.data.Store', {
			model : 'tj_model',
			proxy: {
				type: 'ajax',
				url : '/desktop/get_jytj',
				extraParams: {query:""},
				reader: {
					type: 'json',
					root: 'rows',
					totalProperty: 'results'
				}
			}
		});

		var tjGrid = new Ext.grid.GridPanel({
			id : 'tj_grid',
			store: tj_store,
			//layout:'fit',
			//height:150,	
			//width:300,	
			columns: [
				{ text : '起日期',	width : 75, sortable : true, dataIndex: 'qrq'},
				{ text : '止日期',	width : 75, sortable : true, dataIndex: 'zrq'},
				{ text : '借阅人次',	width : 75, sortable : true, dataIndex: 'jyrc'},
				{ text : '借阅卷次',	 width : 75, sortable : true, dataIndex: 'jyjc'},
				{ text : '编史修志',	width : 75, sortable : true, dataIndex: 'bsxz'},
				{ text : '工作考查',	 width : 75, sortable : true, dataIndex: 'gzkc'},
				{ text : '学术研究',	width : 75, sortable : true, dataIndex: 'xsyj'},
				{ text : '经济建设',	width : 75, sortable : true, dataIndex: 'jjjs'},
				{ text : '宣传教育',	width : 75, sortable : true, dataIndex: 'xcjy'},
				{ text : '其它',	width : 75, sortable : true, dataIndex: 'qt'},
				{ text : '复印页数',	width : 75, sortable : true, dataIndex: 'fyys'},
				{ text : '摘抄页数',	width : 75, sortable : true, dataIndex: 'zcys'}
				],
			viewConfig: {
				stripeRows:true
			}
		});
		function get_jytj_grid(zt) {		
				if (Ext.getCmp('tj_qrq').rawValue=='' || Ext.getCmp('tj_zrq').rawValue==''){
					alert("起日期或止日期不能为空，请选择。");
				}else{
					tjlb=zt;
					Ext.getCmp('jytj_grid').setVisible(true); 
					Ext.getCmp('tj_grid').setVisible(false);
					com_document_store.proxy.extraParams.query=zt;
					com_document_store.proxy.extraParams.qrq=Ext.getCmp('tj_qrq').rawValue;
					com_document_store.proxy.extraParams.zrq=Ext.getCmp('tj_zrq').rawValue;
					com_document_store.proxy.extraParams.jyr=Ext.getCmp('tj_jyr').value;
					com_document_store.proxy.extraParams.jydw=Ext.getCmp('tj_jydw').value;
		            com_document_store.load();
				};			
	    };
		function print_jytj(zt) {		
				if (Ext.getCmp('tj_qrq').rawValue=='' || Ext.getCmp('tj_zrq').rawValue==''){
					alert("起日期或止日期不能为空，请选择。");
				}else{				
					new Ajax.Request("/desktop/dajy_print", { 
						method: "POST",
						parameters: eval("({query:'" + zt + "',qrq:'" + Ext.getCmp('tj_qrq').rawValue + "',zrq:'" + Ext.getCmp('tj_zrq').rawValue + "',jyr:'" + Ext.getCmp('tj_jyr').rawValue + "',jydw:'" + Ext.getCmp('tj_jydw').rawValue + "'})"),
						onComplete:	 function(request) {
							fhz=request.responseText.split(":");
							if (fhz[0]=='success'){
							   // printfile=fhz[1].split(",");
							   // for (k=0;k<printfile.length;k++){
							   //   	LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM')); 
							   //   	image_path = window.location.href + "assets/dady/tmp1/" + printfile[k];
							   //   	LODOP.PRINT_INIT(image_path);
							   //   	if (zt=='4'){
							   //   		LODOP.SET_PRINT_PAGESIZE(1,0,0,"A4");
							   //   	}else{
							   // 		LODOP.SET_PRINT_PAGESIZE(2,0,0,"A4");
							   //   	}
					           //   	LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
					           //   	LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
					           //   	LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
					           //   	//LODOP.PREVIEW();
							   //   	LODOP.PRINT();
							   // }
							   // alert("打印成功。"+fhz[1] );	
								window.open(fhz[1],'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');											
							}else{
								alert(request.responseText);
							}						
						}
					});
				};			
	    };

		if (win==null) {
			win = new Ext.Window({
				id : 'jytj_win',
				title: '云查询_档案利用统计',
				//closeAction: 'hide',
				width: 579,
				height: 350,
				minHeight: 350,
				layout: 'border',
				modal: true,
				plain: true,
				bbar:[
					
					{
						xtype: 'button',
						iconCls: 'tj',
						text:'统计汇总',
						handler: function() {
							Ext.getCmp('jytj_grid').setVisible(false); 
							Ext.getCmp('tj_grid').setVisible(true);
							tjlb='4';	
							Ext.getCmp('tj_grid').setHeight(160);
							Ext.getCmp('tj_grid').setWidth(579);						
							tj_store.proxy.extraParams.query=tjlb;
							tj_store.proxy.extraParams.qrq=Ext.getCmp('tj_qrq').rawValue;
							tj_store.proxy.extraParams.zrq=Ext.getCmp('tj_zrq').rawValue;
							tj_store.proxy.extraParams.jyr=Ext.getCmp('tj_jyr').value;
							tj_store.proxy.extraParams.jydw=Ext.getCmp('tj_jydw').value;
				            tj_store.load();
						}
					},
					{
						xtype: 'button',
						iconCls: 'print',
						text:'打印',
						handler: function() {
							if (tjlb!=""){							
								print_jytj(tjlb);	
							}
						}
					},				
					{
						xtype: 'button',
						iconCls: 'exit',
						text:'退出',
						handler: function() {
							Ext.getCmp('jytj_win').close();
						}
					}],
				items: [{
					region: 'center',
					iconCls:'icon-grid',
					layout: 'fit',
					height: 150,
					title: '云查询_统计结果',
					items: [documentGrid,tjGrid]
				},{
					width: 579,
					height: 95,
					region: 'north',
					split: true,
					collapsible: true,
					title: '云查询_档案利用统计条件',
					xtype:'form',
					layout: 'absolute',
					items: [
		                {
						    xtype: 'datefield',
	                        width: 　200,
	                        fieldLabel: '起日期',
						 	id:'tj_qrq',
	                        labelWidth: 60,
						 	format: 'Y-m-d',
						 	x: 10,
	                        y: 10
	                    },
	                    {
	                        xtype: 'datefield',
	                        width: 　200,
	                        fieldLabel: '止日期',
						 	format: 'Y-m-d',
						 	id:'tj_zrq',
	                        labelWidth: 60,
	                        x: 10,
	                        y: 40
	                    },
	                    {
	                        xtype: 'textfield',
	                        width: 310,
	                        fieldLabel: '借阅人',
						 	id:'tj_jyr',
	                        labelWidth: 60,
	                        x: 230,
	                        y: 10
	                    },
	                    {
	                        xtype: 'textfield',
	                        width: 310,
	                        fieldLabel: '借阅单位',
						 	id:'tj_jydw',
	                        labelWidth: 60,
	                        x: 230,
	                        y: 40
	                    }
		            ]
				}]
			});
		}	
		win.show();
	};


    var yundangan_tree_store = Ext.create('Ext.data.TreeStore', {
      //autoLoad: true,
      proxy: {
          type: 'ajax',
          url: 'desktop/get_yundangan_tree',
          extraParams: {userid:currentUser.id},
          actionMethods: 'POST'
      }
    });

    var yundangan_tree_panel = Ext.create('Ext.tree.Panel', {
      id : 'yundangan_tree_panel',
      store: yundangan_tree_store,
      rootVisible:false,
      useArrows: true,
      listeners:{
        checkchange:function(node,checked,option){
          if(checked){
            root=Ext.getCmp('yundangan_tree_panel').store.getRootNode();     
            getNodes(root,false);
            node.data.checked=true;
            node.updateInfo({checked:true});
            if (Ext.getCmp('danwei_setup_win')!=undefined){Ext.getCmp('danwei_setup_win').close();}
			
            switch (node.data.id) { 
              case "1": 
                danwei_setup();
                break; 
              case "2": 
                yun_qx_setup();
                break; 
              case "3": 
                yun_jyqq();
                break; 
              case "4": 
                yun_clqq();
                break;
              case "5": 
                yun_jytj();
                break;
              case "6": 
                yun_jytj();
                break;
			  case "18": 
	            qcj_setup();
	            break;

			　　case "17": 
	            jr_model_setup();
                break;
			　　case "19": 
	            tj_ysjs_setup();
                break;
			  case "20": 
	            rz_manage();
                break;
        	  case "21": 
	            data_manage();
	            break;
			  case "22": 
	            program_updata();
	            break;
            }
          }
          
        }
      }
    });

	Ext.regModel('yun_jydjlc_model', {
		fields: [
			{name: 'id',		type: 'integer'},
			{name: 'jyr',		type: 'string'},
			{name: 'jydw',		type: 'string'},
			{name: 'jyqx',		type: 'string'},
			{name: 'lymd',		type: 'string'},
			{name: 'cdlr',		type: 'string'},
			{name: 'jysj',		type: 'date', dateFormat: 'Y-m-d H:i:s'},
			{name: 'jyzt',		type: 'integer'},
			{name: 'jyid',		type: 'integer'},
			{name: 'jylist',	type: 'string'},
			{name: 'jytj',	type: 'string'},
			{name: 'jylx',	type: 'string'},
			{name: 'hdsj',	type: 'date', dateFormat: 'Y-m-d H:i:s'},
			{name: 'fyys',	type: 'integer'},
			{name: 'zcys',	type: 'integer'},
			{name: 'jyqx',	type: 'integer'},
			{name: 'czrid',	type: 'integer'},
			{name: 'lyxg',	type: 'string'},
			{name: 'zj',	type: 'string'}
		]
	});
	var yun_jydjlc_store = Ext.create('Ext.data.Store', {
			id:'yun_jydjlc_store',
			model : 'yun_jydjlc_model',
			proxy: {
				type: 'ajax',
				url : '/desktop/get_archive',
				extraParams: {query:''},
				reader: {
					type: 'json',
					root: 'rows',
					totalProperty: 'results'
				}
			}
			//sortInfo:{field: 'level4', direction: "ASC"},
			//baseParams: {start:0, limit:25, query:""}
	});
	var yun_jydjlc_grid = new Ext.grid.GridPanel({
			id : 'yun_jydjlc_grid',
			store: yun_jydjlc_store,
			title:'借阅申请列表：',
			bbar:[
              new Ext.PagingToolbar({
                store: yun_jydjlc_store,
                pageSize: 25,
                width : 400,
                border : false,
                displayInfo: true,
                displayMsg: '{0} - {1} of {2}',
                emptyMsg: "没有找到！",
                prependButtons: true
              })
            ],
			columns: [
				//{ text : 'file_name', flex : 1,	sortable : true, dataIndex: 'level4'},
				//{ text : 'file_size',	 width : 75, sortable : true, dataIndex: 'file_size'}
				{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
				{ text : '借阅人',	width : 50, sortable : true, dataIndex: 'jyr'},
				{ text : '借阅单位',	width : 155, sortable : true, dataIndex: 'jydw'},
				{ text : '查档内容',	width : 155, sortable : true, dataIndex: 'cdlr'},								
				{ text : '利用目的',	 width : 95, sortable : true, dataIndex: 'lymd'},				
				{ text : '借阅时间',	 width : 75, sortable : true, dataIndex: 'jysj', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
				{ text : 'jyzt',	 width : 0, sortable : true, dataIndex: 'jyzt'},
				{ text : '借阅期限', width : 0, sortable : true, dataIndex: 'jyqx'},
				{ text : 'jyid',	 width : 0, sortable : true, dataIndex: 'jyid'},
				{ text : 'jylist',	 width : 0, sortable : true, dataIndex: 'jylist'},
				{ text : 'jytj',	 width : 0, sortable : true, dataIndex: 'jytj'},
				{ text : 'jylx',	 width : 0, sortable : true, dataIndex: 'jylx'},
				{ text : 'hdsj',	 width : 0, sortable : true, dataIndex: 'hdsj'},
				{ text : 'fyys',	 width : 0, sortable : true, dataIndex: 'fyys'},
				{ text : 'zcys',	 width : 0, sortable : true, dataIndex: 'zcys'},
				{ text : 'jyqx',	 width : 0, sortable : true, dataIndex: 'jyqx'},
				{ text : 'czrid',	 width : 0, sortable : true, dataIndex: 'czrid'},
				{ text : 'lyxg',	 width : 0, sortable : true, dataIndex: 'lyxg'},
				{ text : 'zj',	 width : 0, sortable : true, dataIndex: 'zj'}
			],
			//width : 800,
			//height : 300,
			viewConfig: {
				stripeRows:true
			}
	});
	yun_jydjlc_grid.on("select",function(node){
			data = node.selected.items[0].data;		 // data.id, data.parent, data.text, data.leaf
			archive_id = data.id; 
			if (yun_jydj_jyzt==2 || yun_jydj_jyzt==4 ||  yun_jydj_jyzt==1){
				yun_jydjlist_store.proxy.url="/desktop/get_yun_jydjlist"
				yun_jydjlist_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyid:" + data.id + ",jyzt:" + yun_jydj_jyzt + "})");
				yun_jydjlist_store.load();                 				
			}else{
				if(yun_jydj_jyzt==3 ){
					yun_jydjlist_store.proxy.url="/desktop/get_yun_jydjlist"
					yun_jydjlist_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyid:" + data.id + ",jyzt:" + yun_jydj_jyzt + "})");
					yun_jydjlist_store.load();
				}
				
			}
	});
	Ext.regModel('yun_jydjlist_model', {
			fields: [
				{name: 'id',		type: 'integer'},
				{name: 'ip',	type: 'string'},
				{name: 'dh',	type: 'string'},
				{name: 'daszdw',	type: 'string'},
				{name: 'dwdm',	type: 'string'},
				{name: 'mlh',		type: 'string'},
				{name: 'ajh',		type: 'string'},
				{name: 'flh',		type: 'string'},
				{name: 'tm',		type: 'string'},
				{name: 'dalb',		type: 'string'},
				{name: 'hdsj',		type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'zrq',		type: 'date', dateFormat: 'Y-m-d H:i:s'},
				{name: 'daid',		type: 'string'}
			]
	});
	var yun_jydjlist_store = Ext.create('Ext.data.Store', {
			id:'yun_jydjlist_store',
			model : 'yun_jydjlist_model',
			proxy: {
				type: 'ajax',
				url : '/desktop/get_jydjlist',
				extraParams: {query:''},
				reader: {
					type: 'json',
					root: 'rows',
					totalProperty: 'results'
				}
			}
			//sortInfo:{field: 'level4', direction: "ASC"},
			//baseParams: {start:0, limit:25, query:""}
	});
	var yun_jydjlist_grid = new Ext.grid.GridPanel({
			id : 'yun_jydjlist_grid',
			store: yun_jydjlist_store,	
			title:'档案列表：',					
			columns: [				
				{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
				{ text : 'ip',	width : 0, sortable : true, dataIndex: 'ip'},
				{ text : 'dh',	width : 0, sortable : true, dataIndex: 'dh'},
				{ text : 'dalb',	width : 0, sortable : true, dataIndex: 'dalb'},
				{ text : '档案所在单位',  width : 100, sortable : true, dataIndex: 'dwdm'},				
				{ text : '目录号', width : 50, sortable : true, dataIndex: 'mlh'},				
				{ text : '分类号',	 width : 50, sortable : true, dataIndex: 'flh'},
				{ text : '案卷号',	 width : 50, sortable : true, dataIndex: 'ajh'},
				{ text : '案卷标题',  width : 175, sortable : true, dataIndex: 'tm'},				
				{ text : '还档时间',	 width : 75, sortable : true, dataIndex: 'hdsj', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
				{ text : '档案所在服务器',  width : 0, sortable : true, dataIndex: 'daszdw'},								
				],
				listeners:{
					itemdblclick:{
						fn:function(v,r,i,n,e,b){
							var tt=r.get("zrq");
							//showContactForm();
							switch (r.data.dalb) { 
			                  case "0": 
			                    DispAj_zh(r,'4',r.data.dh);
			                    break; 
			                  case "2": 
			                    DispAj_cw(r,'4',r.data.dh);
			                    break; 
			                  case "3": 
			                    DispAj_tddj(r,'4',r.data.dh);
			                    break; 
			                  case "24": 
			                    DispAj_wsda(r,'4',r.data.dh);
			                    break;				                 								　　
					          case "15": 
								DispAj_sx(r,'4',r.data.dh);						              
					            break;						          
					          case "5": 
								DispAj_tddj(r,'4',r.data.dh);	
					            break;
					          case "6":
								DispAj_tddj(r,'4',r.data.dh);	 						              
					            break;
					          case "7": 
								DispAj_tddj(r,'4',r.data.dh);							              
					              break;						            
					          case "25":
								DispAj_qtda_dzda(r,'4',r.data.dh);							              
					            break;
					          case "26":
								DispAj_qtda_jjda(r,'4',r.data.dh);
					            break;
					          case "27":
								DispAj_qtda_sbda(r,'4',r.data.dh);
					            break;        
					         　case "28":
								DispAj_qtda_swda(r,'4',r.data.dh);
					            break;
					         　case "29":
								DispAj_qtda_zlxx(r,'4',r.data.dh);
					            break;
					          case "30":
								DispAj_by_tszlhj(r,'4',r.data.dh);
					            break;
					          case "31":
								DispAj_by_tszlhj(r,'4',r.data.dh);
					            break;
					          case "32":
								DispAj_by_zzjgyg(r,'4',r.data.dh);
					            break;
					          case "33":
								DispAj_by_dsj(r,'4',r.data.dh);
					            break;
					          case "34":
								DispAj_by_qzsm(r,'4',r.data.dh);
					            break;
					          case "18":
								DispAj_tjml(r,'4',r.data.dh);
					            break;
					          default:
					            DispAj_zh(r,'4',r.data.dh);
					            break;
			                }
						}
					}
				},
				selType:'checkboxmodel',
				multiSelect:true,
			viewConfig: {
				stripeRows:true
			}
	});	


    if(!win){
      win = desktop.createWindow({
        id: 'yundangan',              
        title:'云档案',
		width:1000,
        height:600,
        x:0,
        y:0,
        iconCls: 'systemman',
        animCollapse:false,
		maximized:true,
        border: false,
        hideMode: 'offsets',
        layout: 'border',
        split:true,  
		dockedItems: [
			        {
	                    xtype: 'form',	
	                    height: 30,
	                    dock: 'top',
						items: [
	                        {xtype: 'radiogroup',
	                            name:'jyzt',
	                            fieldLabel: '请选择借阅状态',
	                            columns: 5,
								vertical: true,
	                            items: [
	                                { boxLabel: '别的单位向本单位提出的申请', name: 'jyzt', inputValue: '1' },
									{ boxLabel: '本单位向别的单位提出的申请', name: 'jyzt', inputValue: '2', checked: true},
									{ boxLabel: '本单位已同意的申请', name: 'jyzt', inputValue: '3'},
									{ boxLabel: '已结束的申请', name: 'jyzt', inputValue: '4'}
	                            ],
								listeners : {
									'change' : function(group, newValue, oldValue) {
										if (newValue.jyzt.length==1) {
										//alert(newValue.jyzt);
											var grid = Ext.getCmp('yun_jydjlc_grid');
											grid.store.proxy.url="/desktop/get_yun_jydjlc_jyzt";
											yun_jydj_jyzt=newValue.jyzt;										
											yun_jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + newValue.jyzt + "})");
											yun_jydjlc_store.load();
											yun_jydjlist_store.proxy.url="/desktop/get_null"
											yun_jydjlist_store.proxy.extraParams.query='';
											yun_jydjlist_store.load();
										}	
									}
								}
	                        }
	                    ]
	                },
					{
						xtype: 'toolbar',
			            anchor: '100%',
			            dock: 'bottom',
			            items: [
			                {
			                    xtype: 'button',
								iconCls:'clqq',
			                    text: '处理请求',
								handler: function() {
									new Ajax.Request("/desktop/get_sort", { 
										method: "POST",
										parameters: eval("({userid:" + currentUser.id + ",qxid:9})"),
										onComplete:	 function(request) {
											if (request.responseText=='success'){
												var grid = Ext.getCmp('yun_jydjlc_grid');
												var records = grid.getSelectionModel().getSelection();
												var record = records[0];
												if (yun_jydj_jyzt==1){
													yun_clqq(record);
												}else{
													alert('请选择处于借阅请求状态的数据进行处理。');
												}
											}else{
												alert('您无借阅审批的权限。' );
											}
										}
									});												
								}
			                },
			                {
			                    xtype: 'button',
								iconCls:'jyqq',
			                    text: '请求借阅',
								handler: function() {
									yun_jyqq_add_change='1';
									yun_jyqq('record');
								}
			                },		            
							{
			                    xtype: 'button',
								iconCls:'delete',
			                    text: '删除请求',
								handler: function() {												
									var grid = Ext.getCmp('yun_jydjlc_grid');
									var records = grid.getSelectionModel().getSelection();
									var record = records[0];
									if (yun_jydj_jyzt==2){
										var pars="id="+record.data.id;
										Ext.Msg.confirm("提示信息","是否要删除借阅人为：！"+record.data.jyr+"的借阅申请？",function callback(id){
											if(id=="yes"){
												new Ajax.Request("/desktop/yun_delete_jylc", { 
													method: "POST",
													parameters: eval("({userid:" + currentUser.id + ",id:"+ record.data.id + "})"),
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															alert("删除成功。")
									                        var grid = Ext.getCmp('yun_jydjlc_grid');
															grid.store.proxy.url="/desktop/get_yun_jydjlc_jyzt";
															yun_jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + yun_jydj_jyzt + "})");
															yun_jydjlc_store.load();
															yun_jydjlist_store.proxy.url="/desktop/get_null"
															yun_jydjlist_store.proxy.extraParams.query='';
															yun_jydjlist_store.load();                 
									                      }else{
									                        alert(request.responseText);
									                      };															
													}
												});
											}else{
												//alert('O,no');
											}
										});
									}else{
										alert('请选择本单位的处于借阅请求状态的数据进行删除处理。');
									}
								}													
			                },		                
			                {
			                    xtype: 'button',
								iconCls:'hd',
			                    text: '全部还档',
								handler: function() {
									var grid = Ext.getCmp('yun_jydjlc_grid');
									var records = grid.getSelectionModel().getSelection();
									var record = records[0];
									var pars="";
									if (yun_jydj_jyzt==2 || yun_jydj_jyzt==3){
										if (yun_jydj_jyzt==2){
											pars="({userid:" + currentUser.id + ",id:"+ record.data.id + ",jyzt:" + yun_jydj_jyzt + "})";
										}else{
											pars="({userid:" + currentUser.id + ",id:"+ record.data.id + ",jyzt:" + yun_jydj_jyzt + "})";
										}
										new Ajax.Request("/desktop/yun_qbhd_jylc", { 
											method: "POST",
											parameters: eval(pars),
											onComplete:	 function(request) {
												if (request.responseText=='success'){
													alert("还档成功。")
							                        var grid = Ext.getCmp('yun_jydjlc_grid');
													grid.store.proxy.url="/desktop/get_yun_jydjlc_jyzt";
													yun_jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + yun_jydj_jyzt + "})");
													yun_jydjlc_store.load();
													yun_jydjlist_store.proxy.url="/desktop/get_null"
													yun_jydjlist_store.proxy.extraParams.query='';
													yun_jydjlist_store.load();                 
							                      }else{
							                        alert(request.responseText);
							                      };
											}
										});
									}else
									{
										alert('请选择处于已同意借阅状态的数据进行还档处理。');
									}
								}
			                },
			                //{
			                //    xtype: 'button',
							//	iconCls:'tj',
			                //    text: '档案利用统计',
							//	handler: function() {
							//		jytj();
							//	}
			                //}
			            ]
			        }
		],	  
		  items:[
			{
				region: 'center',
				layout: 'fit',
				split:true,
				width:100,
				items: yun_jydjlc_grid
			},
			{
				region: 'east',
				layout: 'fit',
				split:true,
				width:550,
				items:yun_jydjlist_grid
			}
		  ]
      });
    }
	new Ajax.Request("/desktop/get_sort", { 
  		method: "POST",
      	parameters: eval("({userid:" + currentUser.id + ",qxid:23})"),
      	onComplete:	 function(request) {
      		if (request.responseText=='success'){
				
    			win.show();
      		}else{
      			alert('您无云档案查询的权限。');
				Ext.getCmp('yundangan').close();
      		}
      	}
  	});
	var grid = Ext.getCmp('yun_jydjlc_grid');
	grid.store.proxy.url="/desktop/get_yun_jydjlc_jyzt";
	yun_jydj_jyzt='2';										
	yun_jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:2})");
	yun_jydjlc_store.load();
    return win;
  }

});

