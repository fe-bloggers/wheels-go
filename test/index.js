const tpl = `
    <div id="app">
        <h3>文本</h3>
        <p>{{ message }}</p>
        <h3>原始 HTML</h3>
        <p>Using mustaches: {{ rawHtml }}</p>
        <p>Using v-html directive: <span v-html="rawHtml"></span></p>
        <h3>特性</h3>
        <div>
            <input type="checkbox" id="todo1" checked>
            <label for="todo1">Mustache 语法不能作用在 HTML 特性上</label>
        </div>
        <div>
            <input type="checkbox" id="todo2" checked>
            <label for="todo2">多个属性处理</label>
        </div>
        <p>&lt;div v-bind:id="dynamicId"&gt;&lt;/div&gt;</p>
        <div :class="{{dynamicClass}}">dynamicId</div>
        <div :class="dynamicClass">dynamicId</div>
        <div v-bind:id="dynamicId">dynamicId</div>
        <button v-bind:disabled="isButtonDisabled">Button</button>
        <h3>使用 JavaScript 表达式</h3>
        <p>{{ message.split('').reverse().join('') }}</p>
    </div>
`

describe("Vue {{}} test: ", function() {
    // 文本
    it("text --> ", function(){
        const message = 'Hello Vue.js!'
        const testTpl = `<p>{{ message }}</p>`
        const expectRes = `<p>${message}</p>`
        const vueIns = new Vue({
            testTpl,
            data: {
                message,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });

    // 原始 HTML
    it("raw html 1 --> ", function(){
        const rawHtml = `<span style="color: red">This should be red.</span>`
        const testTpl = `<p>Using mustaches: {{ rawHtml }}</p>`
        const expectRes = `<p>Using mustaches: ${rawHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
        const vueIns = new Vue({
            testTpl,
            data: {
                rawHtml,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });
    it("raw html 2 --> ", function(){
        const rawHtml = `<span style="color: red">This should be red.</span>`
        const testTpl = `<p>Using v-html directive: <span v-html="rawHtml"></span></p>`
        const expectRes = `<p>Using v-html directive: ${rawHtml}</p>`
        const vueIns = new Vue({
            testTpl,
            data: {
                rawHtml,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });

    // 特性
    it("attrs : --> ", function(){
        const dynamicClass = `blue`
        const testTpl = `<div :class="dynamicClass">dynamicId</div>`
        const expectRes = `<div class="${dynamicClass}">dynamicId</div>`
        const vueIns = new Vue({
            testTpl,
            data: {
                dynamicClass,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });
    it("attrs v-bind --> ", function(){
        const dynamicId = `bgGreen`
        const testTpl = `<div v-bind:id="dynamicId">dynamicId</div>`
        const expectRes = `<div id="${dynamicId}">dynamicId</div>`
        const vueIns = new Vue({
            testTpl,
            data: {
                dynamicId,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });
    it("attrs disabled --> ", function(){
        const isButtonDisabled = null
        const testTpl = `<button v-bind:disabled="isButtonDisabled">Button</button>`
        const expectRes = `<button >Button</button>`
        const vueIns = new Vue({
            testTpl,
            data: {
                isButtonDisabled,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });

    // 使用 JavaScript 表达式
    it("attrs disabled --> ", function(){
        const message = 'Hello Vue.js!'
        const testTpl = `<p>{{ message.split('').reverse().join('') }}</p>`
        const expectRes = `<p>${message.split('').reverse().join('')}</p>`
        const vueIns = new Vue({
            testTpl,
            data: {
                message,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });
});