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


Ext.define('MyDesktop.AddressMan', {
	extend: 'Ext.ux.desktop.Module',

	requires: [
		'*',
		'Ext.tree.*',
		'Ext.data.*',
		'Ext.window.MessageBox'
	],

	id:'addressman',

	init : function(){
		this.launcher = {
			text: '百家争鸣',
			iconCls:'addressman',
			handler : this.createWindow,
			scope: this
		}
	},
  createWindow : function(){
      var desktop = this.app.getDesktop();
      var win = desktop.getWindow('addressman');
      if(!win){
          win = desktop.createWindow({
              id: 'addressman',
              title:'百家争鸣',
              width:600,
              height:400,
              iconCls: 'addressman',
              animCollapse:false,
              border: false,
              //defaultFocus: 'notepad-editor', EXTJSIV-1300

              // IE has a bug where it will keep the iframe's background visible when the window
              // is set to visibility:hidden. Hiding the window via position offsets instead gets
              // around this bug.
              hideMode: 'offsets',

              layout: 'fit',
              items: [
                  {
                      xtype: 'htmleditor',
                      //xtype: 'textarea',
                      //id: 'notepad-editor',
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

