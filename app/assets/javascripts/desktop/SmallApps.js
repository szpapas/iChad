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


Ext.define('MyDesktop.SmallApps', {
	extend: 'Ext.ux.desktop.Module',

	requires: [
		'*',
		'Ext.tree.*',
		'Ext.data.*',
		'Ext.window.MessageBox'
	],

	id:'smallapps',

	init : function(){
		this.launcher = {
			text: '应用程序',
			iconCls:'smallapps',
			handler : this.createWindow,
			scope: this
		}
	},
  createWindow : function(){
      var desktop = this.app.getDesktop();
      var win = desktop.getWindow('smallapps');
      if(!win){
          win = desktop.createWindow({
              id: 'smallapps',
              title:'应用程序',
              width:600,
              height:400,
              iconCls: 'smallapps',
              animCollapse:false,
              border: false,


              hideMode: 'offsets',

              layout: 'fit',
              items: [
                  {
                      xtype: 'htmleditor',
                      value: [
                          'Some <b>rich</b> <font color="red">text</font> goes <u>here</u><br>',
                          'Give it a try!'
                      ].join('')
                  }
              ]
          });
      }
      win.show();
      return win;
  }

});

