export const throttle = function(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

export const isObject = function() {
  return Object.prototype.toString.call(arguments[0]) === '[object Object]'
}

export const extend = function() {
  let target = arguments[0] || {}
  let i = 1
  let length = arguments.length
  let deep = false
  let options
  let copy
  let isArray
  let targetSrc
  let clone
  
  if(typeof target === 'boolean') {
    deep = target
    target = arguments[i]
    i++
  }

  for(; i < length; i++) {
    if((options = arguments[i]) !== null) {
      for(let j in options) {
        copy = options[j]

        if(deep && copy && (isObject(copy) || (isArray = Array.isArray(copy)))) {
          targetSrc = target[j]
          if(isArray && !Array.isArray(targetSrc)) {
            clone = []
          }else if(!isArray && !isObject(targetSrc)) {
            clone = {}
          }else {
            clone = targetSrc
          }
          isArray = false
          target[j] = extend(deep, clone, copy)
        }else if(copy !== undefined) {
          target[j] = copy
        }
      }
    }
  }
  return target
}