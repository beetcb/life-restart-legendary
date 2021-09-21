import { chromium, devices } from 'playwright'
import l from 'signale'

let lifeTrace = []
let [age, maxAge] = [-1, -1]

const startTimestamp = new Date().getTime()
const browser = await chromium.launch()
const context = await browser.newContext({
  ...devices['Pixel 2'],
})

let page = await context.newPage()

// Pre
async function pre() {
  await page.goto('http://localhost:8080/view/index.html')
  await (await page.waitForSelector('#restart')).click()
  await (await page.waitForSelector('#random')).click()
}

// Choose talents
async function talentsSelect() {
  await page.waitForSelector('#talents')
  const talents = await page.$$('#talents>li')
  const [t1, t2, t3] = talents
  l.watch(`<任选天赋>
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
  await page.waitForSelector('#propertyAllocation')
  const props = await page.$$('#propertyAllocation>li>input')
  const [p1, p2, p3, p4] = props
  l.watch(`<属性分配>
    颜值：${await p1.inputValue()}
    智力：${await p2.inputValue()}
    体质：${await p3.inputValue()}
    家境：${await p4.inputValue()}`)

  await (await page.waitForSelector('#start')).click()

  lifeTrace = []
  let [curAge, lastTimeAge] = [-1, 0]
  while (curAge != lastTimeAge) {
    lastTimeAge = curAge
    const curAgeEle = await page.waitForSelector(
      '#lifeTrajectory>li:last-child>span'
    )
    const curAgeStatusEle = await page.$(
      '#lifeTrajectory>li:last-child>span:nth-child(2)'
    )
    curAge = parseInt(await curAgeEle.innerText())
    lifeTrace.push(`${curAge}：${await curAgeStatusEle.innerText()}`)
    await curAgeEle.click()
  }
  l.note(`寿命：${curAge}`)

  return curAge
}

async function live() {
  await pre()
  await talentsSelect()
  return await life()
}

while (age < 100) {
  age = await live().catch(async (e) => {
    // 逃过属性冲突报错
    console.log(e)
    page = await context.newPage()
    return -1
  })
  maxAge = age > maxAge ? age : maxAge
  l.note(`最高寿命：${maxAge}岁 累计用时：${(
    (new Date().getTime() - startTimestamp) /
    60000
  ).toFixed(2)} 分钟
  `)
}

l.success(`传奇人生轨迹
    ${lifeTrace.join(`
    `)}`)
await browser.close()
