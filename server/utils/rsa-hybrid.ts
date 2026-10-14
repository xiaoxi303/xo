/**
 * RSA Hybrid Cryptographic Facade (混合加密门面模块)
 * 深度接入独立金库引擎 server/utils/vault-cipher.ts
 * 提供每日午夜自动协议更新、一次性自毁公钥分发与多层信封认证解密
 */

export type { RsaHybridPayload } from './vault-cipher'
export {
  issueOneTimePublicKey as getRsaPublicKey,
  isRsaHybridPayload,
  decryptRsaHybridWithVault as decryptRsaHybrid,
  md5Fingerprint
} from './vault-cipher'
