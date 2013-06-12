window.MimeSetting = 
	openDlg : (el, resHeaders, staticMimes, cbf) ->
		self = @
		$el = $ el
		if _.isFunction staticMimes
			cbf = staticMimes
			staticMimes = null
		settingDialog = new JT.Model.Dialog {
			title : 'HTTP响应头配置'
			content : '<div class="mimeTypeList"></div>' + self._getResHeaderContainerHtml resHeaders
			modal : true
			btns : 
				'确定' : ->
					if mimeTypeCollection
						mimes = mimeTypeCollection.val()
					result = $el.find('tbody .item').map ->
						obj = $ @
						value = obj.find('.value input').val()
						if value
							{
								type : obj.find('.name').text()
								value : value
							}
						else
							null
					cbf null, {
						mimes : mimes || []
						res : result.toArray()
					}
				'取消' : ->
						cbf null
		}
		settingDialogView = new JT.View.Dialog {
			el : $el
			model : settingDialog
		}
		if staticMimes
			mimeTypeCollection = self._initSelect $el.find('.mimeTypeList'), staticMimes
		@
	_initSelect : (el, staticMimes) ->
		mimeTypeCollectionData = _.map staticMimes, (mime) ->
			{
				key : mime
				name : mime
			}
		mimeTypeCollection = new JT.Collection.Select mimeTypeCollectionData
		mimeTypeView = new JT.View.Select {
			el : el
			tips : '选择需要配置的文件类型'
			model : mimeTypeCollection
			multi : true
		}
		mimeTypeCollection
	_getResHeaderContainerHtml : (resHeaders) ->
		htmlArr = _.map resHeaders, (header) ->
			"<tr class='item'><td class='name'>#{header.name}</td><td class='value'><input type='text' placeholder='#{header.tip}' /></td></tr>"
		"<div class='resHeadersContainer'><p class='tip'>请填写需要配置的属性：</p><table><tbody>#{htmlArr.join('')}</tbody></table></div>"