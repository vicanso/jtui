(function() {

  window.MimeSetting = {
    openDlg: function(el, resHeaders, staticMimes, cbf) {
      var $el, mimeTypeCollection, self, settingDialog, settingDialogView;
      self = this;
      $el = $(el);
      if (_.isFunction(staticMimes)) {
        cbf = staticMimes;
        staticMimes = null;
      }
      settingDialog = new JT.Model.Dialog({
        title: 'HTTP响应头配置',
        content: '<div class="mimeTypeList"></div>' + self._getResHeaderContainerHtml(resHeaders),
        modal: true,
        btns: {
          '确定': function() {
            var mimes, result;
            if (mimeTypeCollection) {
              mimes = mimeTypeCollection.val();
            }
            result = $el.find('tbody .item').map(function() {
              var obj, value;
              obj = $(this);
              value = obj.find('.value input').val();
              if (value) {
                return {
                  type: obj.find('.name').text(),
                  value: value
                };
              } else {
                return null;
              }
            });
            return cbf(null, {
              mimes: mimes || [],
              res: result.toArray()
            });
          },
          '取消': function() {
            return cbf(null);
          }
        }
      });
      settingDialogView = new JT.View.Dialog({
        el: $el,
        model: settingDialog
      });
      if (staticMimes) {
        mimeTypeCollection = self._initSelect($el.find('.mimeTypeList'), staticMimes);
      }
      return this;
    },
    _initSelect: function(el, staticMimes) {
      var mimeTypeCollection, mimeTypeCollectionData, mimeTypeView;
      mimeTypeCollectionData = _.map(staticMimes, function(mime) {
        return {
          key: mime,
          name: mime
        };
      });
      mimeTypeCollection = new JT.Collection.Select(mimeTypeCollectionData);
      mimeTypeView = new JT.View.Select({
        el: el,
        tips: '选择需要配置的文件类型',
        model: mimeTypeCollection,
        multi: true
      });
      return mimeTypeCollection;
    },
    _getResHeaderContainerHtml: function(resHeaders) {
      var htmlArr;
      htmlArr = _.map(resHeaders, function(header) {
        return "<tr class='item'><td class='name'>" + header.name + "</td><td class='value'><input type='text' placeholder='" + header.tip + "' /></td></tr>";
      });
      return "<div class='resHeadersContainer'><p class='tip'>请填写需要配置的属性：</p><table><tbody>" + (htmlArr.join('')) + "</tbody></table></div>";
    }
  };

}).call(this);
