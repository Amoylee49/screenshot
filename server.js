const express = require('express')
const puppeteer = require('puppeteer')
const app = express()
app.get('/puppe', (req, res) => {
    let query = req.query;
    console.log(query)

    //单次发送  Promise.all()?? https://juejin.cn/post/7003713678419705870
    loadPage(query)
        .then(data => {
            res.type('jpeg')
            res.send(data[0])
        })
        .catch(
            ereer => {
                res.status(500).send("链接访问错误？");
                console.log(ereer);
            }
        )
})
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
            let imageData = await page.screenshot(option);
            // images[selector].push(imageData)
            images.push(imageData)
        }
    }
    console.log(images)
    return images;
}

const loadPage = async function (query) {
    const browser = await puppeteer.launch({
            // headless: false,
            // slowMo: 3000,
            // devtools: false
            //处理多开卡死
            // 'dumpio': True
        }
    )
    const page = await browser.newPage()
    await page.setViewport({width: 611, height: 1228})
    await page.goto('https://wiki.biligame.com/cq/' + query.heroName)
    // .catch(err => {
    //     console.log('this error happen',err)
    // });
    let selectors = ['#hero_skill', '#hero_skill_sp.cqframe', '#mw-content-text > div > div.raw.ibook > div.col-md-7 > div:nth-child(4)']
    let promise = screenShotDOMElements(page, selectors);
    return promise
}

app.listen(process.env.PORT || 3000)