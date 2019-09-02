let i = 0
function appendDom (testTpl) {
    const tempNode = document.createElement('div');
    tempNode.id = `testTpl${i++}`;
    tempNode.innerHTML = testTpl;
    document.body.append(tempNode);
}

describe("参数: ", function() {
    it("v-if -->", function(){
        const testTpl = `
            <p v-if="seen">现在你看到我了，下面还有一个看不到的</p>
            <p v-if="!seen">现在你看不到我了</p>
        `
        const expectRes = `
            <p>现在你看到我了，下面还有一个看不到的</p>
        `
        const vueIns = new Vue({
            testTpl,
            data: {
                seen: true,
            }
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
    });

    it("v-bind:href -->", function(){
        const url = 'https://baidu.com'
        const testTpl = `<a v-bind:href="url">百度</a>`
        const expectRes = `<a href="${url}">百度</a>`
        const vueIns = new Vue({
            testTpl,
            data: {
                url,
            }
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
    });

    it("v-on:click -->", function(){
        const testTpl = `<a v-on:click="clickAlert">click alert</a>`
        appendDom(testTpl)
        const expectRes = `<a>click alert</a>`
        const methods = {
            clickAlert () {
                alert('hi!');
            }
        }
        spyOn(methods, 'clickAlert');
        const vueIns = new Vue({
            el: `#testTpl${i - 1}`,
            data: {
                className: 'test'
            },
            methods
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);

        vueIns._dom.children[0].click()
        expect(methods.clickAlert).toHaveBeenCalled();
    });
});

describe("动态参数: ", function() {
    it("v-bind:[attributename] -->", function(){
        const url = 'https://baidu.com'
        const attributename = 'href'
        const testTpl = `
            <a v-bind:[attributename]="url">动态百度</a>
            <a v-bind:[attributeName]="url">驼峰转换</a>
        `
        const expectRes = `
            <a ${attributename}="${url}">动态百度</a>
            <a ${attributename}="${url}">驼峰转换</a>
        `
        const vueIns = new Vue({
            testTpl,
            data: {
                url,
                attributename,
            }
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
    });

    it("v-on:[eventname] -->", function(){
        const eventname = 'click'
        const testTpl = `<a v-on:[eventname]="clickAlert"> dynamic click alert</a>`
        appendDom(testTpl)
        const expectRes = `<a> dynamic click alert</a>`
        const methods = {
            clickAlert () {
                alert('hi!');
            }
        }
        spyOn(methods, 'clickAlert');
        const vueIns = new Vue({
            el: `#testTpl${i - 1}`,
            data: {
                eventname
            },
            methods
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);

        vueIns._dom.children[0].click()
        expect(methods.clickAlert).toHaveBeenCalled();
    });

    // 编译警告
    it(`dynamic attrs can not parse ' or " or space`, function(){
        const url = 'https://baidu.com'
        const attributename = 'href'
        const testTpl = `
            <a v-bind:['foo' + bar]="url">编译警告</a>
        `
        spyOn(console, 'warn');
        new Vue({
            testTpl,
            data: {
                url,
                attributename,
            }
        });
        expect(console.warn).toHaveBeenCalled();
    });
});

describe("修饰符: ", function() {
    // 修饰符
    it("v-on:submit.prevent -->", function(){
        const eventname = 'click'
        const testTpl = `
            <form v-on:submit.prevent="clickAlert">
                <button>test prevent</button>
            </form>
        `
        appendDom(testTpl)
        const expectRes = `
            <form>
                <button>test prevent</button>
            </form>
        `
        const methods = {
            clickAlert () {
                alert('hi!');
            }
        }
        spyOn(methods, 'clickAlert');
        const vueIns = new Vue({
            el: `#testTpl${i - 1}`,
            data: {
                eventname
            },
            methods
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);

        vueIns._dom.children[0].children[0].click()
        expect(methods.clickAlert).toHaveBeenCalled();
    });
});

describe("缩写: ", function() {
    it("v-bind 缩写 -->", function(){
        const url = 'https://baidu.com'
        const testTpl = `<a :href="url">百度</a>`
        const expectRes = `<a href="${url}">百度</a>`
        const vueIns = new Vue({
            testTpl,
            data: {
                url,
            }
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);
    });

    it("v-on 缩写 -->", function(){
        const testTpl = `<a @click="clickAlert">click alert</a>`
        appendDom(testTpl)
        const expectRes = `<a>click alert</a>`
        const methods = {
            clickAlert () {
                alert('hi!');
            }
        }
        spyOn(methods, 'clickAlert');
        const vueIns = new Vue({
            el: `#testTpl${i - 1}`,
            data: {
                className: 'test'
            },
            methods
        });
        expect(expectRes).toEqualWithoutVid(vueIns._dom.innerHTML);

        vueIns._dom.children[0].click()
        expect(methods.clickAlert).toHaveBeenCalled();
    });
});