import { chromium } from 'playwright'
import l from 'signale'
const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto('http://localhost:8080/view/index.html')
await page.setViewportSize({ width: 1368, height: 761 })

// Pre
async function pre() {
  await page.waitForSelector('#restart')
  await page.click('#restart')
  await page.waitForSelector('#random')
  await page.click('#random')
}

// Choose talents
async function talentsSelect() {
  await page.waitForSelector('#talents')
  const talents = await page.$$('#talents > .grade0b')
  const [t1, t2, t3] = talents
  l.watch(` 任选天赋
  ${await t1.innerText()}
  ${await t2.innerText()}
  ${await t3.innerText()}`)

  await t1.click()
  await t2.click()
  await t3.click()
}

async function life() {
  await (await page.waitForSelector('#next')).click()
  await (await page.waitForSelector('#random')).click()
  await (await page.waitForSelector('#start')).click()

  let [curAge, lastTimeAge] = [-1, 0]
  while (curAge != lastTimeAge) {
    lastTimeAge = curAge
    const curAgeEle = await page.waitForSelector(
      '#lifeTrajectory>li:last-child>span'
    )
    curAge = parseInt(await curAgeEle.innerText())
    await curAgeEle.click()
  }
  l.note(`寿命：${curAge}
    `)

  return curAge
}

async function live() {
  await pre()
  await talentsSelect()
  return await life()
}

let age = -1
while (age < 100) {
  age = await live()
  await page.reload()
}

l.success('百岁高寿')
browser.close()
