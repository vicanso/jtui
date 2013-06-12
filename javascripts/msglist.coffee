MsgModel = Backbone.Model.extend {
	defaults :
		name : ''
		status : ''
}

MsgCollection = Backbone.Collection.extend {
	model : MsgModel
}

MsgListView = Backbone.View.extend {
	events :
		'click .title .minimize' : 'clickMinimize'
		'click .title .maximize' : 'clickMaximize'
	template : _.template '<li class="item <%= status %>"><%= name %></li>'
	clickMinimize : (e) ->
		@minimize = true
		obj = $ e.currentTarget
		obj.siblings('.maximize').addBack().toggle()
		@setTotal()
		obj.siblings('.total').show()
		@$el.find('.items').hide()
		@
	clickMaximize : (e) ->
		@minimize = false
		obj = $ e.currentTarget
		obj.siblings('.minimize').addBack().toggle()
		obj.siblings('.total').hide()
		@$el.find('.items').show()
		@
	setTotal : ->
		if @minimize
			@$el.find('.title .total').show().text "(#{@model.length})"
		@
	getListHtml : ->
		self = @
		htmlArr = @model.map (item) ->
			self.template item.toJSON()
		"<ul class='items'>#{htmlArr.join('')}</ul>"
	remove : (index) ->
		@$el.find('.items .item').eq(index).remove()
		@setTotal()
	initialize : ->
		self = @
		$el = @$el
		$el.addClass('msgList').html "<h4 class='title jtGrayGradient'><a href='javascript:;' class='minimize' title='最小化'>_</a><a href='javascript:;' class='maximize' title='最大化'></a>消息列表<span class='total'></span></h4>#{self.getListHtml()}"
		self.listenTo self.model, 'remove',  (model, collection, options) ->
			self.remove options.index
}

window.MsgListView = MsgListView
window.MsgCollection = MsgCollection