async function notifyDiscord(message) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not set");
    return;
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "HorizonAtlas",
      content: message,
    }),
  });
}

const token = process.env.HORIZON_ATLAS_APP_GH_PAT;
(async()=>{
    const res = await fetch(
    "https://api.github.com/repos/Ryukoku-Horizon/horizon-atlas/actions/workflows/build_Deploy.yml/dispatches",
    {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main" }),
    }
    );

    if (!res.ok) {
    const text = await res.text();
    await notifyDiscord(`
      【緊急】
        atlas-storageから”run build-deploy on HorizonAtlas”のworkflow実行に失敗しました
        HORIZON_ATLAS_APP_GH_PATが期限切れの可能性があるので、確認しましょう
        `)
    throw new Error(text)
    }
    const date = new Date()
    if((date.getMonth() % 4) + 1===0 && date.getDate()===1){
      await notifyDiscord(`
      【定期】
        HORIZON_ATLAS_APP_GH_PATの期限を更新してください
        方法についてはこちら→[pat更新の方法](https://www.notion.so/pat-2e0a501ef33780e7be6cef8a86802f2f)
        `)
    }

    console.log("workflow dispatched");
})()