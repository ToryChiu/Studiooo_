# 秋鸽 Studiooo_

莫斯科、圣彼得堡婚纱摄影静态报价网站。无需注册、数据库或 API。

## 发布
GitHub → Settings → Pages → Deploy from a branch → main → /(root) → Save。
目标地址：https://torychiu.github.io/Studiooo_/ （Pages 构建成功后生效）。

## 维护
- 页面与样式：index.html。
- 人民币套餐与视频：脚本中的 PRICE、FILM。
- 卢布场地许可：VENUE；仪式 8,000₽。
- 固定参考汇率：RUB_RATE = 0.08375，非实时。更新时同步修改页面、仪式参考价及复制清单中的汇率说明。
- 圣彼得堡路线限制：routeValid。
- 莫斯科地点：MOSCOW_PLACES（分钟仅为内部预算）；转场矩阵：MOSCOW_TRANSFERS。
- 套餐内部上限：MOSCOW_BUDGET；特殊允许组合：MOSCOW_ALLOWED_B，仅匹配完整组合。
- moscowValid 使用最短开放路线判断，不依赖勾选顺序；M16 为套餐 A 独立路线。
- 各城市地点、自由创作和备注分别保留，复制报价仅包含当前城市。
- 自由创作不占名额、不加价，复制清单明确记录选择状态。
- 逻辑检查：node test-routes.cjs。浏览器检查：安装 Playwright 及 Chromium/WebKit 后运行 node test.cjs。
- 可用 STUDIO_TEST_URL 指定正式 HTTPS 网址做回归检查。
- 修改后提交 main，GitHub Pages 自动重新构建。

## 上线验收
用正式 HTTPS 地址在 iPhone Safari、iPad 和微信内置浏览器验证城市、套餐、视频、仪式、地点、复制功能。文件预览不能代替上线测试。
中国大陆访问稳定性需要客户当地实测。

## 费用
人民币服务费用与卢布第三方费用分别汇总；总额按卢布合计折算并四舍五入。门票及未知第三方费用不纳入已知总额。此报价为初步参考，最终方案由摄影师确认。
