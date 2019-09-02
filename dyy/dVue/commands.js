Vue.prototype.traverseDom = function (tmpNode, handler) {
    const children = [...tmpNode.children];
    children.forEach(ch => {
        ch.setAttribute('v-id', this._vid++)
        const isContinue = handler && handler(ch);
        if (isContinue) {
            this.traverseDom(ch, handler);
        }
    });
}

Vue.prototype.bindEvents = function (ch) {
    const keys = Object.keys(this._eventQueue)
    keys.forEach(k => {
        const queue = this._eventQueue[k]
        queue.forEach(q => {
            /** q eg:
                {
                    eventName: 'click',
                    method: 'clickAlert',
                    options: {
                        capture: true,
                        once: true,
                        passive: true
                    },
                    prevent
                }
             */
            const { eventName, method, options = {}, prevent } = q
            const ele = document.querySelector(`${this.el} [v-id="${k}"]`)
            if (!ele) {
                console.warn(`v-id: ${k} is not found`)
                return
            }
            const eventHandler = this.methods[method]
            eventHandler && ele.addEventListener(eventName, (e) => {
                prevent && e.preventDefault()
                eventHandler(e)
            }, options)
        })
    })
};

Vue.prototype.attrHandles = function (ch) {
    const attrs = [...ch.attributes]
    let isContinue = true
    for (let i = 0, len = attrs.length; i < len; i++) {
        const attr = attrs[i]

        // 空格会将属性分割为多个属性
        if (+attr.name.match(/\[/) ^ +attr.name.match(/\]/) || attr.name.match(/'|"/)) {
            console.warn(`dynamic attrs can not parse ' or " or space`)
            return false
        }

        const { leftMustache, rightMustache } = Vue;
        if (attr.value.indexOf(leftMustache) > -1 || attr.value.indexOf(rightMustache) > -1) {
            console.warn('html attrs can not use {{}}', attr.value)
            continue
        }

        const entries = [...attrHandlesMap.entries()]
        entries.forEach(([reg, fn]) => {
            if (reg.test(attr.name)) {
                isContinue =  isContinue && fn.call(this, ch, attr)
            }
        })
    }

    return isContinue
};

/**
 * v-if
 */
function handleVif (ch, attr) {
    /**
     * note: string 生成 dom 的三种方法
     * 
     *      const tempNode = document.createElement('div');
            tempNode.innerHTML = template;

            new DOMParser().parseFromString(template, 'text/html')

            document.createRange().createContextualFragment(template);
     */
    
    let ifValue = attr.value;
    if (ifValue) {
        ifValue = this.calculateJsValue(ifValue);
        if (ifValue) {
            ch.removeAttribute(attr.name)
        } else {
            ch.parentNode.removeChild(ch)
            return false
        }
    }
    return true
};

/**
 * 需要替换整体dom
 */
function handleVHtml (ch, attr) {
    let value = attr.value
    value = this.calculateJsValue(value)
    ch.outerHTML = value
    return true
}

/**
 * 动态参数
 */
function handleDynamicAttrs (ch, attr) {
    const matchRes = attr.name.match(/(v-bind|v-on):\[(.+)\]$/)

    if (matchRes) {
        const value = this.calculateJsValue(matchRes[2])
        const newAttr = `${matchRes[1]}:${value}`
        ch.removeAttribute(attr.name)
        ch.setAttribute(newAttr, attr.value)
        return {
            name: newAttr,
            value: attr.value
        }
    }
}

/**
 * 事件绑定
 */
function handleVon (ch, attr) {
    const mockAttr = handleDynamicAttrs.call(this, ch, attr)
    attr = mockAttr || attr

    let eventName = attr.name.match(/(v-on:|@)(\S+)$/)
    const vid = ch.getAttribute('v-id')

    if (!eventName) {
        console.warn('can not read this v-on attr: ', attr)
        return true
    }

    eventName = eventName[2]

    const reg = /\.(prevent)$/
    const modifier = eventName.match(reg)
    this._eventQueue[vid] = this._eventQueue[vid] || []
    const queue = {
        eventName: eventName.replace(reg, ''),
        method: attr.value
    }
    if (modifier) {
        queue[modifier[1]] = true
    }
    this._eventQueue[vid].push(queue)
    ch.removeAttribute(attr.name)

    return true
}

/**
 * 属性绑定
 */
function handleVBind (ch, attr) {
    const mockAttr = handleDynamicAttrs.call(this, ch, attr)
    attr = mockAttr || attr
    let name = attr.name.match(/(v-bind:|:)(\S+)$/)
    if (!name) {
        console.warn('can not parse this v-bind attr: ', attr.name)
        return true
    }
    name = name[2]
    let value = attr.value
    value = this.calculateJsValue(value)
    ch.removeAttribute(attr.name)
    value && ch.setAttribute(name, value)
    return true
}

const attrHandlesMap = new Map([
    // [/\/S+:\[.+\]/, handleDynamicAttrs],
    [/v-if/, handleVif],
    [/v-bind:\S+/, handleVBind],
    [/^:\S+/, handleVBind],
    [/v-on:\S+/, handleVon],
    [/^@\S+/, handleVon],
    [/v-html/, handleVHtml]
])