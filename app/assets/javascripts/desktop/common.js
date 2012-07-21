var currentUser={};
var archive_id=0;
var archive_data={};
var tree_id=0;
var user_id="";
Ext.Loader.setPath({
    'Ext.ux.desktop': '/assets/desktop/js',
    'Ext.ux' : '/assets/desktop/ux',
    MyDesktop: '/assets/desktop'
});

Ext.Loader.setConfig({enabled:true});
 new Ajax.Request("/desktop/get_userid", { 
 	method: "POST",
 	//parameters: eval(pars),
 	onComplete:	 function(request) {
 		user_id=request.responseText;
 	}
 });
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
var qsxz_data = [
 ['0','国有土地使用权'],
 ['1','集体土地所有权'],
 ['2','集体土地使用权'],

 ['3','分割'],
 ['4','注销'],
 ['5','租赁']

];

var qsxz_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : qsxz_data
});
var sxzl_data = [
 ['0','录音带'],
 ['1','录像带'],
 ['2','其他']
];

var sxzl_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : sxzl_data
});

var bgqx_data = [
	['1','永久'],
	['2','长期'],
	['3','短期'],
	['4','25年'],
	['5','15年'],
	['6','5年'],
	['7','定期-30年'],
	['8','定期-10年']

];


var bgqx_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : bgqx_data
});

var mj_data = [
	['1','绝密'],
	['2','机密'],
	['3','秘密'],
	['4','内部'],
	['5','公开']	
];


var mj_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : mj_data
});


var gb_data = [
	['1','草稿'],
	['2','定稿'],
	['3','手稿'],
	['4','草图'],
	['5','原图'],
	['6','底图'],
	['7','蓝图'],
	['8','正本'],
	['9','副本'],
	['10','原版'],
	['11','试行本'],
	['12','修订本'],
	['13','影印本']	
];
var gb_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : gb_data
});
var wz_data = [
	['1','命令'],
	['2','决议'],
	['3','指示'],
	['4','通知'],
	['5','报告'],
	['6','批复'],
	['7','函'],
	['8','会议纪要'],
	['9','说明书'],
	['10','协议书'],
	['11','鉴定书'],
	['12','任务书'],
	['13','判决书'],
	['14','国书'],
	['15','照会'],
	['16','诰'],
	['17','敕'],
	['18','奏折']
		
];
var wz_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : wz_data
});

var ztgg_data = [
	['1','16开'],
	['2','A4'],
	['3','105mm╳148mm'],
	['4','3.5英寸']
	
		
];
var ztgg_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : ztgg_data
});

var ztlx_data = [
	['1','纸'],
	['2','唱片'],
	['3','照片'],
	['4','胶片'],
	['5','胶卷'],
	['6','磁带'],
	['7','磁盘'],
	['8','光盘'],
	['9','甲骨'],
	['10','金石'],
	['11','简牍'],
	['12','缣帛']

		
];
var ztlx_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : ztlx_data
});

var ztdw_data = [
	['1','页'],
	['2','张'],
	['3','卷'],
	['4','册'],
	['5','盒'],
	['6','盘'],
	['7','片'],
	['8','米']
	
	
];
var ztdw_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : ztdw_data
});

var ajzt_data = [
	['1','空卷'],
	['2','缺页'],
	['3','多页'],
	['3','著录'],
	['3','归档'],
	['4','全部']
];

var ajzt_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : ajzt_data
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

var zlxx_lb_data = [
	['1','文件汇编'],
	['2','年鉴'],
	['3','其他'],
	
];
var zlxx_lb_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : zlxx_lb_data
});
var swda_lb_data = [
	['1','证书'],
	['2','奖状'],
	['3','镜框'],
	['4','奖旗'],
	['5','锦旗'],
	['6','其他']
];
var swda_lb_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : swda_lb_data
});

var qzdj_data = [	
	['3','地市级'],
	['4','县级'],
	['5','乡镇级']
];
var qzdj_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : qzdj_data
});
var sf_data = [	
	['1','是'],
	['2','否']
];
var sf_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : sf_data
});
var qzdj_data = [	
	['3','地市级'],
	['4','县级'],
	['5','乡镇级']
];
var qzdj_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : qzdj_data
});

var print_lb_data = [	
	['1','案卷目录打印'],
	['2','卷内目录打印'],
	['3','案卷封面打印']
];
var print_lb_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : print_lb_data
});
   Ext.regModel('qz_model', {
   	fields: [
   		{name: 'id',		type: 'integer'},
   		{name: 'dwdm',		type: 'string'}
   	]
   });
   var qz_store = Ext.create('Ext.data.Store', {
   		id:'qz_store',
   		model : 'qz_model',
   		proxy: {
   			type: 'ajax',
   			url : '/desktop/get_qz_grid',
   			//extraParams: {query:title},
   			reader: {
   				type: 'json',
   				root: 'rows',
   				totalProperty: 'results'
   			}
   		}				
   });



   //qz_store.load();
Ext.regModel('dalb_model', {
	fields: [
		{name: 'id',		type: 'integer'},
		{name: 'lbmc',		type: 'string'}
	]
});
var dalb_store = Ext.create('Ext.data.Store', {
		id:'dalb_store',
		model : 'dalb_model',
		proxy: {
			type: 'ajax',
			url : '/desktop/get_dalb_grid',
			//extraParams: {query:title},
			reader: {
				type: 'json',
				root: 'rows',
				totalProperty: 'results'
			}
		}				
});


var zt_data = [	
	['1','宋体'],
	['2','黑体']
];
var zt_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : zt_data
});

var ktms_data = [
 ['0','制冷'],
 ['1','通风'],
 ['2','制热']
];

var ktms_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : ktms_data
});

var kg_data = [
 ['0','关'],
 ['1','开']
];


var kg_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : kg_data
});

var sb_nxdj_data = [
 ['1','5秒钟一次'],
 ['2','5分钟一次']
];
var sb_nxdj_store = new Ext.data.SimpleStore({
	fields: ['id', 'text'],
	data : sb_nxdj_data
});

var jr_model_data = [
 ['1','题名'],
 ['2','责任者'],
 ['3','文号']
];

var jr_model_store = new Ext.data.SimpleStore({
	fields: ['value', 'text'],
	data : jr_model_data
});


　　Ext.regModel('com_jr_wh_model', {
   	fields: [
   		{name: 'id',		type: 'integer'},
   		{name: 'name',		type: 'string'}
   	]
   });
   var com_jr_wh_store = Ext.create('Ext.data.Store', {
   		id:'com_jr_wh_store',
   		model : 'com_jr_wh_model',
   		proxy: {
   			type: 'ajax',
   			url : '/desktop/get_jr_model_wh_grid',
   			//extraParams: {query:'文号'},
   			reader: {
   				type: 'json',
   				root: 'rows',
   				totalProperty: 'results'
   			}
   		}				
   });
　　Ext.regModel('com_jr_zrz_model', {
   	fields: [
   		{name: 'id',		type: 'integer'},
   		{name: 'name',		type: 'string'}
   	]
   });
   var com_jr_zrz_store = Ext.create('Ext.data.Store', {
   		id:'com_jr_zrz_store',
   		model : 'com_jr_zrz_model',
   		proxy: {
   			type: 'ajax',
   			url : '/desktop/get_jr_model_zrz_grid',
   			//extraParams: {query:'责任者'},
   			reader: {
   				type: 'json',
   				root: 'rows',
   				totalProperty: 'results'
   			}
   		}				
   });
//com_jr_zrz_store.load();



Ext.regModel('com_jr_tm_model', {
  fields: [
    {name: 'id',    type: 'integer'},
    {name: 'name',    type: 'string'}
  ]
});
var com_jr_tm_store = Ext.create('Ext.data.Store', {
    id:'com_jr_tm_store',
    model : 'com_jr_tm_model',
    proxy: {
      type: 'ajax',
      url : '/desktop/get_jr_model_tm_grid',
	  //extraParams: {query:'题名'},
      reader: {
        type: 'json',
        root: 'rows',
        totalProperty: 'results'
      }
    }       
});
//com_jr_tm_store.load();

Ext.regModel('timage_model', {
    fields: [
      {name: 'id',     type: 'integer'},
      {name: 'dh',     type: 'string'},
      {name: 'yxmc',     type: 'string'},
      {name: 'yxdx',     type: 'string'},
      {name: 'yxbh',     type: 'string'}
    ]
  });

  var timage_store =  Ext.create('Ext.data.Store', {
    model : 'timage_model',
    proxy: {
      type: 'ajax',
      url : '/desktop/get_timage',
      extraParams: {dh:"",type:"0"},
      reader: {
        type: 'json',
        root: 'rows',
        totalProperty: 'results'
      }
    }
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
					if (Ext.getCmp('zh_id').value!=undefined){
						DispJr(record,true,Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					}

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
						DispJr(model,false,'','',true);
					});
				}
			},{
				xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
		          handler: function() {
					if (Ext.getCmp('zh_id').value!=undefined){
						size=Ext.getCmp('com_document_grid').store.count();
						if (size>0){	              					  
			              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
						}else{					
							DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
						}
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					}		              
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
						//DispJr(r,false);
						DispJr(r,false,'','',true);
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");																						
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('zh_id').setValue(responseT[2]);
										Ext.getCmp('zh_dh').setValue(responseT[1]);
										add_new=false;											
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid').store.load();						
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
	                    y: 10,
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("目录号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('zh_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'zh_dh',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		
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
			    	parameters: {dalb:title,qx:true},
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
					if (Ext.getCmp('cw_id').value!=undefined){
						DispJr(record,true,Ext.getCmp('cw_id').value,Ext.getCmp('cw_dh').value,true);
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					}

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
						DispJr(model,false,'','',true);
					});
				}
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('cw_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('cw_id').value,Ext.getCmp('cw_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
						DispJr(r,false,'','',true);
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										//Ext.getCmp('archive_grid_cw').store.load();
										//Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('cw_id').setValue(responseT[2]);
										Ext.getCmp('cw_dh').setValue(responseT[1]);
										add_new=false;												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid_cw').store.load();
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
	                    y: 10,
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("目录号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('cw_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
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
	                    xtype: 'datefield',
						format: 'Y-m-d',
	                    width: 145,
	                    fieldLabel: '起 日 期',
	                    labelWidth: 60,
						name: 'qrq',
						id: 'cw_qrq',
	                    x: 10,
	                    y: 115
	                },
	                {
	                    xtype: 'datefield',
						format: 'Y-m-d',
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
						name: 'jnzs',
						id: 'cw_jnzs',
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'cw_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'cw_dh',
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
		ss=title.split('_');
		Ext.getCmp('cw_dalb').setValue(ss[1]);		
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
			    	parameters: {dalb:title,qx:true},
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
					if (Ext.getCmp('tddj_id').value!=undefined){
						DispJr(record,true,Ext.getCmp('tddj_id').value,Ext.getCmp('tddj_dh').value,true);
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					}

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
						DispJr(model,false,'','',true);
					});
				}
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('tddj_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('tddj_id').value,Ext.getCmp('tddj_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
						DispJr(r,false,'','',true);
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										//Ext.getCmp('archive_grid_tddj').store.load();
										//Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('tddj_id').setValue(responseT[2]);
										Ext.getCmp('tddj_dh').setValue(responseT[1]);
										add_new=false;												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid_tddj').store.load();
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
	                    y: 10,
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("目录号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('tddj_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
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
	                    xtype: 'combobox',
	                    fieldLabel: '权属性质',
	                    labelWidth: 60,
						name: 'qsxz',
						store: qsxz_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
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
	                    width: 475,
	                    fieldLabel: '权  利  人',
	                    labelWidth: 60,
						name: 'qlrmc',
						id: 'tddj_qlrmc',
	                    x: 10,
	                    y: 100
	                },
					{
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '图幅号',
	                    labelWidth: 60,
						name: 'tfh',
						id: 'tddj_tfh',
	                    x: 520,
	                    y: 100
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
	                    width: 140,
	                    fieldLabel: '箱号',
	                    labelWidth: 60,
						name: 'xh',
						id: 'tddj_xh',
	                    x: 345,
	                    y: 160
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
	                    width: 320,
	                    fieldLabel: '备注',
	                    labelWidth: 60,
						name: 'bz',
						id: 'tddj_bz',
	                    x: 345,
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'tddj_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'tddj_dh',
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
			ss=title.split('_');
			Ext.getCmp('tddj_dalb').setValue(ss[1]);			
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
				    	parameters: {dalb:title,qx:true},
				    	onComplete:	 function(request) {
				    		Ext.getCmp('tddj_ajh').setValue(request.responseText);
				     	}
				     });
			}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_wsda = function(record,add_new,title){
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
	 //  tbar:[
	 //  	{xtype:'button',text:'添加',tooltip:'添加卷内目录',id:'jradd',iconCls:'add',
	 //  		handler: function() {
	 //  			var grid = Ext.getCmp('archive_grid_wsda');
	 //  			var records = grid.getSelectionModel().getSelection();
	 //  			var record = records[0];
	 //  			DispJr(record,true);
     //
	 //  		}
	 //  	},
	 //  	{xtype:'button',text:'删除',tooltip:'删除卷内目录',id:'jrdelete',iconCls:'remove',
	 //  		handler: function() {
     //
	 //  			var grid = Ext.getCmp('com_document_grid');
	 //  			var records = grid.getSelectionModel().getSelection();
	 //  			var record = records[0];
     //
	 //  			var pars="id="+record.data.id;
	 //  			Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
	 //  						if(id=="yes"){
	 //  							new Ajax.Request("/desktop/delete_document", { 
	 //  								method: "POST",
	 //  								parameters: pars,
	 //  								onComplete:	 function(request) {
	 //  									Ext.getCmp('com_document_grid').store.load();
     //
	 //  								}
	 //  							});
	 //  						}else{
	 //  							//alert('O,no');
	 //  						}
     //
	 //  				});
     //
	 //  		}},
	 //  	{xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',id:'jrsave',iconCls:'option',
	 //  	handler: function() {
	 //  		var grid  = this.ownerCt.ownerCt;
	 //  		//alert(grid);
	 //  			var store = grid.getStore(); 
	 //  			var records = grid.getSelectionModel().getSelection();
	 //  			var data = [];
	 //  			Ext.Array.each(records,function(model){
	 //  				data.push(Ext.JSON.encode(model.get('id')));
	 //  				DispJr(model,false);
	 //  			});
	 //  		}
	 //  	}
     //
	 //  ],
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										Ext.getCmp('archive_grid_wsda').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										Ext.getCmp('archive_grid_wsda').store.load();
										//Ext.getCmp('archive_tree').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
				width: 688,
				height: 256,
				region: 'center',
				xtype:'form',
				layout: 'absolute',
				id : 'daglaj_form',
				items: [
	                {
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '年 度',
	                    labelWidth: 60,
						name: 'nd',
						id: 'wsda_nd',
	                    x: 10,
	                    y: 10
	                },
					{
	                    xtype: 'combobox',
	                    width: 165,
	                    fieldLabel: '保管期限',
	                    labelWidth: 60,
						name: 'bgqx',
						id: 'wsda_bgqx',
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
	                    x: 175,
	                    y: 10
	                },
				 //  {
	             //      xtype: 'combobox',  //机构问题号下拉框
	             //      width: 100,
	             //      fieldLabel: '',
	             //      x: 410,
	             //      y: 10,
				 //  	listeners : {
				 //  	       select: function(f,r,i){
				 //  			if (i == 0){
				 //  				Ext.Msg.prompt('New Genre','Name',Ext.emptyFn);
				 //  				}
				 //  			}
				 //  				
				 //  	       
				 //  	}
	             //  },					
	                {
	                    xtype: 'textfield',
	                    width: 165,
	                    fieldLabel: '机构问题',
	                    labelWidth: 60,
						name: 'jgwth',
						id: 'wsda_jgwth',
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '件号',
	                    labelWidth: 60,
						name: 'jh',
						id: 'wsda_jh',
	                    x: 525,
	                    y: 10
	                },
					{
	                    xtype: 'datefield',
						format: 'Y-m-d',
	                    width: 160,
	                    fieldLabel: '制文日期',
	                    labelWidth: 60,
						name: 'zwrq',
						id: 'wsda_zwrq',
	                    x: 10,
	                    y: 40
	                },
					{
	                    xtype: 'textfield',
	                    width: 165,
	                    fieldLabel: '页数',
	                    labelWidth: 60,
						name: 'ys',
						id: 'wsda_ys',
	                    x: 175,
	                    y: 40
	                },
					{
	                    xtype: 'combobox',
	                    width: 165,
	                    fieldLabel: '密级',
	                    labelWidth: 60,
						name: 'mj',
						id: 'wsda_mj',
						
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						
	                    x: 345,
	                    y: 40
	                },
					{
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '馆编件号',
	                    labelWidth: 60,
						name: 'gbjh',
						id: 'wsda_gbjh',
	                    x: 525,
	                    y: 40
	                },
					{
	                    xtype: 'textfield',
	                    width: 330,
	                    fieldLabel: '文 号',
	                    labelWidth: 60,
						name: 'wh',
						id: 'wsda_wh',
	                    x: 10,
	                    y: 70
	                },
					{
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '责任者',
	                    labelWidth: 60,
						name: 'zrr',
						id: 'wsda_zrr',
	                    x: 345,
	                    y: 70
	                },
					{
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '题 名',
						name: 'tm',
						id: 'wsda_tm',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 100
	                },
					{
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '目录号',
	                    labelWidth: 60,
						name: 'mlh',
						id: 'wsda_mlh',
	                    x: 10,
	                    y: 130
	                },
					{
	                    xtype: 'combobox',
	                    width: 160,
	                    fieldLabel: '稿本',
	                    labelWidth: 60,
						name: 'gb',
						id: 'wsda_gb',
						store: gb_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
	                    x: 180,
	                    y: 130
	                },
					{
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '盒号',
	                    labelWidth: 60,
						name: 'hh',
						id: 'wsda_hh',
	                    x: 345,
	                    y: 130
	                },
					{
	                    xtype: 'combobox',
	                    width: 165,
	                    fieldLabel: '文种',
	                    labelWidth: 60,
						store: wz_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						name: 'wz',
						id: 'wsda_wz',
	                    x: 10,
	                    y: 160
	                },
					{
	                    xtype: 'combobox',
	                    width: 160,
	                    fieldLabel: '载体类型',
	                    labelWidth: 60,
						store: ztlx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						name: 'ztlx',
						id: 'wsda_ztlx',
	                    x: 180,
	                    y: 160
	                },
					{
	                    xtype: 'combobox',
	                    width: 165,
	                    fieldLabel: '载体规格',
	                    labelWidth: 60,
						store: ztgg_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						name: 'ztgg',
						id: 'wsda_ztgg',
	                    x: 345,
	                    y: 160
	                },
					{
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '载体单位',
	                    labelWidth: 60,
						store: ztdw_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						name: 'ztdw',
						id: 'wsda_ztdw',
	                    x: 520,
	                    y: 160
	                },
					{
	                    xtype: 'textfield',
	                    width: 165,
	                    fieldLabel: '分类号',
	                    labelWidth: 60,
						name: 'flh',
						id: 'wsda_flh',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '档案馆代号',
	                    labelWidth: 65,
						name: 'dagdh',
						id: 'wsda_dagdh',
	                    x: 180,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    width: 165,
	                    fieldLabel: '电子文档号',
	                    labelWidth: 65,
						name: 'dzwdh',
						id: 'wsda_dzwdh',
	                    x: 345,
	                    y: 190
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '缩 微 号',
	                    labelWidth: 60,
						name: 'swh',
						id: 'wsda_swh',
	                    x: 520,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    width: 165,
	                    fieldLabel: '载体数量',
						name: 'ztsl',
						id: 'wsda_ztsl',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 220
	                },
	                {
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '全文标识',
	                    labelWidth: 60,
						name: 'qwbs',
						id: 'wsda_qwbs',
	                    x: 180,
	                    y: 220
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '主题词',
	                    labelWidth: 60,
						name: 'ztc',
						id: 'wsda_ztc',
	                    x: 345,
	                    y: 220
	                },
	                {
	                    xtype: 'textfield',
	                    width: 330,
	                    fieldLabel: '主办部门',
						name: 'zbbm',
						id: 'wsda_zbbm',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 250
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '协办部门',
	                    labelWidth: 60,
						name: 'xbbm',
						id: 'wsda_xbbm',
	                    x: 345,
	                    y: 250
	                },	                
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备 注',
	                    labelWidth: 60,
						name: 'bz',
						id: 'wsda_bz',
	                    x: 10,
	                    y: 280
	                },{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'wsda_id',
	                    x: 10,
	                    y: 190
	                },{
		                xtype: 'textfield',
	                    hidden : true,
						name: 'qzh',
						id: 'wsda_qzh',
	                    x: 10,
	                    y: 190
	                },{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dalb',
						id: 'wsda_dalb',
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
			ss=title.split('_');
			Ext.getCmp('wsda_dalb').setValue(ss[1]);
			
			Ext.getCmp('wsda_qzh').setValue(ss[0]);
			
	
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_sx = function(record,add_new,title){
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
					if (Ext.getCmp('zh_id').value!=undefined){
						DispJr(record,true,Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					}

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
						DispJr(model,false,'','',true);
					});
				}
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
						DispJr(r,false,'','',true);
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
			title: '声像案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										//Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('zh_id').setValue(responseT[2]);
										Ext.getCmp('zh_dh').setValue(responseT[1]);
										add_new=false;											
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid').store.load();
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
	                    y: 10,
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("目录号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('zh_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
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
	                    width: 140,
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
	                    fieldLabel: '种类',
	                    labelWidth: 60,
						name: 'zl',
						store: sxzl_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_zl',
	                    x: 520,
	                    y: 150
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'zh_dh',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		
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
			    	parameters: {dalb:title,qx:true},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_ajh').setValue(request.responseText);
			     	}
			     });
		}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_tjml = function(record,add_new,title){
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
					if (Ext.getCmp('zh_id').value!=undefined){
						DispJr(record,true,Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					};
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
						DispJr(model,false,'','',true);
					});
				}
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
						DispJr(r,false,'','',true);
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										//Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('zh_id').setValue(responseT[2]);
										Ext.getCmp('zh_dh').setValue(responseT[1]);
										add_new=false;												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid').store.load();
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
	                    y: 10,
						name: 'mlh',
						id: 'zh_mlh',	                    
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("目录号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('zh_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '序号',
	                    labelWidth: 60,
						name: 'ajh',
						id: 'zh_ajh',
	                    x: 175,
	                    y: 10
							                    
						
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '图 幅 号',
	                    labelWidth: 60,
						name: 'tfh',
						id: 'zh_tfh',
	                    x: 10,
	                    y: 45
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '年度',
						name: 'nd',
						id: 'zh_nd',
	                    labelWidth: 60,
	                    x: 350,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '图    名',
						name: 'tm',
						id: 'zh_tm',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 80
	                },
	                {
	                    xtype: 'textfield',
	                    width: 485,
	                    fieldLabel: '图 柜 号',
						name: 'tgh',
						id: 'zh_tgh',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '张数',
						name: 'ys',
						id: 'zh_ys',
	                    labelWidth: 60,
	                    x: 525,
	                    y: 115
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
	                    x: 520,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备 注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 150
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'zh_dh',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		
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
			    	parameters: {dalb:title,qx:true},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_ajh').setValue(request.responseText);
			     	}
			     });
		}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_qtda_dzda = function(record,add_new,title){
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
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
			title: '其它档案_电子档案案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										//Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('zh_id').setValue(responseT[2]);
										Ext.getCmp('zh_dh').setValue(responseT[1]);
										add_new=false;												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid').store.load();
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
	                    fieldLabel: '档 号',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 10,
						name: 'mlh',
						id: 'zh_mlh',	                    
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("档号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('zh_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
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
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '顺序号',
						name: 'ajh',
						id: 'zh_ajh',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '提交人',
						name: 'tjr',
						id: 'zh_tjr',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 220
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '软件环境',
						name: 'rjhj',
						id: 'zh_rjhj',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '操作系统',
						name: 'czxt',
						id: 'zh_czxt',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '数量',
						name: 'sl',
						id: 'zh_sl',
	                    labelWidth: 60,
	                    x: 180,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '备份数',
						name: 'bfs',
						id: 'zh_bfs',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '载体包含的文件格式',
	                    labelWidth: 60,
						name: 'ztbhdwjgs',
						id: 'zh_ztbhdwjgs',
	                    x: 10,
	                    y: 220
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '应用软件   平台',
						name: 'yyrjpt',
						id: 'zh_yyrjpt',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 190
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '保管期限',
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_bgqx',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 190
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '密级',
						name: 'mj',
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_mj',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 190
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '提交单位',
	                    labelWidth: 60,
						name: 'tjdw',
						id: 'zh_djdw',
	                    x: 345,
	                    y: 220
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '题 名',
						name: 'tm',
						id: 'zh_tm',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 170,
	                    fieldLabel: '文件载体',
						name: 'wjzt',
						id: 'zh_wjzt',
	                    labelWidth: 60,
	                    x: 495,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '电子文件名',
						name: 'dzwjm',
						id: 'zh_dzwjm',
	                    labelWidth: 65,
	                    x: 10,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 150,
	                    fieldLabel: '载体编号',
						name: 'ztbh',
						id: 'zh_ztbh',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '形成部门',
						name: 'xcbm',
						id: 'zh_xcbm',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 70
	                },
	                {
	                    xtype: 'datefield',
						format: 'Y-m-d',
	                    width: 170,
	                    fieldLabel: '形成日期',
						name: 'xcrq',
						id: 'zh_xcrq',
	                    labelWidth: 60,
	                    x: 495,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '箱 号',
						name: 'xh',
						id: 'zh_xh',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 250
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '接收人',
						name: 'jsr',
						id: 'zh_jsr',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 250
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '接收单位',
						name: 'jsdw',
						id: 'zh_jsdw',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 250
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '存入位置',
						name: 'cfwz',
						id: 'zh_cfwz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 280
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '备注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 280
	                },
	                {
	                    xtype: 'textfield',
	                    width: 475,
	                    fieldLabel: '硬件环境',
						name: 'yjhj',
						id: 'zh_yjhj',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 160
	                },
	                {
	                    xtype: 'textfield',
	                    width: 170,
	                    fieldLabel: '页数',
						name: 'ys',
						id: 'zh_ys',
	                    labelWidth: 60,
	                    x: 495,
	                    y: 160
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'zh_dh',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		
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
			    	parameters: {dalb:title,qx:true},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_ajh').setValue(request.responseText);
			     	}
			     });
		}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_qtda_sbda = function(record,add_new,title){
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
					if (Ext.getCmp('zh_id').value!=undefined){
						DispJr(record,true,Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					};

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
						DispJr(model,false,'','',true);
					});
				}
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
						DispJr(r,false,'','',true);
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
			title: '其它档案_设备档案案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										//Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('zh_id').setValue(responseT[2]);
										Ext.getCmp('zh_dh').setValue(responseT[1]);
										add_new=false;												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid').store.load();
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
	                    width: 155,
	                    fieldLabel: '目 录 号',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 10,
						name: 'mlh',
						id: 'zh_mlh',	                    
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("档号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('zh_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '分类号',
						name: 'flh',
						id: 'zh_flh',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '件号',
						name: 'ajh',
						id: 'zh_ajh',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '资产编号',
						name: 'zcbh',
						id: 'zh_zcbh',
	                    labelWidth: 60,
	                    x: 520,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 475,
	                    fieldLabel: '使用保管  单位',
						name: 'sybgdw',
						id: 'zh_sybgdw',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 325,
	                    fieldLabel: '使用保管人',
						name: 'sybgr',
						id: 'zh_sybgr',
	                    labelWidth: 60,
	                    x: 340,
	                    y: 160
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '页数',
						name: 'ys',
						id: 'zh_ys',
	                    labelWidth: 60,
	                    x: 520,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '存入位置',
						name: 'cfwz',
						id: 'zh_cfwz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 190
	                },
	                {
	                    xtype: 'textfield',
	                    width: 325,
	                    fieldLabel: '箱号',
						name: 'xh',
						id: 'zh_xh',
	                    labelWidth: 60,
	                    x: 340,
	                    y: 190
	                },
	                {
	                    xtype: 'combobox',
	                    width: 155,
	                    fieldLabel: '保管期限',
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_bgqx',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 160
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '密级',
						name: 'mj',
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_mj',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 160
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 220
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '资产名称',
						name: 'zcmc',
						id: 'zh_zcmc',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '数量',
						name: 'sl',
						id: 'zh_sl',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '单位',
						name: 'dw',
						id: 'zh_dw',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '单价',
						name: 'dj',
						id: 'zh_dj',
	                    labelWidth: 60,
	                    x: 520,
	                    y: 70
	                },
	                {
	                    xtype: 'datefield',
						format: 'Y-m-d',
	                    width: 155,
	                    fieldLabel: '购置时间',
						name: 'gzsj',
						id: 'zh_gzsj',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 155,
	                    fieldLabel: '金额',
						name: 'je',
						id: 'zh_je',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 490,
	                    fieldLabel: '存放地点',
						name: 'cfdd',
						id: 'zh_cfdd',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 100
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'zh_dh',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		
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
			    	parameters: {dalb:title,qx:true},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_ajh').setValue(request.responseText);
			     	}
			     });
		}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_qtda_jjda = function(record,add_new,title){
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
					if (Ext.getCmp('zh_id').value!=undefined){
						DispJr(record,true,Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					};

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
						DispJr(model,false,'','',true);
					});
				}
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
						DispJr(r,false,'','',true);
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
			title: '其它档案_基建档案案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										//Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('zh_id').setValue(responseT[2]);
										Ext.getCmp('zh_dh').setValue(responseT[1]);
										add_new=false;											
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid').store.load();
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
						name: 'mlh',
						id: 'zh_mlh',	                    
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("目录号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('zh_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						},
	                    labelWidth: 60,
	                    x: 10,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '分类号',
						name: 'flh',
						id: 'zh_flh',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '案卷号',
						name: 'ajh',
						id: 'zh_ajh',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '建设年代',
						name: 'nd',
						id: 'zh_nd',
	                    labelWidth: 60,
	                    x: 520,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '起 年 月',
						name: 'qny',
						id: 'zh_qny',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '止年月',
						name: 'zny',
						id: 'zh_zny',
	                    labelWidth: 60,
	                    x: 520,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '件数',
						name: 'js',
						id: 'zh_js',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '页数',
						name: 'ys',
						id: 'zh_ys',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '存入位置',
						name: 'cfwz',
						id: 'zh_cfwz',
	                    labelWidth: 60,
	                    x: 520,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '箱号',
						name: 'xh',
						id: 'zh_xh',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 130
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '保管期限',
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_bgqx',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 100
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '密级',
						name: 'mj',
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_mj',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 160
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '项目名称',
						name: 'xmmc',
						id: 'zh_xmmc',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '建设单位',
						name: 'jsdw',
						id: 'zh_jsdw',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 70
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'zh_dh',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		
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
			    	parameters: {dalb:title,qx:true},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_ajh').setValue(request.responseText);
			     	}
			     });
		}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_qtda_swda = function(record,add_new,title){
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
					if (Ext.getCmp('zh_id').value!=undefined){
						DispJr(record,true,Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
					}else
					{
						alert("请先保存案卷再进行卷内的新增。");
					};

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
						DispJr(model,false,'','',true);
					});
				}
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
						DispJr(r,false,'','',true);
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
			title: '其它档案_实物档案案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										//Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										dh=responseT[1];
										Ext.getCmp('button_aj_add').setText('修改');
										Ext.getCmp('zh_id').setValue(responseT[2]);
										Ext.getCmp('zh_dh').setValue(responseT[1]);
										add_new=false;											
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
						Ext.getCmp('archive_grid').store.load();
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
	                    y: 10,
						name: 'mlh',
						id: 'zh_mlh',	                    
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("目录号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('zh_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '分类号',
						name: 'flh',
						id: 'zh_flh',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '件号',
						name: 'ajh',
						id: 'zh_ajh',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '编号',
						name: 'bh',
						id: 'zh_bh',
	                    labelWidth: 60,
	                    x: 505,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '载体形式',
						name: 'ztxs',
						id: 'zh_ztxs',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '页数',
						name: 'ys',
						id: 'zh_ys',
	                    labelWidth: 60,
	                    x: 505,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '存入位置',
						name: 'cfwz',
						id: 'zh_cfwz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 160
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '箱号',
						name: 'xh',
						id: 'zh_xh',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 160
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '保管期限',
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_bgqx',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 130
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '密级',
						name: 'mj',
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_mj',
	                    labelWidth: 60,
	                    x: 340,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 190
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '类 别',
						name: 'lb',
						store: swda_lb_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_lb',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '名 称',
	 					name: 'mc',
						id: 'zh_mc',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '获奖者',
						name: 'hjz',
						id: 'zh_hjz',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '授奖单位',
						name: 'sjdw',
						id: 'zh_sjdw',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 100
	                },
	                {
	                    xtype: 'datefield',
						format: 'Y-m-d',
	                    width: 160,
	                    fieldLabel: '获奖时间',
						name: 'sjsj',
						id: 'zh_sjsj',
	                    labelWidth: 60,
	                    x: 505,
	                    y: 70
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
	                    x: 10,
	                    y: 190
	                },
					{
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'dh',
						id: 'zh_dh',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		
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
			    	parameters: {dalb:title,qx:true},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_ajh').setValue(request.responseText);
			     	}
			     });
		}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_qtda_zlxx = function(record,add_new,title){
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
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
			title: '其它档案_资料信息档案案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										Ext.getCmp('archive_grid').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_tree').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
	                    y: 10,
						name: 'mlh',
						id: 'zh_mlh',	                    
						listeners : {
						       change : function(field,newValue,oldValue){
									if (newValue==""){
										alert("目录号不能为空。");
										field.value=oldValue;
									}else{
										qzh=title.split("_");
										if(add_new==false){
							               //alert(newValue+'---'+'oldValue');
										}
										else{
											new Ajax.Request("/desktop/get_max_ajh", { 
											    	method: "POST",
											    	parameters: {dalb:qzh[0] + "_" +qzh[1]+"_"+ newValue,qx:false},
											    	onComplete:	 function(request) {
											    		Ext.getCmp('zh_ajh').setValue(request.responseText);
											     	}
											     });
										}
									}
									
						       }
						}
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '分类号',
						name: 'flh',
						id: 'zh_flh',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 140,
	                    fieldLabel: '件号',
						name: 'ajh',
						id: 'zh_ajh',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '编号',
						name: 'bh',
						id: 'zh_bh',
	                    labelWidth: 60,
	                    x: 505,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '页数',
						name: 'ys',
						id: 'zh_ys',
	                    labelWidth: 60,
	                    x: 505,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 310,
	                    fieldLabel: '存入位置',
						name: 'cfwz',
						id: 'zh_cfwz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 130
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '箱号',
						name: 'xh',
						id: 'zh_xh',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 130
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '保管期限',
						name: 'bgqx',
						store: bgqx_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_bgqx',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 100
	                },
	                {
	                    xtype: 'combobox',
	                    width: 145,
	                    fieldLabel: '密级',
						name: 'mj',
						store: mj_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_mj',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 100
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 160
	                },
	                {
	                    xtype: 'combobox',
	                    width: 160,
	                    fieldLabel: '类别',
						name: 'lb',
						store: zlxx_lb_store,
						emptyText:'请选择',
						mode: 'remote',
						minChars : 2,
						valueField:'text',
						displayField:'text',
						triggerAction:'all',
						id:'zh_lb',
	                    labelWidth: 60,
	                    x: 505,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 475,
	                    fieldLabel: '编制单位',
						name: 'bzdw',
						id: 'zh_bzdw',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 40
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '标 题',
						name: 'tm',
						id: 'zh_tm',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 145,
	                    fieldLabel: '出版年度',
						name: 'nd',
						id: 'zh_nd',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 100
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);
		
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
			    	parameters: {dalb:title,qx:true},
			    	onComplete:	 function(request) {
			    		Ext.getCmp('zh_ajh').setValue(request.responseText);
			     	}
			     });
		}
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_by_tszlhj = function(record,add_new,title){
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
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
			title: '编研类-图书资料汇集案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										Ext.getCmp('archive_grid').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_tree').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
	                    width: 310,
	                    fieldLabel: '登记号',
						name: 'djh',
						id: 'zh_djh',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 325,
	                    fieldLabel: '刑期',
						name: 'kq',
						id: 'zh_kq',
	                    labelWidth: 60,
	                    x: 340,
	                    y: 10
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 55,
	                    width: 655,
	                    fieldLabel: '名 称',
						name: 'mc',
						id: 'zh_mc',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 45
	                },
	                {
	                    xtype: 'textfield',
	                    width: 160,
	                    fieldLabel: '份 数',
						name: 'fs',
						id: 'zh_fs',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 150
	                },
	                {
	                    xtype: 'textfield',
	                    width: 335,
	                    fieldLabel: '邮发代码',
						name: 'yfdm',
						id: 'zh_yfdm',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 125,
	                    fieldLabel: '单价',
						name: 'dj',
						id: 'zh_dj',
	                    labelWidth: 60,
	                    x: 520,
	                    y: 115
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备 注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 185
	                },
	                {
	                    xtype: 'textfield',
	                    width: 490,
	                    fieldLabel: '存放位置',
						name: 'cfwz',
						id: 'zh_cfwz',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 150
	                },
	                {
	                    xtype: 'datefield',
						format: 'Y-m-d',
	                    width: 160,
	                    fieldLabel: '出版日期',
						name: 'cbrq',
						id: 'zh_cbrq',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 115
	                },
	                {
	                    xtype: 'label',
	                    height: 20,
	                    width: 20,
	                    text: '元',
	                    x: 650,
	                    y: 120
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);		
		Ext.getCmp('zh_qzh').setValue(ss[0]);
		
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_by_jcszhb = function(record,add_new,title){
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
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
			title: '编研类-图书资料汇集案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										Ext.getCmp('archive_grid').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_tree').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
	                    width: 655,
	                    fieldLabel: '专 题',
						name: 'zt',
						id: 'zh_zt',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 10
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 55,
	                    width: 655,
	                    fieldLabel: '前 言',
						name: 'qy',
						id: 'zh_qy',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 45
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 40,
	                    width: 655,
	                    fieldLabel: '统计数据',
						name: 'tjsj',
						id: 'zh_tjsj',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 115
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 40,
	                    width: 655,
	                    fieldLabel: '说 明',
						name: 'sm',
						id: 'zh_sm',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 170
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);		
		Ext.getCmp('zh_qzh').setValue(ss[0]);
		
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_by_zzjgyg = function(record,add_new,title){
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
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
			title: '编研类-组织机构沿革案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										Ext.getCmp('archive_grid').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_tree').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
	                    width: 655,
	                    fieldLabel: '机构名称',
						name: 'jgmc',
						id: 'zh_jgmc',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 10
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 80,
	                    width: 655,
	                    fieldLabel: '组织系统 领导成员 组成',
						name: 'zzzc',
						id: 'zh_zzzc',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 80
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '起止年月',
						name: 'qzny',
						id: 'zh_qzny',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 45
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备 注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 175
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);		
		Ext.getCmp('zh_qzh').setValue(ss[0]);
		
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_by_dsj = function(record,add_new,title){
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
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
			title: '编研类-大事记案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										Ext.getCmp('archive_grid').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										Ext.getCmp('archive_grid').store.load();
										////Ext.getCmp('archive_tree')//Ext.getCmp('archive_tree').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
	                    xtype: 'textareafield',
	                    height: 35,
	                    width: 655,
	                    fieldLabel: '地 点',
						name: 'dd',
						id: 'zh_dd',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 70
	                },
	                {
	                    xtype: 'textfield',
	                    width: 320,
	                    fieldLabel: '记录人',
						name: 'jlr',
						id: 'zh_jlr',
	                    labelWidth: 60,
	                    x: 345,
	                    y: 10
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '材料来源',
						name: 'clly',
						id: 'zh_clly',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 40
	                },
	                {
	                    xtype: 'datefield',
						format: 'Y-m-d',
	                    width: 160,
	                    fieldLabel: '发生日期',
						name: 'fsrq',
						id: 'zh_fsrq',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 10
	                },
	                {
	                    xtype: 'datefield',format: 'Y-m-d',
	                    width: 165,
	                    fieldLabel: '记录日期',
						name: 'jlrq',
						id: 'zh_jlrq',
	                    labelWidth: 60,
	                    x: 175,
	                    y: 10
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 35,
	                    width: 655,
	                    fieldLabel: '人 物',
						name: 'rw',
						id: 'zh_rw',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 115
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 35,
	                    width: 655,
	                    fieldLabel: '事 由',
						name: 'sy',
						id: 'zh_sy',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 160
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 35,
	                    width: 655,
	                    fieldLabel: '因 果',
						name: 'yg',
						id: 'zh_yg',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 205
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);		
		Ext.getCmp('zh_qzh').setValue(ss[0]);
		
		
		
	}
	//设置数据
	
	win.show();
};
var DispAj_by_qzsm = function(record,add_new,title){
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
			}	,{
					xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
			          handler: function() {
						if (Ext.getCmp('zh_id').value!=undefined){
							size=Ext.getCmp('com_document_grid').store.count();
							if (size>0){	              					  
				              	alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
							}else{					
								DispJr_model(Ext.getCmp('zh_id').value,Ext.getCmp('zh_dh').value,true);
							}
						}else
						{
							alert("请先保存案卷再进行卷内的新增。");
						}		              
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
			title: '编研类-全宗说明案卷详细信息',
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
						var pars=Ext.getCmp('daglaj_form').getForm().getValues();
						
						if(add_new==false){
							new Ajax.Request("/desktop/update_flow", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									if (request.responseText=='success'){
										alert("案卷修改成功。");
										Ext.getCmp('archive_grid').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷修改失败，请重新修改。"+request.responseText);
									}
									
								}
							});
						}else{
							new Ajax.Request("/desktop/insert_archive", { 
								method: "POST",
								parameters: pars,
								onComplete:	 function(request) {
									responseT=request.responseText.split(':');
									if (responseT[0]=='success'){
										alert("案卷新增成功。");
										Ext.getCmp('archive_grid').store.load();
										//Ext.getCmp('archive_tree').store.load();
										Ext.getCmp('archive_detail_win').close();												
									}else{
										alert("案卷新增失败，请重新保存。"+request.responseText);
									}
									
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
	                    width: 475,
	                    fieldLabel: '目 录 号',
						name: 'mlh',
						id: 'zh_mlh',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 10
	                },
	                {
	                    xtype: 'textareafield',
	                    height: 105,
	                    width: 655,
	                    fieldLabel: '全宗构成者简介',
						name: 'qzgczjj',
						id: 'zh_qzgczjj',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 45
	                },
	                {
	                    xtype: 'textfield',
	                    width: 655,
	                    fieldLabel: '备 注',
						name: 'bz',
						id: 'zh_bz',
	                    labelWidth: 60,
	                    x: 10,
	                    y: 165
	                },
	                {
	                    xtype: 'datefield',format: 'Y-m-d',
	                    width: 170,
	                    fieldLabel: '时间',
						name: 'sj',
						id: 'zh_sj',
	                    labelWidth: 60,
	                    x: 495,
	                    y: 10
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
	                },
	                {
	                    xtype: 'textfield',
	                    hidden : true,
						name: 'id',
						id: 'zh_id',
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
		ss=title.split('_');
		Ext.getCmp('zh_dalb').setValue(ss[1]);		
		Ext.getCmp('zh_qzh').setValue(ss[0]);
		
		
		
	}
	//设置数据
	
	win.show();
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
    text: '增加影像文件：(支持jpg、tif、zip、rar格式)',
    x: 10,
    y: 10,
    width: 100
  },
  {
    xtype: 'fileuploadfield',
    id: 'filedata',
    x: 10,
    y: 30,
    emptyText: '选择一个文件...',
    buttonText: '浏览'
  }],
  buttons: [
  {
    text: '上传',
    handler: function(){
      if (dh==''){
        msg('提示', '请先选择要增加影像文件的案卷.');
      } 
      else
      {
        myForm = Ext.getCmp('my_upload_form').getForm();
        
        if(myForm.isValid())
        {
            form_action=1;
            myForm.submit({
              url: '/desktop/upload_file',
              waitMsg: '文件上传中...',
              success: function(form, action){
                var isSuc = action.result.success; 
                filename=myForm._fields.items[0].lastValue.split('\\');
                file=filename[filename.length-1];
                if (isSuc) {
                  new Ajax.Request("/desktop/save_image_db", { 
                    method: "POST",
                    parameters: eval("({filename:'" + file + "',dh:'" + dh +"'})"),
                    onComplete:  function(request) {
                      if (request.responseText=='true'){
                        timage_store.load();
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
  }] //buttons
});
//显示卷内目录窗口
var DispJr = function(recordad,add_new,jr_aj_ownerid,jr_dh,aj_add_new){
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
						format: 'Y-m-d',
						x: 130,
						y: 190,
						width: 200,
						id:'jr_rq',
						name: 'rq'
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
								new Ajax.Request("/desktop/update_document", { 
									method: "POST",
									parameters: pars,
									onComplete:	 function(request) {
										fhz=request.responseText.split(":");
										if (fhz[0]=='success'){
											alert("卷内修改成功。");
											if (aj_add_new==true){
												if (add_new==true){
													Ext.getCmp('com_document_grid').store.proxy.extraParams.query=jr_aj_ownerid;
												};
												Ext.getCmp('com_document_grid').store.load();	
											}else
											{
												Ext.getCmp('document_grid').store.load();
											};
											Ext.getCmp('document_detail_win').close();											
										}else{
											if (fhz[0]=='false')
											{
												alert(fhz[1]);
											}else
											{
												alert("卷内修改失败，请重新保存。"+request.responseText);
											}
										}
									}
								});}
							else{
								new Ajax.Request("/desktop/insert_document", { 
									method: "POST",
									parameters: pars,
									onComplete:	 function(request) {
										fhz=request.responseText.split(":");
										if (fhz[0]=='success'){
											alert("卷内新增成功。");
											if (aj_add_new==true){
												if (add_new==true){
													Ext.getCmp('com_document_grid').store.proxy.extraParams.query=jr_aj_ownerid;
												};
												Ext.getCmp('com_document_grid').store.load();	
											}else
											{
												Ext.getCmp('document_grid').store.load();
											};
											Ext.getCmp('document_detail_win').close();										
										}else{
											if (fhz[0]=='false')
											{
												alert(fhz[1]);
											}else
											{
												alert("卷内新增失败，请重新保存。"+request.responseText);
											}
										}
										
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
							if (aj_add_new==true){
								if (add_new==true){
									Ext.getCmp('com_document_grid').store.proxy.extraParams.query=jr_aj_ownerid;
								};
								Ext.getCmp('com_document_grid').store.load();	
							}else
							{
								Ext.getCmp('document_grid').store.load();
							};					
							Ext.getCmp('document_detail_win').close();
						}
					}]
			}]
		});
	}
	Ext.getCmp('jr_dh').readOnly=true;
	if(add_new==false){
	//设置数据
		Ext.getCmp('dagljr_form').getForm().setValues(recordad.data);
		Ext.getCmp('jr_rq').Value=(recordad.data.rq);
	}else{
		
		Ext.getCmp('button_jr_add').text="新增";
		
		if (jr_dh!=undefined){
			Ext.getCmp('jr_dh').setValue(jr_dh);
			pars= {dh:jr_dh};
		}else{
			Ext.getCmp('jr_dh').setValue(recordad.data.dh);
			pars= {dh:recordad.data.dh};
		};
		if (jr_aj_ownerid!=undefined){
			Ext.getCmp('jr_ownerid').setValue(jr_aj_ownerid);
		}else{
			Ext.getCmp('jr_ownerid').setValue(recordad.data.id);
		};
	
		new Ajax.Request("/desktop/get_max_sxh", { 
		    	method: "POST",
		    	parameters: pars,
		    	onComplete:	 function(request) {
		    		Ext.getCmp('jr_sxh').setValue(request.responseText);
		     	}
		     });
		
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

//显示卷内模板新增窗口
var DispJr_model = function(jr_aj_ownerid,jr_dh,aj_add_new){
	var win = Ext.getCmp('document_model_win');
	function formatDate(value){
        return value ? Ext.Date.dateFormat(value, 'M d, Y') : '';
    };
	var com_zrz=[];
	var com_wh=[];
	

	Ext.regModel('jr_model_model', {
        fields: [
          {name: 'wh',    type: 'string'},
          {name: 'zrz',    type: 'string'},
          {name: 'name',    type: 'string'},
          {name: 'rq',   type: 'date', dateFormat: 'Y-m-d'},
          {name: 'yh',    type: 'string'}
        ]
      });

      var jr_model_store = Ext.create('Ext.data.Store', {
        id:'jr_model_store',
        model : 'jr_model_model',
        autoLoad: true,
        proxy: {
          type: 'ajax',
          url : '/desktop/get_jr_modellist_grid',
          extraParams: {query:'1'},
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
        //sortInfo:{field: 'level4', direction: "ASC"},
        //baseParams: {start:0, limit:25, query:""}
      });
		var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
	        clicksToEdit: 1
	    });
      var jr_model_grid = new Ext.grid.GridPanel({
        id : 'jr_model_grid',
        store: jr_model_store,        
        columns: [
		{
            xtype: 'checkcolumn',
            header: '选择',
            dataIndex: 'indoor',
            width: 40
        },
          { text : '文号',  width : 75, sortable : true, dataIndex: 'wh',
		  	editor: {
              xtype: 'combobox',
              	store: com_jr_wh_store,
                emptyText:'请选择',
                mode: 'remote',
                minChars : 2,
                valueField:'name',
                displayField:'name',
                triggerAction:'all',
                listConfig: { loadMask: false }
          	}
		  },
          { text : '责任者',  width : 150, sortable : true, dataIndex: 'zrz',
		  	editor: {
              xtype: 'combobox',
              store: com_jr_zrz_store,
              emptyText:'请选择',
              mode: 'remote',
              minChars : 2,
              valueField:'name',
              displayField:'name',
              triggerAction:'all',
              listConfig: { loadMask: false }
          	}
		  },
          { text : '题名',  width : 150, sortable : true, dataIndex: 'name',	
			editor: {
              allowBlank: false
          	},
			flex: 1
		  },
          { text : '日期',  width : 70, sortable : true, dataIndex: 'rq',renderer: Ext.util.Format.dateRenderer('Y-m-d'),
			
			editor: {
              xtype: 'datefield',
              format: 'y-m-d',
              minValue: '2012-01-01',
              disabledDays: [0, 6],
              disabledDaysText: 'Plants are not available on the weekends'
          	}
		  },
		  { text : '页号',  width : 150, sortable : true, dataIndex: 'yh',	
			editor: {
              allowBlank: false
          	},
			flex: 1
		  }
          ],
          //selType:'checkboxmodel',
          //multiSelect:true,
          selModel: {
            selType: 'cellmodel'
          },
        viewConfig: {
          stripeRows:true
        },
		plugins: [cellEditing]
      });	
	if (win==null) {
        win = new Ext.Window({
          id : 'jr_model_win',
          title: '卷内模板方式输入',
          //closeAction: 'hide',
          width: 570,
          x : 300,
          y : 50,
          height: 500,
          minHeight: 500,
          layout: 'fit',
          //modal: true,
          plain: true,
          items:jr_model_grid,          
          tbar:[{
            xtype: 'button',
            iconCls: 'save',
            text:'保存',
            handler: function() {
				save_sql='';
				size=jr_model_grid.store.data.items.size();
				if (size>0){					
					for (i = 0; i < size; i++) {
						if (jr_model_grid.store.data.items[i].data.indoor==true)
						{
							if(jr_model_grid.store.data.items[i].data.rq!=null){
								year=(jr_model_grid.store.data.items[i].data.rq.getYear()+1900);
								month=jr_model_grid.store.data.items[i].data.rq.getMonth()+1;
								rq=year+'-'+month+'-'+jr_model_grid.store.data.items[i].data.rq.getDate();
							}else{
								rq=null;
							};
							if (save_sql==''){
								save_sql=jr_model_grid.store.data.items[i].data.wh+'@'+jr_model_grid.store.data.items[i].data.zrz+'@'+jr_model_grid.store.data.items[i].data.name+'@'+rq+'@'+jr_model_grid.store.data.items[i].data.yh								
							}else{
								save_sql=save_sql+'$'+jr_model_grid.store.data.items[i].data.wh+'@'+jr_model_grid.store.data.items[i].data.zrz+'@'+jr_model_grid.store.data.items[i].data.name+'@'+rq+'@'+jr_model_grid.store.data.items[i].data.yh
							}
						}
					}
					
				}
				if(save_sql!=''){
					new Ajax.Request("/desktop/insert_document_model", { 
						method: "POST",
						parameters: {dh:jr_dh,ownerid:jr_aj_ownerid,save_sql:save_sql},
						onComplete:	 function(request) {
							fhz=request.responseText.split(":");
							if (fhz[0]=='success'){
								alert("卷内新增成功。");
								if (aj_add_new==true){	
									Ext.getCmp('com_document_grid').store.proxy.extraParams.query=jr_aj_ownerid;								
									Ext.getCmp('com_document_grid').store.load();	
								}else
								{
									Ext.getCmp('document_grid').store.load();
								};
								Ext.getCmp('jr_model_win').close();											
							}else{
								if (fhz[0]=='false')
								{
									alert(fhz[1]);
								}else
								{
									alert("卷内新增失败，请重新保存。"+request.responseText);
								}
							}
						}
					});
				}else{
					alert("请选择一个或多个模板列表侢进行保存。");
				}
				
            }
          },
          '<span style=" font-size:12px;font-weight:600;color:#3366FF;">卷内模板名称选择</span>:&nbsp;&nbsp;',{
           xtype: 'combo',           
           x: 130,
           y: 190,
           width: 200,
           name: 'jr_model_select',
           id: 'jr_model_select',
           store: com_jr_tm_store,
           emptyText:'请选择',
           mode: 'local',
           minChars : 2,
           valueField:'id',
           displayField:'name',
           triggerAction:'all',
           listeners:{
             select:function(combo, records, index) {
               jr_model_store.proxy.extraParams.query=combo.lastValue;
               jr_model_store.load();
             }
           }
		  },
          {
            xtype: 'button',
            iconCls: 'exit',
            text:'退出',
            handler: function() {
              //this.up('window').hide();
              Ext.getCmp('jr_model_win').close();
            }
          }]

        });
      }


      win.show();
};

//图像显示窗口
var scale = 0.64;
var scaleMultiplier = 0.8;
var translatePos =  { x: 0,y: 0};
var imageObj = new Image();

var draw = function(scale, translatePos, imageObj){

 var canvas = document.getElementById("myCanvas");
 var context = canvas.getContext("2d");

 // clear canvas
 context.clearRect(0, 0, canvas.width, canvas.height);
 context.save();

 //context.translate(translatePos.x, translatePos.y);
 //context.scale(scale, scale);

 imageObj.onload = function(){
   imgW = imageObj.width;
   imgH = imageObj.height;
   context.drawImage(imageObj, translatePos.x , translatePos.y , imgW * scale, imgH * scale );
 };

 imgW = imageObj.width;
 imgH = imageObj.height;
 context.drawImage(imageObj, translatePos.x , translatePos.y , imgW * scale, imgH * scale );

 context.restore();
}

var draw_new = function(scale, translatePos, imageObj){

  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");

  // clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();

  var imgW = imageObj.width;
  var imgH = imageObj.height;

  //context.translate(translatePos.x + imgW/2, translatePos.y+imgH/2);
  //context.rotate(angle);
  context.scale(scale, scale);

  imageObj.onload = function(){
   var centerX = translatePos.x + canvas.width / 2;
   var centerY = translatePos.y + canvas.height / 2;
   imgW = imageObj.width;
   imgH = imageObj.height;
   context.drawImage(imageObj, centerX - imgW * scale/2.0, centerY - imgH * scale/2.0, imgW * scale, imgH * scale );
  };

  var centerX = translatePos.x + canvas.width / 2;
  var centerY = translatePos.y + canvas.height / 2;
  imgW = imageObj.width;
  imgH = imageObj.height;
  context.drawImage(imageObj, centerX - imgW * scale/2.0, centerY - imgH * scale/2.0, imgW * scale, imgH * scale );

  context.restore();
}


var show_image = function(dh) {

  var canvas_string =
    '<div id="wrapper">'
    +' <canvas id="myCanvas" width="600" height="800">'
    +' </canvas>'
    +'</div>';
    
    var yxtree_store = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: 'desktop/get_yx_tree',
            extraParams: {
              node:"root", dh:""
            },
            actionMethods: 'POST'
        }
    });

    var yxtreePanel = Ext.create('Ext.tree.Panel', {
      store: yxtree_store,
      id:'yx_show_tree',
      rootVisible: false,
      useArrows: true,
      singleExpand: true,
      autoScroll: true,
      //tbar:['->',
      //{
      //  xtype:'button',
      //  text:'刷新',
      //  tooltip:'刷新目录',
      //  iconCls:'refresh',
      //  handler: function() {
      //    Ext.getCmp('yx_show_tree').store.load();
      //  }
      //}
      //],
      width: 200
    });


    yxtreePanel.on("select",function(node){ 
      data = node.selected.items[0].data;  // data.id, data.parent, data.text, data.leaf
      ss=data.id.split('|');
      var pars={gid:ss[0]};
      new Ajax.Request("/desktop/get_timage_from_db", {
        method: "POST",
        parameters: pars,
        onComplete:  function(request) {
          var path = request.responseText;
          if (path != '') { 
            imageObj.src = path;
            draw(scale, translatePos,imageObj);
          }
        }
      });
    });

  var yxxs_win = new Ext.Window({
    id : 'yxxs_win',
    iconCls : 'picture16',
    title: '影像浏览',
    floating: true,
    shadow: true,
    draggable: true,
    closable: true,
    //modal: true,
    width: 800,
    height: 600,
    layout: 'fit',
    plain: true,
    items: [{
    layout:"border",
    items:[{
      region:"center",
      title:"图像",
      tbar:[{
         text : '放大',
         iconCls:'zoomin',
         handler : function() {
           scale /= scaleMultiplier;
           draw(scale, translatePos, imageObj);
         }
       },{
         text : '缩小',
         iconCls:'zoomout',
         handler : function() {
           scale *= scaleMultiplier;
           draw(scale, translatePos, imageObj);                  
         }
       },{
         text : '上一页',
         iconCls:'up16',
         handler : function() {
            //var yxtree_store = Ext.getCmp('yx_show_tree').store;
            var yxtree_panel = Ext.getCmp('yx_show_tree');
            var node = yxtree_panel.selModel.selected.items[0];
            var prev_node = node.previousSibling;
            yxtree_panel.selModel.select(prev_node);
            
            //var record = tree.getRootNode().findChild('id_name','record_id',true);
            //tree.getSelectionModel().select(record);
            
         }
       },{
         text : '下一页',
         iconCls:'down16',
         handler : function() {
           var yxtree_panel = Ext.getCmp('yx_show_tree');
           var node = yxtree_panel.selModel.selected.items[0];
           var next_node = node.nextSibling;
           yxtree_panel.selModel.select(next_node);
         }
      }],
      items:[{
          xtype: 'panel', //或者xtype: 'component',
          html:canvas_string
          }]
      },{ 
        title:'影像列表',
        region:'west',
        iconCls:'wenshu16',
        xtype:'panel',
        //margins:'5 2 5 5',
        width: 200,
        collapsible:true,//可以被折叠
        id:'yxtree-panel',
        layout:'fit',
        split:true,
        items:[yxtreePanel]
      }]
    }]
  });
	var yxtree_store = Ext.getCmp('yx_show_tree').store;
    yxtree_store.clearOnLoad = false;
    yxtree_store.getRootNode().removeAll() ;
    yxtree_store.proxy.extraParams = {node:"root", dh:dh};
    yxtree_store.load();
  yxxs_win.show();

}

var set_image = function(photoURL) {
 var canvas = document.getElementById("myCanvas");
 var context = canvas.getContext("2d");
 var startDragOffset = {};
 var mouseDown = false;

 //scale = 1.0;
 translatePos =  { x: 0,y: 0};
 imageObj.src = photoURL;

 // add event listeners to handle screen drag
 canvas.addEventListener("mousedown", function(evt){
   mouseDown = true;
   startDragOffset.x = evt.clientX - translatePos.x;
   startDragOffset.y = evt.clientY - translatePos.y;
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
     translatePos.x = evt.clientX - startDragOffset.x;
     translatePos.y = evt.clientY - startDragOffset.y;
     draw(scale, translatePos, imageObj);
   }
 });

 draw(scale, translatePos,imageObj);
};


//add by liujun showAdvancedSearch()
  var showAdvancedSearch = function() {
    
    var panel = new Ext.Panel({  
      title : '高级查询',  
      width : '280px',  
      html : '<div id="div1" style="height:160px;padding:5px">原文本</div>'  
    });
     
    //Ext.DomHelper.append(Ext.get("div1"),"<br>新追加了文本",true);
    var advanced_search_win = new Ext.Window({
      id : 'advanced-search-win',
      iconCls : 'picture16',
      title: '查询条件',
      floating: true,
      shadow: true,
      draggable: true,
      closable: true,
      modal: true,
      width: 400,
      height: 300,
      layout: 'fit',
      plain: true,
      tbar:[{
        text : '增加',
        iconCls:'add',
        handler : function() {
          Ext.DomHelper.append(Ext.get("adv-search"),
            '<div style="height:30px;padding:10px;"><select><option value="案卷标题">案卷标题</option><option value="年度">年度</option><option value="Opel">Opel</option><option value="audi">Audi</option></select><select><option value="等于">等于</option><option value="大于">大于</option><option value="小于">小于</option><option value="包含">包含</option></select><input class="search_text" id="query" name="query" style="margin-left: 10px;width: 110px;" type="text"><button type="button">删除</button><div>',true);
        }
      },'->',{
        text : '提交',
        iconCls:'search',
        handler : function(){
          
        }
      }],
      items:[{
         xtype: 'panel', //或者xtype: 'component',
         html:'<div id="adv-search" style="height:50px;padding:5px"><div style="height:30px;padding:10px;" ><select><option value="案卷标题">案卷标题</option><option value="年度">年度</option><option value="opel">Opel</option><option value="audi">Audi</option></select></select><select><option value="等于">等于</option><option value="大于">大于</option><option value="小于">小于</option><option value="包含">包含</option></select><input class="search_text" id="query" name="query" style="margin-left: 10px;width: 110px;" type="text"><button type="button">删除</button></div></div>'
      }]
    });
    advanced_search_win.show();
  };

//设备正在操作窗口
var sb_cz_msg = function(sbid){
	var win = Ext.getCmp('sb_cz_msg_win');
	if (win==null) {
		loopable=false;
		i =0;
		sb_name='';
		czdz=['正在操作','完成操作'];
		sbname=[];
		strdisp='';
		//sb_id=sbid.split(';');
		new Ajax.Request("/desktop/get_sb_zt", { 
			method: "POST",
			parameters: {sbid:sbid},
			onComplete:	 function(request) {
				text=request.responseText.split(':');
				if (text[0]=='success'){
					alert("设备操作成功。");
																
				}else{
					if (text[0]=='false'){
						loopCheck(text[1],true);
					}
				}
				
				
				
			}
		});
		function loopCheck(sb,lp) {
		  if (lp) {
			loopable=true;	
		   //if (i=='0'){	
		   //	if (sb_name==''){
		   //		sb_name=sb['sbmc']
		   //	}else{
		   //		sb_name= sb['sbmc'] +','+sb_name 
		   //	}
		   //	sbname=sb_name.split(',');
		   //	strdisp='';
		   //	for (x=0;x<sbname.length;x++){
		   //		if (x=='0'){						
		   //			strdisp=strdisp + '<p>' + sbname[x] + '......' + czdz[0] + '</p>' 
		   //		}else{
		   //			strdisp=strdisp + '<p>' + sbname[x] + '......' + czdz[1] + '</p>' 
		   //		}						
		   //	}
				Ext.getCmp('zzcz_disp').getEl().dom.innerHTML = Ext.getCmp('zzcz_disp').initialConfig.html + sb;
			//};									
			if (i>3){
					Ext.getCmp('sb_cz_msg_win').close();	
			}else{				
				i = i +1;		            
	            sf = 0;
	            td = 1*1000 ; //60s 
	            var f = function() { loopCheck(sb,loopable); };
	            var t = setTimeout(f,td);				
			};            
          }
        };
		
		win = new Ext.Window({
			id : 'sb_cz_msg_win',
			title: '设备正在操作窗口',
			//closeAction: 'hide',
			width: 270,
			height: 200,
			layout: 'fit',
			modal: true,
			plain: true,
			items:[{	//title:'情景模式树',
				//region:'west',
				//iconCls:'users',
				xtype:'panel',
				margins:'0 0 0 0',
				width: 200,
				//collapsible:true,//可以被折叠							
				layout:'fit',
				autoscroll:true,
				split:true,
				items:[{
					xtype: 'box',
					autoscroll:true,
					html:"<img src='/assets/zzcz.gif' />",
					x:10,
					y:10,
					width: 8,
					height:8,
					id:'zzcz_disp'
				}]

			}]
		})
	}


	win.show();
	
};