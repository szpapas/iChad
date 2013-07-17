/* 木 要 地村

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


Ext.define('MyDesktop.ArchiveMan', {
  extend: 'Ext.ux.desktop.Module',

  requires: [
    '*',
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.window.MessageBox'
  ],

  id:'archiveman',
  init : function(){
    this.launcher = {
      text: '档案管理',
      iconCls:'archiveman',
      handler : this.createWindow,
      scope: this
    }
  },
  
  createWindow : function(){
    var dh='';
    var imagefx=1; //1代表纵向，２代表横向
    var desktop = this.app.getDesktop();
  var scale1 = 1;
  var scaleMultiplier1 = 0.8;
  var translatePos1 =  { x: 0,y: 0};
  var imageObj1 = new Image();
  
    var canvas_string =
      '<div id="wrapper1" oncontextmenu="return false">'
      +' <canvas id="myCanvas1" width="900" height="1200">'
      +' </canvas>'
      +'</div>';
    var win = desktop.getWindow('archiveman');
  var drawarchive = function(scale, translatePos, imageObj){

   var canvas = document.getElementById("myCanvas1");
   var context = canvas.getContext("2d");
     scale=1
   // clear canvas
  
   context.clearRect(0, 0, canvas.width, canvas.height);
   context.save();

   //context.translate(translatePos.x, translatePos.y);
   //context.scale(scale, scale);

   imageObj.onload = function(){
     //imgW = imageObj.width;
    imgW =Ext.getCmp('imagelist').width;
    
    imgH=imgW*(imageObj.height/imageObj.width);
     //imgH = imageObj.height;
     context.drawImage(imageObj, translatePos.x , translatePos.y , imgW * scale, imgH * scale );
   };

   //imgW = imageObj.width;
   //imgH = imageObj.height;
    imgW =Ext.getCmp('imagelist').width;
    
    imgH=imgW*(imageObj.height/imageObj.width);
   context.drawImage(imageObj, translatePos.x , translatePos.y , imgW * scale, imgH * scale );

   context.restore();
  }

  var set_imagearchive = function(photoURL) {
   var canvas = document.getElementById("myCanvas1");
   var context = canvas.getContext("2d");
   var startDragOffset = {};
   var mouseDown = false;

   //scale = 1.0;
   translatePos1 =  { x: 0,y: 0};
   imageObj1.src = photoURL;


   // add event listeners to handle screen drag
   canvas.addEventListener("mousedown", function(evt){
     mouseDown = true;
     startDragOffset.x = evt.clientX - translatePos1.x;
     startDragOffset.y = evt.clientY - translatePos1.y;
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
       translatePos1.x = evt.clientX - startDragOffset.x;
       translatePos1.y = evt.clientY - startDragOffset.y;
       drawarchive(scale, translatePos1, imageObj1);
     }
   });
   // add event listeners to handle screen drag
   

   drawarchive(scale, translatePos1,imageObj1);
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
        text: '增加影像或附件文件：(支持jpg、tif、zip、rar、doc、ceb、pdf格式)，文件名不能包含空格和单引号。',
        x: 10,
        y: 10,
        width: 100
      },
      {
        xtype: 'fileuploadfield',
        id: 'filedata',
        x: 10,
        y: 45,
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
            filename=myForm._fields.items[0].lastValue.split('\\');
            file=filename[filename.length-1];
            new Ajax.Request("/desktop/get_image_sfcf", { 
                method: "POST",
                parameters: eval("({filename:'" + file + "',dh:'" + dh +"',userid:" + currentUser.id + "})"),
                onComplete:  function(request) {
                  if (request.responseText=='notsort'){
                    alert("您无此类档案影像文件上传的权限。");
                  }else{
                    sfsc=false;
                    if (request.responseText=='true'){
                      Ext.Msg.confirm("提示信息","此卷中文件名为："+file+"的已经存在，是否插入？",function callback(id){
                                  if(id=="yes"){
                          if(myForm.isValid())
                                {
                                    form_action=1;
                                    myForm.submit({
                                      url: '/desktop/upload_file',
                                      waitMsg: '文件上传中...',
                                      success: function(form, action){
                                        var isSuc = action.result.success; 

                                        if (isSuc) {
                                          new Ajax.Request("/desktop/save_image_db", { 
                                            method: "POST",
                                            parameters: eval("({filename:'" + file + "',dh:'" + dh +"',czr:'" + currentUser.id +"',czrname:'" + currentUser.username +"'})"),
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
                        }
                      })
                    }
                    else {
            
                      if(myForm.isValid())
                            {
                                form_action=1;
                                myForm.submit({
                                  url: '/desktop/upload_file',
                                  waitMsg: '文件上传中...',
                                  success: function(form, action){
                                    var isSuc = action.result.success; 
                        
                                    if (isSuc) {
                                      new Ajax.Request("/desktop/save_image_db", { 
                                        method: "POST",
                            parameters: eval("({filename:'" + file + "',dh:'" + dh +"',czr:'" + currentUser.id +"',czrname:'" + currentUser.username +"'})"),
                                        //parameters: eval("({filename:'" + file + "',dh:'" + dh +"'})"),
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
                    }
                  }         
                    
                  }
              });

          } //else
        } //handler
      }] //buttonsj
    });
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

    // Go ahead and create the TreePanel now so that we can use it below
    var AjListFn_zh = function(title,text) {
      
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }else{
                      //alert('O,no');
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
          } ,
           // '->',
           // '<span style=" font-size:12px;font-weight:600;color:#3366FF;">题名查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',id:'query_jr_text'
           // },          
           // {xtype:'button',text:'查询',tooltip:'查询卷内目录',iconCls:'accordion',
           //     handler: function() {
           //       store3.proxy.url="/desktop/get_document_where";
           //       store3.proxy.extraParams.query=Ext.getCmp('query_jr_text').value;
           //       store3.load();
           //     }
           // }
         {
            xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
              handler: function() {
                  var grid = Ext.getCmp('archive_grid');                    
                  var records = grid.getSelectionModel().getSelection();
                  size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                  if (size==1){         
                    size=Ext.getCmp('document_grid').store.count();
                      if (size>0){                                    
                        alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                      }else{
                        var record = records[0];
                        DispJr_model(record.data.id,record.data.dh,false);
                      }
                  }else{
                    alert("请先选择一个案卷目录。");
                  }
                }
         }, 
       {
            xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
            handler: function() {
              showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","rz_manage_grid",title,"",true);
            }
         }
       
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
    　　{ text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
  　　　　　　{ text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
        id : 'archive_grid',
        store: archive_store,
        //multiSelect:false,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],

        tbar:[
          {
            xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_zh(record,true,title);
            }
          } ,
            {
              xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });
              }
            },
            {
              xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_zh(record,false,title);
              }
            }, 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
           // {
           //   xtype: 'combo',
           //   name: 'aj_select',
           //   store: aj_where_field_data,
           //   emptyText:'案卷标题',
           //   mode: 'local',
           //   minChars : 2,
           //   valueField:'text',
           //   displayField:'text',
           //   triggerAction:'all',
           //   id:'aj_select_field'
           // } ,
           // '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',
           //   id:'query_text'
           // } ,         
           // { 
           //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
           //   handler: function() {
           //     console.log(Ext.getCmp('query_text').value);
           //     if(Ext.getCmp('query_text').value != null ){
           //       var grid = Ext.getCmp('archive_grid');
           //       grid.store.proxy.url="/desktop/get_archive_where";
           //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
           //       archive_store.proxy.extraParams.dh=title;
           //       archive_store.load();
           //     }
           //   }
           // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '案卷号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '标题名称',  width : 175, sortable : true, dataIndex: 'tm'},
          { text : '年度',  width : 75, sortable : true, dataIndex: 'nd'},
          { text : '件数',  width : 75, sortable : true, dataIndex: 'js'},
          { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          { text : '起日期',  width : 0, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          //{ text : '止日期',  width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '起年月',  width : 75, sortable : true, dataIndex: 'qny'},
          { text : '止年月',  width : 75, sortable : true, dataIndex: 'zny'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        //set_imagearchive("/assets/dady/fm.jpg");
    set_imagearchive("/assets/dady/fm.jpg");
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

    var AjListFn_zp = function(title,text) {
      
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
            {name: 'sxh',   type: 'string'},
            {name: 'yh',    type: 'string'},
            {name: 'wh',    type: 'string'},
            {name: 'zrz',   type: 'string'},
            {name: 'psrq',    type: 'string',  type: 'date',  dateFormat: 'Y-m-d H:i:s'},
            {name: 'bz',    type: 'string'},
            {name: 'dh',    type: 'string'},
            {name: 'zph',    type: 'string'},
            {name: 'psz',    type: 'string'},
            {name: 'sy',    type: 'string'},
            {name: 'dd',    type: 'string'},
            {name: 'rw',    type: 'string'},
            {name: 'bj',    type: 'string'},
            {name: 'ownerid',   type: 'integer'},
            {name: 'zpid',   type: 'integer'}
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
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispJr_zp(record,true);
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }else{
                      //alert('O,no');
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
                DispJr_zp(model,false);
              });
            }
          } ,
         {
            xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
              handler: function() {
                  var grid = Ext.getCmp('archive_grid');                    
                  var records = grid.getSelectionModel().getSelection();
                  size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                  if (size==1){         
                    size=Ext.getCmp('document_grid').store.count();
                      if (size>0){                                    
                        alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                      }else{
                        var record = records[0];
                        DispJr_model(record.data.id,record.data.dh,false);
                      }
                  }else{
                    alert("请先选择一个案卷目录。");
                  }
                }
         }    , 
           {
                xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                handler: function() {
                  showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                }
             }
          
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '照片号',  width : 30, sortable : true, dataIndex: 'zph'},
          
          { text : '题名',  width : 175, sortable : true, dataIndex: 'tm'},
          { text : '拍摄者',  width : 105, sortable : true, dataIndex: 'psz'},

          { text : '事由',  width : 105, sortable : true, dataIndex: 'sy'},
          { text : '地点',  width : 75, sortable : true, dataIndex: 'dd'},
        　　{ text : '人物',  width : 105, sortable : true, dataIndex: 'rw'},
          { text : '背景',  width : 75, sortable : true, dataIndex: 'bj'},


          { text : '页号',  width : 75, sortable : true, dataIndex: 'yh'},

          { text : '日期',  width : 75, sortable : true, dataIndex: 'psrq',renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '备注',  width : 75, sortable : true, dataIndex: 'bz'},
          { text : 'ownerid',  flex : 1, sortable : true, dataIndex: 'ownerid'},
      { text : 'zpid',  flex : 1, sortable : true, dataIndex: 'zpid'}
          ],
        listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispJr_zp(r,false);
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
        id : 'archive_grid',
        store: archive_store,
        //multiSelect:false,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],

        tbar:[
          {
            xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_zp(record,true,title);
            }
          } ,
            {
              xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });
                
              }
            },
            {
              xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_zp(record,false,title);
              }
            }, 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
           // {
           //   xtype: 'combo',
           //   name: 'aj_select',
           //   store: aj_where_field_data,
           //   emptyText:'案卷标题',
           //   mode: 'local',
           //   minChars : 2,
           //   valueField:'text',
           //   displayField:'text',
           //   triggerAction:'all',
           //   id:'aj_select_field'
           // } ,
           // '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',
           //   id:'query_text'
           // } ,         
           // { 
           //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
           //   handler: function() {
           //     console.log(Ext.getCmp('query_text').value);
           //     if(Ext.getCmp('query_text').value != null ){
           //       var grid = Ext.getCmp('archive_grid');
           //       grid.store.proxy.url="/desktop/get_archive_where";
           //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
           //       archive_store.proxy.extraParams.dh=title;
           //       archive_store.load();
           //     }
           //   }
           // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '案卷号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '标题名称',  width : 175, sortable : true, dataIndex: 'tm'},
          { text : '年度',  width : 75, sortable : true, dataIndex: 'nd'},
          { text : '件数',  width : 75, sortable : true, dataIndex: 'js'},
          { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          { text : '起日期',  width : 0, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '止日期',  width : 0, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '起年月',  width : 75, sortable : true, dataIndex: 'qny'},
          { text : '止年月',  width : 75, sortable : true, dataIndex: 'zny'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
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
                default:
                  DispAj_zp(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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

    
    var AjListFn_cw = function(title,text) {
      
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
        tbar:[{
            xtype:'button',text:'添加',tooltip:'添加卷内目录',iconCls:'add',
            handler: function() {
              var grid = Ext.getCmp('archive_grid_cw');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispJr(record,true);
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除卷内目录',iconCls:'remove',
            handler: function() {
              var grid = Ext.getCmp('document_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];

              var pars="id="+record.data.id;
              Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
                    if(id=="yes"){
                      new Ajax.Request("/desktop/delete_document", { 
                        method: "POST",
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }
                });
            }
          },
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          },
          {
            xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
              handler: function() {
                  var grid = Ext.getCmp('archive_grid_cw');                 
                  var records = grid.getSelectionModel().getSelection();
                  size=Ext.getCmp('archive_grid_cw').getSelectionModel().getSelection().size();
                  if (size==1){         
                    size=Ext.getCmp('document_grid').store.count();
                      if (size>0){                                    
                        alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                      }else{
                        var record = records[0];
                        DispJr_model(record.data.id,record.data.dh,false);
                      }
                  }else{
                    alert("请先选择一个案卷目录。");
                  }
                }
         }    , 
           {
                xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                handler: function() {
                  showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                }
             }

        //  },'->',
        //  {
        //    xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
        //    handler: function() {
        //      showAdvancedSearch();
        //    }
        //  },
        //    '<span style=" font-size:12px;font-weight:600;color:#3366FF;">题名查询</span>:&nbsp;&nbsp;',
        //  {
        //    xtype:'textfield',id:'query_jr_text'
        //  },          
        //  {
        //    xtype:'button',text:'查询',tooltip:'查询卷内目录',iconCls:'accordion',
        //    handler: function() {
        //      store3.proxy.url="/desktop/get_document_where";
        //      store3.proxy.extraParams.query=Ext.getCmp('query_jr_text').value;
        //      store3.load();
        //    }
        //  }

        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'dalb',    type: 'string'},
          {name: 'jnzs',    type: 'string'},
          {name: 'fjzs',    type: 'string'},
          {name: 'pzqh',    type: 'string'},
          {name: 'pzzh',    type: 'string'}
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
        id : 'archive_grid_cw',
        store: archive_store,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],
        tbar:[
                  {
                    xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
                    handler: function() {

                      var grid = Ext.getCmp('archive_grid_cw');
                      var records = grid.getSelectionModel().getSelection();
                      var record = records[0];
                      DispAj_cw(record,true,title);
                    }
                  } ,
                    {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
                      handler: function() {

                        var grid = Ext.getCmp('archive_grid_cw');
                        var records = grid.getSelectionModel().getSelection();
                        var record = records[0];
                        var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                        Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                              if(id=="yes"){
                                new Ajax.Request("/desktop/delete_archive", { 
                                  method: "POST",
                                  parameters: eval(pars),
                                  onComplete:  function(request) {
                                    if (request.responseText=='success'){
                                        Ext.getCmp('archive_grid_cw').store.load();
                                    }else{
                                        alert(request.responseText);
                                    }
                                  }
                                });
                              }
                          });
                        

                      }
                    },
                    {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
                      handler: function() {
                        var grid = Ext.getCmp('archive_grid_cw');
                        var records = grid.getSelectionModel().getSelection();
                        var record = records[0];
                        DispAj_cw(record,false,title);
                      }
                    }   , 
                    {
                        xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                        handler: function() {
                          showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid_cw",title);
                        }
                      }, 
                    {
                      text:'查看图像或附件',
                      iconCls:'',
                      handler : function() {
                        var items = Ext.getCmp('archive_grid_cw').getSelectionModel().selected.items;
                        if (items.length > 0) {
                          var item = items[0];
                          var dh = items[0].data.dh;
                          show_image(dh);               
                          set_image("/assets/dady/fm.jpg");
                        }
                      }    
                    },
                    {
                  text:'备考表',
                  iconCls:'yl',
                  handler : function() {
                    var items = Ext.getCmp('archive_grid_cw').getSelectionModel().selected.items;
                    if (items.length > 0) {
                      var item = items[0];
                      var id = items[0].data.id;
                      DispBkb(id);
                    }
                  }    
                },
                        '->',
                      //  {
                      //    xtype: 'combo',
                      //    name: 'aj_select',
                      //    store: aj_where_field_data,
                      //    emptyText:'案卷标题',
                      //    mode: 'local',
                      //    minChars : 2,
                      //    valueField:'text',
                      //    displayField:'text',
                      //    triggerAction:'all',
                      //    id:'aj_select_field'
                      //  } ,
                      //  '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
                      //  {
                      //    xtype:'textfield',
                      //    id:'query_text',
                      //  } ,         
                      //  { xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
                      //    handler: function() {
                      //      console.log(Ext.getCmp('query_text').value);
                      //      if(Ext.getCmp('query_text').value != null ){
                      //        var grid = Ext.getCmp('archive_grid_cw');
                      //        grid.store.proxy.url="/desktop/get_archive_where";
                      //        archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
                      //        archive_store.load();
                      //      }
                      //    }
                      //  }
                ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '案卷号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '标题名称',  width : 175, sortable : true, dataIndex: 'tm'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          
          { text : '年度',  width : 75, sortable : true, dataIndex: 'nd'},
          { text : '件数',  width : 75, sortable : true, dataIndex: 'js'},
          { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
          
          { text : '卷内张数',   width : 50, sortable : true, dataIndex: 'jnzs'},
          { text : '附件张数',   width : 50, sortable : true, dataIndex: 'fjzs'},
          { text : '凭证起号',  width : 50, sortable : true, dataIndex: 'pzqh'},
          { text : '凭证止号',  width : 50, sortable : true, dataIndex: 'pzzh'},
          
          { text : '起日期',  width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '止日期',  width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '起年月',  width : 75, sortable : true, dataIndex: 'qny'},
          { text : '止年月',  width : 75, sortable : true, dataIndex: 'zny'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '地籍号',  width : 75, sortable : true, dataIndex: 'djh'},
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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

    
    var AjListFn_tddj = function(title,text) {
      
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid_tddj');
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
                       parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
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
          } , 
        {
            xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
              handler: function() {
                  var grid = Ext.getCmp('archive_grid_tddj');                   
                  var records = grid.getSelectionModel().getSelection();
                  size=Ext.getCmp('archive_grid_tddj').getSelectionModel().getSelection().size();
                  if (size==1){         
                    size=Ext.getCmp('document_grid').store.count();
                      if (size>0){                                    
                        alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                      }else{
                        var record = records[0];
                        DispJr_model(record.data.id,record.data.dh,false);
                      }
                  }else{
                    alert("请先选择一个案卷目录。");
                  }
                }
         }    , 
           {
                xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                handler: function() {
                  showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                }
             }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'djh',   type: 'string'},
          {name: 'qlrmc',   type: 'string'},
          {name: 'tdzl',    type: 'string'},
          {name: 'qsxz',    type: 'string'},
          {name: 'ydjh',    type: 'string'},
          {name: 'tdzh',    type: 'string'},
          {name: 'tfh',   type: 'string'},
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
        id : 'archive_grid_tddj',
        store: archive_store,
            bbar:[
              new Ext.PagingToolbar({
                store: archive_store,
                pageSize: 25,
                width : 400,
                border : false,
                displayInfo: true,
                displayMsg: '{0} - {1} of {2}',
                emptyMsg: "没有找到！",
                prependButtons: true
              })
            ],
        tbar:[
          {
            xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
            handler: function() {

              var grid = Ext.getCmp('archive_grid_tddj');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_tddj(record,true,title);
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
            handler: function() {

              var grid = Ext.getCmp('archive_grid_tddj');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
              Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                    if(id=="yes"){
                      new Ajax.Request("/desktop/delete_archive", { 
                        method: "POST",
                        parameters: eval(pars),
                        onComplete:  function(request) {
                            if (request.responseText=='success'){
                            Ext.getCmp('archive_grid_tddj').store.load();
                            }else{
                                alert(request.responseText);
                            }
                        }
                      });
                    }
                });
              
            }
          },
          {
            xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
            handler: function() {
              var grid = Ext.getCmp('archive_grid_tddj');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_tddj(record,false,title);
            }
          },{
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,地籍号;djh,土地座落;tdzl,权利人名称;qlrmc,土地证号;tdzh,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid_tddj",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid_tddj').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid_tddj').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
         // {
         //   xtype: 'combo',
         //   name: 'aj_select',
         //   store: aj_where_field_data,
         //   emptyText:'案卷标题',
         //   mode: 'local',
         //   minChars : 2,
         //   valueField:'text',
         //   displayField:'text',
         //   triggerAction:'all',
         //   id:'aj_select_field'
         // } ,
         //   '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
         // {
         //   xtype:'textfield',
         //   id:'query_text'                        } ,         
         // { 
         //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
         //   handler: function() {
         //     console.log(Ext.getCmp('query_text').value);
         //     if(Ext.getCmp('query_text').value != null ){
         //       var grid = Ext.getCmp('archive_grid_tddj');
         //       grid.store.proxy.url="/desktop/get_archive_where";
         //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
         //       archive_store.load();
         //     }
         //   }
        //  }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '案卷号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '年度',  width : 75, sortable : true, dataIndex: 'nd'},
          { text : '地籍号',  width : 175, sortable : true, dataIndex: 'djh'},
          
          { text : '权利人名称',  width : 175, sortable : true, dataIndex: 'qlrmc'},
          { text : '土地座落',  width : 175, sortable : true, dataIndex: 'tdzl'},
          { text : '权属性质',  width : 175, sortable : true, dataIndex: 'qsxz'},
          { text : '土地证号',  width : 175, sortable : true, dataIndex: 'tdzh'},
          { text : '图幅号',  width : 75, sortable : true, dataIndex: 'tfh'},
          
          { text : '件数',  width : 75, sortable : true, dataIndex: 'js'},
          { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          //{ text : '起日期',  width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          //{ text : '止日期',  width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '起年月',  width : 75, sortable : true, dataIndex: 'qny'},
          { text : '止年月',  width : 75, sortable : true, dataIndex: 'zny'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_tddj(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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

    var AjListFn_kyq = function(title,text) {
      
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid_tddj');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
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
          } , 
        {
            xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
              handler: function() {
                  var grid = Ext.getCmp('archive_grid_tddj');                   
                  var records = grid.getSelectionModel().getSelection();
                  size=Ext.getCmp('archive_grid_tddj').getSelectionModel().getSelection().size();
                  if (size==1){         
                    size=Ext.getCmp('document_grid').store.count();
                      if (size>0){                                    
                        alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                      }else{
                        var record = records[0];
                        DispJr_model(record.data.id,record.data.dh,false);
                      }
                  }else{
                    alert("请先选择一个案卷目录。");
                  }
                }
         }    , 
           {
                xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                handler: function() {
                  showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                }
             }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'djh',   type: 'string'},
          {name: 'qlrmc',   type: 'string'},
          {name: 'tdzl',    type: 'string'},
          {name: 'qsxz',    type: 'string'},
          {name: 'ydjh',    type: 'string'},
          {name: 'tdzh',    type: 'string'},
          {name: 'tfh',   type: 'string'},
          {name: 'dalb',    type: 'string'},
          {name: 'ksmc',    type: 'string'},
          {name: 'kyqr',    type: 'string'},
          {name: 'kswz',   type: 'string'},

          {name: 'xxkz',    type: 'string'},
          {name: 'yxkz',    type: 'string'},
          {name: 'ksbh',   type: 'string'},
          {name: 'ksgm',    type: 'string'},
          {name: 'xzqdm',    type: 'string'},
          {name: 'kz',    type: 'string'},
          {name: 'djlx',   type: 'string'},

          {name: 'kqfw',    type: 'string'},
          {name: 'ksmj',    type: 'string'},
          {name: 'cl',   type: 'string'},
          {name: 'sjncl',    type: 'string'},
          {name: 'clgm',    type: 'string'},
          {name: 'yxqq',    type: 'string'},
          {name: 'yxqz',   type: 'string'},

        {name: 'yxqx',    type: 'string'},
          {name: 'fzjg',    type: 'string'},
          {name: 'mjdw',   type: 'string'},
          {name: 'cldw',    type: 'string'},
          {name: 'scgm',    type: 'string'},
          {name: 'scldw',    type: 'string'},
          {name: 'jjlx',   type: 'string'}
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
        id : 'archive_grid_tddj',
        store: archive_store,
            bbar:[
              new Ext.PagingToolbar({
                store: archive_store,
                pageSize: 25,
                width : 400,
                border : false,
                displayInfo: true,
                displayMsg: '{0} - {1} of {2}',
                emptyMsg: "没有找到！",
                prependButtons: true
              })
            ],
        tbar:[
          {
            xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
            handler: function() {

              var grid = Ext.getCmp('archive_grid_tddj');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_kyq(record,true,title);
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
            handler: function() {

              var grid = Ext.getCmp('archive_grid_tddj');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
              Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                    if(id=="yes"){
                      new Ajax.Request("/desktop/delete_archive", { 
                        method: "POST",
                        parameters: eval(pars),
                        onComplete:  function(request) {
                            if (request.responseText=='success'){
                            Ext.getCmp('archive_grid_tddj').store.load();
                            }else{
                                alert(request.responseText);
                            }
                        }
                      });
                    }
                });
              
            }
          },
          {
            xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
            handler: function() {
              var grid = Ext.getCmp('archive_grid_tddj');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_kyq(record,false,title);
            }
          },{
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,矿业权人;kyqr,矿山名称;ksmc,矿山编号;ksbh,矿山位置;kswz,现许可证号;xxkz,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid_tddj",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid_tddj').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid_tddj').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
         // {
         //   xtype: 'combo',
         //   name: 'aj_select',
         //   store: aj_where_field_data,
         //   emptyText:'案卷标题',
         //   mode: 'local',
         //   minChars : 2,
         //   valueField:'text',
         //   displayField:'text',
         //   triggerAction:'all',
         //   id:'aj_select_field'
         // } ,
         //   '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
         // {
         //   xtype:'textfield',
         //   id:'query_text'                        } ,         
         // { 
         //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
         //   handler: function() {
         //     console.log(Ext.getCmp('query_text').value);
         //     if(Ext.getCmp('query_text').value != null ){
         //       var grid = Ext.getCmp('archive_grid_tddj');
         //       grid.store.proxy.url="/desktop/get_archive_where";
         //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
         //       archive_store.load();
         //     }
         //   }
        //  }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '案卷号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '年度',  width : 75, sortable : true, dataIndex: 'nd'},
          { text : '矿山名称',  width : 175, sortable : true, dataIndex: 'ksmc'},
          
          { text : '矿业权人',  width : 175, sortable : true, dataIndex: 'kyqr'},
          { text : '矿山位置',  width : 175, sortable : true, dataIndex: 'kswz'},
          { text : '矿山编号',  width : 175, sortable : true, dataIndex: 'ksbh'},
          { text : '矿种',  width : 175, sortable : true, dataIndex: 'kz'},
          { text : '矿区范围',  width : 75, sortable : true, dataIndex: 'kqfw'},
          
          { text : '件数',  width : 75, sortable : true, dataIndex: 'js'},
          { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          //{ text : '起日期',  width : 75, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          //{ text : '止日期',  width : 75, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '起年月',  width : 75, sortable : true, dataIndex: 'qny'},
          { text : '止年月',  width : 75, sortable : true, dataIndex: 'zny'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_kyq(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
    
    var AjListFn_wsda = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
                    parameters: {id:record.data.id,userid:currentUser.id},
                    onComplete:  function(request) {
                      Ext.getCmp('document_grid').store.load();

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
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
            width : 400,
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
                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid_wsda').store.load();
                            }else{
                                alert(request.responseText);
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
                DispAj_wsda(record,false,title);
              }
            }   , 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("年度;docnd,保管期限;bgqx,机构问题号;jgwth,件号;jh,题名;doctm,文号;docwh,责任者;doczrz,备注;bz","archive_grid_wsda",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid_wsda').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid_wsda').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
              //  '->',
              //  {
              //    xtype: 'combo',
              //    name: 'aj_select',
              //    store: aj_where_field_data,
              //    emptyText:'案卷标题',
              //    mode: 'local',
              //    minChars : 2,
              //    valueField:'text',
              //    displayField:'text',
              //    triggerAction:'all',
              //    id:'aj_select_field'
              //  } ,
              //  '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
              //  {
              //    xtype:'textfield',
              //    id:'query_text',
              //  } ,         
              //  { xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
              //    handler: function() {
              //      console.log(Ext.getCmp('query_text').value);
              //      if(Ext.getCmp('query_text').value != null ){
              //        var grid = Ext.getCmp('archive_grid_wsda');
              //        grid.store.proxy.url="/desktop/get_archive_where";
              //        archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
              //        archive_store.load();
              //      }
              //    }
              //  }
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
          
          
          { text : '全宗号', width : 0, sortable : true, dataIndex: 'qzh'},
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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

    var AjListFn_sx = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();

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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'zl',    type: 'string'},
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
        id : 'archive_grid',
        store: archive_store,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],
        tbar:[
        {
          xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
          handler: function() {

            var grid = Ext.getCmp('archive_grid');
            var records = grid.getSelectionModel().getSelection();
            var record = records[0];
            DispAj_sx(record,true,title);
          }
        },{
          xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
          handler: function() {

            var grid = Ext.getCmp('archive_grid');
            var records = grid.getSelectionModel().getSelection();
            var record = records[0];
            var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
            Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                  if(id=="yes"){
                    new Ajax.Request("/desktop/delete_archive", { 
                      method: "POST",
                      parameters: eval(pars),
                      onComplete:  function(request) {
                        if (request.responseText=='success'){
                            Ext.getCmp('archive_grid').store.load();
                        }else{
                            alert(request.responseText);
                        }
                      }
                    });
                  }
              });
            
            }
        },
        {
          xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
          handler: function() {
            var grid = Ext.getCmp('archive_grid');
            var records = grid.getSelectionModel().getSelection();
            var record = records[0];
            DispAj_sx(record,false,title);
          }
        } , 
        {
          xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
          handler: function() {
            showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
          }
        }, 
        {
          text:'查看图像或附件',
          iconCls:'',
          handler : function() {
            var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
            if (items.length > 0) {
              var item = items[0];
              var dh = items[0].data.dh;
              show_image(dh);                 
              set_image("/assets/dady/fm.jpg");
            }
          }    
        },
    {
          text:'备考表',
          iconCls:'yl',
          handler : function() {
            var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
            if (items.length > 0) {
              var item = items[0];
              var id = items[0].data.id;
              DispBkb(id);
            }
          }    
        },
        '->',
       // {
       //   xtype: 'combo',
       //   name: 'aj_select',
       //   store: aj_where_field_data,
       //   emptyText:'案卷标题',
       //   mode: 'local',
       //   minChars : 2,
       //   valueField:'text',
       //   displayField:'text',
       //   triggerAction:'all',
       //   id:'aj_select_field'
       // } ,
       // '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
       // {
       //   xtype:'textfield',
       //   id:'query_text' 
       // },         
       // { 
       //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
       //   handler: function() {
       //     console.log(Ext.getCmp('query_text').value);
       //     if(Ext.getCmp('query_text').value != null ){
       //       var grid = Ext.getCmp('archive_grid');
       //       grid.store.proxy.url="/desktop/get_archive_where";
       //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
       //       archive_store.load();
       //     }
       //   }
       // }
        ],

        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '案卷号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '标题名称',  width : 175, sortable : true, dataIndex: 'tm'},
          
          
          { text : '年度',  width : 75, sortable : true, dataIndex: 'nd'},
          { text : '件数',  width : 75, sortable : true, dataIndex: 'js'},
          { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          { text : '起日期',  width : 0, sortable : true, dataIndex: 'qrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '止日期',  width : 0, sortable : true, dataIndex: 'zrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '起年月',  width : 75, sortable : true, dataIndex: 'qny'},
          { text : '止年月',  width : 75, sortable : true, dataIndex: 'zny'},
          { text : '种类',   width : 75, sortable : true, dataIndex: 'zl'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          
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
                  case "15": 
                    DispAj_sx(r,false,title);
                    break;
                  case "2": 
                    DispAj_cw(r,false,title);
                    break; 
                  case "3": 
                    DispAj_tddj(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
            items: [documentGrid]
          }]
      });
      tabPanel.setActiveTab(tabPage);
      userManagePageIsOpen = true;
    };
    
    var AjListFn_tjml = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();

                        }
                      });
                    }
                });
              
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
          
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'tfh',   type: 'string'},
          {name: 'tgh',   type: 'string'},
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
        id : 'archive_grid',
        store: archive_store,
        
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],
        
        tbar:[{
              xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
              handler: function() {

                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_tjml(record,true,title);
              }
            },{
                xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
                handler: function() {

                  var grid = Ext.getCmp('archive_grid');
                  var records = grid.getSelectionModel().getSelection();
                  var record = records[0];

                  var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });
                }
              },
              {
                xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
                handler: function() {
                  var grid = Ext.getCmp('archive_grid');
                  var records = grid.getSelectionModel().getSelection();
                  var record = records[0];
                  DispAj_tjml(record,false,title);
                }
              }, 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
                  '->',
                //  {
                //    xtype: 'combo',
                //    name: 'aj_select',
                //    store: aj_where_field_data,
                //    emptyText:'案卷标题',
                //    mode: 'local',
                //    minChars : 2,
                //    valueField:'text',
                //    displayField:'text',
                //    triggerAction:'all',
                //    id:'aj_select_field'
                //  },
                //  '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
                //  {
                //    xtype:'textfield',
                //    id:'query_text'
                //  },         
                //  { 
                //    xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
                //    handler: function() {
                //      console.log(Ext.getCmp('query_text').value);
                //      if(Ext.getCmp('query_text').value != null ){
                //        var grid = Ext.getCmp('archive_grid');
                //        grid.store.proxy.url="/desktop/get_archive_where";
                //        archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
                //        archive_store.load();
                //      }
                //    }
                //  }
          ],
        columns: [
          { text : 'id',    width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',    width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号',   width : 75, sortable : true, dataIndex: 'mlh'},
      { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '序号',   width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '图名',  width : 175, sortable : true, dataIndex: 'tm'},
          { text : '图幅号', width : 75, sortable : true, dataIndex: 'tfh'},
          { text : '图柜号', width : 75, sortable : true, dataIndex: 'tgh'},
          { text : '年度',  width : 75, sortable : true, dataIndex: 'nd'},
          { text : '张数',  width : 75, sortable : true, dataIndex: 'ys'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_tjml(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
            items: [documentGrid]
          }]
      });
      tabPanel.setActiveTab(tabPage);
      userManagePageIsOpen = true;
    };
    
    var AjListFn_qtda_dzda = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
          {
            xtype:'button',text:'添加',tooltip:'添加卷内目录',iconCls:'add',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispJr(record,true);
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除卷内目录',iconCls:'remove',
            handler: function() {
              var grid = Ext.getCmp('document_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];

              var pars="id="+record.data.id;
              Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
                    if(id=="yes"){
                      new Ajax.Request("/desktop/delete_document", { 
                        method: "POST",
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }
                });
              
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'rjhj',    type: 'string'},
          {name: 'tgh',   type: 'string'},
          {name: 'czt',   type: 'string'},
          {name: 'sl',    type: 'string'},
          {name: 'bfs',   type: 'string'},
          {name: 'ztbhdwjgs', type: 'string'},
          {name: 'yyrjpt',  type: 'string'},
          {name: 'tjdw',    type: 'string'},
          {name: 'wjzt',    type: 'string'},
          {name: 'tjr',   type: 'string'},
          {name: 'czxt',    type: 'string'},
          {name: 'dzwjm',   type: 'string'},
          {name: 'ztbh',    type: 'string'},
          {name: 'xcbm',    type: 'string'},
          {name: 'xcrq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
          {name: 'jsr',   type: 'string'},
          {name: 'jsdw',    type: 'string'},
          {name: 'yjhj',    type: 'string'},
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
        id : 'archive_grid',
        store: archive_store,
        
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
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

              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_qtda_dzda(record,true,title);
            }
          } ,
            {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {

                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });
              }
            },
            {
              xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_qtda_dzda(record,false,title);
              }
            }, 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
           // {
           //   xtype: 'combo',
           //   name: 'aj_select',
           //   store: aj_where_field_data,
           //   emptyText:'案卷标题',
           //   mode: 'local',
           //   minChars : 2,
           //   valueField:'text',
           //   displayField:'text',
           //   triggerAction:'all',
           //   id:'aj_select_field'
           // } ,
           // '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',
           //   id:'query_text'
           // },         
           // { 
           //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
           //   handler: function() {
           //     console.log(Ext.getCmp('query_text').value);
           //     if(Ext.getCmp('query_text').value != null ){
           //       var grid = Ext.getCmp('archive_grid');
           //       grid.store.proxy.url="/desktop/get_archive_where";
           //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
           //       archive_store.load();
           //     }
           //   }
           // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : 'dh',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '档号', width : 75, sortable : true, dataIndex: 'mlh'},
          { text : '分类号', width : 75, sortable : true, dataIndex: 'flh'},         
          { text : '顺序号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '题名',  width : 175, sortable : true, dataIndex: 'tm'},
          { text : '电子文件名', width : 75, sortable : true, dataIndex: 'dzwjm'},
          { text : '形成部门',  width : 75, sortable : true, dataIndex: 'xcbm'},
          
          { text : '形成日期',  width : 75, sortable : true, dataIndex: 'xcrq',renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          
          { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_qtda_dzda(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
    var AjListFn_qtda_sbda = function(title,text) {
      
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'dj',    type: 'string'},
          {name: 'je',    type: 'string'},
          {name: 'zcbh',    type: 'string'},
          {name: 'sybgr',   type: 'string'},
          {name: 'sybgdw',  type: 'string'},
          {name: 'cfdd',    type: 'string'},
          {name: 'sl',    type: 'integer'},
          {name: 'dw',    type: 'string'},
          {name: 'zcmc',    type: 'string'},
          {name: 'gzsj',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
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
        id : 'archive_grid',
        store: archive_store,
        
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],
        
        tbar:[
          {
            xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_qtda_sbda(record,true,title);
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
            Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                  if(id=="yes"){
                    new Ajax.Request("/desktop/delete_archive", { 
                      method: "POST",
                      parameters: eval(pars),
                      onComplete:  function(request) {
                        if (request.responseText=='success'){
                            Ext.getCmp('archive_grid').store.load();
                        }else{
                            alert(request.responseText);
                        }
                      }
                    });
                  }
              });
              }
            },
            {
              xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_qtda_sbda(record,false,title);
              }
            }, 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
           // {
           //   xtype: 'combo',
           //   name: 'aj_select',
           //   store: aj_where_field_data,
           //   emptyText:'案卷标题',
           //   mode: 'local',
           //   minChars : 2,
           //   valueField:'text',
           //   displayField:'text',
           //   triggerAction:'all',
           //   id:'aj_select_field'
           // } ,
           // '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',
           //   id:'query_text'
           // } ,         
           // { 
           //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
           //   handler: function() {
           //     console.log(Ext.getCmp('query_text').value);
           //     if(Ext.getCmp('query_text').value != null ){
           //       var grid = Ext.getCmp('archive_grid');
           //       grid.store.proxy.url="/desktop/get_archive_where";
           //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
           //       archive_store.load();
           //     }
           //   }
           // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '件号',   width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '资产编号',  width : 75, sortable : true, dataIndex: 'zcbh'},
          { text : '资产名称',  width : 75, sortable : true, dataIndex: 'zcmc'},
          { text : '使用保管单位',  width : 175, sortable : true, dataIndex: 'sybgdw'},
          
          
          { text : '使用保管人', width : 75, sortable : true, dataIndex: 'sybgr'},
          
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          { text : '购置时间',   width : 75, sortable : true, dataIndex: 'gzsj', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '金额',   width : 75, sortable : true, dataIndex: 'je'},
          
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_qtda_sbda(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
 
    var AjListFn_qtda_jjda = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
          {
            xtype:'button',text:'添加',tooltip:'添加卷内目录',iconCls:'add',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispJr(record,true);
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除卷内目录',iconCls:'remove',
            handler: function() {
              var grid = Ext.getCmp('document_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              var pars="id="+record.data.id;
              Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
                    if(id=="yes"){
                      new Ajax.Request("/desktop/delete_document", { 
                        method: "POST",
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }
                });
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
          
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'xmmc',    type: 'string'},
          {name: 'jsdw',    type: 'string'},
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
        id : 'archive_grid',
        store: archive_store,
        
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
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

              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_qtda_jjda(record,true,title);
            }
          } ,
            {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {

                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });

              }
            },
            {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_qtda_jjda(record,false,title);
              }
            } , 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
            //{
            //  xtype: 'combo',
            //  name: 'aj_select',
            //  store: aj_where_field_data,
            //  emptyText:'案卷标题',
            //  mode: 'local',
            //  minChars : 2,
            //  valueField:'text',
            //  displayField:'text',
            //  triggerAction:'all',
            //  id:'aj_select_field'
            //} ,
            //  '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
            //{
            //  xtype:'textfield',
            //  id:'query_text'
            //} ,         
            //{ 
            //  xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
            //  handler: function() {
            //    console.log(Ext.getCmp('query_text').value);
            //    if(Ext.getCmp('query_text').value != null ){
            //      var grid = Ext.getCmp('archive_grid');
            //      grid.store.proxy.url="/desktop/get_archive_where";
            //      archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
            //      archive_store.load();
            //    }
            //  }
            //}
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '案卷号',  width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '项目名称',  width : 175, sortable : true, dataIndex: 'xmmc'},
          
          { text : '建设单位',  width : 75, sortable : true, dataIndex: 'jsdw'},
          { text : '建设年代',  width : 75, sortable : true, dataIndex: 'nd'},
          
          { text : '页数',  width : 75, sortable : true, dataIndex: 'ys'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          
          { text : '起年月',  width : 75, sortable : true, dataIndex: 'qny'},
          { text : '止年月',  width : 75, sortable : true, dataIndex: 'zny'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_qtda_jjda(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
    var AjListFn_qtda_swda = function(title,text) {
      
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();

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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'mc',    type: 'string'},
          {name: 'ztxs',    type: 'string'},
          
          {name: 'bh',    type: 'string'},
          {name: 'lb',    type: 'string'},
          {name: 'hjz',   type: 'string'},
          {name: 'sjsj',    type: 'date',  type: 'date',  dateFormat: 'Y-m-d H:i:s'},
          {name: 'sjdw',    type: 'string'},
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
        id : 'archive_grid',
        store: archive_store,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],
        tbar:[
          {
            xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
            handler: function() {

              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_qtda_swda(record,true,title);
            }
          } ,
            {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {

                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });

              }
            },
            {
              xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_qtda_swda(record,false,title);
              }
            }, 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
           // {
           //   xtype: 'combo',
           //   name: 'aj_select',
           //   store: aj_where_field_data,
           //   emptyText:'案卷标题',
           //   mode: 'local',
           //   minChars : 2,
           //   valueField:'text',
           //   displayField:'text',
           //   triggerAction:'all',
           //   id:'aj_select_field'
           // } ,
           //   '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',
           //   id:'query_text'
           // } ,         
           // { 
           //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
           //   handler: function() {
           //     console.log(Ext.getCmp('query_text').value);
           //     if(Ext.getCmp('query_text').value != null ){
           //       var grid = Ext.getCmp('archive_grid');
           //       grid.store.proxy.url="/desktop/get_archive_where";
           //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
           //       archive_store.load();
           //     }
           //   }
           // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '件号',   width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '名称',  width : 175, sortable : true, dataIndex: 'mc'},
          
          { text : '编号',  width : 75, sortable : true, dataIndex: 'bh'},
          { text : '获奖者', width : 75, sortable : true, dataIndex: 'hjz'},
          
          { text : '授奖单位',  width : 75, sortable : true, dataIndex: 'sjdw'},
          { text : '获奖时间',  width : 75, sortable : true, dataIndex: 'sjsj',renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          
          
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_qtda_swda(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
    var AjListFn_qtda_zlxx = function(title,text) {
      
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }
                });
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
          
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'bh',    type: 'string'},
          {name: 'lb',    type: 'string'},
          {name: 'bzdm',    type: 'string'},
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
        id : 'archive_grid',
        store: archive_store,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],

        tbar:[
          {
            xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
            handler: function() {

              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_qtda_zlxx(record,true,title);
            }
          } ,
          {
            xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
            Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                  if(id=="yes"){
                    new Ajax.Request("/desktop/delete_archive", { 
                      method: "POST",
                      parameters: eval(pars),
                      onComplete:  function(request) {
                        if (request.responseText=='success'){
                            Ext.getCmp('archive_grid').store.load();
                        }else{
                            alert(request.responseText);
                        }
                      }
                    });
                  }
              });
            }
          },
          {
            xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_qtda_zlxx(record,false,title);
            }
          }   , 
            {
            xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
            handler: function() {
              showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
            }
          }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
          '->',
         // {
         //   xtype: 'combo',
         //   name: 'aj_select',
         //   store: aj_where_field_data,
         //   emptyText:'案卷标题',
         //   mode: 'local',
         //   minChars : 2,
         //   valueField:'text',
         //   displayField:'text',
         //   triggerAction:'all',
         //   id:'aj_select_field'
         // } ,
         // '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
         // {
         //   xtype:'textfield',
         //   id:'query_text'
         // } ,         
         // { 
         //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
         //   handler: function() {
         //     console.log(Ext.getCmp('query_text').value);
         //     if(Ext.getCmp('query_text').value != null ){
         //       var grid = Ext.getCmp('archive_grid');
         //       grid.store.proxy.url="/desktop/get_archive_where";
         //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
         //       archive_store.load();
         //     }
         //   }
         // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          { text : '分类号',  width : 75, sortable : true, dataIndex: 'flh'},
          { text : '件号',   width : 75, sortable : true, dataIndex: 'ajh'},
          { text : '标题',  width : 175, sortable : true, dataIndex: 'tm'},
          { text : '编号',  width : 75, sortable : true, dataIndex: 'bh'},
          { text : '出版年度',  width : 75, sortable : true, dataIndex: 'nd'},
          { text : '编制单位',  width : 75, sortable : true, dataIndex: 'bzdm'},
          { text : '类别',  width : 75, sortable : true, dataIndex: 'lb'},
          { text : '保管期限',  width : 75, sortable : true, dataIndex: 'bgqx'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_qtda_zlxx(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
    
    var AjListFn_by_tszlhj = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
          {
            xtype:'button',text:'添加',tooltip:'添加卷内目录',iconCls:'add',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispJr(record,true);
              
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除卷内目录',iconCls:'remove',
            handler: function() {

              var grid = Ext.getCmp('document_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];

              var pars="id="+record.data.id;
              Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
                  if(id=="yes"){
                    new Ajax.Request("/desktop/delete_document", { 
                      method: "POST",
                      parameters: {id:record.data.id,userid:currentUser.id},
                      onComplete:  function(request) {
                        Ext.getCmp('document_grid').store.load();

                      }
                    });
                  }
              });
              
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'djh',   type: 'string'},
          {name: 'kq',    type: 'string'},
          {name: 'yfdm',    type: 'string'},
          {name: 'fs',    type: 'string'},
          {name: 'mc',    type: 'string'},
          {name: 'cbrq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
          {name: 'dj',    type: 'string'},
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
        id : 'archive_grid',
        store: archive_store,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
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

              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_by_tszlhj(record,true,title);
            }
          } ,
            {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {

                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });

              }
            },
            {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_by_tszlhj(record,false,title);
              }
            }, 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
           // {
           //   xtype: 'combo',
           //   name: 'aj_select',
           //   store: aj_where_field_data,
           //   emptyText:'案卷标题',
           //   mode: 'local',
           //   minChars : 2,
           //   valueField:'text',
           //   displayField:'text',
           //   triggerAction:'all',
           //   id:'aj_select_field'
           // } ,
           //   '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',
           //   id:'query_text'
           // } ,         
           // { 
           //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
           //   handler: function() {
           //     console.log(Ext.getCmp('query_text').value);
           //     if(Ext.getCmp('query_text').value != null ){
           //       var grid = Ext.getCmp('archive_grid');
           //       grid.store.proxy.url="/desktop/get_archive_where";
           //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
           //       archive_store.load();
           //     }
           //   }
           // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '登记号', width : 75, sortable : true, dataIndex: 'djh'},
          { text : '刑期',   width : 75, sortable : true, dataIndex: 'kq'},
          { text : '名称',  width : 175, sortable : true, dataIndex: 'mc'},
          { text : '邮发代码',  width : 75, sortable : true, dataIndex: 'yfdm'},
          { text : '出版日期',  width : 75, sortable : true, dataIndex: 'cbrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '单价',  width : 75, sortable : true, dataIndex: 'dj'},
          { text : '份数',  width : 75, sortable : true, dataIndex: 'fs'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_by_tszlhj(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;

        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
    var AjListFn_by_jcszhb = function(title,text) {
      dh='';
      
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }
                });
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 75, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'zt',    type: 'string'},
          {name: 'qy',    type: 'string'},
          {name: 'tjsj',    type: 'string'},
          {name: 'sm',    type: 'string'},                    
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
        id : 'archive_grid',
        store: archive_store,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
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

              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_by_jcszhb(record,true,title);
            }
          } ,
            {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {

                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });

              }
            },
            {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_by_jcszhb(record,false,title);
              }
            }   , 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
                '->',
               // {
               //   xtype: 'combo',
               //   name: 'aj_select',
               //   store: aj_where_field_data,
               //   emptyText:'案卷标题',
               //   mode: 'local',
               //   minChars : 2,
               //   valueField:'text',
               //   displayField:'text',
               //   triggerAction:'all',
               //   id:'aj_select_field'
               // } ,
               // '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
               // {
               //   xtype:'textfield',
               //   id:'query_text'
               // } ,         
               // { xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
               //   handler: function() {
               //     console.log(Ext.getCmp('query_text').value);
               //     if(Ext.getCmp('query_text').value != null ){
               //       var grid = Ext.getCmp('archive_grid');
               //       grid.store.proxy.url="/desktop/get_archive_where";
               //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
               //       archive_store.load();
               //     }
               //   }
               // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 75, sortable : true, dataIndex: 'dh'},
          { text : '专题', width : 75, sortable : true, dataIndex: 'zt'},
          { text : '前言',   width : 75, sortable : true, dataIndex: 'qy'},
          { text : '统计数据',  width : 175, sortable : true, dataIndex: 'tjsj'},
          { text : '说明',  width : 75, sortable : true, dataIndex: 'sm'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_by_jcszhb(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
    
    var AjListFn_by_zzjgyg = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispJr(record,true);
              
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除卷内目录',iconCls:'remove',
            handler: function() {
              var grid = Ext.getCmp('document_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              var pars="id="+record.data.id;
              Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
                    if(id=="yes"){
                      new Ajax.Request("/desktop/delete_document", { 
                        method: "POST",
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }
                });
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'jgmc',    type: 'string'},
          {name: 'zzzc',    type: 'string'},
          {name: 'qzny',    type: 'string'},
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
        id : 'archive_grid',
        store: archive_store,
        
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],
        tbar:[
        {
          xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
          handler: function() {
            var grid = Ext.getCmp('archive_grid');
            var records = grid.getSelectionModel().getSelection();
            var record = records[0];
            DispAj_by_zzjgyg(record,true,title);
          }
        },
        {
          xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
          handler: function() {

            var grid = Ext.getCmp('archive_grid');
            var records = grid.getSelectionModel().getSelection();
            var record = records[0];

            var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
            Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                  if(id=="yes"){
                    new Ajax.Request("/desktop/delete_archive", { 
                      method: "POST",
                      parameters: eval(pars),
                      onComplete:  function(request) {
                        if (request.responseText=='success'){
                            Ext.getCmp('archive_grid').store.load();
                        }else{
                            alert(request.responseText);
                        }
                      }
                    });
                  }
              });
            }
          },
          {
            xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_by_zzjgyg(record,false,title);
            }
          },
            {
            xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
            handler: function() {
              showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
            }
          }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
        '->',
         // {
         //   xtype: 'combo',
         //   name: 'aj_select',
         //   store: aj_where_field_data,
         //   emptyText:'案卷标题',
         //   mode: 'local',
         //   minChars : 2,
         //   valueField:'text',
         //   displayField:'text',
         //   triggerAction:'all',
         //   id:'aj_select_field'
         // },
         //   '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
         // {
         //   xtype:'textfield',
         //   id:'query_text'
         // },         
         // { 
         //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
         //   handler: function() {
         //     console.log(Ext.getCmp('query_text').value);
         //     if(Ext.getCmp('query_text').value != null ){
         //       var grid = Ext.getCmp('archive_grid');
         //       grid.store.proxy.url="/desktop/get_archive_where";
         //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
         //       archive_store.load();
         //     }
         //   }
         // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '机构名称', width : 75, sortable : true, dataIndex: 'jgmc'},
          { text : '组织系统领导成员组成',   width : 175, sortable : true, dataIndex: 'zzzc'},
          { text : '起止年月',  width : 75, sortable : true, dataIndex: 'qzny'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
          selType:'checkboxmodel',
          //multiSelect:true,
          listeners:{
            itemdblclick:{
              fn:function(v,r,i,n,e,b){
                var tt=r.get("zrq");
                DispAj_by_zzjgyg(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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
    
    var AjListFn_by_dsj = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
              var grid = Ext.getCmp('archive_grid');
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
                        parameters: {id:record.data.id,userid:currentUser.id},
                        onComplete:  function(request) {
                          Ext.getCmp('document_grid').store.load();
                        }
                      });
                    }
                });
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          } ,   {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'dd',    type: 'string'},
          {name: 'jlr',   type: 'string'},
          {name: 'clly',    type: 'string'},
          {name: 'fsrq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
          {name: 'jlrq',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
          {name: 'rw',    type: 'string'},
          {name: 'sy',    type: 'string'},
          {name: 'yg',    type: 'string'},              
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
        id : 'archive_grid',
        store: archive_store,
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
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

              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_by_dsj(record,true,title);
            }
          } ,
            {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {

                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });

              }
            },
            {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_by_dsj(record,false,title);
              }
            }   , 
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
           // {
           //   xtype: 'combo',
           //   name: 'aj_select',
           //   store: aj_where_field_data,
           //   emptyText:'案卷标题',
           //   mode: 'local',
           //   minChars : 2,
           //   valueField:'text',
           //   displayField:'text',
           //   triggerAction:'all',
           //   id:'aj_select_field'
           // } ,
           // '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',
           //   id:'query_text'
           // } ,         
           // { 
           //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
           //   handler: function() {
           //     console.log(Ext.getCmp('query_text').value);
           //     if(Ext.getCmp('query_text').value != null ){
           //       var grid = Ext.getCmp('archive_grid');
           //       grid.store.proxy.url="/desktop/get_archive_where";
           //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
           //       archive_store.load();
           //     }
           //   }
           // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '地点', width : 75, sortable : true, dataIndex: 'dd'},
          { text : '记录人',  width : 175, sortable : true, dataIndex: 'jlr'},
          { text : '材料来源',  width : 75, sortable : true, dataIndex: 'clly'},          
          { text : '发生日期', width : 75, sortable : true, dataIndex: 'fsrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '记录日期',   width : 175, sortable : true, dataIndex: 'jlrq', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '人物',  width : 75, sortable : true, dataIndex: 'rw'},
          { text : '事由',   width : 175, sortable : true, dataIndex: 'sy'},
          { text : '因果',  width : 75, sortable : true, dataIndex: 'yg'},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
        selType:'checkboxmodel',
        //multiSelect:true,
        listeners:{
          itemdblclick:{
            fn:function(v,r,i,n,e,b){
              var tt=r.get("zrq");
                DispAj_by_dsj(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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

    var AjListFn_by_qzsm = function(title,text) {
      dh='';
      Ext.regModel('document_model', {
        fields: [
            {name: 'id',    type: 'integer'},
            {name: 'tm',    type: 'string'},
            {name: 'sxh',   type: 'string'},
      {name: 'mlh',    type: 'string'},
            {name: 'ajh',   type: 'string'},
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
          {
            xtype:'button',text:'添加',tooltip:'添加卷内目录',iconCls:'add',
            handler: function() {
              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispJr(record,true);
            }
          },
          {
            xtype:'button',text:'删除',tooltip:'删除卷内目录',iconCls:'remove',
            handler: function() {
              var grid = Ext.getCmp('document_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              var pars="id="+record.data.id;
              Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+";顺序号为："+record.data.sxh+"卷内目录？",function callback(id){
                  if(id=="yes"){
                    new Ajax.Request("/desktop/delete_document", { 
                      method: "POST",
                      parameters: {id:record.data.id,userid:currentUser.id},
                      onComplete:  function(request) {
                        Ext.getCmp('document_grid').store.load();

                      }
                    });
                  }                  
              });
            }},
          {
            xtype:'button',text:'修改',tooltip:'显示或修改卷内目录',iconCls:'option',
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
          },    {
                xtype:'button',text:'以模板方式增加卷内目录',tooltip:'以模板方式增加卷内目录',iconCls:'add',
                  handler: function() {
                      var grid = Ext.getCmp('archive_grid');                    
                      var records = grid.getSelectionModel().getSelection();
                      size=Ext.getCmp('archive_grid').getSelectionModel().getSelection().size();
                      if (size==1){         
                        size=Ext.getCmp('document_grid').store.count();
                          if (size>0){                                    
                            alert("此案卷已经有卷内目录，不能以模板方式进行增加卷内目录。");
                          }else{
                            var record = records[0];
                            DispJr_model(record.data.id,record.data.dh,false);
                          }
                      }else{
                        alert("请先选择一个案卷目录。");
                      }
                    }
             }    , 
             {
                  xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
                  handler: function() {
                    showAdvancedSearch("文号;wh,责任者;zrz,卷内题名;tm","document_grid",title,"",true);
                  }
               }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
      { text : '目录号',  width : 40, sortable : true, dataIndex: 'mlh'},
      { text : '案卷号',  width : 40, sortable : true, dataIndex: 'ajh'},
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
          {name: 'qzgczjj', type: 'string'},
          {name: 'sj',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
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
        id : 'archive_grid',
        store: archive_store,
        
        bbar:[
          new Ext.PagingToolbar({
            store: archive_store,
            pageSize: 25,
            width : 400,
            border : false,
            displayInfo: true,
            displayMsg: '{0} - {1} of {2}',
            emptyMsg: "没有找到！",
            prependButtons: true
          })
        ],
        tbar:[
          {
            xtype:'button',text:'添加',tooltip:'添加案卷信息',id:'add',iconCls:'add',
            handler: function() {

              var grid = Ext.getCmp('archive_grid');
              var records = grid.getSelectionModel().getSelection();
              var record = records[0];
              DispAj_by_qzsm(record,true,title);
            }
          } ,
            {xtype:'button',text:'删除',tooltip:'删除案卷信息',id:'delete',iconCls:'remove',
              handler: function() {

                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];

                var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
                Ext.Msg.confirm("提示信息","是否要删除档号为：！"+record.data.dh+"的案卷？",function callback(id){
                      if(id=="yes"){
                        new Ajax.Request("/desktop/delete_archive", { 
                          method: "POST",
                          parameters: eval(pars),
                          onComplete:  function(request) {
                            if (request.responseText=='success'){
                                Ext.getCmp('archive_grid').store.load();
                            }else{
                                alert(request.responseText);
                            }
                          }
                        });
                      }
                  });

              }
            },
            {xtype:'button',text:'修改',tooltip:'显示或修改案卷信息',id:'save',iconCls:'option',
              handler: function() {
                var grid = Ext.getCmp('archive_grid');
                var records = grid.getSelectionModel().getSelection();
                var record = records[0];
                DispAj_by_qzsm(record,false,title);
              }
            },
            {
              xtype:'button',text:'高级查询',tooltip:'',id:'advance-search',iconCls:'search',
              handler: function() {
                showAdvancedSearch("目录号;mlh,案卷号;ajh,年度;nd,保管期限;bgqx,案卷标题;ajtm,文号;wh,责任者;zrz,卷内题名;tm,备注;bz","archive_grid",title);
              }
            }, 
            {
              text:'查看图像或附件',
              iconCls:'',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var dh = items[0].data.dh;
                  show_image(dh);                 
                  set_image("/assets/dady/fm.jpg");
                }
              }    
            },
      {
              text:'备考表',
              iconCls:'yl',
              handler : function() {
                var items = Ext.getCmp('archive_grid').getSelectionModel().selected.items;
                if (items.length > 0) {
                  var item = items[0];
                  var id = items[0].data.id;
                  DispBkb(id);
                }
              }    
            },
            '->',
           // {
           //   xtype: 'combo',
           //   name: 'aj_select',
           //   store: aj_where_field_data,
           //   emptyText:'案卷标题',
           //   mode: 'local',
           //   minChars : 2,
           //   valueField:'text',
           //   displayField:'text',
           //   triggerAction:'all',
           //   id:'aj_select_field'
           // } ,
           //   '&nbsp;&nbsp;<span style=" font-size:12px;font-weight:600;color:#3366FF;">查询</span>:&nbsp;&nbsp;',
           // {
           //   xtype:'textfield',
           //   id:'query_text'
           // },         
           // { 
           //   xtype:'button',text:'查询',tooltip:'查询案卷信息',id:'query',iconCls:'search',
           //   handler: function() {
           //     console.log(Ext.getCmp('query_text').value);
           //     if(Ext.getCmp('query_text').value != null ){
           //       var grid = Ext.getCmp('archive_grid');
           //       grid.store.proxy.url="/desktop/get_archive_where";
           //       archive_store.proxy.extraParams.query=Ext.getCmp('query_text').value;
           //       archive_store.load();
           //     }
           //   }
           // }
        ],
        columns: [
          { text : 'id',  width : 0, sortable : true, dataIndex: 'id'},
          { text : 'dalb',  width : 0, sortable : true, dataIndex: 'dalb'},
          { text : '档号',  width : 0, sortable : true, dataIndex: 'dh'},
          { text : '目录号', width : 75, sortable : true, dataIndex: 'mlh'},
          { text : '全宗构成者简介',  width : 175, sortable : true, dataIndex: 'qzgczjj'},
          { text : '时间',  width : 75, sortable : true, dataIndex: 'sj', renderer: Ext.util.Format.dateRenderer('Y-m-d')},
          { text : '单位代码',  width : 75, sortable : true, dataIndex: 'dwdm'},
          { text : '备注',  flex : 1, sortable : true, dataIndex: 'bz'}
          ],
        selType:'checkboxmodel',
        //multiSelect:true,
        listeners:{
          itemdblclick:{
            fn:function(v,r,i,n,e,b){
              var tt=r.get("zrq");
              DispAj_by_qzsm(r,false,title);
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
    store3.proxy.url="/desktop/get_document";
        store3.proxy.extraParams.query=data.id;
        store3.load();
        dh=data.dh;
        timage_store.proxy.extraParams = {dh:data.dh, type:'0'};
        timage_store.load();
        Ext.getCmp('timage_combo').lastQuery = null;
        set_imagearchive("/assets/dady/fm.jpg");
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

    
    
    var store1 = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: 'desktop/get_treeforuserid',
            extraParams: {node:"root",userid:currentUser.id
            },
            actionMethods: 'POST'
        }
    });
  
    var treePanel = Ext.create('Ext.tree.Panel', {
      store: store1,
      id:'archive_tree',
      rootVisible: false,
      useArrows: true,
      singleExpand: true,
      tbar:[
      {
        xtype:'button',text:'刷新目录',tooltip:'刷新目录',iconCls:'refresh',
        handler: function() {
          Ext.getCmp('archive_tree').store.load();
        }
      },'->',
   // {
     //   xtype:'button',text:'删除目录',tooltip:'删除目录',iconCls:'delete',
     //   handler: function() {
     //     //Ext.getCmp('archive_tree').store.load();
   //     var tree = Ext.getCmp('archive_tree');
     //     var records = tree.getSelectionModel().getSelection();
     //     var record = records[0];
   //     //data = node.selected.items[0].data;
   //     ss=record.data.id.split('_');
   //     if (ss.length=3 && ss[1]!=24){
     //         var pars="({id:'"+record.data.id+"',dalb:'"+record.data.dalb + "',userid:'" + currentUser.id +"'})";
   //         Ext.Msg.confirm("提示信息","是否要删除："+record.data.text+"的整个目录号数据？",function callback(id){
   //               if(id=="yes"){
   //                 new Ajax.Request("/desktop/delete_all_archive", { 
   //                   method: "POST",
   //                   parameters: eval(pars),
   //                   onComplete:  function(request) {
   //               if (request.responseText=='success'){
   //                         Ext.getCmp('archive_grid').store.load();
   //               }else{
   //                 alert(request.responseText);
   //               }
   //                   }
   //                 });
   //               }
   //          });
   //     }
   //     
     //   }
     // }
      ],
      width: 200
    });

    

    treePanel.on("select",function(node){ 
      data = node.selected.items[0].data;  // data.id, data.parent, data.text, data.leaf
      ss=data.id.split('_');
      if (ss.length>1){
        if (ss[1]<100){
            Ext.getCmp('timage_combo').lastQuery = null;
            set_imagearchive("/assets/dady/fm.jpg");
            switch (ss[1]) { 
              case "0": 
                AjListFn_zh(data.id,node.selected.items[0].parentNode.data.text+data.text);
                break; 
            case "15": 
              AjListFn_sx(data.id,node.selected.items[0].parentNode.data.text+data.text);
              break;
              case "2": 
                AjListFn_cw(data.id,node.selected.items[0].parentNode.data.text+data.text);
                break; 
              case "3": 
                      AjListFn_tddj(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break; 
            case "5": 
                      AjListFn_tddj(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "6": 
                      AjListFn_tddj(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "7": 
                      AjListFn_tddj(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "24":
              AjListFn_wsda(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "25":
              AjListFn_qtda_dzda(data.id,node.selected.items[0].parentNode.data.text+data.text);
              break;
            case "26":
              AjListFn_qtda_jjda(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "27":
              AjListFn_qtda_sbda(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;        
            case "28":
              AjListFn_qtda_swda(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "29":
              AjListFn_qtda_zlxx(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "30":
              AjListFn_by_tszlhj(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "31":
              AjListFn_by_jcszhb(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "32":
              AjListFn_by_zzjgyg(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "33":
              AjListFn_by_dsj(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "34":
              AjListFn_by_qzsm(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "18":
              AjListFn_tjml(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "20":
                  AjListFn_zp(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            case "35":
                  AjListFn_kyq(data.id,node.selected.items[0].parentNode.data.text+data.text);
                  break;
            default:
                AjListFn_zh(data.id,node.selected.items[0].parentNode.data.text+data.text);
                break;
            }
        }
      }
    });
  
    if(!win){
      win = desktop.createWindow({
        id: 'archiveman',
        title:'档案管理——国土',        
        width:1000,
        height:600,
        x:0,
        y:0,
        iconCls: 'archiveman',
        animCollapse:false,
        maximized:true,
        border: false,
        hideMode: 'offsets',
        layout: 'border',
        split:true,
        items: [{ 
            title:'档案类别',
            region:'west',
            iconCls:'dept_tree',
            xtype:'panel',
            margins:'5 2 5 5',
            width: 200,
            collapsible:true,//可以被折叠
            id:'west-tree',
            layout:'fit',
            split:true,
            items:treePanel
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
        id:'imagelist',
              layout:'fit',
              tbar:myuploadform,
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
                  var pars={gid:record[0].data.id, type:timage_store.proxy.extraParams.type,userid:currentUser.id};
                  new Ajax.Request("/desktop/get_timage_from_db", {
                    method: "POST",
                    parameters: pars,
                    onComplete:  function(request) {
                      path = request.responseText;
                      if (path != '') { 
                        set_imagearchive("/assets/dady/fm.jpg");
                        if (path.toUpperCase().include('JPG') || path.toUpperCase().include('TIF') || path.toUpperCase().include('JPEG') || path.toUpperCase().include('TIFF')) { 
                          ifx=path.split('?');
                          imagefx=ifx[1];
                          imageObj1.src = path;
                          drawarchive(scale, translatePos1,imageObj1);
                        }else{        
                          //location.href= path;
                          window.open(path,'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
                          imageObj1.src = '';
                          drawchive(scale, translatePos1,imageObj1);
                        }
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
                  var pars={gid:nextStoreValue, type:timage_store.proxy.extraParams.type,userid:currentUser.id};
          new Ajax.Request("/desktop/get_timage_from_db", {
              method: "POST",
              parameters: pars,
              onComplete:  function(request) {
                path = request.responseText;
                if (path != '') { 
            //set_image("/assets/dady/fm.jpg");
            set_imagearchive("/assets/dady/fm.jpg");
            if (path.toUpperCase().include('JPG') || path.toUpperCase().include('TIF') || path.toUpperCase().include('JPEG') || path.toUpperCase().include('TIFF')) { 
              ifx=path.split('?');
              imagefx=ifx[1];
                    imageObj1.src = path;
                    drawarchive(scale, translatePos1,imageObj1);
            }else{        
              //location.href= path;
              window.open(path,'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
              imageObj1.src = '';
                    drawchive(scale, translatePos1,imageObj1);
            }
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
                  var pars={gid:nextStoreValue, type:timage_store.proxy.extraParams.type,userid:currentUser.id};
                  new Ajax.Request("/desktop/get_timage_from_db", {
              method: "POST",
              parameters: pars,
              onComplete:  function(request) {
                path = request.responseText;
                if (path != '') { 
            //set_image("/assets/dady/fm.jpg");
            set_imagearchive("/assets/dady/fm.jpg");
            if (path.toUpperCase().include('JPG') || path.toUpperCase().include('TIF') || path.toUpperCase().include('JPEG') || path.toUpperCase().include('TIFF')) { 
              ifx=path.split('?');
              imagefx=ifx[1];
                    imageObj1.src = path;
                    drawarchive(scale, translatePos1,imageObj1);
            }else{        
              //location.href= path;
              window.open(path,'','height=500,width=800,top=150, left=100,scrollbars=yes,status=yes');
              imageObj1.src = '';
                    drawchive(scale, translatePos1,imageObj1);
            }
                }
              }
            });     

                }
              },
              {
                text: '打印图像',
                handler : function() {
          combo = Ext.getCmp('timage_combo').displayTplData[0].yxmc;
          if(combo!=''){
            new Ajax.Request("/desktop/get_users_sort_forqxdm", { 
                  method: "POST",
                  parameters: eval("({userid:" + currentUser.id + ",qxdm:'ip',qxlb:1,dh:'" + dh + "'})"),
                  onComplete:  function(request) {
                    if (request.responseText=='success'){
                            LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM'));                        
                            //LODOP.ADD_PRINT_BARCODE(0,0,200,100,"Code39","*123ABC4567890*");
                            //image_path = Ext.getCmp('preview_img').getEl().dom.src.replace(/-/ig, "_");
                            //image_path = Ext.getCmp('preview_img').getEl().dom.src;
                    image_path = window.location.href + "/assets/dady/img_tmp/" + dh + "/" + combo;
                            LODOP.PRINT_INIT(image_path);
                            LODOP.SET_PRINT_PAGESIZE(imagefx,0,0,"A4");
                            LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
                            LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
                            LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
                            LODOP.PREVIEW();
                            //LODOP.PRINT();
                }else{
                        alert('您无此类档案的打印影像文件的权限。');
                      }
                    }
            });
          }
                }
              },
              {
                  text: '删除图像',
                  handler : function() {
                  if (dh!=''){
                    combo = Ext.getCmp('timage_combo').displayTplData[0].yxbh;
                    if (combo!=''){
                      Ext.Msg.confirm("提示信息","是否要删除："+combo+" 图像？",function callback(id){
                        if(id=="yes"){
                          var pars="{yxmc:'"+combo+"',dh:'"+dh + "'}";                        
                          new Ajax.Request("/desktop/delete_timage", {
                              method: "POST",
                              //parameters: {yxmc:combo,dh:dh},
                              parameters: eval("({yxmc:'" + combo + "',dh:'" + dh +"',userid:" + currentUser.id + "})"),
                              onComplete:  function(request) {
                                var path = request.responseText;

                if (path == 'notsort'){
                  alert("您无删除此类档案影像文件的权限。")
                }else{
                                  if (path == 'success') { 
                                    timage_store.proxy.extraParams = {dh:dh, type:'0'};
                                    timage_store.load();
                                    Ext.getCmp('timage_combo').lastQuery = null;
                                    //Ext.getCmp('preview_img').getEl().dom.src = '';
                    set_imagearchive("/assets/dady/fm.jpg");
                                  }
                }
                              }
                          });
                        }
                      });
                    }
                  }
                  }   // handler
              },
              {
                  text: '删除整卷图像',
                  handler : function() {
                  if (dh!=''){
          combo = Ext.getCmp('timage_combo').displayTplData[0].yxbh;
                      Ext.Msg.confirm("提示信息","是否要整卷删除图像？",function callback(id){
                        if(id=="yes"){
                          var pars="{dh:'"+dh + "'}";
                          new Ajax.Request("/desktop/delete_all_timage", {
                              method: "POST",
                              //parameters: {dh:dh},
                              parameters: eval("({yxmc:'" + combo + "',dh:'" + dh +"',userid:" + currentUser.id + "})"),
                              onComplete:  function(request) {
                                var path = request.responseText;
                                if (path == 'notsort'){
                                    alert("您无删除此类档案影像文件的权限。")
                                }else{
                                    if (path == 'success') { 
                                      timage_store.proxy.extraParams = {dh:dh, type:'0'};
                                      timage_store.load();
                                      Ext.getCmp('timage_combo').lastQuery = null;
                                      Ext.getCmp('preview_img').getEl().dom.src = '';
                                    }
                                }
                              }
                          });
                        }
                      });                    
                  }
                  }   // handler
              }],     //bbar
              items:[        
        {
          xtype: 'panel', //或者xtype: 'component',
          layout:'fit',
              html:canvas_string
        }
            ]}
    ]
      });
    };
    
    
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

