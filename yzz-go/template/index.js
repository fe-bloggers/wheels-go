const data = {
    a: 'hello world',
    ab: '!'
}

const body = document.getElementsByTagName('body')[0]
if (body) {
    const elements = body.children
    if (elements && elements.length) {
        this.iteratorDoms(elements)
    }
}

function iteratorDoms(elements) {
    const regx = /([\{]{2})([a-zA-Z]{1,})([\}]{2})/g
    const mulLeftRegx = /([\{]{3,})/g
    const mulRightRegx = /([\}]{3,})/g
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName === 'script') {
            continue
        }
        if (elements[i].firstChild && elements[i].firstChild.nodeValue) {
            let s = elements[i].innerText
            const arr = s.match(regx)
            if ((s.indexOf('{') > -1 || s.indexOf('}') > -1) && !arr) {
                console.error('Can\'t resolve template' + s + ' !')
                continue
            }
            if (mulLeftRegx.test(s) || mulLeftRegx.test(s)) {
                console.error('Can\'t resolve multiple brackets! ERROR Template: ' + s)
            }
            if (arr) {
                arr.forEach(item => {
                    const name = item.slice(2, item.length - 2)
                    if (data.hasOwnProperty(name)) {
                        s = s.replace('{{' + name + '}}', data[name])
                        elements[i].innerText = s
                    } else {
                        s = s = s.replace('{{' + name + '}}', '')
                        elements[i].innerText = s
                        console.error('Can\'t find variable ' + name + ' !')
                    }
                })
            }
        }
        // 递归遍历DOM
        if (elements[i].children && elements[i].children.length > 0) {
            this.iteratorDoms(elements[i].children)
        }
    }
}