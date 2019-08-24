const data = {
  a: 'hello world',
  ab: '!',
  htmlText: '<span style="color:red;">哈哈哈</span>',
}

const body = document.getElementsByTagName('body')[0]
if (body) {
  const elements = body.children
  if (elements && elements.length) {
    this.iteratorDoms(elements)
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
      // 1.解析文本
      let s = elements[i].innerHTML
      elements[i].innerHTML = parseText(s)
      // 2.解析HTML
      elements[i] = parseAttr(elements[i])
    }
  }
}

function parseText(s) {
  const regx = /[a-zA-Z]/
  const arr = s.split('')
  const res = []
  for (let j = 0; j < arr.length; j++) {
    let tmpS = arr[j]
    if (arr[j].trim(' ')) {
      let varName = ''
      // 遇到两个连着的左括号，开始解析变量
      if (
        arr[j] === '{' &&
        j + 1 < arr.length &&
        arr[j + 1] === '{' &&
        (j + 2 >= arr.length || (j + 2 < arr.length && arr[j + 2] !== '{'))
      ) {
        let k = j + 2
        if (arr[j] === ' ') {
          k++
        }
        let flag = true // 括号是否正确闭合
        for (; k < arr.length - 1; k++) {
          if (arr[k] === '}') {
            // 遇到第一个右括号，如果下一个字符也是右括号，说明正确闭合
            if (arr[k + 1] === '}') {
              // 正确闭合，进行变量解析，并重置参数
              if (flag && varName) {
                let name = varName.trim()
                const value = data[name] ? data[name] : ''
                tmpS = `<yzz name="${name}">${value}</yzz>`
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
            if (regx.test(arr[k]) || arr[k] === ' ') {
              varName += arr[k]
            } else {
              // 变量名不符合规则
              flag = false
              k += varName.length
              j = k
              break
            }
          }
        }
        j = k
      }
    }
    res.push(tmpS)
  }
  return res.join('')
}

function parseAttr(element) {
  const attr = element.getAttribute('v-html')
  if (attr) {
    const value = data[attr] ? data[attr] : ''
    element.innerHTML = `<yzz name="${attr}">${value}</yzz>`
  } else if (element && element.childNodes) {
    for (let i = 0; i < element.children.length; i++) {
      if (element.children[i]) {
        parseAttr(element.children[i])
      }
    }
  }
}
