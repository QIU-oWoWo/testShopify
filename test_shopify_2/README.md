# Address Confirm - Shopify App

一个用于 Shopify 支付成功页面（Order Status Page）的地址二次确认扩展。用户可以查看和编辑收货地址，所有操作在前端完成。

## 项目结构

```
├── shopify.app.toml                        # 应用配置
├── package.json                            # 依赖声明
├── prd.md                                  # 产品需求文档
├── extensions/
│   └── address-confirm/
│       ├── shopify.extension.toml          # 扩展配置（目标：purchase.thank-you.block.render）
│       └── src/
│           └── index.jsx                   # 扩展组件（地址确认卡片）
└── README.md
```

## 功能描述

- **位置**：支付成功页面（Order Status / Thank You 页面）
- **查看模式**：以只读文本展示完整的收货地址，底部有"编辑地址"按钮
- **编辑模式**：所有字段切换为可编辑输入框，预填当前地址，底部有"确认地址"和"取消"按钮
- **成功反馈**：确认后显示"地址已更新"提示，3 秒后自动消失
- **数据存储**：仅在浏览器内存中修改，不调用任何 API，刷新后恢复原始数据

## 开发环境配置

### 前提条件

- Node.js >= 18
- npm / yarn / pnpm
- Shopify CLI（已安装：`shopify version` 确认）
- Shopify Partner 账号 + 开发商店

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 登录 Shopify（按提示完成浏览器认证）
shopify auth login

# 3. 链接应用或创建新应用（按提示选择 Partner 组织和商店）
shopify app config link

# 4. 启动开发服务器
shopify app dev

# 5. 在开发商店中安装应用并测试
#    在开发商店后台打开 "Apps" → 找到你的应用 → 安装
#    然后创建一个测试订单，在支付成功页面查看效果
```

### 部署上架

```bash
# 构建并部署到 Shopify
shopify app deploy
```

上架前还需要准备：
- 应用图标（1200×1200 px）
- 应用名称和描述
- 3-6 张功能截图
- 演示商店链接
- 定价设置为"免费"

## 技术细节

- **框架**：Shopify Checkout UI Extensions（`@shopify/ui-extensions`）
- **扩展目标**：`purchase.thank-you.block.render`（Thank You 页面）
- **数据来源**：`api.order.shippingAddress` + `useShippingAddress()` hook
- **UI 组件**：Shopify 原生 UI 组件（BlockStack、TextField、Button、Banner 等）
