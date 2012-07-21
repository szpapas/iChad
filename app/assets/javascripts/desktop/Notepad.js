/*

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

Ext.define('MyDesktop.Notepad', {
  extend: 'Ext.ux.desktop.Module',
  requires: [
      'Ext.form.field.HtmlEditor'
  ],
  id:'notepad',
  init : function(){
      this.launcher = {
          text: '智慧物联管理',
          iconCls:'zhwl',
          handler : this.createWindow,
          scope: this
      }
  },

  createWindow : function(){
    var desktop = this.app.getDesktop();
    var win = desktop.getWindow('notepad');
    qjms_id="";
    qjms_name="";
    var tjlx_data = [
     ['0','按设备'],
     ['1','按房间'],
     ['2','按设备类型'],
     ['3','按楼层']
    ];

    var tjlx_store = new Ext.data.SimpleStore({
      fields: ['value', 'text'],
      data : tjlx_data
    });
        
    var myStore = new Ext.data.ArrayStore({
        fields: ['name', 'url'], 
        idIndex: 0
    });

    var myData = [
        ['搞笑', 'assets/chart48x48.png'], ['刘亦菲', 'assets/grid48x48.png'] ];      
        myStore.loadData(myData);  
        var tpl = new Ext.XTemplate(
        '<tpl for=".">',
        '<div class="thumb-wrap" id="{name}">',
        '<div class="thumb"><img src="{url}" title="{name}11"></div>',      
        '<span class="x-editable">{name}</span></div>',
        '</tpl>',
        '<div class="x-clear"></div>'
        );

    var panel = new Ext.Panel({
      id:'images-view',
      frame:true,
      autoWidth:true,
      autoHeight:true,
      collapsible:true,
      layout:'fit',
      title:'Simple DataView',
      items: [
        new Ext.DataView({
          store: myStore,
          singleSelect: true,
          overItemCls: 'x-view-over',
          tpl: tpl,
          autoHeight:true,
          overClass:'x-view-over',
          itemSelector:'div.thumb-wrap',
          emptyText: 'No images to display'          
          })]      
      });
        
    var win = Ext.getCmp('user_disp_win');
    var ztRender = function(val) {
        if (val == "关") {
            return '<span style="color:red;">' + val + '</span>';
        } else if (val == "开") {
            return '<span style="color:blue;">' + val + '</span>';
        } else {
           return '<span style="color:gray;">' + val + '</span>';
        }
        return val;                          
      };
      
    Ext.regModel('ly_model', {
      fields: [
        {name: 'id',    type: 'integer'},
        {name: 'lymc',    type: 'string'}
      ]
    });
    
    var ly_store = Ext.create('Ext.data.Store', {
        id:'ly_store',
        model : 'ly_model',
        proxy: {
          type: 'ajax',
          url : '/desktop/get_zn_ly_grid',
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }       
    });
    
      ly_store.load();
      Ext.regModel('lc_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'lcmc',    type: 'string'}
        ]
      });
      
      var lc_store = Ext.create('Ext.data.Store', {
          id:'lc_store',
          model : 'lc_model',
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_lc_grid',
            //extraParams: {query:title},
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }       
      });
      //lc_store.load();
      Ext.regModel('fj_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'fjmc',    type: 'string'}
        ]
      });
      var fj_store = Ext.create('Ext.data.Store', {
          id:'fj_store',
          model : 'fj_model',
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_fj_grid',
            //extraParams: {query:title},
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }       
      });
      Ext.regModel('sblx_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'lxsm',    type: 'string'}
        ]
      });
      var sblx_store = Ext.create('Ext.data.Store', {
          id:'sblx_store',
          model : 'sblx_model',
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_sb_lx_grid',
            //extraParams: {query:title},
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }       
      });
      Ext.regModel('user_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'username',    type: 'string'}
        ]
      });
      var user_store = Ext.create('Ext.data.Store', {
          id:'user_store',
          model : 'user_model',
          proxy: {
            type: 'ajax',
            url : '/desktop/get_user_grid',
            //extraParams: {query:title},
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }       
      });
      user_store.load();
      
      
      
      
      Ext.regModel('sb_model', {
        fields: [
          {name: 'sbid',    type: 'integer'},
          {name: 'sbmc',    type: 'string'}
        ]
      });
      var sb_store = Ext.create('Ext.data.Store', {
          id:'sb_store',
          model : 'sb_model',
          proxy: {
            type: 'ajax',
            url : '/desktop/get_user_sb_grid',
            extraParams: {id:currentUser.id},
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }       
      });
      sb_store.load();
      
      Ext.regModel('sb_cz_model', {
        fields: [
          {name: 'czid',    type: 'integer'},
          {name: 'czsm',    type: 'string'}
        ]
      });
      var sb_cz_store = Ext.create('Ext.data.Store', {
          id:'sb_cz_store',
          model : 'sb_cz_model',
          proxy: {
            type: 'ajax',
            url : '/desktop/get_sb_cz_grid',
            //extraParams: {id:currentUser.id},
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }       
      });
      sb_cz_store.load();
      
      
      Ext.regModel('qjms_model', {
        fields: [
          {name: 'id',    type: 'integer'},
          {name: 'msmc',    type: 'string'}
        ]
      });
      var qjms_store = Ext.create('Ext.data.Store', {
          id:'qjms_store',
          model : 'qjms_model',
          proxy: {
            type: 'ajax',
            url : '/desktop/get_qjms_grid',
            extraParams: {query:currentUser.id},
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }       
      });
      qjms_store.load();
      
      function getNodes(node,tf) {
        //遍历所有子节点
        if (node.childNodes.size() == 0) return;
        node.eachChild(function(n){
          n.data.checked=tf;
          n.updateInfo({checked:tf});
          getNodes(n,tf);
        });
      };
      function get_mlqx_NodesChecked(node) {
        //获取用户目录权限树
        if (node.childNodes.size() == 0) return;
        node.eachChild(function(n){
              if(n.data.leaf==true){
                  if (n.data.checked==true){
                  if (insert_qx==""){
                    insert_qx= n.data.id 
                  }else{
                    insert_qx=insert_qx+ "$" + n.data.id 
                  }
                };
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
      var sb_cz_disp = function(record,add_new){
        var win = Ext.getCmp('sb_cz_disp_win');

        if (win==null) {
          win = new Ext.Window({
            id : 'sb_cz_disp_win',
            title: '修改用户信息',
            //closeAction: 'hide',
            width: 370,
            height: 240,

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
                  text: 'Email:',
                  x: 10,
                  y: 40,
                  width: 100
                }
                ,
                {
                  xtype: 'label',
                  text: '密码:',
                  x: 10,
                  y: 70,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '是否显示下级档案:',
                  x: 10,
                  y: 100,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '所属全宗:',
                  x: 10,
                  y: 130,
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
                  xtype: 'textfield',
                  x: 130,
                  y: 40,
                  width: 200,
                  name: 'email',
                  id:'user_email'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 70,
                  width: 200,
                  name: 'encrypted_password',
                  id:'user_encrypted_password'
                } ,
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 100,
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
                  y: 130,
                  width: 200,
                  store: qz_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'dwdm',
                  triggerAction:'all',
                  name: 'dwdm',
                  id:'user_ssqz'
                }
              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_user_add',
                  text:'修改',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['email']!=''){
                      if(pars['encrypted_password']!=''){
                        if(add_new==false){
                          new Ajax.Request("/desktop/update_user", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              if (request.responseText=='success'){
                                alert("修改成功。");
                                Ext.getCmp('user_disp_win').close();

                                Ext.getCmp('user_setup_grid').store.url='/desktop/get_user_grid';
                                Ext.getCmp('user_setup_grid').store.load();
                              }else{
                                alert("修改失败，请重新修改。");
                              }

                            }
                          });
                        }else{
                          new Ajax.Request("/desktop/insert_user", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              if (request.responseText=='success'){
                                alert("新增成功。");
                                Ext.getCmp('user_disp_win').close();
                                Ext.getCmp('user_setup_grid').store.url='/desktop/get_user_grid';
                                Ext.getCmp('user_setup_grid').store.load();
                              }else{
                                alert("新增失败，请重新新增。");
                              }
                            }
                          });
                        }
                      }else{
                        alert("密码不能为空。");
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

      var user_sb_setup = function(){
        var win = Ext.getCmp('user_sb_setup_win');

        Ext.regModel('user_sb_setup_model', {
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

        var user_sb_setup_store = Ext.create('Ext.data.Store', {
          id:'user_sb_setup_store',
          model : 'user_sb_setup_model',
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
        var user_sb_setup_grid = new Ext.grid.GridPanel({
          id : 'user_sb_setup_grid',
          store: user_sb_setup_store,       
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '用户名', width : 100, sortable : true, dataIndex: 'username'},
            { text : 'Email', width : 150, sortable : true, dataIndex: 'email'},
            { text : '是否显示下级档案',  width : 150, sortable : true, dataIndex: 'sfxsxyisj'},
            { text : '所属全宗',  width : 150, sortable : true, dataIndex: 'dwdm'},         
            { text : '密码',  width : 0, sortable : true, dataIndex: 'encrypted_password'}
            ],
            selType:'checkboxmodel',
            //multiSelect:true,
            listeners:{

            },

          viewConfig: {
            stripeRows:true
          }
        });
        user_sb_setup_grid.on("select",function(node){
          data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf              
          new Ajax.Request("/desktop/get_user_sb", { 
            method: "POST",
            parameters: "id="+data.id,
            onComplete:  function(request) {
              //alert(request.responseText);
              root=Ext.getCmp('user_sb_tree_panel').store.getRootNode();      
              getNodes(root,false);           
              nodes=request.responseText.split("|");
              for (k=0; k <nodes.size(); k++) {
                Ext.getCmp('user_sb_tree_panel').store.getNodeById(nodes[k]).data.checked=true;
                Ext.getCmp('user_sb_tree_panel').store.getNodeById(nodes[k]).updateInfo({checked:true});
              }   
            }
          });
        });
        var sb_tree_store = Ext.create('Ext.data.TreeStore', {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'desktop/get_sb_tree',
                extraParams: {style:"0"},
                actionMethods: 'POST'
            }
        }); 
        var sb_tree_panel = Ext.create('Ext.tree.Panel', {
          id : 'user_sb_tree_panel',
          store: sb_tree_store,
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
            id : 'user_sb_setup_win',
            title: '用户设备设置',
            x : 300,
            y : 50,
            width: 670,
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
                items:user_sb_setup_grid
              },
              { title:'设备树',
                region:'center',
                iconCls:'dept_tree',
                xtype:'panel',
                margins:'0 0 0 0',
                //width: 250,
                //collapsible:true,//可以被折叠            
                //id:'user-qx-tree',
                layout:'fit',
                split:true,
                items:sb_tree_panel
              }
            ],

            tbar:[
            {
              xtype: 'button',
              iconCls: 'save',
              text:'保存用户设备',
              handler: function() {
                var grid = Ext.getCmp('user_sb_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  root=Ext.getCmp('user_sb_tree_panel').store.getRootNode();
                  insert_qx="";
                  get_mlqx_NodesChecked(root);

                  var node=nodes[0];
                  if (insert_qx==""){
                    alert("请您选择一些设备再保存。");
                  }else{
                    insert_qx="({insert_qx:'" + insert_qx + "',userid:" + records[0].data.id + "})";
                    new Ajax.Request("/desktop/insert_user_sb", { 
                      method: "POST",
                      parameters: eval(insert_qx),
                      onComplete:  function(request) {
                        if (request.responseText=='success'){
                          alert("保存用户设备成功。");                       
                        }else{
                          alert("保存用户设备失败，请重新保存。");
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
              iconCls: 'exit',
              text:'退出',
              handler: function() {
                //this.up('window').hide();
                Ext.getCmp('user_sb_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };

      var ktjz_disp = function(record,add_new){
        var win = Ext.getCmp('ktjz_disp_win');

        //qz_store.load();
        if (win==null) {
          win = new Ext.Window({
            id : 'ktjz_disp_win',
            title: '空调校准--根据当前空调的实际情况进行校准',
            //closeAction: 'hide',
            width: 370,
            height: 300,
            //minHeight: 200,
            layout: 'fit',
            modal: true,
            plain: true,
            //items:user_setup_grid,          
            items: [{
              width: 370,
              height: 300,
              xtype:'form',
              layout: 'absolute',
              id : 'ktjz_disp_form',
              items: [
                {
                  xtype: 'label',
                  text: '设备名称：',
                  x: 10,
                  y: 10,
                  
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '当前室内温度：',
                  x: 10,
                  y: 40,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '空调设定温度：',
                  x: 10,
                  y: 70,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '当前开关状态：',
                  x: 10,
                  y: 100,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '当前空调模式：',
                  x: 10,
                  y: 130,
                  width: 100
                },
                
                {
                  xtype: 'textfield',
                  hidden : true,
                  name : 'id' ,
                  id:'sb_id'                    
                },

                {
                  xtype: 'textfield',
                  x: 130,
                  y: 10,
                  width: 200,
                  name: 'sbmc',
                  readonly:true,
                  id:'sb_sbmc'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 40,
                  width: 200,
                  name: 'sw',
                  id:'sb_sw'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 70,
                  width: 200,
                  name: 'kw',
                  id:'sb_kw'

                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 100,
                  width: 200,
                  store: kg_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'value',
                  displayField:'text',
                  triggerAction:'all',
                  listConfig: { loadMask: false },                  
                  name: 'kg',
                  id:'sb_kg'
                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 130,
                  width: 200,
                  store: ktms_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'value',
                  displayField:'text',
                  triggerAction:'all',
                  listConfig: { loadMask: false },
                  name: 'ktms',
                  id:'sb_ktms'
                }
                


              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_qz_add',
                  text:'校准',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['sbmc']!=''){
                      if(pars['kw']!=''){
                        if(pars['sw']!=''){
                          
                            new Ajax.Request("/desktop/update_ktjz", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (request.responseText=='success'){

                                  Ext.getCmp('ktjz_disp_win').close();

                                  Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                                  Ext.getCmp('sb_cz_setup_grid').store.load();
                                }else{
                                  if (text[0]=='false'){
                                    alert(text[1]);
                                  }else{
                                    alert("校准失败。");
                                  }
                                }

                              }
                            });
                          
                        }else{
                          alert("当前室内温度不能为空。");
                        }
                      }else{
                        alert("当前空调温度不能为空。");
                      }
                    }else{
                      alert("设备名称不能为空。");
                    }
                  }
                },
                {
                  xtype: 'button',
                  iconCls: 'exit',
                  text:'退出',
                  handler: function() {
                    //this.up('window').hide();
                    Ext.getCmp('ktjz_disp_win').close();
                  }
                }]
            }]

          });
        }
        
          Ext.getCmp('ktjz_disp_form').getForm().setValues(record.data);

        
        win.show();
      };


      var sb_cz_setup = function(){
        var win = Ext.getCmp('sb_cz_setup_win');

        Ext.regModel('sb_cz_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'sbmc',    type: 'string'},
            {name: 'sbsm',    type: 'string'},
            {name: 'lymc',    type: 'string'},
            {name: 'ssly',    type: 'integer'},
            {name: 'lcmc',    type: 'string'},
            {name: 'sslc',    type: 'integer'},
            {name: 'fjmc',    type: 'string'},
            {name: 'ssfj',    type: 'integer'},
            {name: 'kzl',   type: 'string'},
            {name: 'gzl',   type: 'string'},
            {name: 'sbh',   type: 'string'},
            {name: 'kgzt',    type: 'string'},
            {name: 'sblx',    type: 'string'}

          ]
        });

        var sb_cz_setup_store = Ext.create('Ext.data.Store', {
          id:'sb_cz_setup_store',
          model : 'sb_cz_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_sb_grid',
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
        var sb_cz_setup_grid = new Ext.grid.GridPanel({
          id : 'sb_cz_setup_grid',
          store: sb_cz_setup_store,       
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '开关状态',  width : 60, sortable : true, dataIndex: 'kgzt',renderer:ztRender},
            { text : '设备名称',  width : 70, sortable : true, dataIndex: 'sbmc'},
            { text : '设备说明',  width : 250, sortable : true, dataIndex: 'sbsm'},
            { text : '所属房间',  width : 100, sortable : true, dataIndex: 'fjmc'},
            { text : '所属楼层',  width : 100, sortable : true, dataIndex: 'lcmc'},
            { text : '所属楼宇',  width : 100, sortable : true, dataIndex: 'lymc'},
            { text : '设备号', width : 50, sortable : true, dataIndex: 'sbh'}
            
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

        var fj_tree_store = Ext.create('Ext.data.TreeStore', {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'desktop/get_fj_tree',
                extraParams: {style:"0"},
                actionMethods: 'POST'
            }
        }); 
        var fj_tree_panel = Ext.create('Ext.tree.Panel', {
          id : 'user_fj_tree_panel',
          store: fj_tree_store,
          rootVisible:false,
          useArrows: true,
          //singleExpand: true,
          width: 200

        });
        fj_tree_panel.on("select",function(node){ 
          data = node.selected.items[0].data;  // data.id, data.parent, data.text, data.leaf
          Ext.getCmp('sb_cz_setup_grid').store.proxy.extraParams.query=  data.id;
          Ext.getCmp('sb_cz_setup_grid').store.proxy.extraParams.userid= currentUser.id;
          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';

          Ext.getCmp('sb_cz_setup_grid').store.load();
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
            id : 'sb_cz_setup_win',
            title: '设备状态及控制',
            x : 300,
            y : 50,
            width: 670,
            height: 500,
            minHeight: 500,
            layout: 'border',
            //modal: true,
            plain: true,          
            items: [
              { title:'房间树',
                region:'west',
                iconCls:'users',
                xtype:'panel',
                margins:'0 0 0 0',
                width: 200,
                collapsible:true,//可以被折叠              
                layout:'fit',
                split:true,
                items:fj_tree_panel

              },
              { title:'设备列表',
                region:'center',
                iconCls:'dept_tree',
                xtype:'panel',
                margins:'0 0 0 0',
                layout:'fit',
                split:true,
                items:sb_cz_setup_grid
              }
            ],

            tbar:[{
              xtype: 'button',
              iconCls: 'dksb',
              text:'打开设备',
              handler: function() {
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  
                    var pars={sbh:record.data.sbh,kzzl:record.data.kzl,cz:'开',sbid:record.data.id,userid:currentUser.id};
                    new Ajax.Request("/desktop/zn_kg_kz", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        text=request.responseText.split(':');
                        if (text[0]=='success'){
                          alert("设备打开成功。"); 
                          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                          Ext.getCmp('sb_cz_setup_grid').store.load();
                        }else{
                          if (text[0]=='false'){
                            alert(text[1]);
                          }else{
                            alert("设备打开失败。");
                          }
                        }
                            
                      }
                    })
                  
                            
                }else{
                  alert("请选择一个设备进行打开。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'关闭设备',
              handler: function() {
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];                  
                    var pars={sbh:record.data.sbh,kzzl:record.data.gzl,cz:'关',sbid:record.data.id,userid:currentUser.id};
                    new Ajax.Request("/desktop/zn_kg_kz", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        text=request.responseText.split(':');
                        if (text[0]=='success'){
                          alert("设备关闭成功。");                                             
                          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                          Ext.getCmp('sb_cz_setup_grid').store.load();
                        }else{
                          if (text[0]=='false'){
                            alert(text[1]);
                          }else{
                            alert("设备关闭失败。");
                          }
                        }

                      }
                    })
                  

                }else{
                  alert("请选择一个设备进行关闭。");
                }

              }
            },
            {
              xtype: 'button',
              iconCls: 'add',
              text:'加温',
              handler: function() {
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                    var pars={sbh:record.data.sbh,kzzl:record.data.gzl,cz:'加温',sbid:record.data.id,userid:currentUser.id};
                    new Ajax.Request("/desktop/zn_kg_kz", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        text=request.responseText.split(':');
                        if (text[0]=='success'){
                          alert("设备加温成功。");                                             
                          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                          Ext.getCmp('sb_cz_setup_grid').store.load();
                        }else{
                          if (text[0]=='false'){
                            alert(text[1]);
                          }else{
                            alert("设备加温失败。");
                          }
                        }

                      }
                    })
                  

                }else{
                  alert("请选择一个加温进行关闭。");
                }

              }
            },
            {
              xtype: 'button',
              iconCls: 'jw',
              text:'减温',
              handler: function() {
                //this.up('window').hide();
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  
                    var pars={sbh:record.data.sbh,kzzl:record.data.gzl,cz:'减温',sbid:record.data.id,userid:currentUser.id};
                    new Ajax.Request("/desktop/zn_kg_kz", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        text=request.responseText.split(':');
                        if (text[0]=='success'){
                          alert("设备减温成功。");                                             
                          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                          Ext.getCmp('sb_cz_setup_grid').store.load();
                        }else{
                          if (text[0]=='false'){
                            alert(text[1]);
                          }else{
                            alert("设备减温失败。");
                          }
                        }

                      }
                    })

                }else{
                  alert("请选择一个设备进行减温。");
                }

              }
            },
            {
              xtype: 'button',
              iconCls: 'refresh',
              text:'模式转换',
              handler: function() {
                //this.up('window').hide();
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  
                    var pars={sbh:record.data.sbh,kzzl:record.data.gzl,cz:'模式转换',sbid:record.data.id,userid:currentUser.id};
                    new Ajax.Request("/desktop/zn_kg_kz", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        text=request.responseText.split(':');
                        if (text[0]=='success'){
                          alert("模式转换成功。");                                             
                          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                          Ext.getCmp('sb_cz_setup_grid').store.load();
                        }else{
                          if (text[0]=='false'){
                            alert(text[1]);
                          }else{
                            alert("模式转换失败。");
                          }
                        }

                      }
                    })
                  

                }else{
                  alert("请选择一个设备进行模式转换。");
                }

              }
            },
            {
              xtype: 'button',
              iconCls: 'refresh',
              text:'读取状态',
              handler: function() {
                //this.up('window').hide();
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  
                    var pars={sbh:record.data.sbh,kzzl:record.data.gzl,cz:'读取状态',sbid:record.data.id,userid:currentUser.id};
                    new Ajax.Request("/desktop/zn_kg_kz", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        text=request.responseText.split(':');
                        if (text[0]=='success'){
                          alert("读取状态成功。");                                             
                          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                          Ext.getCmp('sb_cz_setup_grid').store.load();
                        }else{
                          if (text[0]=='false'){
                            alert(text[1]);
                          }else{
                            alert("读取状态失败。");
                          }
                        }

                      }
                    })
                  

                }else{
                  alert("请选择一个设备进行模式转换。");
                }

              }
            },
            {
              xtype: 'button',
              iconCls: 'refresh',
              text:'清除状态',
              handler: function() {
                //this.up('window').hide();
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  
                    var pars={sbh:record.data.sbh,kzzl:record.data.gzl,cz:'清除状态',sbid:record.data.id,userid:currentUser.id};
                    new Ajax.Request("/desktop/zn_kg_kz", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        text=request.responseText.split(':');
                        if (text[0]=='success'){
                          alert("读取状态成功。");                                             
                          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                          Ext.getCmp('sb_cz_setup_grid').store.load();
                        }else{
                          if (text[0]=='false'){
                            alert(text[1]);
                          }else{
                            alert("读取状态失败。");
                          }
                        }

                      }
                    })
                  

                }else{
                  alert("请选择一个设备进行模式转换。");
                }

              }
            },
            {
              xtype: 'button',
              iconCls: 'refresh',
              text:'读取温湿度',
              handler: function() {
                //this.up('window').hide();
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  
                    var pars={sbh:record.data.sbh,kzzl:record.data.gzl,cz:'读取温湿度',sbid:record.data.id,userid:currentUser.id};
                    new Ajax.Request("/desktop/zn_kg_kz", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        text=request.responseText.split(':');
                        if (text[0]=='success'){
                          alert("读取状态成功。");                                             
                          Ext.getCmp('sb_cz_setup_grid').store.url='/desktop/get_zn_sb_grid';
                          Ext.getCmp('sb_cz_setup_grid').store.load();
                        }else{
                          if (text[0]=='false'){
                            alert(text[1]);
                          }else{
                            alert("读取状态失败。");
                          }
                        }

                      }
                    })
                  

                }else{
                  alert("请选择一个设备进行模式转换。");
                }

              }
            },
            {
              xtype: 'button',
              iconCls: 'settings',
              text:'空调校准',
              handler: function() {
                //this.up('window').hide();
                var grid = Ext.getCmp('sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                    if (record.data.sblx==3){
                      ktjz_disp(record,false);
                    }                     
                    else{
                      alert("只有空调才需要进行校准。");
                    }
                  

                }else{
                  alert("请选择一个设备进行模式转换。");
                }

              }
            },
            {
              xtype: 'button',
              iconCls: 'exit',
              text:'退出',
              handler: function() {
                //this.up('window').hide();
                Ext.getCmp('sb_cz_setup_win').close();
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

      var ly_disp = function(record,add_new){
        var win = Ext.getCmp('ly_disp_win');

        //qz_store.load();
        if (win==null) {
          win = new Ext.Window({
            id : 'ly_disp_win',
            title: '修改楼宇信息',
            //closeAction: 'hide',
            width: 370,
            height: 150,
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
              id : 'ly_disp_form',
              items: [
                {
                  xtype: 'label',
                  text: '楼宇名称：',
                  x: 10,
                  y: 10,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '楼宇说明：',
                  x: 10,
                  y: 40,
                  width: 100
                },
                {
                  xtype: 'textfield',
                  hidden : true,
                  name : 'id' ,
                  id:'ly_id'                    
                },

                {
                  xtype: 'textfield',
                  x: 130,
                  y: 10,
                  width: 200,
                  name: 'lymc',
                  id:'ly_lymc'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 40,
                  width: 200,
                  name: 'lysm',
                  id:'ly_lysm'
                }
              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_qz_add',
                  text:'修改',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['lymc']!=''){
                      if(pars['lysm']!=''){
                        if(add_new==false){
                          new Ajax.Request("/desktop/update_zn_ly", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){

                                Ext.getCmp('ly_disp_win').close();

                                Ext.getCmp('ly_setup_grid').store.url='/desktop/get_zn_ly_grid';
                                Ext.getCmp('ly_setup_grid').store.load();
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
                          new Ajax.Request("/desktop/insert_zn_ly", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (text[0]=='success'){

                                Ext.getCmp('ly_disp_win').close();
                                Ext.getCmp('ly_setup_grid').store.url='/desktop/get_zn_ly_grid';
                                Ext.getCmp('ly_setup_grid').store.load();
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
                        alert("楼宇说明不能为空。");
                      }
                    }else{
                      alert("楼宇名称不能为空。");
                    }
                  }
                },
                {
                  xtype: 'button',
                  iconCls: 'exit',
                  text:'退出',
                  handler: function() {
                    //this.up('window').hide();
                    Ext.getCmp('ly_disp_win').close();
                  }
                }]
            }]

          });
        }
        if(add_new==false){
        //设置数据
          Ext.getCmp('ly_disp_form').getForm().setValues(record.data);

        }else{
          Ext.getCmp('ly_disp_win').title="新增楼宇信息";
          Ext.getCmp('button_qz_add').text="新增";
          Ext.getCmp('button_qz_add').iconCls="add";
        }

        win.show();
      };
      var ly_setup = function(){
        var win = Ext.getCmp('ly_setup_win');

        Ext.regModel('ly_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'lymc',    type: 'string'},
            {name: 'lysm',    type: 'string'}

          ]
        });

        var ly_setup_store = Ext.create('Ext.data.Store', {
          id:'ly_setup_store',
          model : 'ly_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_ly_grid',
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
        var ly_setup_grid = new Ext.grid.GridPanel({
          id : 'ly_setup_grid',
          store: ly_setup_store,        
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '楼宇名称',  width : 150, sortable : true, dataIndex: 'lymc'},
            { text : '楼宇说明',  width : 250, sortable : true, dataIndex: 'lysm'}
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
            id : 'ly_setup_win',
            title: '楼宇设置',
            //closeAction: 'hide',
            width: 670,
            x : 300,
            y : 50,
            height: 500,
            minHeight: 500,
            layout: 'fit',
            //modal: true,
            plain: true,
            items:ly_setup_grid,          
            tbar:[{
              xtype: 'button',
              iconCls: 'add',
              text:'新增',
              handler: function() {
                //this.up('window').hide();

                ly_disp("record",true);
              }
            },
            {
              xtype: 'button',
              iconCls: 'option',
              text:'修改',
              handler: function() {
                //this.up('window').hide();

                var grid = Ext.getCmp('ly_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  ly_disp(record,false);
                }else{
                  alert("请选择一个楼宇进行修改。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'删除',
              handler: function() {
                var grid = Ext.getCmp('ly_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==0){
                  alert("请选择一个楼宇进行删除。");

                }else{
                  var record = records[0];
                  var pars="id="+record.data.id;
                  Ext.Msg.confirm("提示信息","是否要删除楼宇名称为：！"+record.data.lymc+"的楼宇？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/delete_zn_ly", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                Ext.getCmp('ly_setup_grid').store.url='/desktop/get_ly_grid';
                                Ext.getCmp('ly_setup_grid').store.load();
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
                Ext.getCmp('ly_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };  

      var lc_disp = function(record,add_new){
        var win = Ext.getCmp('lc_disp_win');

        //qz_store.load();
        if (win==null) {
          win = new Ext.Window({
            id : 'lc_disp_win',
            title: '修改楼层信息',
            //closeAction: 'hide',
            width: 370,
            height: 180,
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
              id : 'lc_disp_form',
              items: [
                {
                  xtype: 'label',
                  text: '楼层名称：',
                  x: 10,
                  y: 10,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '楼层说明：',
                  x: 10,
                  y: 40,
                  width: 100
                },

                {
                  xtype: 'label',
                  text: '所属楼宇：',
                  x: 10,
                  y: 70,
                  width: 100
                },
                {
                  xtype: 'textfield',
                  hidden : true,
                  name : 'id' ,
                  id:'lc_id'                    
                },

                {
                  xtype: 'textfield',
                  x: 130,
                  y: 10,
                  width: 200,
                  name: 'lcmc',
                  id:'lc_lcmc'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 40,
                  width: 200,
                  name: 'lcsm',
                  id:'lc_lcsm'
                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 70,
                  width: 200,
                  store: ly_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'lymc',
                  triggerAction:'all',
                  name: 'ssly',
                  id:'lc_ssly'
                }
              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_qz_add',
                  text:'修改',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['lcmc']!=''){
                      if(pars['lcsm']!=''){
                        if(pars['ssly']!=''){
                          if(add_new==false){
                            new Ajax.Request("/desktop/update_zn_lc", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (request.responseText=='success'){

                                  Ext.getCmp('lc_disp_win').close();

                                  Ext.getCmp('lc_setup_grid').store.url='/desktop/get_zn_lc_grid';
                                  Ext.getCmp('lc_setup_grid').store.load();
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
                            new Ajax.Request("/desktop/insert_zn_lc", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (text[0]=='success'){

                                  Ext.getCmp('lc_disp_win').close();
                                  Ext.getCmp('lc_setup_grid').store.url='/desktop/get_zn_lc_grid';
                                  Ext.getCmp('lc_setup_grid').store.load();
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
                          alert("所属楼宇说明不能为空。");
                        }
                      }else{
                        alert("楼层说明不能为空。");
                      }
                    }else{
                      alert("楼层名称不能为空。");
                    }
                  }
                },
                {
                  xtype: 'button',
                  iconCls: 'exit',
                  text:'退出',
                  handler: function() {
                    //this.up('window').hide();
                    Ext.getCmp('lc_disp_win').close();
                  }
                }]
            }]

          });
        }
        if(add_new==false){
        //设置数据
          Ext.getCmp('lc_disp_form').getForm().setValues(record.data);

        }else{
          Ext.getCmp('lc_disp_win').title="新增楼层信息";
          Ext.getCmp('button_qz_add').text="新增";
          Ext.getCmp('button_qz_add').iconCls="add";
        }

        win.show();
      };
      var lc_setup = function(){
        var win = Ext.getCmp('lc_setup_win');

        Ext.regModel('lc_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'lcmc',    type: 'string'},
            {name: 'lcsm',    type: 'string'},
            {name: 'lymc',    type: 'string'},
            {name: 'ssly',    type: 'integer'}

          ]
        });

        var lc_setup_store = Ext.create('Ext.data.Store', {
          id:'lc_setup_store',
          model : 'lc_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_lc_grid',
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
        var lc_setup_grid = new Ext.grid.GridPanel({
          id : 'lc_setup_grid',
          store: lc_setup_store,        
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '楼层名称',  width : 150, sortable : true, dataIndex: 'lcmc'},
            { text : '楼层说明',  width : 250, sortable : true, dataIndex: 'lcsm'},
            { text : '所属楼宇',  width : 250, sortable : true, dataIndex: 'lymc'}
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
            id : 'lc_setup_win',
            title: '楼层设置',
            //closeAction: 'hide',
            width: 670,
            x : 300,
            y : 50,
            height: 500,
            minHeight: 500,
            layout: 'fit',
            //modal: true,
            plain: true,
            items:lc_setup_grid,          
            tbar:[{
              xtype: 'button',
              iconCls: 'add',
              text:'新增',
              handler: function() {
                //this.up('window').hide();

                lc_disp("record",true);
              }
            },
            {
              xtype: 'button',
              iconCls: 'option',
              text:'修改',
              handler: function() {
                //this.up('window').hide();

                var grid = Ext.getCmp('lc_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  lc_disp(record,false);
                }else{
                  alert("请选择一个楼层进行修改。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'删除',
              handler: function() {
                var grid = Ext.getCmp('lc_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==0){
                  alert("请选择一个楼层进行删除。");

                }else{
                  var record = records[0];
                  var pars="id="+record.data.id;
                  Ext.Msg.confirm("提示信息","是否要删除楼层名称为：！"+record.data.lcmc+"的楼层？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/delete_zn_lc", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                Ext.getCmp('lc_setup_grid').store.url='/desktop/get_lc_grid';
                                Ext.getCmp('lc_setup_grid').store.load();
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
                Ext.getCmp('lc_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };  

      var fj_disp = function(record,add_new){
        var win = Ext.getCmp('fj_disp_win');

        //qz_store.load();
        if (win==null) {
          win = new Ext.Window({
            id : 'fj_disp_win',
            title: '修改房间信息',
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
              height: 140,
              xtype:'form',
              layout: 'absolute',
              id : 'fj_disp_form',
              items: [
                {
                  xtype: 'label',
                  text: '房间号：',
                  x: 10,
                  y: 10,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '房间说明：',
                  x: 10,
                  y: 40,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '所属楼宇：',
                  x: 10,
                  y: 70,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '所属楼层：',
                  x: 10,
                  y: 100,
                  width: 100
                },
                {
                  xtype: 'textfield',
                  hidden : true,
                  name : 'id' ,
                  id:'fj_id'                    
                },

                {
                  xtype: 'textfield',
                  x: 130,
                  y: 10,
                  width: 200,
                  name: 'fjmc',
                  id:'fj_fjmc'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 40,
                  width: 200,
                  name: 'fjsm',
                  id:'fj_fjsm'
                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 70,
                  width: 200,
                  store: ly_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'lymc',
                  triggerAction:'all',
                  name: 'ssly',
                  id:'fj_ssly',
                  listConfig: { loadMask: false },
                  listeners:{  
                    select:function(combo, record,index){

                  //userAdd = record.data.name;
                    var parent=Ext.getCmp('fj_sslc');

                    parent.clearValue();

                    parent.store.load({params:{param:this.value}});
                    //Ext.getCmp('fj_sslc').lastQuery = null;
                    }

                  }

                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 100,
                  width: 200,
                  store: lc_store,
                  emptyText:'请选择',
                  mode: 'local',
                  minChars : 2,
                  valueField:'id',
                  displayField:'lcmc',
                  triggerAction:'all',
                  listConfig: { loadMask: false },
                  name: 'sslc',
                  id:'fj_sslc'
                }

              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_qz_add',
                  text:'修改',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['fjmc']!=''){
                      if(pars['fjsm']!=''){
                        if(pars['ssly']!=''){
                          if(add_new==false){
                            new Ajax.Request("/desktop/update_zn_fj", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (request.responseText=='success'){

                                  Ext.getCmp('fj_disp_win').close();

                                  Ext.getCmp('fj_setup_grid').store.url='/desktop/get_zn_fj_grid';
                                  Ext.getCmp('fj_setup_grid').store.load();
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
                            new Ajax.Request("/desktop/insert_zn_fj", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (text[0]=='success'){

                                  Ext.getCmp('fj_disp_win').close();
                                  Ext.getCmp('fj_setup_grid').store.url='/desktop/get_zn_fj_grid';
                                  Ext.getCmp('fj_setup_grid').store.load();
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
                          alert("所属楼宇说明不能为空。");
                        }
                      }else{
                        alert("房间说明不能为空。");
                      }
                    }else{
                      alert("房间号不能为空。");
                    }
                  }
                },
                {
                  xtype: 'button',
                  iconCls: 'exit',
                  text:'退出',
                  handler: function() {
                    //this.up('window').hide();
                    Ext.getCmp('fj_disp_win').close();
                  }
                }]
            }]

          });
        }
        if(add_new==false){
        //设置数据
          Ext.getCmp('fj_disp_form').getForm().setValues(record.data);

        }else{
          Ext.getCmp('fj_disp_win').title="新增房间信息";
          Ext.getCmp('button_qz_add').text="新增";
          Ext.getCmp('button_qz_add').iconCls="add";
        }

        win.show();
      };

      var fj_setup = function(){
        var win = Ext.getCmp('fj_setup_win');

        Ext.regModel('fj_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'fjmc',    type: 'string'},
            {name: 'fjsm',    type: 'string'},
            {name: 'lymc',    type: 'string'},
            {name: 'ssly',    type: 'integer'},
            {name: 'lcmc',    type: 'string'},
            {name: 'sslc',    type: 'integer'}

          ]
        });

        var fj_setup_store = Ext.create('Ext.data.Store', {
          id:'fj_setup_store',
          model : 'fj_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_fj_grid',
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
        var fj_setup_grid = new Ext.grid.GridPanel({
          id : 'fj_setup_grid',
          store: fj_setup_store,        
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '房间号', width : 70, sortable : true, dataIndex: 'fjmc'},
            { text : '房间说明',  width : 250, sortable : true, dataIndex: 'fjsm'},
            { text : '所属楼层',  width : 100, sortable : true, dataIndex: 'lcmc'},
            { text : '所属楼宇',  width : 100, sortable : true, dataIndex: 'lymc'}
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
            id : 'fj_setup_win',
            title: '房间设置',
            //closeAction: 'hide',
            width: 670,
            x : 300,
            y : 50,
            height: 500,
            minHeight: 500,
            layout: 'fit',
            //modal: true,
            plain: true,
            items:fj_setup_grid,          
            tbar:[{
              xtype: 'button',
              iconCls: 'add',
              text:'新增',
              handler: function() {
                //this.up('window').hide();

                fj_disp("record",true);
              }
            },
            {
              xtype: 'button',
              iconCls: 'option',
              text:'修改',
              handler: function() {
                //this.up('window').hide();

                var grid = Ext.getCmp('fj_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  fj_disp(record,false);
                }else{
                  alert("请选择一个房间进行修改。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'删除',
              handler: function() {
                var grid = Ext.getCmp('fj_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==0){
                  alert("请选择一个房间进行删除。");

                }else{
                  var record = records[0];
                  var pars="id="+record.data.id;
                  Ext.Msg.confirm("提示信息","是否要删除房间号为：！"+record.data.fjmc+"的房间？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/delete_zn_fj", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                Ext.getCmp('fj_setup_grid').store.url='/desktop/get_fj_grid';
                                Ext.getCmp('fj_setup_grid').store.load();
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
                Ext.getCmp('fj_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };  

      var sb_disp = function(record,add_new){
        var win = Ext.getCmp('sb_disp_win');

        //qz_store.load();
        if (win==null) {
          win = new Ext.Window({
            id : 'sb_disp_win',
            title: '修改设备信息',
            //closeAction: 'hide',
            width: 370,
            height: 330,
            //minHeight: 200,
            layout: 'fit',
            modal: true,
            plain: true,
            //items:user_setup_grid,          
            items: [{
              width: 370,
              height: 330,
              xtype:'form',
              layout: 'absolute',
              id : 'sb_disp_form',
              items: [
                {
                  xtype: 'label',
                  text: '设备名称：',
                  x: 10,
                  y: 10,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '设备说明：',
                  x: 10,
                  y: 40,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '所属楼宇：',
                  x: 10,
                  y: 70,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '所属楼层：',
                  x: 10,
                  y: 100,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '所属房间：',
                  x: 10,
                  y: 130,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '设备类型：',
                  x: 10,
                  y: 160,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '设备号：',
                  x: 10,
                  y: 190,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '额定功率：',
                  x: 10,
                  y: 220,
                  width: 100
                },
                {
                  xtype: 'textfield',
                  hidden : true,
                  name : 'id' ,
                  id:'sb_id'                    
                },

                {
                  xtype: 'textfield',
                  x: 130,
                  y: 10,
                  width: 200,
                  name: 'sbmc',
                  id:'sb_sbmc'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 40,
                  width: 200,
                  name: 'sbsm',
                  id:'sb_sbsm'
                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 70,
                  width: 200,
                  store: ly_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'lymc',
                  triggerAction:'all',
                  name: 'ssly',
                  id:'sb_ssly',
                  listConfig: { loadMask: false },
                  listeners:{  
                    select:function(combo, record,index){

                  //userAdd = record.data.name;
                    var parent=Ext.getCmp('sb_sslc');

                    parent.clearValue();

                    parent.store.load({params:{param:this.value}});
                    //Ext.getCmp('fj_sslc').lastQuery = null;
                    }

                  }

                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 100,
                  width: 200,
                  store: lc_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'lcmc',
                  triggerAction:'all',
                  listConfig: { loadMask: false },
                  listeners:{  
                    select:function(combo, record,index){
                  //userAdd = record.data.name;
                    var parent=Ext.getCmp('sb_ssfj');
                    parent.clearValue();
                    parent.store.load({params:{param:this.value}});
                    //Ext.getCmp('fj_sslc').lastQuery = null;
                    }
                  },
                  name: 'sslc',
                  id:'sb_sslc'
                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 130,
                  width: 200,
                  store: fj_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'fjmc',
                  triggerAction:'all',
                  listConfig: { loadMask: false },
                  name: 'ssfj',
                  id:'sb_ssfj'
                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 160,
                  width: 200,
                  store: sblx_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'lxsm',
                  triggerAction:'all',
                  listConfig: { loadMask: false },
                  name: 'sblx',
                  id:'sb_sblx'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 190,
                  width: 200,
                  name: 'sbh',
                  id:'sb_sbh'
                },
                {
                  xtype: 'textfield',
                  x: 130,
                  y: 220,
                  width: 200,
                  name: 'edgl',
                  id:'sb_edgl'
                }
                


              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_qz_add',
                  text:'修改',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['sbmc']!=''){
                      if(pars['sbsm']!=''){
                        if(pars['sbly']!=''){
                          if(add_new==false){
                            new Ajax.Request("/desktop/update_zn_sb", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (request.responseText=='success'){

                                  Ext.getCmp('sb_disp_win').close();

                                  Ext.getCmp('sb_setup_grid').store.url='/desktop/get_zn_sb_grid';
                                  Ext.getCmp('sb_setup_grid').store.load();
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
                            new Ajax.Request("/desktop/insert_zn_sb", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (text[0]=='success'){

                                  Ext.getCmp('sb_disp_win').close();
                                  Ext.getCmp('sb_setup_grid').store.url='/desktop/get_zn_sb_grid';
                                  Ext.getCmp('sb_setup_grid').store.load();
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
                          alert("所属楼宇不能为空。");
                        }
                      }else{
                        alert("设备说明不能为空。");
                      }
                    }else{
                      alert("设备名称不能为空。");
                    }
                  }
                },
                {
                  xtype: 'button',
                  iconCls: 'exit',
                  text:'退出',
                  handler: function() {
                    //this.up('window').hide();
                    Ext.getCmp('sb_disp_win').close();
                  }
                }]
            }]

          });
        }
        if(add_new==false){
        //设置数据
          Ext.getCmp('sb_disp_form').getForm().setValues(record.data);

        }else{
          Ext.getCmp('sb_disp_win').title="新增设备信息";
          Ext.getCmp('button_qz_add').text="新增";
          Ext.getCmp('button_qz_add').iconCls="add";
        }

        win.show();
      };

      var sb_setup = function(){
        var win = Ext.getCmp('sb_setup_win');

        Ext.regModel('sb_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'sbmc',    type: 'string'},
            {name: 'sbsm',    type: 'string'},
            {name: 'lymc',    type: 'string'},
            {name: 'ssly',    type: 'integer'},
            {name: 'lcmc',    type: 'string'},
            {name: 'sslc',    type: 'integer'},
            {name: 'fjmc',    type: 'string'},
            {name: 'ssfj',    type: 'integer'},
            {name: 'kzl',   type: 'string'},
            {name: 'sbh',   type: 'string'},
            {name: 'gzl',   type: 'string'},
            {name: 'edgl',    type: 'string'},
            {name: 'sblx',    type: 'integer'}

          ]
        });

        var sb_setup_store = Ext.create('Ext.data.Store', {
          id:'sb_setup_store',
          model : 'sb_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_sb_grid',
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
        var sb_setup_grid = new Ext.grid.GridPanel({
          id : 'sb_setup_grid',
          store: sb_setup_store,        
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '设备名称',  width : 70, sortable : true, dataIndex: 'sbmc'},
            { text : '设备说明',  width : 250, sortable : true, dataIndex: 'sbsm'},
            { text : '所属房间',  width : 100, sortable : true, dataIndex: 'fjmc'},
            { text : '所属楼层',  width : 100, sortable : true, dataIndex: 'lcmc'},
            { text : '所属楼宇',  width : 100, sortable : true, dataIndex: 'lymc'},
            { text : '设备号', width : 100, sortable : true, dataIndex: 'sbh'},
            { text : '额定功率',  width : 100, sortable : true, dataIndex: 'edgl'},
            { text : '设备类型',  width : 100, sortable : true, dataIndex: 'sblx'}
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
            id : 'sb_setup_win',
            title: '设备设置',
            //closeAction: 'hide',
            width: 670,
            x : 300,
            y : 50,
            height: 500,
            minHeight: 500,
            layout: 'fit',
            //modal: true,
            plain: true,
            items:sb_setup_grid,          
            tbar:[{
              xtype: 'button',
              iconCls: 'add',
              text:'新增',
              handler: function() {
                //this.up('window').hide();

                sb_disp("record",true);
              }
            },

            {
              xtype: 'button',
              iconCls: 'option',
              text:'修改',
              handler: function() {
                //this.up('window').hide();

                var grid = Ext.getCmp('sb_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  sb_disp(record,false);
                }else{
                  alert("请选择一个设备进行修改。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'删除',
              handler: function() {
                var grid = Ext.getCmp('sb_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==0){
                  alert("请选择一个设备进行删除。");

                }else{
                  var record = records[0];
                  var pars="id="+record.data.id;
                  Ext.Msg.confirm("提示信息","是否要删除设备名称为：！"+record.data.sbmc+"的设备？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/delete_zn_sb", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                Ext.getCmp('sb_setup_grid').store.url='/desktop/get_sb_grid';
                                Ext.getCmp('sb_setup_grid').store.load();
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
                Ext.getCmp('sb_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };  

      var qjms_disp = function(record,add_new){
        var win = Ext.getCmp('qjms_disp_win');

        //qz_store.load();
        if (win==null) {
          win = new Ext.Window({
            id : 'qjms_disp_win',
            title: '修改情景模式',
            //closeAction: 'hide',
            width: 370,
            height: 150,
            //minHeight: 200,
            layout: 'fit',
            modal: true,
            plain: true,
            //items:user_setup_grid,          
            items: [{
              width: 370,
              height: 150,
              xtype:'form',
              layout: 'absolute',
              id : 'qjms_disp_form',
              items: [
                {
                  xtype: 'label',
                  text: '情景模式名称：',
                  x: 10,
                  y: 10,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '所属人员：',
                  x: 10,
                  y: 40,
                  width: 100
                },
                {
                  xtype: 'textfield',
                  hidden : true,
                  name : 'id' ,
                  id:'qjms_id'                    
                },

                {
                  xtype: 'textfield',
                  x: 130,
                  y: 10,
                  width: 200,
                  name: 'msmc',
                  id:'qjms_msmc'
                },
                
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 40,
                  width: 200,
                  store: user_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'username',
                  triggerAction:'all',
                  name: 'userid',
                  id:'qjms_userid'

                }


              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_qz_add',
                  text:'修改',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['sbmc']!=''){
                      if(pars['sbsm']!=''){
                        if(pars['sbly']!=''){
                          if(add_new==false){
                            new Ajax.Request("/desktop/update_zn_qjms", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (request.responseText=='success'){

                                  Ext.getCmp('qjms_disp_win').close();

                                  Ext.getCmp('qjms_setup_grid').store.url='/desktop/get_zn_qjms_grid';
                                  Ext.getCmp('qjms_setup_grid').store.load();
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
                            new Ajax.Request("/desktop/insert_zn_qjms", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (text[0]=='success'){

                                  Ext.getCmp('qjms_disp_win').close();
                                  Ext.getCmp('qjms_setup_grid').store.url='/desktop/get_zn_qjms_grid';
                                  Ext.getCmp('qjms_setup_grid').store.load();
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
                          alert("所属楼宇不能为空。");
                        }
                      }else{
                        alert("设备说明不能为空。");
                      }
                    }else{
                      alert("设备名称不能为空。");
                    }
                  }
                },
                {
                  xtype: 'button',
                  iconCls: 'exit',
                  text:'退出',
                  handler: function() {
                    //this.up('window').hide();
                    Ext.getCmp('qjms_disp_win').close();
                  }
                }]
            }]

          });
        }
        if(add_new==false){
        //设置数据
          Ext.getCmp('qjms_disp_form').getForm().setValues(record.data);

        }else{
          Ext.getCmp('qjms_disp_win').title="新增情景模式";
          Ext.getCmp('button_qz_add').text="新增";
          Ext.getCmp('button_qz_add').iconCls="add";
        }

        win.show();
      };
      var qjms_setup = function(){
        var win = Ext.getCmp('qjms_setup_win');

        Ext.regModel('qjms_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'msmc',    type: 'string'},
            {name: 'userid',    type: 'integer'},
            {name: 'username',    type: 'string'}
            

          ]
        });

        var qjms_setup_store = Ext.create('Ext.data.Store', {
          id:'qjms_setup_store',
          model : 'qjms_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_qjms_grid',
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
        var qjms_setup_grid = new Ext.grid.GridPanel({
          id : 'qjms_setup_grid',
          store: qjms_setup_store,        
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '情景模式名称',  width : 100, sortable : true, dataIndex: 'msmc'},
            { text : '所属人员',  width : 150, sortable : true, dataIndex: 'username'}
            
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
            id : 'qjms_setup_win',
            title: '情景模式名称设置',
            //closeAction: 'hide',
            width: 670,
            x : 300,
            y : 50,
            height: 500,
            minHeight: 500,
            layout: 'fit',
            //modal: true,
            plain: true,
            items:qjms_setup_grid,          
            tbar:[{
              xtype: 'button',
              iconCls: 'add',
              text:'新增',
              handler: function() {
                //this.up('window').hide();

                qjms_disp("record",true);
              }
            },

            {
              xtype: 'button',
              iconCls: 'option',
              text:'修改',
              handler: function() {
                //this.up('window').hide();

                var grid = Ext.getCmp('qjms_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  qjms_disp(record,false);
                }else{
                  alert("请选择一个情景模式进行修改。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'删除',
              handler: function() {
                var grid = Ext.getCmp('qjms_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==0){
                  alert("请选择一个情景模式进行删除。");

                }else{
                  var record = records[0];
                  var pars="id="+record.data.id;
                  Ext.Msg.confirm("提示信息","是否要删除情景模式名称为：！"+record.data.fjmc+"的情景模式？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/delete_qjms", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                Ext.getCmp('qjms_setup_grid').store.url='/desktop/get_qjms_grid';
                                Ext.getCmp('qjms_setup_grid').store.load();
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
                Ext.getCmp('qjms_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };  


      var qjms_sb_cz_setup = function(){
        var win = Ext.getCmp('qjms_sb_cz_setup_win');

        Ext.regModel('qjms_sb_cz_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'sbmc',    type: 'string'},
            {name: 'sbid',    type: 'integer'},
            {name: 'qjmsid',    type: 'integer'},
            {name: 'sbczid',    type: 'integer'},
            {name: 'czsm',    type: 'string'},
            {name: 'msmc',    type: 'string'}

          ]
        });

        var qjms_sb_cz_setup_store = Ext.create('Ext.data.Store', {
          id:'qjms_sb_cz_setup_store',
          model : 'qjms_sb_cz_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_zn_qjms_sb_cz_grid',
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
        var qjms_sb_cz_setup_grid = new Ext.grid.GridPanel({
          id : 'qjms_sb_cz_setup_grid',
          store: qjms_sb_cz_setup_store,        
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '设备名称',  width : 70, sortable : true, dataIndex: 'sbmc'},
            { text : '操作说明',  width : 70, sortable : true, dataIndex: 'czsm'},
            { text : '情景模式',  width : 100, sortable : true, dataIndex: 'msmc'}
            
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

        var qjms_tree_store = Ext.create('Ext.data.TreeStore', {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'desktop/get_qjms_tree',
                extraParams: {userid:currentUser.id},
                actionMethods: 'POST'
            }
        }); 
        var qjms_tree_panel = Ext.create('Ext.tree.Panel', {
          id : 'qjms_tree_panel',
          store: qjms_tree_store,
          rootVisible:false,
          useArrows: true,
          singleExpand: true,
          width: 200,
          listeners:{
            checkchange:function(node,checked,option){
              if(checked){
                root=Ext.getCmp('qjms_tree_panel').store.getRootNode();     
                getNodes(root,false);
                node.data.checked=true;
                node.updateInfo({checked:true});
                data=node.data;
                qjms_id=data.id;
                qjms_name=data.text;
                Ext.getCmp('qjms_sb_cz_setup_grid').store.proxy.extraParams.query=  data.id;
                Ext.getCmp('qjms_sb_cz_setup_grid').store.proxy.extraParams.userid= currentUser.id;
                Ext.getCmp('qjms_sb_cz_setup_grid').store.url='/desktop/get_zn_qjms_sb_cz_grid';
                Ext.getCmp('qjms_sb_cz_setup_grid').store.load();
              }
            }
          }
        });
      
        if (win==null) {
          win = new Ext.Window({
            id : 'qjms_sb_cz_setup_win',
            title: '情景模式设备操作设置',
            x : 300,
            y : 50,
            width: 670,
            height: 500,
            minHeight: 500,
            layout: 'border',
            //modal: true,
            plain: true,          
            items: [
              { title:'情景模式树',
                region:'west',
                iconCls:'users',
                xtype:'panel',
                margins:'0 0 0 0',
                width: 200,
                collapsible:true,//可以被折叠              
                layout:'fit',
                split:true,
                items:qjms_tree_panel

              },
              { title:'设备操作列表',
                region:'center',
                iconCls:'dept_tree',
                xtype:'panel',
                margins:'0 0 0 0',
                //width: 250,
                //collapsible:true,//可以被折叠            
                //id:'user-qx-tree',
                layout:'fit',
                split:true,
                items:qjms_sb_cz_setup_grid
              }
            ],

            tbar:[{
              xtype: 'button',
              iconCls: 'add',
              text:'新增设备操作',
              handler: function() {
                //this.up('window').hide();

                qjms_sb_cz_disp("record",true);
              }
            },

            {
              xtype: 'button',
              iconCls: 'option',
              text:'修改设备操作',
              handler: function() {
                //this.up('window').hide();

                var grid = Ext.getCmp('qjms_sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  qjms_sb_cz_disp(record,false);
                }else{
                  alert("请选择一个设备操作进行修改。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'删除设备操作',
              handler: function() {
                var grid = Ext.getCmp('qjms_sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==0){
                  alert("请选择一个设备操作进行删除。");

                }else{
                  var record = records[0];
                  var pars="id="+record.data.id;
                  Ext.Msg.confirm("提示信息","是否要删除设备名称为：！"+record.data.sbmc+"的" + record.data.czsm + "操作？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/delete_zn_qjms_sb_cz", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                Ext.getCmp('qjms_sb_cz_setup_grid').store.url='/desktop/get_zn_qjms_sb_cz_grid';
                                Ext.getCmp('qjms_sb_cz_setup_grid').store.load();
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
                          //alert('O,no');
                        }

                    });
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'save',
              text:'运行情景模式',
              handler: function() {
                var grid = Ext.getCmp('qjms_sb_cz_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (qjms_id==""){
                  alert("请选择一个情意模式进行操作。");

                }else{
                  Ext.Msg.confirm("提示信息","是否要开启名称为：！"+qjms_name+"的情景模式？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/insert_zn_sb_cz", { 
                            method: "POST",
                            parameters: {qjms_id:qjms_id},
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                alert("正在开启。");
                              }else{
                                if (text[0]=='false'){
                                  alert(text[1]);
                                }else{
                                  alert("开启失败。");
                                }

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
                Ext.getCmp('qjms_sb_cz_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };

      var qjms_sb_cz_disp = function(record,add_new){
        var win = Ext.getCmp('qjms_sb_cz_disp_win');

        //qz_store.load();
        if (win==null) {
          win = new Ext.Window({
            id : 'qjms_sb_cz_disp_win',
            title: '修改情景模式设备操作',
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
              height: 140,
              xtype:'form',
              layout: 'absolute',
              id : 'qjms_sb_cz_disp_form',
              items: [
                {
                  xtype: 'label',
                  text: '情景模式名称：',
                  x: 10,
                  y: 10,
                  width: 100
                },
                
                {
                  xtype: 'label',
                  text: '设备名称：',
                  x: 10,
                  y: 40,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '设备操作：',
                  x: 10,
                  y: 70,
                  width: 100
                },
                {
                  xtype: 'textfield',
                  hidden : true,
                  name : 'id' ,
                  id:'qjms_sb_cz_id'                    
                },

                
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 10,
                  width: 200,
                  store: qjms_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'msmc',
                  //triggerAction:'all',
                  listConfig: { loadMask: false },
                  name: 'qjmsid',
                  id:'qjms_sb_cz_qjmsid'
                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 40,
                  width: 200,
                  store: sb_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'sbid',
                  displayField:'sbmc',
                  triggerAction:'all',
                  name: 'sbid',
                  id:'qjms_sb_cz_sbid',
                  listConfig: { loadMask: false },
                  listeners:{  
                    select:function(combo, record,index){

                  //userAdd = record.data.name;
                    var parent=Ext.getCmp('qjms_sb_cz_sbczid');

                    parent.clearValue();

                    parent.store.load({params:{sbid:this.value}});
                    //Ext.getCmp('fj_sslc').lastQuery = null;
                    }

                  }

                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 70,
                  width: 200,
                  store: sb_cz_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'czid',
                  displayField:'czsm',
                  triggerAction:'all',
                  listConfig: { loadMask: false },
                  name: 'sbczid',
                  id:'qjms_sb_cz_sbczid'
                }

              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_qz_add',
                  text:'修改',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['sbczid']!=''){
                      if(pars['sbid']!=''){
                        if(pars['qjmsid']!=''){
                          if(add_new==false){
                            new Ajax.Request("/desktop/update_zn_qjms_sb_cz", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (request.responseText=='success'){

                                  Ext.getCmp('qjms_sb_cz_disp_win').close();

                                  Ext.getCmp('qjms_sb_cz_setup_grid').store.url='/desktop/get_zn_qjms_sb_cz_grid';
                                  Ext.getCmp('qjms_sb_cz_setup_grid').store.load();
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
                            new Ajax.Request("/desktop/insert_zn_qjms_sb_cz", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (text[0]=='success'){

                                  Ext.getCmp('qjms_sb_cz_disp_win').close();
                                  Ext.getCmp('qjms_sb_cz_setup_grid').store.url='/desktop/get_zn_qjms_sb_cz_grid';
                                  Ext.getCmp('qjms_sb_cz_setup_grid').store.load();
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
                          alert("情景模式不能为空。");
                        }
                      }else{
                        alert("设备不能为空。");
                      }
                    }else{
                      alert("设备操作不能为空。");
                    }
                  }
                },
                {
                  xtype: 'button',
                  iconCls: 'exit',
                  text:'退出',
                  handler: function() {
                    //this.up('window').hide();
                    Ext.getCmp('qjms_sb_cz_disp_win').close();
                  }
                }]
            }]

          });
        }
        if(add_new==false){
        //设置数据
          Ext.getCmp('qjms_sb_cz_disp_form').getForm().setValues(record.data);

        }else{
          Ext.getCmp('qjms_sb_cz_disp_win').title="新增情景模式设备操作";
          Ext.getCmp('button_qz_add').text="新增";
          Ext.getCmp('button_qz_add').iconCls="add";
        }

        win.show();
      };


      var cz_rz_setup = function(){
        var win = Ext.getCmp('cz_rz_setup_win');

        Ext.regModel('cz_rz_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'czsm',    type: 'string'},
            {name: 'czid',    type: 'integer'},
            {name: 'userid',    type: 'integer'},
            {name: 'sbmc',    type: 'string'},
            {name: 'wdz',   type: 'string'},
            {name: 'sdz',   type: 'string'},
            {name: 'dlz',   type: 'string'},
            {name: 'fjmc',    type: 'string'},
            {name: 'lcmc',    type: 'string'},
            {name: 'lymc',    type: 'string'},
            {name: 'rq',    type: 'date', dateFormat: 'Y-m-d H:i:s'}

          ]
        });

        var cz_rz_setup_store = Ext.create('Ext.data.Store', {
          id:'cz_rz_setup_store',
          model : 'cz_rz_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_cz_rz_grid',
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
        var cz_rz_setup_grid = new Ext.grid.GridPanel({
          id : 'cz_rz_setup_grid',
          store: cz_rz_setup_store,       
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '操作说明',  width : 100, sortable : true, dataIndex: 'czsm',renderer:ztRender},
            { text : '设备名称',  width : 150, sortable : true, dataIndex: 'sbmc'},
            { text : '房间名称',  width : 50, sortable : true, dataIndex: 'fjmc'},
            { text : '楼层名称',  width : 50, sortable : true, dataIndex: 'lcmc'},
            { text : '楼宇名称',  width : 100, sortable : true, dataIndex: 'lymc'},         
            { text : '温度值', width : 50, sortable : true, dataIndex: 'wdz'},
            { text : '湿度值', width : 50, sortable : true, dataIndex: 'sdz'},
            { text : '电流值', width : 50, sortable : true, dataIndex: 'dlz'},
            { text : '日期',  width : 150, sortable : true, dataIndex: 'rq', renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s')}
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
            id : 'cz_rz_setup_win',
            title: '设备操作日志',
            //closeAction: 'hide',
            width: 670,
            x : 300,
            y : 50,
            height: 500,
            minHeight: 500,
            layout: 'fit',
            //modal: true,
            plain: true,
            items:cz_rz_setup_grid,         
            tbar:[{
              xtype: 'button',
              iconCls: 'add',
              text:'新增',
              handler: function() {
                //this.up('window').hide();

                ly_disp("record",true);
              }
            },
            {
              xtype: 'button',
              iconCls: 'option',
              text:'修改',
              handler: function() {
                //this.up('window').hide();

                var grid = Ext.getCmp('ly_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  ly_disp(record,false);
                }else{
                  alert("请选择一个楼宇进行修改。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'删除',
              handler: function() {
                var grid = Ext.getCmp('ly_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==0){
                  alert("请选择一个楼宇进行删除。");

                }else{
                  var record = records[0];
                  var pars="id="+record.data.id;
                  Ext.Msg.confirm("提示信息","是否要删除楼宇名称为：！"+record.data.lymc+"的楼宇？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/delete_zn_ly", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                Ext.getCmp('ly_setup_grid').store.url='/desktop/get_ly_grid';
                                Ext.getCmp('ly_setup_grid').store.load();
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
                Ext.getCmp('cz_rz_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };  


      var sb_nx_setup = function(){
        var win = Ext.getCmp('sb_nx_setup_win');

        Ext.regModel('sb_nx_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'czsm',    type: 'string'},
            {name: 'czid',    type: 'integer'},
            {name: 'sbid',    type: 'integer'},
            {name: 'nxdj',    type: 'integer'},
            {name: 'sbmc',    type: 'string'}
            

          ]
        });

        var sb_nx_setup_store = Ext.create('Ext.data.Store', {
          id:'sb_nx_setup_store',
          model : 'sb_nx_setup_model',
          autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_sb_nx_grid',
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
        var sb_nx_setup_grid = new Ext.grid.GridPanel({
          id : 'sb_nx_setup_grid',
          store: sb_nx_setup_store,       
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
            { text : '操作说明',  width : 100, sortable : true, dataIndex: 'czsm',renderer:ztRender},
            { text : '设备名称',  width : 150, sortable : true, dataIndex: 'sbmc'},
            { text : '轮巡等级',  width : 50, sortable : true, dataIndex: 'nxdj'}
            
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
            id : 'sb_nx_setup_win',
            title: '设备轮巡设置',
            //closeAction: 'hide',
            width: 670,
            x : 300,
            y : 50,
            height: 500,
            minHeight: 500,
            layout: 'fit',
            //modal: true,
            plain: true,
            items:sb_nx_setup_grid,         
            tbar:[{
              xtype: 'button',
              iconCls: 'add',
              text:'新增',
              handler: function() {
                //this.up('window').hide();

                sb_nx_disp("record",true);
              }
            },
            {
              xtype: 'button',
              iconCls: 'option',
              text:'修改',
              handler: function() {
                //this.up('window').hide();

                var grid = Ext.getCmp('sb_nx_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==1){
                  var record = records[0];
                  sb_nx_disp(record,false);
                }else{
                  alert("请选择一个设备轮巡进行修改。");
                }
              }
            },
            {
              xtype: 'button',
              iconCls: 'delete',
              text:'删除',
              handler: function() {
                var grid = Ext.getCmp('sb_nx_setup_grid');
                var records = grid.getSelectionModel().getSelection();
                if (records.length==0){
                  alert("请选择一个设备轮巡进行删除。");

                }else{
                  var record = records[0];
                  var pars="id="+record.data.id;
                  Ext.Msg.confirm("提示信息","是否要把名称为："+record.data.sbmc+"从轮巡中的删除？",function callback(id){
                        if(id=="yes"){
                          new Ajax.Request("/desktop/delete_sb_nx", { 
                            method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              text=request.responseText.split(':');
                              if (request.responseText=='success'){
                                Ext.getCmp('sb_nx_setup_grid').store.url='/desktop/get_sb_nx_grid';
                                Ext.getCmp('sb_nx_setup_grid').store.load();
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
                Ext.getCmp('sb_nx_setup_win').close();
              }
            }]

          });
        }


        win.show();
      };  
      var sb_nx_disp = function(record,add_new){
        var win = Ext.getCmp('sb_nx_disp_win');

        //qz_store.load();
        if (win==null) {
          win = new Ext.Window({
            id : 'sb_nx_disp_win',
            title: '修改设备轮巡操作',
            //closeAction: 'hide',
            width: 370,
            height: 170,
            //minHeight: 200,
            layout: 'fit',
            modal: true,
            plain: true,
            //items:user_setup_grid,          
            items: [{
              width: 370,
              height: 170,
              xtype:'form',
              layout: 'absolute',
              id : 'sb_nx_disp_form',
              items: [
                
                
                {
                  xtype: 'label',
                  text: '设备名称：',
                  x: 10,
                  y: 10,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '设备操作：',
                  x: 10,
                  y: 40,
                  width: 100
                },
                {
                  xtype: 'label',
                  text: '轮巡等级：',
                  x: 10,
                  y: 70,
                  width: 100
                },
                {
                  xtype: 'textfield',
                  hidden : true,
                  name : 'id' ,
                  id:'sb_nx_id'                   
                },

                
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 10,
                  width: 200,
                  store: sb_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'sbid',
                  displayField:'sbmc',
                  triggerAction:'all',
                  name: 'sbid',
                  id:'sb_nx_sbid',
                  listConfig: { loadMask: false },
                  listeners:{  
                    select:function(combo, record,index){

                  //userAdd = record.data.name;
                    var parent=Ext.getCmp('sb_nx_sbczid');

                    parent.clearValue();

                    parent.store.load({params:{sbid:this.value}});
                    //Ext.getCmp('fj_sslc').lastQuery = null;
                    }

                  }

                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 40,
                  width: 200,
                  store: sb_cz_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'czid',
                  displayField:'czsm',
                  triggerAction:'all',
                  listConfig: { loadMask: false },
                  name: 'sbczid',
                  id:'sb_nx_sbczid'
                },
                {
                  xtype: 'combobox',
                  x: 130,
                  y: 70,
                  width: 200,
                  store: sb_nxdj_store,
                  emptyText:'请选择',
                  mode: 'remote',
                  minChars : 2,
                  valueField:'id',
                  displayField:'text',
                  triggerAction:'all',
                  listConfig: { loadMask: false },
                  name: 'nxdj',
                  id:'sb_nx_nxdj'
                }

              ],
              buttons:[{
                  xtype: 'button',
                  iconCls: 'option',
                  id:'button_qz_add',
                  text:'修改',
                  handler: function() {
                    var pars=this.up('panel').getForm().getValues();
                    if(pars['sbczid']!=''){
                      if(pars['sbid']!=''){
                        
                          if(add_new==false){
                            new Ajax.Request("/desktop/update_sb_nx", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (request.responseText=='success'){

                                  Ext.getCmp('sb_nx_disp_win').close();

                                  Ext.getCmp('sb_nx_setup_grid').store.url='/desktop/get_sb_nx_grid';
                                  Ext.getCmp('sb_nx_setup_grid').store.load();
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
                            new Ajax.Request("/desktop/insert_sb_nx", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {
                                text=request.responseText.split(':');
                                if (text[0]=='success'){

                                  Ext.getCmp('sb_nx_disp_win').close();
                                  Ext.getCmp('sb_nx_setup_grid').store.url='/desktop/get_sb_nx_grid';
                                  Ext.getCmp('sb_nx_setup_grid').store.load();
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
                        alert("设备不能为空。");
                      }
                    }else{
                      alert("设备操作不能为空。");
                    }
                  }
                },
                {
                  xtype: 'button',
                  iconCls: 'exit',
                  text:'退出',
                  handler: function() {
                    //this.up('window').hide();
                    Ext.getCmp('sb_nx_disp_win').close();
                  }
                }]
            }]

          });
        }
        if(add_new==false){
        //设置数据
          Ext.getCmp('sb_nx_disp_form').getForm().setValues(record.data);

        }else{
          Ext.getCmp('sb_nx_disp_win').title="新增轮巡设备操作";
          Ext.getCmp('button_qz_add').text="新增";
          Ext.getCmp('button_qz_add').iconCls="add";
        }

        win.show();
      };

      var sb_gl_tj_setup = function(){
        var win = Ext.getCmp('sb_gl_tj_setup_win');
        tjxl=0;
        Ext.regModel('sb_gl_tj_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'edgl',    type: 'integer'},
            {name: 'czsm',    type: 'string'},
            {name: 'czid',    type: 'integer'},
            {name: 'id',    type: 'integer'},
            {name: 'userid',    type: 'integer'},
            {name: 'sbmc',    type: 'string'},
            {name: 'shgl',    type: 'string'},
            {name: 'wdz',   type: 'string'},
            {name: 'sdz',   type: 'string'},
            {name: 'dlz',   type: 'string'},
            {name: 'fjmc',    type: 'string'},
            {name: 'lcmc',    type: 'string'},
            {name: 'lymc',    type: 'string'},
            {name: 'zsj',   type: 'string',stringFormat: '0.00'},
            {name: 'rq',    type: 'date', dateFormat: 'Y-m-d H:i:s'}
          ]
        });

        var sb_gl_tj_setup_store = Ext.create('Ext.data.Store', {
          id:'sb_gl_tj_setup_store',
          model : 'sb_gl_tj_setup_model',
          //autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_sb_gl_tj_grid',
            //extraParams: cx_tj,
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }
        });
        var sb_gl_tj_setup_grid = new Ext.grid.GridPanel({
          id : 'sb_gl_tj_setup_grid',
          store: sb_gl_tj_setup_store,        
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},           
            { text : '名称',  width : 150, sortable : true, dataIndex: 'sbmc'},
            { text : '所耗功率',  width : 50, sortable : true, dataIndex: 'shgl'},
            { text : '使用时间',  width : 50, sortable : true, dataIndex: 'zsj'},
            { text : '额定功率',  width : 50, sortable : true, dataIndex: 'edgl'},
            { text : '房间名称',  width : 50, sortable : true, dataIndex: 'fjmc'},
            { text : '楼层名称',  width : 50, sortable : true, dataIndex: 'lcmc'},
            { text : '楼宇名称',  width : 100, sortable : true, dataIndex: 'lymc'}        
            
            ],
            selType:'checkboxmodel',
            //multiSelect:true,
            listeners:{
              itemdblclick:{
                fn:function(v,r,i,n,e,b){
                    Ext.getCmp("chartCmp").axes.items[0].title="功率（瓦）";
                    Ext.getCmp("chartCmp").axes.items[1].title="";
                    sb_gl_tj_zz_store.proxy.extraParams={gl:r.get('shgl')+','+r.get('edgl')
                  }
                  sb_gl_tj_zz_store.load();
                }
              }
            },

          viewConfig: {
            stripeRows:true
          }
        });
        Ext.regModel('sb_kg_tj_setup_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            {name: 'czsm',    type: 'string'},
            {name: 'czid',    type: 'integer'},
            {name: 'id',    type: 'integer'},
            {name: 'userid',    type: 'integer'},
            {name: 'sbmc',    type: 'string'},
            {name: 'shgl',    type: 'string'},
            {name: 'kgcs',    type: 'integer'},
            {name: 'wdz',   type: 'string'},
            {name: 'sdz',   type: 'string'},
            {name: 'dlz',   type: 'string'},
            {name: 'fjmc',    type: 'string'},
            {name: 'lcmc',    type: 'string'},
            {name: 'lymc',    type: 'string'},
            {name: 'zsj',   type: 'string',stringFormat: '0.00'},
            {name: 'rq',    type: 'date', dateFormat: 'Y-m-d H:i:s'}
          ]
        });

        var sb_kg_tj_setup_store = Ext.create('Ext.data.Store', {
          id:'sb_kg_tj_setup_store',
          model : 'sb_kg_tj_setup_model',
          //autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_sb_kg_tj_grid',
            //extraParams: cx_tj,
            reader: {
              type: 'json',
              root: 'rows',
              totalProperty: 'results'
            }
          }
        });
        var sb_kg_tj_setup_grid = new Ext.grid.GridPanel({
          id : 'sb_kg_tj_setup_grid',
          store: sb_kg_tj_setup_store,        
          columns: [
            { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},           
            { text : '设备名称',  width : 150, sortable : true, dataIndex: 'sbmc'},
            { text : '开关次数',  width : 50, sortable : true, dataIndex: 'kgcs'},
            
            { text : '房间名称',  width : 50, sortable : true, dataIndex: 'fjmc'},
            { text : '楼层名称',  width : 50, sortable : true, dataIndex: 'lcmc'},
            { text : '楼宇名称',  width : 100, sortable : true, dataIndex: 'lymc'}        
            
            ],
            selType:'checkboxmodel',
            //multiSelect:true,
            listeners:{
              itemdblclick:{
                fn:function(v,r,i,n,e,b){
                  //var tt=r.get("zrq");
                  if (Ext.getCmp("sb_gl_tj_zrq").rawValue!=''){
                    if (Ext.getCmp("sb_gl_tj_qrq").rawValue!=''){
                      Ext.getCmp("chartCmp").axes.items[0].title="开关次数";
                      Ext.getCmp("chartCmp").axes.items[1].title="时间（小时）";
                      sb_gl_tj_zz_store.proxy.extraParams={qrq:Ext.getCmp("sb_gl_tj_qrq").rawValue,zrq:Ext.getCmp("sb_gl_tj_zrq").rawValue,sbid:r.get('id')}
                      sb_gl_tj_zz_store.load();
                    }else{
                      alert("起日期不能为空。");
                    }
                  }else{
                    alert("止日期不能为空。");
                  } 
                }
              }
            },

          viewConfig: {
            stripeRows:true
          }
        });
        Ext.regModel('sb_gl_tj_zz_model', {
          fields: [
            {name: 'id',    type: 'integer'},
            
            {name: 'name',    type: 'string'},
            {name: 'data1',   type: 'string'},
            {name: 'data2',   type: 'string'},
            {name: 'data3',   type: 'string'},
            {name: 'userid',    type: 'integer'},
            {name: 'sbmc',    type: 'string'},
            {name: 'shgl',    type: 'string'},
            {name: 'wdz',   type: 'string'},
            {name: 'sdz',   type: 'string'},
            {name: 'dlz',   type: 'string'},
            {name: 'fjmc',    type: 'string'},
            {name: 'lcmc',    type: 'string'},
            {name: 'lymc',    type: 'string'},
            {name: 'zsj',   type: 'string',stringFormat: '0.00'},
            {name: 'rq',    type: 'date', dateFormat: 'Y-m-d H:i:s'}

          ]
        });
        var sb_gl_tj_zz_store = Ext.create('Ext.data.Store', {
          id:'sb_gl_tj_zz_store',
          model : 'sb_gl_tj_zz_model',
          //autoLoad: true,
          proxy: {
            type: 'ajax',
            url : '/desktop/get_sb_gl_dj_zz_grid',
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
        var sb_gl_tj_tab = Ext.createWidget('tabpanel', {
              
              activeTab: 0,
              width: 600,
              height: 250,
          margins:'5 2 5 5',
              plain: true,
              defaults :{
                  autoScroll: true,
                  bodyPadding: 10
              },
              items: [{
                      title: '设备功率统计',
              margins:'5 2 5 5',
                      items:sb_gl_tj_setup_grid,
              listeners: {
                          activate: function(tab){
                              tjlx=0;
                          }
                      }
                  },{
                      title: '设备开关统计',
                      items:sb_kg_tj_setup_grid,
                      listeners: {
                          activate: function(tab){
                              tjlx=1;
                          }
                      }
                  }
              ]
          });
        if (win==null) {
          win = new Ext.Window({
            id : 'sb_gl_tj_setup_win',
            title: '设备功率统计',
            //closeAction: 'hide',
            width: 670,
            x : 300,
            y : 50,
            height: 500,
            minHeight: 500,
            layout: 'border',
            //modal: true,
            plain: true,
            items:[
              {
                region: 'center',
                iconCls:'icon-grid',
                layout: 'fit',
                height: 150,
                split: true,
                collapsible: true,
                title: '设备能耗统计图（绿色：传统能耗，蓝色：实际能耗，红色：减少的碳排放）',
                items: {
                        id: 'chartCmp',
                        xtype: 'chart',
                        style: 'background:#fff',
                        animate: true,
                        shadow: true,
                        store: sb_gl_tj_zz_store,
                        legend: {
                          position: 'right'  
                        },
                        axes: [{
                            type: 'Numeric',
                            position: 'bottom',
                            fields: ['data1', 'data2', 'data3'],
                            minimum: 0,
                            label: {
                                renderer: Ext.util.Format.numberRenderer('0,0')
                            },
                            grid: true,
                            title: '能耗（度）'
                        }, {
                            type: 'Category',
                            position: 'left',
                            fields: ['name'],
                            title: ''
                        }],
                        series: [{
                            type: 'bar',
                            axis: 'bottom',
                    highlight: true,
                    tips: {  
                                      trackMouse: true,  
                                      width: 140,  
                                      height: 28,  
                                      renderer: function(storeItem, item) {  
                                        this.setTitle( item.value  );  
                                      }},
                            xField: 'name',
                            yField: ['data1', 'data2', 'data3']
                        }]
                       
                    }

              }],
                    
            tbar:[
            {
              xtype: 'button',
              iconCls: 'exit',
              text:'退出',
              handler: function() {
                Ext.getCmp('sb_gl_tj_setup_win').close();
              }
            },
            '->',
            '<span style=" font-size:12px;font-weight:600;color:#3366FF;">统计类型</span>:&nbsp;&nbsp;',
            {
              xtype: 'combo',
              name: 'tjlx',
              store: tjlx_data,
              emptyText:'请选择',
              mode: 'local',
              minChars : 2,
              valueField:'text',
              displayField:'text',
              triggerAction:'all',
              width:90,
              id:'sb_tjlx'
            },
                  '<span style=" font-size:12px;font-weight:600;color:#3366FF;">起日期</span>:&nbsp;&nbsp;',
                  {
                    xtype: 'datefield',format: 'Y-m-d',id:'sb_gl_tj_qrq',width:90
                  },
                  '<span style=" font-size:12px;font-weight:600;color:#3366FF;">止日期</span>:&nbsp;&nbsp;',
                  {
                    xtype: 'datefield',format: 'Y-m-d',id:'sb_gl_tj_zrq',width:90
                  },          
                  {xtype:'button',text:'统计',tooltip:'设备功率统计',iconCls:'search',
                      handler: function() {                       
                        if (Ext.getCmp("sb_gl_tj_zrq").rawValue!=''){
                          if (Ext.getCmp("sb_gl_tj_qrq").rawValue!=''){
                            if (Ext.getCmp("sb_tjlx").rawValue!=''){
                              sb_gl_tj_zz_store.proxy.extraParams={tjzl:Ext.getCmp("sb_tjlx").rawValue,tjlx:0,qrq:Ext.getCmp("sb_gl_tj_qrq").rawValue,zrq:Ext.getCmp("sb_gl_tj_zrq").rawValue};
                                sb_gl_tj_zz_store.load();
                              }else{
                                alert("统计类型不能为空。");
                              }                               
                          }else{
                            alert("起日期不能为空。");
                          }
                        }else{
                          alert("止日期不能为空。");
                        }
                      }
                  }
            ]

          });
        }


        win.show();
      };  


      var sys_zn_store  = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: 'desktop/get_zn_tree',
            extraParams: {userid:currentUser.id},
            actionMethods: 'POST'
        }
      });
      
      var sys_zn_panel = Ext.create('Ext.tree.Panel', {
        id : 'sys_zn_panel',
        store: sys_zn_store,
        rootVisible:false,
        useArrows: true,
        listeners:{
          checkchange:function(node,checked,option){
            if(checked){
              root=Ext.getCmp('sys_zn_panel').store.getRootNode();      
              getNodes(root,false);
              node.data.checked=true;
              node.updateInfo({checked:true});
              if (Ext.getCmp('ly_setup_win')!=undefined){Ext.getCmp('ly_setup_win').close();}

              if (Ext.getCmp('lc_setup_win')!=undefined){Ext.getCmp('lc_setup_win').close();}
              if (Ext.getCmp('fj_setup_win')!=undefined){Ext.getCmp('fj_setup_win').close();}
              if (Ext.getCmp('sb_setup_win')!=undefined){Ext.getCmp('sb_setup_win').close();}
              if (Ext.getCmp('sb_cz_setup_win')!=undefined){Ext.getCmp('sb_cz_setup_win').close();}
              if (Ext.getCmp('user_sb_setup_win')!=undefined){Ext.getCmp('user_sb_setup_win').close();}
              if (Ext.getCmp('cz_rz_setup_win')!=undefined){Ext.getCmp('cz_rz_setup_win').close();}
              
              if (Ext.getCmp('qjms_setup_win')!=undefined){Ext.getCmp('qjms_setup_win').close();}
              if (Ext.getCmp('qjms_sb_cz_setup_win')!=undefined){Ext.getCmp('qjms_sb_cz_setup_win').close();}
              
              if (Ext.getCmp('sb_nx_setup_win')!=undefined){Ext.getCmp('sb_nx_setup_win').close();}
              
              if (Ext.getCmp('sb_gl_tj_setup_win')!=undefined){Ext.getCmp('sb_gl_tj_setup_win').close();}
              switch (node.data.id) { 
                case "1": 
                  ly_setup();
                  break; 
                case "2": 
                  lc_setup();
                  break; 
                case "3": 
                  fj_setup();
                  break; 
                case "4": 
                  sb_setup();
                  break;
                case "5": 
                  sb_cz_setup();
                  break;
                case "6": 
                  user_sb_setup();
                  break;
                case "7": 
                  cz_rz_setup();
                  break;
                case "8": 
                  qjms_setup();
                  break;
                case "9": 
                  qjms_sb_cz_setup();
                  break;
                case "10": 
                  sb_nx_setup();
                  break;
                case "11": 
                  sb_gl_tj_setup();
                  break;

              }
            }

          }
        }
      });
      if(!win){
          win = desktop.createWindow({
            id: 'notepad',
            title:'智慧物联管理',
            width:200,
            height:500,
            x : 100,
            y : 50,
            iconCls: 'zhwl',
            animCollapse:false,
            border: false,
            hideMode: 'offsets',
            layout: 'fit',
            split:true,
            items: sys_zn_panel
          });
      }
      win.show();
      return win;
    }
});

