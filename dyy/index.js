new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue.js!',
        rawHtml: '<span style="color: red">This should be red.</span>',
        dynamicId: 'blue',
        isButtonDisabled: null,
        dynamicClass: 'bgGreen'
    }
});

new Vue({
    el: '#app1',
    data: {
        seen: true,
        url: 'https://baidu.com',
        attributename: 'href',
        eventname: 'click'
    },
    methods: {
        clickAlert () {
            alert('hi!');
        },
    }
});

new Vue({
    el: '#app2',
    data: {
        url: 'https://baidu.com',
    },
    methods: {
        clickAlert () {
            alert('hi!');
        },
    }
});