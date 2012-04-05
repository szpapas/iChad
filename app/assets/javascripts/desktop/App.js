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

Ext.define('MyDesktop.App', {
    extend: 'Ext.ux.desktop.App',

    requires: [
        'Ext.window.MessageBox',
        'Ext.ux.desktop.ShortcutModel',

        'MyDesktop.SystemStatus',
        'MyDesktop.VideoWindow',
        'MyDesktop.GridWindow',
        'MyDesktop.TabWindow',
        'MyDesktop.AccordionWindow',
        'MyDesktop.BogusMenuModule',
    //    'MyDesktop.BogusModule',

        'MyDesktop.Notepad',
        'MyDesktop.PrintData',
        'MyDesktop.ArchiveMan',
        'MyDesktop.AddressMan',
		'MyDesktop.SystemMan',
        'MyDesktop.Settings'
    ],

    init: function() {
        // custom logic before getXYZ methods get called...

        this.callParent();
        
        new Ajax.Request("/desktop/get_user", { 
          method: "POST",
          onComplete:  function(request) {
            currentUser = eval("("+request.responseText+")");
            Ext.getCmp('start_memu_id').setTitle(currentUser.username);
          }
        });
    },

    getModules : function(){
        return [
            new MyDesktop.VideoWindow(),

            new MyDesktop.AddressMan(),
            new MyDesktop.ArchiveMan(),
            new MyDesktop.WenshuMan(),
            new MyDesktop.BorrowMan(),
            new MyDesktop.Notepad(),
            new MyDesktop.PrintData(),
            new MyDesktop.SystemStatus(),

           new MyDesktop.SystemMan(),
         //  new MyDesktop.SmallApps(),

         //   new MyDesktop.BogusModule(),
         //   new MyDesktop.TabWindow(),
            new MyDesktop.AccordionWindow(),
            new MyDesktop.BogusMenuModule(),

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
                    { name: '百家争鸣', iconCls: 'addressman-shortcut',  module: 'addressman' },
                    { name: '国土档案', iconCls: 'archiveman-shortcut',  module: 'archiveman' },
                    { name: '文书处理', iconCls: 'wenshuman-shortcut',   module: 'wenshuman' },
                    { name: '借阅管理', iconCls: 'borrowman-shortcut',   module: 'borrowman' },
                    { name: '编研利用', iconCls: 'notepad-shortcut',     module: 'notepad' },
                    { name: '影像打印', iconCls: 'printdata-shortcut',   module: 'printdata' },
                    { name: '档案统计', iconCls: 'cpu-shortcut',         module: 'systemstatus'},
                   	{ name: '系统管理', iconCls: 'systemman-shortcut',   module: 'systemman' },
                  //  { name: '应用程序', iconCls: 'smallapps-shortcut',   module: 'smallapps' }
                  //  { name: '亲朋好友', iconCls: 'accordion-shortcut', module: 'acc-win' },
                ]
            }),
            wallpaper: 'wallpapers/Blue-Sencha.jpg',
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
                        text:'设置',
                        iconCls:'settings',
                        handler: me.onSettings,
                        scope: me
                    },
                    '-',
                    {
                        text:'退出',
                        iconCls:'logout',
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
                { name: '亲朋好友', iconCls: 'accordion', module: 'acc-win' },
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

