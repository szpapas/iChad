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


Ext.define('MyDesktop.WenshuMan', {
	extend: 'Ext.ux.desktop.Module',
	requires: [
		'*',
		'Ext.tree.*',
		'Ext.data.*',
		'Ext.window.MessageBox'
	],
	id:'wenshuman',
	init : function(){
		this.launcher = {
			text: '文书处理',
			iconCls:'wenshuman',
			handler : this.createWindow,
			scope: this
		}
	},
	createWindow : function(){
      	var desktop = this.app.getDesktop();
      	var win = desktop.getWindow('wenshuman');
	  	function getNodes(node,tf) {
        //遍历所有子节点
        if (node.childNodes.size() == 0) return;
        	node.eachChild(function(n){
	          n.data.checked=tf;
	          n.updateInfo({checked:tf});
	          getNodes(n,tf);
	        });
      	};
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
	                tabPanel.remove(myitem);
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

	var AjListFn_wsda = function(title,text) {
		  dh='';
		  Ext.regModel('document_model', {
		    fields: [
		        {name: 'id',    type: 'integer'},
		        {name: 'tm',    type: 'string'},
		        {name: 'sxh',   type: 'string'},
		        {name: 'yh',    type: 'string'},
		        {name: 'wh',    type: 'string'},
		        {name: 'zrz',   type: 'string'},
		        {name: 'rq',    type: 'string',  type: 'date',  dateFormat: 'Y-m-d H:i:s'},
		        {name: 'bz',    type: 'string'},
		        {name: 'dh',    type: 'string'},
		        {name: 'ownerid',   type: 'integer'}
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
		    id : 'document_grid',
		    store: store3,
		    tbar:[
		      {xtype:'button',text:'添加',tooltip:'添加卷内目录',iconCls:'add',
		        handler: function() {
		          var grid = Ext.getCmp('archive_grid_wsda');
		          var records = grid.getSelectionModel().getSelection();
		          var record = records[0];
		          DispJr(record,true);

		        }
		      },
		      {xtype:'button',text:'删除',tooltip:'删除卷内目录',iconCls:'remove',
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
		                onComplete:  function(request) {
							if (request.responseText=='success'){
								alert("删除成功。");
								Ext.getCmp('document_grid').store.load();												
							}else{
								alert("删除失败，请重新删除。"+request.responseText);
							}		                  
		                }
		              });
		            }                  
		          });

		        }},
		      {xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
		      handler: function() {
		        var grid  = this.ownerCt.ownerCt;
		          var store = grid.getStore(); 
		          var records = grid.getSelectionModel().getSelection();
		          var data = [];
		          Ext.Array.each(records,function(model){
		            data.push(Ext.JSON.encode(model.get('id')));
		            DispJr(model,false);
		          });
		        }
		      } , '->',
		            '<span style=" font-size:12px;font-weight:600;color:#3366FF;">题名查询</span>:&nbsp;&nbsp;',
		            {
		              xtype:'textfield',id:'query_jr_text'
		            },          
		            {xtype:'button',text:'查询',tooltip:'查询卷内目录',iconCls:'accordion',
		                handler: function() {
		                  store3.proxy.url="/desktop/get_document_where";
		                  store3.proxy.extraParams.query=Ext.getCmp('query_jr_text').value;
		                  store3.load();
		                }
		            }

		    ],
		    columns: [
		      { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
		      { text : '档号',  width : 75, sortable : true, dataIndex: 'dh'},
		      { text : '顺序号',  width : 30, sortable : true, dataIndex: 'sxh'},
		      { text : '文号',  width : 105, sortable : true, dataIndex: 'wh'},
		      { text : '责任者',  width : 75, sortable : true, dataIndex: 'zrz'},
		      { text : '题名',  width : 175, sortable : true, dataIndex: 'tm'},
		      { text : '页号',  width : 75, sortable : true, dataIndex: 'yh'},

		      { text : '日期',  width : 75, sortable : true, dataIndex: 'rq',renderer: Ext.util.Format.dateRenderer('Y-m-d')},
		      { text : '备注',  width : 75, sortable : true, dataIndex: 'bz'},
		      { text : 'ownerid',  flex : 1, sortable : true, dataIndex: 'ownerid'}
		      ],
		    listeners:{
		        itemdblclick:{
		          fn:function(v,r,i,n,e,b){
		            var tt=r.get("zrq");
		            DispJr(r,false);
		          }
		        }
		      },

		    viewConfig: {
		      stripeRows:true
		    }
		  });
		  Ext.regModel('archive_model', {
		    fields: [
		      {name: 'id',    type: 'integer'},
		      {name: 'dwdm',    type: 'string'},
		      {name: 'dh',    type: 'string'},
		      {name: 'qzh',   type: 'string'},
		      {name: 'mlh',   type: 'string'},
		      {name: 'ajh',   type: 'string'},
		      {name: 'tm',    type: 'string'},
		      {name: 'flh',   type: 'string'},
		      {name: 'nd',    type: 'string'},
		      {name: 'qrq',   type: 'date', dateFormat: 'Y-m-d H:i:s'},
		      {name: 'zrq',   type: 'date', dateFormat: 'Y-m-d H:i:s'},
		      {name: 'js',    type: 'string'},
		      {name: 'ys',    type: 'string'},
		      {name: 'bgqx',    type: 'string'},
		      {name: 'mj',    type: 'string'},
		      {name: 'xh',    type: 'string'},
		      {name: 'cfwz',    type: 'string'},
		      {name: 'bz',    type: 'string'},
		      {name: 'boxstr',  type: 'string'},
		      {name: 'boxrfid', type: 'string'},
		      {name: 'rfidstr', type: 'string'},
		      {name: 'qny',   type: 'string'},
		      {name: 'zny',   type: 'string'},
		      {name: 'jgwth',   type: 'string'},
		      {name: 'gbjh',    type: 'string'},
		      {name: 'xbbm',    type: 'string'},
		      {name: 'jh',    type: 'string'},
		      {name: 'zwrq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
		      {name: 'wh',    type: 'string'},
		      {name: 'zrr',   type: 'string'},
		      {name: 'gb',    type: 'string'},
		      {name: 'wz',    type: 'string'},
		      {name: 'ztgg',    type: 'string'},
		      {name: 'ztlx',    type: 'string'},
		      {name: 'ztdw',    type: 'string'},
		      {name: 'dagdh',   type: 'string'},
		      {name: 'swh',   type: 'string'},
		      {name: 'ztsl',    type: 'integer'},
		      {name: 'qwbs',    type: 'string'},
		      {name: 'ztc',   type: 'string'},
		      {name: 'zbbm',    type: 'string'},
		      {name: 'hh',    type: 'string'},
		      {name: 'dzwdh',   type: 'string'},
		      {name: 'dalb',    type: 'string'}
		    ]
		  });

		  var archive_store = Ext.create('Ext.data.Store', {
		    id:'archive_store',
		    model : 'archive_model',
		    proxy: {
		      type: 'ajax',
		      url : '/desktop/get_archive_qxdm',
		      extraParams: {query:title},
		      reader: {
		        type: 'json',
		        root: 'rows',
		        totalProperty: 'results'
		      }
		    }
		  });

		  archive_store.load();
		  var archiveGrid = new Ext.grid.GridPanel({
		    id : 'archive_grid_wsda',
		    store: archive_store,
		    bbar:[
		      new Ext.PagingToolbar({
		        store: archive_store,
		        pageSize: 25,
		        width : 350,
		        border : false,
		        displayInfo: true,
		        displayMsg: '{0} - {1} of {2}',
		        emptyMsg: "没有找到！",
		        prependButtons: true
		      })
		    ],
		    tbar:[
		        {xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
		          handler: function() {

		            var grid = Ext.getCmp('archive_grid_wsda');
		            var records = grid.getSelectionModel().getSelection();
		            var record = records[0];
		            DispAj_wsda(record,true,title);
		          }
		        } ,
		        {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
		          handler: function() {

		            var grid = Ext.getCmp('archive_grid_wsda');
		            var records = grid.getSelectionModel().getSelection();
		            var record = records[0];

		            var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "'})"; 
		            Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
		                  if(id=="yes"){
		                    new Ajax.Request("/desktop/delete_archive", { 
		                      method: "POST",
		                      parameters: eval(pars),
		                      onComplete:  function(request) {
		                        Ext.getCmp('archive_grid_wsda').store.load();
		                      }
		                    });
		                  }
		              });

		          }
		        },
		        {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
		          handler: function() {
		            var grid = Ext.getCmp('archive_grid_wsda');
		            var records = grid.getSelectionModel().getSelection();
		            var record = records[0];
		            DispAj_wsda(record,false,title);
		          }
		        }   , 
				{
		          xtype:'button',text:'高级查询',tooltip:'查询条件祝贺',id:'advance-search',iconCls:'search',
		          handler: function() {
		            showAdvancedSearch();
		          }
		        }, 
				{
		          text:'查看图像',
		          iconCls:'',
		          handler : function() {
		            var items = Ext.getCmp('archive_grid_wsda').getSelectionModel().selected.items;
		            if (items.length > 0) {
		              var item = items[0];
		              var dh = items[0].data.dh;
		              show_image(dh);	              
		              set_image("/assets/wuxi_pic.png");
		            }
		          }    
		        },
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
		            } ,
		            '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
		            {
		              xtype:'textfield',
		              id:'query_text',
		            } ,         
		            { xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
		              handler: function() {
		                console.log(Ext.getCmp('query_text').value);
		                if(Ext.getCmp('query_text').value != null ){
		                  var grid = Ext.getCmp('archive_grid_wsda');
		                  grid.store.proxy.url="/desktop/get_archive_where";
		                  archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
		                  archive_store.load();
		                }
		              }
		            }
		          ],
		    columns: [
		      { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
		      { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
		      { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
		      { text : '年度',  width : 75, sortable : true, dataIndex: 'nd'},
		      { text : '机构问题号',  width : 75, sortable : true, dataIndex: 'jgwth'},
		      { text : '保管期限', width : 75, sortable : true, dataIndex: 'bgqx'},

		      { text : '件号',   width : 75, sortable : true, dataIndex: 'jh'},
		      { text : '文号',   width : 75, sortable : true, dataIndex: 'wh'},
		      { text : '责任者',  width : 175, sortable : true, dataIndex: 'zrr'},


		      { text : '题名',  width : 175, sortable : true, dataIndex: 'tm'},
		      { text : '制文日期',  width : 75, sortable : true, dataIndex: 'zwrq' ,renderer: Ext.util.Format.dateRenderer('Y-m-d')},
		      { text : '缩微号',  width : 75, sortable : true, dataIndex: 'swh'},


		      { text : '全宗号', width : 75, sortable : true, dataIndex: 'qzh'},
		      { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},

		      { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
		      ],
		      selType:'checkboxmodel',
		      //multiSelect:true,
		      listeners:{
		        itemdblclick:{
		          fn:function(v,r,i,n,e,b){
		            var tt=r.get("zrq");

		            switch (r.data.dalb) { 
		              case "0": 
		                DispAj_zh(r,false,title);
		                break; 
		              case "2": 
		                DispAj_cw(r,false,title);
		                break; 
		              case "3": 
		                DispAj_tddj(r,false,title);
		                break; 
		              case "24": 
		                DispAj_wsda(r,false,title);
		                break;
		              default:
		                DispAj_zh(r,false,title);
		                break;
		            }

		          }
		        }
		      },
		    viewConfig: {
		      stripeRows:true
		    }
		  }); 

		  documentGrid.on("select", function(node){
		      data = node.selected.items[0].data;
		      timage_store.proxy.extraParams = {dh:data.dh, type:'1'};
		      timage_store.load();
		    });

		  archiveGrid.on("select",function(node){
		    data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf
		    archive_id = data.id; 
		    store3.proxy.extraParams.query=data.id;
		    store3.load();
		    dh=data.dh;
		    timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
		    timage_store.load();
		    Ext.getCmp('timage_combo').lastQuery = null;
			Ext.getCmp('preview_img').getEl().dom.src="";
		  });

		  var tab = tabPanel.getActiveTab();
		  tabPanel.remove(tab);   
		  var tabPage = tabPanel.add({
		    title:text,
		    closable:true,
		    iconCls:'tabs',
		    layout: 'border',
		    split:true,
		    items:[{
		        id:title,
		        region: 'center',
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

	var AjListFn_swdj = function(title,text){
		dh='';			  
		Ext.regModel('archive_model', {
		    fields: [
		    	{name: 'id',    type: 'integer'},
			  	{name: 'bgqx',    type: 'string'},
			    {name: 'swbh',    type: 'integer'},
			      {name: 'qzh',   type: 'string'},
			      {name: 'lwjg',   type: 'string'},
			      {name: 'wh',   type: 'string'},
			      {name: 'tm',    type: 'string'},
			      {name: 'mj',   type: 'string'},
			      {name: 'swrq',   type: 'date', dateFormat: 'Y-m-d H:i:s'},
			      {name: 'yfrq',   type: 'date', dateFormat: 'Y-m-d H:i:s'},
			      {name: 'fs',    type: 'string'},
			      {name: 'ys',    type: 'string'},			      
			      {name: 'blqk',    type: 'string'},
			      {name: 'zwdw',    type: 'string'},
			      {name: 'zcfs',    type: 'integer'},
			      {name: 'szqm',  type: 'string'},
			      {name: 'qtfs', type: 'string'},
			      {name: 'xhfs', type: 'string'},
			      {name: 'bz',   type: 'string'},
			      {name: 'zdnd',   type: 'string'},
			      {name: 'jgwt',   type: 'string'},
			      {name: 'zrz',    type: 'string'},
			      {name: 'sfyglsk',    type: 'string'},
				　　{name: 'sfygd',    type: 'string'},
			      {name: 'jh',    type: 'string'},
			      {name: 'zwrq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
			      {name: 'mlh',    type: 'string'},
			      {name: 'ajh',   type: 'string'}
		    	]
			});

		var archive_store = Ext.create('Ext.data.Store', {
		    id:'archive_store',
		    model : 'archive_model',
		    proxy: {
		      type: 'ajax',
		      url : '/desktop/get_doc_grid',
		      extraParams: {query:title},
		      reader: {
		        type: 'json',
		        root: 'rows',
		        totalProperty: 'results'
		      }
		    }
		});
		archive_store.load();
		var archiveGrid = new Ext.grid.GridPanel({
		    id : 'archive_grid_wsda',
		    store: archive_store,
		    bbar:[
		      new Ext.PagingToolbar({
		        store: archive_store,
		        pageSize: 25,
		        width : 350,
		        border : false,
		        displayInfo: true,
		        displayMsg: '{0} - {1} of {2}',
		        emptyMsg: "没有找到！",
		        prependButtons: true
		      })
		    ],
		    tbar:[
			    {xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
			      handler: function() {

			        var grid = Ext.getCmp('archive_grid_wsda');
			        var records = grid.getSelectionModel().getSelection();
			        var record = records[0];
			        DispAj_swdj(record,true,title);
			      }
			    } ,
			    {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
			      handler: function() {

			        var grid = Ext.getCmp('archive_grid_wsda');
			        var records = grid.getSelectionModel().getSelection();
			        var record = records[0];

			        var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "'})"; 
			        Ext.Msg.confirm("提示信息","是否要删除此案卷？",function callback(id){
			              if(id=="yes"){
			                new Ajax.Request("/desktop/delete_doc_swdj", { 
			                  method: "POST",
			                  parameters: eval(pars),
			                  onComplete:  function(request) {
			                    Ext.getCmp('archive_grid_wsda').store.load();
			                  }
			                });
			              }
			          });

			      }
			    },
			    {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
			      handler: function() {
			        var grid = Ext.getCmp('archive_grid_wsda');
			        var records = grid.getSelectionModel().getSelection();
			        var record = records[0];
			        DispAj_swdj(record,false,title);
			      }
			    }   , 
				{xtype:'button',text:'归临时库',tooltip:'归临时库',id:'glsk',iconCls:'save',
			      handler: function() {
			        var grid = Ext.getCmp('archive_grid_wsda');
			        var records = grid.getSelectionModel().getSelection();
			        var record = records[0];
			        var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "'})"; 
			        Ext.Msg.confirm("提示信息","是否要将此文件归入临时库？",function callback(id){
			              if(id=="yes"){
			                new Ajax.Request("/desktop/glsk_doc_sw", { 
			                  method: "POST",
			                  parameters: eval(pars),
			                  onComplete:  function(request) {
								if (request.responseText=='success'){
									alert("归临时库成功。");
									Ext.getCmp('archive_grid_wsda').store.load();												
								}else{
									alert("归临时库失败，请重新归临时库。"+request.responseText);
								}
			                    
			                  }
			                });
			              }
			          });
			      }
			    },
				{
			      xtype:'button',text:'高级查询',tooltip:'查询条件祝贺',id:'advance-search',iconCls:'search',
			      handler: function() {
			        showAdvancedSearch();
			      }
			    }, 
				{
			      text:'查看图像',
			      iconCls:'',
			      handler : function() {
			        var items = Ext.getCmp('archive_grid_wsda').getSelectionModel().selected.items;
			        if (items.length > 0) {
			          var item = items[0];
			          var dh = items[0].data.dh;
			          show_image(dh);	              
			          set_image("/assets/wuxi_pic.png");
			        }
			      }    
			    },
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
			        } ,
			        '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
			        {
			          xtype:'textfield',
			          id:'query_text',
			        } ,         
			        { xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
			          handler: function() {
			            console.log(Ext.getCmp('query_text').value);
			            if(Ext.getCmp('query_text').value != null ){
			              var grid = Ext.getCmp('archive_grid_wsda');
			              grid.store.proxy.url="/desktop/get_archive_where";
			              archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
			              archive_store.load();
			            }
			          }
			        }
			      ],
		    columns: [
		      { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
		      { text : '归档年度',  width : 75, sortable : true, dataIndex: 'zdnd'},
		      { text : '机构问题号',  width : 75, sortable : true, dataIndex: 'jgwt'},
		      { text : '保管期限', width : 75, sortable : true, dataIndex: 'bgqx'},
		      { text : '收文编号',   width : 75, sortable : true, dataIndex: 'swbh'},
		      { text : '文号',   width : 75, sortable : true, dataIndex: 'wh'},
		      { text : '责任者',  width : 175, sortable : true, dataIndex: 'zrz'},
		      { text : '题名',  width : 175, sortable : true, dataIndex: 'tm'},
			  { text : '收文日期',  width : 75, sortable : true, dataIndex: 'swrq' ,renderer: Ext.util.Format.dateRenderer('Y-m-d')},
		      { text : '制文日期',  width : 75, sortable : true, dataIndex: 'zwrq' ,renderer: Ext.util.Format.dateRenderer('Y-m-d')},
				{ text : '是否已归临时库',  width : 75, sortable : true, dataIndex: 'sfyglsk'},
				{ text : '是否已归档',  width : 75, sortable : true, dataIndex: 'sfygd'},			      
		      { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
		      { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
		      ],
		      selType:'checkboxmodel',
		      //multiSelect:true,
		      listeners:{
		        itemdblclick:{
		          fn:function(v,r,i,n,e,b){			            
		                DispAj_swdj(r,false,title);			            
		          }
		        }
		      },
		    viewConfig: {
		      stripeRows:true
		    }
		}); 
		archiveGrid.on("select",function(node){
		    data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf
		    archive_id = data.id; 
		    dh=data.dh;
		    timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
		    timage_store.load();
		    Ext.getCmp('timage_combo').lastQuery = null;
			Ext.getCmp('preview_img').getEl().dom.src="";
		});

		var tab = tabPanel.getActiveTab();
		tabPanel.remove(tab);   
		var tabPage = tabPanel.add({
		    title:text,
		    closable:true,
		    iconCls:'tabs',
		    layout: 'border',
		    split:true,
		    items:[{
		        id:title,
		        region: 'center',
		        layout: 'fit',
		        split:true,
		        items: archiveGrid
		      }]
		});
		tabPanel.setActiveTab(tabPage);
		userManagePageIsOpen = true;
	};
												
	var AjListFn_fwdj = function(title,text) {
		dh='';			  
		Ext.regModel('archive_model', {
	    	fields: [
		      {name: 'id',    type: 'integer'},
		      {name: 'bgqx',    type: 'string'},
		      {name: 'fwbh',    type: 'integer'},
		      {name: 'qzh',   type: 'string'},
		      {name: 'qfr',   type: 'string'},
		      {name: 'wh',   type: 'string'},
		      {name: 'tm',    type: 'string'},
		      {name: 'mj',   type: 'string'},
		      {name: 'fwrq',   type: 'date', dateFormat: 'Y-m-d H:i:s'},
		      {name: 'dyfs',    type: 'string'},
		      {name: 'ys',    type: 'string'},			      
		      {name: 'zsdw',    type: 'string'},
		      {name: 'cbdw',    type: 'string'},
		      {name: 'csdw',    type: 'string'},
		      {name: 'xfdw',  type: 'string'},
		      {name: 'qtfs', type: 'string'},
		      {name: 'xhfs', type: 'string'},
		      {name: 'bz',   type: 'string'},
		      {name: 'zdnd',   type: 'string'},
		      {name: 'jgwt',   type: 'string'},
		      {name: 'zrz',    type: 'string'},
		      {name: 'sfyglsk',    type: 'string'},
			  {name: 'sfygd',    type: 'string'},
		      {name: 'jh',    type: 'string'},
		      {name: 'zwrq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
		      {name: 'mlh',    type: 'string'},
		      {name: 'ajh',   type: 'string'},
			  {name: 'ztc1',   type: 'string'},
		      {name: 'ztc2',    type: 'string'},
		      {name: 'ztc3',    type: 'string'}
		    ]
	  	});

		var archive_store = Ext.create('Ext.data.Store', {
		    id:'archive_store',
		    model : 'archive_model',
		    proxy: {
		      type: 'ajax',
		      url : '/desktop/get_doc_grid',
		      extraParams: {query:title},
		      reader: {
		        type: 'json',
		        root: 'rows',
		        totalProperty: 'results'
		      }
		    }
		});
		archive_store.load();
		var archiveGrid = new Ext.grid.GridPanel({
		    id : 'archive_grid_wsda',
		    store: archive_store,
		    bbar:[
		      	new Ext.PagingToolbar({
		        	store: archive_store,
			        pageSize: 25,
			        width : 350,
			        border : false,
			        displayInfo: true,
			        displayMsg: '{0} - {1} of {2}',
			        emptyMsg: "没有找到！",
			        prependButtons: true
		      	})
		    ],
		    tbar:[
			    {xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
			      	handler: function() {
			        	var grid = Ext.getCmp('archive_grid_wsda');
			        	var records = grid.getSelectionModel().getSelection();
			        	var record = records[0];
			        	DispAj_fwdj(record,true,title);
			      	}
			    },
			    {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
			      	handler: function() {
			        	var grid = Ext.getCmp('archive_grid_wsda');
				        var records = grid.getSelectionModel().getSelection();
				        var record = records[0];
				        var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "'})"; 
				        Ext.Msg.confirm("提示信息","是否要删除此案卷？",function callback(id){
				        	if(id=="yes"){
				                new Ajax.Request("/desktop/delete_doc_fwdj", { 
				                  method: "POST",
				                  parameters: eval(pars),
				                  onComplete:  function(request) {
				                    Ext.getCmp('archive_grid_wsda').store.load();
				                  }
				                });
				         	}
				         });
			      	}
			    },
			    {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
			      	handler: function() {
			        	var grid = Ext.getCmp('archive_grid_wsda');
				        var records = grid.getSelectionModel().getSelection();
				        var record = records[0];
				        DispAj_fwdj(record,false,title);
			      	}	
			    }, 
				{xtype:'button',text:'归临时库',tooltip:'归临时库',id:'glsk',iconCls:'save',
			      handler: function() {
			        var grid = Ext.getCmp('archive_grid_wsda');
			        var records = grid.getSelectionModel().getSelection();
			        var record = records[0];
			        var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "'})"; 
			        Ext.Msg.confirm("提示信息","是否要将此文件归入临时库？",function callback(id){
			              if(id=="yes"){
			                new Ajax.Request("/desktop/glsk_doc_fw", { 
			                  method: "POST",
			                  parameters: eval(pars),
			                  onComplete:  function(request) {
			                    if (request.responseText=='success'){
									alert("归临时库成功。");
									Ext.getCmp('archive_grid_wsda').store.load();												
								}else{
									alert("归临时库失败，请重新归临时库。"+request.responseText);
								}
			                  }
			                });
			              }
			          });
			      }
			    },
				{
			      xtype:'button',text:'高级查询',tooltip:'查询条件祝贺',id:'advance-search',iconCls:'search',
			      	handler: function() {
			        	showAdvancedSearch();
			      	}
			    }, 
				{
			      text:'查看图像',
			      iconCls:'',
			      handler : function() {
			        var items = Ext.getCmp('archive_grid_wsda').getSelectionModel().selected.items;
			        if (items.length > 0) {
			          var item = items[0];
			          var dh = items[0].data.dh;
			          show_image(dh);	              
			          set_image("/assets/wuxi_pic.png");
			        }
			      }    
			    },
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
			        } ,
			        '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
			        {
			          xtype:'textfield',
			          id:'query_text',
			        } ,         
			        { xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
			          handler: function() {
			            console.log(Ext.getCmp('query_text').value);
			            if(Ext.getCmp('query_text').value != null ){
			              var grid = Ext.getCmp('archive_grid_wsda');
			              grid.store.proxy.url="/desktop/get_archive_where";
			              archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
			              archive_store.load();
			            }
			          }
			        }
			],
		    columns: [
		    	{ text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
			    { text : '归档年度',  width : 75, sortable : true, dataIndex: 'zdnd'},
			    { text : '机构问题号',  width : 75, sortable : true, dataIndex: 'jgwt'},
			    { text : '保管期限', width : 75, sortable : true, dataIndex: 'bgqx'},
			    { text : '发文编号',   width : 75, sortable : true, dataIndex: 'fwbh'},
			    { text : '文号',   width : 75, sortable : true, dataIndex: 'wh'},
			    { text : '责任者',  width : 175, sortable : true, dataIndex: 'zrz'},
			    { text : '题名',  width : 175, sortable : true, dataIndex: 'tm'},
			    { text : '制文日期',  width : 75, sortable : true, dataIndex: 'zwrq' ,renderer: Ext.util.Format.dateRenderer('Y-m-d')},	
				{ text : '是否已归临时库',  width : 75, sortable : true, dataIndex: 'sfyglsk'},
				{ text : '是否已归档',  width : 75, sortable : true, dataIndex: 'sfygd'},		      
			    { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
			    { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
			],
		    selType:'checkboxmodel',
		    listeners:{
		        itemdblclick:{
		          	fn:function(v,r,i,n,e,b){				            				            
		          		DispAj_fwdj(r,false,title);				                
		          	}
		        }
		    },
		    viewConfig: {
		      stripeRows:true
		    }
		}); 
		archiveGrid.on("select",function(node){
		    data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf
		    archive_id = data.id; 
		    dh=data.dh;
		    timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
		    timage_store.load();
		    Ext.getCmp('timage_combo').lastQuery = null;
			Ext.getCmp('preview_img').getEl().dom.src="";
		});

		var tab = tabPanel.getActiveTab();
		tabPanel.remove(tab);   
		var tabPage = tabPanel.add({
		    title:text,
		    closable:true,
		    iconCls:'tabs',
		    layout: 'border',
		    split:true,
		    items:[{
		        id:title,
		        region: 'center',
		        layout: 'fit',
		        split:true,
		        items: archiveGrid
		      }]
		});
		tabPanel.setActiveTab(tabPage);
		userManagePageIsOpen = true;
	};
						
	var AjListFn_lbzl= function(title,text) {
			dh='';			  
			Ext.regModel('archive_model', {
			    fields: [
			      {name: 'id',    type: 'integer'},
			      {name: 'bgqx',    type: 'string'},
			      {name: 'wjbh',    type: 'integer'},
			      {name: 'qzh',   type: 'string'},
			      {name: 'wh',   type: 'string'},
			      {name: 'tm',    type: 'string'},
				  {name: 'zrz',    type: 'string'},
			      {name: 'mj',   type: 'string'},
			      {name: 'rq',   type: 'date', dateFormat: 'Y-m-d H:i:s'},
			      {name: 'ys',    type: 'string'},						      
			      {name: 'zdnd',    type: 'string'},
				  {name: 'zwrq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
				  {name: 'bz',   type: 'string'},
			      {name: 'jgwt',   type: 'string'},
			
			      {name: 'cbdw',    type: 'string'},
			      {name: 'csdw',    type: 'string'},
			      {name: 'xfdw',  type: 'string'},
			      {name: 'qtfs', type: 'string'},
			      {name: 'xhfs', type: 'string'},			      
			      {name: 'sfyglsk',    type: 'string'},
				  {name: 'sfygd',    type: 'string'},
			      {name: 'jh',    type: 'string'},			      
			      {name: 'mlh',    type: 'string'},
			      {name: 'ajh',   type: 'string'},
				  {name: 'ztc1',   type: 'string'},
			      {name: 'ztc2',    type: 'string'},
			      {name: 'ztc3',    type: 'string'}
			    ]
			});
			var archive_store = Ext.create('Ext.data.Store', {
			    id:'archive_store',
			    model : 'archive_model',
			    proxy: {
			      type: 'ajax',
			      url : '/desktop/get_doc_grid',
			      extraParams: {query:title},
			      reader: {
			        type: 'json',
			        root: 'rows',
			        totalProperty: 'results'
			      }
			    }
			});
			archive_store.load();
			var archiveGrid = new Ext.grid.GridPanel({
			    id : 'archive_grid_wsda',
			    store: archive_store,					    				    
			    columns: [
			    	  { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
				      { text : '归档年度',  width : 75, sortable : true, dataIndex: 'zdnd'},
				      { text : '机构问题号',  width : 75, sortable : true, dataIndex: 'jgwt'},
				      { text : '保管期限', width : 75, sortable : true, dataIndex: 'bgqx'},
				      { text : '文件编号',   width : 75, sortable : true, dataIndex: 'wjbh'},
				      { text : '文号',   width : 75, sortable : true, dataIndex: 'wh'},
				      { text : '责任者',  width : 175, sortable : true, dataIndex: 'zrz'},
				      { text : '题名',  width : 175, sortable : true, dataIndex: 'tm'},
				      { text : '制文日期',  width : 75, sortable : true, dataIndex: 'zwrq' ,renderer: Ext.util.Format.dateRenderer('Y-m-d')},			      
				      { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
					　　{ text : '是否已归临时库',  width : 75, sortable : true, dataIndex: 'sfyglsk'},
					  { text : '是否已归档',  width : 75, sortable : true, dataIndex: 'sfygd'},
				      { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
			    ],
				tbar:[
				    {xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
				      handler: function() {
				        var grid = Ext.getCmp('archive_grid_wsda');
				        var records = grid.getSelectionModel().getSelection();
				        var record = records[0];
				        DispAj_lbzl(record,true,title);
				      }
				    } ,
				    {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
				      handler: function() {

				        var grid = Ext.getCmp('archive_grid_wsda');
				        var records = grid.getSelectionModel().getSelection();
				        var record = records[0];
				        var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "'})"; 
				        Ext.Msg.confirm("提示信息","是否要删除此案卷？",function callback(id){
				              if(id=="yes"){
				                new Ajax.Request("/desktop/delete_doc_lbzl", { 
				                  method: "POST",
				                  parameters: eval(pars),
				                  onComplete:  function(request) {
				                    if (request.responseText=='success'){
										alert("删除成功。");
										Ext.getCmp('archive_grid_wsda').store.load();												
									}else{
										alert("删除失败，请重新删除。"+request.responseText);
									}
				                  }
				                });
				              }
				          });

				      }
				    },
				    {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
				      handler: function() {
				        var grid = Ext.getCmp('archive_grid_wsda');
				        var records = grid.getSelectionModel().getSelection();
				        var record = records[0];
				        DispAj_lbzl(record,false,title);
				      }
				    }, 
					{xtype:'button',text:'归临时库',tooltip:'归临时库',id:'glsk',iconCls:'save',
				      handler: function() {
				        var grid = Ext.getCmp('archive_grid_wsda');
				        var records = grid.getSelectionModel().getSelection();
				        var record = records[0];
				        var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "'})"; 
				        Ext.Msg.confirm("提示信息","是否要将此文件归入临时库？",function callback(id){
				              if(id=="yes"){
				                new Ajax.Request("/desktop/glsk_doc_lbzl", { 
				                  method: "POST",
				                  parameters: eval(pars),
				                  onComplete:  function(request) {
				                    if (request.responseText=='success'){
										alert("归临时库成功。");
										Ext.getCmp('archive_grid_wsda').store.load();												
									}else{
										alert("归临时库失败，请重新归临时库。"+request.responseText);
									}
				                  }
				                });
				              }
				          });
				      }
				    },
					{
				      xtype:'button',text:'高级查询',tooltip:'查询条件',id:'advance-search',iconCls:'search',
				      handler: function() {
				        showAdvancedSearch();
				      }
				    }, 
					{
				      text:'查看图像',
				      iconCls:'',
				      handler : function() {
				        var items = Ext.getCmp('archive_grid_wsda').getSelectionModel().selected.items;
				        if (items.length > 0) {
				          var item = items[0];
				          var dh = items[0].data.dh;
				          show_image(dh);	              
				          set_image("/assets/wuxi_pic.png");
				        }
				      }    
				    },
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
			        } ,
			        '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
			        {
			          xtype:'textfield',
			          id:'query_text',
			        } ,         
			        { xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
			          handler: function() {
			            console.log(Ext.getCmp('query_text').value);
			            if(Ext.getCmp('query_text').value != null ){
			              var grid = Ext.getCmp('archive_grid_wsda');
			              grid.store.proxy.url="/desktop/get_archive_where";
			              archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
			              archive_store.load();
			            }
			          }
			        }
				],
				bbar:[
			      	new Ext.PagingToolbar({
				        store: archive_store,
				        pageSize: 25,
				        width : 350,
				        border : false,
				        displayInfo: true,
				        displayMsg: '{0} - {1} of {2}',
				        emptyMsg: "没有找到！",
				        prependButtons: true
				      })
			    ],
			    selType:'checkboxmodel',
			    listeners:{
			        itemdblclick:{
			          fn:function(v,r,i,n,e,b){				            				            
			          		DispAj_lbzl(r,false,title);				                
			          }
			        }
			    },
			    viewConfig: {
			      stripeRows:true
			    }
			}); 
			archiveGrid.on("select",function(node){
			    data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf
			    archive_id = data.id; 
			    dh=data.dh;
			    timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
			    timage_store.load();
			    Ext.getCmp('timage_combo').lastQuery = null;
				Ext.getCmp('preview_img').getEl().dom.src="";
			});	
			var tab = tabPanel.getActiveTab();
			tabPanel.remove(tab);   
		  	var tabPage = tabPanel.add({
			    title:text,
			    closable:true,
			    iconCls:'tabs',
			    layout: 'border',
			    split:true,
			    items:[{
			        id:title,
			        region: 'center',
			        layout: 'fit',
			        split:true,
			        items: archiveGrid
			      }]
			  });
			  tabPanel.setActiveTab(tabPage);
			  userManagePageIsOpen = true;		
		};


		var sys_ws_store	= Ext.create('Ext.data.TreeStore', {
			autoLoad: true,
			proxy: {
					type: 'ajax',
					url: 'desktop/get_ws_tree',
					extraParams: {userid:currentUser.id},
					actionMethods: 'POST'
			}
		});

		var sys_ws_panel = Ext.create('Ext.tree.Panel', {
			id : 'sys_ws_panel',
			store: sys_ws_store,
			rootVisible:false,
			useArrows: true			
		});

		
		sys_ws_panel.on("select",function(node){ 
			data = node.selected.items[0].data;  // data.id, data.parent, data.text, data.leaf
	      	ss=data.id.split('_');
	      	if (ss.length>1){
	        	if (ss[1]<100){
		            switch (ss[1]){
		            case "2":
		            	AjListFn_swdj(data.id,node.selected.items[0].parentNode.data.text+data.text);
		                break;
		            case "3":
		                AjListFn_fwdj(data.id,node.selected.items[0].parentNode.data.text+data.text);
		                break;
		            case "5":
		                AjListFn_lbzl(data.id,node.selected.items[0].parentNode.data.text+data.text);
		                break;
		            case "6":
		                doc_dagl(ss[0]);
		                break;
		            case "24":
		              	AjListFn_wsda(data.id,node.selected.items[0].parentNode.data.text+data.text);
		                break;
		            case "4":
		              	AjListFn_lbzl(data.id,node.selected.items[0].parentNode.data.text+data.text);
		              	break;
		            }
	        	}
	      	}
	    });
		if(!win){
	      win = desktop.createWindow({
	        id: 'wushuman',
	        title:'文书处理',        
	        width:1000,
	        height:600,
	        x:0,
	        y:0,
	        iconCls: 'archiveman',
	        animCollapse:false,
	        border: false,
	        hideMode: 'offsets',
	        layout: 'border',
	        split:true,
	        items: [{ 
	            title:'文书处理菜单',
	            region:'west',
	            iconCls:'dept_tree',
	            xtype:'panel',
	            margins:'5 2 5 5',
	            width: 200,
	            collapsible:true,//可以被折叠
	            id:'west-tree',
	            layout:'fit',
	            split:true,
	            items:sys_ws_panel
	          },
	          { title:'档案数据',
	            iconCls:'icon-grid',
	            region:'center',
	            xtype:'panel',
	            id:'center-grid',
	            margins:'5 5 5 0',
	            layout: 'fit',
	            split:true,
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
	              width: 300,
	              minSize: 100,
	              maxSize: 250,
	              layout:'fit',
	              tbar:[
	                myuploadform
	              ],
	              bbar:[{
	                xtype: 'combo',
	                x: 130,
	                y: 190,
	                width: 100,
	                name: 'yxbh',
	                id: 'timage_combo',
	                store: timage_store,
	                emptyText:'请选择',
	                mode: 'local',
	                minChars : 2,
	                valueField:'id',
	                displayField:'yxbh',
	                triggerAction:'all',
	                listeners:{
	                  select:function(combo, record, index) {
	                    var pars={gid:record[0].data.id, type:timage_store.proxy.extraParams.type};
	                    new Ajax.Request("/desktop/get_timage_from_db", {
	                      method: "POST",
	                      parameters: pars,
	                      onComplete:  function(request) {
	                        var path = request.responseText;
	                        if (path != '') { 
							 var number = Math.random(); 
	                          Ext.getCmp('preview_img').getEl().dom.src = path +'?' + number;
	                        }
	                      }
	                    });
	                  }
	                }
	              },
	              {
	                text: '上一个',
	                handler: function(){
	                  combo = Ext.getCmp('timage_combo');
	                  var currentImage = combo.getStore().getById(combo.getValue());
	                  var currentStoreIndex = combo.getStore().indexOf(currentImage);
	                  var nextStoreValue = combo.getStore().getAt(currentStoreIndex - 1).get('id');
	                  combo.setValue(nextStoreValue);
	                  var pars={gid:nextStoreValue, type:timage_store.proxy.extraParams.type};
	                  new Ajax.Request("/desktop/get_timage_from_db", {
	                    method: "POST",
	                    parameters: pars,
	                    onComplete:  function(request) {
	                      var path = request.responseText;
	                      if (path != '') { 
	                        var number = Math.random(); 
	                          Ext.getCmp('preview_img').getEl().dom.src = path +'?' + number;
	                      }
	                    }
	                  });
	                }
	              },
	              {
	                text: '下一个',
	                handler: function(){
	                  combo = Ext.getCmp('timage_combo');
	                  var currentImage = combo.getStore().getById(combo.getValue());
	                  var currentStoreIndex = combo.getStore().indexOf(currentImage);
	                  var nextStoreValue = combo.getStore().getAt(currentStoreIndex + 1).get('id');
	                  combo.setValue(nextStoreValue);
	                  var pars={gid:nextStoreValue, type:timage_store.proxy.extraParams.type};
	                  new Ajax.Request("/desktop/get_timage_from_db", {
	                    method: "POST",
	                    parameters: pars,
	                    onComplete:  function(request) {
	                      var path = request.responseText;
	                      if (path != '') { 
	                        var number = Math.random(); 
	                          Ext.getCmp('preview_img').getEl().dom.src = path +'?' + number;
	                      }
	                    }
	                  });             
	                }
	              },
	              {
	                text: '打印图像',
	                handler : function() {
	                  LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM'));                        
	                  //LODOP.ADD_PRINT_BARCODE(0,0,200,100,"Code39","*123ABC4567890*");
	                  image_path = Ext.getCmp('preview_img').getEl().dom.src.replace(/-/ig, "_");
	                  LODOP.PRINT_INIT(image_path);
	                  LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
	                  LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
	                  LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
	                  //LODOP.PREVIEW();
	                  LODOP.PRINT();
	                }
	              },
	              {
	                  text: '删除图像',
	                  handler : function() {
	                  if (dh!=''){
	                    combo = Ext.getCmp('timage_combo').displayTplData[0].yxmc;
	                    if (combo!=''){
	                      Ext.Msg.confirm("提示信息","是否要删除："+combo+" 图像？",function callback(id){
	                        if(id=="yes"){
	                          var pars="{yxmc:'"+combo+"',dh:'"+dh + "'}";
	                          new Ajax.Request("/desktop/delete_timage", {
	                              method: "POST",
	                              parameters: {yxmc:combo,dh:dh},
	                              onComplete:  function(request) {
	                                var path = request.responseText;
	                                if (path == 'success') { 
	                                  timage_store.proxy.extraParams = {dh:dh, type:'0'};
	                                  timage_store.load();
	                                  Ext.getCmp('timage_combo').lastQuery = null;
	                                  Ext.getCmp('preview_img').getEl().dom.src = '';
	                                }
	                              }
	                          });
	                        }
	                      });
	                    }
	                  }
	                }   // handler
	            }],     //bbar
	            items:[{
	              xtype: 'box',    //或者xtype: 'component',
	              id: 'preview_img',
	              width: 350,      //图片宽度
	              autoEl: {
	                tag: 'img',    //指定为img标签
	                alt: ''        //指定url路径
	              }
	            }]
	            }
	        ]
	      });
	    }
	    new Ajax.Request("/desktop/get_sort", { 
	        method: "POST",
	        parameters: eval("({userid:" + currentUser.id + ",qxid:2})"),
	        onComplete:  function(request) {
	          if (request.responseText=='success'){
	            win.show();
	          }else{
	            alert('您无国土档案管理的权限。');
	            Ext.getCmp('archiveman').close();
	          }
	        }
	    });
	    return win;
	  }

});

