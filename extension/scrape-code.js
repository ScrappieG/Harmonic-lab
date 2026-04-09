(function () {
    var code = '';
    try {
      if (window.monaco && window.monaco.editor) {
        var models = window.monaco.editor.getModels();
        if (models && models.length > 0) {
          code = models[0].getValue();
        }
      }
    } catch (e) {}
    window.postMessage({ type: '__articuLeet_code_result__', code: code }, '*');
  })();