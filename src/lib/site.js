/**
 * 站点元信息：开源仓库、协议、版本号。
 * 页脚、首页与 README 共用同一份来源，改这里即可全局生效。
 */

/** GitHub 仓库主页（不带 .git） */
export const REPO_URL = 'https://github.com/yutils/ruankao-se-designer'

/** 仓库短名，用于展示 */
export const REPO_NAME = 'yutils/ruankao-se-designer'

/** Issues 地址 */
export const ISSUES_URL = `${REPO_URL}/issues`

/** 开源协议 */
export const LICENSE_NAME = 'MIT'
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`

/** 单文件离线版的说明（仓库 README 对应小节） */
export const SINGLE_FILE_DOC = `${REPO_URL}#免安装单文件版`

/** 版本号，与 package.json 保持一致 */
export const VERSION = '1.0.0'

export const siteInfo = {
  repo: REPO_URL,
  repoName: REPO_NAME,
  issues: ISSUES_URL,
  license: LICENSE_NAME,
  licenseUrl: LICENSE_URL,
  singleFileDoc: SINGLE_FILE_DOC,
  version: VERSION
}

export default siteInfo
