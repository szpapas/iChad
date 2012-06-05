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


Ext.define('MyDesktop.DaPrint', {
	extend: 'Ext.ux.desktop.Module',

	requires: [
		'*',
		'Ext.tree.*',
		'Ext.data.*',
		'Ext.window.MessageBox'
	],

	id:'daprint',

	init : function(){
		this.launcher = {
			text: '档案打印',
			iconCls:'printdata',
			handler : this.createWindow,
			scope: this
		}
	},
  createWindow : function(){
      var desktop = this.app.getDesktop();
      var win = desktop.getWindow('daprint');
		var ym_disp = function(record,add_new){
			var win = Ext.getCmp('ym_disp_win');
			
			if (win==null) {
				win = new Ext.Window({
					id : 'ym_disp_win',
					title: '修改用户信息',
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
						height: 210,
						xtype:'form',
						layout: 'absolute',
						id : 'ym_disp_form',
						items: [
							{
								xtype: 'label',
								text: '字段名称:',
								x: 10,
								y: 10,
								width: 100
							},
							{
								xtype: 'label',
								text: 'X坐标:',
								x: 10,
								y: 40,
								width: 100
							}
							,
							{
								xtype: 'label',
								text: 'Y坐标:',
								x: 10,
								y: 70,
								width: 100
							},
							{
								xtype: 'label',
								text: '字体:',
								x: 10,
								y: 100,
								width: 100
							},
							{
								xtype: 'label',
								text: '大小:',
								x: 10,
								y: 130,
								width: 100
							},
							{
								xtype: 'label',
								text: '是否打印:',
								x: 10,
								y: 160,
								width: 100
							},
							{
								xtype: 'label',
								text: '是否打印标题:',
								x: 10,
								y: 190,
								id:'sfdybt',
								width: 100
							},
							{
								xtype: 'textfield',
								hidden : true,
								name : 'id' ,
								id:'ym_id'										
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 10,
								width: 200,
								name: 'bt',
								id:'ym_bt'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 40,
								width: 200,
								name: 'xx',
								id:'ym_x'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 70,
								width: 200,
								name: 'yy',
								id:'ym_yy'
							}	,
							{
								xtype: 'combobox',
								x: 130,
								y: 100,
								width: 200,
								store: zt_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								name: 'zt',
								id:'ym_zt'
							},
							{
								xtype: 'textfield',
								x: 130,
								y: 130,
								width: 200,
								name: 'dx',
								id:'ym_dx'
							}	,
							{
								xtype: 'combobox',
								x: 130,
								y: 160,
								width: 200,
								store: sf_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								name: 'sfdy',
								id:'ym_sfdy'
							}	,
							{
								xtype: 'combobox',
								x: 130,
								y: 160,
								width: 200,
								store: sf_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								name: 'sfdybt',
								id:'ym_sfdybt'
							},
							{
								xtype: 'combobox',
								x: 130,
								y: 160,
								width: 200,
								store: sf_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								name: 'sfkg',
								id:'ym_sfkg'
							}
						],
						buttons:[{
								xtype: 'button',
								iconCls: 'option',
								id:'button_user_add',
								text:'修改',
								handler: function() {
									var pars=this.up('panel').getForm().getValues();
									if(pars['yy']!=''){
										if(pars['xx']!=''){
											
												new Ajax.Request("/desktop/update_ym", { 
													method: "POST",
													parameters: pars,
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															alert("修改成功。");
															Ext.getCmp('ym_disp_win').close();
															
															Ext.getCmp('ym_setup_grid').store.url='/desktop/get_ym_grid';
															Ext.getCmp('ym_setup_grid').store.load();
														}else{
															alert("修改失败，请重新修改。");
														}
													
													}
												});
											
										}else{
											alert("X坐标不能为空。");
										}
									}else{
										alert("Y坐标不能为空。");
									}
								}
							},
							{
								xtype: 'button',
								iconCls: 'exit',
								text:'退出',
								handler: function() {
									//this.up('window').hide();
									Ext.getCmp('ym_disp_win').close();
								}
							}]
					}]
					
				});
			}
			
			//设置数据
				Ext.getCmp('ym_disp_form').getForm().setValues(record.data);
				
				
				//Ext.getCmp('ym_sfkg').enable=false;
				Ext.getCmp('ym_bt').readOnly=true;
				Ext.getCmp('sfdybt').hidden=true;
				Ext.getCmp('ym_sfdybt').hidden=true;
				Ext.getCmp('ym_sfkg').hidden=true;
				
				//Ext.getCmp('ym_sfdybt').x=100;
				//Ext.getCmp('ym_sfdybt').y=100;
				switch (record.data['bt']) {
					case '案卷标题': 
						Ext.getCmp('sfdybt').hidden=false;
						Ext.getCmp('sfdybt').text="是否前置空格";
						Ext.getCmp('ym_sfkg').hidden=false;
						Ext.getCmp('ym_sfdybt').hidden=true;
						Ext.getCmp('ym_sfkg').x=130;
						Ext.getCmp('ym_sfkg').y=190;
						break;
					case '地籍号': 
						Ext.getCmp('sfdybt').hidden=false;
						Ext.getCmp('ym_sfkg').hidden=true;
						Ext.getCmp('ym_sfdybt').hidden=false;
						Ext.getCmp('ym_sfdybt').x=130;
						Ext.getCmp('ym_sfdybt').y=190;
						break;
					case '权利人名称': 
						Ext.getCmp('sfdybt').hidden=false;
						Ext.getCmp('ym_sfkg').hidden=true;
						Ext.getCmp('ym_sfdybt').hidden=false;
						Ext.getCmp('ym_sfdybt').x=130;
						Ext.getCmp('ym_sfdybt').y=190;
						break;
					case '土地座落': 
						Ext.getCmp('sfdybt').hidden=false;
						Ext.getCmp('ym_sfkg').hidden=true;
						Ext.getCmp('ym_sfdybt').hidden=false;
						Ext.getCmp('ym_sfdybt').x=130;
						Ext.getCmp('ym_sfdybt').y=190;
						break;
					case '土地证号': 
						Ext.getCmp('sfdybt').hidden=false;
						Ext.getCmp('ym_sfkg').hidden=true;
						Ext.getCmp('ym_sfdybt').hidden=false;
						Ext.getCmp('ym_sfdybt').x=130;
						Ext.getCmp('ym_sfdybt').y=190;
						break;
					case '权属性质': 
						Ext.getCmp('sfdybt').hidden=false;
						Ext.getCmp('ym_sfkg').hidden=true;
						Ext.getCmp('ym_sfdybt').hidden=false;
						Ext.getCmp('ym_sfdybt').x=130;
						Ext.getCmp('ym_sfdybt').y=190;
						break;
					default:
						Ext.getCmp('sfdybt').hidden=true;
						Ext.getCmp('ym_sfdybt').hidden=true;
						Ext.getCmp('ym_sfkg').hidden=true;
						break;
				}
		

			win.show();
		};

		var ym_setup = function(){
			var win = Ext.getCmp('ym_setup_win');

			Ext.regModel('ym_setup_model', {
				fields: [
					{name: 'id',		type: 'integer'},
					{name: 'bt',		type: 'string'},
					{name: 'xx',		type: 'integer'},
					{name: 'yy',		type: 'integer'},
					{name: 'zt',		type: 'string'},
					{name: 'dx',		type: 'integer'},
					{name: 'sfdy',		type: 'string'},
					{name: 'sfdybt',		type: 'string'},
					{name: 'sfkg',		type: 'string'},
					{name: 'dylb',		type: 'string'}
				]
			});

			var ym_setup_store = Ext.create('Ext.data.Store', {
				id:'ym_setup_store',
				model : 'ym_setup_model',
				autoLoad: true,
				proxy: {
					type: 'ajax',
					url : '/desktop/get_ym_grid',
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
			var ym_setup_grid = new Ext.grid.GridPanel({
				id : 'ym_setup_grid',
				store: ym_setup_store,				
				columns: [
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '字段名称',	width : 100, sortable : true, dataIndex: 'bt'},
					{ text : 'x坐标',	width : 50, sortable : true, dataIndex: 'xx'},
					{ text : 'y坐标',	width : 50, sortable : true, dataIndex: 'yy'},
					{ text : '字体',	width : 50, sortable : true, dataIndex: 'zt'},
					{ text : '大小',	width : 50, sortable : true, dataIndex: 'dx'},
					{ text : '是否打印',	width : 50, sortable : true, dataIndex: 'sfdy'},
					{ text : '是否打印标题',	width : 80, sortable : true, dataIndex: 'sfdybt'},
					{ text : '是否前置空格',	width : 80, sortable : true, dataIndex: 'sfkg'},
					{ text : '打印类别',	width : 100, sortable : true, dataIndex: 'dylb'}
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
					id : 'ym_setup_win',
					title: '页面设置',
					
					width: 700,
					height: 580,
					minHeight: 530,
					layout: 'fit',
					modal: true,
					plain: true,
					items:ym_setup_grid,					
					tbar:[
					{
						xtype: 'button',
						iconCls: 'option',
						text:'修改',
						handler: function() {
							
							
							var grid = Ext.getCmp('ym_setup_grid');
							var records = grid.getSelectionModel().getSelection();
							if (records.length==1){
								var record = records[0];
								ym_disp(record,false);
							}else{
								alert("请选择一个字段进行修改。");
							}
						}
					},
					
					{
						xtype: 'button',
						iconCls: 'exit',
						text:'退出',
						handler: function() {
							//this.up('window').hide();
							Ext.getCmp('ym_setup_win').close();
						}
					}]
					
				});
			}
			

			win.show();
		};
      if(!win){
          win = desktop.createWindow({
              id: 'daprint',
              title:'档案打印',
              	
				width:250,
	            height:355,
              
				//layout: 'border',
				modal: true,
				
				items:[{
						
						//region: 'north',
					height: 320,
						xtype:'form',
						border:false,
						layout: 'absolute',
						items: [
							{
			          	      xtype: 'combobox',
				              width: 215,
				              fieldLabel: '打印类别',
								name: 'dylb',
								store: print_lb_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								id:'print_dylb',
				              labelWidth: 65,
				              x: 10,
				              y: 10
			            	},
							{
			                  xtype: 'combobox',
			                  width: 215,
			                  fieldLabel: '全宗名称',
								store: qz_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'id',
								displayField:'dwdm',
								triggerAction:'all',
								name: 'qzh',
			                  labelWidth: 65,
			                  x: 10,
			                  y: 40
			              	},
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '档案类别',
								store: dalb_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'id',
								displayField:'lbmc',
								triggerAction:'all',
								name: 'dalb',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 70
			                },
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '保管期限',
			                    labelWidth: 65,
								name: 'bgqx',
								store: bgqx_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								id:'print_bgqx',
			                    x: 10,
			                    y: 100
			                },
							{
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '年度',
								name: 'nd',
								id:'print_nd',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 130
			                },
			                  {
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '目录号',
								name: 'mlh',
								id:'print_mlh',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 160
			                },
			                {
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '机构问题号',
								name: 'jgwth',
								id:'print_jgwth',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 190
			                },
							{
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '起案卷号',
								name: 'qajh',
								id:'print_qajh',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 220
			                },
			                {
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '止案卷号',
								name: 'zajh',
								id:'print_zajh',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 250
			                },
			                {
			                    xtype: 'button',
			                    text: '页面设置',
								iconCls:'print',
			                    x: 10,
			                    y: 280,
								handler:function(){
									ym_setup();
								}
			                },
			                {
			                    xtype: 'button',
			                    text: '打印',
								iconCls:'print',
			                    x: 105,
			                    y: 280,
								handler : function() {
									var pars=this.up('panel').getForm().getValues();
									//Ext.getCmp('print_preview_img').getEl().dom.src = 'assets/dady/1_A2_0001_ML02.jpg';
									new Ajax.Request("/desktop/print_da", { 
										method: "POST",
										parameters: pars,
										onComplete:	 function(request) {
											fhz=request.responseText.split(":")
											if (fhz[0]=='success'){
												alert("打印成功。" + fhz[1]);
											}else{
												alert("打印失败。");
											}
										}
									});
								}
			                },
			                {
			                    xtype: 'button',
			                    text: '退出 ',
								iconCls:'exit',
			                    x: 175,
			                    y: 280
			                },
			                {
			                    xtype: 'box', //或者xtype: 'component',
					            id: 'print_preview_img',
					            width: 150, //图片宽度
								x: 350,
				                y: 10,
					            autoEl: {
					            tag: 'img',    //指定为img标签
					            alt: './dady/1_A2_0001_ML02.jpg' , }    //指定url路径


			                },
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '文件列表',
			                    labelWidth: 65,
			                    x: 350,
			                    y: 280
			                }


			              ]
					}

					]
              
          });
      }
      win.show();
      return win;
  }

});

