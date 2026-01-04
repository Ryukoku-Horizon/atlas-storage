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
      username: "GitHub Actions",
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
        notion2atlasからhorizon-atlasのworkflow実行に失敗しました
        期限切れの可能性があるので、確認しましょう
        error: ${text}
        `)
    throw new Error(text)
    }

    console.log("workflow dispatched");
})()