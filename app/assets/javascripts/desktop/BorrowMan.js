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


Ext.define('MyDesktop.BorrowMan', {
	extend: 'Ext.ux.desktop.Module',

	requires: [
		'*',
		'Ext.tree.*',
		'Ext.data.*',
		'Ext.window.MessageBox'
		//'Ext.QuickTips'
	],

	id:'borrowman',

	init : function(){
		this.launcher = {
			text: '借阅管理',
			iconCls:'borrowman',
			handler : this.createWindow,
			scope: this
		}
	},
	//Ext.QuickTips.init();
	
	  createWindow : function(){
		var jyqq_add_change='1';
		var jydj_jyzt='2';
		insert_qx="";
		zxjyid="";
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
						buttons:[
							{
								xtype: 'button',
								cls: 'exit',
								text:'退出',
								handler: function() {
									//this.up('window').hide();
									Ext.getCmp('archive_detail_win').close();
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
	    var desktop = this.app.getDesktop();
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
		function get_mlqx_NodesChecked(node) {
			//insert_qx="";
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
	    var win = desktop.getWindow('borrowman');
		var jydjform= new Ext.FormPanel({
				id : 'jydj_form',
				fileUpload: true,
				width: 1000,
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
				tbar:[							  
					{	
						xtype:'button',text:'登记',tooltip:'登记',id:'dj',iconCls:'dj',
						handler: function() {
							var grid = Ext.getCmp('jydjlist_dj_grid');
							var data=grid.getStore().data							
							//var data=grid.getSelectionModel().getSelection();
							//alert(data.length);
							if (data.length==0){
								alert("您最少要选择一条案卷进行登记。");
							}else{
								var pars=Ext.getCmp('jydj_form').getForm().getValues();								
								if (pars['jyr']!='' || pars['jydw']!=''){
									var ids=[];
									//Ext.Array.each(data,function(items){
									//	ids.push(items.get("id"));
								
									//});
									for(k=0;k<data.length;k++){
										ids.push(data.items[k].data.id);
									};
									//alert(ids);
									Ext.getCmp('jyzt').setValue('2');
									Ext.getCmp('jy_aj_list').setValue(ids);									
									new Ajax.Request("/desktop/insert_jylc", { 
										method: "POST",
										parameters: Ext.getCmp('jydj_form').getValues(),
										onComplete:	 function(request) {
											if (request.responseText=='success'){
												alert("登记成功。");
												//grid.removeAll();
												grid.store.removeAll();
												Ext.getCmp('jyr').setValue("");
												Ext.getCmp('jydw').setValue("");
												Ext.getCmp('lyxg').setValue("");
												Ext.getCmp('bz').setValue("");
												Ext.getCmp('cdlr').setValue("");
												Ext.getCmp('zj').setValue("");
												Ext.getCmp('fyys').setValue("0");
												Ext.getCmp('zcys').setValue("");
												//grid.removeAll;
												//grid.store.remove(1);
												//data.removeAll;
											}else{
												alert("登记失败，请重新登记。");
											}
										}
									});
								}else{
									alert('借阅人和借阅单位不能同时为空。');
								}																
							}
						}
					},
					{	
						xtype:'button',text:'阅览',tooltip:'阅览',id:'yl',iconCls:'yl',
						
							
							handler: function() {
								var grid = Ext.getCmp('jydjlist_dj_grid');
								var data=grid.getStore().data							
								//var data=grid.getSelectionModel().getSelection();
								//alert(data.length);
								if (data.length==0){
									alert("您最少要选择一条案卷进行登记。");
								}else{
									var pars=Ext.getCmp('jydj_form').getForm().getValues();								
									if (pars['jyr']!='' || pars['jydw']!=''){
										var ids=[];
										//Ext.Array.each(data,function(items){
										//	ids.push(items.get("id"));

										//});
										for(k=0;k<data.length;k++){
											ids.push(data.items[k].data.id);
										};
										//alert(ids);
										Ext.getCmp('jyzt').setValue('4');
										Ext.getCmp('jy_aj_list').setValue(ids);									
										new Ajax.Request("/desktop/insert_jylc", { 
											method: "POST",
											parameters: Ext.getCmp('jydj_form').getValues(),
											onComplete:	 function(request) {
												if (request.responseText=='success'){
													alert("登记成功。");
													//grid.removeAll();
													grid.store.removeAll();
													Ext.getCmp('jyr').setValue("");
													Ext.getCmp('jydw').setValue("");
													Ext.getCmp('lyxg').setValue("");
													Ext.getCmp('bz').setValue("");
													Ext.getCmp('cdlr').setValue("");
													Ext.getCmp('zj').setValue("");
													Ext.getCmp('fyys').setValue("0");
													Ext.getCmp('zcys').setValue("");
													//grid.removeAll;
													//grid.store.remove(1);
													//data.removeAll;
												}else{
													alert("登记失败，请重新登记。");
												}
											}
										});
									}else{
										alert('借阅人和借阅单位不能同时为空。');
									}																
								}

								
							}							
						
					},
				  //  {	
				  //  	xtype:'button',text:'打印',tooltip:'打印',id:'print',iconCls:'print',
				  //  	handler: function() {
				  //  	}
				  //  },
					{	
						xtype:'button',text:'读取身份证',tooltip:'读取身份证',id:'jydj_sfz',iconCls:'option',
						handler: function() {									
									new Ajax.Request("/desktop/get_sfz", { 
										method: "POST",
										//parameters: eval(insert_qx),
										onComplete:	 function(request) {
											reques=request.responseText.split(':');
											if (reques[0]=='success'){
												sfz=reques[1].split(";")
												Ext.getCmp('jydj_jyr').setValue(sfz[0]);
												Ext.getCmp('jydj_zj').setValue("身份证：" + sfz[2]);
												Ext.getCmp('jydj_bz').setValue(sfz[1]);
											}else{
												alert(reques[1]);
											}
										}
									});																													
						}
					}],
				items: [{
					width: 370,
					height: 180,
					xtype:'form',
					border:false,
					layout: 'absolute',
					//id : 'jydj_form',
					items: [		{
										xtype: 'textfield',
										hidden : true,
										name : 'jyzt' ,
										id:'jyzt'										
									},
									{
										xtype: 'textfield',
										hidden : true,
										name : 'czrid' ,
										id:'czrid'										
									},
									{
										xtype: 'textfield',
										hidden : true,
										name : 'jy_aj_list' ,
										id:'jy_aj_list'										
									},
					                {
					                    xtype: 'textfield',
					                    name: 'jyr',
										id:'jydj_jyr',
					                    fieldLabel: '',
					                    x: 75,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    name: 'jydw',
					                    width: 465,
					                    fieldLabel: '',
					                    x: 295,
					                    y: 5
					                },
					                
					                {
					                    xtype: 'textfield',
					                    name: 'zj',
										id:'jydj_zj',
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
										id:'cdlr',
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
					                    xtype: 'label',
					                    height: 25,
					                    width: 65,
					                    text: '复印页数：',
					                    x: 770,
					                    y: 5
					                },
									{
					                    xtype: 'textfield',
					                    name: 'fyys',
					                    fieldLabel: '',
					                    x: 840,
					                    y: 5
					                },
									{
					                    xtype: 'label',
					                    height: 20,
					                    width: 65,
					                    text: '摘抄页数：',
					                    x: 770,
					                    y: 30
					                },
									{
					                    xtype: 'textfield',
					                    name: 'zcys',
					                    fieldLabel: '',
					                    x: 840,
					                    y: 30
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
					                    height: 20,
					                    width: 55,
					                    text: '备注：',
					                    x: 770,
					                    y: 55
					                },
					                
					                {
					                    xtype: 'textfield',
					                    name: 'bz',
										id:'jydj_bz',
					                    width: 150,
					                    fieldLabel: '',
					                    x: 840,
					                    y: 55
					                }
					            ]}],
				
			});
			
		
		  var qwjsform= new Ext.FormPanel({
				id : 'qwjs_form',
				fileUpload: true,
				width: 1000,
				height : 90,
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
					width: 1000,
					height: 90,
					xtype:'form',
					border:false,
					layout: 'absolute',
					//id : 'daglaj_form',
					items: [		
					                {
					                    xtype: 'textfield',
					                    id: 'mlh',
										name:'mlh',
					                    width: 140,
					                    fieldLabel: '',
					                    x: 65,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'ajh',
										name:'ajh',
					                    width: 145,
					                    fieldLabel: '',
					                    x: 270,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'ajtm',
										name:'ajtm',
					                    width: 185,
					                    fieldLabel: '',
					                    x: 495,
					                    y: 5
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'wh',
										name:'wh',
					                    width: 140,
					                    fieldLabel: '',
					                    x: 65,
					                    y: 30
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'zrz',
										name:'zrz',
					                    width: 145,
					                    fieldLabel: '',
					                    x: 270,
					                    y: 30
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'tm',
										name:'tm',
					                    width: 185,
					                    fieldLabel: '',
					                    x: 495,
					                    y: 30
					                },
					                {
					                    xtype: 'button',
					                    height: 70,
					                    id: 'ss',
					                    width: 75,
					                    text: '搜索',
					                    x: 910,
					                    y: 5,
										handler: function() {
											var pars=this.up('panel').getForm().getValues();
											//var form = Ext.getCmp('qwjs_form').getForm();
											//pars = form.getValues('tm');
											var cx_tj;
											var cdlr;
											cx_tj='';
											if(pars['djh']!=''){
												cx_tj="{djh:'" + pars['djh'] + "'";
												cdlr="地籍号："+ pars['djh'];
											};
											if(pars['qlr']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",qlr:'" + pars['qlr']+ "'";
													cdlr=cdlr + ",权利人名称："+ pars['qlr'];
												}else{
													cx_tj="{qlr:'" + pars['qlr']+ "'";
													cdlr="权利人名称："+ pars['qlr'];
												}
											};
											if(pars['tdzl']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",tdzl:'" + pars['tdzl']+ "'";
													cdlr=cdlr + ",土地座落："+ pars['tdzl'];
												}else{
													cx_tj="{tdzl:'" + pars['tdzl']+ "'";
													cdlr="土地座落："+ pars['tdzl'];
												}
											};
											if(pars['zrz']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",zrz:'" + pars['rzr']+ "'";
													cdlr=cdlr + ",责任者："+ pars['rzr'];
												}else{
													cx_tj="{rzr:'" + pars['zrz']+ "'";
													cdlr="责任者："+ pars['rzr'];
												}
											};
											if(pars['wh']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",wh:'" + pars['wh']+ "'";
													cdlr=cdlr + ",文号："+ pars['wh'];
												}else{
													cx_tj="{wh:'" + pars['wh']+ "'";
													cdlr="文号："+ pars['wh'];
												}
											};
											if(pars['tm']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",tm:'" + pars['tm']+ "'";
													cdlr=cdlr + ",题名："+ pars['tm'];
												}else{
													cx_tj="{tm:'" + pars['tm']+ "'";
													cdlr="题名："+ pars['tm'];
												}
											};
											if(pars['ajtm']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",ajtm:'" + pars['ajtm']+ "'";
													cdlr=cdlr + ",案卷标题："+ pars['ajtm'];
												}else{
													cx_tj="{ajtm:'" + pars['ajtm']+ "'";
													cdlr="案卷标题："+ pars['ajtm'];
												}
											};
											if(pars['mlh']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",mlh:'" + pars['mlh']+ "'";
													cdlr=cdlr +",目录号："+ pars['mlh'];
												}else{
													cx_tj="{mlh:'" + pars['mlh']+ "'";
													cdlr="目录号："+ pars['mlh'];
												}
											};
											if(pars['ajh']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",ajh:'" + pars['ajh']+ "'";
													cdlr=cdlr+ ",案卷号："+ pars['ajh'];
												}else{
													cx_tj="{ajh:'" + pars['ajh']+ "'";
													cdlr="案卷号："+ pars['ajh'];
												}
											};
											if(pars['nd']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",nd:'" + pars['nd']+ "'";
													cdlr=cdlr+ ",年度："+ pars['ajh'];
												}else{
													cx_tj="{nd:'" + pars['nd']+ "'";
													cdlr="年度："+ pars['nd'];
												}
											};
											if(pars['tdzh']!=''){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",tdzh:'" + pars['tdzh']+ "'";
													cdlr=cdlr+ ",土地证号："+ pars['tdzh'];
												}else{
													cx_tj="{tdzh:'" + pars['tdzh']+ "'";
													cdlr="土地证号："+ pars['tdzh'];
												}
											};
											if(pars['dalb']!=undefined){
												if (cx_tj!=''){
													cx_tj=cx_tj + ",dalb:'" + pars['dalb']+ "'";
													cdlr=cdlr+ ",档案类别："+ pars['dalb'];
												}else{
													cx_tj="{dalb:'" + pars['dalb']+ "'";
													cdlr="档案类别："+ pars['tdzh'];
												}
											};
											if (cx_tj!=''){
												cx_tj="(" + cx_tj + ",userid:" + currentUser.id + "})";
												var grid = Ext.getCmp('archive_jydj_grid');
											//grid.initialConfig.bbar[0].moveFirst();
												grid.store.proxy.url="/desktop/archive_query_jygl";
												
												archive_jydj_store.proxy.extraParams=eval(cx_tj);
												//archive_store.proxy.extraParams=Ext.getCmp('qwjs_form').getValues();
												archive_jydj_store.load();
												Ext.getCmp('cdlr').setValue(cdlr);
											};
											
										}
					
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
					                    height: 20,
					                    text: '档案类别：',
					                    x: 695,
					                    y: 5
					                },
									{
					                    xtype: 'combobox',
					                    id: 'dacx_dalb',
										name:'dalb',
					                    width: 140,
					                    fieldLabel: '',
										store: dalb_store_print,
										emptyText:'请选择',
										mode: 'remote',
										minChars : 2,
										valueField:'id',
										displayField:'lbmc',
										triggerAction:'all',
					                    x: 760,
					                    y: 5
					                },
									{
					                    xtype: 'label',
					                    height: 20,
					                    text: '年度：',
					                    x: 695,
					                    y: 30
					                },
									{
						                xtype: 'textfield',
					                    id: 'dacx_nd',

					                    width: 140,
					                    fieldLabel: '',
										name:'nd',
					                    x: 760,
					                    y: 30
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
					                    id: 'djh',
					
					                    width: 140,
					                    fieldLabel: '',
										name:'djh',
					                    x: 65,
					                    y: 55
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'tdzl',
										name:'tdzl',
					                    width: 145,
					                    fieldLabel: '',
					                    x: 270,
					                    y: 55
					                },
					                {
					                    xtype: 'textfield',
					                    id: 'qlr',
										name:'qlr',
					                    width: 185,
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
					                    xtype: 'label',
					                    height: 20,
					                    width: 60,
					                    text: '土地证号：',
					                    x: 695,
					                    y: 55
					                },
					                							
									
					                {
					                    xtype: 'textfield',
					                    id: 'dacx_tdzh',
										name:'tdzh',
					                    width: 140,
					                    fieldLabel: '',
					                    x: 760,
					                    y: 55
					                },
									
					            ]}]
			});
			Ext.regModel('jydjlist_dj_model', {
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
			
			var jydjlist_dj_store = Ext.create('Ext.data.Store', {
				id:'jydjlist_dj_store',
				model : 'jydjlist_dj_model',
				//autoload:true,
				proxy: {
					type: 'ajax',
					url : '/desktop/get_archive',
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

			var jydjlist_dj_Grid = new Ext.grid.GridPanel({
				id : 'jydjlist_dj_grid',
				store: jydjlist_dj_store,
				
				
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
					{ text : '起日期',	 width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : '止日期',	 width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : '起年月',	 width : 75, sortable : true, dataIndex: 'qny'},
					{ text : '止年月',	 width : 75, sortable : true, dataIndex: 'zny'},
					{ text : '档号',	width : 75, sortable : true, dataIndex: 'dh'},
					{ text : '地籍号',	 width : 75, sortable : true, dataIndex: 'djh'},
					{ text : '备注',	flex : 1, sortable : true, dataIndex: 'bz'}
					],
					//selType:'checkboxmodel',
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
								  case "35":
									DispAj_kyq(r,'3',r.data.dh);
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
			
			var archive_jydj_store = Ext.create('Ext.data.Store', {
				id:'archive_jydj_store',
				model : 'archive_model',
				
				proxy: {
					type: 'ajax',
					url : '/desktop/get_archive',
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
			function renderDes(value, cellmeta, record, rowIndex, columnIndex, store){
				return "<span style='color:RGB(255, 69, 0);' ext:qtip='" + value + "'>" + value + "</span>";
			};
			var archiveGrid = new Ext.grid.GridPanel({
				id : 'archive_jydj_grid',
				store: archive_jydj_store,
				bbar:[
		          new Ext.PagingToolbar({
		            store: archive_jydj_store,
		            pageSize: 25,
		            width : 700,
		            border : false,
		            displayInfo: true,
		            displayMsg: '{0} - {1} of {2}',
		            emptyMsg: "没有找到！",
		            prependButtons: true,
					items : [ {	
						xtype:'button',text:'增加至借阅列表',tooltip:'增加至借阅列表',id:'add_jylb',iconCls:'add',
						handler: function() {
							var grid = Ext.getCmp('archive_jydj_grid');
							var data=grid.getSelectionModel().getSelection();
							if (data.length==0){
								alert("您最少要选择一条案卷进行处理。");
							}else{
								var ids=[];
								Ext.Array.each(data,function(record){
									ids.push(record.get("id"));
						
								});
								//alert(ids);
								Ext.getCmp('jy_aj_list').setValue(ids);
								new Ajax.Request("/desktop/check_jylist", { 
									method: "POST",
									parameters: Ext.getCmp('jydj_form').getValues(),
									onComplete:	 function(request) {
										if (request.responseText=='success'){
											Ext.Array.each(data,function(record){
												var gjcx = Ext.getCmp('jydjlist')													
												gjcx.expand(true);	
												var r = Ext.create('jydjlist_dj_model', {
								                    mlh: record.get("mlh"),
								                    flh: record.get("flh"),
								                    ajh: record.get("ajh"),
													tm: record.get("tm"),
								                    dalb: record.get("dalb"),
								                    qzh: record.get("qzh"),
													id: record.get("id"),
								                    nd: record.get("nd"),
													js: record.get("js"),
								                    bgqx: record.get("bgqx"),
								                    ys: record.get("ys")
								                });
								                jydjlist_dj_store.insert(0, r);
											});
										}else{
											alert(request.responseText);
										}
									}
								});
							}						
						}
					},
					{	
						xtype:'button',text:'从借阅列表中删除',tooltip:'从借阅列表中删除',id:'del_jylb',iconCls:'delete',
						handler: function() {
							var grid = Ext.getCmp('jydjlist_dj_grid');
							var data=grid.getSelectionModel().getSelection();
							if (data.length==0){
								alert("您最少要选择一条案卷进行删除。");
							}else{
								jydjlist_dj_store.remove(data);
							}						
						}
					}]
		          })
		        ],
				
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
					{ text : '起日期',	 width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : '止日期',	 width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
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
								  case "35":
									DispAj_kyq(r,'3',r.data.dh);
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
			
			
			
			//archiveGrid.on('itemmousedown',function(v,r,h,n,e){//添加mouseover事件
			  	//var index = archiveGrid.getView().findRowIndex(e.getTarget());//根据mouse所在的target可以取到列的位置
			  	//if(index!==false){//当取到了正确的列时，（因为如果传入的target列没有取到的时候会返回false）
			   		//var record = store.getAt(index);//把这列的record取出来
			   		//var str = Ext.encode(r.data);//组装一个字符串，这个需要你自己来完成，这儿我把他序列化
			   		//var rowEl = Ext.get(e.getTarget());//把target转换成Ext.Element对象
					//h.set({
			    	//	'ext:qtip':str  //设置它的tip属性
			   		//	});
			   		//rowEl.set({
			    		//'ext:qtip':str  //设置它的tip属性
			   			//},false);
				//}
				//alert('d');
			//});
			
			Ext.regModel('jydjlc_model', {
				fields: [
					{name: 'id',		type: 'integer'},
					{name: 'jyr',		type: 'string'},
					{name: 'jydw',		type: 'string'},
					{name: 'jyqx',		type: 'string'},
					{name: 'lymd',		type: 'string'},
					{name: 'cdlr',		type: 'string'},
					{name: 'jysj',		type: 'date', dateFormat: 'Y-m-d H:i:s'},
					{name: 'jyzt',		type: 'integer'},
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
			var jydjlc_store = Ext.create('Ext.data.Store', {
				id:'jydjlc_store',
				model : 'jydjlc_model',
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
			var jydjlc_grid = new Ext.grid.GridPanel({
				id : 'jydjlc_grid',
				store: jydjlc_store,
				
				
				columns: [
					//{ text : 'file_name', flex : 1,	sortable : true, dataIndex: 'level4'},
					//{ text : 'file_size',	 width : 75, sortable : true, dataIndex: 'file_size'}
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '借阅人',	width : 50, sortable : true, dataIndex: 'jyr'},
					{ text : '借阅单位',	width : 75, sortable : true, dataIndex: 'jydw'},
					{ text : '查档内容',	width : 75, sortable : true, dataIndex: 'cdlr'},
					{ text : '借阅期限', width : 75, sortable : true, dataIndex: 'jyqx'},
					
					{ text : '利用目的',	 width : 75, sortable : true, dataIndex: 'lymd'},
					
					{ text : '借阅时间',	 width : 75, sortable : true, dataIndex: 'jysj', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : 'jyzt',	 width : 0, sortable : true, dataIndex: 'jyzt'},
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
			jydjlc_grid.on("select",function(node){
				data = node.selected.items[0].data;		 // data.id, data.parent, data.text, data.leaf
				archive_id = data.id; 
				if (data.jyzt==2 || data.jyzt==4){
					
					jydjlist_store.proxy.extraParams=eval("({id:" + data.id + ",jyzt:" + data.jyzt + "})");
					jydjlist_store.load();
					
				}else{
					jydjlist_store.proxy.extraParams.query='';
					jydjlist_store.load();
				}
			});
			Ext.regModel('jydjlist_model', {
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
			var jydjlist_store = Ext.create('Ext.data.Store', {
				id:'jydjlist_store',
				model : 'jydjlist_model',
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
			var jydjlist_grid = new Ext.grid.GridPanel({
				id : 'jydjlist_grid',
				store: jydjlist_store,
				
				
				columns: [
					//{ text : 'file_name', flex : 1,	sortable : true, dataIndex: 'level4'},
					//{ text : 'file_size',	 width : 75, sortable : true, dataIndex: 'file_size'}
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : 'dalb',	width : 0, sortable : true, dataIndex: 'dalb'},
					{ text : '档号',	width : 75, sortable : true, dataIndex: 'dh'},
					{ text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
					
					{ text : '分类号',	 width : 75, sortable : true, dataIndex: 'flh'},
					{ text : '案卷号',	 width : 75, sortable : true, dataIndex: 'ajh'},
					{ text : '案卷标题',  width : 175, sortable : true, dataIndex: 'tm'},
					
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
					selType:'checkboxmodel',
					multiSelect:true,
				//width : 800,
				//height : 300,
				viewConfig: {
					stripeRows:true
				}
			});	

			Ext.regModel('zxjydjlc_model', {
				fields: [
					{name: 'id',		type: 'integer'},
					{name: 'ajtm',		type: 'string'},
					{name: 'tm',		type: 'string'},
					{name: 'wh',		type: 'string'},
					{name: 'request_id',		type: 'string'}
					
				]
			});
			var zxjydjlc_store = Ext.create('Ext.data.Store', {
				id:'zxjydjlc_store',
				model : 'zxjydjlc_model',
				autoload:true,
				proxy: {
					type: 'ajax',
					url : '/desktop/get_zxjy',
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
			var zxjydjlc_grid = new Ext.grid.GridPanel({
				id : 'zxjydjlc_grid',
				store: zxjydjlc_store,
				
				
				columns: [
					{ text : 'id',	width : 0, sortable : true, dataIndex: 'id'},
					{ text : '案卷标题',	width : 120, sortable : true, dataIndex: 'ajtm'},
					{ text : '卷内题名',	width : 120, sortable : true, dataIndex: 'tm'},
					{ text : '文号',	width : 120, sortable : true, dataIndex: 'wh'}					
					],
				viewConfig: {
					stripeRows:true
				}
			});
			zxjydjlc_grid.on("select",function(node){
				data = node.selected.items[0].data;		 // data.id, data.parent, data.text, data.leaf
				archive_id = data.id; 
				zxjyid=data.id;
				cx_tj="";	
				if(data.ajtm!=''){
					if (cx_tj!=''){
						cx_tj=cx_tj + ",ajtm:'" +data.ajtm+ "'";
					}else{
						cx_tj="{ajtm:'" +data.ajtm+ "'";
					}
				};	
				if(data.tm!=''){
					if (cx_tj!=''){
						cx_tj=cx_tj + ",tm:'" +data.tm+ "'";
					}else{
						cx_tj="{tm:'" +data.tm+ "'";
					}
				};
				if(data.wh!=''){
					if (cx_tj!=''){
						cx_tj=cx_tj + ",wh:'" +data.wh+ "'";
					}else{
						cx_tj="{wh:'" +data.wh+ "'";
					}
				};	
				cx_tj="(" + cx_tj + ",userid:" + currentUser.id + "})";		
				
				zxjydjlist_store.proxy.extraParams=eval(cx_tj);
				zxjydjlist_store.load();					
			});
			
			
			var zxjydjlist_store = Ext.create('Ext.data.Store', {
				id:'zxjydjlist_store',
				model : 'jydjlist_model',
				proxy: {
					type: 'ajax',
					url : '/desktop/archive_query_jygl',
					extraParams: {query:''},
					reader: {
						type: 'json',
						root: 'rows',
						totalProperty: 'results'
					}
				}
			});
			var zxjydjlist_grid = new Ext.grid.GridPanel({
				id : 'zxjydjlist_grid',
				store: zxjydjlist_store,				
				columns: [
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
					{ text : '起日期',	 width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : '止日期',	 width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
					{ text : '起年月',	 width : 75, sortable : true, dataIndex: 'qny'},
					{ text : '止年月',	 width : 75, sortable : true, dataIndex: 'zny'},
					
					{ text : '档号',	width : 75, sortable : true, dataIndex: 'dh'},
					{ text : '地籍号',	 width : 75, sortable : true, dataIndex: 'djh'},
					{ text : '备注',	flex : 1, sortable : true, dataIndex: 'bz'}					
					],
					listeners:{
						itemdblclick:{
							fn:function(v,r,i,n,e,b){
								var tt=r.get("zrq");
								//showContactForm();
								DispAj(r,false);
							}
						}
					},
					selType:'checkboxmodel',
					multiSelect:true,
				//width : 800,
				//height : 300,
				viewConfig: {
					stripeRows:true
				}
			});
			zxjydjlist_grid.on("select",function(node){
				data = node.selected.items[0].data;
			    timage_store.proxy.extraParams = {dh:data.dh, type:'1'};
			    timage_store.load();			
			});
			
			var jyqq = function(recordad){//add_change 1代表新增，２代表修改
				var js_jyqq_form= new Ext.FormPanel({
						id : 'js_jyqq_form',
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
							                    width: 185,
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
							                    width: 185,
							                    fieldLabel: '',
							                    x: 495,
							                    y: 30
							                },
							                {
							                    xtype: 'button',
							                    height: 70,
							                    id: 'js_jyqq_ss',
							                    width: 75,
							                    text: '获取条件',
							                    x: 690,
							                    y: 5,
												handler: function() {
													var pars=this.up('panel').getForm().getValues();
													//var form = Ext.getCmp('qwjs_form').getForm();
													//pars = form.getValues('tm');
													var cx_tj;
													var cdlr;
													cx_tj='';
													if(pars['djh']!=''){
														cx_tj='{djh:"' + pars['djh'] + '"';
														cdlr="地籍号："+ pars['djh'];
													};
													if(pars['qlr']!=''){
														if (cx_tj!=''){
															cx_tj=cx_tj + ',qlr:"' + pars['qlr']+ '"';
															cdlr=cdlr + ",权利人名称："+ pars['qlr'];
														}else{
															cx_tj='{qlr:"' + pars['qlr']+'"';
															cdlr="权利人名称："+ pars['qlr'];
														}
													};
													if(pars['tdzl']!=''){
														if (cx_tj!=''){
															cx_tj=cx_tj + ',tdzl:"' + pars['tdzl']+ '"';
															cdlr=cdlr + ",土地座落："+ pars['tdzl'];
														}else{
															cx_tj='{tdzl:"' + pars['tdzl']+ '"';
															cdlr="土地座落："+ pars['tdzl'];
														}
													};
													if(pars['zrz']!=''){
														if (cx_tj!=''){
															cx_tj=cx_tj + ',zrz:"' + pars['rzr']+ '"';
															cdlr=cdlr + ",责任者："+ pars['rzr'];
														}else{
															cx_tj='{rzr:"' + pars['zrz']+ '"';
															cdlr="责任者："+ pars['rzr'];
														}
													};
													if(pars['wh']!=''){
														if (cx_tj!=''){
															cx_tj=cx_tj + ',wh:"' + pars['wh']+ '"';
															cdlr=cdlr + ",文号："+ pars['wh'];
														}else{
															cx_tj='{wh:"' + pars['wh']+ '"';
															cdlr="文号："+ pars['wh'];
														}
													};
													if(pars['tm']!=''){
														if (cx_tj!=''){
															cx_tj=cx_tj + ',tm:"' + pars['tm']+ '"';
															cdlr=cdlr + ",题名："+ pars['tm'];
														}else{
															cx_tj='{tm:"' + pars['tm']+ '"';
															cdlr="题名："+ pars['tm']+ "";
														}
													};
													if(pars['ajtm']!=''){
														if (cx_tj!=''){
															cx_tj=cx_tj + ',ajtm:"' + pars['ajtm']+ '"';
															cdlr=cdlr + ",案卷标题："+ pars['ajtm'];
														}else{
															cx_tj='{ajtm:"' + pars['ajtm']+ '"';
															cdlr='案卷标题："'+ pars['ajtm']+ '"';
														}
													};
													if(pars['mlh']!=''){
														if (cx_tj!=''){
															cx_tj=cx_tj + ',mlh:"' + pars['mlh']+ '"';
															cdlr=cdlr +",目录号："+ pars['mlh'];
														}else{
															cx_tj='{mlh:"' + pars['mlh']+ '"';
															cdlr="目录号："+ pars['mlh'];
														}
													};
													if(pars['ajh']!=''){
														if (cx_tj!=''){
															cx_tj=cx_tj + ',ajh:"' + pars['ajh']+ '"';
															cdlr=cdlr+ ",案卷号："+ pars['ajh'];
														}else{
															cx_tj='{ajh:"' + pars['ajh']+ '"';
															cdlr="案卷号："+ pars['ajh'];
														}
													};
													if (cx_tj!=''){
														cx_tj="(" + cx_tj + "})";
														//cx_tj="(" + cx_tj + ",userid:" + currentUser.id + "})";
														//var grid = Ext.getCmp('archive_grid');
														//grid.store.proxy.url="/desktop/archive_query_jygl";

														//archive_store.proxy.extraParams=eval(cx_tj);
														//archive_store.proxy.extraParams=Ext.getCmp('qwjs_form').getValues();
														//archive_store.load();
														Ext.getCmp('js_jyqq_jytj').setValue(cx_tj);
														Ext.getCmp('jydj_jyqq_cdlr').setValue(cdlr);
													};

												}

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
							                    width: 185,
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

										Ext.getCmp('jydj_jyqq_jyzt').setValue('1');
										if (jyqq_add_change=='1'){


														new Ajax.Request("/desktop/insert_jylc", { 
															method: "POST",
															parameters: Ext.getCmp('jydj_jyqq_form').getValues(),
															onComplete:	 function(request) {
																if (request.responseText=='success'){

																	alert("申请成功。");
																	Ext.getCmp('jyqq_win').close();
																	var grid = Ext.getCmp('jydjlc_grid');
																	grid.store.proxy.url="/desktop/get_jydjlc_jyzt";
																	jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + jydj_jyzt + "})");
																	jydjlc_store.load();
																}else{
																	alert("阅览失败，请重新阅览。");
																}
															}
														});



										}else
										{
											new Ajax.Request("/desktop/update_jylc", { 
												method: "POST",
												parameters: Ext.getCmp('jydj_jyqq_form').getValues(),
												onComplete:	 function(request) {
													if (request.responseText=='success'){
														alert("修改成功。");
														Ext.getCmp('jyqq_win').close();
														var grid = Ext.getCmp('jydjlc_grid');
														grid.store.proxy.url="/desktop/get_jydjlc_jyzt";
														jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + jydj_jyzt + "})");
														jydjlc_store.load();
													}else{
														alert("修改失败，请重新修改。");
													}
												}
											});
										}
									}
								},
								{	
									xtype:'button',text:'退出',tooltip:'退出',id:'jyqq_tc',iconCls:'exit',


										handler: function() {

												Ext.getCmp('jyqq_win').close();

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
													name:'jytj',
													id:'js_jyqq_jytj',

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
								                    width: 465,
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
													id:'jydj_jyqq_cdlr',
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
				var win = Ext.getCmp('jyqq_win');
				
				if (win==undefined) {
					win = new Ext.Window({
						id : 'jyqq_win',
						title: '借阅请求',
						iconCls:'jyqq',
						layout: 'border',
						modal: true,
						width:800,
			            height:320,
						items:[{
								
								region: 'north',
								height: 100,
								layout: 'fit',
								

								items: js_jyqq_form
							},

							{
								region: 'center',
								//iconCls:'icon-grid',
								
								layout: 'fit',
								height: 180,
								//split: true,
								//collapseMode:'mini',
								//collapsible: true,
								//title: '',
								//hideCollapseTool:true,
								items:jydj_jyqq_form

							}]
					
					
					
					})
						//closeAction: 'hide',
						
				}
				if (jyqq_add_change==2){
					Ext.getCmp('jyqq_sq').text="修改申请";
					Ext.getCmp('jyqq_win').title="修改请求";
					Ext.getCmp('jyqq_win').iconCls="xgqq";
					Ext.getCmp('jydj_jyqq_form').getForm().setValues(recordad.data);
				}else
				{
					Ext.getCmp('jydj_jyqq_czrid').setValue(currentUser.id);
					Ext.getCmp('jyqq_sq').text="确定申请";
				}
				win.show();
			};	
			var clqq = function(recordad){
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
						{ text : '起日期',	 width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
						{ text : '止日期',	 width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
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
										new Ajax.Request("/desktop/check_jylist", { 
											method: "POST",
											parameters: Ext.getCmp('jydj_clqq_form').getValues(),
											onComplete:	 function(request) {
												if (request.responseText=='success'){
													new Ajax.Request("/desktop/update_jylc", { 
														method: "POST",
														parameters: Ext.getCmp('jydj_clqq_form').getValues(),
														onComplete:	 function(request) {
															if (request.responseText=='success'){
																alert("借阅申请处理成功。");
																Ext.getCmp('clqq_win').close();
																var grid = Ext.getCmp('jydjlc_grid');
																grid.store.proxy.url="/desktop/get_jydjlc_jyzt";
																jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + jydj_jyzt + "})");
																jydjlc_store.load();
															}else{
																alert("借阅申请处理失败，请重新处理。");
															}
														}
													});
												}else{
													alert("借阅申请处理失败，请重新处理。");
												}
											}
										});


									}
								}
							},
							{	
								xtype:'button',text:'打回',tooltip:'打回',id:'clqq_dh',iconCls:'dh',


									handler: function() {
										Ext.getCmp('jydj_clqq_jyzt').setValue('3');

										new Ajax.Request("/desktop/update_jylc", { 
											method: "POST",
											parameters: Ext.getCmp('jydj_clqq_form').getValues(),
											onComplete:	 function(request) {
												if (request.responseText=='success'){
													alert("打回成功。");
													Ext.getCmp('clqq_win').close();
													var grid = Ext.getCmp('jydjlc_grid');
													grid.store.proxy.url="/desktop/get_jydjlc_jyzt";
													jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:1})");;
													jydjlc_store.load();
												}else{
													alert("打回失败，请重新打回。");
												}
											}
										});

									}							

							},
							{	
								xtype:'button',text:'退出',tooltip:'退出',id:'clqq_tc',iconCls:'exit',
								handler: function() {
									Ext.getCmp('clqq_win').close();
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
							                    fieldLabel: '',
							                    x: 75,
							                    y: 5
							                },
							                {
							                    xtype: 'textfield',
							                    name: 'jydw',
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
				var win = Ext.getCmp('clqq_win');
				if (win==null) {
					win = new Ext.Window({
						id : 'clqq_win',
						title: '处理请求',
						modal: true,
						iconCls:'clqq',
						layout: 'border',
						width:800,
			            height:400,
						items:[{
								
								region: 'north',
								height: 30,
								layout: 'fit',
								tbar:[				
									'&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查档内容</span>:&nbsp;&nbsp;',
									{
										xtype:'textfield',
										width:300,
										id:'clqq_query_text',

									},				  
									{	
										xtype:'button',text:'检索',tooltip:'检索',id:'clqq_query',iconCls:'search',
										handler: function() {
											var grid = Ext.getCmp('jydj_clqq_grid');
											grid.store.proxy.url="/desktop/archive_query_jygl";

											grid.store.proxy.extraParams=eval(Ext.getCmp('clqq_query_text').value);
											
											grid.store.load();

										}
									}]
							
							},{
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
					
					
					
					})
						//closeAction: 'hide',
						
				}
				Ext.getCmp('jydj_clqq_form').getForm().setValues(recordad.data);
				Ext.getCmp('clqq_query_text').setValue(recordad.data.jytj);
				Ext.getCmp('jydj_clqq_jytj').setValue(recordad.data.jytj);
				//Ext.getCmp('jr_ownerid').setValue(recordad.data.id);
				
				win.show();
			};	
		
			var timage_store	= Ext.create('Ext.data.TreeStore', {
				//autoLoad: true,
				proxy: {
						type: 'ajax',
						url : '/desktop/get_timage_tree',
				        extraParams: {dh:"",type:"0"},
						actionMethods: 'POST'
				}
			});
			
			var image_tree1 = Ext.create('Ext.tree.Panel', {
				id : 'image_tree1',
				store: timage_store,
				rootVisible:false,
				useArrows: true,
				listeners:{
					checkchange:function(node,checked,option){
						if(checked){
							var pars={gid:node.data.id, type:0};
			                  new Ajax.Request("/desktop/get_timage_from_db", {
			                    method: "POST",
			                    parameters: pars,
			                    onComplete:  function(request) {
			                      var path = request.responseText;
			                      if (path != '') { 
			                        Ext.getCmp('preview_img').getEl().dom.src = path;
			                      }
			                    }
			                  });
						}

					}
				}
			});
		    
			var tabPanel = new Ext.TabPanel({
				activeTab : 0,//默认激活第一个tab页
				animScroll : true,//使用动画滚动效果
				enableTabScroll : true,//tab标签超宽时自动出现滚动按钮				
				items: [
					{
						title: '借阅登记',
						layout: 'border',
						//height:500,
						///collapsi:true,
						//split:true,
						tbar:[				
							'&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">案卷标题</span>:&nbsp;&nbsp;',
							{
								xtype:'textfield',
								id:'query_text',
							},				  
							{	
								xtype:'button',text:'检索',tooltip:'全文检索',id:'query',iconCls:'search',
								handler: function() {
									console.log(Ext.getCmp('query_text').value);
									if (Ext.getCmp('query_text').rawValue!=""){
										var grid = Ext.getCmp('archive_jydj_grid');
										grid.store.proxy.url="/desktop/get_archive_where";
										archive_jydj_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
										archive_jydj_store.proxy.extraParams.userid=currentUser.id; 								
										archive_jydj_store.load();
										Ext.getCmp('cdlr').setValue('全文：'+Ext.getCmp('query_text').value);
									}
								}
							},
							'->',
							{	
								xtype:'button',text:'展开高级查询',tooltip:'高级查询',id:'gjcx_button',iconCls:'zk',
								handler: function() {
									var gjcx = Ext.getCmp('gjcx_id');
									var bt=Ext.getCmp('gjcx_button');
									//gjcx.collapsed=false;
									if (gjcx.isHidden()){
										bt.setText('收起高级查询');
										gjcx.expand(true);}
									else {
										bt.setText('展开高级查询');
										gjcx.collapse(true);
									};
								}
							}
						],
						items:[{
								id:'gjcx_id',
								region: 'north',
								height: 90,
								layout: 'fit',
								split:true,
								//collapsible: true,
								collapsed:true,
								collapsible: true,
								//title: '高级查询',
								collapseMode:'mini',
								hideCollapseTool:true,
								items: qwjsform
							},{
								region: 'center',
								//iconCls:'icon-grid',
								layout: 'fit',
								//title: '查询结果列表',
								items: [

								{
									region: 'center',
									//iconCls:'icon-grid',
									layout: 'border',
									//title: '查询结果列表',
									items: [{
												region: 'center',
												//iconCls:'icon-grid',
												layout: 'fit',
												split:true,
												items: archiveGrid
											},{
												region: 'south',
												id:'jydjlist',
												//iconCls:'icon-grid',
												//title: '借阅登记列表',
												layout: 'fit',
												split:true,
												height:80,
												collapsed:true,
												collapsible: true,
												collapseMode:'mini',
												hideCollapseTool:true,
												items:jydjlist_dj_Grid
										}]
								}]
							},{
								region: 'south',
								//iconCls:'icon-grid',
								id:'dj_form',
								layout: 'fit',
								height: 140,
								split: true,
								collapseMode:'mini',
								collapsible: true,
								//title: '',
								hideCollapseTool:true,
								items:jydjform
								}]
					},{
						title: '借阅管理',
						layout: 'border',
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
				                                { boxLabel: '正在请求', name: 'jyzt', inputValue: '1' },
												{ boxLabel: '已同意借阅', name: 'jyzt', inputValue: '2', checked: true},
												{ boxLabel: '已打回借阅', name: 'jyzt', inputValue: '3'},
												{ boxLabel: '已结束借阅', name: 'jyzt', inputValue: '4'}
				                            ],
											listeners : {
												'change' : function(group, newValue, oldValue) {
													if (newValue.jyzt.length==1) {
													//alert(newValue.jyzt);
														var grid = Ext.getCmp('jydjlc_grid');
														grid.store.proxy.url="/desktop/get_jydjlc_jyzt";
														jydj_jyzt=newValue.jyzt;
														
														jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + newValue.jyzt + "})");
														jydjlc_store.load();
														jydjlist_store.proxy.extraParams.query='';
														jydjlist_store.load();
													}	
												}
											}
				                        }
				                    ]
				                },{xtype: 'toolbar',
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
															var grid = Ext.getCmp('jydjlc_grid');
															var records = grid.getSelectionModel().getSelection();
															var record = records[0];
															if (record.data.jyzt==1){
																clqq(record);
															}else
															{
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
												//var grid = Ext.getCmp('archive_grid');
												//var records = grid.getSelectionModel().getSelection();
												//var record = records[0];
												jyqq_add_change='1';
												jyqq('record');

											}
						                },
						                {
						                    xtype: 'button',
											iconCls:'xgqq',
						                    text: '修改请求',
											handler: function() {
												var grid = Ext.getCmp('jydjlc_grid');
												var records = grid.getSelectionModel().getSelection();
												var record = records[0];
												var jyzt=record.data.jyzt;
												if (record.data.jyzt==1 || record.data.jyzt==3){
													jyqq_add_change='2';													
													jyqq(record);
													
												}else{
													alert('请选择处于借阅请求状态或打回状态的数据进行删除处理。');
												}
											}
						                },
										{
						                    xtype: 'button',
											iconCls:'delete',
						                    text: '删除请求',
											handler: function() {												
												var grid = Ext.getCmp('jydjlc_grid');
												var records = grid.getSelectionModel().getSelection();
												var record = records[0];
												var jyzt=record.data.jyzt;
												if (record.data.jyzt==1 || record.data.jyzt==3){
													var pars="id="+record.data.id;
													Ext.Msg.confirm("提示信息","是否要删除借阅人为：！"+record.data.jyr+"的借阅申请？",function callback(id){
																if(id=="yes"){
																	new Ajax.Request("/desktop/delete_jylc", { 
																		method: "POST",
																		parameters: pars,
																		onComplete:	 function(request) {
																			var grid = Ext.getCmp('jydjlc_grid');
																			grid.store.proxy.url="/desktop/get_jydjlc_jyzt";
																			jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:" + jyzt + "})");
																			jydjlc_store.load();
																			jydjlist_store.proxy.extraParams.query='';
																			jydjlist_store.load();
																		}
																	});
																}else{
																	//alert('O,no');
																}
														});
												}else{
													alert('请选择处于借阅请求状态或打回状态的数据进行删除处理。');
												}
											}													
						                },
						                {
						                    xtype: 'button',
											iconCls:'xjhd',
						                    text: '选择还档',
											handler: function() {
												var grid = Ext.getCmp('jydjlc_grid');
												var records = grid.getSelectionModel().getSelection();
												if (records.length>0){
													var record = records[0];
													if (record.data.jyzt==2){
													
															var jylc_pars="id:"+record.data.id;
															var jylist_grid= Ext.getCmp('jydjlist_grid');
															var jylist_records= jylist_grid.getSelectionModel().getSelection();
															if (jylist_records.length>0){
																var ids=[];
																Ext.Array.each(jylist_records,function(record){
																	ids.push(record.get("id"));																																		
																});
																jylc_pars="({"+jylc_pars+",ids:'" +ids+"'})";
															
																new Ajax.Request("/desktop/xjhd_jylc", { 
																	method: "POST",
																	parameters: eval(jylc_pars),
																	onComplete:	 function(request) {
																		var grid = Ext.getCmp('jydjlc_grid');
																		grid.store.proxy.url="/desktop/get_jydjlc_jyzt";
																		jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:2})");
																		jydjlc_store.load();
																		jydjlist_store.proxy.extraParams.query='';
																		jydjlist_store.load();
																	}
																});
															}else{
																alert('您最少要选择一条数据进行还档。');
															}
													}else
													{
														alert('请选择处于已同意借阅状态的数据进行处理。');
													}
												}else
												{
													alert('您最少要选择一条数据进行还档。');
												}
											}
						                },
						                {
						                    xtype: 'button',
											iconCls:'hd',
						                    text: '全部还档',
											handler: function() {
												var grid = Ext.getCmp('jydjlc_grid');
												var records = grid.getSelectionModel().getSelection();
												var record = records[0];
												if (record.data.jyzt==2){
													var pars="id="+record.data.id;
													new Ajax.Request("/desktop/qbhd_jylc", { 
														method: "POST",
														parameters: pars,
														onComplete:	 function(request) {
															var grid = Ext.getCmp('jydjlc_grid');
															grid.store.proxy.url="/desktop/get_jydjlc_jyzt";
															jydjlc_store.proxy.extraParams=eval("({userid:" + currentUser.id + ",jyzt:2})");
															jydjlc_store.load();
															jydjlist_store.proxy.extraParams.query='';
															jydjlist_store.load();
														}
													});
												}else
												{
													alert('请选择处于已同意借阅状态的数据进行处理。');
												}
											}
						                },
						                {
						                    xtype: 'button',
											iconCls:'tj',
						                    text: '档案利用统计',
											handler: function() {
												jytj();
											}
						                }
						            ]
						        }
						    ],
						items:[{
								region: 'center',
								//iconCls:'icon-grid',
								layout: 'fit',
								split:true,
								width:100,
								items: jydjlc_grid

							},{
								region: 'east',
								//iconCls:'icon-grid',
								layout: 'fit',
								split:true,
								width:550,
								items: jydjlist_grid

							}]
					},
					{
						title: '专项借阅',
						layout: 'border',
						//height:500,
						///collapsi:true,
						//split:true,
						listeners: {
		                    activate: function(tab){
		                        zxjydjlc_store.load();
		                    }
		                },
						dockedItems:[
						{xtype: 'toolbar',
			            anchor: '100%',
			            dock: 'bottom',
			            items: [			                
								'&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">借阅人</span>:&nbsp;&nbsp;',
								{
									xtype:'textfield',
									id:'zx_jyr'									
								},
								{	
									xtype:'button',text:'同意查看',tooltip:'同意查看',id:'zx_yes',iconCls:'save',
									handler: function() {
										if (Ext.getCmp('zx_jyr')==undefined){
											alert("请您输入借阅人再同意查看。");											
										}else{
											root=Ext.getCmp('image_tree1').store.getRootNode();
											insert_qx="";
											get_mlqx_NodesChecked(root);										
											if (insert_qx==""){
												alert("请您选择一些扫描文件再同意查看。");
											}else{
												
												insert_qx="({imageids:'" + insert_qx + "',jyr:'" + Ext.getCmp('zx_jyr').value + "',zxjyid:'" + zxjyid + "'})";
												new Ajax.Request("/desktop/insert_zxjylist", { 
													method: "POST",
													parameters: eval(insert_qx),
													onComplete:	 function(request) {
														if (request.responseText=='success'){
															alert("同意查看成功。");												
														}else{
															alert("同意查看失败，请重新同意。");
														}
													}
												});									
											}
										}										
									}
								},
								{	
									xtype:'button',text:'读取身份证',tooltip:'读取身份证',id:'zx_sfz',iconCls:'option',
									handler: function() {									
												new Ajax.Request("/desktop/get_sfz", { 
													method: "POST",
													//parameters: eval(insert_qx),
													onComplete:	 function(request) {
														reques=request.responseText.split(':');
														if (reques[0]=='success'){
															sfz=reques[1].split(";")
															Ext.getCmp('zx_jyr').setValue(sfz[0]);
															
														}else{
															alert(reques[1]);
														}
													}
												});																													
									}
								}
							]
						}
						],
						tbar:[
							{	
								xtype:'button',text:'刷新请求',tooltip:'刷新请求',id:'zx_refresh',iconCls:'refresh',
								handler: function() {
									zxjydjlc_store.load();									
								}
							},
							{	
								xtype:'button',text:'删除请求',tooltip:'删除请求',id:'zx_del',iconCls:'delete',
								handler: function() {
									new Ajax.Request("/desktop/delete_zxjy", { 
										method: "POST",
										parameters: '',
										onComplete:	 function(request) {
											if (request.responseText=='success'){
												alert("删除成功。");	
												zxjydjlc_store.load();												
											}else{
												alert("删除失败，请重新删除。");
											}
										}
									});								
								}
							},
							'&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">案卷标题</span>:&nbsp;&nbsp;',
							{
								xtype:'textfield',
								id:'zx_ajtm',
							},
							'&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">卷内题名</span>:&nbsp;&nbsp;',
							{
								xtype:'textfield',
								id:'zx_tm',
							},
							'&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">文号</span>:&nbsp;&nbsp;',
							{
								xtype:'textfield',
								id:'zx_wh',
							},				  
							{	
								xtype:'button',text:'检索',tooltip:'全文检索',id:'zx_query',iconCls:'search',
								handler: function() {
									var grid = Ext.getCmp('archive_grid');
									if (Ext.getCmp('zx_ajtm').value==undefined && Ext.getCmp('zx_tm').value==undefined && Ext.getCmp('zx_wh').value==undefined){
										alert("请输入一个查询条件。");										
									}else{
										if (Ext.getCmp('zx_ajtm').value==undefined){
											ajtm=''}
										else{
											ajtm=Ext.getCmp('zx_ajtm').value
										};
										if (Ext.getCmp('zx_tm').value==undefined){
											tm=''}
										else{
											tm=Ext.getCmp('zx_tm').value
										};
										if (Ext.getCmp('zx_wh').value==undefined){
											wh=''}
										else{
											wh=Ext.getCmp('zx_wh').value
										};										
										if (ajtm=="" && tm =="" && wh==""){
											alert("请输入一个查询条件。");										
										}else{
											new Ajax.Request("/desktop/insert_zxjy", { 
												method: "POST",
												parameters: eval("({ajtm:'" + ajtm + "',tm:'" + tm + "',wh:'" + wh+ "'})"),
												onComplete:	 function(request) {
													zxjydjlc_store.load();	
												}
											});
										}
									}																
								}
							}
						],
						items:[
							{
							region: 'center',
							//iconCls:'icon-grid',
							layout: 'border',							
							//title: '查询结果列表',
							items: [{
										region: 'center',
										//iconCls:'icon-grid',
										layout: 'fit',
										split:true,
										width:100,
										items: zxjydjlc_grid
									},{
										region: 'east',
										//iconCls:'icon-grid',
										layout: 'fit',
										split:true,
										width:550,
										items: zxjydjlist_grid
								}]
							},{
								region: 'south',
								//iconCls:'icon-grid',
								//id:'dj_form',
								layout: 'border',
								height: 380,
								split: true,
								collapseMode:'mini',
								collapsible: true,
								//title: '',
								hideCollapseTool:true,
								items:[{
										region: 'center',
										//iconCls:'icon-grid',
										layout: 'fit',
										split:true,
										//width:100,
										items: image_tree1

									},{
										region: 'east',
										//iconCls:'icon-grid',
										layout: 'fit',
										split:true,
										width:550,
										items: [{
							              xtype: 'box', //或者xtype: 'component',
							              id: 'preview_img',
										  layout: 'fit',
							              //width: 350, //图片宽度
							              autoEl: {
							                tag: 'img',    //指定为img标签
							                alt: ''      //指定url路径
							              }
							            }]
									}]
								}]
					}
				]	
			});			
	      if(!win){
	          win = desktop.createWindow({
	              id: 'borrowman',
	              title:'借阅管理',
	              width:1000,
	              height:600,
	              iconCls: 'borrowman',
	              animCollapse:false,
					maximized:true,
	              border: false,
	              hideMode: 'offsets',
				  layout: 'border',
					//height:500,
					//collapsible:true,
				　　split:true,
				　　items:[{						
						region: 'center',
						//height: 200,
						layout: 'fit',
						split:true,
						items:tabPanel
					}]
				});             
	      }
	      new Ajax.Request("/desktop/get_sort", { 
      		method: "POST",
	      	parameters: eval("({userid:" + currentUser.id + ",qxid:4})"),
	      	onComplete:	 function(request) {
	      		if (request.responseText=='success'){
	    			win.show();
					Ext.QuickTips.init();
	      		}else{
	      			alert('您无借阅管理的权限。');
					Ext.getCmp('borrowman').close();
	      		}
	      	}
      	});
		Ext.getCmp('czrid').setValue(currentUser.id);
	      return win;
	  }
});

