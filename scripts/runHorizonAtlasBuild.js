async function notifyDiscord(title, description, color = 0x3498db, errorLog = null) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const embed = {
    title: title,
    description: description,
    color: color,
    timestamp: new Date().toISOString(),
    footer: { text: "HorizonAtlas System Monitoring" },
    fields: [
      {
        name: "Target Repository",
        value: "[Ryukoku-Horizon/horizon-atlas](https://github.com/Ryukoku-Horizon/horizon-atlas)",
        inline: true
      }
    ]
  };

  // もしエラーログがあれば、フィールドとして追加
  if (errorLog) {
    embed.fields.push({
      name: "💻 GitHub API Response",
      value: `\`\`\`json\n${errorLog}\n\`\`\``, // コードブロックで囲む
      inline: false
    });
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "HorizonAtlas Notify",
      embeds: [embed],
    }),
  });
}

const token = process.env.HORIZON_ATLAS_APP_GH_PAT;

(async () => {
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

    const errorLog = text.length > 500 ? text.substring(0, 500) + "..." : text;

    await notifyDiscord(
      "🚨 【緊急】Workflow 起動失敗",
      "**atlas-storage** からの `build-deploy` 実行リクエストが拒否されました。",
      0xff4b2b, // エラー用の赤色
      errorLog  // 第4引数としてエラーテキストを渡す
    );

  }

  console.log("workflow dispatched");
})();
