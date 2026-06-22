/**
 * Address Confirm - Order Status Page Extension
 *
 * 在 Shopify 支付成功页面（Order Status / Thank You 页面）嵌入一个地址编辑卡片。
 * 用户可以查看收货地址并通过"编辑地址"按钮切换到编辑模式修改地址。
 * 所有修改仅在前端内存中进行，不调用任何后端 API。
 *
 * PRD 参考：prd.md
 *
 * 扩展目标：purchase.thank-you.block.render
 *   - 显示在订单状态页面（Thank You 页面）的订单摘要下方
 *   - 通过 api.order.shippingAddress 获取收货地址数据
 */

import {
  extension,
  BlockStack,
  InlineStack,
  View,
  Text,
  Heading,
  Button,
  TextField,
  Banner,
  useShippingAddress,
  useState,
  useCallback,
} from '@shopify/ui-extensions';

// ---------------------------------------------------------------------------
// 字段定义：从 shippingAddress 中读取的属性名、标签、占位提示文字
// ---------------------------------------------------------------------------
const ADDRESS_FIELDS = [
  { key: 'name',       label: '收货人姓名',     placeholder: '请输入收货人姓名' },
  { key: 'address1',   label: '详细地址',       placeholder: '请输入详细地址' },
  { key: 'city',       label: '城市',          placeholder: '请输入城市' },
  { key: 'province',   label: '省份 / 州',     placeholder: '请输入省份或州' },
  { key: 'country',    label: '国家 / 地区',    placeholder: '请输入国家或地区' },
  { key: 'zip',        label: '邮政编码',       placeholder: '请输入邮政编码' },
  { key: 'phone',      label: '电话号码',       placeholder: '请输入电话号码' },
];

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

/** 判断地址对象是否为空（所有字段均无值） */
function isAddressEmpty(address) {
  if (!address) return true;
  return ADDRESS_FIELDS.every(({ key }) => !address[key]);
}

/** 从 shippingAddress 原始对象中提取所需字段，缺失字段用空字符串填充 */
function extractAddressFields(shippingAddress) {
  return ADDRESS_FIELDS.reduce(
    (acc, { key }) => ({ ...acc, [key]: shippingAddress?.[key] || '' }),
    {},
  );
}

// ---------------------------------------------------------------------------
// 地址确认卡片主组件
// ---------------------------------------------------------------------------
function AddressConfirmCard({ initialAddress }) {
  // 优先使用 hook 获取的地址，回退到 prop 传入的初始地址
  const hookAddress = useShippingAddress();
  const shippingAddress = (hookAddress && !isAddressEmpty(hookAddress))
    ? hookAddress
    : initialAddress;

  // ---- 状态 ----
  // savedData：已确认保存的地址数据（查看模式展示此数据）
  const [savedData, setSavedData] = useState(() => extractAddressFields(shippingAddress));
  // formData：编辑模式中表单的当前数据
  const [formData, setFormData] = useState(() => extractAddressFields(shippingAddress));
  // isEditing：当前是否处于编辑模式
  const [isEditing, setIsEditing] = useState(false);
  // showSuccess：是否显示成功提示横幅
  const [showSuccess, setShowSuccess] = useState(false);

  // ---- 无收货地址（如数字商品、虚拟服务等无物流订单） ----
  if (isAddressEmpty(shippingAddress)) {
    return (
      <BlockStack spacing="base">
        <Heading level="3">📦 收货地址确认</Heading>
        <Text appearance="subdued">此订单无需配送，没有收货地址信息。</Text>
      </BlockStack>
    );
  }

  // ---- 交互回调 ----

  /** 点击"编辑地址"按钮，进入编辑模式（表单预填当前已保存数据） */
  const handleEdit = useCallback(() => {
    setFormData({ ...savedData });
    setIsEditing(true);
  }, [savedData]);

  /** 点击"取消"按钮，放弃修改，恢复为已保存数据并返回查看模式 */
  const handleCancel = useCallback(() => {
    setFormData({ ...savedData });
    setIsEditing(false);
  }, [savedData]);

  /** 点击"确认地址"按钮，接受当前输入内容（不做任何校验），更新并返回查看模式 */
  const handleConfirm = useCallback(() => {
    setSavedData({ ...formData });
    setIsEditing(false);

    // 显示成功提示横幅，3 秒后自动消失
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [formData]);

  /** 输入框内容变更处理 */
  const handleFieldChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ---- 渲染 ----
  return (
    <BlockStack spacing="base">
      {/* 卡片标题 */}
      <Heading level="3">📦 收货地址确认</Heading>

      {/* 成功提示横幅：确认地址后显示，可手动关闭或 3 秒后自动消失 */}
      {showSuccess && (
        <Banner status="success" onDismiss={() => setShowSuccess(false)}>
          ✅ 地址已更新
        </Banner>
      )}

      {isEditing ? (
        // ===============================================================
        // 编辑模式：所有地址字段切换为可编辑输入框
        // ===============================================================
        <BlockStack spacing="base">
          {ADDRESS_FIELDS.map(({ key, label, placeholder }) => (
            <TextField
              key={key}
              label={label}
              value={formData[key]}
              placeholder={placeholder}
              onChange={(value) => handleFieldChange(key, value)}
            />
          ))}

          {/* 底部按钮组：右对齐 */}
          <InlineStack spacing="base" inlineAlignment="end">
            <Button kind="secondary" onPress={handleCancel}>
              取消
            </Button>
            <Button kind="primary" onPress={handleConfirm}>
              确认地址
            </Button>
          </InlineStack>
        </BlockStack>
      ) : (
        // ===============================================================
        // 查看模式：以只读文本形式展示完整收货地址
        // ===============================================================
        <BlockStack spacing="tight">
          {ADDRESS_FIELDS.map(({ key, label }) => {
            const value = savedData[key];
            return (
              <View key={key}>
                <InlineStack spacing="tight">
                  <Text appearance="subdued">{label}：</Text>
                  <Text emphasis="bold">{value || '—'}</Text>
                </InlineStack>
              </View>
            );
          })}

          {/* 底部按钮组：右对齐 */}
          <View padding="base">
            <InlineStack spacing="base" inlineAlignment="end">
              <Button kind="primary" onPress={handleEdit}>
                编辑地址
              </Button>
            </InlineStack>
          </View>
        </BlockStack>
      )}
    </BlockStack>
  );
}

// ---------------------------------------------------------------------------
// 扩展入口
//
// 使用 purchase.thank-you.block.render 目标，在订单状态页面渲染本组件。
// 通过 api.order.shippingAddress 获取订单的收货地址并作为 prop 传入，
// 组件内部同时使用 useShippingAddress() hook 作为补充数据源。
// ---------------------------------------------------------------------------
export default extension('purchase.thank-you.block.render', (root, api) => {
  // 从订单 API 中获取收货地址
  const shippingAddress = api?.order?.shippingAddress;

  root.render(<AddressConfirmCard initialAddress={shippingAddress} />);
});
