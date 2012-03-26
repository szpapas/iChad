var currentUser={};
var archive_id=0;
var archive_data={};
var tree_id=0;

Ext.Loader.setPath({
    'Ext.ux.desktop': '/assets/desktop/js',
    'Ext.ux' : '/assets/desktop/ux',
    MyDesktop: '/assets/desktop'
});

Ext.Loader.setConfig({enabled:true});

var msg = function(title, msg){
		Ext.Msg.show({
				title: title,
				msg: msg,
				minWidth: 300,
				modal: true,
				icon: Ext.Msg.WARNING,
				buttons: Ext.Msg.OK
		});
};

//Simple Store
var txfw_data = [
 ['0','不提醒'],
 ['1','个人'],
 ['2','部门']
];

var txfw_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : txfw_data
});

var bgqx_data = [
	['1','永久'],
	['2','长期'],
	['3','短期']
];


var bgqx_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : bgqx_data
});

var mj_data = [
	['1','公开'],
	['2','秘密'],
	['3','机密'],
	['4','绝密']
];


var mj_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : mj_data
});

var aj_where_field_data = [
	['tm','案卷标题']
];

var aj_where_field_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : jr_where_field_data
});

var jr_where_field_data = [
	['tm','题名'],
	['wh','文号'],
	['zrz','责任者']
];

var jr_where_field_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : jr_where_field_data
});

var jydj_jyqx_data = [
	['1','1天'],
	['2','2天'],
	['3','3天'],
	['4','4天'],
	['5','5天'],
	['6','6天']
];

var jydj_jyqx_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : jydj_jyqx_data
});

var jydj_lymd_data = [
	['1','编史修志'],
	['2','工作考查'],
	['3','学术研究'],
	['4','经济建设'],
	['5','宣传教育'],
	['6','其它']
];

var jydj_lymd_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : jydj_lymd_data
});

var jydj_jylx_data = [
	['1','案卷目录'],
	['2','卷内目录'],
	['3','原文']
];

var jydj_jylx_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : jydj_jylx_data
});

var sprintf = (function() {
	function get_type(variable) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
	}
	function str_repeat(input, multiplier) {
		for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
		return output.join('');
	}

	var str_format = function() {
		if (!str_format.cache.hasOwnProperty(arguments[0])) {
			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
		}
		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
	};

	str_format.format = function(parse_tree, argv) {
		var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
		for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i]);
			if (node_type === 'string') {
				output.push(parse_tree[i]);
			}
			else if (node_type === 'array') {
				match = parse_tree[i]; // convenience purposes only
				if (match[2]) { // keyword argument
					arg = argv[cursor];
					for (k = 0; k < match[2].length; k++) {
						if (!arg.hasOwnProperty(match[2][k])) {
							throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
						}
						arg = arg[match[2][k]];
					}
				}
				else if (match[1]) { // positional argument (explicit)
					arg = argv[match[1]];
				}
				else { // positional argument (implicit)
					arg = argv[cursor++];
				}

				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
					throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
				}
				switch (match[8]) {
					case 'b': arg = arg.toString(2); break;
					case 'c': arg = String.fromCharCode(arg); break;
					case 'd': arg = parseInt(arg, 10); break;
					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
					case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
					case 'o': arg = arg.toString(8); break;
					case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
					case 'u': arg = Math.abs(arg); break;
					case 'x': arg = arg.toString(16); break;
					case 'X': arg = arg.toString(16).toUpperCase(); break;
				}
				arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
				pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
				pad_length = match[6] - String(arg).length;
				pad = match[6] ? str_repeat(pad_character, pad_length) : '';
				output.push(match[5] ? arg + pad : pad + arg);
			}
		}
		return output.join('');
	};

	str_format.cache = {};

	str_format.parse = function(fmt) {
		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
		while (_fmt) {
			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
				parse_tree.push(match[0]);
			}
			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
				parse_tree.push('%');
			}
			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
				if (match[2]) {
					arg_names |= 1;
					var field_list = [], replacement_field = match[2], field_match = [];
					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
						field_list.push(field_match[1]);
						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else {
								throw('[sprintf] huh?');
							}
						}
					}
					else {
						throw('[sprintf] huh?');
					}
					match[2] = field_list;
				}
				else {
					arg_names |= 2;
				}
				if (arg_names === 3) {
					throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
				}
				parse_tree.push(match);
			}
			else {
				throw('[sprintf] huh?');
			}
			_fmt = _fmt.substring(match[0].length);
		}
		return parse_tree;
	};

	return str_format;
})();

var vsprintf = function(fmt, argv) {
	argv.unshift(fmt);
	return sprintf.apply(null, argv);
};



var DispAj_zh = function(record,add_new,title){
	var win = Ext.getCmp('archive_detail_win');
	Ext.regModel('com_document_model', {
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

	var com_document_store = Ext.create('Ext.data.Store', {
		model : 'com_document_model',
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
		id : 'com_document_grid',
		store: com_document_store,
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

					var grid = Ext.getCmp('com_document_grid');
					var records = grid.getSelectionModel().getSelection();
					var record = records[0];

					var pars="id="+record.data.id;
					Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
								if(id=="yes"){
									new Ajax.Request("/desktop/delete_document", { 
										method: "POST",
										parameters: pars,
										onComplete:	 function(request) {
											Ext.getCmp('com_document_grid').store.load();

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
	if (win==null) {
		win = new Ext.Window({
			id : 'archive_detail_win',
			title: '案卷详细信息',
			//closeAction: 'hide',
			width: 688,
			height: 450,
			minHeight: 450,
			layout: 'border',
			modal: true,
			plain: true,
			buttons:[{
					xtype: 'button',
					cls: 'change',
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
									Ext.getCmp('archive_detail_win').close();
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									Ext.getCmp('archive_grid').store.load();
									Ext.getCmp('archive_detail_win').close();
								}
							});
						}
					}
				},
				{
					xtype: 'button',
					cls: 'exit',
					text:'退出',
					handler: function() {
						//this.up('window').hide();
						Ext.getCmp('archive_detail_win').close();
					}
				}],
			items: [{
				region: 'south',
				iconCls:'icon-grid',
				layout: 'fit',
				height: 150,
				split: true,
				collapsible: true,
				title: '卷内目录',
				items: documentGrid

			},{
				width: 688,
				height: 256,
				region: 'center',
				xtype:'form',
				layout: 'absolute',
				id : 'daglaj_form',
				items: [
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '目 录 号',
	                    labelWidth: 60,
	                    x: 10,
						name: 'mlh',
						id: 'zh_mlh',
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '分类号',
	                    labelWidth: 60,
						name: 'flh',
						id: 'zh_flh',
	                    x: 175,
	                    y: 10
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 55,
	                    width: 655,
	                    fieldLabel: '案卷标题',
	                    labelWidth: 60,
						name: 'tm',
						id: 'zh_aj_tm',
	                    x: 10,
	                    y: 45
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '案卷号',
	                    labelWidth: 60,
						name: 'ajh',
						id: 'zh_ajh',
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '年度',
	                    labelWidth: 60,
						name: 'nd',
						id: 'zh_nd',
	                    x: 520,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '起 年 月',
	                    labelWidth: 60,
						name: 'qny',
						id: 'zh_qny',
	                    x: 10,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '止年月',
	                    labelWidth: 60,
						name: 'zny',
						id: 'zh_zny',
	                    x: 175,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '件数',
	                    labelWidth: 60,
						name: 'js',
						id: 'zh_js',
	                    x: 345,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '页数',
	                    labelWidth: 60,
						name: 'ys',
						id: 'zh_ys',
	                    x: 520,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '存入位置',
	                    labelWidth: 60,
						name: 'cfwz',
						id: 'zh_cfwz',
	                    x: 10,
	                    y: 185
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '箱号',
	                    labelWidth: 60,
						name: 'xh',
						id: 'zh_xh',
	                    x: 345,
	                    y: 150
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '保管期限',
	                    labelWidth: 60,
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_bgqx',
	                    x: 10,
	                    y: 150
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '密级',
	                    labelWidth: 60,
						name: 'mj',
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_mj',
	                    x: 175,
	                    y: 150
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '备注',
	                    labelWidth: 60,
						name: 'bz',
						id: 'zh_bz',
	                    x: 345,
	                    y: 185
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'qzh',
						id: 'zh_qzh',
	                    x: 10,
	                    y: 190
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dalb',
						id: 'zh_dalb',
	                    x: 10,
	                    y: 190
	                }
	            ]
			}]
		});
	}
	if(add_new==false){
	//设置数据
		Ext.getCmp('daglaj_form').getForm().setValues(record.data);
		com_document_store.proxy.extraParams.query=record.data.id;
		com_document_store.load();
		
	}else{
		
		Ext.getCmp('button_aj_add').text="新增";
		
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		ss=title.split('_');
		Ext.getCmp('zh_qzh').setValue(ss[0]);
		if(ss.length==3){
			new Ajax.Request("/desktop/get_mlh", { 
			    	method: "POST",
			    	parameters: {dalb:ss[2]},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_mlh').setValue(request.responseText);
			     	}
			     });
			new Ajax.Request("/desktop/get_max_ajh", { 
			    	method: "POST",
			    	parameters: {dalb:title},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_ajh').setValue(request.responseText);
			     	}
			     });
		}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_cw = function(record,add_new,title){
	var win = Ext.getCmp('archive_detail_win');
	Ext.regModel('com_document_model', {
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

	var com_document_store = Ext.create('Ext.data.Store', {
		model : 'com_document_model',
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
		id : 'com_document_grid',
		store: com_document_store,
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

					var grid = Ext.getCmp('com_document_grid');
					var records = grid.getSelectionModel().getSelection();
					var record = records[0];

					var pars="id="+record.data.id;
					Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
								if(id=="yes"){
									new Ajax.Request("/desktop/delete_document", { 
										method: "POST",
										parameters: pars,
										onComplete:	 function(request) {
											Ext.getCmp('com_document_grid').store.load();

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
	if (win==null) {
		win = new Ext.Window({
			id : 'archive_detail_win',
			title: '案卷详细信息',
			//closeAction: 'hide',
			width: 688,
			height: 450,
			minHeight: 450,
			layout: 'border',
			modal: true,
			plain: true,
			buttons:[{
					xtype: 'button',
					cls: 'change',
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
									Ext.getCmp('archive_detail_win').close();
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									Ext.getCmp('archive_grid').store.load();
									Ext.getCmp('archive_detail_win').close();
								}
							});
						}
					}
				},
				{
					xtype: 'button',
					cls: 'exit',
					text:'退出',
					handler: function() {
						//this.up('window').hide();
						Ext.getCmp('archive_detail_win').close();
					}
				}],
			items: [{
				region: 'south',
				iconCls:'icon-grid',
				layout: 'fit',
				height: 150,
				split: true,
				collapsible: true,
				title: '卷内目录',
				items: documentGrid

			},{
				width: 688,
				height: 256,
				region: 'center',
				xtype:'form',
				layout: 'absolute',
				id : 'daglaj_form',
				items: [
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '目 录 号',
	                    labelWidth: 60,
						name: 'mlh',
						id: 'cw_mlh',
	                    x: 10,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '分类号',
	                    labelWidth: 60,
						name: 'flh',
						id: 'cw_flh',
	                    x: 175,
	                    y: 10
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 55,
	                    width: 655,
	                    fieldLabel: '案卷标题',
	                    labelWidth: 60,
						name: 'tm',
						id: 'cw_aj_tm',
	                    x: 10,
	                    y: 45
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '案卷号',
	                    labelWidth: 60,
						name: 'ajh',
						id: 'cw_ajh',
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '年度',
	                    labelWidth: 60,
						name: 'nd',
						id: 'cw_nd',
	                    x: 520,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '起 日 期',
	                    labelWidth: 60,
						name: 'qrq',
						id: 'cw_qrq',
	                    x: 10,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '止日期',
	                    labelWidth: 60,
						name: 'zrq',
						id: 'cw_zrq',
	                    x: 175,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '卷内张数',
	                    labelWidth: 60,
						name: 'jrzs',
						id: 'cw_jrzs',
	                    x: 345,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '附件张数',
	                    labelWidth: 60,
						name: 'fjzs',
						id: 'cw_fjzs',
	                    x: 520,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '件数',
	                    labelWidth: 60,
						name: 'js',
						id: 'cw_js',
	                    x: 10,
	                    y: 185
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '凭证起号',
	                    labelWidth: 60,
						name: 'pzqh',
						id: 'cw_pzqh',
	                    x: 345,
	                    y: 150
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '保管期限',
	                    labelWidth: 60,
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'cw_bgqx',
	                    x: 10,
	                    y: 150
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '密级',
	                    labelWidth: 60,
						name: 'mj',
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'cw_mj',
	                    x: 175,
	                    y: 150
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '备注',
	                    labelWidth: 60,
						name: 'bz',
						id: 'cw_bz',
	                    x: 345,
	                    y: 185
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '凭证止号',
	                    labelWidth: 60,
						name: 'pzzh',
						id: 'cw_pzzj',
	                    x: 520,
	                    y: 150
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '页数',
	                    labelWidth: 60,
						name: 'ys',
						id: 'cw_ys',
	                    x: 175,
	                    y: 185
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'qzh',
						id: 'cw_qzh',
	                    x: 10,
	                    y: 190
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dalb',
						id: 'cw_dalb',
	                    x: 10,
	                    y: 190
	                }
	            ]
			}]
		});
	}
	if(add_new==false){
	//设置数据
		Ext.getCmp('daglaj_form').getForm().setValues(record.data);
		com_document_store.proxy.extraParams.query=record.data.id;
		com_document_store.load();
		
	}else{
		
		Ext.getCmp('button_aj_add').text="新增";
		Ext.getCmp('cw_dalb').setValue(ss[1]);
		ss=title.split('_');
		Ext.getCmp('cw_qzh').setValue(ss[0]);
		if(ss.length==3){
			new Ajax.Request("/desktop/get_mlh", { 
			    	method: "POST",
			    	parameters: {dalb:ss[2]},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('cw_mlh').setValue(request.responseText);
			     	}
			     });
			new Ajax.Request("/desktop/get_max_ajh", { 
			    	method: "POST",
			    	parameters: {dalb:title},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('cw_ajh').setValue(request.responseText);
			     	}
			     });
		}
	}
	//设置数据
	
	win.show();
};
var DispAj_tddj = function(record,add_new,title){
	var win = Ext.getCmp('archive_detail_win');
	Ext.regModel('com_document_model', {
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

	var com_document_store = Ext.create('Ext.data.Store', {
		model : 'com_document_model',
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
		id : 'com_document_grid',
		store: com_document_store,
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

					var grid = Ext.getCmp('com_document_grid');
					var records = grid.getSelectionModel().getSelection();
					var record = records[0];

					var pars="id="+record.data.id;
					Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
								if(id=="yes"){
									new Ajax.Request("/desktop/delete_document", { 
										method: "POST",
										parameters: pars,
										onComplete:	 function(request) {
											Ext.getCmp('com_document_grid').store.load();

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
	if (win==null) {
		win = new Ext.Window({
			id : 'archive_detail_win',
			title: '案卷详细信息',
			//closeAction: 'hide',
			width: 688,
			height: 450,
			minHeight: 450,
			layout: 'border',
			modal: true,
			plain: true,
			buttons:[{
					xtype: 'button',
					cls: 'change',
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
									Ext.getCmp('archive_detail_win').close();
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									Ext.getCmp('archive_grid').store.load();
									Ext.getCmp('archive_detail_win').close();
								}
							});
						}
					}
				},
				{
					xtype: 'button',
					cls: 'exit',
					text:'退出',
					handler: function() {
						//this.up('window').hide();
						Ext.getCmp('archive_detail_win').close();
					}
				}],
			items: [{
				region: 'south',
				iconCls:'icon-grid',
				layout: 'fit',
				height: 150,
				split: true,
				collapsible: true,
				title: '卷内目录',
				items: documentGrid

			},{
				width: 688,
				height: 256,
				region: 'center',
				xtype:'form',
				layout: 'absolute',
				id : 'daglaj_form',
				items: [
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '目 录 号',
	                    labelWidth: 60,
						name: 'mlh',
						id: 'tddj_mlh',
	                    x: 10,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '分类号',
	                    labelWidth: 60,
						name: 'flh',
						id: 'tddj_flh',
	                    x: 175,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '案卷号',
	                    labelWidth: 60,
						name: 'ajh',
						id: 'tddj_ajh',
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '年度',
	                    labelWidth: 60,
						name: 'nd',
						id: 'tddj_nd',
	                    x: 520,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '起 年 月',
	                    labelWidth: 60,
						name: 'qny',
						id: 'tddj_qny',
	                    x: 10,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '止年月',
	                    labelWidth: 60,
						name: 'zny',
						id: 'tddj_zny',
	                    x: 175,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '件数',
	                    labelWidth: 60,
						name: 'js',
						id: 'tddj_js',
	                    x: 345,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '页数',
	                    labelWidth: 60,
						name: 'ys',
						id: 'tddj_ys',
	                    x: 520,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '存入位置',
	                    labelWidth: 60,
						name: 'cfwz',
						id: 'tddj_cfwz',
	                    x: 520,
	                    y: 160
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '箱号',
	                    labelWidth: 60,
						name: 'xh',
						id: 'tddj_xh',
	                    x: 345,
	                    y: 160
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '保管期限',
	                    labelWidth: 60,
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'cw_bgqx',
	                    x: 10,
	                    y: 160
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '密级',
	                    labelWidth: 60,
						name: 'mj',
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'cw_mj',
	                    x: 175,
	                    y: 160
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '备注',
	                    labelWidth: 60,
						name: 'bz',
						id: 'tddj_bz',
	                    x: 345,
	                    y: 190
	                },
	                {
	                    xtype: 'combobox',
	                    fieldLabel: '权属性质',
	                    labelWidth: 60,
						name: 'qsxz',
						id: 'tddj_qsxz',
	                    x: 10,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 200,
	                    fieldLabel: '现地籍号',
	                    labelWidth: 60,
						name: 'djh',
						id: 'tddj_djh',
	                    x: 245,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 195,
	                    fieldLabel: '原地籍号',
	                    labelWidth: 60,
						name: 'ydjh',
						id: 'tddj_ydjh',
	                    x: 470,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '土地座落',
	                    labelWidth: 60,
						name: 'tdzl',
						id: 'tddj_tdzl',
	                    x: 10,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '权  利  人',
	                    labelWidth: 60,
						name: 'qlrmc',
						id: 'tddj_qlrmc',
	                    x: 10,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '土地证号',
	                    labelWidth: 60,
						name: 'tdzh',
						id: 'tddj_tdzh',
	                    x: 10,
	                    y: 190
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'qzh',
						id: 'tddj_qzh',
	                    x: 10,
	                    y: 190
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dalb',
						id: 'tddj_dalb',
	                    x: 10,
	                    y: 190
	                }
	            ]
			}]
		});
	}
	if(add_new==false){
	//设置数据
		Ext.getCmp('daglaj_form').getForm().setValues(record.data);
		com_document_store.proxy.extraParams.query=record.data.id;
		com_document_store.load();
		
	}else{
		
		Ext.getCmp('button_aj_add').text="新增";
			Ext.getCmp('tddj_dalb').setValue(ss[1]);
			ss=title.split('_');
			Ext.getCmp('tddj_qzh').setValue(ss[0]);
			if(ss.length==3){
				new Ajax.Request("/desktop/get_mlh", { 
				    	method: "POST",
				    	parameters: {dalb:ss[2]},
				    	onComplete:	 function(request) {
				    		Ext.getCmp('tddj_mlh').setValue(request.responseText);
				     	}
				     });
				new Ajax.Request("/desktop/get_max_ajh", { 
				    	method: "POST",
				    	parameters: {dalb:title},
				    	onComplete:	 function(request) {
				    		Ext.getCmp('tddj_ajh').setValue(request.responseText);
				     	}
				     });
			}
		
		
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
										Ext.getCmp('document_detail_win').close();
									}
								});}
							else{
								new Ajax.Request("/desktop/insert_document", { 
									method: "POST",
									parameters: pars,
									onComplete:	 function(request) {
										Ext.getCmp('document_grid').store.load();
										Ext.getCmp('document_detail_win').close();
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
							//this.up('window').close();
							Ext.getCmp('document_detail_win').close();
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
