describe("Vue review test: ", function() {
    // 变量名中含有数字
    it("variable has number -->", function(){
        const message1 = 'Hello Vue.js!'
        const testTpl = `<p>{{ message1 }}</p>`
        const expectRes = `<p>${message1}</p>`
        const vueIns = new Vue({
            testTpl,
            data: {
                message1,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });

    // 模板中含有{{{}}}
    it("template has {{{}}} -->", function(){
        const message = 'Hello Vue.js!'
        const testTpl = `<p>{{{ message }}}</p>`
        const expectRes = `<p>{${message}}</p>`
        const vueIns = new Vue({
            testTpl,
            data: {
                message,
            }
        });
        expect(expectRes).toEqual(vueIns._dom.outerHTML);
    });
});