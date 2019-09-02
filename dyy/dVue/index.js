class Vue {
    constructor({
        el,
        data,
        methods,
        testTpl
    }) {
        this.el = el;
        this.data = data;
        this.methods = methods;
        this._vid = 0;
        this._eventQueue = {};
        this.getHtmlString(testTpl);
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

    getHtmlString(testTpl) {
        this._dom = document.querySelector(this.el) || {
            innerHTML: testTpl
        }

        if (!this._dom) {
            throw new Error('no dom found, please check your el');
        }

        const htmlString = this._dom.innerHTML
        const tmpNode = document.createElement('div');
        tmpNode.innerHTML = htmlString;
        // 处理 dom
        this.traverseDom(tmpNode, (ch) => {
            return this.attrHandles(ch)
        });
        
        // 只处理 string
        let str = tmpNode.innerHTML
        str = this.getMustacheVariables(str)

        this._dom.innerHTML = str
        
        this.bindEvents();
    }

    getMustacheVariables(str) {
        const reg = new RegExp('{{([^{}]*)}}', 'g')
        const { leftMustache, rightMustache } = Vue;
        const leftMustacheArr = str.split(leftMustache);

        str = str.replace(reg, (match, p1) => {
            let value = p1.trim()
            value = this.calculateJsValue(value)
            value = this.calculateHtmlValue(value)
            return value
        })

        return str;
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
        /**
         * note: eval 无法获取作用域
         */
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