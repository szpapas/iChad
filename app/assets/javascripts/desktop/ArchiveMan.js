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


Ext.define('MyDesktop.ArchiveMan', {
	extend: 'Ext.ux.desktop.Module',

	requires: [
		'*',
		'Ext.tree.*',
		'Ext.data.*',
		'Ext.window.MessageBox'
	],

	id:'archiveman',

	init : function(){
		this.launcher = {
			text: '档案管理',
			iconCls:'archiveman',
			handler : this.createWindow,
			scope: this
		}
	},

	createWindow : function(){
		var desktop = this.app.getDesktop();
		var win = desktop.getWindow('archiveman');
		
		var tabPanel = new Ext.TabPanel({
			activeTab : 0,//默认激活第一个tab页
			animScroll : true,//使用动画滚动效果
			enableTabScroll : true,//tab标签超宽时自动出现滚动按钮
			items: [
				{
					title: '欢迎页面',
					height:600,
					closable : false,//允许关闭
					html : '<div style="height:600px;padding-top:200px;text-align: center;"><font size = 6>欢迎使用档案管理信息系统</font></div>'
				}
			],listeners:{
				"contextmenu":function(tabPanel,myitem,e){
					var menu = new Ext.menu.Menu([
						{text:"关闭当前选项页",handler:function(){
							if(myitem != tabPanel.getItem(0)) {
								tabPanel.remove(myitem)
							}
						}},
						{text:"关闭其他所有选项页",handler:function() {
								tabPanel.items.each(function(item){
									if(item != myitem && item != tabPanel.getItem(0)) {
										tabPanel.remove(item);
									}
								});
							}
						}
					]);
					menu.showAt(e.getPoint());
				}
			}	
		});

		// Go ahead and create the TreePanel now so that we can use it below
		var AjListFn = function(title,text) {
			
			
			Ext.regModel('document_model', {
				fields: [
						{name: 'id',		type: 'integer'},
						{name: 'tm',		type: 'string'},
						{name: 'sxh',		type: 'string'},
						{name: 'yh',		type: 'string'},
						{name: 'wh',		type: 'string'},
						{name: 'zrz',		type: 'string'},
						{name: 'rq',		type: 'string',	 type: 'date',	dateFormat: 'Y-m-d H:i:s'},
						{name: 'bz',		type: 'string'},
						{name: 'dh',		type: 'string'},
						{name: 'ownerid',		type: 'integer'}
				]
			});
			
			var store3 = Ext.create('Ext.data.Store', {
				model : 'document_model',
				proxy: {
					type: 'ajax',
					url : '/desktop/get_document',
					extraParams: {query:""},
					reader: {
						type: 'json',
						root: 'rows',
						totalProperty: 'results'
					}
				}
			});

			var documentGrid = new Ext.grid.GridPanel({
				//id: title,
				id : 'document_grid',
				store: store3,
				tbar:[
					{xtype:'button',text:'添加',tooltip:'添加卷内目录',id:'jradd',iconCls:'add',
						handler: function() {
							var grid = Ext.getCmp('archive_grid');
							var records = grid.getSelectionModel().getSelection();
							var record = records[0];
							DispJr(record,true);
							
						}
					},
					{xtype:'button',text:'删除',tooltip:'删除卷内目录',id:'jrdelete',iconCls:'remove',
						handler: function() {

							var grid = Ext.getCmp('document_grid');
							var records = grid.getSelectionModel().getSelection();
							var record = records[0];

							var pars="id="+record.data.id;
							Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
										if(id=="yes"){
											new Ajax.Request("/desktop/delete_document", { 
												method: "POST",
												parameters: pars,
												onComplete:	 function(request) {
													Ext.getCmp('document_grid').store.load();

												}
											});
										}else{
											//alert('O,no');
										}
									
								});
							
						}},
					{xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',id:'jrsave',iconCls:'option',
					handler: function() {
						var grid  = this.ownerCt.ownerCt;
						//alert(grid);
							var store = grid.getStore(); 
							var records = grid.getSelectionModel().getSelection();
							var data = [];
							Ext.Array.each(records,function(model){
								data.push(Ext.JSON.encode(model.get('id')));
								DispJr(model,false);
							});
						}
					}	,	'->',
								'<span style=" font-size:12px;font-weight:600;color:#3366FF;">题名查询</span>:&nbsp;&nbsp;',
								{
									xtype:'textfield',id:'query_jr_text'
								},				  
								{xtype:'button',text:'查询',tooltip:'查询卷内目录',id:'query_jr',iconCls:'accordion',
										handler: function() {
											store3.proxy.url="/desktop/get_document_where";
											store3.proxy.extraParams.query=Ext.getCmp('query_jr_text').value;
											store3.load();
										}
								}
					
				],
				columns: [
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '档号',	width : 75, sortable : true, dataIndex: 'dh'},
					{ text : '顺序号',	 width : 30, sortable : true, dataIndex: 'sxh'},
					{ text : '文号',	width : 105, sortable : true, dataIndex: 'wh'},
					{ text : '责任者',	 width : 75, sortable : true, dataIndex: 'zrz'},
					{ text : '题名',	width : 175, sortable : true, dataIndex: 'tm'},
					{ text : '页号',	width : 75, sortable : true, dataIndex: 'yh'},

					{ text : '日期',	width : 75, sortable : true, dataIndex: 'rq',renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : '备注',	width : 75, sortable : true, dataIndex: 'bz'},
					{ text : 'ownerid',	 flex : 1, sortable : true, dataIndex: 'ownerid'}
					],
				listeners:{
						itemdblclick:{
							fn:function(v,r,i,n,e,b){
								var tt=r.get("zrq");
								//showContactForm();
								DispJr(r,false);
								//alert(tt);
							}
						}
					},
				//width : 800,
				//height : 300,
				viewConfig: {
					stripeRows:true
				}
			});
			Ext.regModel('archive_model', {
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
			
			var archive_store = Ext.create('Ext.data.Store', {
							id:'archive_store',
							model : 'archive_model',
							proxy: {
								type: 'ajax',
								url : '/desktop/get_archive',
								extraParams: {query:title},
								reader: {
									type: 'json',
									root: 'rows',
									totalProperty: 'results'
								}
							}
							//sortInfo:{field: 'level4', direction: "ASC"},
							//baseParams: {start:0, limit:25, query:""}
						});

						archive_store.load();
			var archiveGrid = new Ext.grid.GridPanel({
				id : 'archive_grid',
				store: archive_store,
				
				tbar:[
									{xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
										handler: function() {

											var grid = Ext.getCmp('archive_grid');
											var records = grid.getSelectionModel().getSelection();
											var record = records[0];
											DispAj(record,true);
										}
									}	,
										{xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
											handler: function() {

												var grid = Ext.getCmp('archive_grid');
												var records = grid.getSelectionModel().getSelection();
												var record = records[0];

												var pars="id="+record.data.id;
												Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
															if(id=="yes"){
																new Ajax.Request("/desktop/delete_archive", { 
																	method: "POST",
																	parameters: pars,
																	onComplete:	 function(request) {
																		Ext.getCmp('archive_grid').store.load();
																	}
																});
															}else{
																//alert('O,no');
															}

													});

											}
										},
										{xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
											handler: function() {
												var grid = Ext.getCmp('archive_grid');
												var records = grid.getSelectionModel().getSelection();
												var record = records[0];
												DispAj(record,false);
											}
										}		,	
												'->',
												{
													xtype: 'combo',
													name: 'aj_select',
													store: aj_where_field_data,
													emptyText:'案卷标题',
													mode: 'local',
													minChars : 2,
													valueField:'text',
													displayField:'text',
													triggerAction:'all',
													id:'aj_select_field'
												}	,
												'&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
												{
													xtype:'textfield',
													id:'query_text',
                                            // 
											//  	enableKeyEvents: true, 
											//  	initEvents: function() { 
											//  		var keyPress = function(e){ 
											//  			if (e.getKey() == e.ENTER) { 
											//  			    console.log(Ext.getCmp('query_text').getValue());
											//  				if(Ext.getCmp('query_text').getValue() != null ){
											//  					var grid = Ext.getCmp('archive_grid');
											//  					grid.store.proxy.url="/desktop/get_archive_where";
											//  					archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
											//  					archive_store.load();
											//  				}
											//  			}
											//  		}; 
											//  		this.el.on("keypress", keyPress, this);
											//  	}

												}	,				  
												{	xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
													handler: function() {
														console.log(Ext.getCmp('query_text').value);
														if(Ext.getCmp('query_text').value != null ){
															var grid = Ext.getCmp('archive_grid');
															grid.store.proxy.url="/desktop/get_archive_where";
															archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
															archive_store.load();
														}
													}
												}
								],
				columns: [
					//{ text : 'file_name', flex : 1,	sortable : true, dataIndex: 'level4'},
					//{ text : 'file_size',	 width : 75, sortable : true, dataIndex: 'file_size'}
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : 'dalb',	width : 0, sortable : true, dataIndex: 'dalb'},
					{ text : '档号',	width : 75, sortable : true, dataIndex: 'dh'},
					{ text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
					
					{ text : '分类号',	 width : 75, sortable : true, dataIndex: 'flh'},
					{ text : '案件号',	 width : 75, sortable : true, dataIndex: 'ajh'},
					{ text : '标题名称',  width : 175, sortable : true, dataIndex: 'tm'},
					
					{ text : '年度',	width : 75, sortable : true, dataIndex: 'nd'},
					{ text : '件数',	width : 75, sortable : true, dataIndex: 'js'},
					{ text : '页数',	width : 75, sortable : true, dataIndex: 'ys'},
					{ text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
					{ text : '起日期',	 width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : '止日期',	 width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : '起年月',	 width : 75, sortable : true, dataIndex: 'qny'},
					{ text : '止年月',	 width : 75, sortable : true, dataIndex: 'zny'},
					{ text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
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
								DispAj(r,false);
							}
						}
					},
				//width : 800,
				//height : 300,
				viewConfig: {
					stripeRows:true
				}
			});			

				
			archiveGrid.on("select",function(node){
				data = node.selected.items[0].data;		 // data.id, data.parent, data.text, data.leaf
				archive_id = data.id; 
				store3.proxy.extraParams.query=data.id;
				store3.load();
			});
			
								
			var tabPage = tabPanel.add({
				title:text,
				closable:true,
				iconCls:'tabs',
				layout: 'border',
				//height:500,
				//collapsible:true,
				split:true,
				items:[{
						id:title,
						region: 'center',
						//height: 200,
						layout: 'fit',
						split:true,
						items: archiveGrid
					},{
						region: 'south',
						iconCls:'icon-grid',
						layout: 'fit',
						height: 150,
						split: true,
						collapsible: true,
						title: '卷内目录',
						items: documentGrid

					}]
			});
			tabPanel.setActiveTab(tabPage);
			userManagePageIsOpen = true;
		};

		var DispAj = function(record,add_new){
			var win = Ext.getCmp('archive_detail_win');
			if (win==null) {
				win = new Ext.Window({
					id : 'archive_detail_win',
					title: '案卷详细信息',
					//closeAction: 'hide',
					width: 370,
					height: 530,
					minHeight: 530,
					layout: 'fit',
					modal: true,
					plain: true,
					items: [{
						width: 370,
						height: 530,
						xtype:'form',
						layout: 'absolute',
						id : 'daglaj_form',
						items: [
							{
								xtype: 'label',
								text: '档号',
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
								xtype: 'label',
								text: '分类号',
								x: 10,
								y: 70,
								width: 100
							},
							{
								xtype: 'label',
								text: '案卷号',
								x: 10,
								y: 100,
								width: 100
							},
							{
								xtype: 'label',
								text: '案卷标题',
								x: 10,
								y: 130,
								width: 100
							},
							{
								xtype: 'label',
								text: '年度',
								x: 10,
								y: 190,
								width: 100
							},
							{
								xtype: 'label',
								text: '保管期限',
								x: 10,
								y: 220,
								width: 100
							},
							{
								xtype: 'label',
								text: '件数',
								x: 10,
								y: 250,
								width: 100
							},
							{
								xtype: 'label',
								text: '页数',
								x: 10,
								y: 280,
								width: 100
							},
							{
								xtype: 'label',
								text: '起年月',
								x: 10,
								y: 310,
								width: 100
							},
							{
								xtype: 'label',
								text: '止年月',
								x: 10,
								y: 340,
								width: 100
							},
							{
								xtype: 'label',
								text: '备注',
								x: 10,
								y: 370,
								width: 100
							},
							{
								xtype: 'textfield',
								hidden : true,
								name : 'id' ,
								id:'aj_id'										
							},
							{
								xtype: 'textfield',
								hidden : true,
								name : 'qzh',
								id:'aj_qzh'											
							},
							{
								xtype: 'textfield',
								hidden : true,
								name : 'dalb',
								id:'aj_dalb'											
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 10,
								width: 200,
								name: 'dh',
								id:'aj_dh'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 40,
								width: 200,
								name: 'mlh',
								id:'aj_mlh'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 70,
								width: 200,
								name: 'flh',
								id:'aj_flh'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 100,
								width: 200,
								name: 'ajh',
								id:'aj_ajh'
							},
							{
								xtype: 'textarea',
								x: 130,
								y: 130,
								width: 200,
								name: 'tm',
								height: 50,
								id:'aj_tm'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 190,
								width: 200,
								name: 'nd',
								id:'aj_nd'
					
							},
							{
								xtype: 'combo',
								x: 130,
								y: 220,
								width: 200,
								name: 'bgqx',
								store: bgqx_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								id:'aj_bgqx'
								
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 250,
								width: 200,
								name: 'js',
								id:'aj_js'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 280,
								width: 200,
								name: 'ys',
								id:'aj_ys'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 310,
								width: 200,
								name: 'qny',
								id:'aj_qny'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 340,
								width: 200,
								name: 'zny',
								id:'aj_zny'
							},
							{
								xtype: 'textarea',
								x: 130,
								y: 370,
								width: 200,
								name: 'bz',
								height: 80,
								id:'aj_bz'
							}
						],
						buttons:[{
								xtype: 'button',
								cls: 'contactBtn',
								id:'button_aj_add',
								text:'修改',
								handler: function() {
									var pars=this.up('panel').getForm().getValues();
									if(add_new==false){
										new Ajax.Request("/desktop/update_flow", { 
											method: "POST",
											parameters: pars,
											onComplete:	 function(request) {
												Ext.getCmp('archive_grid').store.load();
												Ext.getCmp('archive_detail_win').hide();
											}
										});
									}else{
										new Ajax.Request("/desktop/insert_archive", { 
											method: "POST",
											parameters: pars,
											onComplete:	 function(request) {
												Ext.getCmp('archive_grid').store.load();
												Ext.getCmp('archive_detail_win').hide();
											}
										});
									}
								}
							},
							{
								xtype: 'button',
								cls: 'contactBtn',
								text:'退出',
								handler: function() {
									//this.up('window').hide();
									Ext.getCmp('archive_detail_win').hide();
								}
							}]
					}]
				});
			}
			if(add_new==false){
			//设置数据
				Ext.getCmp('daglaj_form').getForm().setValues(record.data);
				
			}else{
				
				Ext.getCmp('button_aj_add').text="新增";
				Ext.getCmp('aj_dh').setValue(record.data.dh);
				Ext.getCmp('aj_qzh').setValue(record.data.qzh);
				Ext.getCmp('aj_mlh').setValue(record.data.mlh);
				Ext.getCmp('aj_flh').setValue(record.data.flh);
				Ext.getCmp('aj_dalb').setValue(record.data.dalb);
				Ext.getCmp('aj_ajh').setValue("");
				Ext.getCmp('aj_bgqx').setValue("");
				Ext.getCmp('aj_nd').setValue("");
				Ext.getCmp('aj_tm').setValue("");
				Ext.getCmp('aj_qny').setValue("");
				Ext.getCmp('aj_zny').setValue("");
				Ext.getCmp('aj_js').setValue("");
				Ext.getCmp('aj_ys').setValue("");
				Ext.getCmp('aj_bz').setValue("");
			}
			//设置数据
			
			win.show();
		};
		//显示卷内目录窗口
		var DispJr = function(recordad,add_new){
			var win = Ext.getCmp('document_detail_win');
			if (win==null) {
				win = new Ext.Window({
					id : 'document_detail_win',
					title: '卷内目录详细信息',
					//closeAction: 'hide',
					width: 370,
					height: 400,
					minHeight: 400,
					layout: 'fit',
					modal: true,
					plain: true,
					items: [{
						width: 370,
						height: 400,
						xtype:'form',
						layout: 'absolute',
						id : 'dagljr_form',
						items: [
							{
								xtype: 'label',
								text: '档号',
								x: 10,
								y: 10,
								width: 100
							},
							{
								xtype: 'label',
								text: '顺序号',
								x: 10,
								y: 40,
								width: 100
							},
							{
								xtype: 'label',
								text: '文号',
								x: 10,
								y: 70,
								width: 100
							},
							{
								xtype: 'label',
								text: '责任者',
								x: 10,
								y: 100,
								width: 100
							},
							{
								xtype: 'label',
								text: '题名',
								x: 10,
								y: 160,
								width: 100
							},
							{
								xtype: 'label',
								text: '日期',
								x: 10,
								y: 190,
								width: 100
							},
							{
								xtype: 'label',
								text: '页号',
								x: 10,
								y: 220,
								width: 100
							},
							
							{
								xtype: 'label',
								text: '备注',
								x: 10,
								y: 250,
								width: 100
							},
							{
								xtype: 'textfield',
								hidden : true,
								name : 'id'
								
																			
							},
							{
								xtype: 'textfield',
								hidden : true,
								name : 'ownerid',
								id:'jr_ownerid'											
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 10,
								width: 200,
								name: 'dh',
								id:'jr_dh',
							
								readonly:true
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 40,
								width: 200,
								id:'jr_sxh',
								name: 'sxh'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 70,
								width: 200,
								id:'jr_wh',
								name: 'wh'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 100,
								width: 200,
								id:'jr_zrz',
								name: 'zrz'
							},
							{
								xtype: 'textarea',
								x: 130,
								y: 130,
								width: 200,
								name: 'tm',
								id:'jr_tm',
								height:50
							},
							
							{
								xtype: 'datefield',
								x: 130,
								y: 190,
								width: 200,
								id:'jr_rq',
								name: 'rq', dateFormat: 'Y-m-d H:i:s'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 220,
								width: 200,
								id:'jr_yh',
								name: 'yh'
							},
							
							{
								xtype: 'textarea',
								x: 130,
								y: 250,
								width: 200,
								name: 'bz',
								id:'jr_bz',
								height: 80
							}
						],
						buttons:[{
								xtype: 'button',
								cls: 'contactBtn',
								id:'button_jr_add',
								text:'修改',
								handler: function() {
									var pars=this.up('panel').getForm().getValues();
									if(add_new==false){
										new Ajax.Request("/desktop/update_flow", { 
											method: "POST",
											parameters: pars,
											onComplete:	 function(request) {
												Ext.getCmp('document_grid').store.load();
												Ext.getCmp('document_detail_win').hide();
											}
										});}
									else{
										new Ajax.Request("/desktop/insert_document", { 
											method: "POST",
											parameters: pars,
											onComplete:	 function(request) {
												Ext.getCmp('document_grid').store.load();
												Ext.getCmp('document_detail_win').hide();
											}
										});
									}
								}
							},
							{
								xtype: 'button',
								cls: 'contactBtn',
								text:'退出',
								handler: function() {
									//this.up('window').hide();
									Ext.getCmp('document_detail_win').hide();
								}
							}]
					}]
				});
			}
			if(add_new==false){
			//设置数据
				Ext.getCmp('dagljr_form').getForm().setValues(recordad.data);
				Ext.getCmp('jr_rq').Value=(recordad.data.rq);
			}else{
				
				Ext.getCmp('button_jr_add').text="新增";
				Ext.getCmp('jr_dh').setValue(recordad.data.dh);
				Ext.getCmp('jr_ownerid').setValue(recordad.data.id);
				Ext.getCmp('jr_sxh').setValue("");
				Ext.getCmp('jr_tm').setValue("");
				Ext.getCmp('jr_wh').setValue("");
				Ext.getCmp('jr_zrz').setValue("");
				Ext.getCmp('jr_yh').setValue("");
				Ext.getCmp('jr_rq').setValue("");
				Ext.getCmp('jr_bz').setValue("");
			}
			win.show();
		};

		var store1 = Ext.create('Ext.data.TreeStore', {
				autoLoad: true,
				proxy: {
						type: 'ajax',
						url: 'desktop/get_tree',
						extraParams: {
						//		mode: 'getTree'
						},
						actionMethods: 'POST'
				}
		});
	
		var treePanel = Ext.create('Ext.tree.Panel', {
			store: store1,
			rootVisible: false,
			useArrows: true,
			singleExpand: true,
			width: 200,
			height: 300
		});

		treePanel.on("select",function(node){ 
			data = node.selected.items[0].data;	 // data.id, data.parent, data.text, data.leaf
			if (data.leaf) {
				AjListFn(data.id,node.selected.items[0].parentNode.data.text+data.text);
				
				//alert(node.selected.items[0].parentNode.data.text);
				//archive_store.proxy.extraParams.query=data.id;
				//archive_store.load();
			}
		});
	
		if(!win){
			win = desktop.createWindow({
				id: 'archiveman',
				title:'档案管理',
				width:1000,
				height:600,
				iconCls: 'archiveman',
				animCollapse:false,
				border: false,
				hideMode: 'offsets',
				layout: 'border',
				split:true,
				//collapsible:true,//可以被折叠
				items: [
					{	title:'档案类别',
						region:'west',
						iconCls:'dept_tree',
						xtype:'panel',
						margins:'5 2 5 5',
						width: 200,
						collapsible:true,//可以被折叠
						id:'west-tree',
						layout:'fit',
						split:true,
						items:treePanel
					},
					{	title:'档案数据',
						iconCls:'icon-grid',
						region:'center',
						xtype:'panel',
						id:'center-grid',
						margins:'5 5 5 0',
						layout: 'fit',
						split:true,
						//title:"操作区",				
						items:tabPanel,
						collapsible:true
					},{
						title: '影像图列表',
							collapsible: true,
							iconCls:'dept_tree',
							region:'east',
							margins: '5 0 0 0',
							cmargins: '5 5 0 0',
							split:true,
							width: 175,
							minSize: 100,
							maxSize: 250
						}
				]
			});
		}
		win.show();
		return win;
	}
});

