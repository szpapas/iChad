/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.	Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

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
      var desktop = this.app.getDesktop();
      var win = desktop.getWindow('systemman');

		var user_tree_store	= Ext.create('Ext.data.TreeStore', {
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
			singleExpand: true,
			width: 200,
			listeners:{
				checkchange:function(node,checked,option){
					if (checked){
						root=Ext.getCmp('user_tree_panel').store.getRootNode();			
						getNodes(root,false);
						node.data.checked=true;
						node.updateInfo({checked:true});
						new Ajax.Request("/desktop/get_user_qx", { 
							method: "POST",
							parameters: "userid="+node.data.id,
							onComplete:	 function(request) {
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
			//height: 300,
		});

		
		
		function getNodes(node,tf) {
			//遍历所有子节点
			if (node.childNodes.size() == 0) return;
			node.eachChild(function(n){
				//Ext.getCmp('user_ml_qx_tree_panel').store.getNodeById("1_1_1").data.checked
			   				n.data.checked=tf;
			   				n.updateInfo({checked:tf})
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
						id : 'user_disp_form',
						items: [
							{
								xtype: 'label',
								text: '用户名称：',
								x: 10,
								y: 10,
								width: 100
							},
							{
								xtype: 'label',
								text: '密码',
								x: 10,
								y: 40,
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
								name: 'email',
								id:'user_email'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 40,
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
									if(pars['email']!=''){
										if(pars['encrypted_password']!=''){
											if(add_new==false){
												new Ajax.Request("/desktop/update_user", { 
													method: "POST",
													parameters: pars,
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															
															Ext.getCmp('user_disp_win').close();
															
															Ext.getCmp('user_setup_grid').store.url='/desktop/get_user_grid';
															Ext.getCmp('user_setup_grid').store.load();
														}else{
															alert("修改失败，请重新修改。"+request.responseText);
														}
													
													}
												});
											}else{
												new Ajax.Request("/desktop/insert_user", { 
													method: "POST",
													parameters: pars,
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															
															Ext.getCmp('user_disp_win').close();
															Ext.getCmp('user_setup_grid').store.url='/desktop/get_user_grid';
															Ext.getCmp('user_setup_grid').store.load();
														}else{
															alert("新增失败，请重新新增。"+request.responseText);
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
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															
															Ext.getCmp('js_disp_win').close();
															
															Ext.getCmp('js_setup_grid').store.url='/desktop/get_js_grid';
															Ext.getCmp('js_setup_grid').store.load();
														}else{
															alert("修改失败，请重新修改。"+request.responseText);
														}
													
													}
												});
											}else{
												new Ajax.Request("/desktop/insert_js", { 
													method: "POST",
													parameters: pars,
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															
															Ext.getCmp('js_disp_win').close();
															Ext.getCmp('js_setup_grid').store.url='/desktop/get_js_grid';
															Ext.getCmp('js_setup_grid').store.load();
														}else{
															alert("新增失败，请重新新增。"+request.responseText);
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
				Ext.getCmp('user_disp_form').getForm().setValues(record.data);
				
			}else{
				Ext.getCmp('user_disp_win').title="新增角色信息";
				Ext.getCmp('button_user_add').text="新增";
				Ext.getCmp('button_user_add').iconCls="add";
			}

			win.show();
		};
	
		var user_setup = function(){
			var win = Ext.getCmp('user_setup_win');

			Ext.regModel('user_setup_model', {
				fields: [
					{name: 'id',		type: 'integer'},
					{name: 'email',		type: 'string'},
					{name: 'encrypted_password',		type: 'string'}
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
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '用户名',	width : 250, sortable : true, dataIndex: 'email'},
					{ text : '密码',	width : 0, sortable : true, dataIndex: 'encrypted_password'}
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
				data = node.selected.items[0].data;		 // data.id, data.parent, data.text, data.leaf							
				new Ajax.Request("/desktop/get_user_js", { 
					method: "POST",
					parameters: "id="+data.id,
					onComplete:	 function(request) {
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
			var js_tree_store	= Ext.create('Ext.data.TreeStore', {
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
					width: 670,
					height: 530,
					minHeight: 530,
					layout: 'border',
					modal: true,
					plain: true,					
					items: [
						{	title:'用户列表',
							region:'west',
							iconCls:'users',
							xtype:'panel',
							margins:'0 0 0 0',
							width: 250,
							collapsible:true,//可以被折叠							
							layout:'fit',
							split:true,
							items:user_setup_grid
						},
						{	title:'角色树',
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
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															Ext.getCmp('user_setup_grid').store.url='/desktop/get_user_grid';
															Ext.getCmp('user_setup_grid').store.load();
														}else{
															alert("删除失败，请重新删除。"+request.responseText);
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
										onComplete:	 function(request) {
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
					{name: 'id',		type: 'integer'},
					{name: 'jsmc',		type: 'string'}
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
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '角色名称',	width : 250, sortable : true, dataIndex: 'jsmc'}
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
					width: 370,
					height: 530,
					minHeight: 530,
					layout: 'fit',
					modal: true,
					plain: true,
					items:user_setup_grid,					
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
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															Ext.getCmp('js_setup_grid').store.url='/desktop/get_js_grid';
															Ext.getCmp('js_setup_grid').store.load();
														}else{
															alert("删除失败，请重新删除。"+request.responseText);
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

			if (win==null) {
				win = new Ext.Window({
					id : 'qz_disp_win',
					title: '修改全宗信息',
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
								text: '全宗简称',
								x: 10,
								y: 40,
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
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															
															Ext.getCmp('qz_disp_win').close();
															
															Ext.getCmp('qz_setup_grid').store.url='/desktop/get_qz_grid';
															Ext.getCmp('qz_setup_grid').store.load();
														}else{
															alert(request.responseText);
														}
													
													}
												});
											}else{
												new Ajax.Request("/desktop/insert_qz", { 
													method: "POST",
													parameters: pars,
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															
															Ext.getCmp('qz_disp_win').close();
															Ext.getCmp('qz_setup_grid').store.url='/desktop/get_qz_grid';
															Ext.getCmp('qz_setup_grid').store.load();
														}else{
															alert(request.responseText);
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
					{name: 'id',		type: 'integer'},
					{name: 'dwdm',		type: 'string'},
					{name: 'dwjc',		type: 'string'}
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
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '全宗名称',	width : 250, sortable : true, dataIndex: 'dwdm'},
					{ text : '全宗简称',	width : 70, sortable : true, dataIndex: 'dwjc'}
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
					width: 370,
					height: 530,
					minHeight: 530,
					layout: 'fit',
					modal: true,
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
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															Ext.getCmp('qz_setup_grid').store.url='/desktop/get_qz_grid';
															Ext.getCmp('qz_setup_grid').store.load();
														}else{
															alert(request.responseText);
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
					{name: 'id',		type: 'integer'},
					{name: 'dwdm',		type: 'string'},
					{name: 'dwjc',		type: 'string'}
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
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '全宗名称',	width : 250, sortable : true, dataIndex: 'dwdm'},
					{ text : '全宗简称',	width : 70, sortable : true, dataIndex: 'dwjc'}
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
				data = node.selected.items[0].data;		 // data.id, data.parent, data.text, data.leaf							
				new Ajax.Request("/desktop/get_qz_lb", { 
					method: "POST",
					parameters: "id="+data.id,
					onComplete:	 function(request) {
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
			var lb_tree_store	= Ext.create('Ext.data.TreeStore', {
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
					height: 530,
					minHeight: 530,
					layout: 'border',
					modal: true,
					plain: true,					
					items: [
						{	title:'全宗列表',
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
						{	title:'档案类别树',
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
										onComplete:	 function(request) {
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
					{name: 'id',		type: 'integer'},
					{name: 'dwdm',		type: 'string'},
					{name: 'dwjc',		type: 'string'}
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
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '全宗名称',	width : 250, sortable : true, dataIndex: 'dwdm'},
					{ text : '全宗简称',	width : 70, sortable : true, dataIndex: 'dwjc'}
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
				data = node.selected.items[0].data;		 // data.id, data.parent, data.text, data.leaf	
				Ext.getCmp('lb_tree_panel').store.proxy.extraParams.id=data.id;
				Ext.getCmp('lb_tree_panel').store.load();
										
				
			});
			var lb_tree_store	= Ext.create('Ext.data.TreeStore', {
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
			
			var lb_tree_store1	= Ext.create('Ext.data.TreeStore', {
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
					height: 530,
					minHeight: 530,
					layout: 'border',
					modal: true,
					plain: true,					
					items: [
						{	title:'全宗列表',
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
						{	title:'档案类别树',
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
						{	title:'目录树',
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
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															//Ext.getCmp('lb_tree_panel1').store.proxy.extraParams.id=qz_lb_id;
															Ext.getCmp('lb_tree_panel1').store.load();
														}else{
															alert(request.responseText);
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
												onComplete:	 function(request) {
													if (request.responseText=='success'){
														//Ext.getCmp('lb_tree_panel1').store.proxy.extraParams.id=qz_lb_id;
														//Ext.getCmp('lb_tree_panel1').store.load();
														alert("初使化完成。");
													}else{
														alert(request.responseText);
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
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															Ext.getCmp('qz_lb_ml_disp_win').close();
															Ext.getCmp('lb_tree_panel1').store.proxy.extraParams.id=qz_lb_id;
															Ext.getCmp('lb_tree_panel1').store.load();
														}else{
															alert(request.responseText);
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
		var user_ml_qx_tree_store	= Ext.create('Ext.data.TreeStore', {
				autoLoad: true,
				proxy: {
						type: 'ajax',
						url: 'desktop/get_ml_qx_tree',
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
		var user_cd_qx_tree_store	= Ext.create('Ext.data.TreeStore', {
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
		if(!win){
          win = desktop.createWindow({
              id: 'systemman',              
              	title:'权限管理',
				width:1000,
				height:600,
				iconCls: 'archiveman',
				animCollapse:false,
				border: false,
				hideMode: 'offsets',
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
										onComplete:	 function(request) {
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
					},'->',	
					{xtype:'button',text:'用户设置',tooltip:'新增修改删除用户',id:'qx_user',iconCls:'user',
						handler: function() {
							user_setup();
						}
					},
					{xtype:'button',text:'角色设置',tooltip:'新增修改删除用户',id:'qx_js',iconCls:'user',
						handler: function() {
							js_setup();
						}
					},
					{xtype:'button',text:'全宗设置',tooltip:'新增修改删除全宗',id:'qx_dw',iconCls:'user',
						handler: function() {
							qz_setup();		
						}
					},
					{xtype:'button',text:'全宗档案类别设置',tooltip:'新增修改删除全宗档案类别',id:'qx_dw_lb',iconCls:'user',
						handler: function() {
							qz_lb_setup();
						}
					},
					{xtype:'button',text:'全宗档案类别目录设置',tooltip:'新增修改删除全宗档案类别目录',id:'qx_dw_lb_ml',iconCls:'user',
						handler: function() {
							qz_lb_ml_setup();
						}
					}
				],			
				items: [
					{	title:'角色树',
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
					{	title:'用户目录权限树',
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
      return win;
  }

});

