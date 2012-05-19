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


Ext.define('MyDesktop.DaPrint', {
	extend: 'Ext.ux.desktop.Module',

	requires: [
		'*',
		'Ext.tree.*',
		'Ext.data.*',
		'Ext.window.MessageBox'
	],

	id:'daprint',

	init : function(){
		this.launcher = {
			text: '档案打印',
			iconCls:'printdata',
			handler : this.createWindow,
			scope: this
		}
	},
  createWindow : function(){
      var desktop = this.app.getDesktop();
      var win = desktop.getWindow('daprint');
		
      if(!win){
          win = desktop.createWindow({
              id: 'daprint',
              title:'档案打印',
              	
				width:250,
	            height:355,
              
				//layout: 'border',
				modal: true,
				
				items:[{
						
						//region: 'north',
					height: 320,
						xtype:'form',
						border:false,
						layout: 'absolute',
						items: [
							{
			          	      xtype: 'combobox',
				              width: 215,
				              fieldLabel: '打印类别',
								name: 'dylb',
								store: print_lb_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								id:'print_dylb',
				              labelWidth: 65,
				              x: 10,
				              y: 10
			            	},
							{
			                  xtype: 'combobox',
			                  width: 215,
			                  fieldLabel: '全宗名称',
								store: qz_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'id',
								displayField:'dwdm',
								triggerAction:'all',
								name: 'qzh',
			                  labelWidth: 65,
			                  x: 10,
			                  y: 40
			              	},
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '档案类别',
								store: dalb_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'id',
								displayField:'lbmc',
								triggerAction:'all',
								name: 'dalb',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 70
			                },
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '保管期限',
			                    labelWidth: 65,
								name: 'bgqx',
								store: bgqx_store,
								emptyText:'请选择',
								mode: 'remote',
								minChars : 2,
								valueField:'text',
								displayField:'text',
								triggerAction:'all',
								id:'print_bgqx',
			                    x: 10,
			                    y: 100
			                },
							{
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '年度',
								name: 'nd',
								id:'print_nd',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 130
			                },
			                  {
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '目录号',
								name: 'mlh',
								id:'print_mlh',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 160
			                },
			                {
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '机构问题号',
								name: 'jgwth',
								id:'print_jgwth',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 190
			                },
							{
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '起案卷号',
								name: 'qajh',
								id:'print_qajh',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 220
			                },
			                {
			                    xtype: 'textfield',
			                    width: 215,
			                    fieldLabel: '止案卷号',
								name: 'zajh',
								id:'print_zajh',
			                    labelWidth: 65,
			                    x: 10,
			                    y: 250
			                },
			                {
			                    xtype: 'button',
			                    text: '页面设置',
								iconCls:'print',
			                    x: 10,
			                    y: 280
			                },
			                {
			                    xtype: 'button',
			                    text: '打印',
								iconCls:'print',
			                    x: 105,
			                    y: 280,
								handler : function() {
									var pars=this.up('panel').getForm().getValues();
									Ext.getCmp('print_preview_img').getEl().dom.src = 'assets/dady/1_A2_0001_ML02.jpg';
									new Ajax.Request("/desktop/print_da", { 
										method: "POST",
										parameters: pars,
										onComplete:	 function(request) {
											fhz=request.responseText.split(":")
											if (fhz[0]=='success'){
												alert("打印成功。" + fhz[1]);
											}else{
												alert(request.responseText);
											}
										}
									});
								}
			                },
			                {
			                    xtype: 'button',
			                    text: '退出 ',
								iconCls:'exit',
			                    x: 175,
			                    y: 280
			                },
			                {
			                    xtype: 'box', //或者xtype: 'component',
					            id: 'print_preview_img',
					            width: 150, //图片宽度
								x: 350,
				                y: 10,
					            autoEl: {
					            tag: 'img',    //指定为img标签
					            alt: './dady/1_A2_0001_ML02.jpg' , }    //指定url路径


			                },
							{
			                    xtype: 'combobox',
			                    width: 215,
			                    fieldLabel: '文件列表',
			                    labelWidth: 65,
			                    x: 350,
			                    y: 280
			                }


			              ]
					}

					]
              
          });
      }
      win.show();
      return win;
  }

});

