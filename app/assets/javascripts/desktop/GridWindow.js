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

Ext.define('MyDesktop.GridWindow', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        'Ext.util.Format',
        'Ext.grid.Panel',
        'Ext.grid.RowNumberer'
    ],

    id:'grid-win',

    init : function(){
        this.launcher = {
            text: '档案目录',
            iconCls:'icon-grid',
            handler : this.createWindow,
            scope: this
        };
    },
	
    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('grid-win');

		Ext.define('Mulu', {
		    extend: 'Ext.data.Model',
		    fields: [
				{name: 'id', 		type: 'integer'},
				{name: 'city',		type: 'string'},
				{name: 'mlh',		type: 'string'},
				{name: 'flh',		type: 'string'},
				{name: 'ajs',		type: 'string'},
				{name: 'ajfile',	type: 'string'},
				{name: 'jnfile',	type: 'string'},
				{name: 'bz',		type: 'string'}
		    ]
		});
		
		
		var mulu_store =  Ext.create('Ext.data.Store', {
			model:Mulu,
		    proxy: {
		        type: 'ajax',
		        url : '/desktop/get_mulu',
		        reader: {
		            type: 'json',
		            root: 'rows'
		        }
		    }
		});
		
		mulu_store.load();
		
        if(!win){
            win = desktop.createWindow({
                id: 'grid-win',
                title:'档案目录',
                width:740,
                height:480,
                iconCls: 'icon-grid',
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items: [
                    {
                        border: false,
                        xtype: 'grid',
                        store: mulu_store,
                        columns: [
                            new Ext.grid.RowNumberer(),
							{
                                width: 20,
                                hidden: true,
                                dataIndex: 'id'	
							},
							{
                                text: "地区",
                                width: 70,
                                sortable: true,
                                dataIndex: 'city'
                            },
                            {
                                text: "目录号",
                                width: 70,
                                sortable: true,
                                dataIndex: 'mlh'
                            },
                            {
                                text: "分类号",
                                width: 70,
                                sortable: true,
                                dataIndex: 'flh'
                            },
                            {
                                text: "案卷数",
                                width: 70,
                                sortable: true,
                                dataIndex: 'ajs'
                            },
                            {
                                text: "档案文件",
                                width: 70,
                                sortable: true,
                                dataIndex: 'ajfile'
                            },
                            {
                                text: "卷内文件",
                                width: 70,
                                sortable: true,
                                dataIndex: 'jnfile'
                            }
                        ]
                    }
                ],
                tbar:[{
                    text:'增加目录',
                    tooltip:'增加一个案卷条目',
                    iconCls:'add',
					handler: function() {
						mulu_store.load();
					}
                }, '-', {
                    text:'输出设置',
                    tooltip:'输出目录属性设置',
                    iconCls:'option'
                },'-',{
                    text:'打印输出',
                    tooltip:'生成虚拟图像',
                    iconCls:'remove'
                },'-',{
                    text:'输出浏览',
                    tooltip:'浏览生成的图像',
                    iconCls:'remove'
                }]
            });
        }
        win.show();
        return win;
    }
});


