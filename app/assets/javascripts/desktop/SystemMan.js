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


Ext.define('MyDesktop.SystemMan', {
  extend: 'Ext.ux.desktop.Module',

  requires: [
    '*',
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.window.MessageBox'
  ],

  id:'systemman',

  init : function(){
    this.launcher = {
      text: '系统设置',
      iconCls:'systemman',
      handler : this.createWindow,
      scope: this
    }
  },
  createWindow : function(){
    var insert_qx="";
	var jr_modelid='';
	var jr_modelname='';
	var jr_tm_modelid='';
      var desktop = this.app.getDesktop();
      var win = desktop.getWindow('systemman');
    Ext.regModel('qz_model', {
      fields: [
        {name: 'id',    type: 'integer'},
        {name: 'dwdm',    type: 'string'}
      ]
    });
    var qz_store = Ext.create('Ext.data.Store', {
        id:'qz_store',
        model : 'qz_model',
        proxy: {
          type: 'ajax',
          url : '/desktop/get_qz_grid',
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }       
    });
    qz_store.load();  
    
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

    function get_mlqx_NodesChecked(node) {
      //获取用户目录权限树
      if (node.childNodes.size() == 0) return;
      node.eachChild(function(n){
        if (n.data.checked==true){
          if (insert_qx==""){
            insert_qx= n.data.id + ";" + n.data.text + ";0"
          }else{
            insert_qx=insert_qx+ "$" + n.data.id + ";" + n.data.text+ ";0"
          }
        };
          
        get_mlqx_NodesChecked(n);
      });
    };
    
    function get_cdqx_NodesChecked(node) {
      //获取用户菜单权限树
      if (node.childNodes.size() == 0) return;
      node.eachChild(function(n){
        if (n.data.checked==true){
          if (insert_qx==""){
            insert_qx= n.data.id + ";" + n.data.text + ";1"
          }else{
            insert_qx=insert_qx+ "$" + n.data.id + ";" + n.data.text + ";1"
          }
        };
        get_cdqx_NodesChecked(n);
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
    var user_disp = function(record,add_new){
      var win = Ext.getCmp('user_disp_win');
      
      if (win==null) {
        win = new Ext.Window({
          id : 'user_disp_win',
          title: '修改用户信息',
          //closeAction: 'hide',
          width: 370,
          height: 210,
          
          //minHeight: 200,
          layout: 'fit',
          modal: true,
          plain: true,
          //items:user_setup_grid,          
          items: [{
            width: 370,
            height: 210,
            xtype:'form',
            layout: 'absolute',
            id : 'user_disp_form',
            items: [
              {
                xtype: 'label',
                text: '用户名称:',
                x: 10,
                y: 10,
                width: 100
              },
              
              {
                xtype: 'label',
                text: '是否显示下级档案:',
                x: 10,
                y: 40,
                width: 100
              },
              {
                xtype: 'label',
                text: '所属全宗:',
                x: 10,
                y: 70,
                width: 100
              },
              {
                xtype: 'label',
                text: '密码:',
                x: 10,
                y: 100,
                id: 'user_ma',
                width: 100
              },
              {
                xtype: 'textfield',
                hidden : true,
                name : 'id' ,
                id:'user_id'                    
              },
              {
                xtype: 'textfield',
                x: 130,
                y: 10,
                width: 200,
                name: 'username',
                id:'user_username'
              },
              
              {
                xtype: 'combobox',
                x: 130,
                y: 40,
                width: 200,
                store: sf_store,
                emptyText:'请选择',
                mode: 'remote',
                minChars : 2,
                valueField:'text',
                displayField:'text',
                triggerAction:'all',
                name: 'sfxsxyisj',
                id:'user_sfxsxyisj'
              },
              {
                xtype: 'combobox',
                x: 130,
                y: 70,
                width: 200,
                store: qz_store,
                emptyText:'请选择',
                mode: 'remote',
                minChars : 2,
                valueField:'id',
                displayField:'dwdm',
                triggerAction:'all',
                listConfig: { loadMask: false },
                name: 'ssqz',
                id:'user_ssqz'
              },
              {
                xtype: 'textfield',
                x: 130,
                y: 100,
                width: 200,
                name: 'encrypted_password',
                id:'user_encrypted_password'
              }
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'option',
                id:'button_user_add',
                text:'修改',
                handler: function() {
                  var pars=this.up('panel').getForm().getValues();
                  if(pars['username']!=''){
                    
                      if(add_new==false){
                        new Ajax.Request("/desktop/update_user", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              alert("修改成功。");
                              Ext.getCmp('user_disp_win').close();
                              
                              Ext.getCmp('user_setup_grid').store.url='/desktop/get_user_grid';
							  Ext.getCmp('user_setup_grid').store.proxy.extraParams.username='all';
                              Ext.getCmp('user_setup_grid').store.load();
                            }else{
                              alert("修改失败，请重新修改。" + request.responseText);
                            }
                          
                          }
                        });
                      }else{
                        if(pars['encrypted_password']!='' && pars['encrypted_password'].length>5){
                          new Ajax.Request("/desktop/insert_user", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              if (request.responseText=='success'){
                                alert("新增成功。");
                                Ext.getCmp('user_disp_win').close();
                                Ext.getCmp('user_setup_grid').store.url='/desktop/get_user_grid';
								Ext.getCmp('user_setup_grid').store.proxy.extraParams.username='all';
                                Ext.getCmp('user_setup_grid').store.load();
                              }else{
                                alert("新增失败，请重新新增。" + request.responseText);
                              }
                            }
                          });
                        }else{
                          alert("密码不能为空或长度必须大于等于6位。");
                      }
                    
                    }
                  }else{
                    alert("用户名称不能为空。");
                  }
                }
              },
              {
                xtype: 'button',
                iconCls: 'exit',
                text:'退出',
                handler: function() {
                  //this.up('window').hide();
                  Ext.getCmp('user_disp_win').close();
                }
              }]
          }]
          
        });
      }
      if(add_new==false){
      //设置数据
        Ext.getCmp('user_disp_form').getForm().setValues(record.data);
        
        Ext.getCmp('user_ma').hidden=true;        
        Ext.getCmp('user_encrypted_password').hidden=true;        
        
      }else{
        Ext.getCmp('user_disp_win').title="新增用户信息";
        Ext.getCmp('button_user_add').text="新增";
        Ext.getCmp('button_user_add').iconCls="add";
      }

      win.show();
    };
    
    var js_disp = function(record,add_new){
      var win = Ext.getCmp('js_disp_win');

      if (win==null) {
        win = new Ext.Window({
          id : 'js_disp_win',
          title: '修改角色信息',
          //closeAction: 'hide',
          width: 370,
          height: 140,
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
            id : 'js_disp_form',
            items: [
              {
                xtype: 'label',
                text: '角色名称：',
                x: 10,
                y: 10,
                width: 100
              },
              {
                xtype: 'label',
                text: '角色等级：',
                x: 10,
                y: 40,
                width: 100
              },
              {
                xtype: 'textfield',
                hidden : true,
                name : 'id' ,
                id:'js_id'                    
              },
              
              {
                xtype: 'textfield',
                x: 130,
                y: 10,
                width: 200,
                name: 'jsmc',
                id:'js_jsmc'
              },
              {
                xtype: 'combobox',
                x: 130,
                y: 40,
                width: 200,
                store: qzdj_store,
                emptyText:'请选择',
                mode: 'remote',
                minChars : 2,
                valueField:'text',
                displayField:'text',
                triggerAction:'all',
                name: 'jsdj',
                id:'qz_jsdj'
              }
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'option',
                id:'button_user_add',
                text:'修改',
                handler: function() {
                  var pars=this.up('panel').getForm().getValues();
                  if(pars['jsmc']!=''){
                    
                      if(add_new==false){
                        new Ajax.Request("/desktop/update_js", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              
                              Ext.getCmp('js_disp_win').close();
                              
                              Ext.getCmp('js_setup_grid').store.url='/desktop/get_js_grid';
                              Ext.getCmp('js_setup_grid').store.load();
                            }else{
                              alert("修改失败，请重新修改。");
                            }
                          
                          }
                        });
                      }else{
                        new Ajax.Request("/desktop/insert_js", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              
                              Ext.getCmp('js_disp_win').close();
                              Ext.getCmp('js_setup_grid').store.url='/desktop/get_js_grid';
                              Ext.getCmp('js_setup_grid').store.load();
                            }else{
                              alert("新增失败，请重新新增。");
                            }
                          }
                        });
                      }
                    
                  }else{
                    alert("用户名称不能为空。");
                  }
                }
              },
              {
                xtype: 'button',
                iconCls: 'exit',
                text:'退出',
                handler: function() {
                  //this.up('window').hide();
                  Ext.getCmp('js_disp_win').close();
                }
              }]
          }]
          
        });
      }
      if(add_new==false){
      //设置数据
        Ext.getCmp('js_disp_form').getForm().setValues(record.data);
        
      }else{
        Ext.getCmp('js_disp_win').title="新增角色信息";
        Ext.getCmp('button_user_add').text="新增";
        Ext.getCmp('button_user_add').iconCls="add";
      }

      win.show();
    };
  
    var user_setup = function(){
      var win = Ext.getCmp('user_setup_win');

      Ext.regModel('user_setup_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'email',   type: 'string'},
          {name: 'username',    type: 'string'},
          {name: 'sfxsxyisj',   type: 'string'},
          {name: 'encrypted_password',    type: 'string'},
          {name: 'ssqz',    type: 'string'},
          {name: 'dwdm',    type: 'string'}
        ]
      });

      var user_setup_store = Ext.create('Ext.data.Store', {
        id:'user_setup_store',
        model : 'user_setup_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_user_grid',
          //extraParams: cx_tj,
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var user_setup_grid = new Ext.grid.GridPanel({
        id : 'user_setup_grid',
        store: user_setup_store,        
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '用户名', width : 100, sortable : true, dataIndex: 'username'},
          //{ text : 'Email', width : 150, sortable : true, dataIndex: 'email'},          
          { text : '所属全宗',  width : 150, sortable : true, dataIndex: 'dwdm'},
          { text : '是否显示下级档案',  width : 150, sortable : true, dataIndex: 'sfxsxyisj'}         
          //{ text : '密码',  width : 0, sortable : true, dataIndex: 'encrypted_password'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      user_setup_grid.on("select",function(node){
        data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf              
        new Ajax.Request("/desktop/get_user_js", { 
          method: "POST",
          parameters: "id="+data.id,
          onComplete:  function(request) {
            //alert(request.responseText);
            root=Ext.getCmp('user_js_tree_panel').store.getRootNode();      
            getNodes(root,false);           
            nodes=request.responseText.split("|");
            for (k=0; k <nodes.size(); k++) {
                
                
                Ext.getCmp('user_js_tree_panel').store.getNodeById(nodes[k]).data.checked=true;
                Ext.getCmp('user_js_tree_panel').store.getNodeById(nodes[k]).updateInfo({checked:true});
              
              }   
          }
        });
      });
      var js_tree_store = Ext.create('Ext.data.TreeStore', {
          autoLoad: true,
          proxy: {
              type: 'ajax',
              url: 'desktop/get_js_tree',
              extraParams: {style:"0"},
              actionMethods: 'POST'
          }
      }); 
      var js_tree_panel = Ext.create('Ext.tree.Panel', {
        id : 'user_js_tree_panel',
        store: js_tree_store,
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
      if (win==null) {
        win = new Ext.Window({
          id : 'user_setup_win',
          title: '用户设置',
          x : 300,
          y : 50,
          width: 720,
          height: 500,
          minHeight: 500,
          layout: 'border',
          //modal: true,
          plain: true,          
          items: [
            { title:'用户列表',
              region:'west',
              iconCls:'users',
              xtype:'panel',
              margins:'0 0 0 0',
              width: 400,
              collapsible:true,//可以被折叠              
              layout:'fit',
              split:true,
              items:user_setup_grid
            },
            { title:'角色树',
              region:'center',
              iconCls:'dept_tree',
              xtype:'panel',
              margins:'0 0 0 0',
              //width: 250,
              //collapsible:true,//可以被折叠            
              //id:'user-qx-tree',
              layout:'fit',
              split:true,
              items:js_tree_panel
            }
          ],
                  
          tbar:[{
            xtype: 'button',
            iconCls: 'add',
            text:'新增',
            handler: function() {
              //this.up('window').hide();
              
              user_disp("record",true);
            }
          },
          {
            xtype: 'button',
            iconCls: 'option',
            text:'修改',
            handler: function() {
              //this.up('window').hide();
              
              var grid = Ext.getCmp('user_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==1){
                var record = records[0];
                user_disp(record,false);
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
              var grid = Ext.getCmp('user_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==0){
                alert("请选择一个用户进行删除。");
                
              }else{
                var record = records[0];
                var pars="id="+record.data.id;
                Ext.Msg.confirm("提示信息","是否要删除用户名称为：！"+record.data.email+"的用户？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_user", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              Ext.getCmp('user_setup_grid').store.url='/desktop/get_user_grid';
							  Ext.getCmp('user_setup_grid').store.proxy.extraParams.username='all';
                              Ext.getCmp('user_setup_grid').store.load();
                            }else{
                              alert("删除失败，请重新删除。");
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
            iconCls: 'save',
            text:'保存用户角色',
            handler: function() {
              var grid = Ext.getCmp('user_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==1){
                root=Ext.getCmp('user_js_tree_panel').store.getRootNode();
                insert_qx="";
                get_mlqx_NodesChecked(root);
                
                var node=nodes[0];
                if (insert_qx==""){
                  alert("请您选择一些角色再保存。");
                }else{
                  insert_qx="({insert_qx:'" + insert_qx + "',userid:" + records[0].data.id + "})";
                  new Ajax.Request("/desktop/insert_user_js", { 
                    method: "POST",
                    parameters: eval(insert_qx),
                    onComplete:  function(request) {
                      if (request.responseText=='success'){
                        alert("权限角色成功。");                       
                      }else{
                        alert("角色保存失败，请重新保存。");
                      }
                    }
                  });                 
                }
              }else{
                alert("请您先选择一个用户。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'refresh',
            text:'重置用户密码',
            handler: function() {
              var grid = Ext.getCmp('user_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==1){
                
                  insert_qx="({userid:" + records[0].data.id + "})";
                  new Ajax.Request("/desktop/set_user_password", { 
                    method: "POST",
                    parameters: eval(insert_qx),
                    onComplete:  function(request) {
                      if (request.responseText=='success'){
                        alert("成功。");                       
                      }else{
                        alert("失败，请重新选择。");
                      }
                    }
                  });                 
                
              }else{
                alert("请您先选择一个用户。");
              }
            }
          },
			'<span style=" font-size:12px;font-weight:600;color:#3366FF;">用户名称查询</span>:&nbsp;&nbsp;',
            {
              xtype:'textfield',id:'query_username_text'
            },          
            {xtype:'button',text:'查询',tooltip:'用户名称',iconCls:'accordion',
                handler: function() {
					Ext.getCmp('user_setup_grid').store.proxy.url='/desktop/get_user_grid';
					Ext.getCmp('user_setup_grid').store.proxy.extraParams.username=Ext.getCmp('query_username_text').value;
                	Ext.getCmp('user_setup_grid').store.load();
                  	//store3.proxy.url="/desktop/get_document_where";
                  	//store3.proxy.extraParams.query=Ext.getCmp('query_jr_text').value;
                  	//store3.load();
                }
            },
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('user_setup_win').close();
            }
          }]
          
        });
      }
      

      win.show();
    };

    var js_setup = function(){
      var win = Ext.getCmp('js_setup_win');

      Ext.regModel('js_setup_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'jsmc',    type: 'string'},
          {name: 'jsdj',    type: 'string'}
        ]
      });

      var js_setup_store = Ext.create('Ext.data.Store', {
        id:'js_setup_store',
        model : 'js_setup_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_js_grid',
          //extraParams: cx_tj,
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var js_setup_grid = new Ext.grid.GridPanel({
        id : 'js_setup_grid',
        store: js_setup_store,        
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '角色名称',  width : 250, sortable : true, dataIndex: 'jsmc'},
          { text : '角色等级',  width : 250, sortable : true, dataIndex: 'jsdj'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      
      if (win==null) {
        win = new Ext.Window({
          id : 'js_setup_win',
          title: '角色设置',
          //closeAction: 'hide',
          width: 570,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:js_setup_grid,          
          tbar:[{
            xtype: 'button',
            iconCls: 'add',
            text:'新增',
            handler: function() {
              //this.up('window').hide();
              
              js_disp("record",true);
            }
          },
          {
            xtype: 'button',
            iconCls: 'option',
            text:'修改',
            handler: function() {
              //this.up('window').hide();
              
              var grid = Ext.getCmp('js_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==1){
                var record = records[0];
                js_disp(record,false);
              }else{
                alert("请选择一个角色进行修改。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'delete',
            text:'删除',
            handler: function() {
              var grid = Ext.getCmp('js_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==0){
                alert("请选择一个角色进行删除。");
                
              }else{
                var record = records[0];
                var pars="id="+record.data.id;
                Ext.Msg.confirm("提示信息","是否要删除角色名称为：！"+record.data.jsmc+"的角色？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_js", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              Ext.getCmp('js_setup_grid').store.url='/desktop/get_js_grid';
                              Ext.getCmp('js_setup_grid').store.load();
                            }else{
                              alert("删除失败，请重新删除。");
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
              Ext.getCmp('js_setup_win').close();
            }
          }]
          
        });
      }
      

      win.show();
    };
    
    var qz_disp = function(record,add_new){
      var win = Ext.getCmp('qz_disp_win');
      
      //qz_store.load();
      if (win==null) {
        win = new Ext.Window({
          id : 'qz_disp_win',
          title: '修改全宗信息',
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
            id : 'qz_disp_form',
            items: [
              {
                xtype: 'label',
                text: '全宗名称：',
                x: 10,
                y: 10,
                width: 100
              },
              {
                xtype: 'label',
                text: '全宗简称：',
                x: 10,
                y: 40,
                width: 100
              },
              {
                xtype: 'label',
                text: '全宗级别：',
                x: 10,
                y: 70,
                width: 100
              },
              {
                xtype: 'label',
                text: '所属全宗：',
                x: 10,
                y: 100,
                width: 100
              },
              {
                xtype: 'textfield',
                hidden : true,
                name : 'id' ,
                id:'qz_id'                    
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
              },
              {
                xtype: 'combobox',
                x: 130,
                y: 70,
                width: 200,
                store: qzdj_store,
                emptyText:'请选择',
                mode: 'remote',
                minChars : 2,
                valueField:'text',
                displayField:'text',
                triggerAction:'all',
                name: 'dj',
                id:'qz_dj'
              },
              {
                xtype: 'combobox',
                x: 130,
                y: 100,
                width: 200,
                store: qz_store,
                emptyText:'请选择',
                mode: 'remote',
                minChars : 2,
                valueField:'id',
                displayField:'dwdm',
                triggerAction:'all',
                name: 'ssss',
                id:'qz_owner_id'
              }
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'option',
                id:'button_qz_add',
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
                  Ext.getCmp('qz_disp_win').close();
                }
              }]
          }]
          
        });
      }
      if(add_new==false){
      //设置数据
        Ext.getCmp('qz_disp_form').getForm().setValues(record.data);
        
      }else{
        Ext.getCmp('qz_disp_win').title="新增单位信息";
        Ext.getCmp('button_qz_add').text="新增";
        Ext.getCmp('button_qz_add').iconCls="add";
      }

      win.show();
    };

    var qz_setup = function(){
      var win = Ext.getCmp('qz_setup_win');

      Ext.regModel('qz_setup_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'dwdm',    type: 'string'},
          {name: 'dwjc',    type: 'string'},
          {name: 'owner_id',    type: 'integer'},
          {name: 'dj',    type: 'string'},
          {name: 'ssss',    type: 'string'}
        ]
      });

      var qz_setup_store = Ext.create('Ext.data.Store', {
        id:'qz_setup_store',
        model : 'qz_setup_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_qz_grid',
          //extraParams: cx_tj,
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var qz_setup_grid = new Ext.grid.GridPanel({
        id : 'qz_setup_grid',
        store: qz_setup_store,        
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '全宗名称',  width : 150, sortable : true, dataIndex: 'dwdm'},
          { text : '全宗简称',  width : 70, sortable : true, dataIndex: 'dwjc'},
          { text : '全宗级别',  width : 70, sortable : true, dataIndex: 'dj'},
          { text : '所属全宗',  width : 150, sortable : true, dataIndex: 'ssss'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                
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
          id : 'qz_setup_win',
          title: '全宗设置',
          //closeAction: 'hide',
          width: 570,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:qz_setup_grid,          
          tbar:[{
            xtype: 'button',
            iconCls: 'add',
            text:'新增',
            handler: function() {
              //this.up('window').hide();
              
              qz_disp("record",true);
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


    var qz_lb_setup = function(){
      var win = Ext.getCmp('qz_lb_setup_win');

      Ext.regModel('qz_lb_setup_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'dwdm',    type: 'string'},
          {name: 'dwjc',    type: 'string'}
        ]
      });

      var qz_lb_setup_store = Ext.create('Ext.data.Store', {
        id:'qz_lb_setup_store',
        model : 'qz_lb_setup_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_qz_grid',
          //extraParams: cx_tj,
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var qz_lb_setup_grid = new Ext.grid.GridPanel({
        id : 'qz_lb_setup_grid',
        store: qz_lb_setup_store,       
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '全宗名称',  width : 250, sortable : true, dataIndex: 'dwdm'},
          { text : '全宗简称',  width : 70, sortable : true, dataIndex: 'dwjc'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                
                //DispAj(r,false);
              }
            }
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      qz_lb_setup_grid.on("select",function(node){
        data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf              
        new Ajax.Request("/desktop/get_qz_lb", { 
          method: "POST",
          parameters: "id="+data.id,
          onComplete:  function(request) {
            //alert(request.responseText);
            root=Ext.getCmp('lb_tree_panel').store.getRootNode();     
            getNodes(root,false);           
            nodes=request.responseText.split("|");
            for (k=0; k <nodes.size(); k++) {
                
                
                Ext.getCmp('lb_tree_panel').store.getNodeById(nodes[k]).data.checked=true;
                Ext.getCmp('lb_tree_panel').store.getNodeById(nodes[k]).updateInfo({checked:true});
              
              }   
          }
        });
      });
      var lb_tree_store = Ext.create('Ext.data.TreeStore', {
          autoLoad: true,
          proxy: {
              type: 'ajax',
              url: 'desktop/get_lb_tree',
              extraParams: {style:"0"},
              actionMethods: 'POST'
          }
      }); 
      var lb_tree_panel = Ext.create('Ext.tree.Panel', {
        id : 'lb_tree_panel',
        store: lb_tree_store,
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
      if (win==null) {
        win = new Ext.Window({
          id : 'qz_lb_setup_win',
          title: '全宗档案类别设置',
          //closeAction: 'hide',
          width: 670,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'border',
          //modal: true,
          plain: true,          
          items: [
            { title:'全宗列表',
              region:'west',
              iconCls:'users',
              xtype:'panel',
              margins:'0 0 0 0',
              width: 250,
              collapsible:true,//可以被折叠              
              layout:'fit',
              split:true,
              items:qz_lb_setup_grid
            },
            { title:'档案类别树',
              region:'center',
              iconCls:'dept_tree',
              xtype:'panel',
              margins:'0 0 0 0',
              //width: 250,
              //collapsible:true,//可以被折叠            
              //id:'user-qx-tree',
              layout:'fit',
              split:true,
              items:lb_tree_panel
            }
          ],        
          tbar:[{
            xtype: 'button',
            iconCls: 'save',
            text:'保存全宗档案类别',
            handler: function() {
              var grid = Ext.getCmp('qz_lb_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==1){
                var record = records[0];
                root=Ext.getCmp('lb_tree_panel').store.getRootNode();
                insert_qx="";
                get_mlqx_NodesChecked(root);
                
                
                if (insert_qx==""){
                  alert("请您选择一些档案类别再保存。");
                }else{
                  insert_qx="({insert_qx:'" + insert_qx + "',qzid:" + record.data.id + "})";
                  new Ajax.Request("/desktop/insert_qz_lb", { 
                    method: "POST",
                    parameters: eval(insert_qx),
                    onComplete:  function(request) {
                      if (request.responseText=='success'){
                        alert("全宗档案类别保存成功。");                       
                      }else{
                        alert("全宗档案类别保存失败，请重新保存。");
                      }
                    }
                  });
                }
              }else{
                alert("请选择一个全宗进行全宗档案类别的保存。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('qz_lb_setup_win').close();
            }
          }]
          
        });
      }
      

      win.show();
    };
    var qz_lb_ml_setup = function(){
      var win = Ext.getCmp('qz_lb_ml_setup_win');

      Ext.regModel('qz_lb_setup_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'dwdm',    type: 'string'},
          {name: 'dwjc',    type: 'string'}
        ]
      });

      var qz_lb_setup_store = Ext.create('Ext.data.Store', {
        id:'qz_lb_setup_store',
        model : 'qz_lb_setup_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_qz_grid',
          //extraParams: cx_tj,
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var qz_lb_setup_grid = new Ext.grid.GridPanel({
        id : 'qz_lb_setup_grid',
        store: qz_lb_setup_store,       
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '全宗名称',  width : 250, sortable : true, dataIndex: 'dwdm'},
          { text : '全宗简称',  width : 70, sortable : true, dataIndex: 'dwjc'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                
                //DispAj(r,false);
              }
            }
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      qz_lb_setup_grid.on("select",function(node){
        data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf  
        Ext.getCmp('lb_tree_panel').store.proxy.extraParams.id=data.id;
        Ext.getCmp('lb_tree_panel').store.load();
                    
        
      });
      var lb_tree_store = Ext.create('Ext.data.TreeStore', {
          //autoLoad: true,
          proxy: {
              type: 'ajax',
              url: 'desktop/get_qz_lb_tree',
              extraParams: {id:"0"},
              actionMethods: 'POST'
          }
      }); 
      var lb_tree_panel = Ext.create('Ext.tree.Panel', {
        id : 'lb_tree_panel',
        store: lb_tree_store,
        rootVisible:false,
        useArrows: true,
        //singleExpand: true,
        width: 200,
        listeners:{
          checkchange:function(node,checked,option){  
                                  
            if (checked){             
              root=Ext.getCmp('lb_tree_panel').store.getRootNode();     
              getNodes(root,false);
              node.data.checked=true;
              node.updateInfo({checked:true});            
                Ext.getCmp('lb_tree_panel1').store.proxy.extraParams.id=node.data.id;
              Ext.getCmp('lb_tree_panel1').store.load();
              }           
          }
        }     
      });
      
      var lb_tree_store1  = Ext.create('Ext.data.TreeStore', {
          //autoLoad: true,
          proxy: {
              type: 'ajax',
              url: 'desktop/get_qz_lb_ml_tree',
              extraParams: {id:"0"},
              actionMethods: 'POST'
          }
      }); 
      var lb_tree_panel1 = Ext.create('Ext.tree.Panel', {
        id : 'lb_tree_panel1',
        store: lb_tree_store1,
        rootVisible:false,
        useArrows: true,
        //singleExpand: true,
        width: 200,
        listeners:{
          checkchange:function(node,checked,option){          
            if (checked){             
              root=Ext.getCmp('lb_tree_panel1').store.getRootNode();      
              getNodes(root,false);
              node.data.checked=true;
              node.updateInfo({checked:true});            
              }         
          }
        }     
      });
      if (win==null) {
        win = new Ext.Window({
          id : 'qz_lb_ml_setup_win',
          title: '全宗档案类别设置',
          //closeAction: 'hide',
          width:670,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'border',
          //modal: true,
          plain: true,          
          items: [
            { title:'全宗列表',
              region:'west',
              iconCls:'users',
              xtype:'panel',
              margins:'0 0 0 0',
              width: 250,
              collapsible:true,//可以被折叠              
              layout:'fit',
              split:true,
              items:qz_lb_setup_grid
            },
            { title:'档案类别树',
              region:'center',
              iconCls:'dept_tree',
              xtype:'panel',
              margins:'0 0 0 0',
              //width: 250,
              //collapsible:true,//可以被折叠            
              //id:'user-qx-tree',
              layout:'fit',
              split:true,
              items:lb_tree_panel
            },
            { title:'目录树',
              region:'east',
              iconCls:'dept_tree',
              xtype:'panel',
              margins:'0 0 0 0',
              width: 200,
              //collapsible:true,//可以被折叠            
              //id:'user-qx-tree',
              layout:'fit',
              split:true,
              items:lb_tree_panel1
            }
          ],        
          tbar:[{
            xtype: 'button',
            iconCls: 'add',
            text:'新增全宗档案类别',
            handler: function() {
              var tree = Ext.getCmp('lb_tree_panel');
              var nodes=tree.getChecked();
              if (nodes.length==1){
                //alert(nodes[0].data.id);
                qz_lb_ml_disp("1",nodes[0].data.id);
              }else{
                alert("请您先选择一个档案类别。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'delete',
            text:'删除全宗档案类别目录',
            handler: function() {
              var tree = Ext.getCmp('lb_tree_panel1');
              var nodes=tree.getChecked();
              if (nodes.length==1){
                //alert(nodes[0].data.id);
                
                var pars="id="+nodes[0].data.id;
                Ext.Msg.confirm("提示信息","是否要删除目录号为："+nodes[0].data.text+"的目录？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_qz_lb_ml", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              //Ext.getCmp('lb_tree_panel1').store.proxy.extraParams.id=qz_lb_id;
                              Ext.getCmp('lb_tree_panel1').store.load();
                            }else{
                              alert("删除失败。");
                            }
                          }
                        });
                      }else{
                        //alert('O,no');
                      }

                  });
              }else{
                alert("请您先选择一个档案类别目录。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('qz_lb_ml_setup_win').close();
            }
          },"->",
          {
            xtype: 'button',
            iconCls: 'save',
            text:'初使化全宗档案类别目录',
            handler: function() {
              Ext.Msg.confirm("提示信息","是否要初使化全宗档案类别目录？初使化后所有用户的权限要重新设置。",function callback(id){
                    if(id=="yes"){
                      new Ajax.Request("/desktop/ini_qz_lb_ml", { 
                        method: "POST",
                        //parameters: pars,
                        onComplete:  function(request) {
                          if (request.responseText=='success'){
                            //Ext.getCmp('lb_tree_panel1').store.proxy.extraParams.id=qz_lb_id;
                            //Ext.getCmp('lb_tree_panel1').store.load();
                            alert("初使化完成。");
                          }else{
                            alert("初使化失败。");
                          }
                        }
                      });
                    }else{
                      //alert('O,no');
                    }

                });
            } 
          }
          ]
          
        });
      }
      

      win.show();
    };
    
    var qz_lb_ml_disp = function(record,qz_lb_id){
      var win = Ext.getCmp('qz_lb_ml_disp_win');

      if (win==null) {
        win = new Ext.Window({
          id : 'qz_lb_ml_disp_win',
          title: '新增全宗档案类别目录',
          //closeAction: 'hide',
          width: 370,
          height: 140,
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
            id : 'qz_lb_ml_disp_form',
            items: [
              {
                xtype: 'label',
                text: '目录号说明：',
                x: 10,
                y: 10,
                width: 100
              },
              {
                xtype: 'label',
                text: '目录号',
                x: 10,
                y: 40,
                width: 100
              },
              {
                xtype: 'textfield',
                hidden : true,
                name : 'd_dw_lbid' ,
                id:'qz_lb_id'                   
              },
              
              {
                xtype: 'textfield',
                x: 130,
                y: 10,
                width: 200,
                name: 'mlhjc',
                id:'qz_lb_ml_mlhjc'
              },
              {
                xtype: 'textfield',
                x: 130,
                y: 40,
                width: 200,
                name: 'mlh',
                id:'qz_lb_ml_mlh'
              }
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'add',
                id:'button_user_add',
                text:'保存',
                handler: function() {
                  var pars=this.up('panel').getForm().getValues();
                  if(pars['mlhjc']!=''){
                    if(pars['mlh']!=''){
                      
                        new Ajax.Request("/desktop/insert_qz_lb_ml", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                              Ext.getCmp('qz_lb_ml_disp_win').close();
                              Ext.getCmp('lb_tree_panel1').store.proxy.extraParams.id=qz_lb_id;
                              Ext.getCmp('lb_tree_panel1').store.load();
                            }else{
                              alert("保存失败。");
                            }
                          }
                        });
                      
                    }else{
                      alert("目录号不能为空。");
                    }
                  }else{
                    alert("目录号说明不能为空。");
                  }
                }
              },
              {
                xtype: 'button',
                iconCls: 'exit',
                text:'退出',
                handler: function() {
                  //this.up('window').hide();
                  Ext.getCmp('qz_lb_ml_disp_win').close();
                }
              }]
          }]
          
        });
      }
      
      Ext.getCmp('qz_lb_id').setValue(qz_lb_id);
      win.show();
    };
    
    var js_qx_setup = function(record,add_new){
      var win = Ext.getCmp('js_qx_setup_win');
      var user_ml_qx_tree_store = Ext.create('Ext.data.TreeStore', {
          autoLoad: true,
          proxy: {
              type: 'ajax',
              url: 'desktop/get_lb_qx_tree',
              extraParams: {style:"0"},
              actionMethods: 'POST'
          }
      }); 
      var user_ml_qx_tree_panel = Ext.create('Ext.tree.Panel', {
        id : 'user_ml_qx_tree_panel',
        store: user_ml_qx_tree_store,
        rootVisible:false,
        useArrows: true,
        //singleExpand: true,
        width: 480,
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
      var user_cd_qx_tree_store = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: 'desktop/get_cd_qx_tree',
            extraParams: {style:"0"},
            actionMethods: 'POST'
        }
      });
      var user_cd_qx_tree_panel = Ext.create('Ext.tree.Panel', {
        id : 'user_cd_qx_tree_panel',
        store: user_cd_qx_tree_store,
        rootVisible:false,
        useArrows: true,
      });
      var user_tree_store = Ext.create('Ext.data.TreeStore', {
          autoLoad: true,
          proxy: {
              type: 'ajax',
              url: 'desktop/get_js_tree',
              extraParams: {style:"0"},
              actionMethods: 'POST'
          }
      });

      var user_tree_panel = Ext.create('Ext.tree.Panel', {
        id : 'user_tree_panel',
        store: user_tree_store,
        rootVisible:false,
        useArrows: true,
        //singleExpand: true,
        width: 200,
        listeners:{
          checkchange:function(node,checked,option){
            if (checked){
              js=node.data.id.split("-");
              if (js.size()==1){
                root=Ext.getCmp('user_tree_panel').store.getRootNode();     
                getNodes(root,false);
                node.data.checked=true;
                node.updateInfo({checked:true});
                new Ajax.Request("/desktop/get_user_qx", { 
                  method: "POST",
                  parameters: "userid="+node.data.id,
                  onComplete:  function(request) {
                    //alert(request.responseText);
                    root=Ext.getCmp('user_ml_qx_tree_panel').store.getRootNode();     
                    getNodes(root,false);
                    root=Ext.getCmp('user_cd_qx_tree_panel').store.getRootNode();
                    getNodes(root,false);
                    nodes=request.responseText.split("|");
                    for (k=0; k <nodes.size(); k++) {
                        qx=nodes[k].split(";");
                        if(qx[1]==4){
                          Ext.getCmp('user_cd_qx_tree_panel').store.getNodeById(qx[0]).data.checked=true;
                          Ext.getCmp('user_cd_qx_tree_panel').store.getNodeById(qx[0]).updateInfo({checked:true});
                        }else{
                          Ext.getCmp('user_ml_qx_tree_panel').store.getNodeById(qx[0]).data.checked=true;
                          Ext.getCmp('user_ml_qx_tree_panel').store.getNodeById(qx[0]).updateInfo({checked:true});

                        }
                      }
                  }
                
                });
              }
            }
          }
        }
        //height: 300,
      });
      
      if (win==null) {
        win = new Ext.Window({
          id : 'js_qx_setup_win',
          title: '角色权限设置',
          width:800,
          x : 300,
          y : 50,
          height:500,
          iconCls: 'archiveman',
          animCollapse:false,
          border: false,
          hideMode: 'offsets',
          //modal: true,
          layout: 'border',
          split:true,
          tbar:[
            {xtype:'button',text:'保存角色权限',tooltip:'保存角色权限',id:'qx_save',iconCls:'save',
              handler: function() {
                //Ext.getCmp('user_ml_qx_tree_panel').store.getNodeById("1_1_1")              
                var tree = Ext.getCmp('user_tree_panel');
                var nodes=tree.getChecked();
                if (nodes.length==1){
                  root=Ext.getCmp('user_ml_qx_tree_panel').store.getRootNode();
                  insert_qx="";
                  get_mlqx_NodesChecked(root);
                  root=Ext.getCmp('user_cd_qx_tree_panel').store.getRootNode();
                  get_cdqx_NodesChecked(root);
                  var node=nodes[0];
                  if (insert_qx==""){
                    alert("请您选择一些权限再保存。");
                  }else{
                    insert_qx="({insert_qx:'" + insert_qx + "',userid:" + node.data.id + "})";
                    new Ajax.Request("/desktop/insert_user_qx", { 
                      method: "POST",
                      parameters: eval(insert_qx),
                      onComplete:  function(request) {
                        if (request.responseText=='success'){
                          alert("权限保存成功。");                       
                        }else{
                          alert("权限保存失败，请重新保存。");
                        }
                      }
                    });                 
                  }
                }else{
                  alert("请您先选择一个用户。");
                }
              }
            }
          ],      
          items: [
            { title:'角色树',
              region:'west',
              iconCls:'users',
              xtype:'panel',
              margins:'0 0 0 0',
              width: 250,
              collapsible:true,//可以被折叠
              id:'user-tree',
              layout:'fit',
              split:true,
              items:user_tree_panel
            },
            { title:'用户目录权限树',
              region:'center',
              iconCls:'dept_tree',
              xtype:'panel',
              margins:'0 0 0 0',
              //width: 250,
              //collapsible:true,//可以被折叠            
              id:'user-qx-tree',
              layout:'fit',
              split:true,
              items:user_ml_qx_tree_panel
            },{           
              //collapsed:true,
              collapsible: true,          
              //collapseMode:'mini',
              title:'用户系统权限树',
              iconCls:'icon-grid',
              region:'east',
              xtype:'panel',
              id:'user-sys-tree',
              margins:'0 0 0 0',
              layout: 'fit',
              split:true,
              width: 250,   
              items:user_cd_qx_tree_panel
            }
          ]
        });
      }     
      win.show();
    };

    var jr_model_setup = function(){
      var win = Ext.getCmp('jr_model_setup_win');

      Ext.regModel('jr_model_setup_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'name',    type: 'string'},
          {name: 'sbsm',    type: 'string'},
          {name: 'lymc',    type: 'string'},
          {name: 'ssly',    type: 'integer'},
          {name: 'lcmc',    type: 'string'},
          {name: 'sslc',    type: 'integer'},
          {name: 'fjmc',    type: 'string'},
          {name: 'modelid',    type: 'integer'},
          {name: 'kzl',   type: 'string'},
          {name: 'gzl',   type: 'string'},
          {name: 'sbh',   type: 'string'},
          {name: 'kgzt',    type: 'string'},
          {name: 'sblx',    type: 'string'}

        ]
      });

      var jr_model_setup_store = Ext.create('Ext.data.Store', {
        id:'jr_model_setup_store',
        model : 'jr_model_setup_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_jr_modellist_grid',
          extraParams: {query:""},
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var jr_model_setup_grid = new Ext.grid.GridPanel({
        id : 'jr_model_setup_grid',
        store: jr_model_setup_store,       
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
			{ text : 'modelid',  width : 0, sortable : true, dataIndex: 'modelid'},
          { text : '名称',  width : 400, sortable : true, dataIndex: 'name'}          
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");

                //DispAj(r,false);
              }
            }
          },

        viewConfig: {
          stripeRows:true
        }
      });

      var jr_model_tree_store = Ext.create('Ext.data.TreeStore', {
          autoLoad: true,
          proxy: {
              type: 'ajax',
              url: 'desktop/get_jr_model_tree',
              extraParams: {style:"0"},
              actionMethods: 'POST'
          }
      }); 
      var jr_model_tree_panel = Ext.create('Ext.tree.Panel', {
        id : 'jr_model_tree_panel',
        store: jr_model_tree_store,
        rootVisible:false,
        useArrows: true,
		listeners:{
	        checkchange:function(node,checked,option){
	          if(checked){
	            root=Ext.getCmp('jr_model_tree_panel').store.getRootNode();     
	            getNodes(root,false);
	            node.data.checked=true;
	            node.updateInfo({checked:true});
				jr_modelid='';
				jr_tm_modelid='';
				if (node.data.leaf==true){
					jr_modelid=node.data.id;
					
					jr_modelname=node.data.text;
					if (node.data.parentId=='题名-0'){
						jr_tm_modelid=node.data.id;
					};
					Ext.getCmp('jr_model_setup_grid').store.proxy.extraParams.query=  node.data.id;

			        Ext.getCmp('jr_model_setup_grid').store.url='/desktop/get_jr_modellist_grid';

		        	Ext.getCmp('jr_model_setup_grid').store.load();
				};
				
			  }
			}
		},
        //singleExpand: true,
        width: 200

      });
      jr_model_tree_panel.on("select",function(node){ 
        data = node.selected.items[0].data;  // data.id, data.parent, data.text, data.leaf
		if (data.leaf==true){
			if (data.checked==true){
				jr_modelid=data.id;
				jr_tm_modelid='';
				jr_modelname=data.text;
				if (data.parentId=='题名-0'){
					jr_modelid=data.id;
				}
        		Ext.getCmp('jr_model_setup_grid').store.proxy.extraParams.query=  data.id;
	        
		        Ext.getCmp('jr_model_setup_grid').store.url='/desktop/get_jr_modellist_grid';

	        	Ext.getCmp('jr_model_setup_grid').store.load();
			}
		}
      });
      loopable=false;
      i =0;
      
      function loopCheck(sf,lp) {
        if (lp) {
          loopable=true;
          //move to new position
          alert(i);
          if (i>5){
            loopable=false;
          };
          //Set Delay
          i = i +1;
          sf = 0;
          td = 5*1000 ; //60s 
          var f = function() { loopCheck(sf,loopable); };
          var t = setTimeout(f,td);
        }
      };
      
      if (win==null) {
        win = new Ext.Window({
          id : 'jr_model_setup_win',
          title: '卷内输档模板设置',
          x : 300,
          y : 50,
          width: 670,
          height: 500,
          minHeight: 500,
          layout: 'border',
          //modal: true,
          plain: true,          
          items: [
            { title:'模板名称树',
              region:'west',
              iconCls:'users',
              xtype:'panel',
              margins:'0 0 0 0',
              width: 200,
              collapsible:true,//可以被折叠              
              layout:'fit',
              split:true,
              items:jr_model_tree_panel

            },
            { title:'题名模板列表',
              region:'center',
              iconCls:'dept_tree',
              xtype:'panel',
              margins:'0 0 0 0',
              layout:'fit',
              split:true,
              items:jr_model_setup_grid
            }
          ],

          tbar:[{
            xtype: 'button',
            iconCls: 'add',
            text:'新增模板名称',
            handler: function() {
				jr_model_disp("record","",true);
              }
          },
          {
            xtype: 'button',
            iconCls: 'option',
            text:'修改模板名称',
            handler: function() {              
              if (jr_modelid!=''){
              	jr_model_disp(jr_modelid,jr_modelname,false);        
              }else{
                alert("请选择一个模板名称进行修改。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'delete',
            text:'删除模板名称',
            handler: function() {
              
              	if (jr_modelid!=''){
	              	var pars={id:jr_modelid};
	                  new Ajax.Request("/desktop/delete_jr_model", { 
	                    method: "POST",
	                    parameters: pars,
	                    onComplete:  function(request) {
	                      text=request.responseText.split(':');
	                      if (text[0]=='success'){
	                        alert("删除成功。");    
	                        jr_modelid='';
							jr_tm_modelid='';
	                        Ext.getCmp('jr_model_tree_panel').store.url='/desktop/get_jr_model_tree';
							Ext.getCmp('jr_model_tree_panel').store.clearOnLoad = false;
							Ext.getCmp('jr_model_tree_panel').store.getRootNode().removeAll() ;
                            Ext.getCmp('jr_model_tree_panel').store.load();
	                      }else{
	                        if (text[0]=='false'){
	                          alert(text[1]);
	                        }else{
	                          alert("删除失败。");
	                        }
	                      }
	                    }   
					});
	              }else{
	                alert("请选择一个模板名称进行删除。");
	              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'add',
            text:'新增题名模板列表',
            handler: function() {
              //this.up('window').hide();
              
			if (jr_tm_modelid!=''){
              	jr_model_list_disp(jr_tm_modelid,jr_modelname,true);        
              }else{
                alert("请先选择一个题名的模板名称，再进行新增。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'option',
            text:'修改题名模板列表',
            handler: function() {
              //this.up('window').hide();
              var grid = Ext.getCmp('jr_model_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==1){                
                jr_model_list_disp(records[0],jr_modelname,false);
              }else{
                alert("请选择一个题名的卷内模板列表进行修改。");
              }
            }
          },
          {
            xtype: 'button',
            iconCls: 'delete',
            text:'删除题名模板列表',
            handler: function() {
              //this.up('window').hide();
              var grid = Ext.getCmp('jr_model_setup_grid');
              var records = grid.getSelectionModel().getSelection();
              if (records.length==1){
                var record = records[0];
                
                  var pars={id:record.data.id};
                  new Ajax.Request("/desktop/delete_jr_modellist", { 
                    method: "POST",
                    parameters: pars,
                    onComplete:  function(request) {
                      text=request.responseText.split(':');
                      if (text[0]=='success'){
                        alert("删除成功。");                                             
                        Ext.getCmp('jr_model_setup_grid').store.url='/desktop/get_jr_modellist_grid';
                        Ext.getCmp('jr_model_setup_grid').store.load();
                      }else{
                        if (text[0]=='false'){
                          alert(text[1]);
                        }else{
                          alert("删除失败。");
                        }
                      }

                    }
                  })
                

              }else{
                alert("请选择一个卷内模板列表名称进行删除。");
              }

            }
          },
          
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('jr_model_setup_win').close();
            }
          }]

        });
      }


      win.show();
    };

    var jr_model_disp = function(id,name,add_new){
      var win = Ext.getCmp('jr_model_disp_win');

      if (win==null) {
        win = new Ext.Window({
          id : 'jr_model_disp_win',
          title: '修改卷内模板名称',
          //closeAction: 'hide',
          width: 370,
          height: 140,
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
            id : 'jr_model_disp_form',
            items: [
              {
                xtype: 'label',
                text: '卷内模板名称：',
                x: 10,
                y: 10,
                width: 100
              },
              {
                xtype: 'label',
                text: '卷内模板类别：',
                x: 10,
                y: 40,
				id:'jr_lx_label',
                width: 100
              },
              {
                xtype: 'textfield',
                hidden : true,
                name : 'id' ,
                id:'jr_id'                    
              },
              
              {
                xtype: 'textfield',
                x: 130,
                y: 10,
                width: 200,
                name: 'name',
                id:'jr_name'
              },
              {
                xtype: 'combobox',
                x: 130,
                y: 40,
                width: 200,
                store: jr_model_store,
                emptyText:'请选择',
                mode: 'remote',
                minChars : 2,
                valueField:'text',
                displayField:'text',
                triggerAction:'all',
                name: 'lx',
                id:'jr_lx'
              }
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'option',
                id:'button_user_add',
                text:'修改',
                handler: function() {
                  var pars=this.up('panel').getForm().getValues();
                  if(pars['name']!=''){
                    
                      if(add_new==false){
                        new Ajax.Request("/desktop/update_jr_model", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            text=request.responseText.split(':');
		                    if (text[0]=='success'){
                              
                              	Ext.getCmp('jr_model_disp_win').close();
	                            Ext.getCmp('jr_model_tree_panel').store.url='/desktop/get_jr_model_tree';
								Ext.getCmp('jr_model_tree_panel').store.clearOnLoad = false;
								Ext.getCmp('jr_model_tree_panel').store.getRootNode().removeAll() ;
	                            Ext.getCmp('jr_model_tree_panel').store.load();
                            }else{
                              	if (text[0]=='false'){
		                          alert(text[1]);
		                        }else{
		                          alert("修改失败。");
		                        }
                            }
                          	
                          }
                        });
                      }else{
						if(pars['lx']!=undefined){
                        	new Ajax.Request("/desktop/insert_jr_model", { 
	                          method: "POST",
	                          parameters: pars,
	                          onComplete:  function(request) {
	                            text=request.responseText.split(':');
			                    if (text[0]=='success'){
                              
	                              Ext.getCmp('jr_model_disp_win').close();
	                              Ext.getCmp('jr_model_tree_panel').store.url='/desktop/get_jr_model_tree';
								Ext.getCmp('jr_model_tree_panel').store.clearOnLoad = false;
								Ext.getCmp('jr_model_tree_panel').store.getRootNode().removeAll() ;
	                              Ext.getCmp('jr_model_tree_panel').store.load();
	                            }else{
	                              	if (text[0]=='false'){
			                          alert(text[1]);
			                        }else{
			                          alert("新增失败。");
			                        }
	                            }
	                          }
	                        });
						}else{
							alert("卷内模板类别不能为空。");
						}
                      }
                    
                  }else{
                    alert("卷内模板名称不能为空。");
                  }
                }
              },
              {
                xtype: 'button',
                iconCls: 'exit',
                text:'退出',
                handler: function() {
                  //this.up('window').hide();
                  Ext.getCmp('jr_model_disp_win').close();
                }
              }]
          }]
          
        });
      }
      if(add_new==false){
      //设置数据
        //Ext.getCmp('jr_model_disp_form').getForm().setValues(record.data);
        Ext.getCmp('jr_name').setValue(name);
		Ext.getCmp('jr_id').setValue(id);
		Ext.getCmp('jr_lx').hidden=true;
		Ext.getCmp('jr_lx_label').hidden=true;
      }else{
        Ext.getCmp('jr_model_disp_win').title="新增信息";
        Ext.getCmp('button_user_add').text="新增";
        Ext.getCmp('button_user_add').iconCls="add";
      }

      win.show();
    };

    var jr_model_list_disp = function(id,name,add_new){
      var win = Ext.getCmp('jr_model_list_disp_win');

      if (win==null) {
        win = new Ext.Window({
          id : 'jr_model_list_disp_win',
          title: '修改卷内模板列表',
          //closeAction: 'hide',
          width: 370,
          height: 140,
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
            id : 'jr_model_list_disp_form',
            items: [
              {
                xtype: 'label',
                text: '卷内模板列表名称：',
                x: 10,
                y: 10,
                width: 100
              },
              
              {
                xtype: 'textfield',
                hidden : true,
                name : 'id' ,
                id:'jr_id'                    
              },
              {
                xtype: 'textfield',
                hidden : true,
                name : 'modelid' ,
                id:'jr_modelid'                    
              },
              {
                xtype: 'textfield',
                x: 130,
                y: 10,
                width: 200,
                name: 'name',
                id:'jr_name'
              }
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'option',
                id:'button_user_add',
                text:'修改',
                handler: function() {
                  var pars=this.up('panel').getForm().getValues();
                  if(pars['name']!=''){
                    
                      if(add_new==false){
                        new Ajax.Request("/desktop/update_jr_model_list", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            text=request.responseText.split(':');
		                    if (text[0]=='success'){
                              	alert("修改成功。");
                              	Ext.getCmp('jr_model_list_disp_win').close();
	                            Ext.getCmp('jr_model_setup_grid').store.url='/desktop/get_jr_modellist_grid';
	                            Ext.getCmp('jr_model_setup_grid').store.load();
                            }else{
                              	if (text[0]=='false'){
		                          alert(text[1]);
		                        }else{
		                          alert("修改失败。");
		                        }
                            }
                          	
                          }
                        });
                      }else{
						
                        	new Ajax.Request("/desktop/insert_jr_model_list", { 
	                          method: "POST",
	                          parameters: pars,
	                          onComplete:  function(request) {
	                            text=request.responseText.split(':');
			                    if (text[0]=='success'){
                              		alert("新增成功。");
	                              Ext.getCmp('jr_model_list_disp_win').close();
	                              Ext.getCmp('jr_model_setup_grid').store.url='/desktop/get_jr_modellist_grid';
	                              Ext.getCmp('jr_model_setup_grid').store.load();
	                            }else{
	                              	if (text[0]=='false'){
			                          alert(text[1]);
			                        }else{
			                          alert("新增失败。");
			                        }
	                            }
	                          }
	                        });
						
                      }
                    
                  }else{
                    alert("卷内模板名称不能为空。");
                  }
                }
              },
              {
                xtype: 'button',
                iconCls: 'exit',
                text:'退出',
                handler: function() {
                  //this.up('window').hide();
                  Ext.getCmp('jr_model_list_disp_win').close();
                }
              }]
          }]
          
        });
      }
      if(add_new==false){
      //设置数据
        Ext.getCmp('jr_model_list_disp_form').getForm().setValues(id.data);        		
      }else{
		Ext.getCmp('jr_modelid').setValue(id);
        Ext.getCmp('jr_model_list_disp_win').title="新增卷内模板列表";
        Ext.getCmp('button_user_add').text="新增";
        Ext.getCmp('button_user_add').iconCls="add";
      }
      win.show();
    };

    var qcj_setup = function(){
	//缺重卷检验
      var win = Ext.getCmp('qcj_setup_win');

      Ext.regModel('qcj_setup_model', {
        fields: [
          {name: 'xh',    type: 'integer'},
          {name: 'mlh',    type: 'string'},
          {name: 'ajh',    type: 'string'},
          {name: 'sm',    type: 'string'}
        ]
      });

      var qcj_setup_store = Ext.create('Ext.data.Store', {
        id:'qcj_setup_store',
        model : 'qcj_setup_model',
        proxy: {
          type: 'ajax',
          url : '/desktop/get_qcj_grid',
          //extraParams: cx_tj,
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var qcj_setup_grid = new Ext.grid.GridPanel({
        id : 'qcj_setup_grid',
        store: qcj_setup_store,        
        columns: [
          { text : '序号',  width : 50, sortable : true, dataIndex: 'xh'},
          { text : '目录号',  width : 100, sortable : true, dataIndex: 'mlh'},
          { text : '案卷号',  width : 100, sortable : true, dataIndex: 'ajh'},
          { text : '说明',  width : 100, sortable : true, dataIndex: 'sm'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      
      if (win==null) {
        win = new Ext.Window({
          id : 'qcj_setup_win',
          title: '档案缺重卷检验',
          //closeAction: 'hide',
          width: 570,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:qcj_setup_grid,          
          tbar:[
          	'&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">目录号</span>:&nbsp;&nbsp;',
			{
				xtype:'textfield',
				id:'qcj_mlh',
			},				  
			{	
				xtype:'button',text:'检索',tooltip:'检索',id:'qcj_query',iconCls:'search',
				handler: function() {
					console.log(Ext.getCmp('qcj_mlh').value);
					if (Ext.getCmp('qcj_mlh').rawValue!=""){
						var grid = Ext.getCmp('qcj_setup_grid');
						grid.store.proxy.url="/desktop/get_qcj_grid";
						grid.store.proxy.extraParams.query=Ext.getCmp('qcj_mlh').rawValue;	
						grid.store.proxy.extraParams.userid=currentUser.id; 							
						grid.store.load();
					}
				}
			},
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('qcj_setup_win').close();
            }
          }]
          
        });
      }
      

      win.show();
    };

    var tj_ysjs_setup = function(){
	//缺重卷检验
      var win = Ext.getCmp('tj_ysjs_win');

      Ext.regModel('tj_ysjs_model', {
        fields: [
          {name: 'xh',    type: 'integer'},
          {name: 'mlh',    type: 'string'},
          {name: 'jshj',    type: 'string'},
          {name: 'yshj',    type: 'string'}
        ]
      });

      var tj_ysjs_store = Ext.create('Ext.data.Store', {
        id:'tj_ysjs_store',
        model : 'tj_ysjs_model',
        proxy: {
          type: 'ajax',
          url : '/desktop/tj_ysjs_grid',
          //extraParams: cx_tj,
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var tj_ysjs_grid = new Ext.grid.GridPanel({
        id : 'tj_ysjs_grid',
        store: tj_ysjs_store,        
        columns: [
          { text : '目录号',  width : 100, sortable : true, dataIndex: 'mlh'},
          { text : '页数合计',  width : 100, sortable : true, dataIndex: 'yshj'},
          { text : '件数合计',  width : 100, sortable : true, dataIndex: 'jshj'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      
      if (win==null) {
        win = new Ext.Window({
          id : 'tj_ysjs_win',
          title: '档案页数件数统计',
          //closeAction: 'hide',
          width: 770,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:tj_ysjs_grid,          
          tbar:[
          	'<span style=" font-size:12px;font-weight:500;color:#3366FF;">目录号</span>',
			{
				xtype:'textfield',
				width: 50,
				id:'tj_ysjs_mlh',
			},
			'<span style=" font-size:12px;font-weight:500;color:#3366FF;">年度</span>',
			{
				xtype:'textfield',
				width: 50,
				id:'tj_ysjs_nd',
			},
			'<span style=" font-size:12px;font-weight:500;color:#3366FF;">保管期限</span>',
			{
				xtype:'textfield',
				width: 50,
				id:'tj_ysjs_bgqx',
			},
			'<span style=" font-size:12px;font-weight:500;color:#3366FF;">机构问题号</span>',
			{
				xtype:'textfield',
				width: 50,
				id:'tj_ysjs_jgwth',
			},
			'<span style=" font-size:12px;font-weight:500;color:#3366FF;">起案卷号</span>',
			{
				xtype:'textfield',
				width: 50,
				id:'tj_ysjs_qajh',
			},
			'<span style=" font-size:12px;font-weight:500;color:#3366FF;">止案卷号</span>',
			{
				xtype:'textfield',
				width: 50,
				id:'tj_ysjs_zajh',
			},				  
			{	
				xtype:'button',text:'检索',tooltip:'检索',id:'tj_ysjs_query',iconCls:'search',
				handler: function() {
					console.log(Ext.getCmp('tj_ysjs_mlh').value);
					if (Ext.getCmp('tj_ysjs_mlh').rawValue!="" || Ext.getCmp('tj_ysjs_nd').rawValue!=""){
						var grid = Ext.getCmp('tj_ysjs_grid');
						grid.store.proxy.url="/desktop/tj_ysjs_grid";
						grid.store.proxy.extraParams.query=Ext.getCmp('tj_ysjs_mlh').rawValue;	
						grid.store.proxy.extraParams.userid=currentUser.id; 
						grid.store.proxy.extraParams.qajh=Ext.getCmp('tj_ysjs_qajh').rawValue; 
						grid.store.proxy.extraParams.nd=Ext.getCmp('tj_ysjs_nd').rawValue; 
						grid.store.proxy.extraParams.bgqx=Ext.getCmp('tj_ysjs_bgqx').rawValue; 
						grid.store.proxy.extraParams.jgwth=Ext.getCmp('tj_ysjs_jgwth').rawValue; 
						grid.store.proxy.extraParams.zajh=Ext.getCmp('tj_ysjs_zajh').rawValue; 							
						grid.store.load();
					}
				}
			},
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('tj_ysjs_win').close();
            }
          }]
          
        });
      }
      

      win.show();
    };

    var rz_manage = function(){
	//缺重卷检验
      var win = Ext.getCmp('rz_manage_win');

      Ext.regModel('rz_manage_model', {
        fields: [
		  {name: 'rq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
          {name: 'czr',    type: 'string'},
          {name: 'czlx',    type: 'string'},
          {name: 'mlh',    type: 'string'},
          {name: 'ajh',    type: 'string'},
		  {name: 'dalbmc',    type: 'string'},
		　　{name: 'czhnr',    type: 'string'},
		  {name: 'czqnr',    type: 'string'},
		  {name: 'dwmc',    type: 'string'},
		　　{name: 'qzh',    type: 'string'},
        ]
      });

      var rz_manage_store = Ext.create('Ext.data.Store', {
        id:'rz_manage_store',
        model : 'rz_manage_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_rz_manage_grid',
          //extraParams: cx_tj,
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
      var rz_manage_grid = new Ext.grid.GridPanel({
        id : 'rz_manage_grid',
        store: rz_manage_store,  
		bbar:[
	          new Ext.PagingToolbar({
	            store: rz_manage_store,
	            pageSize: 25,
	            width : 350,
	            border : false,
	            displayInfo: true,
	            displayMsg: '{0} - {1} of {2}',
	            emptyMsg: "没有找到！",
	            prependButtons: true
	          })
	    ],      
        columns: [
          { text : '操作日期',  width : 75, sortable : true, dataIndex: 'rq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '操作人',  width : 75, sortable : true, dataIndex: 'czr'},
		  { text : '操作类型',  width : 75, sortable : true, dataIndex: 'czlx'},
		  { text : '目录号',  width : 75, sortable : true, dataIndex: 'mlh'},
          { text : '案卷号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '操作后案卷内容',  width : 100, sortable : true, dataIndex: 'czhnr'},
		  { text : '档案类别',  width : 75, sortable : true, dataIndex: 'dalbmc'},
          { text : '单位名称',  width : 75, sortable : true, dataIndex: 'dwmc'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            
          },
        
        viewConfig: {
          stripeRows:true
        }
      });
      
      if (win==null) {
        win = new Ext.Window({
          id : 'rz_manage_win',
          title: '日志管理',
          //closeAction: 'hide',
          width: 570,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:rz_manage_grid,          
          tbar:[
          	{
	            xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
	            handler: function() {	              
				  showAdvancedSearch("操作起日期;qrq,操作止日期;zrq,操作人;czr,操作类型;czlx,档案类别;dalbmc,目录号;mlh,案卷号;ajh,操作内容;czhnr,单位名称;dwmc","rz_manage_grid","","","",true);
	            }
	         },
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('rz_manage_win').close();
            }
          }]
          
        });
      }
      

      win.show();
    };

    var data_manage = function(){
	//缺重卷检验
      var win = Ext.getCmp('data_manage_win');
	Ext.regModel('qzzt_model', {
      fields: [
        {name: 'id',       type: 'integer'},
        {name: 'dhp',      type: 'string'},
        {name: 'mlh',      type: 'integer'},
        {name: 'cmd',      type: 'string'},
        {name: 'fjcs',     type: 'string'},
        {name: 'dqwz',     type: 'string'},
        {name: 'zt',       type: 'string'}
      ]
    });
	var qzzt_store =  Ext.create('Ext.data.Store', {
      model : 'qzzt_model',
      proxy: {
        type: 'ajax',
        url : '/desktop/get_qzzt_store',
        extraParams: {qzh:""},
        reader: {
          type: 'json',
          root: 'rows',
          totalProperty: 'results'
        }
      }
    });

    qzzt_store.proxy.extraParams={qzh:'9'};
    qzzt_store.load();
	
    var qzzt_grid = new Ext.grid.GridPanel({
         // more config options clipped //,
         store: qzzt_store,
         id : 'qzzt_grid_id',
         layout : 'fit',
         //height : 350,
         columns: [
           { text : 'id',    align:"center", width : 15, sortable : true, dataIndex: 'id', hidden: true},
           { text : '说明',    align:"left",   width : 75, sortable : true, dataIndex: 'dhp'},
           { text : '目录号',    align:"left",  width : 50, sortable : true, dataIndex: 'mlh'},
           { text : '任务命令',   align:"left", width : 250, sortable : true, dataIndex: 'cmd'},
           { text : '附加参数',   align:"left", width : 100, sortable : true, dataIndex: 'fjcs', hidden: true},
           { text : '当前位置',   align:"center", width : 50, sortable : true, dataIndex: 'dqwz', hidden: true},
           { text : '状态',     align:"center", flex : 1, sortable : true, dataIndex:   'zt'}
         ],
         //selModel : {selType:'cellmodel'},
         selType:'checkboxmodel',
         multiSelect:true,
         viewConfig: {
           stripeRows:true
         },
         tbar : [
         {
            text : '删除选择',
            handler : function() {
              items = Ext.getCmp('qzzt_grid_id').getSelectionModel().selected.items;
              id_str = '';
              for (var i=0; i < items.length; i ++) {
                if (i==0) {
                  id_str = id_str+items[i].data.id;
                } else {
                  id_str = id_str + ',' +items[i].data.id ;
                }

              };
              pars = {id:id_str};
              new Ajax.Request("/desktop/delete_qzzt_task", { 
                method: "POST",
                parameters: pars,
                onComplete:  function(request) {
                  qzzt_store.load();
                }
              });
            }
          },'-',{
            text : '删除完成',
            handler : function() {
              pars = {};
              new Ajax.Request("/desktop/delete_all_qzzt_task", { 
                method: "POST",
                parameters: pars,
                onComplete:  function(request) {
                  qzzt_store.load();
                }
              });
            }
          },
          {
            text: '执行',
            handler: function() {
              var pars={id:archive_id};
              new Ajax.Request("/desktop/start_qzzt_task", {
                method: "POST",
                parameters: pars,
                onComplete:  function(request) {
                  qzzt_store.load();
                }
              });
            }
          },		  
          {
             text : '刷新',
             iconCls : 'x-tbar-loading',
             handler : function() {
               qzzt_store.load();
             }                                 
          },
		  {
             text : '输档备份',
             handler : function() {
               data_bak();
             }                                 
          },
		  {
             text : '影像文件按目录号备份',
             handler : function() {
               yxdata_bak();
             }                                 
          },
		  {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('data_manage_win').close();
            }
          }
		]
    });
      
      
      if (win==null) {
        win = new Ext.Window({
          id : 'data_manage_win',
          title: '数据备份',
          //closeAction: 'hide',
          width: 570,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:qzzt_grid                                   
        });
      }
      

      win.show();
    };

  var data_bak = function(){
    var win = Ext.getCmp('data_bak');    
    if (win==null) {
    win = new Ext.Window({
      id : 'data_bak',
      title: '数据备份',
      //closeAction: 'hide',
      width: 370,
      height: 110,      
      //minHeight: 200,
      layout: 'fit',
      modal: true,
      plain: true,
      //items:user_setup_grid,      
      items: [{
      width: 370,
      height: 110,
      xtype:'form',
      layout: 'absolute',
      id : 'data_bak_form',
      items: [
        {
        xtype: 'label',
        text: '备份文件名:',
        x: 10,
        y: 10,
        width: 100
        },        
        {
        xtype: 'textfield',
        x: 130,
        y: 10,
        width: 200,
        name: 'bak_name',
        id:'bak_name'
        }
      ],
      buttons:[{
        xtype: 'button',
        iconCls: 'print',
        id:'datj_print',
        text:'备份',
        handler: function() {			
          	var pars=this.up('panel').getForm().getValues();
			if(pars['bak_name']!=''){ 			
          		new Ajax.Request("/desktop/data_backup", { 
					method: "POST",
					parameters: pars,
					onComplete:	 function(request) {
						fhz=request.responseText.split(":");
						if (fhz[0]=='success'){
							cz_msg(fhz[1]);
						}else{
							alert(request.responseText);
						}
					}
				});
			}else
			{
				alert("请输入备份文件名。");
			}

          }
        
        },
        {
        xtype: 'button',
        iconCls: 'exit',
        text:'退出',
        handler: function() {
          //this.up('window').hide();
          Ext.getCmp('data_bak').close();
        }
        }]
      }]

    });
    }    
    win.show();
  };

  var yxdata_bak = function(){
    var win = Ext.getCmp('yxdata_bak'); 
	//挂接路径
      Ext.regModel('yxwz_model', {
        fields: [
          {name: 'id',       type: 'integer'},
          {name: 'qzh',       type: 'string'},
		  {name: 'dwdm',       type: 'string'},
		  {name: 'dalb',       type: 'string'},
		  {name: 'lbmc',       type: 'string'},
          {name: 'mlh',      type: 'string'},
          {name: 'yxwz',      type: 'string'}
        ]
      });

      // 虚拟打印状态Grid
      var yxwz_store =  Ext.create('Ext.data.Store', {
        model : 'yxwz_model',
        proxy: {
          type: 'ajax',
          url : '/desktop/get_qzmlh_store',
          extraParams: {qzh:""},
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
      });
      
      yxwz_store.load();
      
      var yxwz_grid = new Ext.grid.GridPanel({
           store: yxwz_store,
           id : 'yxwz_grid_id',
           columns: [
             { text : 'id',    align:"center", width : 15, sortable : true, dataIndex: 'id', hidden: true},
             { text : 'qzh',    align:"left",   width : 50, sortable : true, dataIndex: 'qzh', hidden: true},
			 { text : 'dalb',    align:"left",   width : 50, sortable : true, dataIndex: 'dabl', hidden: true},
             { text : '单位名称',    align:"left",   width : 150, sortable : true, dataIndex: 'dwdm'},
             { text : '档案类别',   align:"left",  width : 100, sortable : true, dataIndex: 'lbmc'},
             { text : '目录号',   align:"left", width : 50, sortable : true, dataIndex: 'mlh'}
           ],
           selType:'checkboxmodel',
           multiSelect:true,
           viewConfig: {
             stripeRows:true
           },
           tbar : [
           {
              text : '备份影像',
              iconCls : 'import',
              handler : function() {
                items = Ext.getCmp('yxwz_grid_id').getSelectionModel().selected.items;
                id_str = '';
                for (var i=0; i < items.length; i ++) {
                  if (i==0) {
                    id_str = id_str+items[i].data.qzh + "$" + items[i].data.mlh + "$" + items[i].data.dalb;
                  } else {
                    id_str = id_str + ',' +items[i].data.qzh + "$" + items[i].data.mlh + "$" + items[i].data.dalb;
                  }
                };
				if (id_str!=''){
                	pars = {id:id_str};
	                new Ajax.Request("/desktop/bak_selected_image", { 
	                  method: "POST",
	                  parameters: pars,
	                  onComplete:  function(request) {	                    
						Ext.getCmp('qzzt_grid_id').store.load();					
						Ext.getCmp('yxdata_bak').close();
	                  }
	                });
				}else{
					alert("至少要选择一个目录号才能备份。");
				}
              }
            }]
      });   
    if (win==null) {
    win = new Ext.Window({
      id : 'yxdata_bak',
      title: '影像数据备份',
      //closeAction: 'hide',
      width: 370,
      height: 410,      
      //minHeight: 200,
      layout: 'fit',
      modal: true,
      plain: true,
      items:yxwz_grid,            
      buttons:[
        {
        xtype: 'button',
        iconCls: 'exit',
        text:'退出',
        handler: function() {
          //this.up('window').hide();
          Ext.getCmp('yxdata_bak').close();
        }
        
      }]

    });
    }    
    win.show();
  };

	var myuploadform= new Ext.FormPanel({
	  id : 'my_upload_form',
	  fileUpload: true,
	  width: 300,
	  height : 110,
	  autoHeight: true,
	  bodyStyle: 'padding: 5px 5px 5px 5px;',
	  labelWidth: 0,
	  defaults: {
	    anchor: '95%',
	    allowBlank: false,
	    msgTarget: 'side'
	  },
	  layout : 'absolute',
	  items:[	{
		    xtype: 'label',
		    text: '请选择程序更新包文件：',
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
	        myForm = Ext.getCmp('my_upload_form').getForm();
			filename=myForm._fields.items[0].lastValue.split('\\');
          	file=filename[filename.length-1];
			file=file.gsub("'","\'")		
	        if(myForm.isValid())
	        {
	            form_action=1;
	            myForm.submit({
	              url: '/desktop/upload_file',
	              waitMsg: '文件上传中...',
	              success: function(form, action){
	                var isSuc = action.result.success; 				                
	                if (isSuc) {
	                  new Ajax.Request("/desktop/program_updata", { 
	                    method: "POST",
						parameters: eval("({filename:'" + file + "'})"),
	                    onComplete:  function(request) {
	                      if (request.responseText=='true'){
							msg('成功', '程序更新成功.');                                             
	                      }else{
	                        alert("程序更新失败，请重新更新。" + request.responseText);
	                      }
	                    }
	                  }); //save_image_db
	                } else { 
	                  msg('失败', '程序更新失败.');
	                }
	              }, 
	              failure: function(){
	                msg('失败', '程序更新失败.');
	              }
	            });
			}

	    } //handler
	  },	{
        xtype: 'button',
        iconCls: 'exit',
        text:'退出',
        handler: function() {
          //this.up('window').hide();
          Ext.getCmp('program_updata').close();
        }
        }] //buttons
	});
  var program_updata = function(){
    var win = Ext.getCmp('program_updata_win');    
    if (win==null) {
    win = new Ext.Window({
      id : 'program_updata',
      title: '软件更新',
      //closeAction: 'hide',
      width: 310,
      height: 150,      
      //minHeight: 200,
      layout: 'fit',
      modal: true,
      plain: true,
      //items:user_setup_grid,      
      items: [{
      width: 310,
      height: 150,
      xtype:'form',
      layout: 'absolute',
      id : 'program_updata_form',
      items: myuploadform,
      }]

    });
    }    
    win.show();
  };


    var sys_cd_tree_store = Ext.create('Ext.data.TreeStore', {
      autoLoad: true,
      proxy: {
          type: 'ajax',
          url: 'desktop/get_sys_cd_tree',
          extraParams: {userid:currentUser.id},
          actionMethods: 'POST'
      }
    });
    var sys_cd_tree_panel = Ext.create('Ext.tree.Panel', {
      id : 'sys_cd_tree_panel',
      store: sys_cd_tree_store,
      rootVisible:false,
      useArrows: true,
      listeners:{
        checkchange:function(node,checked,option){
          if(checked){
            root=Ext.getCmp('sys_cd_tree_panel').store.getRootNode();     
            getNodes(root,false);
            node.data.checked=true;
            node.updateInfo({checked:true});
            if (Ext.getCmp('qz_setup_win')!=undefined){Ext.getCmp('qz_setup_win').close();}
            if (Ext.getCmp('qz_lb_setup_win')!=undefined){Ext.getCmp('qz_lb_setup_win').close();}
            if (Ext.getCmp('qz_lb_ml_setup_win')!=undefined){Ext.getCmp('qz_lb_ml_setup_win').close();}
            if (Ext.getCmp('js_setup_win')!=undefined){Ext.getCmp('js_setup_win').close();}
            if (Ext.getCmp('js_qx_setup_win')!=undefined){Ext.getCmp('js_qx_setup_win').close();}
            if (Ext.getCmp('user_sb_setup_win')!=undefined){Ext.getCmp('user_sb_setup_win').close();}
            if (Ext.getCmp('user_setup_win')!=undefined){Ext.getCmp('user_setup_win').close();}           
            if (Ext.getCmp('jr_model_setup_win')!=undefined){Ext.getCmp('jr_model_setup_win').close();}
			if (Ext.getCmp('qcj_setup_win')!=undefined){Ext.getCmp('qcj_setup_win').close();}
			if (Ext.getCmp('tj_ysjs_win')!=undefined){Ext.getCmp('tj_ysjs_win').close();}
			if (Ext.getCmp('rz_manage_win')!=undefined){Ext.getCmp('rz_manage_win').close();}
			if (Ext.getCmp('data_bak')!=undefined){Ext.getCmp('data_bak').close();}
			if (Ext.getCmp('data_manage_win')!=undefined){Ext.getCmp('data_manage_win').close();}
			if (Ext.getCmp('program_updata')!=undefined){Ext.getCmp('program_updata').close();}
			
            switch (node.data.id) { 
              case "11": 
                qz_setup();
                break; 
              case "12": 
                qz_lb_setup();
                break; 
              case "13": 
                qz_lb_ml_setup();
                break; 
              case "14": 
                js_setup();
                break;
              case "15": 
                js_qx_setup();
                break;
              case "16": 
                user_setup();
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
    if(!win){
        win = desktop.createWindow({
        id: 'systemman',              
        title:'系统管理',
        width:200,
        height:500,
        x : 100,
        y : 50,
        iconCls: 'archiveman',
        animCollapse:false,
        border: false,
        hideMode: 'offsets',
        layout: 'fit',
        split:true,
              
        items: sys_cd_tree_panel
      });
    }

    win.show();

    
    
      return win;
  }

});

