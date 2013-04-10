/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact: http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file. Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/*!
* Ext JS Library 4.0
* Copyright(c) 2006-2011 Sencha Inc.
* licensing@sencha.com
* http://www.sencha.com/license
*/

Ext.define('MyDesktop.App', {


  extend: 'Ext.ux.desktop.App',

  requires: [
    'Ext.window.MessageBox',
    'Ext.ux.desktop.ShortcutModel',
    'MyDesktop.SystemStatus',
    'MyDesktop.GridWindow',
    'MyDesktop.TabWindow',
    'MyDesktop.Notepad',
    'MyDesktop.PrintData',
    'MyDesktop.ArchiveMan',
    'MyDesktop.AddressMan',
    'MyDesktop.SystemMan',
    'MyDesktop.DaPrint',
    'MyDesktop.Datj',
    'MyDesktop.Settings'
  ],

  init: function() {
    this.callParent();
    new Ajax.Request("/desktop/get_user", {
      method: "POST",
      onComplete: function(request) {
      currentUser = eval("("+request.responseText+")");
      Ext.getCmp('start_memu_id').setTitle(currentUser.username);
      }
    });
  },

  getModules : function(){
    return [
      new MyDesktop.ArchiveMan(),
      new MyDesktop.WenshuMan(),
      new MyDesktop.BorrowMan(),
      new MyDesktop.PrintData(),
      new MyDesktop.SystemMan(),
      new MyDesktop.DaPrint(),
      new MyDesktop.Datj(),
      new MyDesktop.SystemStatus()
      //,new MyDesktop.Notepad()
    ];
  },

  getDesktopConfig: function () {
    var me = this, ret = me.callParent();

    return Ext.apply(ret, {
      //cls: 'ux-desktop-black',

      contextMenuItems: [
        { text: '修改设置', handler: me.onSettings, scope: me }
      ],

      shortcuts: Ext.create('Ext.data.Store', {
        model: 'Ext.ux.desktop.ShortcutModel',
        data: [
          { name: '国土档案', iconCls: 'archiveman-shortcut', module: 'archiveman' },
          { name: '文书处理', iconCls: 'wenshuman-shortcut', module: 'wenshuman' },
          { name: '借阅管理', iconCls: 'borrowman-shortcut', module: 'borrowman' },          
          { name: '档案打印', iconCls: 'printdata-shortcut', module: 'daprint' },
          { name: '档案统计', iconCls: 'cpu-shortcut', module: 'datj'},
		  { name: '档案统计', iconCls: 'cpu-shortcut', module: 'systemstatus'},
          { name: '系统设置', iconCls: 'systemman-shortcut', module: 'systemman' }
          //,{ name: '智慧物联', iconCls: 'zhwl-shortcut', module: 'notepad' }
        ]
      }),
      wallpaper: 'assets/Blue-Sencha.jpg',
      wallpaperStretch: false
    });
  },

  // config for the start menu
  getStartConfig : function() {
    var me = this, ret = me.callParent();
    return Ext.apply(ret, {
      title: currentUser.username,
      iconCls: 'user',
      id : 'start_memu_id',
      height: 300,
      toolConfig: {
        width: 100,
        items: [
          {
            text:'Rev(1216)',
            iconCls:'settings',
            //handler: me.onSettings,
            scope: me
          },
          {  
            text:'修改密码',
            iconCls:'key',
            scope:this,
            handler:function(){

             var passPanel = new Ext.form.FormPanel({
               id : 'password_panel_id',
               autoScroll : true,
               width:320,
               height:150,
               layout:'absolute',
               items: [{ 
                 xtype: 'label',
                 text: '请输入新密码：',
                 x: 30,
                 y: 30
               },{
                 xtype: 'textfield',
                 x: 130,
                 y: 30,
                 width: 150,
                 name: 'password',
                 inputType : 'password'
               },{
                 xtype: 'label',
                 text: '请再次输入密码：',
                 x: 30,
                 y: 70
               },{
                 xtype: 'textfield',
                 x: 130,
                 y: 70,
                 width: 150,
                 name: 'password_confirmation',
                 inputType : 'password'
               }]
             });

             var passwdWin = new Ext.Window({
               id : 'change_password_win',
               iconCls : 'key',
               title: '修改密码',
               floating: true,
               shadow: true,
               draggable: true,
               closable: true,
               modal: true,
               width: 330,
               height: 200,
               layout: 'fit',
               plain: true,
               items: passPanel,
               buttons: [{
               text: '确定',
               handler: function() {
                 var myForm = Ext.getCmp('password_panel_id').getForm();
                 pars = myForm.getFieldValues();
              　　　if(pars['password_confirmation']!='' && pars['password_confirmation'].length>5){
                  if(pars['password_confirmation']==pars['password']){
                    new Ajax.Request("/desktop/change_password", { 
                       method: "POST",
                       parameters: pars,
                       onComplete:  function(request) {
                         if (request.responseText == 'Success') {
                         msg('成功', '密码修改成功.');
                         passwdWin.close();
                         } else {
                         msg('失败', '密码修改失败.');
                         }
                       }
                       });
                  }else{
                    alert("两次输入的密码不相同，请重新输入。");
                  }                 
                }else{
                  alert("密码不能为空或长度必须大于等于6位。");
                }
               }
               }]

             });

             passwdWin.show();
            }       
          },'-',
          {
            text:'退出系统',
            iconCls:'exit',
            handler: me.onLogout,
            scope: me
          }
        ]
      }
    });
  },

  getTaskbarConfig: function () {
    var ret = this.callParent();

    return Ext.apply(ret, {
      quickStart: [
        { name: '借阅管理', iconCls: 'borrowman', module: 'borrowman' },
        { name: '档案管理', iconCls: 'archiveman', module: 'archiveman' }
      ],
      trayItems: [
        { xtype: 'trayclock', flex: 1 }
      ]
    });
  },

  onLogout: function () {
    Ext.Msg.confirm('退出', '确定要退出登录?', function(btn){
      if (btn == 'yes') {
       window.location = "/sign_out";
      }
    });
  },

  onSettings: function () {
    var dlg = new MyDesktop.Settings({
      desktop: this.desktop
    });
    dlg.show();
  }

});

