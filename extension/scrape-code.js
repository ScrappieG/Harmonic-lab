(function () {
    var code = '';
    try {
      if (window.monaco && window.monaco.editor) {
        var models = window.monaco.editor.getModels();
        if (models && models.length > 0) {
          var first = models[0] ? models[0].getValue() : '';
          var second = models[1] ? models[1].getValue() : '';
          code = first && first.trim() ? first : second;
        }
      }
    } catch (e) {}
    window.postMessage({ type: '__articuLeet_code_result__', code: code }, '*');
  })();
