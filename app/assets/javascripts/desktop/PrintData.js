/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.define('MyDesktop.PrintData', {
  extend: 'Ext.ux.desktop.Module',

  requires: [
    '*',
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.ux.CheckColumn',
    'Ext.window.MessageBox'
  ],

  id:'printdata',

  init : function(){
    this.launcher = {
      text: '影像生成',
      iconCls:'printdata',
      handler : this.createWindow,
      scope: this
    }
  },

  createWindow : function(){
    var desktop = this.app.getDesktop();
    
    var win = desktop.getWindow('printdata');

    var tree_store  = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: 'desktop/get_tree',
            extraParams: {style:"0"},
            actionMethods: 'POST'
        }
    });
    
    var treePanel = Ext.create('Ext.tree.Panel', {
      id : 'pd_treepanel_id',
      store: tree_store,
      rootVisible: false,
      useArrows: true,
      singleExpand: true,
      width: 200,
      layout: "fit"
      //height: 300,
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
        {name: 'dalb',    type: 'string'},
        {name: 'dyzt',    type: 'string'}
      ]
    });
    
    archive_store = Ext.create('Ext.data.Store', {
      model : 'archive_model',
      proxy: {
        type: 'ajax',
        url : '/desktop/get_archive',
        extraParams: {query:""},
        reader: {
          type: 'json',
          root: 'rows',
          totalProperty: 'results'
        }
      }
      //sortInfo:{field: 'level4', direction: "ASC"},
      //baseParams: {start:0, limit:25, query:""}
    });
    

    var add_quzwin = function () {
      var quzPanel = new Ext.form.FormPanel({
        id : 'quz_panel_id',
        labelWidth:40,
        bodyStyle:"padding:35px;",
        items:[{
          xtype:"textfield",
          name:"qzh",
          fieldLabel:"全宗号",
          anchor:"95%"
        },{
          xtype:"textfield",
          name:"dwdm",
          fieldLabel:"单位全名",
          anchor:"95%"
        },{
          xtype:"textfield",
          name:"dwjc",
          fieldLabel:"单位简称",
          anchor:"95%"      
        }
        ]        
      });
      
      var quz_win = new Ext.Window({
        id : 'add_quz_win',
        iconCls : 'add',
        title: '新增全宗',
        floating: true,
        shadow: true,
        draggable: true,
        closable: true,
        modal: true,
        width: 450,
        height: 320,
        layout: 'fit',
        plain: true,
        items:quzPanel,
        buttons: [{
          text: '确认',
          handler: function() {
            var myForm = Ext.getCmp('quz_panel_id').getForm();
            
            if(myForm.isValid()){
              form_action=1;
              myForm.submit({
                url: '/desktop/add_qzh',
                success: function(form, action){
                  var isSuc = action.result.success; 
                  if (isSuc) {
                    //msg('成功', '添加成功');
                    Ext.getCmp('dwdm_combo').store.load();
                    
                    
                    qzh = form.findField('qzh').getValue();
                    dwdm = form.findField('dwdm').getValue();
                    
                    
                    var muForm =Ext.getCmp('mulu_panel_id').getForm();
                    muForm.findField('qzh').setValue(qzh);
                    muForm.findField('dwdm').setValue(qzh);
                    
                    
                    Ext.getCmp('add_quz_win').close();
                  } else { 
                    msg('失败', '全宗已存在');
                  }
                }, 
                failure: function(){
                  msg('失败', '新增全宗失败');
                }
              });
            }
            
          }
        }]
      });
      
      // tree_id, qrz|dalb|mlh
      quz_win.show();
    }

    var add_muluwin = function() {
      
      Ext.regModel('d_dalb_model', {
        fields: [
          {name: 'id',     type: 'integer'},
          {name: 'lbmc',     type: 'string'},
          {name: 'lbsl',     type: 'integer'}
        ]
      });

      var dalb_store =  Ext.create('Ext.data.Store', {
        auto_load : true,
        model : 'd_dalb_model',
        proxy: {
          type: 'ajax',
          url : '/desktop/get_d_dalb',
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
      });
      dalb_store.load();
      
      
      Ext.regModel('d_dwdm_model', {
        fields: [
          {name: 'id',     type: 'integer'},
          {name: 'dwdm',     type: 'string'}
        ]
      });

      var dwdm_store =  Ext.create('Ext.data.Store', {
        auto_load : true,
        model : 'd_dwdm_model',
        proxy: {
          type: 'ajax',
          url : '/desktop/get_d_dwdm',
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }
      });
      
      
      dwdm_store.load();
      
      var muluPanel = new Ext.form.FormPanel({
        id : 'mulu_panel_id',
        labelWidth:40,
        bodyStyle:"padding:35px;",
        items:[{
          xtype:"textfield",
          name:"qzh",
          hidden:false,
          fieldLabel:"全宗号",
          anchor:"95%"
        },{
          xtype:"combo",
          name:"dwdm",
          fieldLabel:"单位代码",
          anchor:"95%",
          id: 'dwdm_combo',
          store: dwdm_store,
          emptyText:'请选择',
          mode: 'remote',
          minChars : 2,
          valueField:'id',
          displayField:'dwdm',
          triggerAction:'all',
          listeners:{
            select:function(combo, record, index) {
              var muForm =Ext.getCmp('mulu_panel_id').getForm();
              muForm.findField('qzh').setValue(record[0].data.id);
            }
          }      
        },{
          xtype:"combo",
          name:"dalb",
          fieldLabel:"档案类别",
          anchor:"95%",
          id: 'dalb_combo',
          store: dalb_store,
          emptyText:'请选择',
          mode: 'remote',
          minChars : 2,
          valueField:'id',
          displayField:'lbmc',
          triggerAction:'all'
        },{
          xtype:"textfield",
          name:"mlh",
          fieldLabel:"目录号",
          anchor:"95%",
          hidden:true,
          listeners:{
            scope: this,
            'blur': function(field){
              //if (field.getValue() != field.startValue){
              if (field.getValue().length > 0){
                form = Ext.getCmp('mulu_panel_id').form;
                qzh = form.findField('qzh').value;
                var pars = {mlh:field.getValue(),qzh:qzh};
                new Ajax.Request("/desktop/check_mlh", 
                  { method: "POST",
                    parameters: pars,
                    onComplete:  function(request) {
                      var users = eval("("+request.responseText+")");
                      if (users.size() > 0) {
                        msg('重要提示', '该目录已经存在，继续操作将删除该目录所有数据！');
                      }
                    }
                  });                                       
              }
            }
          }
        },{
          xtype:"fileuploadfield",
          name:"ajb",
          fieldLabel:"案卷表",
          anchor:"95%",
          emptyText: '选择一个文件...',
          buttonText: '浏览',
        },{
          xtype:"fileuploadfield",
          name:"jnb",
          fieldLabel:"卷内表",
          anchor:"95%",
          emptyText: '选择一个文件...',
          buttonText: '浏览'
        },{
          xtype: 'progressbar',
          value: 0.0,
          id : 'mulu_progressbar_id',
          anchor:"95%"
        },{
          xtype:"textfield",
          name:"yxml",
          fieldLabel:"影像目录",
          hidden: true,
          anchor:"95%"      
        }
        ]
      });

      var mulu_win = new Ext.Window({
        id : 'add_mulu_win',
        iconCls : 'add',
        title: '新增档案',
        floating: true,
        shadow: true,
        draggable: true,
        closable: true,
        modal: true,
        width: 450,
        height: 320,
        layout: 'fit',
        plain: true,
        items:muluPanel,
        tbar : ['->', 
        {
          text: '新增全宗',
          iconCls: 'add',
          handler:function() {
            add_quzwin();
          }
        },
        {
          text: '删除全宗',
          iconCls: 'remove',
          handler:function() {
            var muForm =Ext.getCmp('mulu_panel_id').getForm();
            qzh = muForm.findField('qzh').value;
            
            Ext.Msg.confirm("确认", "删除全宗"+qzh+"的全部数据?", 
              function(btn){
                if (btn=='yes') {
                  pars = {qzh:qzh};
                  new Ajax.Request("/desktop/delete_qzh", 
                    { method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        Ext.getCmp('dwdm_combo').lastQuery = null; 
                        Ext.getCmp('dwdm_combo').store.load();
                        muForm =Ext.getCmp('mulu_panel_id').getForm();
                        muForm.findField('qzh').setValue("");
                        muForm.findField('dwdm').setValue(-1);
                      }
                    });
                                        
                }
              }
            );
            
          }
        }],
        buttons: [{
          text: '默认',
          handler: function() {
            if (tree_id != 0) {
              ss = tree_id.split('|');
              var form =Ext.getCmp('mulu_panel_id').getForm();
              form.findField('qzh').setValue(ss[0]);
              form.findField('dwdm').setValue(ss[0]);
              form.findField('dalb').setValue(ss[1]);
            }
          }
        },{
          text: '上传',
          handler: function(){
            myForm = Ext.getCmp('mulu_panel_id').getForm();
            if(myForm.isValid()){
              form_action=1;
              myForm.submit({
                url: '/desktop/upload_files',
                waitMsg: '文件上传中...',
                success: function(form, action){
                  var isSuc = action.result.success; 
                  if (isSuc) {
                    msg('成功', '文件上传成功.');
                  } else { 
                    msg('失败', '文件上传失败.');
                  }
                }, 
                failure: function(){
                  msg('失败', '文件上传失败.');
                }
              });
            }
          }
        }]
      });  
/*            
            var sc_task = {
              run: function(){
                var form = Ext.getCmp('mulu_panel_id').getForm();
                pars = form.getValues();
                new Ajax.Request("/desktop/get_mulu_status", { 
                  method: "POST",
                  parameters: pars,
                  onComplete:  function(request) {
                    var p = Ext.getCmp('mulu_progressbar_id');

                    // ss = 12/10/15/msg
                    var ss = request.responseText.split('|');
                    if (parseInt(ss[0]) > dqaj) {
                      p.updateProgress((ss[0]-ss[1])/(ss[2]-ss[1]+1), "正在打印卷 "+ss[0]);
                      dqaj = parseInt(ss[0]);
                    }

                    if (ss[3] == '上传完成') {
                      Ext.TaskManager.stop(pr_task);
                      var form =Ext.getCmp('mulu_panel_id').getForm();
                      form.findField('progress_text_id').setValue("");
                      p.updateProgress(1);
                      p.updateText('上传完成!');
                      
                      Ext.get('add_mulu_win').close();
                      tree_store.getRootNode().removeAll();
                      tree_store.load();
                      
                    }  
                }
                });
              },
              interval: 5000 //1 second
            }
            
            //var p = Ext.getCmp('mulu_progressbar_id');
            var form = Ext.getCmp('mulu_panel_id').getForm();
            
            //if(myForm.isValid())
            
            pars = form.getValues();
            new Ajax.Request("/desktop/upload_files", { 
              method: "POST",
              parameters: pars,
              onComplete:  function(request) {
                Ext.TaskManager.start(pr_task);
              }
            });
*/            


      
      // tree_id, qrz|dalb|mlh
      mulu_win.show();

    };
    
    var add_jumpLoader = function() {
      
      var applet_str = '<applet id="jumpLoaderApplet" name="jumpLoaderApplet"'
       +' code="jmaster.jumploader.app.JumpLoaderApplet.class"'
       +' archive="/assets/jumploader_z.jar"'
       +' width="700"'
       +' height="450"'
       +' mayscript>'
       +'   <param name="uc_imageEditorEnabled" value="true"/>'
       +'   <param name="uc_uploadUrl" value="/desktop/upload_images"/>'
       +'   <param name="uc_partitionLength" value="10000000"/>'
       +'</applet>"';
      
      var jumper_win = new Ext.Window({
        id : 'add_jumper_win',
        iconCls : 'add',
        title: '新增目录',
        floating: true,
        shadow: true,
        draggable: true,
        closable: true,
        modal: true,
        width: 715,
        height: 500,
        layout: 'fit',
        plain: true,
        html: applet_str,
        buttons: [{
          text: '默认',
          handler: function() {
            if (tree_id != 0) {
              ss = tree_id.split('|');
              var form =Ext.getCmp('mulu_panel_id').getForm();
              form.findField('qzh').setValue(ss[0]);
              form.findField('dwdm').setValue(ss[0]);
              form.findField('dalb').setValue(ss[1]);
            }
          }
        }]
      });
      
      jumper_win.show();
    }
    
    var show_origin = function() {
      var canvas_string = 
      '<div id="wrapper">'
      +'    <div id="buttonWrapper">'
      +'      <input type="button" id="prev" value="<">'
      +'      <input type="button" id="plus" value="+">'
      +'      <input type="button" id="minus" value="—">'
      +'      <input type="button" id="next" value=">">'
      +'    </div>'
      +'    <canvas id="myCanvas" width="530" height="800">'
      +'    </canvas>'
      +'</div>';
      
       var origin_win = new Ext.Window({
         id : 'show_origin_win',
         iconCls : 'add',
         title: '原始图像',
         floating: true,
         shadow: true,
         draggable: true,
         closable: true,
         resizable : true,
         modal: true,
         width: 548,
         height: 820,
         plain: true,
         items : [{
             xtype: 'panel', //或者xtype: 'component',
             html:canvas_string
         }],
         //html: canvas_string,
         buttons: [{
           text: '默认',
           handler: function() {
             if (tree_id != 0) {
               ss = tree_id.split('|');
               var form =Ext.getCmp('mulu_panel_id').getForm();
               form.findField('qzh').setValue(ss[0]);
               form.findField('dwdm').setValue(ss[0]);
               form.findField('dalb').setValue(ss[1]);
             }
           }
         }]
       }); 
       
       origin_win.show();
    }
    
    var myuploadform= new Ext.FormPanel({
      id : 'my_upload_form',
      fileUpload: true,
      width: 200,
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
        text: '文件名：',
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
      buttons: [{
        text: '上传',
        handler: function(){
          myForm = Ext.getCmp('my_upload_form').getForm();
          if(myForm.isValid()){
            form_action=1;
            myForm.submit({
              url: '/desktop/upload_file',
              waitMsg: '文件上传中...',
              success: function(form, action){
                var isSuc = action.result.success; 
                if (isSuc) {
                  msg('成功', '文件上传成功.');
                } else { 
                  msg('失败', '文件上传失败.');
                }
              }, 
              failure: function(){
                msg('失败', '文件上传失败.');
              }
            });
          }
        }
      }]
    });
    
    var printStatus = function(val) {
      myStr = sprintf("%04b", parseInt(val)) ;
      if (parseInt(val) > 8) {
        return '<span style="color:blue;">' + myStr + '</span>';
      } else {
        return '<span style="color:red;">' + myStr + '</span>';
      }
    };
    
    var archiveGrid = new Ext.grid.GridPanel({
      id: 'archive_grid_id',
      store: archive_store,
      columns: [
        //{ text : 'file_name', flex : 1, sortable : true, dataIndex: 'level4'},
        //{ text : 'file_size',  width : 75, sortable : true, dataIndex: 'file_size'}
        { text : 'id',   width : 75, sortable : true, dataIndex: 'id', hidden:true},
        { text : '打印状态', width : 75, sortable : true, dataIndex: 'dyzt', renderer : printStatus },
        { text : '档号',   width : 75, sortable : true, dataIndex: 'dh'},
        { text : '单位代码', width : 75, sortable : true, dataIndex: 'dwdm'},
        { text : '案件号',  width : 75, sortable : true, dataIndex: 'ajh'},
        { text : '标题名称', width : 175, sortable : true, dataIndex: 'tm'},
        { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
        { text : '年度',   width : 75, sortable : true, dataIndex: 'nd'},
        { text : '件数',   width : 75, sortable : true, dataIndex: 'js'},
        { text : '页数',   width : 75, sortable : true, dataIndex: 'ys'},
        { text : '保管期限', width : 75, sortable : true, dataIndex: 'bgqx'},
        { text : '起日期',  width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
        { text : '止日期',  width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
        { text : '起年月',  width : 75, sortable : true, dataIndex: 'qny'},
        { text : '止年月',  width : 75, sortable : true, dataIndex: 'zny'},
        { text : '备注',   flex : 1, sortable : true, dataIndex: 'bz'}
        ],
      width : 800,
      columnLines: true,
      layout:'fit',
      //height : 350,
      //selType:'checkboxmodel',
			//multiSelect:true,
      viewConfig: {
        stripeRows:true,
      },
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
      ]
    });
    
    Ext.regModel('document_model', {
      fields: [
        {name: 'id',    type: 'integer'},
        {name: 'tm',    type: 'string'},
        {name: 'sxh',   type: 'string'},
        {name: 'yh',    type: 'string'},
        {name: 'wh',    type: 'string'},
        {name: 'zrz',   type: 'string'},
        {name: 'rq',    type: 'date',  dateFormat: 'Y-m-d H:i:s'},
        {name: 'bz',    type: 'string'},
        {name: 'dh',    type: 'string'},
        {name: 'ownerid', type: 'integer'}
      ]
    });
    
    document_store = Ext.create('Ext.data.Store', {
      model : 'document_model',
      proxy: {
        type: 'ajax',
        url : '/desktop/get_document',
        extraParams: {query:""},
        reader: {
          type: 'json',
          root: 'rows'
        }
      }
    });
    
    var documentGrid = new Ext.grid.GridPanel({
      id: 'document-grid',
      store: document_store,
      columns: [
        { text : 'id',  width : 75, sortable : true, dataIndex: 'id'},
        { text : '档号',  width : 75, sortable : true, dataIndex: 'dh'},
        { text : '标题名称',  width : 175, sortable : true, dataIndex: 'tm'},
        { text : '页号',  width : 75, sortable : true, dataIndex: 'yh'},
        { text : '文号',  width : 75, sortable : true, dataIndex: 'wh'},
        { text : '顺序号',  width : 75, sortable : true, dataIndex: 'sxh'},
        { text : '责任人',  width : 75, sortable : true, dataIndex: 'zrz'},
        { text : '日期',  width : 75, sortable : true, dataIndex: 'rq',  renderer: Ext.util.Format.dateRenderer('Y-m-d')},
        { text : '备注',  width : 75, sortable : true, dataIndex: 'bz'},
        { text : 'ownerid',  flex : 1, sortable : true, dataIndex: 'ownerid'}
      ],
      width : 800,
      //height : 300,
      layout: 'fit',
      viewConfig: {
        stripeRows:true
      }
    });
    
    treePanel.on("select",function(node){ 
      data = node.selected.items[0].data;  // data.id, data.parent, data.text, data.leaf
      tree_id = data.id;
      if (data.leaf) {
        archive_store.proxy.extraParams.query=data.id;
        archive_store.load();
        //var dh = data.id;
        //mulu_store.proxy.extraParams = {dh:dh};
        //mulu_store.load();
      }
    });
    
    archive_store.on('load', function(){
      archiveGrid.getSelectionModel().select(0);
    });
    
    archiveGrid.on("select",function(node){
      data = node.selected.items[0].data;    // data.id, data.parent, data.text, data.leaf
      archive_id = data.id; 
      archive_data = data;
      document_store.proxy.extraParams.query=data.id;
      document_store.load();
      
      timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
      timage_store.load();
      
      Ext.getCmp('timage_combo').lastQuery = null; 

    });
    
    Ext.regModel('timage_model', {
      fields: [
        {name: 'id',     type: 'integer'},
        {name: 'dh',     type: 'string'},
        {name: 'yxmc',     type: 'string'},
        {name: 'yxdx',     type: 'string'},
        {name: 'yxbh',     type: 'string'},
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

    timage_store.on('load',function(ds,records,o){
      combo = Ext.getCmp('timage_combo');
      combo.setValue(records[0].data.id);
      var pars={gid:records[0].data.id, type:timage_store.proxy.extraParams.type};
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
    });
    
    if(!win){
      win = desktop.createWindow({
        id: 'printdata',
        title:'影像生成',
        width:1200,
        height:600,
        iconCls: 'printdata',
        animCollapse:false,
        border: false,
        hideMode: 'offsets',
        layout: 'fit',
        items: [{
          layout:"border",
          items:[{
              region:"center",
              layout:"fit",
              border: false,
              split:true,
              items:[{
                layout:"border",
                border: false,
                items:[{
                  region:"center",
                  id : "center_grid",
                  layout:"fit",
                  autoScroll : true,
                  tbar:[{
                      text:'任务管理',
                      tooltip:'',
                      iconCls:'print',
                      handler: function() {
                        var tree = Ext.getCmp('pd_treepanel_id');
                        var node = tree.getSelectionModel().selected;
                      
                        var print_status = function() {
                        
                          Ext.regModel('dyzt_model', {
                            fields: [
                              {name: 'id',     type: 'integer'},
                              {name: 'dydh',     type: 'string'},
                              {name: 'mlh',     type: 'string'},
                              {name: 'dqjh',     type: 'string'},
                              {name: 'qajh',     type: 'string'},
                              {name: 'zajh',     type: 'string'},
                              {name: 'dylb',     type: 'string'},
                              {name: 'dyzt',     type: 'string'}
                            ]
                          });
                          
                          // 虚拟打印状态Grid
                          var dyzt_store =  Ext.create('Ext.data.Store', {
                            model : 'dyzt_model',
                            proxy: {
                              type: 'ajax',
                              url : '/desktop/get_dyzt_store',
                              extraParams: {id:""},
                              reader: {
                                type: 'json',
                                root: 'rows',
                                totalProperty: 'results'
                              }
                            }
                          });
                        
                          dyzt_store.load();
                        
                          var dyztRender = function(val) {
                            if (val == "未打印") {
                                return '<span style="color:red;">' + val + '</span>';
                            } else if (val == "正在打印") {
                                return '<span style="color:blue;">' + val + '</span>';
                            } else {
                               return '<span style="color:gray;">' + val + '</span>';
                            }
                            return val;                          
                          };
                        
                          var dyzt_grid = new Ext.grid.GridPanel({
                               // more config options clipped //,
                               //title: '虚拟打印',
                               store: dyzt_store,
                               id : 'dyzt_grid_id',
                               iconCls:'print',
                               border : false, 
                               columns: [{
                                   xtype: 'gridcolumn',
                                   dataIndex: 'id',
                                   hidden: true
                                 },
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'dydh',
                                   text: '档号',
                                   width: 60
                                 },                                  
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'mlh',
                                   text: '目录号',
                                   width: 60
                                 },                                  
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'qajh',
                                   text: '起案件号',
                                   width: 60
                                 },                                  
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'zajh',
                                   text: '止案件号',
                                   width: 60
                                 },                                  
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'dqjh',
                                   text: '当前件号',
                                   width: 60
                                 },                                  
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'dylb',
                                   text: '打印选项',
                                   width: 60
                                 },
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'dyzt',
                                   text: '打印状态',
                                   width: 60,
                                   renderer : dyztRender
                               }],
                               selType:'checkboxmodel',
                               multiSelect:true,
                               viewConfig: {
                                 stripeRows:true
                               },
                               tbar : [{
                                   text : '添加任务',
                                   handler : function() {
                                     select = archiveGrid.selModel.selected.items[0];
                                     if (select == undefined) {
                                       msg('提示','请先选择一个案卷');
                                     } else {
                                      
                                        var add_print_task = function() {

                                          var printPanel = new Ext.form.FormPanel({
                                            id : 'print_panel_id',
                                            labelWidth:40,
                                            //bodyStyle:"padding:35px;",
                                            bodyPadding: 10,
                                            items:[
                                            {
                                              xtype:"textfield",
                                              name:"qzh",
                                              fieldLabel:"全宗号",
                                              anchor:"95%"
                                            },{
                                              xtype:"textfield",
                                              name:"mlh",
                                              fieldLabel:"目录号",
                                              anchor:"95%"
                                            },{
                                              xtype:"textfield",
                                              name:"dalb",
                                              fieldLabel:"档案类别",
                                              anchor:"95%"
                                            },{
                                              xtype:"textfield",
                                              name:"qajh",
                                              fieldLabel:"始案件号",
                                              anchor:"95%"
                                            },{
                                              xtype:"textfield",
                                              name:"zajh",
                                              fieldLabel:"止案件号",
                                              anchor:"95%"
                                            },{
                                              xtype: 'checkboxmodel',
                                              fieldLabel: '打印范围',
                                              // Arrange radio buttons into two columns, distributed vertically
                                              columns: 4,
                                              name:"dyfw",
                                              //height: 50,
                                              vertical: true,
                                              anchor:"95%",
                                              items: [
                                                { boxLabel: '封面', name: 'dylb-1',  checked: true},
                                                { boxLabel: '卷内', name: 'dylb-2',  checked: true},
                                                { boxLabel: '图像', name: 'dylb-3',  checked: false},
                                                { boxLabel: '备考', name: 'dylb-4',  checked: true}
                                              ]
                                            }
                                            ]        
                                          });

                                          var addPrintWin = new Ext.Window({
                                            id : 'print_wizard_win',
                                            iconCls : 'print',
                                            title: '打印向导',
                                            floating: true,
                                            shadow: true,
                                            draggable: true,
                                            modal: false,
                                            width: 400,
                                            height: 300,
                                            layout: 'fit',
                                            plain: true,
                                            items:printPanel,
                                            tbar : [{
                                                text : '下一个目录',
                                                handler : function() {
                                                  var form = Ext.getCmp('print_panel_id').getForm();
                                                  pars = form.getValues();
                                                  new Ajax.Request("/desktop/get_next_mulu", { 
                                                    method: "POST",
                                                    parameters: pars,
                                                    onComplete:  function(request) {
                                                      data = eval(request.responseText);
                                                      if (data.zajh > 0) {
                                                        form.findField('dalb').setValue(data.dalb);
                                                        form.findField('mlh').setValue(data.mlh);
                                                        form.findField('qajh').setValue(data.qajh);
                                                        form.findField('zajh').setValue(data.zajh);
                                                      }
                                                    }
                                                  });
                                                }
                                              },'-',{
                                                text : '上一个目录',
                                                hander : function() {
                                                  var form = Ext.getCmp('print_panel_id').getForm();
                                                  pars = form.getValues();
                                                  new Ajax.Request("/desktop/get_prev_mulu", { 
                                                    method: "POST",
                                                    parameters: pars,
                                                    onComplete:  function(request) {

                                                    }
                                                  });
                                                }
                                            }],
                                            buttons: [{
                                              text: '添加目录',
                                              handler: function() {
                                                var form = Ext.getCmp('print_panel_id').getForm();
                                                pars = form.getValues();
                                                new Ajax.Request("/desktop/add_print_task", { 
                                                  method: "POST",
                                                  parameters: pars,
                                                  onComplete:  function(request) {
                                                    dyzt_store.load();
                                                  }
                                                });
                                              }
                                            },{
                                              text: '添加全部',
                                              handler : function () {
                                                var form = Ext.getCmp('print_panel_id').getForm();
                                                pars = form.getValues();
                                                new Ajax.Request("/desktop/add_print_task_all", { 
                                                  method: "POST",
                                                  parameters: pars,
                                                  onComplete:  function(request) {
                                                    dyzt_store.load();
                                                  }
                                                });
                                              }
                                            },{
                                              text: '关闭',
                                              handler : function() {
                                                Ext.getCmp('print_wizard_win').close();
                                                dyzt_store.load();
                                              }
                                            }]
                                          });
                                          addPrintWin.show();
                                        };
                                      
                                        add_print_task();
                                      
                                        //设置
                                        var node = archiveGrid.selModel.selected;
                                      
                                        if (node.length > 0) {
                                          data = node.items[0].data;
                                          //get
                                          var form =Ext.getCmp('print_panel_id').getForm();
                                          form.findField('qzh').setValue(data.qzh);
                                          form.findField('mlh').setValue(data.mlh);
                                          form.findField('dalb').setValue(data.dalb);

                                          form.findField('qajh').setValue("1");
                                          form.findField('zajh').setValue(archive_store.totalCount);
                                        
                                        }

                                     }
                                   }
                                 },'-',{
                                   text : '删除选择',
                                   handler : function() {
                                     items = Ext.getCmp('dyzt_grid_id').getSelectionModel().selected.items;
                                     id_str = '';
                                     for (var i=0; i < items.length; i ++) {
                                       if (i==0) {
                                         id_str = id_str+items[i].data.id 
                                       } else {
                                         id_str = id_str + ',' +items[i].data.id 
                                       }
                                     
                                     }
                                     pars = {id:id_str};
                                     new Ajax.Request("/desktop/delete_print_task", { 
                                       method: "POST",
                                       parameters: pars,
                                       onComplete:  function(request) {
                                         dyzt_store.load();
                                       }
                                     });
                                   }
                                 },'-',{
                                   text : '删除完成',
                                   handler : function() {
                                     //id = Ext.getCmp('dyzt_grid_id').getSelectionModel().selected.items[0].data.id;
                                     pars = {};
                                     new Ajax.Request("/desktop/delete_all_print_task", { 
                                       method: "POST",
                                       parameters: pars,
                                       onComplete:  function(request) {
                                         dyzt_store.load();
                                       }
                                     });
                                   }
                                 },'-', {
                                   text : '刷新',
                                   iconCls : 'x-tbar-loading',
                                   handler : function() {
                                     dyzt_store.load();
                                   }                                 
                               }]
                          }); 
                          
                          //图像导入态Grid
                          Ext.regModel('drzt_model', {
                            fields: [
                              {name: 'id',     type: 'integer'},
                              {name: 'dh',     type: 'string'},
                              {name: 'mlh',    type: 'string'},
                              {name: 'lj',     type: 'string'},
                              {name: 'dqz',    type: 'string'},
                              {name: 'zs',     type: 'string'},
                              {name: 'zt',     type: 'string'}
                            ]
                          });
                          var drzt_store =  Ext.create('Ext.data.Store', {
                            model : 'drzt_model',
                            proxy: {
                              type: 'ajax',
                              url : '/desktop/get_drzt_store',
                              extraParams: {id:""},
                              reader: {
                                type: 'json',
                                root: 'rows',
                                totalProperty: 'results'
                              }
                            }
                          });
                          drzt_store.load();
                          var drzt_grid = new Ext.grid.GridPanel({
                               title: '图像导入',
                               iconCls : 'import',
                               store: drzt_store,
                               id : 'drzt_grid_id',
                               columns :[
                               	 { text : 'id',	width : 0, sortable : true, dataIndex: 'id', hidden: true},
                               	 { text : '档号',	width : 80, sortable : true, dataIndex: 'dh'},
                               	 { text : '目录号',	width : 60, sortable : true, dataIndex: 'mlh'},
                               	 { text : '倒入路径',	width : 150, sortable : true, dataIndex: 'lj'},
                               	 { text : '已入库',	width : 60, sortable : true, dataIndex: 'dqz'},
                               	 { text : '图像总数',	width : 60, sortable : true, dataIndex: 'zs'},
                               	 { text : '状态',	width : 100, sortable : true, dataIndex: 'zt'}
                               ],
                               selType:'checkboxmodel',
                               multiSelect:true,
                               viewConfig: {
                                 stripeRows:true
                               },
                               tbar : [{
                                   text : '添加任务',
                                   handler : function() {
                                     select = archiveGrid.selModel.selected.items[0];
                                     if (select == undefined) {
                                       msg('提示','请先选择一个案卷');
                                     } else {

                                        var add_import_task = function() {
                                          var importPanel = new Ext.form.FormPanel({
                                            id : 'import_panel_id',
                                            labelWidth:40,
                                            //bodyStyle:"padding:35px;",
                                            bodyPadding: 10,
                                            items:[
                                            {
                                              xtype:"textfield",
                                              name:"qzh",
                                              fieldLabel:"全宗号",
                                              anchor:"95%"
                                            },{
                                              xtype:"textfield",
                                              name:"mlh",
                                              fieldLabel:"目录号",
                                              anchor:"95%"
                                            },{
                                              xtype:"textfield",
                                              name:"dalb",
                                              fieldLabel:"档案类别",
                                              anchor:"95%"
                                            },{
                                              xtype:"textfield",
                                              name:"drlj",
                                              fieldLabel:"倒入路径",
                                              anchor:"95%"
                                            }
                                            ]        
                                          });

                                          var addImportWin = new Ext.Window({
                                            id : 'import_wizard_win',
                                            iconCls : 'import',
                                            title: '导入向导',
                                            floating: true,
                                            shadow: true,
                                            draggable: true,
                                            modal: false,
                                            width: 400,
                                            height: 300,
                                            layout: 'fit',
                                            plain: true,
                                            items:importPanel,
                                            tbar : [{
                                                text : '下一个目录',
                                                handler : function() {
                                                  var form = Ext.getCmp('import_panel_id').getForm();
                                                  pars = form.getValues();
                                                  new Ajax.Request("/desktop/get_next_mulu", { 
                                                    method: "POST",
                                                    parameters: pars,
                                                    onComplete:  function(request) {
                                                      data = eval(request.responseText);
                                                      if (data.zajh > 0) {
                                                        form.findField('dalb').setValue(data.dalb);
                                                        form.findField('mlh').setValue(data.mlh);
                                                      }
                                                    }
                                                  });
                                                }
                                              },'-',{
                                                text : '上一个目录',
                                                hander : function() {
                                                  var form = Ext.getCmp('import_panel_id').getForm();
                                                  pars = form.getValues();
                                                  new Ajax.Request("/desktop/get_prev_mulu", { 
                                                    method: "POST",
                                                    parameters: pars,
                                                    onComplete:  function(request) {

                                                    }
                                                  });
                                                }
                                            }],
                                            buttons: [{
                                              text: '添加目录',
                                              handler: function() {
                                                var form = Ext.getCmp('import_panel_id').getForm();
                                                pars = form.getValues();
                                                new Ajax.Request("/desktop/add_import_task", { 
                                                  method: "POST",
                                                  parameters: pars,
                                                  onComplete:  function(request) {
                                                    drzt_store.load();
                                                  }
                                                });
                                              }
                                            },{
                                              text: '添加全部',
                                              handler : function () {
                                                var form = Ext.getCmp('print_panel_id').getForm();
                                                pars = form.getValues();
                                                new Ajax.Request("/desktop/add_import_task_all", { 
                                                  method: "POST",
                                                  parameters: pars,
                                                  onComplete:  function(request) {
                                                    drzt_store.load();
                                                  }
                                                });
                                              }
                                            },{
                                              text: '关闭',
                                              handler : function() {
                                                Ext.getCmp('import_wizard_win').close();
                                                drzt_store.load();
                                              }
                                            }]
                                          });
                                          addImportWin.show();
                                        };

                                        add_import_task();

                                        //设置
                                        var node = archiveGrid.selModel.selected;

                                        if (node.length > 0) {
                                          data = node.items[0].data;
                                          //get
                                          var form =Ext.getCmp('import_panel_id').getForm();
                                          form.findField('qzh').setValue(data.qzh);
                                          form.findField('mlh').setValue(data.mlh);
                                          form.findField('dalb').setValue(data.dalb);
                                        }
                                     }
                                   }
                                 },'-',{
                                   text : '删除选择',
                                   iconCls : 'delete',
                                   handler : function() {
                                     id = Ext.getCmp('drzt_grid_id').getSelectionModel().selected.items[0].data.id;
                                     pars = {id:id}
                                     new Ajax.Request("/desktop/delete_import_task", { 
                                       method: "POST",
                                       parameters: pars,
                                       onComplete:  function(request) {
                                         drzt_store.load();
                                       }
                                     });
                                   }
                                 },'-',{
                                   text : '删除完成',
                                   handler : function() {
                                     pars = {};
                                     new Ajax.Request("/desktop/delete_all_import_task", { 
                                       method: "POST",
                                       parameters: pars,
                                       onComplete:  function(request) {
                                         drzt_store.load();
                                       }
                                     });
                                   }
                                 },'-', {
                                   text : '刷新目录',
                                   iconCls : 'x-tbar-loading',
                                   handler : function() {
                                     drzt_store.load();
                                   }                                 
                               }]
                          }); 
                          
                          
                          

                        
                          var dyztPanel = new Ext.form.FormPanel({
                            id : 'dyzt_panel_id',
                            labelWidth:40,
                            //bodyStyle:"padding:35px;",
                            //bodyPadding: 3,
                            items:dyzt_grid
                            /*items:[{
                                xtype: 'tabpanel',
                                height: 280,
                                activeTab: 0,
                                items: [
                                  dyzt_grid
                                ]
                            }]    */    
                          });

                          var dyztWin = new Ext.Window({
                            id : 'dyzt_win',
                            iconCls : 'print',
                            title: '打印状态',
                            floating: true,
                            shadow: true,
                            draggable: true,
                            modal: true,
                            width: 500,
                            height: 350,
                            layout: 'fit',
                            plain: true,
                            border: false,
                            items: dyzt_grid,
                            buttons: [{
                              text: '打印',
                              handler: function() {
                                var pars={id:archive_id};
                                new Ajax.Request("/desktop/start_print_task", { 
                                  method: "POST",
                                  parameters: pars,
                                  onComplete:  function(request) {
                                    dyzt_store.load();
                                  }
                                });
                              }
                            },{
                              text: '关闭',
                              handler : function() {
                                Ext.getCmp('dyzt_win').close();
                              }
                            }]
                          });

                          dyztWin.show();
                        
                        }

                        print_status();
                      
                      }
                    },'-',
                    { 
                      text:'封面',
                      tooltip:'',
                      iconCls:'add',
                      hidden:true,
                      handler: function() {
                        var pars={id:archive_id};
                        new Ajax.Request("/desktop/generate_fm", 
                          { method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              var path = request.responseText;
                              if (path != '') { 
                                Ext.getCmp('preview_img').getEl().dom.src = path;
                              }
                            }
                          }); 
                      }
                    },{
                      text:'卷内',
                      tooltip:'',
                      iconCls:'add',
                      hidden:true,
                      handler: function() {
                        var pars={id:archive_id};
                        new Ajax.Request("/desktop/generate_jn", 
                          { method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              var path = request.responseText;
                              if (path != '') { 
                                Ext.getCmp('preview_img').getEl().dom.src = path;
                              }
                            }
                          });
                      }
                    },{
                      text:'备考',
                      tooltip:'',
                      iconCls:'add',
                      hidden:true,
                      handler: function() {
                        var pars={id:archive_id};
                        new Ajax.Request("/desktop/generate_bk", 
                          { method: "POST",
                            parameters: pars,
                            onComplete:  function(request) {
                              var path = request.responseText;
                              if (path != '') { 
                                Ext.getCmp('preview_img').getEl().dom.src = path;
                              }
                            }
                          });
                      }
                    },{
                      text:'内页',
                      tooltip:'',
                      iconCls:'add',
                      hidden:true,
                      handler: function() {
                        var pars={id:archive_id};
                        new Ajax.Request("/desktop/generate_sm", { 
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
                    },{
                      text:'封面套打',
                      tooltip:'',
                      iconCls:'x-tree-icon-leaf',
                      handler: function() {

                        var print_setting = function() {
                        
                          Ext.regModel('ptemplate_model', {
                            fields: [
                              {name: 'mbmc',     type: 'string'}
                            ]
                          });

                          var ptemplate_store =  Ext.create('Ext.data.Store', {
                            model : 'ptemplate_model',
                            proxy: {
                              type: 'ajax',
                              url : '/desktop/get_p_template',
                              extraParams: {},
                              reader: {
                                type: 'json',
                                root: 'rows',
                                totalProperty: 'results'
                              }
                            }
                          });

                          ptemplate_store.on('load',function(ds,records,o){
                            combo = Ext.getCmp('psetting_combo');
                            combo.setValue(records[0].data.mbmc);
                          
                            p_setting_store.proxy.extraParams.mbmc=records[0].data.mbmc;
                            p_setting_store.load();
                          });
                        
                        
                          Ext.regModel('p_setting_model', {
                            fields: [
                              {name: 'id',    type: 'integer'},
                              {name: 'mbmc',    type: 'string'},
                              {name: 'mblb',    type: 'string'},
                              {name: 'zdmc',   type: 'string'},
                              {name: 'ztdx',   type: 'string'},
                              {name: 'sptz',   type: 'string'},
                              {name: 'cztz',    type: 'string'},
                              {name: 'locx',   type: 'string'},
                              {name: 'locy',    type: 'string'},
                              {name: 'dy',      type: 'bool'}
                            ]
                          });
                        
                          p_setting_store = Ext.create('Ext.data.Store', {
                            model : 'p_setting_model',
                            proxy: {
                              type: 'ajax',
                              url : '/desktop/get_p_setting',
                              extraParams: {mbmc:""},
                              reader: {
                                type: 'json',
                                root: 'rows',
                                totalProperty: 'results'
                              }
                            }
                          });
                        
                          ptemplate_store.load();
                        
                          var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                              clicksToEdit: 1
                          });
                        
                        
                          var p_grid = new Ext.grid.GridPanel({
                               // more config options clipped //,
                               title: '封面设置',
                               store: p_setting_store,
                               columns: [{
                                   xtype: 'gridcolumn',
                                   dataIndex: 'mbmc',
                                   text: '模板名称',
                                   width: 60, 
                                   editor: {
                                     allowBlank: false
                                   }
                                 },
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'mblb',
                                   text: '模板类别',
                                   width: 60, 
                                   editor: {
                                     allowBlank: false
                                   }
                                 },                                  
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'zdmc',
                                   text: '字段名称',
                                   width: 60,
                                   editor: {
                                     allowBlank: false
                                   }
                                 },                                  
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'ztdx',
                                   text: '字体大小',
                                   width: 60,
                                   editor: {
                                     allowBlank: false
                                   }
                                 },                                  
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'sptz',
                                   text: '水平调整',
                                   width: 60,
                                   editor: {
                                     allowBlank: false
                                   }
                                 },
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'cztz',
                                   text: '垂直调整',
                                   width: 60,
                                   editor: {
                                     allowBlank: false
                                   }
                                 },
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'locx',
                                   text: '水平位置',
                                   width: 60,
                                   editor: {
                                     allowBlank: false
                                   }
                                 },
                                 {
                                   xtype: 'gridcolumn',
                                   dataIndex: 'locy',
                                   text: '垂直位置',
                                   width: 60,
                                   editor: {
                                     allowBlank: false
                                   }
                                 },                                  
                                 {
                                   xtype: 'datecolumn',
                                   dataIndex: 'date',
                                   text: 'Date',
                                   hidden : true,
                                   editor: {
                                       xtype: 'datefield',
                                       format: 'm/d/y',
                                       minValue: '01/01/06',
                                       disabledDays: [0, 6],
                                       disabledDaysText: 'Plants are not available on the weekends'
                                   }
                                 },
                                 {
                                   xtype: 'checkcolumn',
                                   dataIndex: 'dy',
                                   width : 50,
                                   text: '打印?'
                               }],
                               selModel : {selType:'cellmodel'},
                               viewConfig: {
                                 stripeRows:true
                               },
                               tbar : [{
                                 xtype: 'combo',
                                 x: 130,
                                 y: 190,
                                 width: 100,
                                 name: 'yxbh',
                                 id: 'psetting_combo',
                                 store: ptemplate_store,
                                 emptyText:'请选择',
                                 mode: 'local',
                                 minChars : 2,
                                 valueField:'mbmc',
                                 displayField:'mbmc',
                                 triggerAction:'all',
                                 listeners:{
                                   select:function(combo, record, index) {
                                     var pars={mbbc: record[0].data.mbbc};
                                   }
                                 }
                               },{
                                 text: '增加字段',
                                 handler : function(){
                                     var r = Ext.create('p_setting_model', {
                                         mbmc: '新模板',
                                         mblb: '封面',
                                         zdmc: '',
                                         ztdx: '48',
                                         sptz: '0',
                                         cztz: '0',
                                         locx: '0',
                                         locy: '0',
                                         dy: true
                                     });
                                     p_setting_store.insert(0, r);
                                     cellEditing.startEditByPosition({row: 0, column: 0});
                                 }
                               },{
                                   text:'新增模板',
                                   tooltip:'',
                                   iconCls:'add',
                                   handler: function() {
                                     add_muluwin();

                                     if (tree_id != 0) {
                                       ss = tree_id.split('|');
                                       var form =Ext.getCmp('mulu_panel_id').getForm();
                                       form.findField('qzh').setValue(ss[0]);
                                       form.findField('dwdm').setValue(ss[0]);
                                       form.findField('dalb').setValue(ss[1]);
                                     }  
                                   }
                               }],
                               plugins:[cellEditing],
                               listeners: {
                                 afteredit: function(e){
                                   if (e.field == 'director' && e.value == 'Mel Gibson'){
                                     Ext.Msg.alert('Error','Mel Gibson movies not allowed');
                                     e.record.reject();
                                   }else{
                                     e.record.commit();
                                   }
                                }
                              }
                          }); 
                        
                        
                          var printPanel = new Ext.form.FormPanel({
                            id : 'print_panel_id',
                            labelWidth:40,
                            //bodyStyle:"padding:35px;",
                            bodyPadding: 3,
                            items:[{
                                xtype: 'tabpanel',
                                height: 250,
                                activeTab: 0,
                                items: [p_grid,{

                                },{

                                }]
                            }]        
                          });
                        
                        
                          //this.el.on("keypress", keyPress, this);
                          p_grid.on("afteredit", function(e){
                            pars = {id:e.record.id, field:e.field, value:e.value};
                            new Ajax.Request("/desktop/update_p_field", { 
                              method: "POST",
                              parameters: pars,
                              onComplete:  function(request) {

                              }
                            });
                          }, this);
                        
                          var printWin = new Ext.Window({
                            id : 'print_output_win',
                            iconCls : 'print',
                            title: '打印输出',
                            floating: true,
                            shadow: true,
                            draggable: true,
                            //closeAction:'hide',
                            //minimizable:true,
                            //closable: false,
                            modal: false,
                            width: 400,
                            height: 300,
                            layout: 'fit',
                            plain: true,
                            items:printPanel,
                            buttons: [{
                              text: '打印',
                              handler: function() {
                                var dqaj = 0;

                                var p = Ext.getCmp('print_progressbar_id');
                                var form = Ext.getCmp('print_panel_id').getForm();
                                pars = form.getValues();
                                new Ajax.Request("/desktop/print_wizard", { 
                                  method: "POST",
                                  parameters: pars,
                                  onComplete:  function(request) {
                                    Ext.TaskManager.start(pr_task);
                                  }
                                });

                              }
                            },{
                              text: '隐藏',
                              handler : function() {
                                Ext.getCmp('print_output_win').hide();
                                Ext.TaskManager.stop(pr_task);
                              }
                            }]
                          });
                        
                          printWin.show();
                        }
                      
                        //call print_setting()
                        print_setting();

                      }                    
                    },
                    '->',
                    new Ext.form.TextField({
                      width:200,
                      enableKeyEvents: true,
                      hidden : true, 
                      initEvents: function() { 
                        var keyPress = function(e){ 
                          if (e.getKey() == e.ENTER) { 
                            
                          }
                        }; 
                        this.el.on("keypress", keyPress, this);
                      }
                    }),
                  ],
                  items:[{
                    layout:"fit",
                    items: archiveGrid, 
                    border : false
                  }]
                },
                {
                    region:"south",
                    height:200,
                    layout:"fit",
                    split:true,
                    collapsible:true,
                    autoScroll : true,
                    collapseMode:'mini',
    								hideCollapseTool:true,
                    items:[{
                      layout:"fit",
                      items: documentGrid, 
                      border : false
                    }]
                  }]
              }]
            },
            {
              region:"west",
              title:"档案目录",
              width:200,
              border: false,
              split:true,
              layout:"fit",
              margins: '0 0 0 5',
              items:[{
                layout:"border",
                border: false,
                items:[
                {
                  region:"center",
                  layout:"fit",
                  //height:800,
                  split:true,
                  tbar :[{
                    text:'新增档案',
                    tooltip:'',
                    iconCls:'add',
                    handler: function() {
                      add_muluwin();
                      if (tree_id != 0) {
                        ss = tree_id.split('|');
                        var form =Ext.getCmp('mulu_panel_id').getForm();
                        form.findField('qzh').setValue(ss[0]);
                        form.findField('dwdm').setValue(ss[0]);
                        form.findField('dalb').setValue(ss[1]);
                      }  
                    }
                  }, {
                    xtype:"textfield",
                    id:"tree_panel_style",
                    hidden:true,
                    value : '0'                 
                  },'-', {
                    text:'',
                    iconCls:'x-tbar-loading',
                    handler : function () {
                      if (Ext.getCmp('tree_panel_style').getValue() == '0') {
                        Ext.getCmp('tree_panel_style').setValue("1");
                        tree_store.getRootNode().removeAll();
                        tree_store.proxy.extraParams.style="1";
                        tree_store.load();
                      } else {
                        Ext.getCmp('tree_panel_style').setValue("0");
                        tree_store.getRootNode().removeAll();
                        tree_store.proxy.extraParams.style="0";
                        tree_store.load();
                      }
                    }
                  },
                  {
                    text:'上传影像',
                    tooltip:'',
                    iconCls:'add',
                    hidden:true,
                    handler: function() {
                      //add_jumpLoader();
                      show_origin();
                    
                      var draw = function(scale, translatePos, imageObj){
                        var canvas = document.getElementById("myCanvas");
                        var context = canvas.getContext("2d");

                        // clear canvas
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.save();

                        context.translate(translatePos.x, translatePos.y);
                        context.scale(scale, scale);
                      
                        imageObj.onload = function(){
                          var centerX = translatePos.x + canvas.width / 2, centerY = translatePos.y + canvas.height / 2;
                          imgW = imageObj.width;
                          imgH = imageObj.height;
                          context.drawImage(imageObj, centerX - imgW * scale/2.0, centerY - imgH * scale/2.0, imgW * scale, imgH * scale );
                        
                          // inverse Photo
                          /*
                          var imageData = context.getImageData(0,0, imgW*scale, imgH*scale);
                          var pixels = imageData.data;
                          var numPixels = pixels.length/8;
                        
                          for (var i=0; i < numPixels; i ++) {
                            pixels[i*4] = 255-pixels[i*4];
                            pixels[i*4+1] = 255-pixels[i*4+1];
                            pixels[i*4+2] = 255-pixels[i*4+2];
                          }
                        
                          context.putImageData(imageData, 0, 0);
                          */
                        
                          //tiles
                       
                          var imageData = context.getImageData(0,0, imgW, imgH);
                          var pixels = imageData.data;
                          //context.clearRect(0, 0, imgW*scale, imgH*scale);
                          var numTileRows = 80; 
                          var numTileCols = 53;
                          var tileWidth = imageData.width/numTileCols; 
                          var tileHeight = imageData.height/numTileRows;
                          for (var r = 0; r < numTileRows; r++) {
                            for (var c = 0; c < numTileCols; c++) {
                              var x = (c*tileWidth)+(tileWidth/2); 
                              var y = (r*tileHeight)+(tileHeight/2);
                              var pos = (Math.floor(y)*(imageData.width*4))+(Math.floor(x)*4);
                              var red = pixels[pos];
                              var green = pixels[pos+1]; 
                              var blue = pixels[pos+2];
                              context.fillStyle = "rgb("+red+", "+green+", "+blue+")"; 
                            
                              context.beginPath();
                              context.arc(x, y, tileWidth/2, 0, Math.PI*2, false); context.closePath();
                              context.fill();
                            
                              //context.fillRect(x-(tileWidth/2), y-(tileHeight/2), tileWidth, tileHeight);
                            }; 
                          };
                       
                        };

                        imgW = imageObj.width;
                        imgH = imageObj.height;
                        var centerX = canvas.width / scale / 2, centerY = canvas.height / scale / 2;
                        context.drawImage(imageObj, centerX - imgW * scale/2.0, centerY - imgH * scale/2.0, imgW * scale, imgH * scale );
                      
                        // inverse Photo
                        /*
                        var imageData = context.getImageData(0,0, imgW*scale, imgH*scale);
                        var pixels = imageData.data;
                        var numPixels = pixels.length/8;
                      
                        for (var i=0; i < numPixels; i ++) {
                          pixels[i*4] = 255-pixels[i*4];
                          pixels[i*4+1] = 255-pixels[i*4+1];
                          pixels[i*4+2] = 255-pixels[i*4+2];
                        }
                      
                        context.putImageData(imageData, 0, 0);
                        */
                      
                        //tiles
                        //tiles
                     
                        var imageData = context.getImageData(0,0, imgW, imgH);
                        var pixels = imageData.data;
                        //context.clearRect(0, 0, imgW*scale, imgH*scale);
                        var numTileRows = 80; 
                        var numTileCols = 53;
                        var tileWidth = imageData.width/numTileCols; 
                        var tileHeight = imageData.height/numTileRows;
                        for (var r = 0; r < numTileRows; r++) {
                          for (var c = 0; c < numTileCols; c++) {
                            var x = (c*tileWidth)+(tileWidth/2); 
                            var y = (r*tileHeight)+(tileHeight/2);
                            var pos = (Math.floor(y)*(imageData.width*4))+(Math.floor(x)*4);
                            var red = pixels[pos];
                            var green = pixels[pos+1]; 
                            var blue = pixels[pos+2];
                            context.fillStyle = "rgb("+red+", "+green+", "+blue+")"; 
                          
                            context.beginPath();
                            context.arc(x, y, tileWidth/2, 0, Math.PI*2, false); context.closePath();
                            context.fill();
                          
                            //context.fillRect(x-(tileWidth/2), y-(tileHeight/2), tileWidth, tileHeight);
                          }; 
                        };
                      
                        context.restore();
                      }
                    
                    
                      var canvas = document.getElementById("myCanvas");
                      var context = canvas.getContext("2d");

                      var translatePos = {
                        x: 0, //canvas.width / 2,
                        y: 0 //canvas.height / 2
                      };

                      var scale = 1.0;
                      var scaleMultiplier = 0.8;
                      var startDragOffset = {};
                      var mouseDown = false;

                      var imageObj = new Image();
                      var image_id = 14; 
                      imageObj.src = "/assets/dady/200002_Suzanne_Stokes_"+image_id+".jpg";

                      // add button event listeners
                      document.getElementById("plus").addEventListener("click", function(){
                        scale /= scaleMultiplier;
                        draw(scale, translatePos, imageObj);
                      }, false);

                      document.getElementById("minus").addEventListener("click", function(){
                        scale *= scaleMultiplier;
                        draw(scale, translatePos, imageObj);
                      }, false);

                      document.getElementById("next").addEventListener("click", function(){
                        if (image_id < 20) {
                          image_id = image_id + 1;
                          imageObj.src = "/assets/dady/200002_Suzanne_Stokes_"+image_id+".jpg";
                          scale = 1.0;
                          //translatePos = {x:0, y:0};
                          draw(scale, translatePos, imageObj);
                        }
                      }, false);

                      document.getElementById("prev").addEventListener("click", function(){
                        if (image_id > 13) {
                          image_id = image_id - 1;
                          scale = 1.0;
                          //translatePos = {x:0, Y:0};
                          imageObj.src ="/assets/dady/200002_Suzanne_Stokes_"+image_id+".jpg";
                          draw(scale, translatePos, imageObj);
                        };
                      }, false);

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

                    }                  
                  }],
                  items:[{
                    //title: '平望',
                    //tbar: favorBar,
                    layout:"fit",
                    autoScroll : true,
                    items: treePanel, 
                    border : false
                  }]
                  }]
                }]
            },
            {
            region:"east",
            title:"图片预览",
            width:350,
            split:true,
            collapsible:true,
            bbar:[
              {
                text:'图像列表',
                tooltip:'',
                //iconCls:'add',
                handler: function() {
                  timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
                  timage_store.load();
                }
              },{
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
                    var pars={gid:records[0].data.id, type:timage_store.proxy.extraParams.type};
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
                        Ext.getCmp('preview_img').getEl().dom.src = path;
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
                        Ext.getCmp('preview_img').getEl().dom.src = path;
                      }
                    }
                  });             
                }
              },
              {
                text: '打印图像',
                handler : function() {
                  LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM'));   
                  LODOP.PRINT_INIT("打印控件功能演示_Lodop功能_打印图片2");
                  //LODOP.ADD_PRINT_BARCODE(0,0,200,100,"Code39","*123ABC4567890*");
                  image_path = Ext.getCmp('preview_img').getEl().dom.src.replace(/-/ig, "_");
                  LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
                  LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
                  LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
                  LODOP.PREVIEW();
                }
              }
            ],
            items:[{
              xtype: 'box', //或者xtype: 'component',
              id: 'preview_img',
              width: 350, //图片宽度
              autoEl: {
                tag: 'img',    //指定为img标签
                alt: ''      //指定url路径
              }
            }]
            
            }]
          }
        ]
      });
    }
    win.show();
    return win;
  }
});

