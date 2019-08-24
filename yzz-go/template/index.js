;(function() {
  // 这些都是eval解析js表达式的变量，暂时没想到怎么安排进data中
  id = 'ID'
  ok = true
  number = 1
  message = 'hello'

  data = {
    msg: 'hello world',
    rawHtml: '<span style="color:red;">哈哈哈</span>',
    dynamicId: 'testId',
    isButtonDisabled: true,
    url: 'https://cn.vuejs.org/v2/guide/syntax.html#参数',
    attributename: 'href',
    seen: true,
    alertMe: function() {
      alert('Well done!')
    },
  }

  const body = document.getElementsByTagName('body')[0]
  if (body) {
    const elements = body.children
    if (elements && elements.length) {
      iteratorDoms(elements)
    }
  }

  function iteratorDoms(elements) {
    for (let i = 0; i < elements.length; i++) {
      // 不解析script脚本内容
      if (elements[i].tagName === 'script') {
        continue
      }
      // 通过栈解析双花括号是否正确闭合，正确的解析出值
      if (elements[i]) {
        // 1.解析文本和js表达式
        let s = elements[i].innerHTML
        elements[i].innerHTML = parseText(s)
        // 2.解析HTML
        parseHTML(elements[i])
        // 3.解析特性
        parseAttr(elements[i])
      }
    }
  }

  /**
   * 解析双括号
   * @param {*} s 元素内部HTML
   */
  function parseText(s) {
    const arr = s.split('')
    const res = []
    for (let j = 0; j < arr.length; j++) {
      let tmpS = arr[j]
      if (arr[j].trim(' ')) {
        let varName = ''
        // 遇到两个连着的左括号，开始解析变量

        if (arr[j] === '{' && j + 1 < arr.length && arr[j + 1] === '{') {
          let k = j + 2
          if (arr[j] === ' ') {
            k++
          } else if (arr[j] === '{') {
            console.error(
              'ERROR: Template can\'t parse "{", plaese check out your HTML expression!',
              s
            )
          }
          let flag = true // 括号是否正确闭合
          for (; k < arr.length - 1; k++) {
            if (arr[k] === '}') {
              // 遇到第一个右括号，如果下一个字符也是右括号，说明正确闭合
              if (arr[k + 1] === '}') {
                // 正确闭合，进行变量解析，并重置参数
                if (flag && varName) {
                  let name = varName.trim()
                  let value = ''
                  if (data[name]) {
                    // 只取纯文本内容
                    value = data[name]
                      .replace(/<[^<>]+>/g, '')
                      .replace(/&nbsp;/gi, '')
                    tmpS = `<yzz name="${name}">${value}</yzz>`
                  } else {
                    tmpS = parseJS(varName)
                  }

                  // 重置参数
                  flag = true
                  varName = ''
                  k += 1 + varName.length // 需要跳过变量名长度，并前进一步
                  j = k
                  break
                }
              } else {
                // 下一个字符不是右括号，没有正确闭合
                flag = false
                j = k
                break
              }
            } else {
              // 变量名
              varName += arr[k]
            }
          }
          j = k
        }
      }
      res.push(tmpS)
    }
    return res.join('')
  }

  /**
   * 解析HTML绑定
   * @param {*} element
   */
  function parseHTML(element) {
    // 处理HTML
    const attr = element.getAttribute('v-html')
    if (attr) {
      const value = data[attr] ? data[attr] : ''
      element.innerHTML = `<yzz name="${attr}">${value}</yzz>`
    } else if (element && element.children) {
      for (let i = 0; i < element.children.length; i++) {
        if (element.children[i]) {
          parseHTML(element.children[i])
        }
      }
    }
  }

  /**
   * 解析属性绑定
   * @param {*} element
   */
  function parseAttr(element) {
    // 处理特性
    for (let i = 0; i < element.attributes.length; i++) {
      const name = element.attributes[i].name
      if (name.slice(0, 7) === 'v-bind:') {
        bind(element, i)
      } else if (name.slice(0, 5) === 'v-if') {
        show(element, i)
      } else if (name.slice(0, 5) === 'v-on:') {
        onfunc(element, i)
      }
    }
    if (element && element.children) {
      for (let i = 0; i < element.children.length; i++) {
        if (element.children[i]) {
          parseAttr(element.children[i])
        }
      }
    }
  }

  function bind(element, i) {
    let name = element.attributes[i].name.slice(7)
    let value = element.attributes[i].value
    if (name[0] === '[' && name[name.length - 1] === ']') {
      // 动态指令
      name = name.slice(1, name.length - 1)
      name = data[name]
    }
    if (name === 'disabled') {
      element.disabled = !!data[value]
    } else if (name) {
      if (!data[value]) {
        try {
          // 动态指令中可能包含js表达式
          value = eval(value)
          element.setAttribute(name, value)
        } catch {
          console.log(eval(value))
        }
      } else {
        element.setAttribute(name, data[value])
      }
    }
  }

  function show(element, i) {
    let value = element.attributes[i].value
    if (!data[value]) {
      element.outerHTML = `<yzz name="${value}"><!-- ${
        element.outerHTML
      } --></yzz>`
    }
  }

  function onfunc(element, i) {
    let name = element.attributes[i].name.slice(5)
    let value = element.attributes[i].value
    element.setAttribute('on' + name, 'data.' + value + '()')
  }
  /**
   * 解析JS表达式
   * @param {*} s
   */
  function parseJS(s) {
    const value = eval(s)
    return `<yzz type="js">${value ? value : ''}</yzz>`
  }
})(window)
