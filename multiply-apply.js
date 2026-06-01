
const APPLY_INTERVAL = 1

async function wait(seconds) {
  await new Promise(r => setTimeout(r, seconds * 1000))
}

async function apply() {
  $(".apply").children()[0].click()
  await wait(APPLY_INTERVAL)
  const moreJobs = $('[ng-click="applyBulk()"]')
  if (moreJobs) moreJobs.click()
  await wait(APPLY_INTERVAL)
  apply()
}

apply()
