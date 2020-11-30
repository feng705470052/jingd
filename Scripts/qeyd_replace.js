const exec = require("child_process").execSync;
const fs = require("fs");
const axios = require("axios");

// 公共变量
const Secrets = {
    SyncUrl: process.env.SYNCURL, //签到地址,方便随时变动
    PUSH_KEY: process.env.PUSH_KEY, //server酱推送消息
    BARK_PUSH: process.env.BARK_PUSH, //Bark推送
    TG_BOT_TOKEN: process.env.TG_BOT_TOKEN, //TGBot推送Token
    TG_USER_ID: process.env.TG_USER_ID, //TGBot推送成员ID
    COOKIE_QEYD: process.env.COOKIE_QEYD, //企鹅阅读ck
};
let Cookies = [];

async function downFile() {
    let response = await axios.get(Secrets.SyncUrl);
    let content = response.data;
    await fs.writeFileSync("./temp.js", content, "utf8");
}

async function changeFiele(content, cookie) {
    //替换各种信息.
    content = content.replace("$.getdata(qqreadurlKey)", "\"https://mqqapi.reader.qq.com/mqq/user/init\"")
    content = content.replace("$.getdata(qqreadheaderKey)", JSON.stringify(cookie.split("@")[0]))
    content = content.replace("$.getdata(qqreadtimeurlKey)", JSON.stringify(cookie.split("@")[1]))
    content = content.replace("$.getdata(qqreadtimeheaderKey)", JSON.stringify(cookie.split("@")[2]))

    await fs.writeFileSync( './execute.js', content, 'utf8')
}

async function executeOneByOne() {
    const content = await fs.readFileSync("./temp.js", "utf8");
    for (var i = 0; i < Cookies.length; i++) {
        console.log(`正在执行第${i + 1}个账号`);
        await changeFiele(content, Cookies[i]);
        console.log("替换变量完毕");
        try {
            await exec("node execute.js", { stdio: "inherit" });
        } catch (e) {
            console.log("执行异常:" + e);
        }
        console.log("执行完毕");
    }
}

async function start() {
    console.log(`当前执行时间:${new Date().toString()}`);
    if (!Secrets.COOKIE_QEYD) {
        console.log("请填写 COOKIE_QEYD 后在继续");
        return;
    }
    if (!Secrets.SyncUrl) {
        console.log("请填写 SYNCURL 后在继续");
        return;
    }
    Cookies = Secrets.COOKIE_QEYD.split("\n");
    console.log(`当前共${Cookies.length}个账号需要执行`);
    // 下载最新代码
    await downFile();
    console.log("下载代码完毕");
    await executeOneByOne();
    console.log("全部执行完毕");
}

start();
