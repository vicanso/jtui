window.JT ?= {}
JT.Model ?= {}
JT.View ?= {}
JT.Collection ?= {}
$ = window.jQuery
JT.VERSION = '0.0.1'

JT.Model.Select = Backbone.Model.extend {
  defaults :
    # option选中是返回的key
    key : ''
    # option显示的值
    value : ''
}


JT.Collection.Select = Backbone.Collection.extend {
  model : JT.Model.Select
  ###*
   * val 给select赋值或者获取当前选择的值
   * @param  {String} {optional} value 需要设置选择的值
   * @return {[type]}       [description]
  ###
  val : (value) ->
    if !value
      result = @find (model) ->
        model.get 'checked'
      if result
        result.get 'key'
      else
        null
    else
      @each (model) ->
        if value != model.get 'key'
          model.set 'checked', false
        else
          model.set 'checked', true
      @

}

JT.View.Select = Backbone.View.extend {
  template : _.template '<div class="jtSelect jtBorderRadius3">' +
    '<a href="javascript:;" class="showSelect jtGrayGradient"><span class="jtArrowDown"></span></a>' +
    '<input class="userInput" type="text" title="<%= tips %>" placeholder="<%= tips %>" />' +
    '<ul class="selectList"><%= list %></ul>' +
  '</div>'
  optionTemplate : _.template '<li class="option" data-key="<%= key %>"><%= name %></li>'
  events :
    'click .showSelect' : 'toggleSelectList'
    'keyup .userInput' : 'userInput'
    'dblclick .userInput' : 'dblclickUserInput'
    'click .option' : 'clickSelect'
  ###*
   * userInput 用于处理用户输入事件，如果按下enter则显示列表，按esc则隐藏列表
   * @param  {Object} e jQuery event对象
   * @return {[type]}   [description]
  ###
  userInput : (e) ->
    if e.keyCode == 0x0d
      @show @$el.find '.selectList'
    else if e.keyCode == 0x1b
      @hide @$el.find '.selectList'
    @
  ###*
   * toggleSelectList 切换显示选择列表
   * @return {[type]} [description]
  ###
  toggleSelectList : ->
    $el = @$el
    selectList = $el.find '.selectList'
    if selectList.is ":hidden"
      $el.find('.userInput').val ''
      @show()
    else
      @hide()
    @
  ###*
   * dblclickUserInput 双击处理，显示列表
   * @return {[type]} [description]
  ###
  dblclickUserInput : ->
    $el = @$el
    $el.find('.userInput').val ''
    @show $el.find '.selectList'
  ###*
   * show 显示选择列表
   * @return {[type]}            [description]
  ###
  show : ->
    @filter()
    @$el.find('.showSelect span').removeClass('jtArrowDown').addClass 'jtArrowUp'
    @$el.find('.selectList').show()
    @
  ###*
   * hide 隐藏显示列表
   * @return {[type]}            [description]
  ###
  hide : ->
    @reset()
    @$el.find('.showSelect span').removeClass('jtArrowUp').addClass 'jtArrowDown'
    @$el.find('.selectList').hide()
    @
  ###*
   * filter 筛选符合条件的option
   * @return {[type]} [description]
  ###
  filter : ->
    $el = @$el
    key = $el.find('.userInput').val().trim()
    options = $el.find '.selectList .option'
    if key
      options.each (i, option) ->
        option = $ option
        value = option.text()
        if !~value.indexOf key
          option.hide()
    else
      options.show()
    @
  ###*
   * reset 重置（将所有的option都显示）
   * @return {[type]} [description]
  ###
  reset : ->
    @$el.find('.selectList .option').show()
    @
  ###*
   * clickSelect 用户点击选择
   * @param  {Object} e jQuery event对象
   * @return {[type]}   [description]
  ###
  clickSelect : (e) ->
    self = @
    index = @$el.find('.option').index e.currentTarget
    @model.each (model, i) ->
      if i != index
        model.set 'checked', false
      else
        model.set 'checked', true
        self.toggleSelectList()
    @
  ###*
   * select 选择某一option
   * @param  {JT.Model.Select} model 标记为选中的model
   * @return {[type]}       [description]
  ###
  select : (model) ->
    @$el.find('.userInput').val model.get 'name'
    @
  ###*
   * destroy 销毁对象
   * @return {[type]} [description]
  ###
  destroy : ->
    @remove()
  ###*
   * initialize 构造函数
   * @return {[type]} [description]
  ###
  initialize : ->
    self = @
    @$el.addClass 'jtWidget'
    _.each 'name key'.split(' '), (event) ->
      self.listenTo self.model, "change:#{event}", (model, value) ->
        self.change model, event, value
    _.each 'add remove'.split(' '), (event) ->
      self.listenTo self.model, event, (models, collection, options) ->
        self.item event, models, options
    self.listenTo self.model, 'change:checked', (model, value) ->
      if value == true
        self.select model
    @render()
    @
  ###*
   * change model的change事件
   * @param  {JT.Model.Select} model 触发该事件的model
   * @param  {String} key change的属性
   * @param  {String} value change后的值
   * @return {[type]}       [description]
  ###
  change : (model, key, value) ->
    index = @model.indexOf model
    option = @$el.find('.selectList .option').eq index
    switch key
      when 'name' then option.html value
      else option.attr 'data-key', value
    @
  ###*
   * item 添加或删除item
   * @param  {String} type 操作的类型add、remove
   * @param  {JT.Collection.Select, JT.Model.Select} models models
   * @param  {Object} options remove操作中，index属性标记删除元素的位置
   * @return {[type]}         [description]
  ###
  item : (type, models, options) ->
    self = @
    selectList = @$el.find '.selectList'
    if !_.isArray models
      models = [models]
    if type == 'add'
      _.each models, (model) ->
        data = model.toJSON()
        selectList.append self.optionTemplate data
    else if type == 'remove'
      selectList.find('.option').eq(options.index).remove()
    @
  ###*
   * [render description]
   * @return {[type]} [description]
  ###
  render : ->
    self = @
    listHtmlArr = _.map @model.toJSON(), (item) ->
      data = 
        name : item.name
        key : item.key
      self.optionTemplate data
    @templateData = 
      tips : @options.tips
      list : listHtmlArr.join ''
    html = @template @templateData
    @$el.html html
    @
}


JT.Model.Dialog = Backbone.Model.extend {
  defaults : 
    title : '未命名标题'
    content : '未定义内容'
    destroyOnClose : true
}
JT.View.Dialog = Backbone.View.extend {
  template : _.template '<h3 class="title jtBlueGradient jtBorderRadius3"><a href="javascript:;" class="close">×</a><span><%= title %></span></h3>' +
    '<div class="content"><%= content %></div>' + 
    '<%= btns %>'
  events : 
    'click .btns .btn' : 'btnClick'
    'click .close' : 'close'
  ###*
   * btnClick 用户点击按钮处理
   * @param  {Object} e jQuery event对象
   * @return {[type]}   [description]
  ###
  btnClick : (e) ->
    btnCbfs = @model.get 'btns'
    obj = $ e.currentTarget
    key = obj.text()
    cbf = btnCbfs?[key]
    cbfResult = null
    if _.isFunction cbf
      cbfResult = cbf @$el
    if cbfResult != false
      @close()
    @
  ###*
   * open 打开对话框
   * @return {[type]} [description]
  ###
  open : ->
    if @modalMask
      @modalMask.show()
    @$el.show()
    @
  ###*
   * close 关闭对话框
   * @return {[type]} [description]
  ###
  close : ->
    if @modalMask
      @modalMask.hide()
    if @model.destroyOnClose
      @destroy()
    else
      @$el.hide()
    @
  ###*
   * destroy 销毁对象
   * @return {[type]} [description]
  ###
  destroy : ->
    if @model.modal
      @modalMask.remove()
    @remove()
  ###*
   * getBtnsHtml 获取按钮的html
   * @param  {Object} btns {key : handle}按钮的配置
   * @return {[type]}      [description]
  ###
  getBtnsHtml : (btns) ->
    if !btns
      '<div class="btns" style="display:none;"></div>'
    else
      btnHtmlArr = []
      _.each btns, (value, key) ->
        btnHtmlArr.push "<a class='jtBtn btn' href='javascript:;'>#{key}</a>"
      "<div class='btns'>#{btnHtmlArr.join('')}</div>"
  ###*
   * update 更新对话框属性，title content btns
   * @param  {String} type 更新的类型：title content btns
   * @param  {String, Object} value 更新的值
   * @return {[type]}       [description]
  ###
  update : (type, value) ->
    if type == 'title'
      @$el.find('.title span').text value
    else if type == 'content'
      @$el.find('.content').text value
    else if type == 'btns'
      btnsHtml = @getBtnsHtml value
      btns = @$el.find '.btns'
      $(btnsHtml).insertBefore btns
      btns.remove()
  ###*
   * initialize 构造函数
   * @return {[type]} [description]
  ###
  initialize : ->
    self = @
    @$el.addClass 'jtWidget jtDialog jtBorderRadius3'
    _.each 'title content btns'.split(' '), (event) ->
      self.listenTo self.model, "change:#{event}", (model, value) ->
        self.update event, value
    @render()
    @
  ###*
   * [render description]
   * @return {[type]} [description]
  ###
  render : ->
    @templateData = @model.toJSON()

    @templateData.btns = @getBtnsHtml @templateData.btns
    if @model.modal
      @modalMask = $('<div class="jtMask" />').appendTo 'body'
    html = @template @templateData
    @$el.html html
}

JT.View.Alert = Backbone.View.extend {
  initialize : ->
    el = $('<div class="jtAlertDlg" />').appendTo('body').get 0
    new JT.View.Dialog {
      el : el
      model : @model
    }
}

JT.DatePicker = Backbone.View.extend {
  events : 
    'click .daysContainer .prev' : 'prevMonth'
    'click .daysContainer .next' : 'nextMonth'
    'click .daysContainer .dateView' : 'showMonths'
    'click .daysContainer .day' : 'selectDay'
    'click .monthsContainer .prev' : 'prevYear'
    'click .monthsContainer .next' : 'nextYear'
    'click .monthsContainer .month' : 'selectMonth'
  datePickerHtml : '<div class="jtDatePicker jtBorderRadius3">' +
    '<div class="arrowContainer arrowContainerBottom"></div>' +
    '<div class="arrowContainer"></div>' +
    '<div class="daysContainer">' +
      '<table>' + 
        '<thead></thead>' +
        '<tbody></tbody>' +
      '</table>' +
    '</div>' +
    '<div class="monthsContainer">' +
      '<table>' + 
        '<thead></thead>' +
        '<tbody></tbody>' +
      '</table>' +
    '</div>' +
    '<div class="yearsContainer">' +
      '<table>' + 
        '<thead></thead>' +
        '<tbody></tbody>' +
      '</table>' +
    '</div>' +
  '</div>'
  monthsTheadTemplate : _.template '<tr>' +
    '<th class="prev">‹</th>' +
    '<th colspan="5" class="dateView"><%= year %></th>' + 
    '<th class="next">›</th>' + 
  '</tr>'
  daysTheadTemplate : _.template '<tr>' +
    '<th class="prev">‹</th>' +
    '<th colspan="5" class="dateView"><%= date %></th>' + 
    '<th class="next">›</th>' + 
  '</tr>' + 
  '<tr>' + 
    '<th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th>' +
  '</tr>'
  ###*
   * initialize 构造函数
   * @return {[type]} [description]
  ###
  initialize : ->
    self = @
    $el = @$el
    options = @options
    options.months ?= ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    @date = new Date options.date || new Date()
    elOffset = $el.offset()
    datePicker = $ @datePickerHtml
    datePicker.css {left : elOffset.left, top : elOffset.top + $el.outerHeight(true) + 10}
    datePicker.appendTo 'body'
    @$inputObj = $el
    @setElement datePicker.addClass 'jtWidget'
    @render()
    @$inputObj.on 'click.jtDatePicker', () ->
      if datePicker.is ':hidden'
        self.show()
      else
        self.hide()
    @
  ###*
   * prevMonth 上一个月
   * @return {[type]} [description]
  ###
  prevMonth : ->
    date = @date
    month = date.getMonth()
    if month > 0
      date.setMonth month - 1
    else
      date.setYear date.getFullYear() - 1
      date.setMonth 11
    @render()
  ###*
   * nextMonth 下一个月
   * @return {[type]} [description]
  ###
  nextMonth : ->
    date = @date
    month = date.getMonth()
    if month < 11
      date.setMonth month + 1
    else
      date.setYear date.getFullYear() + 1
      date.setMonth 0
    @render()
  ###*
   * prevYear 上一年
   * @return {[type]} [description]
  ###
  prevYear : ->
    date = @date
    @date.setFullYear date.getFullYear() - 1
    @render 'month'
  ###*
   * nextYear 下一年
   * @return {[type]} [description]
  ###
  nextYear : ->
    date = @date
    @date.setFullYear date.getFullYear() + 1
    @render 'month'
  ###*
   * showMonths 显示月份选择
   * @return {[type]} [description]
  ###
  showMonths : ->
    @render 'month'
  ###*
   * selectDay 用户选择日期
   * @param  {Object} e jQuery event对象
   * @return {[type]}   [description]
  ###
  selectDay : (e) ->
    obj = $ e.currentTarget
    @date.setDate obj.text()
    @val().hide()
    @
  ###*
   * val 获取当前选择的日期
   * @return {[type]} [description]
  ###
  val : ->
    date = @date
    month = date.getMonth() + 1
    year = date.getFullYear()
    day = date.getDate()
    if month < 10
      month = '0' + month
    if day < 10
      day = '0' + day
    @$inputObj.val "#{year}-#{month}-#{day}"
    @
  ###*
   * selectMonth 用户选择月份
   * @param  {Object} e jQuery event对象
   * @return {[type]}   [description]
  ###
  selectMonth : (e) ->
    obj = $ e.currentTarget
    @date.setMonth obj.index '.month'
    @val().render 'day'
    @
  ###*
   * show 显示
   * @return {[type]} [description]
  ###
  show : ->
    @render()
    @$el.show()
    @
  ###*
   * hide 隐藏
   * @return {[type]} [description]
  ###
  hide : ->
    @$el.hide()
    @
  ###*
   * getMonthsTbody 获取月份显示表格的tbody
   * @return {[type]} [description]
  ###
  getMonthsTbody : ->
    tbodyHtml = []
    months = @options.months
    tbodyHtml.push '<tr><td colspan="7">'
    _.each months, (month, i) ->
      tbodyHtml.push "<span class='month'>#{month}</span>"
    tbodyHtml.push '</td></tr>'
    tbodyHtml.join ''
  ###*
   * getDaysTbody 获取日期显示表格的tbody
   * @return {[type]} [description]
  ###
  getDaysTbody : ->
    dayTotalList = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    date = new Date @date.getTime()
    date.setDate 1
    index = date.getDay()

    month = date.getMonth()
    year = date.getFullYear()

    if (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
      dayTotalList[1] = 29

    dateTotal = dayTotalList[month] + index

    currentDate = new Date()
    currentDayMatchFlag = false
    if currentDate.getMonth() == month && currentDate.getFullYear() == year
      currentDayMatchFlag = true
      currentDay = currentDate.getDate()

    selectDayMatchFlag = false
    if @date.getMonth() == month && @date.getFullYear() == year
      selectDayMatchFlag = true
      selectDay = @date.getDate()

    tbodyHtml = []
    for i in [0...dateTotal]
      if i == 0
        tbodyHtml.push '<tr>'
      else if i % 7 == 0
        tbodyHtml.push '</tr><tr>'
      else if i == dateTotal
        tbodyHtml.push '</tr>'
      if i < index
        tbodyHtml.push "<td></td>"
      else
        day = i - index + 1
        if selectDayMatchFlag && day == selectDay
          tbodyHtml.push "<td class='active jtBorderRadius3 day'>#{day}</td>"
        else if currentDayMatchFlag && day == currentDay
          tbodyHtml.push "<td class='currentDay jtBorderRadius3 day'>#{day}</td>"
        else
          tbodyHtml.push "<td class='day'>#{day}</td>"
    tbodyHtml.join ''
  ###*
   * getViewDate 获取显示的日期，格式化"MM YYYY"
   * @return {[type]} [description]
  ###
  getViewDate : ->
    months = @options.months
    "#{months[@date.getMonth()]} #{@date.getFullYear()}"
  ###*
   * [render description]
   * @param  {[type]} type =             'day' [description]
   * @return {[type]}      [description]
  ###
  render : (type = 'day') ->
    datePicker = @$el
    daysContainer = datePicker.find '.daysContainer'
    monthsContainer = datePicker.find '.monthsContainer'
    if type == 'day'
      daysContainer.show()
      monthsContainer.hide()
      daysContainer.find('thead').html @daysTheadTemplate {date : @getViewDate()}
      daysContainer.find('tbody').html @getDaysTbody()
    else if type == 'month'
      daysContainer.hide()
      monthsContainer.show()
      monthsContainer.find('thead').html @monthsTheadTemplate {year : @date.getFullYear()}
      monthsContainer.find('tbody').html @getMonthsTbody()

    @
  ###*
   * destroy 销毁对象
   * @return {[type]} [description]
  ###
  destroy : ->
    @$inputObj.off '.jtDatePicker'
    @remove()
}



JT.Model.Accordion = Backbone.Model.extend {}

JT.Collection.Accordion = Backbone.Collection.extend {
  model : JT.Model.Accordion
}


JT.View.Accordion = Backbone.View.extend {
  events : 
    'click .item .title' : 'clickActive'
  itemTemplate : _.template '<div class="item">' +
    '<h3 class="title jtGrayGradient"><div class="jtArrowDown"></div><div class="jtArrowRight"></div><span><%= title %></span></h3>' +
    '<div class="content"><%= content %></div>' +
  '</div>'
  ###*
   * initialize 构造函数
   * @return {[type]} [description]
  ###
  initialize : ->
    self = @
    @$el.addClass 'jtWidget jtAccordion jtBorderRadius3'
    _.each 'add remove'.split(' '), (event) ->
      self.listenTo self.model, event, (models, collection, options) ->
        self.item event, models, options
    _.each 'title content'.split(' '), (event) ->
      self.listenTo self.model, "change:#{event}", (model, value) ->
        self.change model, event, value
    self.listenTo self.model, 'change:active', (model, value, options) ->
      if value == true
        self.active self.model.indexOf model
    @render()
    @
  ###*
   * change change事件处理
   * @param  {JT.Model.Accordion} model change事件的对象
   * @param  {String} key change的属性
   * @param  {String} value change后的值
   * @return {[type]}       [description]
  ###
  change : (model, key, value) ->
    item = @$el.find('.item').eq @model.indexOf model
    switch key
      when 'title' then item.find('.title span').html value
      else item.find('.content').html value
  ###*
   * item 添加或删除item
   * @param  {String} type 操作类型：add remove
   * @param  {JT.Collection.Accordion, JT.Model.Accordion} models models
   * @param  {Object} options 在删除操作中，index属性标记要删除元素的位置
   * @return {[type]}         [description]
  ###
  item : (type, models, options) ->
    self = @
    if !_.isArray models
      models = [models]
    if type == 'add'
      _.each models, (model) ->
        data = model.toJSON()
        self.$el.append self.itemTemplate data
    else if type == 'remove'
      self.$el.find('.item').eq(options.index).remove()
    @
  ###*
   * clickActive 点击选择处理
   * @param  {Object} e jQuery event对象
   * @return {[type]}   [description]
  ###
  clickActive : (e) ->
    index = $(e.currentTarget).closest('.item').index()
    @model.at(index).set 'active', true
  ###*
   * active 设置item为活动状态
   * @param  {Integer} activeIndex 设置为活动的item位置，默认为0
   * @return {[type]}             [description]
  ###
  active : (activeIndex = 0) ->
    $el = @$el
    if activeIndex < 0
      activeIndex = 0
    @model.each (model, i) ->
      if i != activeIndex
        model.set 'active', false
    $el.find('.item').each (i) ->
      obj = $ @
      if i == activeIndex
        obj.addClass('active').find('.title').addClass('jtBlueGradient').removeClass 'jtGrayGradient'
      else
        obj.removeClass('active').find('.title').addClass('jtGrayGradient').removeClass 'jtBlueGradient'
    @
  ###*
   * destroy 销毁对象
   * @return {[type]} [description]
  ###
  destroy : ->
    @remove()
  ###*
   * [render description]
   * @return {[type]} [description]
  ###
  render : ->
    self = @
    htmlArr = _.map @model.toJSON(), (item) ->
      self.itemTemplate item
    @$el.html htmlArr.join ''
    @model.at(0).set 'active', true
    @
}


JT.Model.Tab = Backbone.Model.extend {}

JT.Collection.Tabs = Backbone.Collection.extend {
  model : JT.Model.Tab
}

JT.View.Tabs = Backbone.View.extend {
  events : 
    'click .nav li' : 'clickActive'
  ###*
   * initialize 构造函数
   * @return {[type]} [description]
  ###
  initialize : ->
    self = @
    @$el.addClass 'jtWidget jtTabs jtBorderRadius3'
    _.each 'add remove'.split(' '), (event) ->
      self.listenTo self.model, event, (models, collection, options) ->
        self.item event, models, options
    self.listenTo self.model, 'change:active', (model, value) ->
      if value == true
        self.active self.model.indexOf model
    _.each 'title content'.split(' '), (event) ->
      self.listenTo self.model, "change:#{event}", (model, value) ->
        self.change model, event, value
    @render()
    @
  ###*
   * item 添加或删除item
   * @param  {String} type 操作的类型：add remove
   * @param  {JT.Collection.Tabs, JT.Model.Tab} models models
   * @param  {Object} options 在删除操作中，index属性标记要删除元素的位置
   * @return {[type]}         [description]
  ###
  item : (type, models, options) ->
    self = @
    $el = @$el
    nav = $el.find '.nav'
    if !_.isArray models
      models = [models]
    if type == 'add'
      _.each models, (model) ->
        data = model.toJSON()
        nav.append "<li>#{data.title}</li>"
        $el.append "<div class='tab'>#{data.content}</div>"
    else if type == 'remove'
      nav.find('li').eq(options.index).remove()
      $el.find('.tab').eq(options.index).remove()
    @
  ###*
   * change change事件的处理
   * @param  {JT.Model.Tab} model 触发change事件的model
   * @param  {String} type  change的属性
   * @param  {String} value change后的值
   * @return {[type]}       [description]
  ###
  change : (model, key, value) ->
    index = @model.indexOf model
    if key == 'title'
      @$el.find('.nav li').eq(index).html value
    else
      @$el.find('.tab').eq(index).html value
    @
  ###*
   * clickActive 用户点击选择处理
   * @param  {Object} e jQuery event对象
   * @return {[type]}   [description]
  ###
  clickActive : (e) ->
    index = $(e.currentTarget).index()
    @model.at(index).set 'active', true
    @
  ###*
   * active 设置item为活动状态
   * @param  {Integer} activeIndex 设置为活动的item位置，默认为0
   * @return {[type]}             [description]
  ###
  active : (activeIndex = 0) ->
    $el = @$el
    if activeIndex < 0
      activeIndex = 0
    @model.each (model, i) ->
      if i != activeIndex
        model.set 'active', false
    liList = $el.find '.nav li'
    tabList = $el.find '.tab'
    for i in [0..liList.length]
      if i == activeIndex
        liList.eq(i).addClass 'active'
        tabList.eq(i).addClass 'active'
      else
        liList.eq(i).removeClass 'active'
        tabList.eq(i).removeClass 'active'
    @
  ###*
   * destroy 销毁对象
   * @return {[type]} [description]
  ###
  destroy : ->
    @remove()
  ###*
   * [render description]
   * @param  {[type]} activeIndex =             0 [description]
   * @return {[type]}             [description]
  ###
  render : (activeIndex = 0) ->
    self = @
    data = @model.toJSON()
    titleArr = _.pluck data, 'title'
    contentArr = _.pluck data, 'content'
    liHtmlArr = _.map titleArr, (title) ->
      "<li>#{title}</li>"
    tabHtmlArr = _.map contentArr, (content) ->
      "<div class='tab'>#{content}</div>"
    @$el.html "<ul class='jtBlueGradient nav'>#{liHtmlArr.join('')}</ul>#{tabHtmlArr.join('')}"
    @model.at(0).set 'active', true
    @
}