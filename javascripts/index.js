(function() {

  jQuery(function($) {
    var i, msgs, resHeaders, staticMimes;
    resHeaders = [
      {
        name: 'Content-Language',
        tip: 'zh-CN'
      }, {
        name: 'Expires',
        tip: 'Tue, 04 Jun 2013 02:45:23 GMT'
      }, {
        name: 'Cache-Control',
        tip: 'max-age=300'
      }, {
        name: 'Content-Encoding',
        tip: 'gzip'
      }, {
        name: 'Content-Disposition',
        tip: 'attachment; filename=1359517123_33_937.gif'
      }
    ];
    staticMimes = 'html htm css js json'.split(' ');
    msgs = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; _i < 10; i = ++_i) {
        _results.push({
          name: "测试文件" + (i + 1)
        });
      }
      return _results;
    })();
    return msgs[0].status = 'doing';
  });

}).call(this);
