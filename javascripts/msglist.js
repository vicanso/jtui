(function() {
  var MsgCollection, MsgListView, MsgModel;

  MsgModel = Backbone.Model.extend({
    defaults: {
      name: '',
      status: ''
    }
  });

  MsgCollection = Backbone.Collection.extend({
    model: MsgModel
  });

  MsgListView = Backbone.View.extend({
    events: {
      'click .title .minimize': 'clickMinimize',
      'click .title .maximize': 'clickMaximize'
    },
    template: _.template('<li class="item <%= status %>"><%= name %></li>'),
    clickMinimize: function(e) {
      var obj;
      this.minimize = true;
      obj = $(e.currentTarget);
      obj.siblings('.maximize').addBack().toggle();
      this.setTotal();
      obj.siblings('.total').show();
      this.$el.find('.items').hide();
      return this;
    },
    clickMaximize: function(e) {
      var obj;
      this.minimize = false;
      obj = $(e.currentTarget);
      obj.siblings('.minimize').addBack().toggle();
      obj.siblings('.total').hide();
      this.$el.find('.items').show();
      return this;
    },
    setTotal: function() {
      if (this.minimize) {
        this.$el.find('.title .total').show().text("(" + this.model.length + ")");
      }
      return this;
    },
    getListHtml: function() {
      var htmlArr, self;
      self = this;
      htmlArr = this.model.map(function(item) {
        return self.template(item.toJSON());
      });
      return "<ul class='items'>" + (htmlArr.join('')) + "</ul>";
    },
    remove: function(index) {
      this.$el.find('.items .item').eq(index).remove();
      return this.setTotal();
    },
    initialize: function() {
      var $el, self;
      self = this;
      $el = this.$el;
      $el.addClass('msgList').html("<h4 class='title jtGrayGradient'><a href='javascript:;' class='minimize' title='最小化'>_</a><a href='javascript:;' class='maximize' title='最大化'></a>消息列表<span class='total'></span></h4>" + (self.getListHtml()));
      return self.listenTo(self.model, 'remove', function(model, collection, options) {
        return self.remove(options.index);
      });
    }
  });

  window.MsgListView = MsgListView;

  window.MsgCollection = MsgCollection;

}).call(this);
