const matchers = {
    toEqualWithoutVid: (util, customEqualityTesters) => {
        return {
            compare: (actual, expected = '') => {
                return {
                    pass: expected.replace(/\sv-id="\d+"/g, '').trim() === actual.trim(),
                }
            }
        }
    }
}

beforeEach(function() {
    jasmine.addMatchers(matchers);
});

describe("插值: ", function() {
    it("文本 --> ", function(){
        const message = 'Hello Vue.js!'
        const testTpl = `
            <p>{{ message }}</p>
            <p>{{{ message }}}</p>
            <p>{ message }</p>
        `
        const expectRes = `
            <p>${message}</p>
            <p>{${message}}</p>
            <p>{ message }</p>
        `
        const vueIns = new Vue({
            testTpl,
            data: {
                message,
            }
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
    });

    it("原始 HTM --> ", function(){
        const rawHtml = `<span style="color: red">This should be red.</span>`
        const testTpl = `
            <p>Using mustaches: {{ rawHtml }}</p>
            <p>Using v-html directive: <span v-html="rawHtml"></span></p>
        `
        const expectRes = `
            <p>Using mustaches: ${rawHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <p>Using v-html directive: ${rawHtml}</p>
        `
        const vueIns = new Vue({
            testTpl,
            data: {
                rawHtml,
            }
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
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
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
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
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
    });
    it("attrs disabled --> ", function(){
        const isButtonDisabled = null
        const testTpl = `<button v-bind:disabled="isButtonDisabled">Button</button>`
        const expectRes = `<button>Button</button>`
        const vueIns = new Vue({
            testTpl,
            data: {
                isButtonDisabled,
            }
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
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
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
    });
});