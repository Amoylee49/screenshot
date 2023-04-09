// const puppeteer = require("puppeteer");
const {Cluster} = require("puppeteer-cluster");
const express = require('express')
const app = express()

let baseUrl = __dirname + '/imgs';
// https://www.npmjs.com/package/@zhaow-de/puppeteer-cluster
// https://www.golinuxcloud.com/cannot-set-headers-after-they-are-sent-to-client/
const launchOptions = {
    headless: true,
    ignoreHTTPSErrors: true, //忽略证书错误
    waitUntil: 'networkidle2',
    defaultViewport: {
        width: 500, high: 500
    },
    args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-xss-auditor',    // 关闭 XSS Auditor
        '--no-zygote',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--allow-running-insecure-content',     // 允许不安全内容
        '--disable-webgl',
        '--disable-popup-blocking',
        //'--proxy-server=http://127.0.0.1:8080'      // 配置代理
    ]
    // executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
};

const clusterLaunchOptions = {
    concurrency: Cluster.CONCURRENCY_CONTEXT, //单chrome 多 Tab模式
    maxConcurrency: 2,//并发work数
    retryLimit: 2,//重试次数
    // skipDuplicateUrls: false, //不爬重复 url
    monitor: true,//显示消耗性能
    // puppeteerOptions: launchOptions,
};
(async () => {
    const cluster = await Cluster.launch(clusterLaunchOptions);

    // const url = 'https://wiki.biligame.com/cq/'+heroName
    // console.log(url)
    await cluster.task(async ({page, data: url}) => {
        let count = 0;
        count++;
        console.log(url)
        await page.goto(url);
        const path = url + `${count}.jpeg`;
        let selectors = ['#hero_skill_sp > div.cqframe_box','#hero_skill > div.cqframe_box > div.b-skill > div.b-skill-img', '#hero_skill > div.cqframe_box > div.wp-box']

        const promise = screenShotDOMElements(page,selectors);
        return promise
    });


    app.get('/puppe', async (req, res) => {
        let query = req.query
        const pageUrl = 'https://wiki.biligame.com/cq/' + query.heroName

        try {
            const screen = await cluster.execute(pageUrl);
            res.type('jpeg')
            // Promise.all(res.send(screen))
            res.send(screen[1])
        } catch (err) {
            // Handle crawling error
        }
    })

    // await cluster.idle();
    // await cluster.close();

    app.listen(process.env.PORT || 4000, function () {
        console.log('Screenshot is listening on port 4000')
    })

})();

/**
 *
 * @param page
 * @param selectors 截取的div块
 * @returns {Promise<{}>}  返回 promise
 */
const screenShotDOMElements = async function (page, selectors) {
    if (!Array.isArray(selectors)) {
        throw "invalid screenshot selectors";
    }

    // let images = { };
    let images = [];
    for (let i in selectors) {
        let selector = selectors[i];
        if (typeof selector !== 'string') {
            continue;
        }
        //这个page.evaluate返回一个可序列化的普通对象，pageFunction 表示要在页面执行的函数， args 表示传入给 pageFunction 的参数，
        let rects = await page.evaluate((selector) => {
            try {
                let elements = document.querySelectorAll(selector);
                let ranges = [];
                elements.forEach(function (element) {
                    let {left, top, width, height} = element.getBoundingClientRect();
                    if (width * height !== 0) {
                        return ranges.push({left, top, width, height})
                    }
                });
                return ranges;
            } catch (e) {
                return [];
            }
        }, selector);

        // images[selector] = [];
        for (let j in rects) {
            let rect = rects[j];
            let option = {
                type: 'jpeg',
                encoding: 'binary',
                clip: rect ? {
                    y: rect.top,
                    x: rect.left,
                    width: rect.width,
                    height: rect.height
                } : null
            };
            // let index = j++
            // console.log(index)
            let imageData = await page.screenshot(option);
            // images[selector].push(imageData)
            // images[selector] = imageData
            images.push(imageData)
        }
    }
    // console.log(images)
    return images;
}