import forge from 'node-forge'

/**
 * 使用 node-forge 加密密码 (解决中文乱码与填充格式对齐)
 */
export const encryptPassword = (password: string, publicKeyPem: string): string => {
  try {
    // 1. 解析 PEM 格式公钥
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)

    // 2. 将密码转换为 UTF-8 编码字节流（防止中文/特殊符号解密乱码）
    const bytes = forge.util.encodeUtf8(password)

    // 3. 使用公钥加密（必须与后端的解密填充模式一致：RSAES-PKCS1-V1_5）
    const encrypted = publicKey.encrypt(bytes, 'RSAES-PKCS1-V1_5')

    // 4. 转为 Base64 传递给后端
    return forge.util.encode64(encrypted)
  } catch (error) {
    console.error('RSA 加密出错:', error)
    throw new Error('密码加密失败')
  }
}
