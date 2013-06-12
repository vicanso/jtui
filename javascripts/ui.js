(function() {
  var $, _ref, _ref1, _ref2, _ref3;

  if ((_ref = window.JT) == null) {
    window.JT = {};
  }

  if ((_ref1 = JT.Model) == null) {
    JT.Model = {};
  }

  if ((_ref2 = JT.View) == null) {
    JT.View = {};
  }

  if ((_ref3 = JT.Collection) == null) {
    JT.Collection = {};
  }

  $ = window.jQuery;

  JT.VERSION = '0.0.1';

  JT.Model.Select = Backbone.Model.extend({
    defaults: {
      key: '',
      value: ''
    }
  });

  JT.Collection.Select = Backbone.Collection.extend({
    model: JT.Model.Select,
    /**
     * val 给select赋值或者获取当前选择的值
     * @param  {String} {optional} value 需要设置选择的值
     * @return {[type]}       [description]
    */

    val: function(value) {
      var result;
      if (!value) {
        result = _.compact(this.map(function(model) {
          if (model.get('checked')) {
            return model.get('key');
          } else {
            return null;
          }
        }));
        return result;
      } else {
        this.each(function(model) {
          var key;
          key = model.get('key');
          if (_.isArray(value)) {
            if (~_.indexOf(value, key)) {
              return model.set('checked', true);
            } else {
              return model.set('checked', false);
            }
          } else {
            if (value !== key) {
              return model.set('checked', false);
            } else {
              return model.set('checked', true);
            }
          }
        });
        return this;
      }
    }
  });

  JT.View.Select = Backbone.View.extend({
    template: _.template('<div class="jtSelect jtBorderRadius3">' + '<a href="javascript:;" class="showSelect jtGrayGradient"><span class="jtArrowDown"></span></a>' + '<input class="userInput" type="text" title="<%= tips %>" placeholder="<%= tips %>" />' + '<ul class="selectList"><%= list %></ul>' + '</div>'),
    optionTemplate: _.template('<li class="option" data-key="<%= key %>"><%= name %></li>'),
    events: {
      'click .showSelect': 'toggleSelectList',
      'keyup .userInput': 'userInput',
      'dblclick .userInput': 'dblclickUserInput',
      'click .option': 'clickSelect'
    },
    /**
     * userInput 用于处理用户输入事件，如果按下enter则显示列表，按esc则隐藏列表
     * @param  {Object} e jQuery event对象
     * @return {[type]}   [description]
    */

    userInput: function(e) {
      if (e.keyCode === 0x0d) {
        this.show(this.$el.find('.selectList'));
      } else if (e.keyCode === 0x1b) {
        this.hide(this.$el.find('.selectList'));
      }
      return this;
    },
    /**
     * toggleSelectList 切换显示选择列表
     * @return {[type]} [description]
    */

    toggleSelectList: function() {
      var $el, selectList;
      $el = this.$el;
      selectList = $el.find('.selectList');
      if (selectList.is(":hidden")) {
        if (!this.options.multi) {
          $el.find('.userInput').val('');
        }
        this.show();
      } else {
        this.hide();
      }
      return this;
    },
    /**
     * dblclickUserInput 双击处理，显示列表
     * @return {[type]} [description]
    */

    dblclickUserInput: function() {
      var $el;
      $el = this.$el;
      if (!this.options.multi) {
        $el.find('.userInput').val('');
      }
      return this.show($el.find('.selectList'));
    },
    /**
     * show 显示选择列表
     * @return {[type]}            [description]
    */

    show: function() {
      if (!this.options.multi) {
        this.filter();
      }
      this.$el.find('.showSelect span').removeClass('jtArrowDown').addClass('jtArrowUp');
      this.$el.find('.selectList').show();
      return this;
    },
    /**
     * hide 隐藏显示列表
     * @return {[type]}            [description]
    */

    hide: function() {
      this.$el.find('.showSelect span').removeClass('jtArrowUp').addClass('jtArrowDown');
      this.$el.find('.selectList').hide().find('.option').show();
      return this;
    },
    /**
     * filter 筛选符合条件的option
     * @return {[type]} [description]
    */

    filter: function() {
      var $el, key, options;
      $el = this.$el;
      key = $el.find('.userInput').val().trim();
      options = $el.find('.selectList .option');
      if (key) {
        options.each(function(i, option) {
          var value;
          option = $(option);
          value = option.text();
          if (!~value.indexOf(key)) {
            return option.hide();
          }
        });
      } else {
        options.show();
      }
      return this;
    },
    /**
     * reset 重置（将所有的option都显示）
     * @return {[type]} [description]
    */

    reset: function() {
      this.model.each(function(item) {
        return item.set('checked', false);
      });
      this.$el.find('.selectList').hide().find('.option').show();
      return this;
    },
    /**
     * clickSelect 用户点击选择
     * @param  {Object} e jQuery event对象
     * @return {[type]}   [description]
    */

    clickSelect: function(e) {
      var index, optionModel, self;
      self = this;
      index = this.$el.find('.option').index(e.currentTarget);
      if (self.options.multi) {
        optionModel = this.model.at(index);
        optionModel.set('checked', !optionModel.get('checked'));
      } else {
        this.model.each(function(model, i) {
          if (i !== index) {
            return model.set('checked', false);
          } else {
            model.set('checked', true);
            return self.toggleSelectList();
          }
        });
      }
      return this;
    },
    /**
     * select 选择某一option
     * @param  {JT.Model.Select} model 标记为选中的model
     * @return {[type]}       [description]
    */

    select: function(model) {
      var optionObjs, userInput, valueList;
      userInput = this.$el.find('.userInput');
      optionObjs = this.$el.find('.option');
      if (this.options.multi) {
        valueList = [];
        this.model.each(function(optionModel, i) {
          if (optionModel.get('checked')) {
            optionObjs.eq(i).addClass('checked');
            return valueList.push(optionModel.get('name'));
          } else {
            optionObjs.eq(i).removeClass('checked');
            return null;
          }
        });
        userInput.val(valueList.join(','));
      } else {
        userInput.val(model.get('name'));
      }
      return this;
    },
    /**
     * destroy 销毁对象
     * @return {[type]} [description]
    */

    destroy: function() {
      return this.remove();
    },
    /**
     * initialize 构造函数
     * @return {[type]} [description]
    */

    initialize: function() {
      var self;
      self = this;
      this.$el.addClass('jtWidget');
      _.each('name key'.split(' '), function(event) {
        return self.listenTo(self.model, "change:" + event, function(model, value) {
          return self.change(model, event, value);
        });
      });
      _.each('add remove'.split(' '), function(event) {
        return self.listenTo(self.model, event, function(models, collection, options) {
          return self.item(event, models, options);
        });
      });
      self.listenTo(self.model, 'change:checked', function(model, value) {
        if (self.options.multi) {
          return self.select();
        } else if (value === true) {
          return self.select(model);
        }
      });
      this.render();
      if (this.options.disabledInput) {
        this.$el.find('.userInput').attr('disabled', true);
      }
      return this;
    },
    /**
     * change model的change事件
     * @param  {JT.Model.Select} model 触发该事件的model
     * @param  {String} key change的属性
     * @param  {String} value change后的值
     * @return {[type]}       [description]
    */

    change: function(model, key, value) {
      var index, option;
      index = this.model.indexOf(model);
      option = this.$el.find('.selectList .option').eq(index);
      switch (key) {
        case 'name':
          option.html(value);
          break;
        default:
          option.attr('data-key', value);
      }
      return this;
    },
    /**
     * item 添加或删除item
     * @param  {String} type 操作的类型add、remove
     * @param  {JT.Collection.Select, JT.Model.Select} models models
     * @param  {Object} options remove操作中，index属性标记删除元素的位置
     * @return {[type]}         [description]
    */

    item: function(type, models, options) {
      var selectList, self;
      self = this;
      selectList = this.$el.find('.selectList');
      if (!_.isArray(models)) {
        models = [models];
      }
      if (type === 'add') {
        _.each(models, function(model) {
          var data;
          data = model.toJSON();
          return selectList.append(self.optionTemplate(data));
        });
      } else if (type === 'remove') {
        selectList.find('.option').eq(options.index).remove();
      }
      return this;
    },
    /**
     * [render description]
     * @return {[type]} [description]
    */

    render: function() {
      var html, listHtmlArr, self;
      self = this;
      listHtmlArr = _.map(this.model.toJSON(), function(item) {
        var data;
        data = {
          name: item.name,
          key: item.key
        };
        return self.optionTemplate(data);
      });
      this.templateData = {
        tips: this.options.tips,
        list: listHtmlArr.join('')
      };
      html = this.template(this.templateData);
      this.$el.html(html);
      this.$el.find('.userInput').width(this.$el.find('.jtSelect').width() - 25);
      return this;
    }
  });

  JT.Model.Dialog = Backbone.Model.extend({
    defaults: {
      title: '未命名标题',
      content: '未定义内容',
      destroyOnClose: true
    }
  });

  JT.View.Dialog = Backbone.View.extend({
    template: _.template('<h3 class="title jtBlueGradient jtBorderRadius3"><a href="javascript:;" class="close">×</a><span><%= title %></span></h3>' + '<div class="content"><%= content %></div>' + '<%= btns %>'),
    events: {
      'click .btns .btn': 'btnClick',
      'click .close': 'close'
    },
    /**
     * btnClick 用户点击按钮处理
     * @param  {Object} e jQuery event对象
     * @return {[type]}   [description]
    */

    btnClick: function(e) {
      var btnCbfs, cbf, cbfResult, key, obj;
      btnCbfs = this.model.get('btns');
      obj = $(e.currentTarget);
      key = obj.text();
      cbf = btnCbfs != null ? btnCbfs[key] : void 0;
      cbfResult = null;
      if (_.isFunction(cbf)) {
        cbfResult = cbf(this.$el);
      }
      if (cbfResult !== false) {
        this.close();
      }
      return this;
    },
    /**
     * open 打开对话框
     * @return {[type]} [description]
    */

    open: function() {
      if (this.modalMask) {
        this.modalMask.show();
      }
      this.$el.show();
      return this;
    },
    /**
     * close 关闭对话框
     * @return {[type]} [description]
    */

    close: function() {
      if (this.modalMask) {
        this.modalMask.hide();
      }
      if (this.model.get('destroyOnClose')) {
        this.destroy();
      } else {
        this.$el.hide();
      }
      return this;
    },
    /**
     * destroy 销毁对象
     * @return {[type]} [description]
    */

    destroy: function() {
      if (this.model.get('modal')) {
        this.modalMask.remove();
      }
      return this.remove();
    },
    /**
     * getBtnsHtml 获取按钮的html
     * @param  {Object} btns {key : handle}按钮的配置
     * @return {[type]}      [description]
    */

    getBtnsHtml: function(btns) {
      var btnHtmlArr;
      if (!btns) {
        return '<div class="btns" style="display:none;"></div>';
      } else {
        btnHtmlArr = [];
        _.each(btns, function(value, key) {
          return btnHtmlArr.push("<a class='jtBtn btn' href='javascript:;'>" + key + "</a>");
        });
        return "<div class='btns'>" + (btnHtmlArr.join('')) + "</div>";
      }
    },
    /**
     * update 更新对话框属性，title content btns
     * @param  {String} type 更新的类型：title content btns
     * @param  {String, Object} value 更新的值
     * @return {[type]}       [description]
    */

    update: function(type, value) {
      var btns, btnsHtml;
      if (type === 'title') {
        return this.$el.find('.title span').text(value);
      } else if (type === 'content') {
        return this.$el.find('.content').text(value);
      } else if (type === 'btns') {
        btnsHtml = this.getBtnsHtml(value);
        btns = this.$el.find('.btns');
        $(btnsHtml).insertBefore(btns);
        return btns.remove();
      }
    },
    /**
     * initialize 构造函数
     * @return {[type]} [description]
    */

    initialize: function() {
      var self;
      self = this;
      this.$el.addClass('jtWidget jtDialog jtBorderRadius3');
      _.each('title content btns'.split(' '), function(event) {
        return self.listenTo(self.model, "change:" + event, function(model, value) {
          return self.update(event, value);
        });
      });
      this.render();
      return this;
    },
    /**
     * [render description]
     * @return {[type]} [description]
    */

    render: function() {
      var html;
      this.templateData = this.model.toJSON();
      this.templateData.btns = this.getBtnsHtml(this.templateData.btns);
      if (this.model.get('modal')) {
        this.modalMask = $('<div class="jtMask" />').appendTo('body');
      }
      html = this.template(this.templateData);
      return this.$el.html(html);
    }
  });

  JT.View.Alert = Backbone.View.extend({
    initialize: function() {
      var el;
      el = $('<div class="jtAlertDlg" />').appendTo('body').get(0);
      return new JT.View.Dialog({
        el: el,
        model: this.model
      });
    }
  });

  JT.DatePicker = Backbone.View.extend({
    events: {
      'click .daysContainer .prev': 'prevMonth',
      'click .daysContainer .next': 'nextMonth',
      'click .daysContainer .dateView': 'showMonths',
      'click .daysContainer .day': 'selectDay',
      'click .monthsContainer .prev': 'prevYear',
      'click .monthsContainer .next': 'nextYear',
      'click .monthsContainer .month': 'selectMonth'
    },
    datePickerHtml: '<div class="jtDatePicker jtBorderRadius3">' + '<div class="arrowContainer arrowContainerBottom"></div>' + '<div class="arrowContainer"></div>' + '<div class="daysContainer">' + '<table>' + '<thead></thead>' + '<tbody></tbody>' + '</table>' + '</div>' + '<div class="monthsContainer">' + '<table>' + '<thead></thead>' + '<tbody></tbody>' + '</table>' + '</div>' + '<div class="yearsContainer">' + '<table>' + '<thead></thead>' + '<tbody></tbody>' + '</table>' + '</div>' + '</div>',
    monthsTheadTemplate: _.template('<tr>' + '<th class="prev">‹</th>' + '<th colspan="5" class="dateView"><%= year %></th>' + '<th class="next">›</th>' + '</tr>'),
    daysTheadTemplate: _.template('<tr>' + '<th class="prev">‹</th>' + '<th colspan="5" class="dateView"><%= date %></th>' + '<th class="next">›</th>' + '</tr>' + '<tr>' + '<th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th>' + '</tr>'),
    /**
     * initialize 构造函数
     * @return {[type]} [description]
    */

    initialize: function() {
      var $el, datePicker, elOffset, options, self, _ref4;
      self = this;
      $el = this.$el;
      options = this.options;
      if ((_ref4 = options.months) == null) {
        options.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      }
      this.date = new Date(options.date || new Date());
      elOffset = $el.offset();
      datePicker = $(this.datePickerHtml);
      datePicker.css({
        left: elOffset.left,
        top: elOffset.top + $el.outerHeight(true) + 10
      });
      datePicker.appendTo('body');
      this.$inputObj = $el;
      this.setElement(datePicker.addClass('jtWidget'));
      this.render();
      this.$inputObj.on('click.jtDatePicker', function() {
        if (datePicker.is(':hidden')) {
          return self.show();
        } else {
          return self.hide();
        }
      });
      return this;
    },
    /**
     * prevMonth 上一个月
     * @return {[type]} [description]
    */

    prevMonth: function() {
      var date, month;
      date = this.date;
      month = date.getMonth();
      if (month > 0) {
        date.setMonth(month - 1);
      } else {
        date.setYear(date.getFullYear() - 1);
        date.setMonth(11);
      }
      return this.render();
    },
    /**
     * nextMonth 下一个月
     * @return {[type]} [description]
    */

    nextMonth: function() {
      var date, month;
      date = this.date;
      month = date.getMonth();
      if (month < 11) {
        date.setMonth(month + 1);
      } else {
        date.setYear(date.getFullYear() + 1);
        date.setMonth(0);
      }
      return this.render();
    },
    /**
     * prevYear 上一年
     * @return {[type]} [description]
    */

    prevYear: function() {
      var date;
      date = this.date;
      this.date.setFullYear(date.getFullYear() - 1);
      return this.render('month');
    },
    /**
     * nextYear 下一年
     * @return {[type]} [description]
    */

    nextYear: function() {
      var date;
      date = this.date;
      this.date.setFullYear(date.getFullYear() + 1);
      return this.render('month');
    },
    /**
     * showMonths 显示月份选择
     * @return {[type]} [description]
    */

    showMonths: function() {
      return this.render('month');
    },
    /**
     * selectDay 用户选择日期
     * @param  {Object} e jQuery event对象
     * @return {[type]}   [description]
    */

    selectDay: function(e) {
      var obj;
      obj = $(e.currentTarget);
      this.date.setDate(obj.text());
      this.val().hide();
      return this;
    },
    /**
     * val 获取当前选择的日期
     * @return {[type]} [description]
    */

    val: function() {
      var date, day, month, year;
      date = this.date;
      month = date.getMonth() + 1;
      year = date.getFullYear();
      day = date.getDate();
      if (month < 10) {
        month = '0' + month;
      }
      if (day < 10) {
        day = '0' + day;
      }
      this.$inputObj.val("" + year + "-" + month + "-" + day);
      return this;
    },
    /**
     * selectMonth 用户选择月份
     * @param  {Object} e jQuery event对象
     * @return {[type]}   [description]
    */

    selectMonth: function(e) {
      var obj;
      obj = $(e.currentTarget);
      this.date.setMonth(obj.index('.month'));
      this.val().render('day');
      return this;
    },
    /**
     * show 显示
     * @return {[type]} [description]
    */

    show: function() {
      this.render();
      this.$el.show();
      return this;
    },
    /**
     * hide 隐藏
     * @return {[type]} [description]
    */

    hide: function() {
      this.$el.hide();
      return this;
    },
    /**
     * getMonthsTbody 获取月份显示表格的tbody
     * @return {[type]} [description]
    */

    getMonthsTbody: function() {
      var months, tbodyHtml;
      tbodyHtml = [];
      months = this.options.months;
      tbodyHtml.push('<tr><td colspan="7">');
      _.each(months, function(month, i) {
        return tbodyHtml.push("<span class='month'>" + month + "</span>");
      });
      tbodyHtml.push('</td></tr>');
      return tbodyHtml.join('');
    },
    /**
     * getDaysTbody 获取日期显示表格的tbody
     * @return {[type]} [description]
    */

    getDaysTbody: function() {
      var currentDate, currentDay, currentDayMatchFlag, date, dateTotal, day, dayTotalList, i, index, month, selectDay, selectDayMatchFlag, tbodyHtml, year, _i;
      dayTotalList = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      date = new Date(this.date.getTime());
      date.setDate(1);
      index = date.getDay();
      month = date.getMonth();
      year = date.getFullYear();
      if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
        dayTotalList[1] = 29;
      }
      dateTotal = dayTotalList[month] + index;
      currentDate = new Date();
      currentDayMatchFlag = false;
      if (currentDate.getMonth() === month && currentDate.getFullYear() === year) {
        currentDayMatchFlag = true;
        currentDay = currentDate.getDate();
      }
      selectDayMatchFlag = false;
      if (this.date.getMonth() === month && this.date.getFullYear() === year) {
        selectDayMatchFlag = true;
        selectDay = this.date.getDate();
      }
      tbodyHtml = [];
      for (i = _i = 0; 0 <= dateTotal ? _i < dateTotal : _i > dateTotal; i = 0 <= dateTotal ? ++_i : --_i) {
        if (i === 0) {
          tbodyHtml.push('<tr>');
        } else if (i % 7 === 0) {
          tbodyHtml.push('</tr><tr>');
        } else if (i === dateTotal) {
          tbodyHtml.push('</tr>');
        }
        if (i < index) {
          tbodyHtml.push("<td></td>");
        } else {
          day = i - index + 1;
          if (selectDayMatchFlag && day === selectDay) {
            tbodyHtml.push("<td class='active jtBorderRadius3 day'>" + day + "</td>");
          } else if (currentDayMatchFlag && day === currentDay) {
            tbodyHtml.push("<td class='currentDay jtBorderRadius3 day'>" + day + "</td>");
          } else {
            tbodyHtml.push("<td class='day'>" + day + "</td>");
          }
        }
      }
      return tbodyHtml.join('');
    },
    /**
     * getViewDate 获取显示的日期，格式化"MM YYYY"
     * @return {[type]} [description]
    */

    getViewDate: function() {
      var months;
      months = this.options.months;
      return "" + months[this.date.getMonth()] + " " + (this.date.getFullYear());
    },
    /**
     * [render description]
     * @param  {[type]} type =             'day' [description]
     * @return {[type]}      [description]
    */

    render: function(type) {
      var datePicker, daysContainer, monthsContainer;
      if (type == null) {
        type = 'day';
      }
      datePicker = this.$el;
      daysContainer = datePicker.find('.daysContainer');
      monthsContainer = datePicker.find('.monthsContainer');
      if (type === 'day') {
        daysContainer.show();
        monthsContainer.hide();
        daysContainer.find('thead').html(this.daysTheadTemplate({
          date: this.getViewDate()
        }));
        daysContainer.find('tbody').html(this.getDaysTbody());
      } else if (type === 'month') {
        daysContainer.hide();
        monthsContainer.show();
        monthsContainer.find('thead').html(this.monthsTheadTemplate({
          year: this.date.getFullYear()
        }));
        monthsContainer.find('tbody').html(this.getMonthsTbody());
      }
      return this;
    },
    /**
     * destroy 销毁对象
     * @return {[type]} [description]
    */

    destroy: function() {
      this.$inputObj.off('.jtDatePicker');
      return this.remove();
    }
  });

  JT.Model.Accordion = Backbone.Model.extend({});

  JT.Collection.Accordion = Backbone.Collection.extend({
    model: JT.Model.Accordion
  });

  JT.View.Accordion = Backbone.View.extend({
    events: {
      'click .item .title': 'clickActive'
    },
    itemTemplate: _.template('<div class="item">' + '<h3 class="title jtGrayGradient"><div class="jtArrowDown"></div><div class="jtArrowRight"></div><span><%= title %></span></h3>' + '<div class="content"><%= content %></div>' + '</div>'),
    /**
     * initialize 构造函数
     * @return {[type]} [description]
    */

    initialize: function() {
      var self;
      self = this;
      this.$el.addClass('jtWidget jtAccordion jtBorderRadius3');
      _.each('add remove'.split(' '), function(event) {
        return self.listenTo(self.model, event, function(models, collection, options) {
          return self.item(event, models, options);
        });
      });
      _.each('title content'.split(' '), function(event) {
        return self.listenTo(self.model, "change:" + event, function(model, value) {
          return self.change(model, event, value);
        });
      });
      self.listenTo(self.model, 'change:active', function(model, value, options) {
        if (value === true) {
          return self.active(self.model.indexOf(model));
        }
      });
      this.render();
      return this;
    },
    /**
     * change change事件处理
     * @param  {JT.Model.Accordion} model change事件的对象
     * @param  {String} key change的属性
     * @param  {String} value change后的值
     * @return {[type]}       [description]
    */

    change: function(model, key, value) {
      var item;
      item = this.$el.find('.item').eq(this.model.indexOf(model));
      switch (key) {
        case 'title':
          return item.find('.title span').html(value);
        default:
          return item.find('.content').html(value);
      }
    },
    /**
     * item 添加或删除item
     * @param  {String} type 操作类型：add remove
     * @param  {JT.Collection.Accordion, JT.Model.Accordion} models models
     * @param  {Object} options 在删除操作中，index属性标记要删除元素的位置
     * @return {[type]}         [description]
    */

    item: function(type, models, options) {
      var self;
      self = this;
      if (!_.isArray(models)) {
        models = [models];
      }
      if (type === 'add') {
        _.each(models, function(model) {
          var data;
          data = model.toJSON();
          return self.$el.append(self.itemTemplate(data));
        });
      } else if (type === 'remove') {
        self.$el.find('.item').eq(options.index).remove();
      }
      return this;
    },
    /**
     * clickActive 点击选择处理
     * @param  {Object} e jQuery event对象
     * @return {[type]}   [description]
    */

    clickActive: function(e) {
      var index;
      index = $(e.currentTarget).closest('.item').index();
      return this.model.at(index).set('active', true);
    },
    /**
     * active 设置item为活动状态
     * @param  {Integer} activeIndex 设置为活动的item位置，默认为0
     * @return {[type]}             [description]
    */

    active: function(activeIndex) {
      var $el;
      if (activeIndex == null) {
        activeIndex = 0;
      }
      $el = this.$el;
      if (activeIndex < 0) {
        activeIndex = 0;
      }
      this.model.each(function(model, i) {
        if (i !== activeIndex) {
          return model.set('active', false);
        }
      });
      $el.find('.item').each(function(i) {
        var obj;
        obj = $(this);
        if (i === activeIndex) {
          return obj.addClass('active').find('.title').addClass('jtBlueGradient').removeClass('jtGrayGradient');
        } else {
          return obj.removeClass('active').find('.title').addClass('jtGrayGradient').removeClass('jtBlueGradient');
        }
      });
      return this;
    },
    /**
     * destroy 销毁对象
     * @return {[type]} [description]
    */

    destroy: function() {
      return this.remove();
    },
    /**
     * [render description]
     * @return {[type]} [description]
    */

    render: function() {
      var htmlArr, self;
      self = this;
      htmlArr = _.map(this.model.toJSON(), function(item) {
        return self.itemTemplate(item);
      });
      this.$el.html(htmlArr.join(''));
      this.model.at(0).set('active', true);
      return this;
    }
  });

  JT.Model.Tab = Backbone.Model.extend({});

  JT.Collection.Tabs = Backbone.Collection.extend({
    model: JT.Model.Tab
  });

  JT.View.Tabs = Backbone.View.extend({
    events: {
      'click .nav li': 'clickActive'
    },
    /**
     * initialize 构造函数
     * @return {[type]} [description]
    */

    initialize: function() {
      var self;
      self = this;
      this.$el.addClass('jtWidget jtTabs jtBorderRadius3');
      _.each('add remove'.split(' '), function(event) {
        return self.listenTo(self.model, event, function(models, collection, options) {
          return self.item(event, models, options);
        });
      });
      self.listenTo(self.model, 'change:active', function(model, value) {
        if (value === true) {
          return self.active(self.model.indexOf(model));
        }
      });
      _.each('title content'.split(' '), function(event) {
        return self.listenTo(self.model, "change:" + event, function(model, value) {
          return self.change(model, event, value);
        });
      });
      this.render();
      return this;
    },
    /**
     * item 添加或删除item
     * @param  {String} type 操作的类型：add remove
     * @param  {JT.Collection.Tabs, JT.Model.Tab} models models
     * @param  {Object} options 在删除操作中，index属性标记要删除元素的位置
     * @return {[type]}         [description]
    */

    item: function(type, models, options) {
      var $el, nav, self;
      self = this;
      $el = this.$el;
      nav = $el.find('.nav');
      if (!_.isArray(models)) {
        models = [models];
      }
      if (type === 'add') {
        _.each(models, function(model) {
          var data;
          data = model.toJSON();
          nav.append("<li>" + data.title + "</li>");
          return $el.append("<div class='tab'>" + data.content + "</div>");
        });
      } else if (type === 'remove') {
        nav.find('li').eq(options.index).remove();
        $el.find('.tab').eq(options.index).remove();
      }
      return this;
    },
    /**
     * change change事件的处理
     * @param  {JT.Model.Tab} model 触发change事件的model
     * @param  {String} type  change的属性
     * @param  {String} value change后的值
     * @return {[type]}       [description]
    */

    change: function(model, key, value) {
      var index;
      index = this.model.indexOf(model);
      if (key === 'title') {
        this.$el.find('.nav li').eq(index).html(value);
      } else {
        this.$el.find('.tab').eq(index).html(value);
      }
      return this;
    },
    /**
     * clickActive 用户点击选择处理
     * @param  {Object} e jQuery event对象
     * @return {[type]}   [description]
    */

    clickActive: function(e) {
      var index;
      index = $(e.currentTarget).index();
      this.model.at(index).set('active', true);
      return this;
    },
    /**
     * active 设置item为活动状态
     * @param  {Integer} activeIndex 设置为活动的item位置，默认为0
     * @return {[type]}             [description]
    */

    active: function(activeIndex) {
      var $el, i, liList, tabList, _i, _ref4;
      if (activeIndex == null) {
        activeIndex = 0;
      }
      $el = this.$el;
      if (activeIndex < 0) {
        activeIndex = 0;
      }
      this.model.each(function(model, i) {
        if (i !== activeIndex) {
          return model.set('active', false);
        }
      });
      liList = $el.find('.nav li');
      tabList = $el.find('.tab');
      for (i = _i = 0, _ref4 = liList.length; 0 <= _ref4 ? _i <= _ref4 : _i >= _ref4; i = 0 <= _ref4 ? ++_i : --_i) {
        if (i === activeIndex) {
          liList.eq(i).addClass('active');
          tabList.eq(i).addClass('active');
        } else {
          liList.eq(i).removeClass('active');
          tabList.eq(i).removeClass('active');
        }
      }
      return this;
    },
    /**
     * destroy 销毁对象
     * @return {[type]} [description]
    */

    destroy: function() {
      return this.remove();
    },
    /**
     * [render description]
     * @param  {[type]} activeIndex =             0 [description]
     * @return {[type]}             [description]
    */

    render: function(activeIndex) {
      var contentArr, data, liHtmlArr, self, tabHtmlArr, titleArr;
      if (activeIndex == null) {
        activeIndex = 0;
      }
      self = this;
      data = this.model.toJSON();
      titleArr = _.pluck(data, 'title');
      contentArr = _.pluck(data, 'content');
      liHtmlArr = _.map(titleArr, function(title) {
        return "<li>" + title + "</li>";
      });
      tabHtmlArr = _.map(contentArr, function(content) {
        return "<div class='tab'>" + content + "</div>";
      });
      this.$el.html("<ul class='jtBlueGradient nav'>" + (liHtmlArr.join('')) + "</ul>" + (tabHtmlArr.join('')));
      this.model.at(0).set('active', true);
      return this;
    }
  });

  JT.Model.Menu = Backbone.Model.extend({});

  JT.Collection.Menu = Backbone.Collection.extend({
    model: JT.Model.Menu
  });

  JT.View.Menu = Backbone.View.extend({
    /**
     * initialize 构造函数
     * @return {[type]} [description]
    */

    initialize: function() {
      var $el, self;
      self = this;
      $el = this.$el;
      $el.addClass('jtMenu jtWidget');
      return this.render();
    },
    /**
     * getHtml 获取html
     * @param  {Array} data menu的数据
     * @param  {Boolean} top  标记是否顶层menu
     * @return {[type]}      [description]
    */

    getHtml: function(data, top) {
      var htmlArr, self;
      self = this;
      htmlArr = [];
      if (top) {
        htmlArr.push('<ul class="topLevel jtBlueGradient">');
      } else {
        htmlArr.push('<ul class="subLevel initShowList jtBlueGradient">');
      }
      _.each(data, function(item) {
        htmlArr.push('<li class="item">');
        if (item.children) {
          if (top) {
            htmlArr.push('<span class="jtArrowDown"></span>');
          } else {
            htmlArr.push('<span class="jtArrowRight"></span>');
          }
        }
        htmlArr.push("<a href='javascript:;'>" + item.name + "</a>");
        if (item.children) {
          htmlArr.push(self.getHtml(item.children));
        }
        return htmlArr.push('</li>');
      });
      htmlArr.push('</ul>');
      return htmlArr.join('');
    },
    /**
     * setPosition 设置位置（计算子menu的位置）
    */

    setPosition: function() {
      var $el;
      $el = this.$el;
      $el.find('.subLevel .subLevel').each(function() {
        var obj, parent;
        obj = $(this);
        parent = obj.parent('.item');
        return obj.css('left', parent.outerWidth() + 2);
      });
      $el.find('.initShowList').removeClass('initShowList');
      return this;
    },
    /**
     * [render description]
     * @return {[type]} [description]
    */

    render: function() {
      var data, html;
      data = this.model.toJSON();
      html = this.getHtml(data, true);
      this.$el.html(html);
      return this.setPosition();
    }
  });

}).call(this);
