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


Ext.define('MyDesktop.Datj', {
  extend: 'Ext.ux.desktop.Module',

  requires: [
    '*',
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.window.MessageBox'
  ],

  id:'datj',

  init : function(){
    this.launcher = {
      text: '档案统计',
      iconCls:'printdata',
      handler : this.createWindow,
      scope: this
    }
  },
  createWindow : function(){
    var insert_qx="";
	var jr_modelid='';
	var jr_modelname='';
	var jr_tm_modelid='';
    var desktop = this.app.getDesktop();
    var win = desktop.getWindow('datj');
    Ext.regModel('qz_model', {
      fields: [
        {name: 'id',    type: 'integer'},
        {name: 'dwdm',    type: 'string'}
      ]
    });
    var qz_store = Ext.create('Ext.data.Store', {
        id:'qz_store',
        model : 'qz_model',
        proxy: {
          type: 'ajax',
          url : '/desktop/get_qz_grid',
          reader: {
            type: 'json',
            root: 'rows',
            totalProperty: 'results'
          }
        }       
    });
    qz_store.load();  
    
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

    function get_mlqx_NodesChecked(node) {
      //获取用户目录权限树
      if (node.childNodes.size() == 0) return;
      node.eachChild(function(n){
        if (n.data.checked==true){
          if (insert_qx==""){
            insert_qx= n.data.id + ";" + n.data.text + ";0"
          }else{
            insert_qx=insert_qx+ "$" + n.data.id + ";" + n.data.text+ ";0"
          }
        };
          
        get_mlqx_NodesChecked(n);
      });
    };
    
    function get_cdqx_NodesChecked(node) {
      //获取用户菜单权限树
      if (node.childNodes.size() == 0) return;
      node.eachChild(function(n){
        if (n.data.checked==true){
          if (insert_qx==""){
            insert_qx= n.data.id + ";" + n.data.text + ";1"
          }else{
            insert_qx=insert_qx+ "$" + n.data.id + ";" + n.data.text + ";1"
          }
        };
        get_cdqx_NodesChecked(n);
      });
    };

    function get_parentNode(node){
      if (node.data.parentId=="root"){
      }else
      {
        node.parentNode.data.checked=true;
        node.parentNode.updateInfo({checked:true});
        get_parentNode(node.parentNode);
      }
    };

    var dandtj_disp = function(){
      var win = Ext.getCmp('dandtj_win');      
      if (win==null) {
        win = new Ext.Window({
          id : 'dandtj_win',
          title: '档案年度统计',
          //closeAction: 'hide',
          width: 370,
          height: 110,          
          //minHeight: 200,
          layout: 'fit',
          modal: true,
          plain: true,
          //items:user_setup_grid,          
          items: [{
            width: 370,
            height: 110,
            xtype:'form',
            layout: 'absolute',
            id : 'dandtj_form',
            items: [
              {
                xtype: 'label',
                text: '统计年度:',
                x: 10,
                y: 10,
                width: 100
              },              
              {
                xtype: 'textfield',
                x: 130,
                y: 10,
                width: 200,
                name: 'nd',
                id:'datj_nd'
              }
            ],
            buttons:[{
                xtype: 'button',
                iconCls: 'print',
                id:'datj_print',
                text:'统计打印',
                handler: function() {
                  var pars=this.up('panel').getForm().getValues();
                  if(pars['nd']!=''){                                          
                        new Ajax.Request("/desktop/print_dandtj", { 
                          method: "POST",
                          parameters: eval("({userid:'" + currentUser.id + "',nd:'" + Ext.getCmp('datj_nd').rawValue + "'})"),
                          onComplete:  function(request) {
                            	fhz=request.responseText.split(":");
								if (fhz[0]=='success'){									
								    printfile=fhz[1].split(",");
								    for (k=0;k<printfile.length;k++){
								      LODOP=getLodop(document.getElementById('LODOP'),document.getElementById('LODOP_EM'));   				             
								      image_path = window.location.href + "assets/dady/tmp1/" + printfile[k];
								      LODOP.PRINT_INIT(image_path);
								      LODOP.SET_PRINT_PAGESIZE(2,0,0,"A4");
						              LODOP.ADD_PRINT_IMAGE(0,0,1000,1410,"<img border='0' src='"+image_path+"' width='100%' height='100%'/>");
						              LODOP.SET_PRINT_STYLEA(0,"Stretch",2);//(可变形)扩展缩放模式
						              LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT","Full-Page");
						              //LODOP.PREVIEW();
								      LODOP.PRINT();
								    }
									alert("打印成功。"+fhz[1] );										
								}else{
									alert(request.responseText);
								}
                          	}
                        });                                                              
                  }else{
                    alert("统计年度不能为空。");
                  }
                }
              },
              {
                xtype: 'button',
                iconCls: 'exit',
                text:'退出',
                handler: function() {
                  //this.up('window').hide();
                  Ext.getCmp('dandtj_win').close();
                }
              }]
          }]
          
        });
      }      
      win.show();
    };
    
    var sys_cd_tree_store = Ext.create('Ext.data.TreeStore', {
      autoLoad: true,
      proxy: {
          type: 'ajax',
          url: 'desktop/get_datj_tree',
          extraParams: {userid:currentUser.id},
          actionMethods: 'POST'
      }
    });
    var sys_cd_tree_panel = Ext.create('Ext.tree.Panel', {
      id : 'datj_tree_panel',
      store: sys_cd_tree_store,
      rootVisible:false,
      useArrows: true,
      listeners:{
        checkchange:function(node,checked,option){
          if(checked){
            root=Ext.getCmp('datj_tree_panel').store.getRootNode();     
            getNodes(root,false);
            node.data.checked=true;
            node.updateInfo({checked:true});
            if (Ext.getCmp('jytj_win')!=undefined){Ext.getCmp('jytj_win').close();}
            switch (node.data.id) { 
              case "1": 
                dandtj_disp();
                break; 
              case "2": 
                jytj();
                break; 
              
            }
          }
          
        }
      }
    });
    if(!win){
        win = desktop.createWindow({
        id: 'datj',              
        title:'档案统计',
        width:200,
        height:500,
        x : 100,
        y : 50,
        iconCls: 'printdata',
        animCollapse:false,
        border: false,
        hideMode: 'offsets',
        layout: 'fit',
        split:true,              
        items: sys_cd_tree_panel
      });
    }

    new Ajax.Request("/desktop/get_sort", { 
        method: "POST",
        parameters: eval("({userid:" + currentUser.id + ",qxid:7})"),
        onComplete:  function(request) {
          if (request.responseText=='success'){
            win.show();
          }else{
            alert('您无档案统计的权限。');
            Ext.getCmp('datj').close();
          }
        }
    });
    
    
    return win;
  }

});

