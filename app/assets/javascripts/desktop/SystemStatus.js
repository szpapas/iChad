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

    var show_image = function() {

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
        modal: true,
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
        {name: 'wcz',      type: 'integer'}, 
        {name: 'mlm',      type: 'string'},
        {name: 'yxwz',     type: 'string'},
        {name: 'dtbl',     type: 'string'}
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
          totalProperty: 'readerlts'
        }
      }
    });

    qzgl_store.proxy.extraParams={qzh:'10',filter:"全部", dalb:""};
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
         //height : 350,
         layout : 'fit',
         columns: [
           { text : 'id',   align:"center", width : 15, sortable : true, dataIndex: 'id', hidden: true},
           { text : '全宗号',  align:"left",  width : 50, sortable : true, dataIndex: 'qzh'},
           { text : '档案类别', align:"left",  width : 50, sortable : true, dataIndex: 'dalb'},
           { text : '目录号',  align:"left",  width : 50, sortable : true, dataIndex: 'mlh'},
           { text : '目录名',  align:"left",  width : 50, sortable : true, dataIndex: 'mlm'},
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
           { text : '大图',   align:"right", width : 40, sortable : true, dataIndex:  'dt'},

           { text : '目录数据', align:"left", width : 150, sortable : true, dataIndex: 'json'},
           { text : '文件路径', align:"left", width : 100, sortable : true, dataIndex: 'yxwz'},
           
           { text : '误差',   align:"left", width : 100, sortable : true, dataIndex: 'wcz'},
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
         tbar : ['<span style=" font-size:12px;font-weight:600;color:#3366FF;">全宗号</span>:&nbsp;&nbsp;',{
            xtype:"textfield",
            id : 'qzh_field',
            name : 'qzh',
            width: 40,
            value: '10',
            listeners:{
              'blur': function(field){
                qzgl_store.proxy.extraParams.qzh=field.getValue();
                qzgl_store.load();
              }
            }           
          },{
              text:'打印统计',
              //tooltip:'打印处理设置 ',
              iconCls:'print',
              split:true,
              //handler: this.toggleTime.createDelegate(this, []),
              menu: 
              {
                  id:'dycl-slelect-menu',
                  //cls:'reading-menu',
                  width:100,
                  items: [{
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
                  }]
              }
          },'-',{
             text : '挂接数据',
             iconCls : 'import',
             handler : function() {
               
               Ext.regModel('sdwj_model', {
                 fields: [
                   {name: 'id',       type: 'integer'},
                   {name: 'dh',       type: 'string'},
                   {name: 'mlh',      type: 'integer'},
                   {name: 'wjma',      type: 'string'},
                   {name: 'wjmb',      type: 'string'}
                 ]
               });

               // 虚拟打印状态Grid
               var sdwj_store =  Ext.create('Ext.data.Store', {
                 model : 'sdwj_model',
                 proxy: {
                   type: 'ajax',
                   url : '/desktop/get_sdwj_store',
                   extraParams: {qzh:""},
                   reader: {
                     type: 'json',
                     root: 'rows',
                     totalProperty: 'results'
                   }
                 }
               });
               
               sdwj_store.load();
               
               var sdwj_grid = new Ext.grid.GridPanel({
                    title: '输档状态',
                    store: sdwj_store,
                    id : 'sdwj_grid_id',
                    iconCls:'task16',
                    columns: [
                      { text : 'id',    align:"center", width : 15, sortable : true, dataIndex: 'id', hidden: true},
                      { text : '缩写',    align:"left",   width : 50, sortable : true, dataIndex: 'dh'},
                      { text : '目录号',   align:"left",  width : 50, sortable : true, dataIndex: 'mlh'},
                      { text : '案卷名',   align:"left", width : 250, sortable : true, dataIndex: 'wjma'},
                      { text : '卷内名',   align:"left", width : 250, sortable : true, dataIndex: 'wjmb'}
                    ],
                    selType:'checkboxmodel',
                    multiSelect:true,
                    viewConfig: {
                      stripeRows:true
                    },
                    tbar : [
                    {
                       text : '删除选择',
                       iconCls: 'delete',
                       handler : function() {
                         items = Ext.getCmp('sdwj_grid_id').getSelectionModel().selected.items;
                         id_str = '';
                         for (var i=0; i < items.length; i ++) {
                           if (i==0) {
                             id_str = id_str+items[i].data.id;
                           } else {
                             id_str = id_str + ',' +items[i].data.id ;
                           }

                         };
                         pars = {id:id_str};
                         new Ajax.Request("/desktop/delete_sdwj", { 
                           method: "POST",
                           parameters: pars,
                           onComplete:  function(request) {
                             sdwj_store.load();
                           }
                         });
                       }
                     },'-',{
                       text : '导入JSON',
                       iconCls : 'import',
                       handler : function() {
                         items = Ext.getCmp('sdwj_grid_id').getSelectionModel().selected.items;
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
                             Ext.getCmp('qzgl_tabpanel_id').setActiveTab(2);
                             qzzt_store.load();
                           }
                         });
                       }
                     },'-',
                     {
                        text : '刷新',
                        iconCls : 'x-tbar-loading',
                        handler : function() {
                          sdwj_store.load();
                        }                                 
                    }]
               }); 

              
              //挂接路径
              Ext.regModel('yxwz_model', {
                fields: [
                  {name: 'id',       type: 'integer'},
                  {name: 'dh',       type: 'string'},
                  {name: 'mlh',      type: 'integer'},
                  {name: 'mlm',      type: 'string'},
                  {name: 'yxwz',      type: 'string'}
                ]
              });

              // 虚拟打印状态Grid
              var yxwz_store =  Ext.create('Ext.data.Store', {
                model : 'yxwz_model',
                proxy: {
                  type: 'ajax',
                  url : '/desktop/get_yxwz_store',
                  extraParams: {qzh:""},
                  reader: {
                    type: 'json',
                    root: 'rows',
                    totalProperty: 'results'
                  }
                }
              });
              
              yxwz_store.load();
              
              var yxwz_grid = new Ext.grid.GridPanel({
                   title: '影像位置',
                   store: yxwz_store,
                   id : 'yxwz_grid_id',
                   iconCls:'task16',
                   columns: [
                     { text : 'id',    align:"center", width : 15, sortable : true, dataIndex: 'id', hidden: true},
                     { text : '档号',    align:"left",   width : 50, sortable : true, dataIndex: 'dh'},
                     { text : '目录号',   align:"left",  width : 50, sortable : true, dataIndex: 'mlm'},
                     { text : '影像位置',   align:"left", width : 250, sortable : true, dataIndex: 'yxwz'}
                   ],
                   selType:'checkboxmodel',
                   multiSelect:true,
                   viewConfig: {
                     stripeRows:true
                   },
                   tbar : [
                   {
                      text : '删除选择',
                      iconCls: 'delete',
                      handler : function() {
                        items = Ext.getCmp('yxwz_grid_id').getSelectionModel().selected.items;
                        id_str = '';
                        for (var i=0; i < items.length; i ++) {
                          if (i==0) {
                            id_str = id_str+items[i].data.id;
                          } else {
                            id_str = id_str + ',' +items[i].data.id ;
                          }

                        };
                        pars = {id:id_str};
                        new Ajax.Request("/desktop/delete_yxwz", { 
                          method: "POST",
                          parameters: pars,
                          onComplete:  function(request) {
                            sdwj_store.load();
                          }
                        });
                      }
                    },'-',{
                      text : '导入影像',
                      iconCls : 'import',
                      handler : function() {
                        items = Ext.getCmp('yxwz_grid_id').getSelectionModel().selected.items;
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
                            Ext.getCmp('qzgl_tabpanel_id').setActiveTab(2);
                            qzzt_store.load();
                          }
                        });
                      }
                    },'-',
                    {
                       text : '刷新',
                       iconCls : 'x-tbar-loading',
                       handler : function() {
                         yxwz_store.load();
                       }                                 
                   }]
              }); 
              
               
              //全宗设定
              var qzsd_win = new Ext.Window({
                id : 'qzsd_win',
                iconCls : 'add',
                title: '数据设定',
                floating: true,
                shadow: true,
                draggable: true,
                closable: true,
                modal: false,
                width: 640,
                height: 500,
                layout: 'absolute',
                plain: true,
                items:[
                  { xtype: 'label',text: '全宗号:',x: 20,y: 10 },
                  { xtype: 'label',text: '全宗全名:',x: 20,y: 40 },
                  { xtype: 'label',text: '全宗简称:',x: 20,y: 70 },
                  { xtype: 'label',text: '全宗缩写:',x: 20,y: 100 },
                  { xtype: 'label',text: '输档文件:',x: 250,y: 10 },
                  { xtype: 'label',text: '影像位置:',x: 250,y: 40 },
                  { xtype: 'label',text: '挂接位置:',x: 250,y: 70 },
                  { xtype: 'textfield', x: 80,y: 10,  name:'qzh' , id:'qzh_id',
                    listeners:{
                      scope: this,
                      'blur': function(field){
                        if (field.getValue().length > 0){
                          var pars = {qzh:field.getValue()};
                          new Ajax.Request("/desktop/check_qzh",
                            { method: "POST",
                              parameters: pars,
                              onComplete: function(request) {
                                var users = eval("("+request.responseText+")");
                                if (users.size() > 0) {
                                  //msg('重要提示', '该目录已经存在，继续操作将删除该目录所有数据！');
                                  user =users[0];
                                  Ext.getCmp('dwdm_id').setValue(user.dwdm);
                                  Ext.getCmp('qzjc_id').setValue(user.dwjc);
                                  Ext.getCmp('qzsx_id').setValue(user.qzsx);
                                }
                              }
                            });
                        }
                      }
                    }
                  },
                  { xtype: 'textfield', x: 80,y: 40,  name:'dwdm', id:'dwdm_id'},
                  { xtype: 'textfield', x: 80,y: 70,  name:'qzjc', id:'qzjc_id'},
                  { xtype: 'textfield', x: 80,y: 100, name:'qzsx', id:'qzsx_id'},
                  {
                    xtype: 'form', id:'sdwj_upload_form',  x: 310,y: 10, width:300,  height : 24,  //输档文件
                    items :[{ xtype : 'fileuploadfield', anchor: '99%', name:'sdwj', emptyText: '选择一个文件...', buttonText: '浏览'},
                    { xtype: 'textfield', name:'dj', id:'sdwj_dj_id', hidden:true} ,
                    { xtype: 'textfield', name:'qzh', id:'sdwj_qzh_id', hidden:true}
                    ]
                  },
                  { xtype: 'textfield', x: 310,y: 40, width:300, name:'yxwz', id:'yxwz_id', emptyText: '//192.168.114.50/jm1'},  //影像位置
                  { xtype: 'textfield', x: 310,y: 70, width:140, name:'gxwz', id:'gxwz_id', emptyText: '/mnt/lh/jm1'},  //挂接位置
                  { xtype: 'textfield', x: 470,y: 70, width:140, name:'gxmm', id:'gxmm_id', emptyText: 'hxgt1234'},  //挂接位置
                  {
                     xtype: 'button',
                     text: '设置全宗',
                     x: 250,
                     y: 105,
                     width: 80,
                     handler : function() {
                       var qzh   = Ext.getCmp('qzh_id').getValue();
                       var dwdm  = Ext.getCmp('dwdm_id').getValue();
                       var dwjc  = Ext.getCmp('qzjc_id').getValue();
                       var qzsx  = Ext.getCmp('qzsx_id').getValue();
                       var pars  = {qzh:qzh, dwdm:dwdm, dwjc:dwjc, qzsx:qzsx};
                       new Ajax.Request("/desktop/add_qzh2",{
                         method: "POST",
                         parameters: pars,
                         onComplete: function(request) {
                            if (request.responseText == 'Success') {
                              msg('提示', '全宗保存成功！');
                            }
                         }
                       });
                     }
                  },
                  {
                    xtype: 'button',
                    text: '上传输档',
                    x: 340,
                    y: 105,
                    width: 80,
                    handler : function() {
                      myForm = Ext.getCmp('sdwj_upload_form').getForm();
                      Ext.getCmp("sdwj_dj_id").setValue(Ext.getCmp('qzsx_id').getValue());
                      Ext.getCmp("sdwj_qzh_id").setValue(Ext.getCmp('qzh_id').getValue());
                      if(myForm.isValid()){
                        form_action=1;
                        myForm.submit({
                          url: '/desktop/upload_sdwj',
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
                  },
                  {
                     xtype: 'button',
                     text: '设定共享',
                     x: 430,
                     y: 105,
                     width: 80,
                     handler: function() {
                       var yxwz  = Ext.getCmp('yxwz_id').getValue();
                       var gxwz  = Ext.getCmp('gxwz_id').getValue();
                       var qzh   = Ext.getCmp('qzh_id').getValue();
                       var passwd= Ext.getCmp('gxmm_id').getValue();
                       var pars = {yxwz:yxwz, gxwz:gxwz, qzh:qzh, password:passwd};
                       new Ajax.Request("/desktop/set_gxml",{
                         method: "POST",
                         parameters: pars,
                         onComplete: function(request) {
                            if (request.responseText == 'Success') {
                              msg('提示', '共享设定成功！');
                            }
                         }
                       });
                       
                     }
                  },
                  {
                     xtype: 'button',
                     text: '刷新目录',
                     x: 520,
                     y: 105,
                     width: 80
                  },
                  {
                    xtype: 'panel',
                    x : 5,
                    y : 140,
                    height : 420,
                    width  : 620,  
                    items : [{
                        xtype: 'tabpanel',
                        id : 'sdwj_tabpanel_id',
                        layout: 'fit',
                        minHeight: 200,
                        activeTab: 0,
                        height: 320,
                        width: 610,
                        items: [sdwj_grid,yxwz_grid]
                    }]
                  }
                 ]
              });
              qzsd_win.show();               
             }

           },'-',{
             text : '影像处理',
             iconCls : 'import',
             split:true,
             menu: {
                width:100,
                items:[{
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
                },'-',{
                  text : '备份影像',
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
                    new Ajax.Request("/desktop/export_selected_backup", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        qzzt_store.load();
                        alert('命令发送成功');
                      }
                    });                    
                  }
                }, {
                  text : '还原影像',
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
                    new Ajax.Request("/desktop/import_selected_backup", { 
                      method: "POST",
                      parameters: pars,
                      onComplete:  function(request) {
                        qzzt_store.load();
                        alert('命令发送成功');
                      }
                    });                    
                  }                  
               }]
             }
           },'-', {
             text : '设置状态',
             iconCls:'',
             handler : function () {
                items = Ext.getCmp('qzgl_grid_id').getSelectionModel().selected.items;
                id_str = '';
                for (var i=0; i < items.length; i ++) {
                  if (i==0) {
                    id_str = id_str+items[i].data.id ;
                  } else {
                    id_str = id_str + ',' +items[i].data.id ;
                  }
                };
                
                var zt = Ext.getCmp('qzsz_combo').rawValue;
                
                if (items.length > 0) {
                   pars = {id:id_str, zt:zt};
                   new Ajax.Request("/desktop/set_qzxx_selected", { 
                     method: "POST",
                     parameters: pars,
                     onComplete:  function(request) {
                       qzgl_store.load();
                     }
                   });
                 }
             }
           },{
              xtype: 'combo',
              x: 130,
              y: 190,
              width: 80,
              text:'著录',
              name: 'qzsz',
              id: 'qzsz_combo',
              store: ajzt_store,
              emptyText:'请选择',
              mode: 'local',
              minChars : 2,
              value:'著录',
              valueField:'text',
              displayField:'text',
              triggerAction:'all',
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
          },{
            xtype:"textfield",
            fieldLabel:"大图比例",
            name:"dtbl"
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
      form.findField('dtbl').setValue(data.dtbl);
      
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

    qzzt_store.proxy.extraParams={qzh:'9'};
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
         layout : 'fit',
         //height : 350,
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
        {name: 'zt',    type: 'string'},
        {name: 'yx_path',    type: 'string'}
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
    };

    var ztRenderer = function(val) {
      if (val == "空卷") {
          return '<span style="color:red;">' + val + '</span>';
      } 
      return val;
    };
    
    function Run(strPath){  
       try{  
           var objShell = new ActiveXObject("wscript.shell");  
           objShell.Run(strPath);  
           objShell = null;  
       }  
       catch(e){
            alert('找不到文件"'+strPath+'"(或它的组件之一)。请确定路径和文件名是否正确.')  
       }  
    };
    
    var ajhRender = function(val) {
      var path2 = val.replace("/mnt/wx/n","N:").replace("/mnt/wx/o","O:").replace(/\//g,"\\");
      var path1 = val.replace("/mnt/wx/n","file:///N:").replace("/mnt/wx/o","file:///O:");
      return '<a href="'+path1+'/" target="_BLANK" >' + path2 + '\\</a>';
    };

    var tree_store = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: 'desktop/get_q_status_tree',
            extraParams: {
              node:"root",userid:currentUser.id
            },
            actionMethods: 'POST'
        }
    });
    
    var treePanel = Ext.create('Ext.tree.Panel', {
      store: tree_store,
      id:'system_status_tree',
      rootVisible: false,
      useArrows: true,
      singleExpand: true,
      autoScroll: true,
      tbar:[
      {
        xtype:'button',
        text:'刷新目录',
        tooltip:'刷新目录',
        iconCls:'refresh',
        handler: function() {
          Ext.getCmp('system_status_tree').store.load();
        }
      }
      ],
      width: 200
    });
    
    
    treePanel.on("select",function(node){ 
      data = node.selected.items[0].data;  // data.id, data.parent, data.text, data.leaf
      ss=data.id.split('|');
      if (ss.length==1) {
        Ext.getCmp('qzh_field').setValue(ss[0]);
      } else if (ss.length==2){
        Ext.getCmp('qzgl_tabpanel_id').setActiveTab(0);
        qzgl_store.proxy.extraParams.qzh=ss[0];
        qzgl_store.proxy.extraParams.filter=ss[1];
        qzgl_store.load();
      } else if  (ss.length>=3) {    //Detail 
        Ext.getCmp('qzgl_tabpanel_id').setActiveTab(1);
        mulu_qz_store.proxy.extraParams.dh=ss[2]; 
        mulu_qz_store.proxy.extraParams.filter='全部'; 
        mulu_qz_store.load();
      }
       
    });

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
        { text : '状态', align:"center", width : 40, sortable : true, dataIndex: 'zt', renderer:ztRenderer},
        { text : '打开', align:"left", width : 200, sortable : true, dataIndex: 'yx_path', renderer:ajhRender}
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
                msg('提示', '任务添加成功！');
              }
            });
          }
        },'-',{
          text:'导入全部空卷',
          iconCls:'',
          handler : function() {
            items = Ext.getCmp('mulu_qz_grid_id').getSelectionModel().selected.items;
            pars = {id:'all', dh:items[0].raw.dh_prefix};
            new Ajax.Request("/desktop/import_selected_timage_aj", { 
              method: "POST",
              parameters: pars,
              onComplete:  function(request) {
                qzzt_store.load();
                msg('提示', '任务添加成功！');
              }
            });
          }
        },'-',{
          text:'修改',
          iconCls:'',
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
            new Ajax.Request("/desktop/balance_selectedmulu_mulu", { 
              method: "POST",
              parameters: pars,
              onComplete:  function(request) {
                qzzt_store.load();
                msg('提示', '修改成功！');
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
        },'-',{
          text:'查看图像',
          iconCls:'',
          handler : function() {
            var items = Ext.getCmp('mulu_qz_grid_id').getSelectionModel().selected.items;
            if (items.length > 0) {
              var item = items[0];
              var dh = items[0].data.dh;
              show_image();
              
              var yxtree_store = Ext.getCmp('yx_show_tree').store;
              yxtree_store.clearOnLoad = false;
              yxtree_store.getRootNode().removeAll() ;
              yxtree_store.proxy.extraParams = {node:"root", dh:item.data.dh};
              yxtree_store.load();
              set_image("/assets/wuxi_pic.png");
            }
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

    //select( Ext.selection.RowModel this, Ext.data.Model record, Number index, Object eOpts )
    mulu_qz_grid.on("select", function(grid, item, i, e){
    });
    
    mulu_qz_grid.on('itemclick', function(grid, item, r){
     // var data = item.data;
     //  var yx_path = data.yx_path.replace("/mnt/wx/n","N:").replace("/mnt/wx/o","O:").replace(/\//g,'\\');
     //  window.prompt ("复制到剪贴版: Ctrl+C, 回车", yx_path);
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
          activeTab: 0,
          items: [qzgl_grid,mulu_qz_grid,qzzt_grid]
      }]        
    });
    
    
    if(!win){
      win = desktop.createWindow({
        id: 'systemstatus',
        title:'档案统计',
        iconCls:'datj16',
        width:1000,
        height:600,
        x : 100,
        y : 50,
        animCollapse:false,
        border: false,
        layout: 'fit',
        hideMode: 'offsets',
        items: [{
          layout:"border",
          items:[{ 
              title:'档案类别',
              region:'west',
              iconCls:'wenshu16',
              xtype:'panel',
              //margins:'5 2 5 5',
              width: 200,
              collapsible:true,//可以被折叠
              layout:'fit',
              split:true,
              items:[treePanel]
            },{
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

