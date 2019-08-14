class Vue {
    constructor({
        el,
        data
    }) {
        this.el = el;
        this.data = data;
        this.getHtmlString();
    }

    static leftMustache = '{{';
    static rightMustache = '}}';
    //                     <span           
    // $1 $2
    static leftLabelReg = '<(\\S+)\\s(\\S+\\s)*?'
    //                        >  </span>
    static rightLabelReg = '.*>.*<\\/\\1>'
    //                     <span           
    // $1 $2
    static openLabelReg = '<([^>]+)(\\s[^>]+)+?'
    //                      >
    static closeLabelReg = '>'
    static vValueReg = `=['"](.+)['"]`

    getHtmlString() {
        this._dom = document.querySelector(this.el)

        if (!this._dom) {
            throw new Error('no dom found, please check your el');
        }

        const htmlString = this._dom.outerHTML
        let str = this.handleVHtml(htmlString)
        str = this.handleVAttrs(str)

        str = this.getMustacheVariables(str)
        this._dom.outerHTML = str
    }

    getMustacheVariables(str) {
        const { leftMustache, rightMustache } = Vue;
        const leftMustacheArr = str.split(leftMustache);

        for (let i = 0, len = leftMustacheArr.length; i < len; i++) {
            const s = leftMustacheArr[i];
            const rightMustacheArr = s.split(rightMustache);

            // 缺少 rightMustache 的情况
            if (rightMustacheArr.length === 1) {
                // 首位可以没有 rightMustache
                if (i === 0) {
                    continue;
                }

                throw new Error(`Mustache must be couple, at the ${i}th ${leftMustache}`);
            } else if (rightMustacheArr.length > 2) {
                // 多余 rightMustache 的情况
                throw new Error(`Mustache must be couple, at the ${i}th ${leftMustache}`);
            } else {
                const variable = rightMustacheArr[0];
                let value = variable.trim()
                value = this.calculateJsValue(value)
                value = this.calculateHtmlValue(value)
                str = str.replace(`${leftMustache}${variable}${rightMustache}`, value)
            }
        }

        return str;
    }

    handleVAttrs(str) {
        const fns = [
            'handleVBind'
        ]
        const {openLabelReg, closeLabelReg, leftMustache, rightMustache} = Vue
        // <span v-html="rawHtml"></span>
        const reg = new RegExp(`${openLabelReg}${closeLabelReg}`, 'g')
        const matchRes = str.match(reg)

        if (matchRes) {
            const replaceArr = matchRes.map(attrStr => {
                if (attrStr.indexOf(leftMustache) > -1 || attrStr.indexOf(rightMustache) > -1) {
                    console.warn('html attrs can not use {{}}', attrStr)
                    return []
                }
                const attrArr = attrStr.split(' ')

                return attrArr.map(attr => {
                    fns.forEach(fn => {
                        attr = this[fn](attr)
                    })
                    return attr
                })
            })
            let index = 0
            str = str.replace(reg, (match) => {
                return replaceArr[index++].join(' ')
            })
            
        }

        return str
    }

    /**
     * 需要替换整体dom
     * @param {*} str 
     */
    handleVHtml(str) {
        const {leftLabelReg, rightLabelReg, vValueReg} = Vue
        // <span v-html="rawHtml"></span>
        const reg = new RegExp(`${leftLabelReg}v-html${vValueReg}${rightLabelReg}`, 'g') 

        str = str.replace(reg, (match, p1, p2, p3) => {
            return this.calculateJsValue(p3)
        })

        return str
    }

    handleVBind(str) {
        const {leftLabelReg, rightLabelReg, vValueReg} = Vue
        // <div v-bind:id="dynamicId">dynamicId</div>
        const reg = new RegExp(`(v-bind)?(:)(\\S+)${vValueReg}`, 'g') 

        str = str.replace(reg, (match, p1, p2, p3, p4) => {
            const value = this.calculateJsValue(p4)

            if (value) {
                return match.replace(p1, '').replace(p2, '').replace(p4, value)
            }

            return ''
        })

        return str
    }

    /**
     * 原始 HTML
     */
    calculateHtmlValue(str) {
        if (str && str.match(/<.*>/)) {
            return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }

        return str
    }

    /**
     * 文本
     * JavaScript 表达式
     */
    calculateJsValue(str) {        
        /**
         * 特性
         *      v-bind
         */
        
        const keys = Object.keys(this.data).join(', ')
        const fn = new Function(`
            const {${keys}} = this
            return ${str}
        `);
        try {
            const value = fn.call(this.data);
            return value
        } catch (e) {
            console.warn('calculateJsValue error', e)
        }
    }
}

window.Vue = Vue;