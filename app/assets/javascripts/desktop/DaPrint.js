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
	Ext.regModel('qz_model_print', {
	   	fields: [
	   		{name: 'id',		type: 'integer'},
	   		{name: 'dwdm',		type: 'string'}
	   	]
	   });
	   var qz_store_print = Ext.create('Ext.data.Store', {
	   		id:'qz_store_print',
	   		model : 'qz_model_print',
	   		proxy: {
	   			type: 'ajax',
	   			url : '/desktop/get_qz_byuserid_grid',
	   			extraParams: {userid:user_id},
	   			reader: {
	   				type: 'json',
	   				root: 'rows',
	   				totalProperty: 'results'
	   			}
	   		}				
	   });
	  qz_store_print.load();
	Ext.regModel('dalb_model_print', {
		fields: [
			{name: 'id',		type: 'integer'},
			{name: 'lbmc',		type: 'string'}
		]
	});
	var dalb_store_print = Ext.create('Ext.data.Store', {
			id:'dalb_store_print',
			model : 'dalb_model_print',
			proxy: {
				type: 'ajax',
				url : '/desktop/get_dalb_print_grid',
				extraParams: {userid:user_id},
				reader: {
					type: 'json',
					root: 'rows',
					totalProperty: 'results'
				}
			}				
	});
	dalb_store_print.load();
	
	var print_model_query='';
	Ext.regModel('print_model_print', {
		fields: [
			{name: 'id',		type: 'integer'},
			{name: 'mbmc',		type: 'string'}
		]
	});
	var print_store_print = Ext.create('Ext.data.Store', {
			id:'print_store_print',
			model : 'print_model_print',
			
			proxy: {
				type: 'ajax',
				url : '/desktop/get_print_print_grid',
				extraParams: {param:print_model_query},
				reader: {
					type: 'json',
					root: 'rows',
					totalProperty: 'results'
				}
			}				
	});
	
	
		var ym_disp = function(record,add_new){
			var win = Ext.getCmp('ym_disp_win');
			
			if (win==null) {
				win = new Ext.Window({
					id : 'ym_disp_win',
					title: '修改信息',
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
								text: 'X坐标(横):',
								x: 10,
								y: 40,
								width: 100
							}
							,
							{
								xtype: 'label',
								text: 'Y坐标(纵):',
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
					case '矿业权人': 
						Ext.getCmp('sfdybt').hidden=false;
						Ext.getCmp('ym_sfkg').hidden=true;
						Ext.getCmp('ym_sfdybt').hidden=false;
						Ext.getCmp('ym_sfdybt').x=130;
						Ext.getCmp('ym_sfdybt').y=190;
						break;
						case '矿业权人': 
							Ext.getCmp('sfdybt').hidden=false;
							Ext.getCmp('ym_sfkg').hidden=true;
							Ext.getCmp('ym_sfdybt').hidden=false;
							Ext.getCmp('ym_sfdybt').x=130;
							Ext.getCmp('ym_sfdybt').y=190;
							break;
						case '现许可证': 
							Ext.getCmp('sfdybt').hidden=false;
							Ext.getCmp('ym_sfkg').hidden=true;
							Ext.getCmp('ym_sfdybt').hidden=false;
							Ext.getCmp('ym_sfdybt').x=130;
							Ext.getCmp('ym_sfdybt').y=190;
							break;
						case '矿山名称': 
							Ext.getCmp('sfdybt').hidden=false;
							Ext.getCmp('ym_sfkg').hidden=true;
							Ext.getCmp('ym_sfdybt').hidden=false;
							Ext.getCmp('ym_sfdybt').x=130;
							Ext.getCmp('ym_sfdybt').y=190;
							break;
						case '矿山位置': 
							Ext.getCmp('sfdybt').hidden=false;
							Ext.getCmp('ym_sfkg').hidden=true;
							Ext.getCmp('ym_sfdybt').hidden=false;
							Ext.getCmp('ym_sfdybt').x=130;
							Ext.getCmp('ym_sfdybt').y=190;
							break;
						case '矿种': 
							Ext.getCmp('sfdybt').hidden=false;
							Ext.getCmp('ym_sfkg').hidden=true;
							Ext.getCmp('ym_sfdybt').hidden=false;
							Ext.getCmp('ym_sfdybt').x=130;
							Ext.getCmp('ym_sfdybt').y=190;
							break;
						case '登记类型': 
							Ext.getCmp('sfdybt').hidden=false;
							Ext.getCmp('ym_sfkg').hidden=true;
							Ext.getCmp('ym_sfdybt').hidden=false;
							Ext.getCmp('ym_sfdybt').x=130;
							Ext.getCmp('ym_sfdybt').y=190;
							break;		
						case '有效期限': 
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

	    var print_model_disp = function(id,name,add_new){
	      var win = Ext.getCmp('print_model_disp_win');

	      if (win==null) {
	        win = new Ext.Window({
	          id : 'print_model_disp_win',
	          title: '修改打印模板名称',
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
	            id : 'print_model_disp_form',
	            items: [
	              {
	                xtype: 'label',
	                text: '打印模板名称：',
	                x: 10,
	                y: 10,
	                width: 100
	              },
	              {
	                xtype: 'label',
	                text: '打印模板类别：',
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
	                store: print_model_store,
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
	                        new Ajax.Request("/desktop/update_print_model", { 
	                          method: "POST",
	                          parameters: pars,
	                          onComplete:  function(request) {
	                            text=request.responseText.split(':');
			                    if (text[0]=='success'){
	                              	Ext.getCmp('print_model_disp_win').close();
		                            Ext.getCmp('print_model_tree_panel').store.url='/desktop/get_print_model_tree';
									Ext.getCmp('print_model_tree_panel').store.clearOnLoad = false;
									Ext.getCmp('print_model_tree_panel').store.getRootNode().removeAll() ;
		                            Ext.getCmp('print_model_tree_panel').store.load();
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
	                        	new Ajax.Request("/desktop/insert_print_model", { 
		                          method: "POST",
		                          parameters: pars,
		                          onComplete:  function(request) {
		                            text=request.responseText.split(':');
				                    if (text[0]=='success'){

		                              	Ext.getCmp('print_model_disp_win').close();
		                              	Ext.getCmp('print_model_tree_panel').store.url='/desktop/get_print_model_tree';
										Ext.getCmp('print_model_tree_panel').store.clearOnLoad = false;
										Ext.getCmp('print_model_tree_panel').store.getRootNode().removeAll() ;
		                              	Ext.getCmp('print_model_tree_panel').store.load();
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
	                  Ext.getCmp('print_model_disp_win').close();
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
	        Ext.getCmp('print_model_disp_win').title="新增信息";
	        Ext.getCmp('button_user_add').text="新增";
	        Ext.getCmp('button_user_add').iconCls="add";
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
				//autoLoad: true,
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
					{ text : 'x坐标(横向调节)',	width : 50, sortable : true, dataIndex: 'xx'},
					{ text : 'y坐标(纵向调节)',	width : 50, sortable : true, dataIndex: 'yy'},
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
			          itemdblclick:{
			            fn:function(v,r,i,n,e,b){
			              var tt=r.get("zrq");
							ym_disp(r,false);
			            }
			          }
			        },
				
				viewConfig: {
					stripeRows:true
				}
			});
			var print_model_tree_store = Ext.create('Ext.data.TreeStore', {
	          autoLoad: true,
	          proxy: {
	              type: 'ajax',
	              url: 'desktop/get_print_model_tree',
	              extraParams: {style:"0"},
	              actionMethods: 'POST'
	          }
	      	}); 
	      var print_model_tree_panel = Ext.create('Ext.tree.Panel', {
	        id : 'print_model_tree_panel',
	        store: print_model_tree_store,
	        rootVisible:false,
	        useArrows: true,
			listeners:{
		        checkchange:function(node,checked,option){
		          if(checked){
		            root=Ext.getCmp('print_model_tree_panel').store.getRootNode();     
		            getNodes(root,false);
		            node.data.checked=true;
		            node.updateInfo({checked:true});
					jr_modelid='';
					jr_modelname='';
					jr_tm_modelid='';
					if (node.data.leaf==true){
						jr_modelid=node.data.id;
						jr_modelname=node.data.text;
						ym_setup_store.proxy.extraParams.dylx=node.data.id;
			            ym_setup_store.load();
					};

				  }
				}
			},
	        //singleExpand: true,
	        width: 200

	      });

			if (win==null) {
				win = new Ext.Window({
					id : 'ym_setup_win',
					title: '页面设置(单位：0.1毫米；页面左上角坐标：0,0；向上移动X坐标值减，向下移动坐标值加，向左移动Y坐标值减，向右移动Y坐标值加)',					
					width: 700,
					height: 580,
					minHeight: 530,
					layout: 'border',
					modal: true,
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
			              items:print_model_tree_panel
			            },
			            { title:'打印模板字段列表',
			              region:'center',
			              iconCls:'dept_tree',
			              xtype:'panel',
			              margins:'0 0 0 0',
			              layout:'fit',
			              split:true,
			              items:ym_setup_grid
			            }
			          ],					
					tbar:[{
			            xtype: 'button',
			            iconCls: 'add',
			            text:'新增模板名称',
			            handler: function() {
							print_model_disp("record","",true);
			              }
			          },
			          {
			            xtype: 'button',
			            iconCls: 'option',
			            text:'修改模板名称',
			            handler: function() {  
							if (jr_modelname!='标准通用打印模板' && jr_modelname!='标准土地登记打印模板'){            
			              		if (jr_modelid!=''){
				              		print_model_disp(jr_modelid,jr_modelname,false);        
				              	}else{
				                	alert("请选择一个模板名称进行修改。");
				              	}
							}else{
								alert("标准打印模板不能进行修改。");
							}
			            }
			          },
			          {
			            xtype: 'button',
			            iconCls: 'delete',
			            text:'删除模板名称',
			            handler: function() {
							if (jr_modelname!='标准通用打印模板' && jr_modelname!='标准土地登记打印模板'){
			              		if (jr_modelid!=''){
					              	var pars={id:jr_modelid};
					                  new Ajax.Request("/desktop/delete_print_model", { 
					                    method: "POST",
					                    parameters: pars,
					                    onComplete:  function(request) {
					                      text=request.responseText.split(':');
					                      if (text[0]=='success'){
					                        alert("删除成功。");    
					                        jr_modelid='';
											jr_tm_modelid='';
					                        Ext.getCmp('print_model_tree_panel').store.url='/desktop/get_print_model_tree';
											Ext.getCmp('print_model_tree_panel').store.clearOnLoad = false;
											Ext.getCmp('print_model_tree_panel').store.getRootNode().removeAll() ;
				                            Ext.getCmp('print_model_tree_panel').store.load();
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
							}else{
								alert("标准打印模板不能进行删除。");
							}
			            }
			          },
					{
						xtype: 'button',
						iconCls: 'option',
						text:'修改打印字段',
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
	            height:380,              
				//layout: 'border',
				modal: true,				
				items:[{						
						//region: 'north',
						height: 345,
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
								store: qz_store_print,
								emptyText:'请选择',
								mode: 'local',
								minChars : 2,
								valueField:'id',
								displayField:'dwdm',
								triggerAction:'all',
								name: 'qzh',
								id:'print_qzh',
			                  	labelWidth: 65,
			                  	x: 10,
			                  	y: 40
			              	},
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '档案类别',
								store: dalb_store_print,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'id',
								displayField:'lbmc',
								triggerAction:'all',
								name: 'dalb',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 70,
								listConfig: { loadMask: false },
				                listeners:{
				                    select:function(combo, record,index){
				                    	var parent=Ext.getCmp('print_model');
									
					                    parent.clearValue();
										if (this.value=='3' || this.value=='5' || this.value=='6' || this.value=='7' ){
					                    	parent.store.load({params:{param:'土地登记打印'}});
											print_model_query='土地登记打印';
										}else{
											if(this.value=='35'){
												parent.store.load({params:{param:'矿业权打印'}});
												print_model_query='矿业权打印';
											}else{
												parent.store.load({params:{param:'通用打印'}});
												print_model_query='通用打印';
											}
										}
						                  //var currentImage = combo.getStore().getById(parent.getValue());
						                  //var currentStoreIndex = parent.getStore().indexOf(currentImage);
						                  //var nextStoreValue = parent.getStore().getAt(1).get('id');
						                  parent.setValue('标准'+print_model_query+'模板');
				                    //Ext.getCmp('fj_sslc').lastQuery = null;
				                  }
								}
			                },
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '保管期限',
			                    labelWidth: 65,
								name: 'bgqx',
								store: doc_bgqx_store,
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
			                    xtype: 'textfield',
			                    width: 215,
								hidden:true,
			                    fieldLabel: '止案卷号',
								name: 'userid',
								id:'print_userid',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 250
			                },
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '打印模板',
								id:'print_model',
								store: print_store_print,
								emptyText:'请选择',
								//mode: 'remote',
								queryMode:'local', 
								minChars : 2,
								valueField:'mbmc',
								displayField:'mbmc',
								triggerAction:'all',
								name: 'print_model',
								listConfig: { loadMask: false },
			                    labelWidth: 65,
			                    x: 10,
			                    y: 280
			                },
							{
			                    xtype: 'button',
			                    text: '页面设置',
								iconCls:'print',
			                    x: 10,
			                    y: 310,
								handler:function(){
									ym_setup();
								}
			                },
							{
			                    xtype: 'button',
			                    text: '打印',
								iconCls:'print',
			                    x: 105,
			                    y: 310,
								handler : function() {
									var pars=this.up('panel').getForm().getValues();
									//Ext.getCmp('print_preview_img').getEl().dom.src = 'assets/dady/1_A2_0001_ML02.jpg';
									new Ajax.Request("/desktop/print_da", { 
										method: "POST",
										parameters: pars,
										onComplete:	 function(request) {
											fhz=request.responseText.split(":");
											if (fhz[0]=='success'){	
												if (pars.dylb=='卷内目录打印'){									
											    	printfile=fhz[1].split(",");
												    for (k=0;k<printfile.length;k++){
												      LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM'));   				             
										              //LODOP.ADD_PRINT_BARCODE(0,0,200,100,"Code39","*123ABC4567890*");
										              //image_path = "http://192.168.10.193:3000/assets/dady/tmp1/" + printfile[k];
														//alert(window.location.href);
													  var number = Math.random(); 
													  image_path = window.location.href + "assets/dady/tmp1/" + printfile[k] +'?' + number;
													  LODOP.PRINT_INIT(image_path);  
													  if (pars.dylb=='案卷目录打印'){
															LODOP.SET_PRINT_PAGESIZE(2,0,0,"A4");
													  }else{
															if (pars.dylb=='卷内目录打印'){
																LODOP.SET_PRINT_PAGESIZE(1,0,0,"A4");
															}

													  }									      
										              LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
										              LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
										              LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
										              //LODOP.PREVIEW();
												      LODOP.PRINT();
													  
													}
													alert("打印成功。" );
												}else{
													if(pars.dylb=='案卷封面打印'){
														if(Ext.getCmp('print_qzh').rawValue!='无锡市国土资源局'){
															window.open(fhz[1],'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
														}else{
															printfile=fhz[1].split(",");
														    for (k=0;k<printfile.length;k++){
														      LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM'));
															  var number = Math.random(); 
															  image_path = window.location.href + "assets/dady/tmp1/" + printfile[k] +'?' + number;
															  LODOP.PRINT_INIT(image_path);  															  								      
												              LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
												              LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
												              LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
												              //LODOP.PREVIEW();
														      LODOP.PRINT();
															}
															alert("打印成功。" );
														}
													}
													else{
														if(pars.dylb=='备考表打印'){
															cz_msg(fhz[1]);
															//window.open(fhz[1],'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
														}else{
															cz_msg(fhz[1]);
														}
													}
													
												//	window.open(fhz[1],'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
												}
													//alert("打印成功。"+fhz[1] );	
													//alert("打印成功。" );								
											}else{
												alert("打印失败。"+request.responseText);
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
			                    y: 310,
								handler:function(){
									Ext.getCmp('daprint').close();
								}
			                }
			              ]
					}
				]
              
          });
      }
	  Ext.getCmp('print_userid').setValue(user_id);
      win.show();
      return win;
  }
});

