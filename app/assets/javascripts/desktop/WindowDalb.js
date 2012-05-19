var DispAj_Zh = function(record,add_new){
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