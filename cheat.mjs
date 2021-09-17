import { chromium, devices } from 'playwright'
import l from 'signale'
const browser = await chromium.launch()
const page = await browser.newPage()

await browser.newContext({
  ...devices['Pixel 2'],
})

await page.goto('http://localhost:8080/view/index.html')

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
  const talents = await page.$$('#talents>*')
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

  let [curAge, lastTimeAge] = [-1, 0]
  while (curAge != lastTimeAge) {
    lastTimeAge = curAge
    const curAgeEle = await page.waitForSelector(
      '#lifeTrajectory>li:last-child>span'
    )
    curAge = parseInt(await curAgeEle.innerText())
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

let [age, maxAge] = [-1, -1]
while (age < 100) {
  age = await live()
  maxAge = age > maxAge ? age : maxAge
  l.note(`最高寿命：${maxAge}
  `)
  await page.reload()
}

l.success('百岁高寿')
browser.close()
