// ==UserScript==
// @name         anime1全集
// @version      0.0.1
// @include      https://anime1.me/*
// ==/UserScript==
(function () {
    'use strict';
    const parseHTML = str => {
        let tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = str;
        return tmp;
    };
    const strTrim = str => str.replace(/[0-9 ]/g, '').trim().toLowerCase();
    let first_flag;
    let keyword;
    const $searchbar = document.getElementById('search-2');
    const $section = document.createElement('section');
    const $ul = document.createElement('ul');
    const $button = document.createElement('input');
    $button.type = 'submit';
    $button.value = '全集';
    $section.className = 'widget';
    $section.insertAdjacentElement('afterbegin', $ul);
    $searchbar.firstChild.appendChild($button);
    $searchbar.appendChild($section);
    const b = async (doc) => {
        const name = [];
        const word = strTrim(keyword);
        let urls = [...doc.querySelectorAll('h2 a')].filter(a => strTrim(a.text).indexOf(word) != -1).map(a => { name.push(a.text); return a.href; });
        let htmls = await Promise.all(urls.map(url => fetch(url).then(res => res.text())))
        urls = htmls.map(html => parseHTML(html).querySelector('iframe').src);
        //htmls = await Promise.all(urls.map(url=>fetch(url).then(res => res.text())))
        //urls = htmls.map(html => html.match(/"([^"]+?)",label:"HD"/)[1]);
        //console.log(urls);
        if (first_flag) { first_flag = false; $ul.innerHTML = ''; };
        urls.forEach((url, i) => { $ul.insertAdjacentHTML('afterbegin', `<li><a target =_blank href="${url}">${name[i]}</a></li>`) });
    }
    const a = async (callback) => {
        let doc = await fetch(`https://anime1.me/?s=${keyword}`).then(res => res.text()).then(parseHTML);
        b(doc);
        while (true) {
            try {
                const next = doc.querySelector('.nav-previous a').href;
                const next_doc = await fetch(next).then(res => res.text()).then(parseHTML);
                doc = next_doc
                b(doc);
            } catch (err) { break; }
        }
    }
    $button.addEventListener('click', (e) => {
        e.preventDefault();
        keyword = document.querySelector('#search-2 input').value;
        $ul.innerHTML = `<svg width="200px"  height="200px"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-ball" style="background: none;">
            <circle cx="50" ng-attr-cy="{{config.cy}}" ng-attr-r="{{config.radius}}" ng-attr-fill="{{config.color}}" cy="24.8529" r="13" fill="#e15b64">
            <animate attributeName="cy" calcMode="spline" values="23;77;23" keyTimes="0;0.5;1" dur="1" keySplines="0.45 0 0.9 0.55;0 0.45 0.55 0.9" begin="0s" repeatCount="indefinite"></animate>
            </circle>
            </svg>`;
        first_flag = true;
        a().catch(console.log);
    })
})();
