/*
*/

Ext.define('MyDesktop.SystemStatus', {
  extend: 'Ext.ux.desktop.Module',

  requires: [
      'Ext.chart.*',
      'Ext.tree.*',
      'Ext.data.*',
      'Ext.grid.*',
      'Ext.ux.CheckColumn',
      'Ext.window.MessageBox'
  ],

  id: 'systemstatus',

  init : function(){
    this.launcher = {
      text: '档案统计',
      iconCls:'cpustats',
      handler : this.createWindow,
      scope: this
    }
  },
  
  createWindow : function(){
    var desktop = this.app.getDesktop();
    
    var win = desktop.getWindow('systemstatus');
    
    Ext.regModel('qzgl_model', {
      fields: [
        {name: 'id',       type: 'integer'},
        {name: 'qzh',      type: 'integer'},
        {name: 'dalb',     type: 'integer'},
        {name: 'mlh',      type: 'integer'},
        {name: 'qajh',     type: 'integer'},
        {name: 'zajh',     type: 'integer'},
        {name: 'ajys',     type: 'integer'},
        {name: 'jnts',     type: 'integer'},
        {name: 'smyx',     type: 'integer'},
        {name: 'ml00',     type: 'integer'},
        {name: 'mlbk',     type: 'integer'},
        {name: 'mljn',     type: 'integer'},
        {name: 'jnjn',     type: 'integer'},
        {name: 'jn00',     type: 'integer'},
        {name: 'jnbk',     type: 'integer'},
        {name: 'a4',       type: 'integer'},
        {name: 'a3',       type: 'integer'},
        {name: 'dt',       type: 'integer'},
        {name: 'lijr',     type: 'string'},
        {name: 'jmcr',     type: 'string'},
        {name: 'dtxs',     type: 'string'},
        {name: 'zt',       type: 'string'},
        {name: 'json',     type: 'string'},
        {name: 'dh_prefix',type: 'string'},
        {name: 'yxwz',     type: 'string'}
      ]
    });

    // 虚拟打印状态Grid
    var qzgl_store =  Ext.create('Ext.data.Store', {
      model : 'qzgl_model',
      proxy: {
        type: 'ajax',
        url : '/desktop/get_qzgl_store',
        extraParams: {qzh:"",filter:"", dalb:""},
        reader: {
          type: 'json',
          root: 'rows',
          totalProperty: 'results'
        }
      }
    });

    qzgl_store.proxy.extraParams={qzh:'6',filter:"全部", dalb:""};
    qzgl_store.load();

    var ztRender = function(val) {
      if (val == "未入库") {
          return '<span style="color:red;">' + val + '</span>';
      } else if (val == "已归档") {
          return '<span style="color:blue;">' + val + '</span>';
      } else {
         return '<span style="color:gray;">' + val + '</span>';
      }
      return val;                          
    };

    var qzgl_grid = new Ext.grid.GridPanel({
         // more config options clipped //,
         title: '全宗管理',
         store: qzgl_store,
         id : 'qzgl_grid_id',
         iconCls:'export',
         height : 530,
         layout : 'fit',
         columns: [
           { text : 'id',   align:"center", width : 15, sortable : true, dataIndex: 'id', hidden: true},
           { text : '全宗号',  align:"left",  width : 50, sortable : true, dataIndex: 'qzh'},
           { text : '档案类别', align:"left",  width : 50, sortable : true, dataIndex: 'dalb'},
           { text : '目录号',  align:"left",  width : 50, sortable : true, dataIndex: 'mlh'},
           { text : '始卷',   align:"right", width : 40, sortable : true, dataIndex: 'qajh'},
           { text : '终卷',   align:"right", width : 40, sortable : true, dataIndex: 'zajh'},
           { text : '总页数',   align:"right", width : 80, sortable : true, dataIndex: 'ajys'},

           { text : '封面',   align:"right", width : 50, sortable : true, dataIndex: 'ml00'},
           { text : '著录',   align:"right", width : 50, sortable : true, dataIndex: 'mljn'},
           { text : '正文',   align:"right", width : 50, sortable : true, dataIndex: 'smyx', tdCls: 'x-change-cell'},
           { text : '备考',   align:"right", width : 50, sortable : true, dataIndex: 'mlbk',},
           { text : '旧封',   align:"right", width : 50, sortable : true, dataIndex: 'jn00'},
           { text : '旧卷',   align:"right", width : 50, sortable : true, dataIndex: 'jnjn'},
           { text : '旧备',   align:"right", width : 50, sortable : true, dataIndex: 'jnbk'},
           
           { text : 'A4',   align:"right", width : 60, sortable : true, dataIndex:  'a4',},
           { text : 'A3',   align:"right", width : 60, sortable : true, dataIndex:  'a3'},
           { text : '小计',   align:"right", width : 40, sortable : true, dataIndex:  'dt'},

           { text : '目录数据', align:"left", width : 150, sortable : true, dataIndex: 'json'},
           { text : '文件路径', align:"left", width : 100, sortable : true, dataIndex: 'yxwz'},
           
           { text : '状态',   align:"center", flex : 1, sortable : true, dataIndex: 'zt',  renderer:ztRenderer}
         ],
         //selModel : {selType:'cellmodel'},
         selType:'checkboxmodel',
         multiSelect:true,
         viewConfig: {
           //stripeRows:true,
           getRowClass: function(record, index) {
               var c = record.get('smyx') - record.get('ajys');
               if (c < 0) {
                   return 'price-fall';
               } else if (c > 0) {
                   return 'price-rise';
               } else {
                   return 'price-zero';
               }
           }
         },
         tbar : [{
             text : '打印汇总',
             iconCls:'print',
             handler : function() {
               items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
               id_str = '';
               for (var i=0; i < items.length; i ++) {
                 if (i==0) {
                   id_str = id_str+items[i].data.id;   
                 } else {
                   id_str = id_str + ',' +items[i].data.id; 
                 }
               };
               pars = {id:id_str};
               new Ajax.Request("/desktop/print_selected_qzxx", { 
                 method: "POST",
                 parameters: pars,
                 onComplete:  function(request) {
                   qzzt_store.load();
                 }
               });
             }
           },{
             text : '打印报表',
             iconCls:'print',
             handler : function() {
               items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
               id_str = '';
               for (var i=0; i < items.length; i ++) {
                 if (i==0) {
                   id_str = id_str+items[i].data.id ;
                 } else {
                   id_str = id_str + ',' +items[i].data.id ;
                 }

               };
               pars = {id:id_str};
               new Ajax.Request("/desktop/print_selected_qztj", { 
                 method: "POST",
                 parameters: pars,
                 onComplete:  function(request) {
                   qzzt_store.load();
                 }
               });
             }
           },'-',{
             text : '虚拟打印',
             iconCls:'print',
             handler : function() {
               items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
               id_str = '';
               for (var i=0; i < items.length; i ++) {
                 if (i==0) {
                   id_str = id_str+items[i].data.id ;
                 } else {
                   id_str = id_str + ',' +items[i].data.id ;
                 }

               };
               pars = {id:id_str};
               new Ajax.Request("/desktop/print_selected_mljn", { 
                 method: "POST",
                 parameters: pars,
                 onComplete:  function(request) {
                   qzzt_store.load();
                 }
               });
             }
           },'-',{
             text : '挂接数据',
             iconCls : 'import',
             handler : function() {
               
               
               
               
               
             }
           },'-',{
             text : '导入JSON',
             iconCls : 'import',
             handler : function() {
               items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
               id_str = '';
               for (var i=0; i < items.length; i ++) {
                 if (i==0) {
                   id_str = id_str+items[i].data.id ;
                 } else {
                   id_str = id_str + ',' +items[i].data.id ;
                 }

               };
               pars = {id:id_str};
               new Ajax.Request("/desktop/import_selected_aj", { 
                 method: "POST",
                 parameters: pars,
                 onComplete:  function(request) {
                   qzgl_store.load();
                 }
               });
             }
           },'-',{
             text : '导入影像',
             iconCls : 'import',
             handler : function() {
               items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
               id_str = '';
               for (var i=0; i < items.length; i ++) {
                 if (i==0) {
                   id_str = id_str+items[i].data.id ;
                 } else {
                   id_str = id_str + ',' +items[i].data.id ;
                 }

               };
               pars = {id:id_str};
               new Ajax.Request("/desktop/import_selected_image", { 
                 method: "POST",
                 parameters: pars,
                 onComplete:  function(request) {
                   qzzt_store.load();
                 }
               });
             }
           },{
             text : '导出影像',
             iconCls : 'export',
             handler : function() {
               items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
               id_str = '';
               for (var i=0; i < items.length; i ++) {
                 if (i==0) {
                   id_str = id_str+items[i].data.id ;
                 } else {
                   id_str = id_str + ',' +items[i].data.id ;
                 }
               };
               pars = {id:id_str};
               new Ajax.Request("/desktop/export_selected_image", { 
                 method: "POST",
                 parameters: pars,
                 onComplete:  function(request) {
                   qzzt_store.load();
                 }
               });
             }
           },'-', {
             text : '目录详细',
             iconCls:'x-tree-icon-leaf',
             handler : function() {
               items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
               if (items.length > 0) {
                 Ext.getCmp('qzgl_tabpanel_id').setActiveTab(1);
                 mulu_qz_store.proxy.extraParams.dh=items[0].data.dh_prefix; 
                 mulu_qz_store.proxy.extraParams.filter='全部'; 
                 mulu_qz_store.load();
               }
             }
           }, '-', {
             text : '更新',
             iconCls : 'x-tbar-loading',
             handler : function() {
               items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
               id_str = '';
               for (var i=0; i < items.length; i ++) {
                 if (i==0) {
                   id_str = id_str+items[i].data.id ;
                 } else {
                   id_str = id_str + ',' +items[i].data.id ;
                 }
               };
               
               if (items.length > 0) {
                 pars = {id:id_str};
                 new Ajax.Request("/desktop/update_qzxx_selected", { 
                   method: "POST",
                   parameters: pars,
                   onComplete:  function(request) {
                     qzgl_store.load();
                   }
                 });
               } else {
                 qzgl_store.load();
               }
                 
             }
           },{
             text : '更新全部',
             iconCls : 'x-tbar-loading',
             handler : function() {
               pars = {qzh:qzgl_store.proxy.extraParams.qzh};
               new Ajax.Request("/desktop/update_qzxx", { 
                 method: "POST",
                 parameters: pars,
                 onComplete:  function(request) {
                   qzgl_store.load();
                 }
               });
             }                                 
         },'<span style=" font-size:12px;font-weight:600;color:#3366FF;">类别</span>:&nbsp;&nbsp;',{
           xtype:"textfield",
           id : 'lb_field',
           width: 40,
           value: '',
           listeners:{
             'blur': function(field){
               qzgl_store.proxy.extraParams.dalb=field.getValue();
               qzgl_store.load();
             }
           }
         },
         '<span style=" font-size:12px;font-weight:600;color:#3366FF;">过滤</span>:&nbsp;&nbsp;',{
           xtype: 'combo',
           text:'过滤',
           x: 130,
           y: 190,
           width: 100,
           name: 'yxbh',
           id: 'qzzt_combo',
           store: ajzt_store,
           emptyText:'请选择',
           mode: 'local',
           minChars : 2,
           valueField:'text',
           displayField:'text',
           triggerAction:'all',
           listeners:{
             select:function(combo, records, index) {
               qzgl_store.proxy.extraParams.filter=records[0].data.text;
               qzgl_store.load();
             }
           }
         },'<span style=" font-size:12px;font-weight:600;color:#3366FF;">全宗号</span>:&nbsp;&nbsp;',{
           xtype:"textfield",
           id : 'qzh_field',
           name : 'qzh',
           width: 40,
           value: '6',
           listeners:{
             'blur': function(field){
               qzgl_store.proxy.extraParams.qzh=field.getValue();
               qzgl_store.load();
             }
           }           
         }]
    }); 

    qzgl_grid.on('itemdblclick', function(grid, item, r){
      data = item.data;
      var qzxxPanel = new Ext.form.FormPanel({
        id : 'qzxx_panel_id',
        labelWidth:40,
        bodyStyle:"padding:35px;",
        items:[{
            xtype:"textfield",
            hidden: true,
            name:"id"
          },{
            xtype:"textfield",
            fieldLabel:"目录号",
            name:"mlh"
          },
          {
            xtype:"textfield",
            fieldLabel:"立卷人",
            name:"lijr"
          },{
            xtype:"textfield",
            fieldLabel:"检查人",
            name:"jmcr"
          },{
            xtype:"textfield",
            fieldLabel:"影像路径",
            name:"yxwz"
          }]        
      });
      
      var qzxx_win = new Ext.Window({
        id : 'qzxx_edit_win',
        iconCls : 'add',
        title: '目录设置',
        floating: true,
        shadow: true,
        draggable: true,
        closable: true,
        modal: true,
        width: 400,
        height: 300,
        layout: 'fit',
        plain: true,
        xtype:"form",
        items:qzxxPanel,
        buttons: [{
            text: '下一个',
            handler: function() {

            }
          },{
            text: '保存',
            handler: function() {
              var form =Ext.getCmp('qzxx_panel_id').getForm();
              pars = form.getValues();
              new Ajax.Request("/desktop/save_mulu_info", { 
                method: "POST",
                parameters: pars,
                onComplete:  function(request) {
                  qzgl_store.load();
                }
              });
            }
          },{
            text: '关闭',
            handler: function() {
              Ext.getCmp('qzxx_edit_win').close();
            }
        }]
      });
      
      var form =Ext.getCmp('qzxx_panel_id').getForm();
      form.findField('id').setValue(data.id);
      form.findField('mlh').setValue(data.mlh);
      form.findField('lijr').setValue(data.lijr);
      form.findField('jmcr').setValue(data.jmcr);
      form.findField('yxwz').setValue(data.yxwz);
      
      qzxx_win.show();
      
    });
    
    Ext.regModel('qzzt_model', {
      fields: [
        {name: 'id',       type: 'integer'},
        {name: 'dhp',      type: 'string'},
        {name: 'mlh',      type: 'integer'},
        {name: 'cmd',      type: 'string'},
        {name: 'fjcs',     type: 'string'},
        {name: 'dqwz',     type: 'string'},
        {name: 'zt',       type: 'string'}
      ]
    });

    // 虚拟打印状态Grid
    var qzzt_store =  Ext.create('Ext.data.Store', {
      model : 'qzzt_model',
      proxy: {
        type: 'ajax',
        url : '/desktop/get_qzzt_store',
        extraParams: {qzh:""},
        reader: {
          type: 'json',
          root: 'rows',
          totalProperty: 'results'
        }
      }
    });

    qzzt_store.proxy.extraParams={qzh:'4'};
    qzzt_store.load();

    var ztRender = function(val) {
      if (val == "未入库") {
          return '<span style="color:red;">' + val + '</span>';
      } else if (val == "已归档") {
          return '<span style="color:blue;">' + val + '</span>';
      } else {
         return '<span style="color:gray;">' + val + '</span>';
      }
      return val;                          
    };

    var qzzt_grid = new Ext.grid.GridPanel({
         // more config options clipped //,
         title: '任务状态',
         store: qzzt_store,
         id : 'qzzt_grid_id',
         iconCls:'task16',
         columns: [
           { text : 'id',    align:"center", width : 15, sortable : true, dataIndex: 'id', hidden: true},
           { text : '档号',    align:"left",   width : 50, sortable : true, dataIndex: 'dhp'},
           { text : '目录号',    align:"left",  width : 50, sortable : true, dataIndex: 'mlh'},
           { text : '任务命令',   align:"left", width : 250, sortable : true, dataIndex: 'cmd'},
           { text : '附加参数',   align:"left", width : 100, sortable : true, dataIndex: 'fjcs'},
           { text : '当前位置',   align:"center", width : 50, sortable : true, dataIndex: 'dqwz'},
           { text : '状态',     align:"center", flex : 1, sortable : true, dataIndex:   'zt', renderer:ztRenderer}
         ],
         //selModel : {selType:'cellmodel'},
         selType:'checkboxmodel',
         multiSelect:true,
         viewConfig: {
           stripeRows:true
         },
         tbar : [
         {
            text : '删除选择',
            handler : function() {
              items = Ext.getCmp('qzzt_grid_id').getSelectionModel().selected.items;
              id_str = '';
              for (var i=0; i < items.length; i ++) {
                if (i==0) {
                  id_str = id_str+items[i].data.id;
                } else {
                  id_str = id_str + ',' +items[i].data.id ;
                }
              
              };
              pars = {id:id_str};
              new Ajax.Request("/desktop/delete_qzzt_task", { 
                method: "POST",
                parameters: pars,
                onComplete:  function(request) {
                  qzzt_store.load();
                }
              });
            }
          },'-',{
            text : '删除完成',
            handler : function() {
              pars = {};
              new Ajax.Request("/desktop/delete_all_qzzt_task", { 
                method: "POST",
                parameters: pars,
                onComplete:  function(request) {
                  qzzt_store.load();
                }
              });
            }
          },
          {
            text: '执行',
            handler: function() {
              var pars={id:archive_id};
              new Ajax.Request("/desktop/start_qzzt_task", {
                method: "POST",
                parameters: pars,
                onComplete:  function(request) {
                  qzzt_store.load();
                }
              });
            }
          },
          {
             text : '刷新',
             iconCls : 'x-tbar-loading',
             handler : function() {
               qzzt_store.load();
             }                                 
         }]
    }); 
    
    Ext.regModel('mulu_qz_model', {
      fields: [
        {name: 'id',    type: 'integer'},
        {name: 'dh',    type: 'string'},
        {name: 'ajh',   type: 'string'},
        {name: 'ajys',  type: 'string'},
        {name: 'ml00',  type: 'string'},
        {name: 'mlbk',  type: 'string'},
        {name: 'mljn',  type: 'string'},
        {name: 'jn00',  type: 'string'},
        {name: 'jnbk',  type: 'string'},
        {name: 'jnjn',  type: 'string'},
        {name: 'smyx',  type: 'string'},
        {name: 'a3',    type: 'string'},
        {name: 'a4',    type: 'string'},
        {name: 'dt',    type: 'string'},
        {name: 'zt',    type: 'string'}
      ]
    });

    mulu_qz_store = Ext.create('Ext.data.Store', {
      model : 'mulu_qz_model',
      proxy: {
        type: 'ajax',
        url : '/desktop/get_mulu_store',
        extraParams: {dh:"",filter:""},
        reader: {
          type: 'json',
          root: 'rows',
          totalProperty: 'results'
        }
      }
    });

    var zeroRenderer = function(val) {
      if (val > 0) {
          return '<span style="color:blue;">' + val + '</span>';
      } else if (val == 0) {
          return '<span style="color:gray;">' + val + '</span>';
      }
      return val;
    }

    var ztRenderer = function(val) {
      if (val == "空卷") {
          return '<span style="color:red;">' + val + '</span>';
      } 
      return val;
    }

    var mulu_qz_grid = new Ext.grid.GridPanel({
      id: 'mulu_qz_grid_id',
      store: mulu_qz_store,
      iconCls:'x-tree-icon-leaf',
      title: '目录详细',
      columns: [
        { text : 'id', align:"center", width : 15, sortable : true, dataIndex: 'id', hidden: true},
        { text : '档号', align:"left", width : 90, sortable : true, dataIndex: 'dh'},
        { text : '页数', align:"right", width : 40, sortable : true, dataIndex: 'ajys'},
        { text : 'A3', align:"right", width : 40, sortable : true, dataIndex: 'a3',   renderer:zeroRenderer},
        { text : 'A4', align:"right", width : 40, sortable : true, dataIndex: 'a4',   renderer:zeroRenderer},
        { text : '大',  align:"right", width : 40, sortable : true, dataIndex:  'dt',  renderer:zeroRenderer},
        { text : '小计', align:"right", width : 40, sortable : true, dataIndex:  'xj'},
        { text : '封',  align:"right", width : 40, sortable : true, dataIndex: 'ml00', renderer:zeroRenderer},
        { text : '卷',  align:"right", width : 40, sortable : true, dataIndex: 'mljn', renderer:zeroRenderer},
        { text : '正文', align:"right", width : 40, sortable : true, dataIndex: 'smyx', renderer:zeroRenderer},
        { text : '备',  align:"right", width : 40, sortable : true, dataIndex: 'mlbk', renderer:zeroRenderer},
        { text : '旧封', align:"right", width : 40, sortable : true, dataIndex: 'jn00'},
        { text : '旧卷', align:"right", width : 40, sortable : true, dataIndex: 'jnjn'},
        { text : '旧备', align:"right", width : 40, sortable : true, dataIndex: 'jnbk'},
        { text : '状态', align:"center", flex : 1, sortable : true, dataIndex: 'zt',    renderer:ztRenderer}
      ],
      //width :  800,
      //height : 350,
      columnLines: true,
      layout: 'fit',
      tbar:[{
          text:'导入案卷',
          iconCls:'import',
          handler : function() {
            items = Ext.getCmp('mulu_qz_grid_id').getSelectionModel().selected.items;
            id_str = '';
            for (var i=0; i < items.length; i ++) {
              if (i==0) {
                id_str = id_str+items[i].data.id ;
              } else {
                id_str = id_str + ',' +items[i].data.id ;
              }
            };
            pars = {id:id_str};
            new Ajax.Request("/desktop/import_selected_timage_aj", { 
              method: "POST",
              parameters: pars,
              onComplete:  function(request) {
                qzzt_store.load();
              }
            });
          }
        },'-',{
          text:'平衡',
          iconCls:'',
          handler : function() {
            Ext.Msg.confirm("确认", "用影像的数据修改输档的数据？", 
              function(btn){
                if (btn=='yes') {
                  pars = {dh:mulu_qz_store.proxy.extraParams.dh};
                  new Ajax.Request("/desktop/balance_mulu", { 
                   method: "POST",
                   parameters: pars,
                   onComplete:  function(request) {
                     qzzt_store.load();
                   }
                  });
                }
              }
            );
          }
        },{
          text:'修改案卷',
           iconCls:'write16',
           handler : function() {
             items = Ext.getCmp('mulu_qz_grid_id').getSelectionModel().selected.items;
           
             if (items.length > 0 ) {
               data = items[0].data;
               var modiPanel = new Ext.form.FormPanel({
                 id : 'modipanel_panel_id',
                 labelWidth:40,
                 bodyStyle:"padding:35px;",
                 items:[{
                    xtype:"textfield",
                    hidden: true,
                    name:"id",
                  },{
                    xtype:"textfield",
                    fieldLabel:"档号",
                    name:"dh"
                  },
                  {
                    xtype:"textfield",
                    fieldLabel:"页数",
                    name:"ajys"
                  }]        
               });

               var modi_win = new Ext.Window({
                 id : 'modipanel_edit_win',
                 iconCls : 'add',
                 title: '案卷修改',
                 floating: true,
                 shadow: true,
                 draggable: true,
                 closable: true,
                 modal: true,
                 width: 400,
                 height: 300,
                 layout: 'fit',
                 plain: true,
                 xtype:"form",
                 items:modiPanel,
                 buttons: [{
                     text: '下一个',
                     hidden: true,
                     handler: function() {
                     }
                   },{
                     text: '保存',
                     handler: function() {
                       var form =Ext.getCmp('modipanel_panel_id').getForm();
                       pars = form.getValues();
                       new Ajax.Request("/desktop/save_archive_info", { 
                         method: "POST",
                         parameters: pars,
                         onComplete:  function(request) {
                           mulu_qz_store.load();
                         }
                       });
                     }
                   },{
                     text: '关闭',
                     handler: function() {
                       Ext.getCmp('modipanel_edit_win').close();
                     }
                 }]
               });

               var form =Ext.getCmp('modipanel_panel_id').getForm();
               form.findField('id').setValue(data.id);
               form.findField('dh').setValue(data.dh);
               form.findField('ajys').setValue(data.ajys);
               modi_win.show();
             }
           }
        },'-',{
          xtype: 'combo',
          text:'过滤',
          x: 130,
          y: 190,
          width: 100,
          name: 'yxbh',
          id: 'ajzt_combo',
          store: ajzt_store,
          emptyText:'请选择',
          mode: 'local',
          minChars : 2,
          valueField:'text',
          displayField:'text',
          triggerAction:'all',
          listeners:{
            select:function(combo, records, index) {
              mulu_qz_store.proxy.extraParams.filter=records[0].data.text; 
              mulu_qz_store.load();
            }
          }
        }],
      bbar:[
        new Ext.PagingToolbar({
          store: mulu_qz_store,
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
      multiSelect:true,
      viewConfig: {
        stripeRows:true
      }
    });

    mulu_qz_grid.getStore().on('load',function(s,records){
    });

    mulu_qz_grid.on("select", function(node){
    });
    
    
    mulu_qz_grid.on('itemdblclick', function(grid, item, r){
      data = item.data;
      
      var modiPanel = new Ext.form.FormPanel({
        id : 'modipanel_panel_id',
        labelWidth:40,
        bodyStyle:"padding:35px;",
        items:[{
           xtype:"textfield",
           hidden: true,
           name:"id"
         },{
           xtype:"textfield",
           fieldLabel:"档号",
           name:"dh"
         },
         {
           xtype:"textfield",
           fieldLabel:"页数",
           name:"ajys"
         }]        
      });

      var modi_win = new Ext.Window({
        id : 'modipanel_edit_win',
        iconCls : 'add',
        title: '案卷修改',
        floating: true,
        shadow: true,
        draggable: true,
        closable: true,
        modal: true,
        width: 400,
        height: 300,
        layout: 'fit',
        plain: true,
        xtype:"form",
        items:modiPanel,
        buttons: [{
            text: '下一个',
            hidden: true,
            handler: function() {
            }
          },{
            text: '保存',
            handler: function() {
              var form =Ext.getCmp('modipanel_panel_id').getForm();
              pars = form.getValues();
              new Ajax.Request("/desktop/save_archive_info", { 
                method: "POST",
                parameters: pars,
                onComplete:  function(request) {
                  mulu_qz_store.load();
                  Ext.getCmp('modipanel_edit_win').close();
                }
              });
            }
          },{
            text: '关闭',
            handler: function() {
              Ext.getCmp('modipanel_edit_win').close();
            }
        }]
      });

      var form =Ext.getCmp('modipanel_panel_id').getForm();
      form.findField('id').setValue(data.id);
      form.findField('dh').setValue(data.dh);
      form.findField('ajys').setValue(data.ajys);
      modi_win.show();
    });
    
        
    var qzglPanel = new Ext.form.FormPanel({
      id : 'qzgl_panel_id',
      labelWidth:40,
      //bodyStyle:"padding:35px;",
      bodyPadding: 3,
      layout: 'fit',
      items:[{
          xtype: 'tabpanel',
          id : 'qzgl_tabpanel_id',
          layout: 'fit',
          minHeight: 530,
          activeTab: 0,
          items: [qzgl_grid,mulu_qz_grid,qzzt_grid]
      }]        
    });
    
    if(!win){
      win = desktop.createWindow({
        id: 'systemstatus',
        title:'档案统计',
        iconCls:'datj16',
        width:800,
        height:500,
        x : 100,
        y : 50,
        animCollapse:false,
        border: false,
        layout: 'fit',
        hideMode: 'offsets',
        items: [{
          layout:"border",
          items:[{
              region:"center",
              layout:"fit",
              items:[qzglPanel]
            }]
        }]
        
      });
    }
    
    win.show();
    return win;
  }
});

